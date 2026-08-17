/**
 * 시연용 NFC 태그 풀.
 *
 * 실물 태그가 없어 B1에서 화면을 누르면 이 목록에서 하나를 골라 스캔한 것처럼 진행한다.
 *
 * **서버 태그와 fixture 제품이 짝을 이루는 것만 넣는다.** 화면의 제품명·컬러는 서버에서 오고
 * 이미지·사이즈·상세는 fixture에서 오므로, 둘이 다른 제품이면 이름과 사진이 어긋난다.
 * 2026-08-17 기준 태그 1~120을 전수 조회해 fixture 4종 중 2종만 매칭됐다.
 *
 * 서버 `imageUrl`이 채워지면 fixture에 기댈 이유가 없어지므로, 그때 이 목록을 지우고
 * 임의 태그 범위에서 무작위로 고르도록 바꾸면 된다.
 *
 * `tagId`는 곧 `skuId`다(색상 변형 하나가 태그 하나). fixture의 대표 이미지가 코냑이라
 * 코냑 SKU에 해당하는 태그를 골랐다.
 */
export type DemoTag = {
  /** 서버 태그(=SKU) ID */
  tagId: number
  /** 같은 제품의 fixture 조회 키 */
  sku: string
  /** 확인용 메모. 코드에서 쓰지 않는다. */
  label: string
}

export const DEMO_TAGS: readonly DemoTag[] = [
  { tagId: 156, sku: 'MMKEAVE15CO001', label: 'S Stark 사이드 스터드 비세토스 백팩 (Cognac)' },
  { tagId: 33, sku: 'MMVGATT01CO001', label: '41cm Ottomar 비세토스 위켄더 (Cognac)' },
]

/**
 * 태그할 제품을 하나 고른다. 직전에 본 제품은 피해서 누를 때마다 다른 제품이 나오게 한다.
 * 후보가 하나뿐이면 그대로 돌려준다.
 */
export function pickDemoTag(previousSku: string | null): DemoTag {
  const candidates = DEMO_TAGS.filter((tag) => tag.sku !== previousSku)
  const pool = candidates.length > 0 ? candidates : DEMO_TAGS
  return pool[Math.floor(Math.random() * pool.length)] ?? DEMO_TAGS[0]!
}
