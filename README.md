# SAONLION Frontend

MCM 오프라인 매장의 익명 잠재 고객을 위한 AI SA 도슨트 프론트엔드입니다.

## 기술 스택

- React
- TypeScript
- Vite
- React Router
- Three.js / React Three Fiber / Drei
- Tailwind CSS 4 / `tailwind-merge`
- Framer Motion
- CSS custom properties 기반 디자인 토큰
- Oxlint
- PWA 매니페스트 + 서비스워커 (production 빌드 한정)

## 현재 구현 상태

기준 커밋: `abcebff` (2026-08-16, `origin/dev`·`origin/main`에 병합됨)

- STAGE A1 → A2 → B1 → B2 → C1, 고객용 STAGE C의 C-a~C-e, STAGE D1 → D2 → D2-1, STAGE E 비차단 오버레이 UI가 `origin/dev`와 `origin/main`에 통합되어 있습니다.
- D2는 정적 fixture 추천이며 실제 AI 추천은 아직 연결되지 않았습니다. STAGE E도 오버레이 UI만 구현되어 백엔드·SA 실시간 상태와 `sa_call` 이벤트는 동기화하지 않습니다.
- PWA 매니페스트와 서비스워커가 추가되어 설치와 오프라인 앱 셸이 동작합니다. 서비스워커는 production 빌드에서만 등록됩니다.
- A~F에는 Figma 디자인 레퍼런스 기반 시각 보정이 반영되어 있으며, 사용자 주도의 세부 QA를 계속합니다.
- 3D 도슨트는 14개 절차적 cue와 reduced-motion·WebGL fallback을 지원합니다. A·B, 일부 C 상태 화면, D1·D2·D2-1, E2에 선별 적용하고 C2 상세와 STAGE F는 제품·문구 집중을 위해 미노출합니다.
- 최신 기획에서 STAGE G는 삭제되었습니다. F1·F2 SA 화면은 아직 미구현이고, 고객용 F3~F8 route·UI·이메일 PII 분리 Mock은 통합되어 있습니다. 실제 시간 기반 Blocker 감지, 전체 우선순위·억제, 실제 발송/SA 연동은 후속 범위입니다.
- C4-1은 허브에서 요청 단계를 건너뛰고 즉시 완료 화면으로 이동합니다. 확인 단계를 살릴지 즉시 요청으로 확정할지 결정 대기 중입니다.
- 전체 감사 결과와 수정 우선순위는 `docs/IMPLEMENTATION_AUDIT.md`를 따릅니다.

## 주요 화면 경로

- `/stage-a/intro`: 도슨트 소개
- `/stage-a/nickname`: 닉네임 설정
- `/stage-b/nfc`: NFC 태그 안내
- `/stage-b/recognizing?sku=...`: 태그 인식 후 STAGE C 이동
- `/stage-c/:sku`: 제품 상세 허브
- `/stage-c/:sku/product`: 제품 이해 허브
- `/stage-c/:sku/fit`: 핏·착장 허브
- `/stage-c/:sku/purchase`: 구매 조건 허브
- `/stage-c/:sku/purchase/price`: C4-1 가격 안내 요청 (`/pending`, `/completed` 단계 포함)
- `/stage-c/:sku/purchase/stock`: C4-2 재고 문의 직원 연결 안내
- `/stage-c/:sku/other`: 기타 질문
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
