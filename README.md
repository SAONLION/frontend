# SAONLION Frontend

MCM 오프라인 매장의 익명 잠재 고객을 위한 AI SA 도슨트 프론트엔드입니다.

## 기술 스택

- React
- TypeScript
- Vite
- React Router
- Three.js / React Three Fiber / Drei
- CSS custom properties 기반 디자인 토큰
- Oxlint

## 현재 구현 상태

- STAGE A1 → A2 → B1 → B2 → C1과 고객용 STAGE C의 C-a~C-e가 `dev`에 통합되어 있습니다.
- 2026-08-15 현재 작업 트리에는 STAGE D1 → D2 → D2-1과 STAGE E 비차단 오버레이 UI까지 연결되어 있습니다. D2의 실제 AI 추천과 E의 백엔드·SA 실시간 상태 동기화는 아직 구현되지 않았습니다.
- C4-2·C4-3은 SA 대시보드 화면이라 고객용 STAGE C 범위에서 제외되어 있습니다.
- A~F에는 Figma 디자인 레퍼런스 기반 시각 보정이 진행 중이며, 사용자 주도의 세부 QA를 계속합니다.
- 3D 도슨트는 `idle`, `greet`, `listen`, `guide`, `scan`, `sending`, `waiting`, `success`, `present` cue와 reduced-motion·fallback을 지원합니다. 다만 모든 화면에 연결되지는 않았고 STAGE C 상세 shell·세션 종료·404 등에는 공통 진입 모션 누락도 있습니다.
- 최신 기획에서 STAGE G는 삭제되었습니다. F1·F2는 SA용으로 아직 미구현이고, 고객용 F3~F8 route·UI·이메일 접점 Mock은 현재 작업 트리에 구현되어 있습니다. 정확한 Blocker 시간 조건·우선순위·실제 발송/SA 연동은 후속 범위입니다.
- 전체 감사 결과와 수정 우선순위는 `docs/IMPLEMENTATION_AUDIT.md`를 따릅니다.

## 주요 화면 경로

- `/stage-a/intro`: 도슨트 소개
- `/stage-a/nickname`: 닉네임 설정
- `/stage-b/nfc`: NFC 태그 안내
- `/stage-b/recognizing?sku=...`: 태그 인식 후 STAGE C 이동
- `/stage-c/:sku`: 제품 상세 허브
- `/stage-c/:sku/coming-soon/STAGE-D1`: 첫 제품 이탈 뒤 방문 목적 선택으로 연결되는 호환 경로
- `/stage-d/recommend`: 선택 목적 기반 제품 목록
- `/stage-d/location-guide`: 선택 제품 위치 안내
- `/stage-f/cb6/offer`: F3 CB6 콘텐츠 수신 제안
- `/stage-f/cb6/email`: F4 이메일 입력
- `/stage-f/cb6/complete`: F5 발송 완료
- `/stage-f/cb3/prompt`: F6 CB3 직원 안내 제안
- `/stage-f/cb5/prompt`: F6 CB5 가치 소구 제안
- `/stage-f/cb5/content`: F7 가치 콘텐츠
- `/stage-f/staff-handoff`: F8 직원 문의 안내
- `/session-end`: 세션 종료 안내

STAGE E는 독립 페이지 전환 대신 현재 화면 위에 표시되는 비차단 오버레이입니다.

## 실행 방법

```bash
npm install
npm run dev
```

## 명령어

- `npm run dev`: 개발 서버 실행
- `npm run build`: 타입 검사 및 프로덕션 빌드
- `npm run lint`: 정적 분석
- `npm run preview`: 프로덕션 빌드 미리보기
