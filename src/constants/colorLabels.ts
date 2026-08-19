/**
 * `final_final_final_tobackend/data/products.ndjson`의 624 style에서 추출한
 * 영문 색상명 40개의 고객 표시용 한국어 매핑이다.
 *
 * 전달본에는 한국어 원문이 없으므로 이는 제품 속성이 아닌 프론트엔드 현지화 데이터다.
 * 서버가 세션 언어별 `colorLabel`을 제공하면 그 값을 우선하고 이 표는 fallback으로만 쓴다.
 */
const KOREAN_COLOR_LABELS: Record<string, string> = {
  'aw26 sangria sunset': 'AW26 상그리아 선셋',
  'aw20 cognac': 'AW20 코냑',
  beige: '베이지',
  'beige + black': '베이지 + 블랙',
  'beige+black logo': '베이지+블랙 로고',
  black: '블랙',
  'black & black': '블랙 & 블랙',
  'black & white': '블랙 & 화이트',
  'black and white': '블랙 & 화이트',
  'blush pink': '블러시 핑크',
  ceramic: '세라믹',
  cinnamon: '시나몬',
  cognac: '코냑',
  'dark grey': '다크 그레이',
  'dark navy': '다크 네이비',
  'della robbia blue': '델라 로비아 블루',
  'denim blue': '데님 블루',
  egret: '에그렛',
  gold: '골드',
  grey: '그레이',
  indigo: '인디고',
  khaki: '카키',
  'khaki moss': '카키 모스',
  'light brown': '라이트 브라운',
  'light denim': '라이트 데님',
  'lotus pink': '로터스 핑크',
  'melange grey': '멜란지 그레이',
  multi: '멀티',
  'navy blazer': '네이비 블레이저',
  'off white': '오프화이트',
  orangeade: '오렌지에이드',
  pink: '핑크',
  'platinum gold': '플래티넘 골드',
  'poppy red': '포피 레드',
  silver: '실버',
  'soft pink': '소프트 핑크',
  'taupe grey': '토프 그레이',
  terracotta: '테라코타',
  white: '화이트',
  'white/croissant': '화이트/크루아상',
}

function normalizeColorLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ').toLowerCase()
}

/**
 * 서버 표기(`Soft Pink`)와 화면 선택 키(`soft-pink`)를 같은 색으로 취급한다.
 * 색상명은 표시용 라벨이므로 공백·하이픈·슬래시·플러스 기호 차이로 선택 상태가 갈라지면 안 된다.
 */
export function getColorSelectionKey(value: string): string {
  return normalizeColorLabel(value).replace(/[+/_-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

export function isSameColorSelection(left: string | null | undefined, right: string | null | undefined): boolean {
  return left !== null && left !== undefined && right !== null && right !== undefined
    && getColorSelectionKey(left) === getColorSelectionKey(right)
}

/** 모르는 신규 색은 원문을 보존해 잘못된 번역을 만들지 않는다. */
export function getKoreanColorLabel(label: string): string {
  return KOREAN_COLOR_LABELS[normalizeColorLabel(label)] ?? label
}

export const KOREAN_COLOR_LABEL_COUNT = Object.keys(KOREAN_COLOR_LABELS).length
