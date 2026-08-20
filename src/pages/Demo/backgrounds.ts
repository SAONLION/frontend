// 목업 뒤에 깔리는 스테이지 배경. 실제 그림은 Demo.css가 data-background 값으로 그린다.
export const BACKGROUND_PRESETS = {
  white: '화이트',
  ambient: '앰비언트',
  black: '블랙',
  spotlight: '스포트라이트',
  studio: '스튜디오',
  cognac: '꼬냑',
} as const

export type BackgroundId = keyof typeof BACKGROUND_PRESETS

export const BACKGROUND_IDS = Object.keys(BACKGROUND_PRESETS) as BackgroundId[]

export const DEFAULT_BACKGROUND_ID: BackgroundId = 'white'

export function resolveBackground(id: string | null): BackgroundId {
  if (id && id in BACKGROUND_PRESETS) return id as BackgroundId
  return DEFAULT_BACKGROUND_ID
}

/**
 * ?bgImage=로 넘어온 값을 CSS url()에 넣어도 안전한 형태로 바꾼다.
 * 따옴표·괄호가 섞이면 선언을 빠져나갈 수 있으므로 그런 값은 통째로 버린다.
 */
export function resolveBackgroundImage(raw: string | null): string | null {
  if (!raw) return null

  const trimmed = raw.trim()
  if (!trimmed || /["'()\\]/.test(trimmed)) return null
  // 같은 오리진의 경로이거나 http(s) 주소일 때만 받는다.
  if (!trimmed.startsWith('/') && !/^https?:\/\//i.test(trimmed)) return null

  return `url("${encodeURI(trimmed)}")`
}
