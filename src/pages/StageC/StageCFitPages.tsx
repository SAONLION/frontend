import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import backgroundImage from '../../assets/images/stage-a-background.png';
import closeIcon from '../../assets/images/icon-close.svg';
import { DocentStage } from '../../components/domain/DocentStage';
import CircleIconButton from '../../components/common/CircleIconButton';
import ScreenHeadline from '../../components/common/ScreenHeadline';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import { EVENT_NAMES, type SessionEvent } from '../../constants/events';
import { STAGE_C_PRODUCT_DETAIL_ROUTES, STAGE_C_ROUTES, stageCPath } from '../../constants/stageC';
import { useProductExit } from '../../features/product-explore/useProductExit';
import { useStageCProduct } from '../../features/product-explore/useStageCProduct';
import { SESSION_ACTIONS } from '../../features/session/sessionTypes';
import { useSession } from '../../features/session/useSession';
import { useTryOnRequestService } from '../../features/try-on/useTryOnRequestService';
import type { ColorOption, Product, SizeOption } from '../../types/product';
import { StageCState } from './StageCHubPage';
import { fitSearchPath, getFitSelection, type FitSelection } from './stageCFitSelection';

type FitPageKind = 'size' | 'color' | 'try-on' | 'pending' | 'completed' | 'purchase-completed';

const FIT_REQUEST_TRANSITION_DELAY_MS = 2_000;

export function StageCFitPage({ kind }: { kind: FitPageKind }) {
  const { sku = '' } = useParams();
  const location = useLocation();
  const product = useStageCProduct(sku);
  const fitHubPath = stageCPath(STAGE_C_ROUTES.c3, sku);

  if (product === undefined) {
    return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />;
  }

  if (!product) {
    return <FitFallback path={fitHubPath} text="태그한 상품의 주소를 다시 확인해 주세요." />;
  }

  const selection = getFitSelection(product, new URLSearchParams(location.search));
  if (!selection) {
    return <FitFallback path={fitHubPath} text="선택할 수 있는 기본 옵션을 찾을 수 없어요." />;
  }

  return <StageCFitContent kind={kind} product={product} selection={selection} sku={sku} />;
}

interface StageCFitContentProps {
  kind: FitPageKind;
  product: Product;
  selection: FitSelection;
  sku: string;
}

