# 리팩터링 기준선 — 중앙해커톤 버전

- 이슈: `#94 [Audit] 중앙해커톤 버전의 구조·성능 기준선 기록`
- 측정 기준 커밋: `48922038067e04cf578c01bedeb7c9b9dabf433f`
- 측정일: 2026-09-07
- 측정 환경: 로컬 production build (`vite v8.2.1`)

이 문서는 이후 리팩터링의 전후 차이를 같은 조건에서 비교하기 위한 기준점이다.
문제의 해결이나 제품 정책 변경은 이 이슈의 범위에 포함하지 않는다.

## 1. 현재 구조

```text
src/
├── app/          라우팅, 레이아웃, navigation helper
├── api/          고객용 백엔드 요청과 DTO
├── components/   common UI와 domain UI
├── features/     세션, 도슨트, Blocker, 직원 호출 등 상태/동작
├── mocks/        production fallback fixture와 Provider
├── pages/        STAGE A~F 및 Demo 화면 조합
└── services/     제품 콘텐츠 Provider 경계
```

- TypeScript 소스: 178개 (`.ts`, `.tsx`)
- CSS 파일: 11개
- `components/common` + `components/domain`: 31개 컴포넌트
- feature 파일: 56개
- page 파일: 30개

페이지·feature·API·Provider의 기본 경계는 존재한다. 제품 콘텐츠는 Live/Mock
Provider를 교체할 수 있고, 세션도 Context + reducer로 분리되어 있다.

## 2. 자동 검증 기준선

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| lint | PASS | `npm run lint` (`oxlint`) |
| production build | PASS | `npm run build` (`tsc -b && vite build`) |
| test script | 없음 | `package.json` scripts에 `test` 없음 |
| test/spec 파일 | 0개 | `*.test.*`, `*.spec.*` 미검출 |
| TypeScript strict | 미명시 | `tsconfig.app.json`에 `strict: true` 없음 |
| 강제 strict 컴파일 | PASS | `npx tsc -p tsconfig.app.json --strict --noEmit` |

## 3. production 번들 기준선

`npm run build` 결과의 주요 JavaScript/CSS 청크는 아래와 같다.

| 산출물 | 크기 | gzip | 판정 |
| --- | ---: | ---: | --- |
| `index-*.js` | 893.43 kB | 275.12 kB | 500 kB 경고 |
| `react-three-fiber.esm-*.js` | 882.92 kB | 234.58 kB | 500 kB 경고 |
| `DocentCanvas-*.js` | 92.03 kB | 27.96 kB | lazy chunk |
| `DemoShellPage-*.js` | 14.20 kB | 5.29 kB | production 포함 |
| `DemoShellPage-*.css` | 7.98 kB | 2.30 kB | production 포함 |
| `index-*.css` | 119.91 kB | 20.55 kB | 공통 CSS |

- 전체 `dist/` 크기: 약 11 MB
- Pretendard font 2종: 778.43 kB, 785.85 kB
- Vite가 500 kB 초과 청크 경고를 출력한다.

## 4. 코드 구조상 기준선

| 항목 | 현재 값 | 후속 이슈 |
| --- | --- | --- |
| 전역 CSS | `src/App.css` 3,211줄 | CSS STAGE/공통 분리 |
| Stage C Fit 화면 | `StageCFitPages.tsx` 430줄 | 상태·요청·UI 책임 분리 |
| feature → page import | 1건 | `PendingActionWatcher → E2RequestReceived` 제거 |
| 직접 `useNavigate` 사용 | 다수 | `usePreparedNavigate` 예외 정책 확정 및 정리 |
| production Demo 코드 | 존재 | Demo 셸·도구 제거 이슈 |

`PendingActionWatcher`가 `pages/StageE/E2RequestReceived`를 import하여, feature가
상위 조합 계층인 page를 참조한다. `E2RequestReceived`의 재사용 가능한 본문을
domain 컴포넌트로 추출하는 것이 후속 리팩터링의 후보다.

## 5. 진입과 시연 도구의 현재 동작

- `/`: 정밀 포인터(데스크톱)에서는 Demo iframe 셸, 모바일/태블릿에서는 고객 앱으로 분기한다.
- `/demo`: 기기와 관계없이 Demo iframe 셸을 연다.
- `/__dev/stage-f`: DEV에서만 Stage F 시각 QA 화면을 제공한다.
- `main.tsx`와 `api/client.ts`는 Demo 셸의 API 로그 연결을 import한다.
- production build에는 `DemoShellPage` JavaScript와 CSS가 포함된다.

제품·추천 fixture와 degradation UI는 서버/이미지 실패 시 고객 흐름을 유지하는
production fallback이므로 Demo 셸과 구분한다.

## 6. 제품 결정 확인 필요

문서 사이에 Demo 운영 정책의 충돌이 있다.

| 출처 | 내용 |
| --- | --- |
| `AN.md` (2026-09-07) | `/demo` 및 노트북 폰 목업을 제거하고, 모든 일반 접속을 고객 앱으로 연결하며 `/admin`을 추가할 것을 제안 |
| 기존 `docs/` 일부 (2026-08-19 기준) | 시연용 목업 셸을 유지하는 전제의 설명이 남아 있음 |

후속 구현 전에 다음을 팀의 최신 제품 결정으로 확정해야 한다.

1. `/`를 화면 크기·포인터와 무관하게 고객 앱으로 직접 연다.
2. `/demo`와 production Demo 도구를 제거한다.
3. `/admin`을 고객 앱과 별도 실행 경계로 둔다.
4. 서버 장애용 fallback fixture는 유지하고, 사용 사실을 사용자에게 알린다.

## 7. 다음 이슈 의존성

```text
#94 Audit 기준선
  ├── [Test] 리팩터링 안전망과 strict TypeScript 도입
  ├── [Refactor] 데스크톱 폰 목업 제거 및 모바일 direct entry
  └── [Architecture] CustomerApp과 AdminApp 실행 경계 분리
```

Audit 완료 후에는 테스트 안전망을 먼저 마련한다. 그 뒤 Demo 제거와 고객/Admin
실행 경계를 순서대로 진행한다. 대형 CSS와 Stage C Fit 분리는 핵심 관리자 흐름을
막지 않는 별도 후속 이슈로 유지한다.
