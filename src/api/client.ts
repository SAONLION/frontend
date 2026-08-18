import axios, { type AxiosError } from 'axios'
import { recordApiCallEnd, recordApiCallStart } from '../features/demo-tools/apiCallLog'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    /** 개발 진단 패널의 호출 기록 ID. production 빌드에서는 설정되지 않는다. */
    devCallId?: number
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export class ApiError extends Error {
  status: number
  code: string | null

  constructor(status: number, code: string | null, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

type BackendErrorBody = {
  status?: number
  error?: string
  code?: string
  message?: string
  path?: string
}

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<BackendErrorBody>
    const status = axiosError.response?.status ?? 0
    const body = axiosError.response?.data
    const message = body?.message ?? body?.error ?? axiosError.message
    return new ApiError(status, body?.code ?? null, message)
  }
  if (error instanceof Error) return new ApiError(0, null, error.message)
  return new ApiError(0, null, '알 수 없는 오류가 발생했습니다.')
}

/**
 * 종료된 세션(409 `SESSION_ALREADY_ENDED`)을 만났을 때 실행할 복구 절차.
 *
 * 복구는 세션 기능이 소유하는데, 그쪽을 여기서 직접 import하면
 * `client → reissueSession → api/session → client` 순환이 생긴다. 그래서 **호출부가
 * 등록하고 여기서는 부르기만 한다.** `SessionBootstrap`이 마운트될 때 등록한다.
 */
type SessionEndedHandler = () => void

let sessionEndedHandler: SessionEndedHandler | null = null

export function setSessionEndedHandler(handler: SessionEndedHandler | null): void {
  sessionEndedHandler = handler
}

/**
 * 호출을 기록한다. **production에서도 남긴다.**
 *
 * 배포본으로 시연하는데 실기기 모바일에서는 devtools 네트워크 탭을 열 수 없다. 게다가 이 앱은
 * 조회 실패를 조용히 폴백하도록 설계돼 있어 화면만 봐서는 성공·실패를 알 수 없다. 숨은 디버그
 * 패널이 이 기록을 읽는다. 최근 40건만 메모리에 두므로 비용은 무시할 수준이다.
 */
apiClient.interceptors.request.use((config) => {
  config.devCallId = recordApiCallStart(config.method, config.url)
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    recordApiCallEnd(response.config.devCallId, response.status, null)
    return response
  },
  (error: unknown) => {
    const apiError = toApiError(error)
    if (axios.isAxiosError(error)) {
      recordApiCallEnd(error.config?.devCallId, apiError.status, apiError.code)
    }
    // 종료된 세션은 어느 화면에서든 나올 수 있다. 화면마다 처리하지 않고 여기서 한 번에 받는다.
    if (apiError.status === 409 && apiError.code === 'SESSION_ALREADY_ENDED') {
      sessionEndedHandler?.()
    }
    return Promise.reject(apiError)
  },
)
