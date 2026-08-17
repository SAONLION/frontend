# SAONLION Frontend

MCM 오프라인 매장의 익명 잠재 고객을 위한 AI SA 도슨트 프론트엔드입니다.

## 기술 스택

- React 19 / TypeScript 6
- Vite 8
- React Router 8
- Three.js / React Three Fiber / Drei
- Tailwind CSS 4 / `tailwind-merge`
- Framer Motion
- Axios (백엔드 API 클라이언트)
- CSS custom properties 기반 디자인 토큰
- Oxlint
- PWA 매니페스트 + 서비스워커 (production 빌드 한정)

## 현재 구현 상태

기준 커밋: `35e2367` (2026-08-17, `origin/dev`·`origin/main`에 병합됨)

- STAGE A1 → A2 → B1 → B2 → C1, 고객용 STAGE C, STAGE D1 → D2 → D2-1과 반복 루프 D3 → D4, STAGE E 비차단 오버레이가 통합되어 있습니다.
- **백엔드 API(`api.tagonai.site`)에 연결되어 있습니다.** 세션 발급·닉네임·태그 스캔·허브 인터랙션·방문 목적·AI 추천·직원 호출·연락처·Blocker 팝업·세션 종료가 실제 서버를 사용합니다.
- **제품 콘텐츠는 아직 로컬 Mock입니다.** 화면에 보이는 상품·이미지·상세 정보는 `src/mocks/fixtures/`의 fixture이며, C5 AI 답변·C4-1 가격 요청·C3-3 착장 요청도 Mock Provider를 사용합니다.
- B1은 도슨트 대신 **여권(Journey) 카드** 화면입니다. STAGE C·D 우상단 버튼으로 같은 카드를 탑시트로 다시 열 수 있습니다.
- STAGE E는 오버레이 UI만 구현되어 있고 서버 직원 호출·실시간 SA 상태와는 동기화하지 않습니다. 서버에 연결된 직원 호출은 STAGE C 경로뿐입니다.
- STAGE G는 삭제되었습니다. 고객용 Blocker 개입은 F2(CB6)·F3(CB5)·F4(CB3)이며 현재는 개발 전용 `/__dev/stage-f`에서만 시연합니다. 실제 Blocker 팝업은 서버 폴링(`/session/pending-action`)이 담당합니다.
- 3D 도슨트는 14개 절차적 cue와 reduced-motion·WebGL fallback을 지원하며 화면 의미에 따라 선별 노출합니다.
- 세션 이벤트 타임라인과 Intent Score는 메모리에만 있습니다. `localStorage`에는 `sessionId`만 저장하므로 새로고침하면 서버 세션은 유지되지만 프론트엔드 이벤트는 초기화됩니다.
- 전체 감사 결과와 수정 우선순위는 `docs/IMPLEMENTATION_AUDIT.md`를 따릅니다.

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
- `/session-end`: 세션 종료 안내
- `/__dev/stage-f`: STAGE F 시연 패널 (development build 전용)

STAGE E와 여권 카드는 독립 페이지 전환 대신 현재 화면 위에 표시되는 오버레이입니다.

`/stage-f/*` 7개 경로는 이전 F3~F8 체계의 잔재로 production에 남아 있으며 `?demo=` 문맥으로만 진입합니다.

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
