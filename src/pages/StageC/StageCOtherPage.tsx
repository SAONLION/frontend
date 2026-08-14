import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import backgroundImage from '../../assets/images/stage-a-background.png';
import closeIcon from '../../assets/images/icon-close.svg';
import CircleIconButton from '../../components/common/CircleIconButton';
import ScreenHeadline from '../../components/common/ScreenHeadline';
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
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <CircleIconButton
        icon={closeIcon}
        ariaLabel="기타 질문 닫기"
        onClick={() => navigate(stageCPath(STAGE_C_ROUTES.c1, sku))}
        iconClassName="h-4 w-auto"
        className="absolute right-5 top-17.25 z-10"
      />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center px-6 pt-34 pb-16.25">
        <ScreenHeadline headline="선택지에 없는 게 궁금하시면" subtext="아래에 편하게 적어주세요" variant="md" />

        <div className="mt-16.25 flex w-full flex-col gap-1.75 rounded-[15px] border-[0.6px] border-[#424242] bg-[#d9d9d9]/20 p-3.75">
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
            rows={2}
            className="resize-none text-[13px] text-white outline-none placeholder:text-[#a6a6a6]"
          />
          <div aria-label="자주 묻는 질문" className="flex flex-wrap gap-1.75">
            {quickQueryTopics.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setQuery(item.question);
                  setTopic(item.topic);
                  setError('');
                }}
                aria-pressed={topic === item.topic && query === item.question}
                className={`rounded-full border-[0.6px] border-[#424242] px-3.25 py-0.75 text-[12.5px] ${
                  topic === item.topic && query === item.question ? 'bg-[#8a5111]/40 text-white' : 'bg-[#d9d9d9]/20 text-[#a6a6a6]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p id="stage-c-free-query-error" role="alert" className="mt-2 w-full text-[12px] text-[#e0836b]">
            {error}
          </p>
        )}

        <PrimaryButton label={submitting ? '보내는 중…' : '보내기'} onClick={submitQuery} className="mt-8" />

        <div className="mt-auto flex w-full gap-2.5">
          <SecondaryButton
            label="착용 및 구매 문의"
            onClick={() => navigate(stageCPath(STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn, sku))}
            className="h-11.5 flex-1"
          />
          <SecondaryButton label="다른 제품 보기 →" onClick={exitProduct} className="h-11.5 flex-1" />
        </div>
      </div>
    </div>
  );
}
