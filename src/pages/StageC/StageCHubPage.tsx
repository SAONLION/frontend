import { useNavigate, useParams } from 'react-router';
import backgroundImage from '../../assets/images/stage-a-background.png';
import hubProductPhoto from '../../assets/images/product-stark-backpack-hub.png';
import PrimaryButton from '../../components/common/PrimaryButton';
import {
  STAGE_C_PRODUCT_DETAIL_ROUTE_KEYS,
  STAGE_C_PRODUCT_DETAIL_ROUTES,
  STAGE_C_SCREEN_IDS,
  stageCComingSoonPath,
  stageCPath,
  type StageCHubScreenId,
} from '../../constants/stageC';
import { useStageCProduct } from '../../features/product-explore/useStageCProduct';
import { useProductExit } from '../../features/product-explore/useProductExit';
import { SESSION_ACTIONS } from '../../features/session/sessionTypes';
import { useSession } from '../../features/session/useSession';
import { stageCHubDefinitions } from './stageCDefinitions';

export function StageCState({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-black px-6 text-center">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10">
        <p className="text-[18px] font-semibold text-white">{title}</p>
        <p className="mt-2 text-[14px] text-[#d1d1d1]">{description}</p>
      </div>
    </div>
  );
}

function choiceTextColor(index: number, total: number): string {
  if (total === 4 && index === 3) return 'text-[#929292]';
  if (index === total - 1) return 'text-[#ebebeb]';
  return 'text-white';
}

interface StageCHubPageProps {
  screenId: StageCHubScreenId;
}

export default function StageCHubPage({ screenId }: StageCHubPageProps) {
  const { sku = '' } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useSession();
  const exitProduct = useProductExit(sku);
  const product = useStageCProduct(sku);
  const screen = stageCHubDefinitions[screenId];
  const isProductIntro = screenId === STAGE_C_SCREEN_IDS.c1;

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />;
  }

  if (product === null) {
    return <StageCState title="상품을 찾을 수 없어요" description="태그한 상품의 주소를 다시 확인해 주세요." />;
  }

  const selectChoice = (choice: (typeof screen.choices)[number]) => {
    if ('hubType' in choice) {
      dispatch({ type: SESSION_ACTIONS.recordHubSelect, hubType: choice.hubType });
      navigate(`/stage-c/${sku}/${choice.destination}`);
      return;
    }

    dispatch({ type: SESSION_ACTIONS.recordSubhubSelect, sub: choice.id });
    const detailRouteKey =
      STAGE_C_PRODUCT_DETAIL_ROUTE_KEYS[choice.id as keyof typeof STAGE_C_PRODUCT_DETAIL_ROUTE_KEYS];

    if (detailRouteKey) {
      navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES[detailRouteKey], sku));
      return;
    }
    navigate(stageCComingSoonPath(sku, choice.destination));
  };

  const requestPurchase = () => {
    dispatch({ type: SESSION_ACTIONS.recordSubhubSelect, sub: STAGE_C_SCREEN_IDS.c33 });
    navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn, sku));
  };

  const headline = isProductIntro ? [`MCM의 대표 제품 ${product.name}이네요`, '어떤 점이 궁금하신가요?'] : [screen.heading];

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center px-[7.71%] pt-40 pb-15.25">
        <span className="w-fit rounded-[10px] border-[0.8px] border-[#424242] bg-[#d9d9d9]/20 px-3.75 py-1.25 text-[14px] text-white">
          {product.name}
        </span>
        <img src={hubProductPhoto} alt={product.name} className="mt-6 h-59 w-59 object-contain" />
        {screen.intro && <p className="mt-4 text-[14px] text-[#d1d1d1]">{screen.intro}</p>}
        <h1 className="mt-10 text-[20px] font-semibold leading-tight text-white">
          {headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <div className="mt-10 flex w-full flex-col gap-3.75">
          {screen.choices.map((choice, index) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => selectChoice(choice)}
              className={`flex h-13.5 w-full items-center justify-center rounded-full bg-[#d9d9d9]/16 text-[16px] font-medium ${choiceTextColor(index, screen.choices.length)}`}
            >
              {choice.label}
            </button>
          ))}
        </div>
        <div className="mt-auto flex w-full gap-2.5">
          <PrimaryButton label={screen.purchaseActionLabel} onClick={requestPurchase} className="h-11.5 flex-1" />
          <button
            type="button"
            onClick={exitProduct}
            className="h-11.5 flex-1 rounded-[30px] bg-white/16 text-[16px] font-medium text-white shadow-[inset_0px_-2px_4px_0px_rgba(255,255,255,0.25)]"
          >
            다른 제품 보기 →
          </button>
        </div>
      </div>
    </div>
  );
}
