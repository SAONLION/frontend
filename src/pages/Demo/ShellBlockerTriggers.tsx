import { useState } from 'react'
import { ApiError } from '../../api/client'
import { backdateStaffCallRequestedAt, backdateTryonRequestedAt } from '../../api/internalTest'
import { createStaffCall } from '../../api/staffCalls'
import { createTryonRequest } from '../../api/tryonRequests'
import { STAFF_CALL_REASONS } from '../../constants/staffCallReasons'
import { getStoredProductContext, getStoredSessionId } from '../../features/session/sessionStorage'
import '../../features/demo-tools/DemoTools.css'

/**
 * Blocker 팝업을 즉시 띄우는 숨은 시연 버튼. **목업 바깥 좌측 하단.**
 *
 * **왜 바깥인가.** 관객이 보는 것은 폰 목업 화면이다. 버튼이 그 안에 있으면 시연 화면에 잡힌다.
 * 셸에 두면 진행자만 쓰고 관객에게는 보이지 않는다.
 *
 * **왜 동작하는가.** 서버가 CB3는 직원 호출 5분 뒤, CB6는 착장 요청 15분 뒤에 만든다.
 * 시연에서 그 시간을 기다릴 수 없으므로 `internal-test` 백데이트 훅으로 요청 시각을 과거로 돌려
 * 조건을 즉시 성립시킨다. 팝업 자체는 iframe 안 앱의 4초 폴링이 가져온다.
 *
 * **세션은 `localStorage`로 공유한다.** 셸과 앱이 같은 오리진이라 앱이 발급한 세션을 그대로 읽는다.
 */

/** 서버 감지 스케줄러 주기. 실측 20초 이내에 팝업이 뜬다. */
const DETECTION_HINT = '20초 내 팝업'

/** 착장 요청 필수값. 서버가 검증하지 않아 화면에서 고른 값이 없으면 이걸 쓴다. */
const TRYON_FALLBACK_SIZE = 'FREE'
const TRYON_FALLBACK_COLOR = '기본'

type Status = { tone: 'info' | 'error'; message: string } | null

export default function ShellBlockerTriggers() {
  const [busy, setBusy] = useState<'CB3' | 'CB6' | null>(null)
  const [status, setStatus] = useState<Status>(null)

  const triggerCb3 = async (sessionId: string) => {
    const context = getStoredProductContext()
    // productId는 없어도 된다 — 서버가 제품 무관 호출을 허용한다.
    const call = await createStaffCall(sessionId, {
      productId: context?.productId ?? undefined,
      reason: STAFF_CALL_REASONS.other,
    })
    await backdateStaffCallRequestedAt(call.callId)
    return `CB3 조건 성립 (호출 #${call.callId}). ${DETECTION_HINT}.`
  }

  const triggerCb6 = async (sessionId: string) => {
    const context = getStoredProductContext()
    // 착장 요청은 서버 SKU ID(정수)를 요구한다. B2 태그 스캔에서만 채워지는 값이다.
    if (!context || context.currentSkuId === null) {
      throw new ApiError(0, null, '앱에서 제품을 먼저 태그해야 한다')
    }
    const tryon = await createTryonRequest(sessionId, {
      sku: context.currentSkuId,
      size: TRYON_FALLBACK_SIZE,
      color: TRYON_FALLBACK_COLOR,
    })
    await backdateTryonRequestedAt(tryon.tryonRequestId)
    return `CB6 조건 성립 (착장 #${tryon.tryonRequestId}). ${DETECTION_HINT}.`
  }

  const run = (code: 'CB3' | 'CB6', task: (sessionId: string) => Promise<string>) => {
    const sessionId = getStoredSessionId()
    if (!sessionId) {
      setStatus({ tone: 'error', message: '앱 세션이 아직 없다. 목업에서 화면을 한 번 넘겨라.' })
      return
    }

    setBusy(code)
    setStatus(null)
    void task(sessionId)
      .then((message) => setStatus({ tone: 'info', message }))
      .catch((error: unknown) => {
        // 백데이트 훅이 서버에 없으면 404다. CB6는 아직 그 상태라 원인을 구분해 알린다.
        const notFound = error instanceof ApiError && error.status === 404
        setStatus({
          tone: 'error',
          message: notFound
            ? `${code} 백데이트 훅이 서버에 없다(404). 백엔드 요청 대기 중.`
            : `${code} 실패: ${error instanceof Error ? error.message : String(error)}`,
        })
      })
      .finally(() => setBusy(null))
  }

  return (
    <div className="demo-tools demo-tools--blocker">
      <button
        className="demo-tools__button"
        disabled={busy !== null}
        onClick={() => run('CB3', triggerCb3)}
        type="button"
      >
        {busy === 'CB3' ? '…' : 'CB3 발동'}
      </button>
      <button
        className="demo-tools__button"
        disabled={busy !== null}
        onClick={() => run('CB6', triggerCb6)}
        type="button"
      >
        {busy === 'CB6' ? '…' : 'CB6 발동'}
      </button>
      {status && (
        <p className="demo-tools__status" data-tone={status.tone} role="status">
          {status.message}
        </p>
      )}
    </div>
  )
}
