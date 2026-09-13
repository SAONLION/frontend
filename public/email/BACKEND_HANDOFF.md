# 개인화 추천 메일 — 백엔드 전달 사항

작성일: 2026-09-12 (같은 날 발송 시점 변경 반영)
대상: `POST /api/v1/session/email/send`, `GET /api/v1/session/email/preview`, `GET /api/v1/session/email/content`

실서버(`api.tagonai.site`)에 테스트 세션을 만들고 `/internal/test/products/random-tag`로 태그를 4번 찍은 뒤
`/email/preview`를 렌더해 확인한 결과를 정리했다. PICK 4칸·추천 2칸 모두 실제 상품으로 정상 치환되는 것은 확인했다.
아래는 **아직 안 맞는 것**만 적는다.

---

## 0. 프론트의 발송 시점 — POST /email/send 가 언제 오는지

메일 주소는 **CB6 블로커(F2-1~3 화면)** 에서 미리 받고, 실제 `POST /api/v1/session/email/send` 호출은
**여권 콜라주 4칸(태그 4개)이 채워진 것을 프론트가 확인한 순간** 나간다. 순서는 어느 쪽이 먼저든 상관없다.

```
CB6에서 주소 입력 → (태그 진행) → 4칸 완성 관찰 → 이때 /send 호출
4칸 완성 →  이후 CB6에서 주소 입력 → 입력 직후 /send 호출
```

- PICK 4칸이 항상 채워진 상태로 발송되도록 하기 위한 프론트 정책이다. 서버는 그대로 두면 된다.
- `triggerType`은 생략하고 보낸다(→ 서버 기본 `SESSION_END`). 실제 의미는 "여권 완성 시점"이므로,
  통계에서 트리거를 구분하고 싶으면 `JOURNEY_COMPLETE` 같은 값을 추가해 달라. 필수는 아니다.
- `consentMarketing`은 항상 `true`다. F2-2에서 동의 체크 없이는 제출이 안 된다.
- 한 세션에서 발송은 1회다(프론트에서 보장). 실패 시에만 재시도하므로 드물게 같은 세션의 /send가
  두 번 올 수 있다 — 서버도 pcId 기준 중복 발송을 막아두면 안전하다.

---

## 1. 정적 이미지 4개가 404다 — 가장 급함

백엔드가 메일 HTML에서 아래 URL을 참조하는데 전부 404다. 실제 수신자에게 **로고와 매장 사진이 깨진 채로 나간다.**

```
https://api.tagonai.site/email/logo-mcm.png      404
https://api.tagonai.site/email/store-hero.png    404
https://api.tagonai.site/email/bg-main.png       404
https://api.tagonai.site/email/placeholder.png   404
```

`public/email/`에 원본이 있다. 아래 3개를 그대로 올려주면 된다.

| 파일 | 크기 | 쓰임 | 메일 내 표시 크기 |
| --- | --- | --- | --- |
| `logo-mcm.png` | 62 KB | 상단 MCM 엠블럼 | 152 × 95 |
| `store-hero.png` | 562 KB | 매장 사진 (PICK 배경) | 600 × 815 |
| `bg-main.png` | 49 KB | 전체 배경 텍스처 | 600 × 세로 100% |

`placeholder.png`는 저희 쪽에 원본이 없다. **빈 슬롯용 대체 이미지라 백엔드에서 만들어 올려주시면 된다.**
(프론트가 4칸 완성 후에만 발송하므로 PICK이 빌 일은 드물지만, 추천 2칸이 비거나 `/preview`를 미완성 세션으로 볼 때 여전히 쓰인다.)
권장 규격은 아래와 같다. PICK과 추천이 슬롯 크기가 달라 한 장으로 쓰려면 정사각이 무난하다.

- 최소 300 × 300, 배경은 메일 톤에 맞춰 어두운 단색 또는 투명
- PICK 슬롯 149 × 161, 추천 슬롯 299 × 186 / 208 × 196에 `object-fit: cover`로 들어간다

> `pick-*.png`, `product-*.png`는 디자인 시안용 샘플이라 **올릴 필요 없다.** 실제로는 SKU 이미지가 들어간다.

---

## 2. 템플릿을 고쳤다 — 새 `email_content.html`로 교체 필요

`public/email/email_content.html`을 갱신했다. 두 가지를 고쳤다.

### 2-1. PICK 카드 레이아웃이 실제 상품명에서 깨지던 문제