function StageCFitContent({ kind, product, selection, sku }: StageCFitContentProps) {
  const navigate = useNavigate();
  const { dispatch, state } = useSession();
  const tryOnRequestService = useTryOnRequestService();
  const exitProduct = useProductExit(sku);
  const requestRef = useRef<{ key: string; completion: Promise<'completed'> } | null>(null);
  const paths = getFitPaths(sku);
  const hasTryOnRequest = hasMatchingTryOnRequest(state.events, sku, selection);
  const hasPurchaseInquiryAfterTryOn = hasPurchaseAfterMatchingTryOn(state.events, sku, selection);

  useEffect(() => {
    let active = true;

    if (kind !== 'pending' || !hasTryOnRequest) {
      return () => {
        active = false;
      };
    }

    const key = `${sku}:${selection.size.code}:${selection.color.code}`;
    const previousRequest = requestRef.current;
    const request =
      previousRequest?.key === key
        ? previousRequest
        : {
            key,
            completion: tryOnRequestService.requestTryOn({
              sku,
              size: selection.size.code,
              color: selection.color.code,
            }),
          };

    requestRef.current = request;
    const minimumDisplayTime = new Promise<void>((resolve) => {
      window.setTimeout(resolve, FIT_REQUEST_TRANSITION_DELAY_MS);
    });

    void Promise.all([request.completion, minimumDisplayTime]).then(() => {
      if (active) {
        navigate(fitSearchPath(paths.completed, selection), { replace: true });
      }
    });

    return () => {
      active = false;
    };
  }, [hasTryOnRequest, kind, navigate, paths.completed, selection, sku, tryOnRequestService]);

  const setSize = (next: SizeOption) => {
    if (next.code === selection.size.code) return;
    dispatch({ type: SESSION_ACTIONS.recordSizeCheck, sku, size: next.code });
    navigate(fitSearchPath(kind === 'size' ? paths.size : paths.tryOn, { ...selection, size: next }));
  };

  const setColor = (next: ColorOption) => {
    if (next.code === selection.color.code) return;
    dispatch({ type: SESSION_ACTIONS.recordColorSwitch, sku, from: selection.color.code, to: next.code });
    navigate(fitSearchPath(kind === 'color' ? paths.color : paths.tryOn, { ...selection, color: next }));
  };

  const confirmSize = () => {
    const alreadyChecked = state.events.some(
      (event) => event.name === EVENT_NAMES.sizeCheck && event.sku === sku && event.size === selection.size.code,
    );
    if (!alreadyChecked) {
      dispatch({ type: SESSION_ACTIONS.recordSizeCheck, sku, size: selection.size.code });
    }
    navigate(fitSearchPath(paths.tryOn, selection));
  };

  const requestTryOn = () => {
    if (!hasTryOnRequest) {
      dispatch({ type: SESSION_ACTIONS.recordTryonRequest, sku, size: selection.size.code, color: selection.color.code });
    }
    navigate(fitSearchPath(paths.pending, selection));
  };

  const requestPurchase = () => {
    if (!hasPurchaseInquiryAfterTryOn) {
      dispatch({ type: SESSION_ACTIONS.recordPurchaseInquiry, sku });
    }
    navigate(fitSearchPath(paths.purchaseCompleted, selection));
  };

  if ((kind === 'pending' || kind === 'completed') && !hasTryOnRequest) {
    return <FitFallback path={fitSearchPath(paths.tryOn, selection)} text="착장 요청 정보를 찾을 수 없어요." />;
  }

  if (kind === 'purchase-completed' && !hasPurchaseInquiryAfterTryOn) {
    return <FitFallback path={fitSearchPath(paths.tryOn, selection)} text="이번 착장 요청의 구매 문의 정보를 찾을 수 없어요." />;
  }

  if (kind === 'size') {
    return (
      <FitShell kind={kind} selection={selection} sku={sku}>
        <SizeOptions onSelect={setSize} product={product} selection={selection} />
        <dl className="flex flex-col text-[15px]">
          <div className="flex items-start justify-between border-b border-white/10 py-2.75">
            <dt className="text-[#999]">사이즈</dt>
            <dd className="text-right font-medium text-[#f2f2f2]">미디엄 (W30 × H40 × D14 cm)</dd>
          </div>
          <div className="flex items-start justify-between border-b border-white/10 py-2.75">
            <dt className="text-[#999]">용량</dt>
            <dd className="text-right font-medium text-[#f2f2f2]">15L · 노트북 14인치 수납</dd>
          </div>
          <div className="flex items-start justify-between border-b border-white/10 py-2.75">
            <dt className="text-[#999]">무게</dt>
            <dd className="text-right font-medium text-[#f2f2f2]">780 g</dd>
          </div>
          <div className="flex items-start justify-between py-2.75">
            <dt className="text-[#999]">기내 반입</dt>
            <dd className="text-right font-medium text-[#f2f2f2]">가능 · TSA 규격 대응</dd>
          </div>
        </dl>
        <FitActionRow onExitProduct={exitProduct} onPrimaryAction={confirmSize} />
      </FitShell>
    );
  }

  if (kind === 'color') {
    return (
      <FitShell kind={kind} selection={selection} sku={sku}>
        <ColorOptions onSelect={setColor} product={product} selection={selection} />
        <FitActionRow onExitProduct={exitProduct} onPrimaryAction={() => navigate(fitSearchPath(paths.tryOn, selection))} />
      </FitShell>
    );
  }

  if (kind === 'try-on') {
    return (
      <FitShell kind={kind} selection={selection} sku={sku}>
        <div className="flex flex-col gap-4">
          <SizeOptions label="사이즈" onSelect={setSize} product={product} selection={selection} />
          <ColorOptions label="컬러" onSelect={setColor} product={product} selection={selection} />
        </div>
        <PrimaryButton label="위 제품으로 진행 →" onClick={requestTryOn} className="mt-auto" />
      </FitShell>
    );
  }

  if (kind === 'pending') {
    return <FitStatusScreen status="pending" />;
  }

  if (kind === 'completed') {
    return <FitStatusScreen onExitProduct={exitProduct} onPurchaseInquiry={requestPurchase} status="completed" />;
  }

  return <FitStatusScreen onExitProduct={exitProduct} status="purchase-completed" />;
}

