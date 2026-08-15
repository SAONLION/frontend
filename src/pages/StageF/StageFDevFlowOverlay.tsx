import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent } from 'react'
import CircleButton from '../../components/common/CircleButton'
import { DocentStage } from '../../components/domain/DocentStage'
import { getMockValueContentCopy } from '../../mocks/fixtures/demoContent'
import type { Product } from '../../types/product'

export type StageFDevScenario = 'f2' | 'f3' | 'f4'

type StageFDevFlowOverlayProps = {
  product: Product
  scenario: StageFDevScenario
  onExit: () => void
}

type FlowStep = 'prompt' | 'email' | 'sent' | 'value' | 'staff'

const flowTitles: Record<StageFDevScenario, string> = {
  f2: 'F2 · CB6 콘텐츠 제안',
  f3: 'F3 · CB5 가치 소구',
  f4: 'F4 · CB3 직원 안내',
}

/** Development-only replay of the revised F2–F4 blocker flows over a real C detail screen. */
export function StageFDevFlowOverlay({ product, scenario, onExit }: StageFDevFlowOverlayProps) {
  const [step, setStep] = useState<FlowStep>('prompt')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isClosing, setIsClosing] = useState(false)
  const [sheetDuration, setSheetDuration] = useState(720)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const sheetRef = useRef<HTMLElement>(null)
  const dragStartYRef = useRef<number | null>(null)
  const dragOffsetRef = useRef(0)

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
  }, [])

  const closeFlow = useCallback(() => {
    if (isClosing) return
    if (step !== 'prompt' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onExit()
      return
    }
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(onExit, 420)
  }, [isClosing, onExit, step])

  const submitEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('이메일 주소를 확인해주세요.')
      return
    }
    setStep('sent')
  }

  const prompt = scenario === 'f2'
    ? {
        title: `관심있던 ${product.name}에 대한\n콘텐츠를 받아보시겠어요?`,
        accept: '네, 눌러주세요',
        decline: '괜찮아요',
        onAccept: () => setStep('email'),
      }

    : scenario === 'f3'
      ? {
          title: `관심있던 ${product.name}는\n비 오거나 젖지 않는다는 것을\n알고 계셨나요?`,
          accept: '몰랐어요! 궁금해요',
          decline: '관심없어요',
          onAccept: () => setStep('value'),
        }
      : {
          title: '직원에게 직접 안내를\n받아보시겠어요?',
          accept: '네, 눌러주세요',
          decline: '괜찮아요',
          onAccept: () => setStep('staff'),
        }

  const cue = step === 'sent' || step === 'staff'
      ? 'request-success'
      : 'listen'

  const docent = <DocentStage cue={cue} className="stage-f-dev-flow__docent" continuityKey={`stage-f-dev-${scenario}`} />

  useLayoutEffect(() => {
    const sheetHeight = sheetRef.current?.offsetHeight
    if (!sheetHeight) return
    setSheetDuration(Math.round(Math.min(820, Math.max(620, sheetHeight * 1.75))))
  }, [prompt.title])

  const startSheetDrag = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    dragStartYRef.current = event.clientY
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveSheetDrag = (event: PointerEvent<HTMLSpanElement>) => {
    const startY = dragStartYRef.current
    if (startY === null) return
    const nextOffset = Math.max(0, event.clientY - startY)
    dragOffsetRef.current = nextOffset
    setDragOffset(nextOffset)
  }

  const endSheetDrag = (event: PointerEvent<HTMLSpanElement>) => {
    if (dragStartYRef.current === null) return
    dragStartYRef.current = null
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)

    const sheetHeight = sheetRef.current?.offsetHeight ?? 0
    if (dragOffsetRef.current >= Math.max(96, sheetHeight * 0.24)) {
      closeFlow()
      return
    }
    dragOffsetRef.current = 0
    setDragOffset(0)
  }

  return (
    <div aria-label={flowTitles[scenario]} className={`stage-f-dev-flow${isClosing ? ' stage-f-dev-flow--closing' : ''}`} role="dialog">
      {step === 'prompt' && (
        <section aria-labelledby="stage-f-dev-flow-title" className={`stage-f-dev-flow__sheet${isDragging ? ' stage-f-dev-flow__sheet--dragging' : ''}`} ref={sheetRef} style={{ '--stage-f-sheet-duration': `${sheetDuration}ms`, translate: `0 ${dragOffset}px` } as CSSProperties}>
          <span aria-label="아래로 끌어 시트 닫기" className="stage-f-dev-flow__handle" onPointerCancel={endSheetDrag} onPointerDown={startSheetDrag} onPointerMove={moveSheetDrag} onPointerUp={endSheetDrag} />
          <h1 id="stage-f-dev-flow-title">{prompt.title}</h1>
          <div className="stage-f-dev-flow__actions">
            <button className="stage-f-dev-flow__button stage-f-dev-flow__button--primary" type="button" onClick={prompt.onAccept}>{prompt.accept}</button>
            <button className="stage-f-dev-flow__button" type="button" onClick={closeFlow}>{prompt.decline}</button>
          </div>
        </section>
      )}

      {step === 'email' && (
        <section aria-labelledby="stage-f-dev-email-title" className="stage-f-dev-flow__full">
          <div className="stage-f-dev-flow__docent-frame">{docent}</div>
          <form className="stage-f-dev-flow__form" onSubmit={submitEmail}>
            <h1 id="stage-f-dev-email-title">콘텐츠를 받아보기 위해서는<br />이메일 입력이 필요해요</h1>
            <label className="sr-only" htmlFor="stage-f-dev-email">이메일</label>
            <input autoComplete="email" id="stage-f-dev-email" inputMode="email" placeholder="이메일" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setEmailError('') }} />
            {emailError && <p role="alert">{emailError}</p>}
            <CircleButton ariaLabel="콘텐츠 발송 요청" className="stage-f-dev-flow__arrow" disabled={!email.trim()} direction="right" type="submit" />
          </form>
        </section>
      )}

      {step === 'sent' && (
        <section aria-labelledby="stage-f-dev-sent-title" className="stage-f-dev-flow__full stage-f-dev-flow__full--complete">
          <div className="stage-f-dev-flow__docent-frame">{docent}</div>
          <h1 id="stage-f-dev-sent-title">등록하신 이메일로 {product.name} 관련<br />콘텐츠를 보내드릴게요!</h1>
          <button className="stage-f-dev-flow__button" type="button" onClick={closeFlow}>다른 제품 보기 →</button>
          <button className="stage-f-dev-flow__button stage-f-dev-flow__button--primary" type="button" onClick={closeFlow}>종료하기</button>
        </section>
      )}

      {step === 'value' && (
        <section aria-labelledby="stage-f-dev-value-title" className="stage-f-dev-flow__full stage-f-dev-flow__full--value">
          {product.imageUrl && <img alt={product.name} className="stage-f-dev-flow__product" src={product.imageUrl} />}
          <h1 id="stage-f-dev-value-title">{product.name}</h1>
          <p>{getMockValueContentCopy(product.name)}</p>
          <div className="stage-f-dev-flow__actions">
            <button className="stage-f-dev-flow__button" type="button" onClick={() => setStep('staff')}>직원에게 더 물어보기</button>
            <button className="stage-f-dev-flow__button" type="button" onClick={closeFlow}>다른 제품 보기 →</button>
          </div>
        </section>
      )}

      {step === 'staff' && (
        <section aria-labelledby="stage-f-dev-staff-title" className="stage-f-dev-flow__full stage-f-dev-flow__full--complete">
          <div className="stage-f-dev-flow__docent-frame">{docent}</div>
          <h1 id="stage-f-dev-staff-title">곧 직원이 더 자세하게<br />안내해 드릴거예요!</h1>
          <p>직원에게 더 자세한 상담을 받아보세요</p>
          <button className="stage-f-dev-flow__button" type="button" onClick={closeFlow}>다른 제품 보기 →</button>
        </section>
      )}
    </div>
  )
}
