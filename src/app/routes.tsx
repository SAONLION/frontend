import { Navigate, Route, Routes } from 'react-router'
import { STAGE_C_ROUTES, STAGE_C_SCREEN_IDS } from '../constants/stageC'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ComingSoonPage } from '../pages/StageC/ComingSoonPage'
import { StageCHubPage } from '../pages/StageC/StageCHubPage'
import { StageCOtherPage } from '../pages/StageC/StageCOtherPage'

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
      <Route element={<ComingSoonPage />} path={STAGE_C_ROUTES.comingSoon} />
      {/* STAGE A/B routes are added above this fallback as their branches are integrated. */}
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  )
}
