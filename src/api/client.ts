import axios, { type AxiosError } from 'axios'

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

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)
