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

- 고객용 STAGE C의 C-a~C-e와 3D 도슨트가 `dev`에 통합되어 있습니다.
- C4-2·C4-3은 SA 대시보드 화면이라 고객용 STAGE C 범위에서 제외되어 있습니다.
- 현재 통합 브랜치에서 STAGE A1 → A2 → B1 → B2 → C1 흐름을 연결했습니다.
- 전체 디자인 QA와 실제 API 연동은 후속 작업입니다.

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
