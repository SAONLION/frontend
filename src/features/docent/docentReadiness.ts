type DocentReadyListener = () => void

let isDocentReady = false
const listeners = new Set<DocentReadyListener>()

export function markDocentReady() {
  if (isDocentReady) return

  isDocentReady = true
  listeners.forEach((listener) => listener())
  listeners.clear()
}

export function getDocentReadyState() {
  return isDocentReady
}

export function subscribeToDocentReady(listener: DocentReadyListener) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}
