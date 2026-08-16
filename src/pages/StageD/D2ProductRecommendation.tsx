import { useState } from 'react';
import backgroundImage from '../../assets/images/stage-a-background.png';
import { DocentStage } from '../../components/domain/DocentStage';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import InfoCard from '../../components/common/InfoCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SecondaryButton from '../../components/common/SecondaryButton';
import PrimaryButton from '../../components/common/PrimaryButton';
import { mockD2Recommendations } from '../../mocks/fixtures/demoContent';

export type ProductCardData = (typeof mockD2Recommendations)[number]

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
  isLoadingRecommendations?: boolean;
  hasNoRecommendations?: boolean;
  secondaryButtonLabel?: string;
  primaryButtonLabel?: string;
  onSelectProduct?: (product: ProductCardData) => void;
  onTagOtherProduct?: () => void;
  onCallStaff?: () => void;
}

export default function D2ProductRecommendation({
  purpose,
  products = mockD2Recommendations,
  isLoadingRecommendations = false,
  hasNoRecommendations = false,
  secondaryButtonLabel = '추천 제품 말고 다른 제품 태그할래요',
  primaryButtonLabel = '직원 호출',
  onSelectProduct,
  onTagOtherProduct,
  onCallStaff,
}: D2ProductRecommendationProps) {
  const [isRecommendationVisible, setIsRecommendationVisible] = useState(false);

  return (
    <div className="stage-external-page">
      <img src={backgroundImage} alt="" className="stage-external-page__background" />
      <div className="stage-external-page__content stage-external-page__content--docent stage-external-page__content--d2">
        <section aria-label="나이비스 AI 도슨트" className="stage-external-page__docent stage-external-page__docent--recommendation">
          <DocentStage cue="present" />
        </section>
        <ScreenHeadline headline={getHeadlineForPurpose(purpose)} onRevealComplete={() => setIsRecommendationVisible(true)} reveal variant="md" className="stage-external-page__headline" />
        {isRecommendationVisible && (
          isLoadingRecommendations ? (
            <LoadingSpinner label="추천 상품을 준비하고 있어요" />
          ) : hasNoRecommendations ? (
            <p className="py-8 text-center text-sm text-white/70">추천 제품이 아직 없어요</p>
          ) : (
            <div className="stage-external-page__stack stage-external-page__stack--recommendations">
              {products.map((product) => (
                <InfoCard
                  key={product.id}
                  image={product.image}
                  imageSurface="transparent"
                  imageVariant="primary-cutout"
                  name={product.name}
                  description={product.description}
                  onSelect={onSelectProduct ? () => onSelectProduct(product) : undefined}
                />
              ))}
            </div>
          )
        )}
        {isRecommendationVisible && !isLoadingRecommendations && <div className="stage-external-page__actions">
          <SecondaryButton label={secondaryButtonLabel} onClick={onTagOtherProduct} pendingOnClick />
          <PrimaryButton label={primaryButtonLabel} onClick={onCallStaff} />
        </div>}
      </div>
    </div>
  );
}
