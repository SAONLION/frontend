import { getHubOption, getSkuDetail, getSkus } from './products'
import { getColorSelectionKey, isSameColorSelection } from '../constants/colorLabels'
import { getServerProduct } from '../features/product-explore/serverProduct'
import { mockProductContentProvider } from '../mocks/providers/mockProductContentProvider'
import type { SkuDetailResponse, SkuListItemResponse } from './types'
import type { ColorOption, Product, ProductContentProviderValue, SizeOption } from '../types/product'

type LiveSkuContent = { listItem: SkuListItemResponse; detail: SkuDetailResponse }
type LiveProductContent = { skus: readonly LiveSkuContent[]; heritage: string | null }

const productContentRequests = new Map<number, Promise<LiveProductContent>>()

function isBlank(value: string | null | undefined): value is null | undefined {
  return value === null || value === undefined || value.trim() === ''
}

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
    if (!usable) console.warn('서버 제품 이미지를 불러올 수 없어 로컬 이미지로 표시합니다.', sampleUrl)
    return usable
  })
  return serverImageProbe
}

async function fetchLiveProductContent(productId: number): Promise<LiveProductContent> {
  const cached = productContentRequests.get(productId)
  if (cached) return cached

  const request = (async () => {
    const skuList = await getSkus(productId)
    const [details, heritageOption] = await Promise.all([
      Promise.all(skuList.map(async (listItem) => ({ listItem, detail: await getSkuDetail(productId, listItem.skuId) }))),
      getHubOption(productId, 2).catch((error: unknown) => {
        console.error('제품별 헤리티지 조회에 실패했습니다.', error)
        return null
      }),
    ])
    return { skus: details, heritage: heritageOption?.content ?? null }
  })().catch((error: unknown) => {
    productContentRequests.delete(productId)
    throw error
  })

  productContentRequests.set(productId, request)
  return request
}

function normalizeSizeLabel(size: string): string {
  const match = /^(\d+)[Cc]$/.exec(size)
  if (!match) return size
  const digits = match[1]
  return digits.length === 3 ? `${digits.slice(0, 2)}.${digits.slice(2)}cm` : `${digits}cm`
}

/**
 * 최종 전달본의 이미지 분류에서 CDN asset 09는 model 컷으로 확인된다.
 * 현재 SKU API는 URL 배열만 주고 `shotType`을 누락하므로, 분류 메타데이터가 API에 추가되기 전까지
 * 이 파일명 규칙으로 일반 제품 갤러리와 스타일링 컷을 분리한다.
 */
function isModelImage(url: string): boolean {
  return /\/09-[^/]+\.webp(?:[?#].*)?$/i.test(url)
}

function createLiveSizeOptions(skus: readonly LiveSkuContent[], productName: string): readonly SizeOption[] {
  const seen = new Set<string>()
  const options: SizeOption[] = []
  for (const { detail } of skus) {
    for (const rawSize of detail.size.split(',').map((value) => value.trim()).filter(Boolean)) {
      if (seen.has(rawSize)) continue
      seen.add(rawSize)
      options.push({
        code: rawSize,
        label: normalizeSizeLabel(rawSize),
        sku: String(detail.skuId),
        productName,
        dimensions: detail.dimensions ?? '',
      })
    }
  }
  return options
}

function createLiveColorOptions(
  skus: readonly LiveSkuContent[],
  fixtureColors: readonly ColorOption[] | undefined,
  useServerImages: boolean,
): readonly ColorOption[] | undefined {
  if (skus.length === 0 || !fixtureColors || fixtureColors.length === 0) return fixtureColors

  const options: ColorOption[] = []
  for (const { listItem, detail } of skus) {
    const matched = fixtureColors.find((option) => (
      isSameColorSelection(option.label, detail.color) || isSameColorSelection(option.code, detail.color)
    ))
    const serverImages = useServerImages ? detail.images : []
    const productImages = serverImages.filter((image) => !isModelImage(image))
    const stylingImages = serverImages.filter(isModelImage)
    const imageUrl = productImages[0] ?? (useServerImages ? listItem.imageUrl : null) ?? matched?.imageUrl
    if (!imageUrl) continue
    options.push({
      code: getColorSelectionKey(detail.color),
      label: detail.color,
      sku: String(detail.skuId),
      imageUrl,
      swatch: matched?.swatch ?? fixtureColors[0].swatch,
      ...(productImages.length > 1 ? { detailImages: productImages.slice(1) } : matched?.detailImages ? { detailImages: matched.detailImages } : {}),
      ...(stylingImages.length > 0 ? { stylingImages } : matched?.stylingImages ? { stylingImages: matched.stylingImages } : {}),
    })
  }

  return options.length > 0 ? options : fixtureColors
}

function splitHeritage(content: string | null): readonly string[] | null {
  if (isBlank(content)) return null
  const paragraphs = content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
  return paragraphs.length > 0 ? paragraphs : null
}

function getCurrentSkuContent(product: Product, skus: readonly LiveSkuContent[]): LiveSkuContent | undefined {
  const fixtureColor = product.colorOptions?.find((option) => option.sku === product.sku)
  return skus.find(({ detail }) => isSameColorSelection(detail.color, fixtureColor?.label)) ?? skus[0]
}

/**
 * 확정된 SKU 계약(size·dimensions·storage·strap)과 제품별 헤리티지는 서버 값을 쓴다.
 * P2-4의 SKU별 소재 구조는 Swagger에 아직 없으므로 그 항목만 fixture를 유지한다.
 */
export const liveProductContentProvider: ProductContentProviderValue = {
  async getProduct(sku: string): Promise<Product | null> {
    const fixture = await mockProductContentProvider.getProduct(sku)
    const server = getServerProduct()
    if (!server || !fixture || server.sku !== sku) return fixture

    try {
      const liveContent = await fetchLiveProductContent(server.id)
      const sampleImage = liveContent.skus.flatMap(({ detail }) => detail.images).find((url) => !isBlank(url))
      const useServerImages = sampleImage !== undefined && await probeServerImages(sampleImage)
      const colorOptions = createLiveColorOptions(liveContent.skus, fixture.colorOptions, useServerImages)
      const currentSku = getCurrentSkuContent(fixture, liveContent.skus)
      const liveSizes = createLiveSizeOptions(liveContent.skus, server.name)
      const heritage = splitHeritage(liveContent.heritage)

      return {
        ...fixture,
        name: isBlank(server.name) ? fixture.name : server.name,
        imageUrl: useServerImages && !isBlank(server.imageUrl)
          ? server.imageUrl
          : colorOptions?.[0]?.imageUrl ?? fixture.imageUrl,
        dimensions: currentSku?.detail.dimensions ?? fixture.dimensions,
        fitDetail: {
          strap: currentSku?.detail.strap ?? fixture.fitDetail?.strap,
          storage: currentSku?.detail.storage ?? fixture.fitDetail?.storage,
        },
        sizeOptions: liveSizes.length > 0 ? liveSizes : fixture.sizeOptions,
        colorOptions,
        productDetail: {
          craft: fixture.productDetail?.craft ?? [],
          heritage: heritage ?? fixture.productDetail?.heritage ?? [],
          styling: fixture.productDetail?.styling ?? [],
        },
      }
    } catch (error) {
      console.error('서버 제품 콘텐츠를 불러오지 못해 로컬 데이터로 표시합니다.', error)
      return fixture
    }
  },
}