type FitStatus = 'pending' | 'completed' | 'purchase-completed';

function FitStatusScreen({
  onExitProduct,
  onPurchaseInquiry,
  status,
}: {
  onExitProduct?: () => void;
  onPurchaseInquiry?: () => void;
  status: FitStatus;
}) {
  const content = {
    pending: { headline: ['직원이 제품을 준비해서', '가는 중이에요!'] },
    completed: { headline: '직원에게 충분한 정보를 전달했어요!', subtext: '착샷 촬영도 요청해보세요.' },
    'purchase-completed': {
      headline: '직원에게 구매 안내 요청을 보냈어요!',
      subtext: '가격과 관련 정보들을 곧 안내해 드릴게요!',
    },
  }[status];

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center px-6 pt-69.25 pb-16.25">
        <DocentStage
          cue={status === 'pending' ? 'waiting' : 'success'}
          continuityKey="fit-status"
          className="mx-auto aspect-345/216 w-[85.8%] max-w-86.25"
        />
        <ScreenHeadline headline={content.headline} subtext={'subtext' in content ? content.subtext : undefined} variant="md" className="mt-1.75" />
        {status === 'completed' && onPurchaseInquiry && onExitProduct && (
          <div className="mt-auto flex w-full gap-2.5">
            <PrimaryButton label="구매 문의" onClick={onPurchaseInquiry} className="h-11.5 flex-1" />
            <SecondaryButton label="다른 제품 보기 →" onClick={onExitProduct} className="h-11.5 flex-1" />
          </div>
        )}
        {status === 'purchase-completed' && onExitProduct && (
          <SecondaryButton label="다른 제품 보기 →" onClick={onExitProduct} className="mt-auto" />
        )}
      </div>
    </div>
  );
}

function FitShell({
  children,
  kind,
  selection,
  sku,
}: {
  children: ReactNode;
  kind: FitPageKind;
  selection: FitSelection;
  sku: string;
}) {
  const navigate = useNavigate();
  const labels: Record<'size' | 'color' | 'try-on', string> = { size: '사이즈 · 용량', color: '컬러', 'try-on': '착장 요청' };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />

      <img
        src={selection.color.imageUrl}
        alt={`${selection.color.label} 컬러 대표 이미지`}
        className="relative h-125 w-full object-cover"
      />

      <span className="absolute left-[8.5%] top-[9%] w-fit rounded-[10px] border-[0.8px] border-[#424242] bg-[#d9d9d9]/20 px-3.75 py-1.25 text-[14px] text-white">
        {labels[kind as 'size' | 'color' | 'try-on']}
      </span>
      <CircleIconButton
        icon={closeIcon}
        ariaLabel="핏 정보 닫기"
        onClick={() => navigate(stageCPath(STAGE_C_ROUTES.c3, sku))}
        iconClassName="h-4 w-auto"
        className="absolute right-[8.5%] top-[8%]"
      />

      <div className="relative z-10 mx-auto -mt-4 flex w-full max-w-100.5 flex-col gap-6 px-[7%] pb-8">
        {children}
      </div>
    </div>
  );
}

