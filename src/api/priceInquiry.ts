import { createStaffCall } from './staffCalls'
import { STAFF_CALL_REASONS } from '../constants/staffCallReasons'
import { clearDegraded, DEGRADATION_KEYS, markDegraded } from '../features/degradation/degradationStore'

/**
 * C4-1 가격 안내 요청을 서버에 전달한다.
 *
 * 가격 요청 전용 엔드포인트는 없다. 서버의 가격 옵션(`hub/options/9`)은 `STAFF_MEDIATED`이고
 * 수령 방법 선택(`pickup-check`)으로 이어지는 설계인데, 프론트엔드는 C4 구매 조건 허브를
 * 폐지하면서 그 단계를 없앴다. 그래서 E1 `가격 확인`과 같은 방식으로 직원 호출을 만든다.
 *
 * 화면이 "직원에게 구매 안내 요청을 보냈어요"라고 말하므로 이 호출이 빠지면 문구가 거짓이 된다.
 * 실패는 배너로 알린다.
 */
export function requestPriceInquiry(sessionId: string | null, productId: number | null): void {
  if (!sessionId || productId === null) {
    markDegraded(DEGRADATION_KEYS.priceInquiry)
    return
  }

  void createStaffCall(sessionId, { productId, reason: STAFF_CALL_REASONS.price })
    .then(() => clearDegraded(DEGRADATION_KEYS.priceInquiry))
    .catch((error: unknown) => {
      console.error('가격 안내 요청 전달에 실패했습니다.', error)
      markDegraded(DEGRADATION_KEYS.priceInquiry)
    })
}
