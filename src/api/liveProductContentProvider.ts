import { getHubOption, getSkuDetail, getSkus } from './products'
import { getColorSelectionKey, isSameColorSelection } from '../constants/colorLabels'
import { getServerProduct } from '../features/product-explore/serverProduct'
import { mockProductContentProvider } from '../mocks/providers/mockProductContentProvider'
import type { SkuDetailResponse, SkuListItemResponse } from './types'
import type { ColorOption, Product, ProductContentProviderValue, SizeOption } from '../types/product'

type LiveSkuContent = { listItem: SkuListItemResponse; detail: SkuDetailResponse }
type LiveProductContent = { skus: readonly LiveSkuContent[]; heritage: string | null; material: string | null }

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
    const [details, heritageOption, materialOption] = await Promise.all([
      Promise.all(skuList.map(async (listItem) => ({ listItem, detail: await getSkuDetail(productId, listItem.skuId) }))),
      getHubOption(productId, 2).catch((error: unknown) => {
        console.error('제품별 헤리티지 조회에 실패했습니다.', error)
        return null
      }),
      getHubOption(productId, 1).catch((error: unknown) => {
        console.error('제품별 소재 안내 조회에 실패했습니다.', error)
        return null
      }),
    ])
    return { skus: details, heritage: heritageOption?.content ?? null, material: materialOption?.content ?? null }
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

function getSizeOrder(size: string): number {
  const normalized = size.trim().toUpperCase()
  const numeric = /^(\d+(?:\.\d+)?)C(?:M)?$/.exec(normalized)
  if (numeric) return Number(numeric[1])

  const order: Record<string, number> = {
    XXS: -2,
    XSM: -1,
    XS: -1,
    SML: 1,
    S: 1,
    MED: 2,
    M: 2,
    LRG: 3,
    L: 3,
    XLG: 4,
    XL: 4,
    XXL: 5,
  }
  return order[normalized] ?? 100
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
  // 서버가 L → M → S → XS처럼 큰 사이즈부터 내려줘도, 화면의 스케일은 왼쪽부터 작아져야 한다.
  return options.sort((left, right) => getSizeOrder(left.code) - getSizeOrder(right.code))
}

function createLiveColorOptions(
  skus: readonly LiveSkuContent[],
  fixtureColors: readonly ColorOption[] | undefined,
  useServerImages: boolean,
): readonly ColorOption[] | undefined {
  if (skus.length === 0) return fixtureColors

  const options: ColorOption[] = []
  for (const { listItem, detail } of skus) {
    const matched = fixtureColors?.find((option) => (
      isSameColorSelection(option.label, detail.color) || isSameColorSelection(option.code, detail.color)
    ))
    const serverImages = useServerImages ? detail.images : []
    const productImages = serverImages.filter((image) => image.shotType !== 'MODEL').map((image) => image.url)
    const stylingImages = serverImages.filter((image) => image.shotType === 'MODEL').map((image) => image.url)
    const resolvedStylingImages = useServerImages
      ? stylingImages
      : stylingImages.length > 0 ? stylingImages : matched?.stylingImages ?? []
    const imageUrl = productImages[0] ?? (useServerImages ? listItem.imageUrl : null) ?? matched?.imageUrl
    if (!imageUrl) continue
    options.push({
      code: getColorSelectionKey(detail.color),
      label: detail.color,
      sku: String(detail.skuId),
      imageUrl,
      // 서버가 색상 칩 값을 제공하지 않으므로, 알 수 없는 색상은 중립 칩으로 표시한다.
      swatch: matched?.swatch ?? '#877563',
      ...(productImages.length > 1 ? { detailImages: productImages.slice(1) } : matched?.detailImages ? { detailImages: matched.detailImages } : {}),
      // 서버 이미지를 정상 사용 중이면 모델컷이 없는 SKU를 fixture 모델컷으로 대체하지 않는다.
      stylingImages: resolvedStylingImages,
    })
  }

  return options.length > 0 ? options : fixtureColors
}

function splitHeritage(content: string | null): readonly string[] | null {
  if (isBlank(content)) return null
  const paragraphs = content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
  return paragraphs.length > 0 ? paragraphs : null
}

