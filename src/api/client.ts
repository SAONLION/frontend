import axios, { type AxiosError } from 'axios'
import { recordApiCallEnd, recordApiCallStart } from '../features/dev-diagnostics/apiCallLog'

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

// 개발 빌드에서만 호출을 기록한다. production에서는 이 분기가 통째로 제거된다.
if (import.meta.env.DEV) {
  apiClient.interceptors.request.use((config) => {
    config.devCallId = recordApiCallStart(config.method, config.url)
    return config
  })
}

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      recordApiCallEnd(response.config.devCallId, response.status, null)
    }
    return response
  },
  (error: unknown) => {
    const apiError = toApiError(error)
    if (import.meta.env.DEV && axios.isAxiosError(error)) {
      recordApiCallEnd(error.config?.devCallId, apiError.status, apiError.code)
    }
    return Promise.reject(apiError)
  },
)
