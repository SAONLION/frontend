# SAONLION Frontend

MCM 오프라인 매장의 익명 잠재 고객을 위한 AI SA 도슨트 프론트엔드입니다!

## 기술 스택

- React 19 / TypeScript 6
- Vite 8
- React Router 8
- Three.js / React Three Fiber / Drei
- Tailwind CSS 4 / `tailwind-merge`
- Framer Motion
- Axios (백엔드 API 클라이언트)
- `html-to-image` (여권 카드 이미지 저장)
- CSS custom properties 기반 디자인 토큰
- Oxlint
- PWA 매니페스트 + 서비스워커 (production 빌드 한정)

> 브랜치를 새로 받으면 `npm install`을 먼저 실행하세요. `html-to-image`가 없으면 `tsc -b`가 실패합니다.

## 현재 구현 상태

기준: 2026-08-19 (`41-add-api-연결` 작업 트리, 미커밋 변경 포함)

- STAGE A1 → A2 → B1 → B2 → C1, 고객용 STAGE C, STAGE D1 → D2 → D2-1과 반복 루프 D3 → D4, STAGE E 비차단 오버레이가 통합되어 있습니다.
- **백엔드 API(`api.tagonai.site`)에 연결되어 있습니다.** 세션 발급·닉네임·태그 스캔·허브 인터랙션·방문 목적·AI 추천·직원 호출·착장 요청·구매 문의·C5 AI 답변·연락처·Blocker 팝업·세션 종료가 실제 서버를 사용합니다.
- **순수 Mock API로만 끝나는 고객 기능은 없습니다.** C5 AI 답변·착장·구매 문의는 Live이고, C4-1 가격 요청은 전용 엔드포인트 대신 `staff-calls`로 실제 기록합니다. 다만 C4-1의 700ms 화면 전환과 API 실패 시 제품·추천 폴백에는 로컬 Mock이 남아 있습니다.
- **제품 콘텐츠는 하이브리드입니다.** 제품명·컬러 목록과 실제 로드 가능한 이미지는 서버 값을 우선하고, 이미지 실패·사이즈·치수·소재/헤리티지/스타일링 상세는 `src/mocks/fixtures/`로 보완합니다. 화면별 데이터 출처는 [docs/SCREEN_DATA_MAP.md](docs/SCREEN_DATA_MAP.md)에 전수 정리돼 있습니다.
- B1은 도슨트 대신 **여권(Journey) 카드** 화면입니다. STAGE C·D 우상단 버튼으로 같은 카드를 탑시트로 다시 열 수 있습니다. 콜라주가 4칸을 채우면 완성 팝업이 세션당 1회 뜹니다.
- STAGE E 직원 호출도 서버에 연결되어 있습니다. 전용 엔드포인트는 없고 STAGE C와 같은 `staff-calls` API를 `reason`으로 구분해 씁니다. 실시간 SA 응대 상태 동기화는 없습니다.
- STAGE G는 삭제되었습니다. **Blocker 감지 소유자는 서버로 일원화**했으며, 프론트엔드는 `GET /session/pending-action`을 4초 간격으로 폴링해 어느 화면에서든 바텀시트로 띄웁니다. 화면이 숨겨져 있으면 폴링을 건너뜁니다. **CB1은 고객에게 노출하지 않습니다.**
- 3D 도슨트는 11개 절차적 cue와 reduced-motion·WebGL fallback을 지원하며 화면 의미에 따라 선별 노출합니다.
- `localStorage`에 `sessionId`와 서버 제품 문맥(`productId`·`currentSkuId`·`currentSku`)을 저장하므로 새로고침·앱 전환 뒤에도 서버 기록이 이어집니다. **세션 이벤트 타임라인과 Intent Score는 메모리 전용**이라 초기화됩니다.
- 서버 호출이 실패해 대체 데이터로 진행 중이면 화면 상단에 안내 배너가 뜹니다. 개발 빌드에서는 우측 하단에 **API 진단 패널**이 추가로 나타나 호출 로그와 데이터 출처(LIVE/MOCK)를 보여줍니다. 이 패널은 production 번들에 포함되지 않습니다.
- **숨은 시연·디버그 도구**: **목업 셸(폰 목업 바깥)** 좌측 하단에 `CB3 발동`·`CB6 발동`, 우측 상단에 `화면`(전 화면 이동)·`API`(앱 호출 기록) 버튼이 있습니다. 관객에게 보이지 않도록 목업 안이 아니라 바깥에 두었고, 평소에는 투명하다가 hover·포커스로 열립니다. production 빌드에도 포함됩니다.
- **시연용 목업 셸(`/demo`)**: 노트북에서 루트(`/`)로 들어오면 앱 전체가 iPhone 16 Pro 목업 안 iframe으로 열리고, 폰에서는 앱이 그대로 열립니다. 시연 링크와 실사용 링크가 같습니다.

### 알려진 제약

