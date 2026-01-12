'use client'

import { useEffect, useState } from 'react'

interface TypingEffectProps {
  text: string
  speed?: number
}

export default function TypingEffect({ text, speed = 100 }: TypingEffectProps) {
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setShowCursor(false)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return <span>{displayText}{showCursor && '|'}</span>
}
