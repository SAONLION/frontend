import backgroundImage from '../../assets/images/stage-a-background.png';
import heroImage from '../../assets/images/product-visetos-backpack-hero.png';
import productThumbnail from '../../assets/images/product-visetos-backpack.png';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import HeroImage from '../../components/common/HeroImage';
import InfoCard from '../../components/common/InfoCard';
import ReasonCard from '../../components/common/ReasonCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';

interface Reason {
  label: string;
  value: string;
}

interface F2AlternativeSkuRecommendationProps {
  purpose: string;
  priorityFactor: string;
  subtext?: string;
  productImage?: string;
  productName?: string;
  productDescription?: string | string[];
  reasonCardTitle?: string;
  reasons?: Reason[];
  detailButtonLabel?: string;
  reserveOriginalButtonLabel?: string;
  goBackButtonLabel?: string;
  onViewProductDetail?: () => void;
  onReserveOriginal?: () => void;
  onGoBack?: () => void;
}

export default function F2AlternativeSkuRecommendation({
  purpose,
  priorityFactor,
  subtext = '이 제품을 추천드려보세요!',
  productImage = productThumbnail,
  productName = '비세토스 백팩 L · 코냑',
  productDescription = '22L · 기내 반입 규격 · 현재 매장 보유',
  reasonCardTitle = '제안 근거',
  reasons = [
    { label: '열람하신 정보', value: '제작 공정 · 사이즈' },
    { label: '방문 목적', value: purpose },
    { label: '선호 컬러', value: '코냑 (동일 유지)' },
  ],
  detailButtonLabel = '이 제품 상세 정보',
  reserveOriginalButtonLabel = '원래 제품으로 예약할게요',
  goBackButtonLabel = '이전으로 돌아가기',
  onViewProductDetail,
  onReserveOriginal,
  onGoBack,
}: F2AlternativeSkuRecommendationProps) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center px-[7.21%] pt-30.25 pb-12.25">
        <ScreenHeadline
          headline={[`고객님의 목적 ${purpose}과,`, `중요시하는 부분인 ${priorityFactor}을 고려했을 때,`]}
          subtext={subtext}
          variant="md"
          align="left"
          className="w-full"
        />
        <HeroImage src={heroImage} alt={productName} className="mt-6.5" />
        <InfoCard
          image={productImage}
          name={productName}
          description={productDescription}
          className="mt-4.75"
        />
        <ReasonCard title={reasonCardTitle} reasons={reasons} className="mt-4.5" />
        <div className="mt-auto flex w-full flex-col gap-3.25">
          <PrimaryButton label={detailButtonLabel} onClick={onViewProductDetail} />
          <SecondaryButton label={reserveOriginalButtonLabel} onClick={onReserveOriginal} />
          <SecondaryButton label={goBackButtonLabel} onClick={onGoBack} />
        </div>
      </div>
    </div>
  );
}
