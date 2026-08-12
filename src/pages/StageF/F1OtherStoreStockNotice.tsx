import backgroundImage from '../../assets/images/stage-a-background.png';
import cheongdamMapImage from '../../assets/images/store-map-cheongdam.png';
import shinsegaeMapImage from '../../assets/images/store-map-shinsegae-gangnam.png';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import InfoCard from '../../components/common/InfoCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';

interface StoreData {
  id: string;
  image: string;
  name: string;
  info: string;
  stockCount: number;
}

const DEFAULT_STORES: StoreData[] = [
  {
    id: 'cheongdam-flagship',
    image: cheongdamMapImage,
    name: 'MCM 청담 플래그십',
    info: '도보 8분',
    stockCount: 2,
  },
  {
    id: 'shinsegae-gangnam',
    image: shinsegaeMapImage,
    name: 'MCM 신세계 강남',
    info: '지하철 15분',
    stockCount: 1,
  },
];

interface F1OtherStoreStockNoticeProps {
  colorName: string;
  subtext?: string;
  stores?: StoreData[];
  holdButtonLabel?: string;
  deliveryButtonLabel?: string;
  alternativeButtonLabel?: string;
  onRequestHold?: () => void;
  onScheduleDelivery?: () => void;
  onRecommendAlternative?: () => void;
  onSelectStore?: (store: StoreData) => void;
}

export default function F1OtherStoreStockNotice({
  colorName,
  subtext = '재고가 있는 매장을 확인해보세요',
  stores = DEFAULT_STORES,
  holdButtonLabel = '가까운 매장 홀딩 요청',
  deliveryButtonLabel = '귀국지로 배송 예약',
  alternativeButtonLabel = '대체 제품 추천하기',
  onRequestHold,
  onScheduleDelivery,
  onRecommendAlternative,
  onSelectStore,
}: F1OtherStoreStockNoticeProps) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center px-[7.21%] pt-32.25 pb-16.25">
        <ScreenHeadline
          headline={[`찾으시는 ${colorName} 컬러는`, '현재 이 매장에 재고가 없습니다']}
          subtext={subtext}
          variant="md"
          align="left"
          className="w-full"
        />
        <div className="mt-9.75 flex w-full flex-col gap-2.75">
          {stores.map((store) => (
            <InfoCard
              key={store.id}
              variant="store"
              image={store.image}
              name={store.name}
              description={[store.info, `재고 ${store.stockCount}점`]}
              onSelect={onSelectStore ? () => onSelectStore(store) : undefined}
            />
          ))}
        </div>
        <div className="mt-auto flex w-full flex-col gap-3.25">
          <PrimaryButton label={holdButtonLabel} onClick={onRequestHold} />
          <SecondaryButton label={deliveryButtonLabel} onClick={onScheduleDelivery} />
          <SecondaryButton label={alternativeButtonLabel} onClick={onRecommendAlternative} />
        </div>
      </div>
    </div>
  );
}