기존 템플릿은 PICK 4행을 Figma 절대좌표(`top: -18 / 131 / 247.4 / 390.5px`)로 박아 뒀다.
디자인 시안의 영문 상품명(`TONI TOP-ZIP SHOPPER IN VISETOS`)에 맞춘 값이라,
실제 한국어 상품명이 들어가니 **3번 상품 사진이 2번 구분선을 뚫고 내려오고 4번 사진이 3번 구분선과 겹쳤다.**

행을 표(`<table>`)로 흘리고 카드 전체를 음수 `margin-top`으로 사진 위에 얹는 구조로 바꿨다.
이제 상품명이 몇 줄이 되든 겹치지 않는다. **치환 토큰은 그대로이므로 백엔드 코드 변경은 없다.**

부작용으로 메일 세로 길이가 **2518px → 2652px**로 늘었다(상품명 길이에 따라 변동). 배경 이미지는
`background-size: 600px 100%`로 바꿔 길이가 변해도 끝까지 덮는다.

### 2-2. 추천 상품 설명문이 하드코딩이었다

기존 템플릿은 설명문 두 줄이 디자인 시안 그대로 박혀 있었다. 그래서 실제 메일에
**전혀 다른 상품 설명이 나갔다.**

```
울 리사이클 캐시미어 라우렐 크롭 카디건
  → "사용한 어망을 혁신적으로 재생한 ECONYL® … 이 스크런치는 …"   (스크런치 설명)

울 캐시미어 블렌드 라우렐 스웨터
  → "하우스의 시그니처 레터, 월계수, 다이아몬드 패턴으로 장식된 숄더백"   (숄더백 설명)
```

`{{recommendDesc1}}`, `{{recommendDesc2}}` 토큰으로 바꿨다. **치환 값을 내려주셔야 한다.**

---

## 3. 요청 사항

### 3-1. `{{recommendDesc1..2}}` 치환 값 (필수)

현재 `EmailSlotItem`에는 상품 설명에 해당하는 필드가 없다(`slotType`, `slotOrder`, `skuId`,
`productId`, `productName`, `imageUrl`, `filled`).

프론트가 쓰는 `GET /api/v1/session/recommendations`의 `RecommendationItem`에는 `reason`(추천 이유)이
있으니, 그 값을 그대로 쓰면 자연스럽다. 다른 설명 소스가 있으면 그쪽도 좋다.

**값이 없으면 빈 문자열로 치환해 주시면 된다.** 토큰이 그대로 남으면 수신자에게 `{{recommendDesc1}}`이
그대로 보인다.

가능하면 `EmailSlotItem`에 `description` 필드를 추가해 `/email/content` 응답으로도 확인할 수 있게 해주시면
프론트에서 검증하기 편하다.

### 3-2. 상품 링크 (`View Item`, `자세히 보기`) — 아직 `href="#"`

메일 안의 링크 6개가 전부 `href="#"`다. 클릭해도 아무 데도 가지 않는다.

- PICK `View Item` × 4
- 추천 `자세히 보기` × 2

슬롯마다 `skuId`/`productId`가 이미 있으니 상품 상세로 가는 URL을 만들 수 있을 것 같다.
**어떤 URL 형태로 갈지 정해주시면 템플릿에 `{{pickLinkUrl1..4}}`, `{{recommendLinkUrl1..2}}` 토큰을
추가하겠다.** 지금은 토큰이 그대로 노출되는 것을 막기 위해 `#`로 두었다.

---

## 4. 참고 — 현재 정상 동작하는 것

아래는 확인 끝났으니 그대로 두시면 된다.

- PICK 4칸 / 추천 2칸 모두 `productName`·`imageUrl` 정상 치환
- 닉네임 없을 때 "고객님" 폴백
- `{{storeName}}` → "청담 MCM HAUS"
- `{{unsubscribeUrl}}`, `{{privacyUrl}}` 치환
- 미치환 토큰 0개
- 태그 이력이 4개 미만일 때 빈 슬롯 처리 (단, `placeholder.png`가 404라 1번 항목 해결 필요)

---

## 5. 전달 파일 요약

```
public/email/
├── email_content.html      ← 갱신됨. 교체 필요
├── logo-mcm.png            ← 업로드 필요
├── store-hero.png          ← 업로드 필요
├── bg-main.png             ← 업로드 필요
└── (placeholder.png)       ← 백엔드에서 제작·업로드 필요
```
