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

export function useDocentReadyGate() {
  const [isReady, setIsReady] = useState(getDocentReadyState)

  useEffect(() => {
    if (isReady) return

    const unsubscribe = subscribeToDocentReady(() => setIsReady(true))
    const safetyTimer = window.setTimeout(() => setIsReady(true), 2500)

    return () => {
      unsubscribe()
      window.clearTimeout(safetyTimer)
    }
  }, [isReady])

  return isReady
}
import { useEffect, useState } from 'react'
