import { gsap } from 'gsap'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import './TextType.css'

type TextTypeProps = {
  className?: string
  cursorBlinkDuration?: number
  cursorCharacter?: string
  cursorClassName?: string
  initialDelay?: number
  loop?: boolean
  onSentenceComplete?: (text: string, index: number) => void
  pauseDuration?: number
  showCursor?: boolean
  text: string | readonly string[]
  textColors?: readonly string[]
  typingSpeed?: number
}

/** React Bits TextType의 CSS 판본을 이 앱의 TypeScript 경계에 맞춘 구현. */
export default function TextType({
  className = '',
  cursorBlinkDuration = 0.5,
  cursorCharacter = '|',
  cursorClassName = '',
  initialDelay = 0,
  loop = true,
  onSentenceComplete,
  pauseDuration = 2_000,
  showCursor = true,
  text,
  textColors = [],
  typingSpeed = 50,
}: TextTypeProps) {
  const shouldReduceMotion = useReducedMotion()
  const cursorRef = useRef<HTMLSpanElement>(null)
  const completedTextIndexRef = useRef<number | null>(null)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const textArray = useMemo(() => Array.isArray(text) ? text : [text], [text])
  const currentText = textArray[currentTextIndex] ?? ''

  useLayoutEffect(() => {
    completedTextIndexRef.current = null
    setCurrentTextIndex(0)
    setDisplayedText('')
    setIsDeleting(false)
  }, [textArray])

  useEffect(() => {
    if (!showCursor || shouldReduceMotion || !cursorRef.current) return

    const tween = gsap.to(cursorRef.current, {
      duration: cursorBlinkDuration,
      ease: 'power2.inOut',
      opacity: 0,
      repeat: -1,
      yoyo: true,
    })

    return () => { tween.kill() }
  }, [cursorBlinkDuration, shouldReduceMotion, showCursor])

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayedText(currentText)
      return
    }

    let timer: ReturnType<typeof window.setTimeout> | undefined

    if (isDeleting) {
      if (displayedText.length === 0) {
        setIsDeleting(false)
        setCurrentTextIndex((index) => (index + 1) % textArray.length)
      } else {
        timer = window.setTimeout(() => setDisplayedText((value) => value.slice(0, -1)), typingSpeed * 0.6)
      }
      return () => { if (timer) window.clearTimeout(timer) }
    }

    if (displayedText.length < currentText.length) {
      timer = window.setTimeout(
        () => setDisplayedText(currentText.slice(0, displayedText.length + 1)),
        displayedText.length === 0 ? initialDelay + typingSpeed : typingSpeed,
      )
      return () => { if (timer) window.clearTimeout(timer) }
    }

    if (completedTextIndexRef.current !== currentTextIndex) {
      completedTextIndexRef.current = currentTextIndex
      onSentenceComplete?.(currentText, currentTextIndex)
    }

    if (loop) {
      timer = window.setTimeout(() => setIsDeleting(true), pauseDuration)
    }

    return () => { if (timer) window.clearTimeout(timer) }
  }, [currentText, currentTextIndex, displayedText, initialDelay, isDeleting, loop, onSentenceComplete, pauseDuration, shouldReduceMotion, textArray.length, typingSpeed])

  const color = textColors.length === 0 ? 'inherit' : textColors[currentTextIndex % textColors.length]

  return (
    <div className={`text-type ${className}`}>
      <span className="text-type__content" style={{ color }}>{displayedText}</span>
      {showCursor && !shouldReduceMotion && (loop || isDeleting || displayedText.length < currentText.length) && (
        <span className={`text-type__cursor ${cursorClassName}`}>{cursorCharacter}</span>
      )}
    </div>
  )
}