- ✅ **개입 팝업이 실제로 뜹니다.** 2026-08-19 4차 재검증에서 **CB3**(직원 호출 5분 경계 **+17초**)와 **CB6**(착장 요청 15분 경계 **+2초**)가 발동하는 것을 확인했습니다. 프론트엔드 추가 작업 없이 `BlockerSheet`로 뜨고, 선택 결과는 `actionNextStep`에 따라 STAGE E 접수 오버레이 또는 D3 개인화 추천으로 이어집니다.
- **CB5만 아직 뜨지 않습니다.** 가격 신호를 7가지 경로로 시도했고, 4차에서는 `staff-calls` 오염까지 제거해 50회 폴링했으나 0회입니다. → [docs/BACKEND_REQUEST.md](docs/BACKEND_REQUEST.md) P1-2
- **CB3 발동 시연과 직원 호출 완료 시연은 배타적입니다.** `staff_call.status`가 `requested`를 벗어나면 CB3가 억제됩니다(`acknowledged`·`in_progress`·`completed` 전부, 실측 확인). 개발 진단 패널의 상태 전이 버튼으로는 CB3를 **끄기만** 됩니다 — 띄우려면 셸 좌측 하단 `CB3 발동` 버튼을 씁니다.
- **CB6는 아직 버튼으로 띄울 수 없습니다.** 서버에 `tryon-requests`용 백데이트 훅이 없어 실제로 15분을 기다려야 합니다. 버튼은 미리 붙여뒀고 404 안내가 뜹니다. → [docs/BACKEND_REQUEST.md](docs/BACKEND_REQUEST.md) P1-2 부록
- **시연 도구는 목업 셸에서만 보입니다.** 노트북에서 루트(`/`)로 들어오면 셸이 자동으로 뜨지만, 폰에서 앱을 직접 열면 없습니다.
- **여권 카드의 콜라주 초기화 버튼을 제거했습니다.** 서버에 태그 이력을 지우는 API가 없어 눌러도 재조회로 되살아났습니다. 대신 "어떤 4개를 담을지"를 백엔드에 문의 중입니다. → [docs/BACKEND_REQUEST.md](docs/BACKEND_REQUEST.md) P2-10
- **SA 대시보드는 이번 범위에서 구현하지 않습니다.** 시연에서 말로 설명합니다. 그래서 STAGE C 직원 호출은 상태를 바꿔주지 않으면 45초 뒤 타임아웃되며, **시연 중 `PATCH /internal/test/staff-calls/{callId}/status`로 수동 전이가 필요합니다**(개발 진단 패널에서 가능).
- **여권 카드 `이미지 저장하기`가 실패합니다.** S3에 CORS 헤더가 없어 캔버스가 이미지를 읽지 못합니다. 프론트엔드 우회는 불가능합니다. → [docs/BACKEND_REQUEST.md](docs/BACKEND_REQUEST.md) P1-9
- **`/session-end`로 이동하는 코드가 앱에 없습니다.** 서버의 무활동 60분 자동 종료는 실측상 동작하지 않고, 남은 종료 주체(`purchase_confirm`·SA 종료 처리)는 SA 대시보드 범위라 실질적인 종료 경로가 없습니다. → [docs/OPEN_QUESTIONS.md](docs/OPEN_QUESTIONS.md) 27번

전체 현황과 우선순위는 [docs/README.md](docs/README.md)를 따릅니다.

## 주요 화면 경로

- `/stage-a/intro`: 도슨트 소개
- `/stage-a/nickname`: 닉네임 설정
- `/stage-b/nfc`: 여권 카드 · NFC 태그 안내
- `/stage-b/recognizing?sku=...&tagId=...`: 태그 인식 후 STAGE C 이동
- `/stage-c/:sku`: 제품 소개 · 1차 허브
- `/stage-c/:sku/product`: 제품 이해 허브 (`/craft`, `/heritage`, `/styling`)
- `/stage-c/:sku/fit`: 핏·착장 허브 (`/size`, `/color`, `/try-on`)
- `/stage-c/:sku/purchase`: 가격 안내 요청을 기록하고 C4-1 완료 화면으로 리다이렉트
- `/stage-c/:sku/other`: 기타 질문 (`/answer`, `/staff-call/*`)
- `/stage-c/:sku/coming-soon/STAGE-D1`: 첫 제품 이탈 뒤 방문 목적 선택으로 연결되는 호환 경로
- `/stage-d/recommend`: D2 목적 기반 추천
- `/stage-d/location-guide`: D2-1 위치 안내
- `/stage-d/personalized-recommend`: D3 개인화 추천 (두 번째 이탈부터)
- `/stage-d/personalized-location-guide`: D4 위치 안내
- `/session-end`: 세션 종료 안내 (앱 내 진입 경로 없음 — 위 제약 참고)
- `/demo`: 시연용 iPhone 목업 셸
- `/__dev/stage-f`: STAGE F 시각 QA 패널 (development build 전용)

STAGE E와 여권 카드는 독립 페이지 전환 대신 현재 화면 위에 표시되는 오버레이입니다.

> 구 F3~F8 체계의 `/stage-f/*` 7개 경로와 `?demo=` 진입은 2026-08-18에 제거했습니다.

## 환경 변수

`.env.example`을 `.env`로 복사한 뒤 채웁니다. `VITE_` 접두사 값은 빌드 시 클라이언트 번들에 인라인되므로 비밀 키를 넣지 않습니다.

| 변수 | 용도 |
| --- | --- |
| `VITE_API_BASE_URL` | 백엔드 API base URL. 배포 환경은 HTTPS이므로 `https://`를 사용합니다 |

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

## 문서

저장소 전체 작업 규칙은 [AGENTS.md](AGENTS.md), 문서 목록과 읽는 순서는 [docs/README.md](docs/README.md)를 따릅니다.
