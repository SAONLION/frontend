import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { GlassBottomActionDock, GlassChoiceChip, GlassInfoCard, GlassTopBar, StageCDetailShell } from '../../components/domain/GlassShell';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import { FREE_QUERY_TOPICS, type FreeQueryTopic } from '../../constants/events';
import { STAGE_C_PRODUCT_DETAIL_ROUTES, STAGE_C_ROUTES, stageCPath } from '../../constants/stageC';
import { useProductExit } from '../../features/product-explore/useProductExit';
import { useStageCProduct } from '../../features/product-explore/useStageCProduct';
import { SESSION_ACTIONS } from '../../features/session/sessionTypes';
import { useSession } from '../../features/session/useSession';
import { StageCState } from './StageCHubPage';
import { quickQueryTopics } from './stageCDefinitions';

const piiPattern = /(?:\b[\w.+-]+@[\w-]+\.[\w.-]+\b)|(?:\b(?:\+?82[- ]?)?0?1[0-9][ -]?\d{3,4}[ -]?\d{4}\b)/;

export default function StageCOtherPage() {
  const { sku = '' } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useSession();
  const product = useStageCProduct(sku);
  const exitProduct = useProductExit(sku);
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<FreeQueryTopic>(FREE_QUERY_TOPICS.other);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (product === undefined) return <StageCState title="제품 정보를 불러오는 중이에요" description="잠시만 기다려 주세요." />;
  if (product === null) return <StageCState title="상품을 찾을 수 없어요" description="태그한 상품의 주소를 다시 확인해 주세요." />;

  const submitQuery = () => {
    const text = query.trim();
    if (!text) return setError('궁금한 내용을 입력하거나 퀵칩을 선택해 주세요.');
    if (piiPattern.test(text)) return setError('개인정보 없이 질문해 주세요.');
    if (submitting) return;
    setSubmitting(true);
    dispatch({ type: SESSION_ACTIONS.recordFreeQuery, sku, topic, text });
    navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.otherAnswer, sku));
  };

  return (
    <StageCDetailShell>
      <GlassTopBar
        context=""
        action={
          <button
            aria-label="기타 질문 닫기"
            onClick={() => navigate(stageCPath(STAGE_C_ROUTES.c1, sku))}
            type="button"
            className="text-[20px] text-[#d1d1d1]"
          >
            ×
          </button>
        }
      />
      <GlassInfoCard>
        <h1 className="text-[16px] font-semibold">선택지에 없는 게 궁금하시면</h1>
        <p className="mt-1 text-[13px] text-[#d1d1d1]">아래에 편하게 적어주세요.</p>
        <div className="mt-4 flex flex-col gap-3">
          <label htmlFor="stage-c-free-query" className="sr-only">
            궁금한 내용
          </label>
          <textarea
            id="stage-c-free-query"
            aria-describedby={error ? 'stage-c-free-query-error' : undefined}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setTopic(FREE_QUERY_TOPICS.other);
              setError('');
            }}
            placeholder="예) 비 오는 날 들어도 괜찮을까요?"
            rows={3}
            className="rounded-xl bg-white/10 px-4 py-3 text-[14px] text-white outline-none placeholder:text-[#8a8a8a]"
          />
          <div aria-label="자주 묻는 질문" className="flex flex-wrap gap-2">
            {quickQueryTopics.map((item) => (
              <GlassChoiceChip
                key={item.label}
                label={item.label}
                selected={topic === item.topic && query === item.question}
                onClick={() => {
                  setQuery(item.question);
                  setTopic(item.topic);
                  setError('');
                }}
              />
            ))}
          </div>
          {error && (
            <p id="stage-c-free-query-error" role="alert" className="text-[12px] text-[#e0836b]">
              {error}
            </p>
          )}
        </div>
        <PrimaryButton label={submitting ? '보내는 중…' : '보내기'} className="mt-4" onClick={submitQuery} />
      </GlassInfoCard>
      <GlassBottomActionDock>
        <SecondaryButton label="착용 및 구매 문의" onClick={() => navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn, sku))} />
        <SecondaryButton label="다른 제품 보기 →" onClick={exitProduct} />
      </GlassBottomActionDock>
    </StageCDetailShell>
  );
}
