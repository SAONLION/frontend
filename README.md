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
- C4-2·C4-3은 SA 대시보드 화면이라 고객용 STAGE C 범위에서 제외되어 있습니다.
- A·B·C에는 Figma 디자인 레퍼런스 기반 1차 시각 보정이 반영되어 있으며, 사용자 주도의 세부 QA는 계속 진행합니다.
- 3D 도슨트는 현재 절차적 `idle`·`greet`와 reduced-motion·fallback을 지원합니다. 화면별 애니메이션 cue 확장은 다음 작업입니다.
- 이후 이벤트 계약 보완, 실제 API 연동과 통합 QA를 진행합니다.

## 주요 화면 경로

- `/stage-a/intro`: 도슨트 소개
- `/stage-a/nickname`: 닉네임 설정
- `/stage-b/nfc`: NFC 태그 안내
- `/stage-b/recognizing?sku=...`: 태그 인식 후 STAGE C 이동
- `/stage-c/:sku`: 제품 상세 허브

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
