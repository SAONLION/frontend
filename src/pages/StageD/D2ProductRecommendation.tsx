import backgroundImage from '../../assets/images/stage-a-background.png';
import travelPouchImage from '../../assets/images/product-travel-pouch-set.jpg';
import weekenderImage from '../../assets/images/product-visetos-weekender.png';
import trolleyImage from '../../assets/images/product-visetos-trolley.png';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import InfoCard from '../../components/common/InfoCard';
import SecondaryButton from '../../components/common/SecondaryButton';
import PrimaryButton from '../../components/common/PrimaryButton';

interface ProductCardData {
  id: string;
  image: string;
  name: string;
  description: string | string[];
}

const DEFAULT_PRODUCTS: ProductCardData[] = [
  {
    id: 'travel-pouch-set',
    image: travelPouchImage,
    name: '트래블 파우치 세트',
    description: '탈부착 가능 스트랩 · 안감 패브릭',
  },
  {
    id: 'visetos-weekender',
    image: weekenderImage,
    name: '비세토스 위켄더',
    description: '뛰어난 내구성 · TSA 대응',
  },
  {
    id: 'visetos-trolley',
    image: trolleyImage,
    name: '비세토스 트롤리',
    description: '기내 반입 규격 · 여행 목적 상위 매칭',
  },
];

// D1에서 아직 디자인이 확정되지 않은 목적값(선물/구경/기타)은
// 동일 패턴을 따르는 placeholder 문구로만 채워둔 상태입니다.
const PURPOSE_HEADLINE_MAP: Record<string, [string, string]> = {
  여행: ['여행이 목적이시라면,', '이 제품들은 어떠신가요?'],
  선물: ['선물이 목적이시라면,', '이 제품들은 어떠신가요?'],
  구경: ['구경이 목적이시라면,', '이 제품들은 어떠신가요?'],
  기타: ['다른 목적이시라면,', '이 제품들은 어떠신가요?'],
};

function getHeadlineForPurpose(purpose: string): [string, string] {
  return PURPOSE_HEADLINE_MAP[purpose] ?? [`${purpose}이 목적이시라면,`, '이 제품들은 어떠신가요?'];
}

interface D2ProductRecommendationProps {
  purpose: string;
  products?: ProductCardData[];
  secondaryButtonLabel?: string;
  primaryButtonLabel?: string;
  onSelectProduct?: (product: ProductCardData) => void;
  onTagOtherProduct?: () => void;
  onCallStaff?: () => void;
}

export default function D2ProductRecommendation({
  purpose,
  products = DEFAULT_PRODUCTS,
  secondaryButtonLabel = '추천 제품 말고 다른 제품 태그할래요',
  primaryButtonLabel = '직원 호출',
  onSelectProduct,
  onTagOtherProduct,
  onCallStaff,
}: D2ProductRecommendationProps) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center px-[7.71%] pt-41.75 pb-16.25">
        <ScreenHeadline headline={getHeadlineForPurpose(purpose)} variant="md" />
        <div className="mt-20 flex w-full flex-col gap-2.75">
          {products.map((product) => (
            <InfoCard
              key={product.id}
              image={product.image}
              name={product.name}
              description={product.description}
              onSelect={onSelectProduct ? () => onSelectProduct(product) : undefined}
            />
          ))}
        </div>
        <div className="mt-auto flex w-full flex-col gap-3.25">
          <SecondaryButton label={secondaryButtonLabel} onClick={onTagOtherProduct} />
          <PrimaryButton label={primaryButtonLabel} onClick={onCallStaff} />
        </div>
      </div>
    </div>
  );
}
