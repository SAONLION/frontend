import backgroundImage from '../../assets/images/stage-a-background.png';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import InfoCard from '../../components/common/InfoCard';
import SecondaryButton from '../../components/common/SecondaryButton';
import PrimaryButton from '../../components/common/PrimaryButton';
import { mockD2Recommendations } from '../../mocks/fixtures/demoContent';

type ProductCardData = (typeof mockD2Recommendations)[number]

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
  products?: readonly ProductCardData[];
  secondaryButtonLabel?: string;
  primaryButtonLabel?: string;
  onSelectProduct?: (product: ProductCardData) => void;
  onTagOtherProduct?: () => void;
  onCallStaff?: () => void;
}

export default function D2ProductRecommendation({
  purpose,
  products = mockD2Recommendations,
  secondaryButtonLabel = '추천 제품 말고 다른 제품 태그할래요',
  primaryButtonLabel = '직원 호출',
  onSelectProduct,
  onTagOtherProduct,
  onCallStaff,
}: D2ProductRecommendationProps) {
  return (
    <div className="stage-external-page">
      <img src={backgroundImage} alt="" className="stage-external-page__background" />
      <div className="stage-external-page__content stage-external-page__content--d2">
        <ScreenHeadline headline={getHeadlineForPurpose(purpose)} variant="md" className="stage-external-page__headline" />
        <div className="stage-external-page__stack stage-external-page__stack--recommendations">
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
        <div className="stage-external-page__actions">
          <SecondaryButton label={secondaryButtonLabel} onClick={onTagOtherProduct} />
          <PrimaryButton label={primaryButtonLabel} onClick={onCallStaff} />
        </div>
      </div>
    </div>
  );
}