function getCurrentSkuContent(
  product: Product | null,
  skus: readonly LiveSkuContent[],
  currentSkuId: number,
): LiveSkuContent | undefined {
  const scannedSku = skus.find(({ detail }) => detail.skuId === currentSkuId)
  if (scannedSku) return scannedSku
  const fixtureColor = product?.colorOptions?.find((option) => option.sku === product.sku)
  return skus.find(({ detail }) => isSameColorSelection(detail.color, fixtureColor?.label)) ?? skus[0]
}

function removeFieldPrefix(line: string): string {
  return line.replace(/^[^:：]+[:：]\s*/, '').trim()
}

/** 서버의 줄바꿈 소재 안내를 C2-1이 쓰는 사실 단위로만 변환한다. */
function parseMaterialContent(content: string | null): Pick<Product, 'materialDetail' | 'origin'> {
  if (isBlank(content)) return {}

  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const materialParts = lines
    .filter((line) => /^(바디|소재|트림)\s*[:：]/.test(line))
    .map(removeFieldPrefix)
  const hardware = lines.find((line) => /하드웨어|메탈|금속 장식|도금/.test(line))
  const lining = lines.find((line) => /안감/.test(line))
  const origin = lines.find((line) => /^제조국\s*[:：]/.test(line))
  const sustainability = lines.find((line) => /^지속가능성/.test(line))

  return {
    ...(origin ? { origin: removeFieldPrefix(origin) } : {}),
    materialDetail: {
      ...(materialParts.length > 0 ? { material: materialParts.join(' · ') } : {}),
      ...(hardware ? { hardware: removeFieldPrefix(hardware) } : {}),
      ...(lining ? { lining: removeFieldPrefix(lining) } : {}),
      ...(sustainability ? { sustainability: removeFieldPrefix(sustainability) } : {}),
    },
  }
}

/**
 * 확정된 SKU 계약(size·dimensions·storage·strap), 제품별 헤리티지와 소재 안내는 서버 값을 쓴다.
 * 소재 안내는 현재 제품 단위 텍스트이므로, SKU별 차이가 있는 값은 서버가 세분화하기 전까지 공통으로 표시된다.
 */
export const liveProductContentProvider: ProductContentProviderValue = {
  async getProduct(sku: string): Promise<Product | null> {
    const fixture = await mockProductContentProvider.getProduct(sku)
    const server = getServerProduct()
    if (!server || server.sku !== sku) return fixture

    try {
      const liveContent = await fetchLiveProductContent(server.id)
      const sampleImage = liveContent.skus.flatMap(({ detail }) => detail.images).find((image) => !isBlank(image.url))?.url
      const useServerImages = sampleImage !== undefined && await probeServerImages(sampleImage)
      const colorOptions = createLiveColorOptions(liveContent.skus, fixture?.colorOptions, useServerImages)
      const currentSku = getCurrentSkuContent(fixture, liveContent.skus, server.skuId)
      const liveSizes = createLiveSizeOptions(liveContent.skus, server.name)
      const heritage = splitHeritage(liveContent.heritage)
      const parsedMaterial = parseMaterialContent(liveContent.material)
      const fallback = fixture ?? {
        sku,
        name: server.name,
        imageUrl: server.imageUrl ?? '',
        dimensions: '',
      }

      return {
        ...fallback,
        name: isBlank(server.name) ? fallback.name : server.name,
        imageUrl: useServerImages && !isBlank(server.imageUrl)
          ? server.imageUrl
          : colorOptions?.[0]?.imageUrl ?? fallback.imageUrl,
        dimensions: currentSku?.detail.dimensions ?? fallback.dimensions,
        fitDetail: {
          strap: currentSku?.detail.strap ?? fallback.fitDetail?.strap,
          storage: currentSku?.detail.storage ?? fallback.fitDetail?.storage,
        },
        sizeOptions: liveSizes.length > 0 ? liveSizes : fallback.sizeOptions,
        colorOptions,
        ...parsedMaterial,
        productDetail: {
          craft: fallback.productDetail?.craft ?? [],
          heritage: heritage ?? fallback.productDetail?.heritage ?? [],
          styling: fallback.productDetail?.styling ?? [],
        },
      }
    } catch (error) {
      console.error('서버 제품 콘텐츠를 불러오지 못해 로컬 데이터로 표시합니다.', error)
      return fixture
    }
  },
}