function SizeOptions({
  label,
  onSelect,
  product,
  selection,
}: {
  label?: string;
  onSelect: (option: SizeOption) => void;
  product: Product;
  selection: FitSelection;
}) {
  const referenceLabels: Record<string, string> = { MNI: '스몰', SML: '미디엄', SMD: '라지' };
  const options = product.sizeOptions?.slice(0, 3) ?? [];
  const selectedIndex = Math.max(0, options.findIndex((option) => option.code === selection.size.code));

  return (
    <section className="flex flex-col gap-2">
      {label && <h2 className="text-[13px] text-[#d1d1d1]">{label}</h2>}
      <div aria-label="사이즈 선택" role="group" className="relative grid grid-cols-3 rounded-full bg-white/10 p-1">
        <span
          aria-hidden="true"
          className="absolute inset-y-1 w-[calc(33.333%-4px)] rounded-full bg-[#8a5111] transition-transform duration-300"
          style={{ transform: `translateX(calc(${selectedIndex * 100}% + ${selectedIndex * 4}px))` }}
        />
        {options.map((option) => (
          <button
            key={option.code}
            aria-pressed={option.code === selection.size.code}
            onClick={() => onSelect(option)}
            type="button"
            className="relative z-10 rounded-full py-2 text-[13px] text-white"
          >
            {referenceLabels[option.code] ?? option.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function ColorOptions({
  label,
  onSelect,
  product,
  selection,
}: {
  label?: string;
  onSelect: (option: ColorOption) => void;
  product: Product;
  selection: FitSelection;
}) {
  const referenceColors = product.colorOptions?.filter((option) => ['cognac', 'black', 'white'].includes(option.code)) ?? [];
  const referenceLabels: Record<string, string> = { cognac: '코냑', black: '블랙', white: '화이트' };

  return (
    <section className="flex flex-col gap-2">
      {label && <h2 className="text-[13px] text-[#d1d1d1]">{label}</h2>}
      <div aria-label="컬러 선택" role="group" className="flex justify-center gap-6">
        {referenceColors.map((option) => (
          <button
            key={option.code}
            aria-pressed={option.code === selection.color.code}
            onClick={() => onSelect(option)}
            type="button"
            className="flex flex-col items-center gap-1.5"
          >
            <i
              aria-hidden="true"
              className={`block size-9 rounded-full border-2 ${
                option.code === selection.color.code ? 'border-[#8a5111]' : 'border-transparent'
              }`}
              style={{ backgroundColor: option.swatch }}
            />
            <span className="text-[12px] text-[#d1d1d1]">{referenceLabels[option.code] ?? option.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function FitActionRow({ onExitProduct, onPrimaryAction }: { onExitProduct: () => void; onPrimaryAction: () => void }) {
  return (
    <div className="mt-auto flex w-full gap-2.5">
      <PrimaryButton label="착용 및 구매 문의" onClick={onPrimaryAction} className="h-11.5 flex-1" />
      <SecondaryButton label="다른 제품 보기 →" onClick={onExitProduct} className="h-11.5 flex-1" />
    </div>
  );
}

function getFitPaths(sku: string) {
  return {
    size: stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitSize, sku),
    color: stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitColor, sku),
    tryOn: stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn, sku),
    pending: stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOnPending, sku),
    completed: stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOnCompleted, sku),
    purchaseCompleted: stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitPurchaseInquiryCompleted, sku),
  };
}

function hasMatchingTryOnRequest(events: readonly SessionEvent[], sku: string, selection: FitSelection): boolean {
  return events.some(
    (event) =>
      event.name === EVENT_NAMES.tryonRequest &&
      event.sku === sku &&
      event.size === selection.size.code &&
      event.color === selection.color.code,
  );
}

function hasPurchaseAfterMatchingTryOn(events: readonly SessionEvent[], sku: string, selection: FitSelection): boolean {
  const tryOnIndex = events
    .map((event, index) => ({ event, index }))
    .findLast(
      ({ event }) =>
        event.name === EVENT_NAMES.tryonRequest &&
        event.sku === sku &&
        event.size === selection.size.code &&
        event.color === selection.color.code,
    )?.index;
  return tryOnIndex !== undefined && events.slice(tryOnIndex + 1).some((event) => event.name === EVENT_NAMES.purchaseInquiry && event.sku === sku);
}

function FitFallback({ path, text }: { path: string; text: string }) {
  const navigate = useNavigate();
  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center gap-4 overflow-hidden bg-black px-6 text-center">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 flex w-full max-w-100.5 flex-col items-center">
        <h1 className="text-[18px] font-semibold text-white">이전 선택을 찾을 수 없어요.</h1>
        <p className="mt-1 text-[14px] text-[#d1d1d1]">{text}</p>
        <SecondaryButton label="핏 · 취향으로 돌아가기" onClick={() => navigate(path)} className="mt-4" />
      </div>
    </div>
  );
}
