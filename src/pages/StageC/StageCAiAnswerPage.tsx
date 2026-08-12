import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { GlassInfoCard, StageCDetailShell } from '../../components/domain/GlassShell';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import type { AiAnswerResult } from '../../features/ai-answer/AiAnswerService';
import { useAiAnswerService } from '../../features/ai-answer/useAiAnswerService';
import { useProductExit } from '../../features/product-explore/useProductExit';
import { useStageCProduct } from '../../features/product-explore/useStageCProduct';
import { findLatestFreeQueryForSku, hasOtherStaffCallForQuery } from '../../features/session/freeQueryContext';
import { SESSION_ACTIONS } from '../../features/session/sessionTypes';
import { useSession } from '../../features/session/useSession';
import { STAGE_C_PRODUCT_DETAIL_ROUTES, STAGE_C_ROUTES, stageCPath } from '../../constants/stageC';
import { StageCState } from './StageCHubPage';

type AnswerStatus = 'loading' | 'error' | 'resolved';
type AnswerView = { contextKey: string; status: AnswerStatus; title: string; lines: readonly string[] };
type PendingAnswerRequest = { queryId: string; sku: string; completion: Promise<AiAnswerResult> };

const initialAnswerView = (contextKey: string): AnswerView => ({
  contextKey,
  status: 'loading',
  title: '답변을 준비하고 있어요.',
  lines: [],
});

export default function StageCAiAnswerPage() {
  const { sku = '' } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useSession();
  const service = useAiAnswerService();
  const product = useStageCProduct(sku);
  const exitProduct = useProductExit(sku);
  const queryContext = findLatestFreeQueryForSku(state, sku);
  const query = queryContext?.event;
  const contextKey = query ? `${query.id}:${sku}` : `missing:${sku}`;
  const hasOtherStaffCall = queryContext ? hasOtherStaffCallForQuery(state, sku, queryContext.index) : false;
  const [answerView, setAnswerView] = useState<AnswerView>(() => initialAnswerView(contextKey));
  const [retryAttempt, setRetryAttempt] = useState(0);
  const requestRef = useRef<PendingAnswerRequest | null>(null);
  const staffRequested = useRef(false);
  const otherPath = stageCPath(STAGE_C_ROUTES.c5, sku);
  const staffPendingPath = stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.otherStaffPending, sku);
  const view = answerView.contextKey === contextKey ? answerView : initialAnswerView(contextKey);

  const requestStaff = useCallback(() => {
    if (!query || staffRequested.current) return;
    staffRequested.current = true;
    if (!hasOtherStaffCall) {
      dispatch({ type: SESSION_ACTIONS.recordSaCall, sku, callType: 'other', queryId: query.id });
    }
    navigate(staffPendingPath);
  }, [dispatch, hasOtherStaffCall, navigate, query, sku, staffPendingPath]);

  useEffect(() => {
    if (!query || !product) return;
    let active = true;
    const previous = requestRef.current;
    const request =
      previous?.queryId === query.id && previous.sku === sku
        ? previous
        : { queryId: query.id, sku, completion: service.answer({ sku, topic: query.topic, text: query.text }) };

    if (request !== previous) {
      requestRef.current = request;
      staffRequested.current = false;
      setAnswerView(initialAnswerView(contextKey));
    }

    void request.completion
      .then((result) => {
        if (!active || requestRef.current !== request) return;
        if (!result.resolved) {
          dispatch({ type: SESSION_ACTIONS.recordAiAnswer, queryId: query.id, sku, topic: query.topic, resolved: false });
          if (hasOtherStaffCall) navigate(staffPendingPath, { replace: true });
          else requestStaff();
          return;
        }
        dispatch({ type: SESSION_ACTIONS.recordAiAnswer, queryId: query.id, sku, topic: query.topic, resolved: true });
        setAnswerView({ contextKey, status: 'resolved', title: result.title, lines: result.answerLines });
      })
      .catch(() => {
        if (active && requestRef.current === request) {
          setAnswerView({ ...initialAnswerView(contextKey), status: 'error', title: '답변을 불러오지 못했어요.' });
        }
      });

    return () => {
      active = false;
    };
  }, [contextKey, dispatch, hasOtherStaffCall, navigate, product, query, requestStaff, retryAttempt, service, sku, staffPendingPath]);

  if (product === undefined) return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />;
  if (product === null) return <StageCState title="상품을 찾을 수 없어요" description="태그한 상품의 주소를 다시 확인해 주세요." />;
  if (!query) return <MissingQuestion path={otherPath} />;

  const retry = () => {
    requestRef.current = null;
    staffRequested.current = false;
    setAnswerView(initialAnswerView(contextKey));
    setRetryAttempt((attempt) => attempt + 1);
  };

  return (
    <StageCDetailShell>
      <header className="flex justify-end">
        <button aria-label="기타 질문 닫기" onClick={() => navigate(otherPath)} type="button" className="text-[20px] text-[#d1d1d1]">
          ×
        </button>
      </header>
      <div className="flex flex-col gap-2">
        <h1 className="text-[18px] font-semibold text-white">{view.title}</h1>
        {view.status === 'loading' && (
          <p aria-live="polite" className="text-[13px] text-[#d1d1d1]">
            답변을 준비하고 있어요.
          </p>
        )}
        {view.status === 'error' && <p className="text-[13px] text-[#d1d1d1]">잠시 후 다시 시도하거나 직원에게 문의해 주세요.</p>}
        {view.status === 'resolved' && (
          <section aria-label="AI 답변" className="flex flex-col gap-1 rounded-[15px] border-[0.6px] border-white/18 bg-[#1c1f26]/70 p-4 text-[13px] text-[#d1d1d1] backdrop-blur-md">
            {view.lines.map((line) => (
              <p key={line}>· {line}</p>
            ))}
          </section>
        )}
      </div>
      <div className="mt-auto flex w-full flex-col gap-2.75">
        {view.status === 'error' ? (
          <SecondaryButton label="다시 시도하기" onClick={retry} />
        ) : (
          <SecondaryButton label="다른 것도 물어보기" onClick={() => navigate(otherPath)} />
        )}
        <PrimaryButton label="직원에게 문의하기" onClick={requestStaff} />
        <SecondaryButton label="다른 제품 보기 →" onClick={exitProduct} />
      </div>
    </StageCDetailShell>
  );
}

function MissingQuestion({ path }: { path: string }) {
  const navigate = useNavigate();
  return (
    <StageCDetailShell>
      <GlassInfoCard>
        <h1 className="text-[16px] font-semibold">질문 내용을 찾을 수 없어요.</h1>
        <p className="mt-1 text-[13px] text-[#d1d1d1]">궁금한 점을 다시 입력해 주세요.</p>
        <SecondaryButton label="기타 질문으로 돌아가기" onClick={() => navigate(path)} className="mt-4" />
      </GlassInfoCard>
    </StageCDetailShell>
  );
}
