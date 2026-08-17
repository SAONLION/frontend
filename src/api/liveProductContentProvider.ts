import { getSkus } from './products'
import { getServerProduct } from '../features/product-explore/serverProduct'
import { mockProductContentProvider } from '../mocks/providers/mockProductContentProvider'
import type { SkuListItemResponse } from './types'
import type { ColorOption, Product, ProductContentProviderValue } from '../types/product'

/**
 * 하이브리드 제품 콘텐츠 Provider.
 *
 * 서버는 제품명·카테고리·컬러 목록·허브 옵션을 갖고 있지만 **이미지·사이즈·상세 문구가 비어 있다**
 * (2026-08-17 확인: 제품 13개 샘플과 태그 1~6 전부 `imageUrl: null`, `images: []`, `size: null`,
 * 허브 옵션 `content`는 제품이 달라도 같은 고정 안내문). 서버 값만 쓰면 제품 이미지가 통째로 사라진다.
 *
 * 그래서 필드 단위로 합친다 — **서버에 값이 있으면 서버, 비어 있으면 fixture.**
 * 백엔드가 이미지를 채우는 즉시 코드 변경 없이 서버 쪽으로 넘어간다.
 *
 * 서버에 값이 생기면 해당 fallback을 지운다. 전부 지울 수 있게 되면 fixture 의존이 끝난 것이다.
 */

/** null·undefined·공백만 있는 문자열을 모두 "값 없음"으로 본다. */
function isBlank(value: string | null | undefined): value is null | undefined {
  return value === null || value === undefined || value.trim() === ''
}

/**
 * 서버 SKU 목록을 fixture 컬러에 얹는다.
 *
 * 서버 컬러명과 같은 fixture 항목을 찾아 스와치·상세컷을 가져오고, 이미지는 서버에 있으면 서버
 * 것을 쓴다. **이름이 매칭되지 않고 서버 이미지도 없는 색은 아예 버린다** — 순서로 이으면
 * 예컨대 서버의 `Soft Pink`에 fixture의 코냑 사진이 붙어 색상과 사진이 어긋난다.
 */
function mergeColorOptions(
  serverSkus: readonly SkuListItemResponse[],
  fixtureColors: readonly ColorOption[] | undefined,
): readonly ColorOption[] | undefined {
  if (serverSkus.length === 0 || !fixtureColors || fixtureColors.length === 0) return fixtureColors

  const merged = serverSkus
    .map((sku) => {
      const matched = fixtureColors.find(
        (option) => option.label.toLowerCase() === sku.color.toLowerCase()
          || option.code.toLowerCase() === sku.color.toLowerCase(),
      )

      if (matched) {
        return {
          ...matched,
          label: sku.color,
          imageUrl: isBlank(sku.imageUrl) ? matched.imageUrl : sku.imageUrl,
        } satisfies ColorOption
      }

      // fixture에 없는 색이라도 서버가 이미지를 주면 그대로 보여줄 수 있다.
      if (isBlank(sku.imageUrl)) return null

      return {
        code: sku.color.toLowerCase().replace(/\s+/g, '-'),
        label: sku.color,
        sku: String(sku.skuId),
        imageUrl: sku.imageUrl,
        swatch: fixtureColors[0]?.swatch ?? '#9a5828',
      } satisfies ColorOption
    })
    .filter((option): option is ColorOption => option !== null)

  // 하나도 못 맞추면 fixture 목록을 그대로 둔다. 빈 컬러 목록은 화면을 비운다.
  return merged.length > 0 ? merged : fixtureColors
}

export const liveProductContentProvider: ProductContentProviderValue = {
  async getProduct(sku: string): Promise<Product | null> {
    const fixture = await mockProductContentProvider.getProduct(sku)
    const server = getServerProduct()

    // 태그 스캔을 거치지 않았거나(D2-1·D4의 추천 제품 진입) 다른 제품의 스캔 결과가 남아 있으면
    // 서버 값을 얹지 않는다. 얹으면 이름과 사진이 서로 다른 제품이 된다.
    if (!server || !fixture || server.sku !== sku) return fixture

    const name = isBlank(server.name) ? fixture.name : server.name
    const imageUrl = isBlank(server.imageUrl) ? fixture.imageUrl : server.imageUrl

    try {
      const serverSkus = await getSkus(server.id)
      return {
        ...fixture,
        name,
        imageUrl,
        colorOptions: mergeColorOptions(serverSkus, fixture.colorOptions),
      }
    } catch (error) {
      // SKU 조회만 실패한 것이므로 이름·대표 이미지는 서버 값을 살린다.
      console.error('서버 SKU 목록을 불러오지 못해 컬러는 로컬 데이터로 표시합니다.', error)
      return { ...fixture, name, imageUrl }
    }
  },
}
