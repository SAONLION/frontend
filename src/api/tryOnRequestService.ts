import { createTryonRequest } from './tryonRequests'
import type { TryOnRequestService } from '../features/try-on/TryOnRequestService'

/**
 * 착장 요청의 Live 구현.
 *
 * 스펙이 "직원 도착 여부는 추적하지 않으며 프론트에서 단순 로딩 연출로 처리한다"고 명시하므로
 * 직원 호출과 달리 상태 폴링을 하지 않는다. 요청 생성이 끝나면 곧바로 완료로 본다.
 */
export const realTryOnRequestService: TryOnRequestService = {
  async requestTryOn({ sessionId, skuId, size, color }) {
    if (!sessionId) throw new Error('세션이 아직 생성되지 않았습니다.')
    if (skuId === null) throw new Error('제품 정보를 확인하지 못해 착장을 요청할 수 없습니다.')

    await createTryonRequest(sessionId, { sku: skuId, size, color })
    return 'completed'
  },
}
