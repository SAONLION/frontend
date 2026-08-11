import starkBackpackImage from '../../assets/mock/stark-visetos-backpack.jpg'
import detail02 from '../../assets/mock/stark-visetos-detail-02.jpg'
import detail03 from '../../assets/mock/stark-visetos-detail-03.jpg'
import detail04 from '../../assets/mock/stark-visetos-detail-04.jpg'
import type { Product } from '../../types/product'

export const mockProducts: readonly Product[] = [
  {
    sku: 'MMKEAVE15CO001',
    name: 'S Stark 사이드 스터드 비세토스 백팩',
    imageUrl: starkBackpackImage,
    dimensions: '약 13 × 26 × 33cm',
    detailImages: [detail02, detail03, detail04],
    productDetail: { craft: ['비세토스 모노그램 캔버스', '천연 나파 가죽 트림', '24K 도금 금속 장식 · 인조 나파 안감', '대한민국 제조'], heritage: ['비세토스 패턴과 제품 이야기는 직원에게 더 자세히 안내받을 수 있어요.'], styling: ['제품의 앞·옆·디테일 이미지를 가로로 살펴보세요.'] },
  },
]
