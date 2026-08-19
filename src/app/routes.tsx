import { Navigate, Route, Routes } from 'react-router';
import { CONTENT_OFFER_ROUTES, SESSION_END_ROUTE, STAGE_A_ROUTES, STAGE_B_ROUTES, STAGE_D_ROUTES } from '../constants/appRoutes';
import { STAGE_C_PRODUCT_DETAIL_ROUTES, STAGE_C_ROUTES, STAGE_C_SCREEN_IDS } from '../constants/stageC';
import AppLayout from './AppLayout';
import { StageAIntroPage, StageANicknamePage } from '../pages/StageA/StageAFlowPages';
import { StageBNfcPromptPage, StageBRecognizingPage } from '../pages/StageB/StageBFlowPages';
import { StageD1Page, StageD2Page, StageD21Page, StageD3Page, StageD4Page } from '../pages/StageD/StageDFlowPages';
import { StageCHubPage } from '../pages/StageC/StageCHubPage';
import { StageCProductDetailPage } from '../pages/StageC/StageCProductDetailPage';
import { StageCFitPage } from '../pages/StageC/StageCFitPages';
import { StageCPriceInquiryPage, StageCPurchaseEntryPage } from '../pages/StageC/StageCPriceInquiryPage';
import { StageCOtherPage } from '../pages/StageC/StageCOtherPage';
import { StageCAiAnswerPage } from '../pages/StageC/StageCAiAnswerPage';
import { StaffCallPage } from '../pages/StageC/StaffCallPage';
import { ComingSoonPage } from '../pages/StageC/ComingSoonPage';
import { StageCStaffCallTriggerPage } from '../pages/StageC/StageCOverlayTriggers';
import SessionEndPage from '../pages/SessionEndPage';
import NotFoundPage from '../pages/NotFoundPage';
import { StageFDevPreviewPage } from '../pages/StageF/StageFDevPreviewPage';
import { ContentOfferPage } from '../features/blocker/ContentOfferFlow';

const STAGE_D1_HANDOFF_PATH = STAGE_C_ROUTES.comingSoon.replace(':screenId', STAGE_C_SCREEN_IDS.stageD1);
const STAGE_E1_HANDOFF_PATH = STAGE_C_ROUTES.comingSoon.replace(':screenId', STAGE_C_SCREEN_IDS.stageE1);

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<Navigate replace to={STAGE_A_ROUTES.intro} />} path="/" />

        <Route element={<StageAIntroPage />} path={STAGE_A_ROUTES.intro} />
        <Route element={<StageANicknamePage />} path={STAGE_A_ROUTES.nickname} />

        <Route element={<StageBNfcPromptPage />} path={STAGE_B_ROUTES.nfcPrompt} />
        <Route element={<StageBRecognizingPage />} path={STAGE_B_ROUTES.recognizing} />

        <Route element={<ContentOfferPage screen="email" />} path={CONTENT_OFFER_ROUTES.email} />
        <Route element={<ContentOfferPage screen="sent" />} path={CONTENT_OFFER_ROUTES.sent} />
        <Route element={<ContentOfferPage screen="value" />} path={CONTENT_OFFER_ROUTES.value} />
        <Route element={<ContentOfferPage screen="staff" />} path={CONTENT_OFFER_ROUTES.staff} />

        <Route element={<StageCHubPage screenId={STAGE_C_SCREEN_IDS.c1} />} path={STAGE_C_ROUTES.c1} />
        <Route element={<StageCHubPage screenId={STAGE_C_SCREEN_IDS.c2} />} path={STAGE_C_ROUTES.c2} />
        <Route element={<StageCHubPage screenId={STAGE_C_SCREEN_IDS.c3} />} path={STAGE_C_ROUTES.c3} />
        {/* C4 구매 조건 허브는 폐지하고 C4-1 가격 안내 요청 완료 화면이 그 자리를 대신한다. */}
        <Route element={<StageCPurchaseEntryPage />} path={STAGE_C_ROUTES.c4} />
        <Route element={<StageCOtherPage />} path={STAGE_C_ROUTES.c5} />

        <Route element={<StageCAiAnswerPage />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.otherAnswer} />
        <Route element={<StageCProductDetailPage topic="craft" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.craft} />
        <Route element={<StageCProductDetailPage topic="heritage" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.heritage} />
        <Route element={<StageCProductDetailPage topic="styling" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.styling} />

        <Route element={<StaffCallPage />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.staffPending} />
        <Route element={<StaffCallPage completed />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.staffCompleted} />
        <Route element={<StaffCallPage callType="other" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.otherStaffPending} />
        <Route element={<StaffCallPage callType="other" completed />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.otherStaffCompleted} />

        <Route element={<StageCFitPage kind="size" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.fitSize} />
        <Route element={<StageCFitPage kind="color" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.fitColor} />
        <Route element={<StageCFitPage kind="try-on" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn} />
        <Route element={<StageCFitPage kind="pending" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOnPending} />
        <Route element={<StageCFitPage kind="completed" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOnCompleted} />
        <Route element={<StageCFitPage kind="purchase-completed" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.fitPurchaseInquiryCompleted} />

        <Route element={<StageCPriceInquiryPage state="request" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiry} />
        <Route element={<StageCPriceInquiryPage state="pending" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiryPending} />
        <Route element={<StageCPriceInquiryPage state="completed" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.priceInquiryCompleted} />

        {/* StageC의 제품 이탈 핸드오프 지점: 이 두 경로에 우리 화면을 매핑한다 */}
        <Route element={<StageD1Page />} path={STAGE_D1_HANDOFF_PATH} />
        <Route element={<StageCStaffCallTriggerPage />} path={STAGE_E1_HANDOFF_PATH} />
        <Route element={<StageD2Page />} path={STAGE_D_ROUTES.recommend} />
        <Route element={<StageD21Page />} path={STAGE_D_ROUTES.locationGuide} />
        <Route element={<StageD3Page />} path={STAGE_D_ROUTES.personalizedRecommend} />
        <Route element={<StageD4Page />} path={STAGE_D_ROUTES.personalizedLocationGuide} />

        {import.meta.env.DEV && <Route element={<StageFDevPreviewPage />} path="/__dev/stage-f" />}

        <Route element={<SessionEndPage />} path={SESSION_END_ROUTE} />

        {/* 그 외 아직 안 만든 StageC 세부 화면(coming-soon 스텁 등)은 안전하게 폴백된다. */}
        <Route element={<ComingSoonPage />} path={STAGE_C_ROUTES.comingSoon} />
        <Route element={<ComingSoonPage />} path="/stage-c/:sku/*" />

        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  );
}
