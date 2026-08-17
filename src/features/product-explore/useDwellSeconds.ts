import { useEffect, useRef } from 'react'

/**
 * 화면에 머문 시간을 초 단위로 잰다.
 *
 * 서버 `InteractionLogRequest.durationSeconds`에 실어 보내는 값이다. 이게 없으면 관심도가
 * "몇 번 눌렀나"로만 결정되고 "얼마나 봤나"가 빠진다 — 기획서의 CB4 신호(평균 상세 체류
 * 20초 미만)와 여정 카드 관심도 순위가 이 값을 근거로 한다.
 *
 * `key`가 바뀌면 다시 센다. 화면 단위로 재기 위한 것이므로 보통 화면 ID와 SKU를 넘긴다.
 */
export function useDwellSeconds(key: string): () => number {
  const startedAt = useRef(Date.now())

  useEffect(() => {
    startedAt.current = Date.now()
  }, [key])

  return () => Math.max(0, Math.round((Date.now() - startedAt.current) / 1000))
}
