import { Navigate, Route, Routes } from 'react-router'
import {
  STAGE_C_PRODUCT_DETAIL_ROUTES,
  STAGE_C_ROUTES,
  STAGE_C_SCREEN_IDS,
} from '../constants/stageC'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ComingSoonPage } from '../pages/StageC/ComingSoonPage'
import { StageCHubPage } from '../pages/StageC/StageCHubPage'
import { StageCOtherPage } from '../pages/StageC/StageCOtherPage'
import { StageCProductDetailPage } from '../pages/StageC/StageCProductDetailPage'
import { StaffCallPage } from '../pages/StageC/StaffCallPage'
import { StageCFitPage } from '../pages/StageC/StageCFitPages'

const defaultSku = 'MMKEAVE15CO001'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Navigate replace to={`/stage-c/${defaultSku}`} />} path="/" />
      <Route element={<StageCHubPage screenId={STAGE_C_SCREEN_IDS.c1} />} path={STAGE_C_ROUTES.c1} />
      <Route element={<StageCHubPage screenId={STAGE_C_SCREEN_IDS.c2} />} path={STAGE_C_ROUTES.c2} />
      <Route element={<StageCHubPage screenId={STAGE_C_SCREEN_IDS.c3} />} path={STAGE_C_ROUTES.c3} />
      <Route element={<StageCHubPage screenId={STAGE_C_SCREEN_IDS.c4} />} path={STAGE_C_ROUTES.c4} />
      <Route element={<StageCOtherPage />} path={STAGE_C_ROUTES.c5} />
      <Route element={<StageCProductDetailPage topic="craft" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.craft} />
      <Route element={<StageCProductDetailPage topic="heritage" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.heritage} />
      <Route element={<StageCProductDetailPage topic="styling" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.styling} />
      <Route element={<StaffCallPage />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.staffPending} />
      <Route element={<StaffCallPage completed />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.staffCompleted} />
      <Route element={<StageCFitPage kind="size" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.fitSize} />
      <Route element={<StageCFitPage kind="color" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.fitColor} />
      <Route element={<StageCFitPage kind="try-on" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOn} />
      <Route element={<StageCFitPage kind="pending" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOnPending} />
      <Route element={<StageCFitPage kind="completed" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.fitTryOnCompleted} />
      <Route element={<StageCFitPage kind="purchase-completed" />} path={STAGE_C_PRODUCT_DETAIL_ROUTES.fitPurchaseInquiryCompleted} />
      <Route element={<ComingSoonPage />} path={STAGE_C_ROUTES.comingSoon} />
      {/* STAGE A/B routes are added above this fallback as their branches are integrated. */}
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  )
}
