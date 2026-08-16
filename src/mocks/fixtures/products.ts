import blackImage from '../../assets/mock/stark-primary/stark-black-primary.webp'
import beigeImage from '../../assets/mock/stark-primary/stark-beige-primary.webp'
import cinnamonImage from '../../assets/mock/stark-primary/stark-cinnamon-primary.webp'
import cognacImage from '../../assets/mock/stark-primary/stark-cognac-primary.webp'
import softPinkImage from '../../assets/mock/stark-primary/stark-soft-pink-primary.webp'
import whiteImage from '../../assets/mock/stark-primary/stark-white-primary.webp'
import travelPouchImage from '../../assets/mock/d2-recommendations/ottomar-travel-pouch-primary.webp'
import weekenderImage from '../../assets/mock/d2-recommendations/ottomar-weekender-primary.webp'
import trolleyImage from '../../assets/mock/d2-recommendations/ottomar-trolley-primary.webp'
import travelPouchDetail02 from '../../assets/mock/d2-recommendations/ottomar-travel-pouch-detail-02.webp'
import travelPouchDetail03 from '../../assets/mock/d2-recommendations/ottomar-travel-pouch-detail-03.webp'
import travelPouchModel from '../../assets/mock/d2-recommendations/ottomar-travel-pouch-model.webp'
import weekenderDetail02 from '../../assets/mock/d2-recommendations/ottomar-weekender-detail-02.webp'
import weekenderDetail03 from '../../assets/mock/d2-recommendations/ottomar-weekender-detail-03.webp'
import weekenderDetail04 from '../../assets/mock/d2-recommendations/ottomar-weekender-detail-04.webp'
import weekenderModel from '../../assets/mock/d2-recommendations/ottomar-weekender-model.webp'
import trolleyDetail02 from '../../assets/mock/d2-recommendations/ottomar-trolley-detail-02.webp'
import trolleyDetail03 from '../../assets/mock/d2-recommendations/ottomar-trolley-detail-03.webp'
import trolleyDetail04 from '../../assets/mock/d2-recommendations/ottomar-trolley-detail-04.webp'
import trolleyModel from '../../assets/mock/d2-recommendations/ottomar-trolley-model.webp'
import blackDetail02 from '../../assets/mock/stark-colors/stark-black-detail-02.webp'
import blackDetail04 from '../../assets/mock/stark-colors/stark-black-detail-04.webp'
import whiteDetail02 from '../../assets/mock/stark-colors/stark-white-detail-02.webp'
import whiteDetail04 from '../../assets/mock/stark-colors/stark-white-detail-04.webp'
import detail02 from '../../assets/mock/stark-visetos-detail-02-new.webp'
import detail03 from '../../assets/mock/stark-visetos-detail-03-new.webp'
import detail04 from '../../assets/mock/stark-visetos-detail-04-new.webp'
import type { Product } from '../../types/product'

