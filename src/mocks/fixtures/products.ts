import starkBackpackImage from '../../assets/mock/stark-visetos-backpack.jpg'
import detail02 from '../../assets/mock/stark-visetos-detail-02.jpg'
import detail03 from '../../assets/mock/stark-visetos-detail-03.jpg'
import detail04 from '../../assets/mock/stark-visetos-detail-04.jpg'
import blackImage from '../../assets/mock/fit-colors/stark-black.jpg'
import beigeImage from '../../assets/mock/fit-colors/stark-beige.jpg'
import cinnamonImage from '../../assets/mock/fit-colors/stark-cinnamon.jpg'
import cognacImage from '../../assets/mock/fit-colors/stark-cognac.jpg'
import softPinkImage from '../../assets/mock/fit-colors/stark-soft-pink.jpg'
import whiteImage from '../../assets/mock/fit-colors/stark-white.jpg'
import type { Product } from '../../types/product'

export const mockProducts: readonly Product[] = [
  {
    sku: 'MMKEAVE15CO001',
    name: 'S Stark 사이드 스터드 비세토스 백팩',
    imageUrl: starkBackpackImage,
    dimensions: '약 13 × 26 × 33cm',
    detailImages: [detail02, detail03, detail04],
    productDetail: { craft: ['비세토스 모노그램 캔버스', '천연 나파 가죽 트림', '24K 도금 금속 장식 · 인조 나파 안감', '대한민국 제조'], heritage: ['비세토스 패턴과 제품 이야기는 직원에게 더 자세히 안내받을 수 있어요.'], styling: ['제품의 앞·옆·디테일 이미지를 가로로 살펴보세요.'] },
    fitDetail: {
      strap: '조절 가능한 어깨 스트랩',
      storage: '전면 지퍼 수납공간과 내부 포켓',
    },
    fitDefaults: { sizeCode: 'SML', colorCode: 'cognac' },
    sizeOptions: [
      { code: 'MNI', label: '미니', sku: 'MMKEAVE16CO001', productName: '미니 Stark 사이드 스터드 비세토스 백팩', dimensions: '약 11 × 22 × 27cm' },
      { code: 'SML', label: 'S', sku: 'MMKEAVE15CO001', productName: 'S Stark 사이드 스터드 비세토스 백팩', dimensions: '약 13 × 26 × 33cm' },
      { code: 'SMD', label: 'S–M', sku: 'MMKEAVE14CO001', productName: 'S–M 스타크 사이드 스터드 비세토스 백팩', dimensions: '약 13 × 30 × 38cm' },
      { code: 'MED', label: 'M', sku: 'MMKEAVE12CO001', productName: 'M Stark 사이드 스터드 비세토스 백팩', dimensions: '약 16 × 33 × 41cm' },
    ],
    colorOptions: [
      { code: 'black', label: 'Black', sku: 'MMKEAVE15BK001', imageUrl: blackImage, swatch: '#171717' },
      { code: 'cognac', label: 'Cognac', sku: 'MMKEAVE15CO001', imageUrl: cognacImage, swatch: '#9a5828' },
      { code: 'beige', label: 'Beige', sku: 'MMKEAVE15IG001', imageUrl: beigeImage, swatch: '#d6c3a6' },
      { code: 'soft-pink', label: 'Soft Pink', sku: 'MMKEAVE15PZ001', imageUrl: softPinkImage, swatch: '#dca3a0' },
      { code: 'white', label: 'White', sku: 'MMKEAVE15WT001', imageUrl: whiteImage, swatch: '#ece9df' },
      { code: 'cinnamon', label: 'Cinnamon', sku: 'MMKGSVE034B001', imageUrl: cinnamonImage, swatch: '#874837' },
    ],
  },
]
