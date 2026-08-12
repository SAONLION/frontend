import type { TryOnRequestService } from '../../features/try-on/TryOnRequestService'

const TRY_ON_REQUEST_DELAY_MS = 700

export const mockTryOnRequestService: TryOnRequestService = {
  requestTryOn: () => new Promise((resolve) => window.setTimeout(() => resolve('completed'), TRY_ON_REQUEST_DELAY_MS)),
}