export const mockProducts: readonly Product[] = [
  {
    sku: 'MMKEAVE15CO001',
    name: 'S Stark 사이드 스터드 비세토스 백팩',
    imageUrl: cognacImage,
    dimensions: '약 13 × 26 × 33cm',
    detailImages: [detail02, detail03, detail04],
    productDetail: { craft: ['비세토스 모노그램 캔버스', '천연 나파 가죽 트림', '24K 도금 금속 장식 · 인조 나파 안감', '대한민국 제조'], heritage: ['비세토스 패턴과 제품 이야기는 직원에게 더 자세히 안내받을 수 있어요.'], styling: ['모델 착장 컷으로 실제 착용 크기와 스타일을 확인해 보세요.'] },
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
      { code: 'black', label: 'Black', sku: 'MMKEAVE15BK001', imageUrl: blackImage, swatch: '#171717', detailImages: [blackDetail02, blackDetail04] },
      { code: 'cognac', label: 'Cognac', sku: 'MMKEAVE15CO001', imageUrl: cognacImage, swatch: '#9a5828', detailImages: [detail02, detail03, detail04] },
      { code: 'beige', label: 'Beige', sku: 'MMKEAVE15IG001', imageUrl: beigeImage, swatch: '#d6c3a6' },
      { code: 'soft-pink', label: 'Soft Pink', sku: 'MMKEAVE15PZ001', imageUrl: softPinkImage, swatch: '#dca3a0' },
      { code: 'white', label: 'White', sku: 'MMKEAVE15WT001', imageUrl: whiteImage, swatch: '#ece9df', detailImages: [whiteDetail02, whiteDetail04] },
      { code: 'cinnamon', label: 'Cinnamon', sku: 'MMKGSVE034B001', imageUrl: cinnamonImage, swatch: '#874837' },
    ],
  },
  // StageD 추천 카드에서 진입하는 제품들. 이름·치수·소재·사이즈 변형과 이미지 모두
  // result_tobackend 스냅샷에서 가져왔다. 컬러는 코냑 한 가지만 촬영본이 있다.
  {
    sku: 'MXZFSTT03CO001',
    name: 'S Ottomar 비세토스 트래블 파우치',
    imageUrl: travelPouchImage,
    dimensions: '약 2 × 22 × 13cm',
    detailImages: [travelPouchDetail02, travelPouchDetail03],
    stylingImages: [travelPouchModel],
    productDetail: {
      craft: ['비세토스 모노그램 캔버스', '천연 나파 가죽 트림', '24K 도금 브라스 금속 장식 · 패브릭 안감', '대한민국 제조'],
      heritage: ['여권과 필수 서류를 담는 Ottomar 트래블 라인의 이야기는 직원에게 더 자세히 안내받을 수 있어요.'],
      styling: ['큰 가방 안에 넣거나 가죽 스트랩으로 핸즈프리로 착용할 수 있어요.'],
    },
    fitDetail: { strap: '탈부착 가능한 가죽 스트랩 · 드롭 55cm', storage: '내부 포켓, 카드 슬롯 및 지퍼 수납공간' },
    fitDefaults: { sizeCode: 'SML', colorCode: 'cognac' },
    sizeOptions: [
      { code: 'MNI', label: '미니', sku: 'MXZFSTT04CO001', productName: '미니 Ottomar 비세토스 트래블 파우치', dimensions: '약 2 × 18 × 12cm' },
      { code: 'SML', label: 'S', sku: 'MXZFSTT03CO001', productName: 'S Ottomar 비세토스 트래블 파우치', dimensions: '약 2 × 22 × 13cm' },
    ],
    colorOptions: [
      { code: 'cognac', label: 'Cognac', sku: 'MXZFSTT03CO001', imageUrl: travelPouchImage, swatch: '#9a5828', detailImages: [travelPouchDetail02, travelPouchDetail03] },
    ],
  },
  {
    sku: 'MMVGATT01CO001',
    name: '41cm / 16.14인치 Ottomar 비세토스 위켄더',
    imageUrl: weekenderImage,
    dimensions: '약 17 × 41 × 26cm',
    detailImages: [weekenderDetail02, weekenderDetail03, weekenderDetail04],
    stylingImages: [weekenderModel],
    productDetail: {
      craft: ['비세토스 모노그램 캔버스', '나파 가죽 트림', '24K 골드 도금 브라스 하드웨어 · 스웨이드 마감 극세사 안감', '대한민국 제조'],
      heritage: ['MCM 캐리어 수공예 전통을 기내용 크기로 재해석한 위켄더 이야기는 직원에게 안내받을 수 있어요.'],
      styling: ['양방향 확장형 지퍼로 짐의 양에 맞춰 크기를 조절할 수 있어요.'],
    },
    fitDetail: { strap: '탈부착·길이 조절 가능한 위빙 스트랩 · 72~127cm', storage: '내부 포켓과 지퍼 포켓, 뒷면 트롤리 슬리브' },
    fitDefaults: { sizeCode: 'MNI', colorCode: 'cognac' },
    sizeOptions: [
      { code: 'MNI', label: '41cm', sku: 'MMVGATT01CO001', productName: '41cm / 16.14인치 Ottomar 비세토스 위켄더', dimensions: '약 17 × 41 × 26cm' },
      { code: 'SML', label: '45cm', sku: 'MMVAAVY03CO001', productName: '45cm / 17.7인치 Ottomar 비세토스 위켄더', dimensions: '약 20 × 46 × 27cm' },
      { code: 'SMD', label: '50.5cm', sku: 'MMVAAVY02CO001', productName: '50.5cm / 19.9인치 Ottomar 비세토스 위켄더', dimensions: '약 23 × 51 × 29cm' },
    ],
    colorOptions: [
      { code: 'cognac', label: 'Cognac', sku: 'MMVGATT01CO001', imageUrl: weekenderImage, swatch: '#9a5828', detailImages: [weekenderDetail02, weekenderDetail03, weekenderDetail04] },
    ],
  },
  {
    sku: 'MMVDSTT02CO001',
    name: 'Ottomar 비세토스 트롤리',
    imageUrl: trolleyImage,
    dimensions: '약 23 × 38 × 55cm',
    detailImages: [trolleyDetail02, trolleyDetail03, trolleyDetail04],
    stylingImages: [trolleyModel],
    productDetail: {
      craft: ['비세토스 모노그램 캔버스', '블랙 나파 가죽 트림', '매트 블랙 메탈 하드웨어 · 옥스포드 나일론 안감', '대한민국 제조'],
      heritage: ['뮌헨 황금기 아카이브 트렁크에서 이어진 트롤리 실루엣은 직원에게 더 자세히 안내받을 수 있어요.'],
      styling: ['기내용 스몰 사이즈라 여행 목적에 맞는지 직원과 함께 확인해 보세요.'],
    },
    fitDetail: { strap: '집어넣을 수 있는 트롤리 핸들 · 드롭 45cm', storage: '전면 지퍼 수납공간과 내부 지퍼 수납공간' },
    fitDefaults: { sizeCode: 'MNI', colorCode: 'cognac' },
    sizeOptions: [
      { code: 'MNI', label: '스몰', sku: 'MMVDSTT02CO001', productName: 'Ottomar 비세토스 트롤리', dimensions: '약 23 × 38 × 55cm' },
      { code: 'SML', label: '캐빈', sku: 'MMVGSTT04CO001', productName: 'Ottomar 비세토스 캐빈 트롤리', dimensions: '약 23 × 38 × 56cm' },
    ],
    colorOptions: [
      { code: 'cognac', label: 'Cognac', sku: 'MMVDSTT02CO001', imageUrl: trolleyImage, swatch: '#9a5828', detailImages: [trolleyDetail02, trolleyDetail03, trolleyDetail04] },
    ],
  },
]
