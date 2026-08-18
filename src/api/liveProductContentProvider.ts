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
 * 서버 이미지를 실제로 띄울 수 있는지 한 번 확인한다.
 *
 * URL이 응답에 들어 있다고 이미지가 열리는 건 아니다. 2026-08-17 확인 시점에 S3 버킷이
 * 비공개라 모든 이미지가 403이었다. URL만 믿고 쓰면 화면의 제품 사진이 전부 깨진다.
 *
 * 세션당 한 번만 재고, 결과를 재사용한다. 버킷이 공개되면 다음 방문부터 자동으로 서버
 * 이미지를 쓰므로 배포 없이 전환된다. `<img>` 로드로 검사하므로 CORS 설정과 무관하다.
 */
let serverImageProbe: Promise<boolean> | null = null

function canLoadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(true)
    image.onerror = () => resolve(false)
    image.src = url
  })
}

function probeServerImages(sampleUrl: string): Promise<boolean> {
  serverImageProbe ??= canLoadImage(sampleUrl).then((usable) => {
    if (!usable) {
      console.warn('서버 제품 이미지를 불러올 수 없어 로컬 이미지로 표시합니다.', sampleUrl)
    }
    return usable
  })
  return serverImageProbe
}

/**
 * 서버 SKU 목록을 fixture 컬러에 얹는다.
 *
 * 서버 컬러명과 같은 fixture 항목을 찾아 상세컷을 가져오고, 이미지는 서버에 있으면 서버
 * 것을 쓴다. **이름이 매칭되지 않고 서버 이미지도 없는 색은 아예 버린다** — 순서로 이으면
 * 예컨대 서버의 `Soft Pink`에 fixture의 코냑 사진이 붙어 색상과 사진이 어긋난다.
 *
 * 반대로 **서버 이미지가 있으면 fixture에 없는 색도 그대로 추가한다.** 색상 칩을 사진으로
 * 그리기 때문에 매핑표 없이도 정확하게 보인다 — 카탈로그 색상 40가지를 모두 감당한다.
 */
function mergeColorOptions(
  serverSkus: readonly SkuListItemResponse[],
  fixtureColors: readonly ColorOption[] | undefined,
  useServerImages: boolean,
): readonly ColorOption[] | undefined {
  if (serverSkus.length === 0 || !fixtureColors || fixtureColors.length === 0) return fixtureColors

  const merged = serverSkus
    .map((sku) => {
      const serverImage = useServerImages && !isBlank(sku.imageUrl) ? sku.imageUrl : null
      const matched = fixtureColors.find(
        (option) => option.label.toLowerCase() === sku.color.toLowerCase()
          || option.code.toLowerCase() === sku.color.toLowerCase(),
      )

      if (matched) {
        return {
          ...matched,
          label: sku.color,
          imageUrl: serverImage ?? matched.imageUrl,
        } satisfies ColorOption
      }

      // fixture에 없는 색은 보여줄 이미지가 서버에 있을 때만 추가한다.
      if (!serverImage) return null

      return {
        code: sku.color.toLowerCase().replace(/\s+/g, '-'),
        label: sku.color,
        sku: String(sku.skuId),
        imageUrl: serverImage,
        // 색상 칩은 이 이미지로 그린다. `swatch`는 이미지가 뜨기 전 바탕색일 뿐이라
        // 정확한 색상값이 아니다 — 카탈로그에 색상 hex 원본이 없다.
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

    try {
      const serverSkus = await getSkus(server.id)

      // 서버 이미지가 실제로 열리는지 한 번 확인한다. URL이 있어도 버킷이 비공개면 못 쓴다.
      const sampleImage = serverSkus.map((sku) => sku.imageUrl).find((url) => !isBlank(url))
      const useServerImages = sampleImage !== undefined && await probeServerImages(sampleImage)

      const imageUrl = useServerImages && !isBlank(server.imageUrl) ? server.imageUrl : fixture.imageUrl

      return {
        ...fixture,
        name,
        imageUrl,
        colorOptions: mergeColorOptions(serverSkus, fixture.colorOptions, useServerImages),
      }
    } catch (error) {
      // SKU 조회만 실패한 것이므로 이름은 서버 값을 살린다.
      console.error('서버 SKU 목록을 불러오지 못해 컬러는 로컬 데이터로 표시합니다.', error)
      return { ...fixture, name }
    }
  },
}
