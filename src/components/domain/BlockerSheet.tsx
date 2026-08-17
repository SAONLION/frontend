import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'

const CLOSE_DRAG_RATIO = 0.24
const CLOSE_DRAG_MINIMUM_PX = 96
// Motion.css의 `service-sheet-exit` 길이와 맞춘다.
const CLOSE_ANIMATION_MS = 420

export type BlockerSheetAction = { key: string; label: string }

type BlockerSheetProps = {
  title: string
  body?: ReactNode
  actions: readonly BlockerSheetAction[]
  /** 아래로 끌어 닫거나 배경을 눌렀을 때. 옵션을 고르지 않은 것으로 처리한다. */
  onDismiss: () => void
  onSelect: (key: string) => void
  labelledById: string
}

/**
 * Blocker 개입 바텀시트.
 *
 * F2~F4 개발 오버레이의 시트 디자인을 서버 `pending-action` 팝업에 적용한 것이다.
 * 문구와 선택지는 서버가 주고, 시각 언어와 상호작용(아래로 끌어 닫기)만 여기서 담당한다.
 */
export function BlockerSheet({ title, body, actions, onDismiss, onSelect, labelledById }: BlockerSheetProps) {
  const sheetRef = useRef<HTMLElement | null>(null)
  const dragStartYRef = useRef<number | null>(null)
  const dragOffsetRef = useRef(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
  }, [])

  /** 퇴장 모션을 보여준 뒤 응답한다. 형제 시트(여권 카드·E 오버레이)와 같은 규칙이다. */
  const closeThen = (run: () => void) => {
    if (isClosing) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      run()
      return
    }
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(run, CLOSE_ANIMATION_MS)
  }

  const startDrag = (event: PointerEvent<HTMLSpanElement>) => {
    dragStartYRef.current = event.clientY
    dragOffsetRef.current = 0
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event: PointerEvent<HTMLSpanElement>) => {
    const startY = dragStartYRef.current
    if (startY === null) return
    // 위로는 끌리지 않는다. 시트가 화면 위로 튀어나오면 배경과 겹친다.
    const nextOffset = Math.max(0, event.clientY - startY)
    dragOffsetRef.current = nextOffset
    setDragOffset(nextOffset)
  }

  const endDrag = (event: PointerEvent<HTMLSpanElement>) => {
    if (dragStartYRef.current === null) return
    dragStartYRef.current = null
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const sheetHeight = sheetRef.current?.offsetHeight ?? 0
    if (dragOffsetRef.current >= Math.max(CLOSE_DRAG_MINIMUM_PX, sheetHeight * CLOSE_DRAG_RATIO)) {
      closeThen(onDismiss)
      return
    }
    dragOffsetRef.current = 0
    setDragOffset(0)
  }

  return (
    <div className={`blocker-sheet-overlay${isClosing ? ' blocker-sheet-overlay--closing' : ''}`}>
      <section
        aria-labelledby={labelledById}
        aria-modal="true"
        className={`blocker-sheet${isDragging ? ' blocker-sheet--dragging' : ''}`}
        ref={sheetRef}
        role="dialog"
        style={{ translate: `0 ${dragOffset}px` } as CSSProperties}
      >
        <span
          aria-label="아래로 끌어 닫기"
          className="blocker-sheet__handle"
          onPointerCancel={endDrag}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
        />
        <h1 id={labelledById}>{title}</h1>
        {body && <p className="blocker-sheet__body">{body}</p>}
        <div className="blocker-sheet__actions">
          {actions.map((action, index) => (
            <button
              key={action.key}
              className={`blocker-sheet__button${index === 0 ? ' blocker-sheet__button--primary' : ''}`}
              type="button"
              onClick={() => closeThen(() => onSelect(action.key))}
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
