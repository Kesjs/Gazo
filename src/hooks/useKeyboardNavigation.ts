'use client'

import { useEffect, useCallback } from 'react'

export function useKeyboardNavigation(
  isOpen: boolean,
  onClose: () => void,
  containerRef?: React.RefObject<HTMLElement>
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return

    // Fermer avec Escape
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    // Navigation au clavier dans la sidebar
    if (containerRef?.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const focusableArray = Array.from(focusableElements) as HTMLElement[]

      const currentIndex = focusableArray.indexOf(document.activeElement as HTMLElement)

      if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey)) {
        event.preventDefault()
        const nextIndex = (currentIndex + 1) % focusableArray.length
        focusableArray[nextIndex]?.focus()
      } else if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
        event.preventDefault()
        const prevIndex = currentIndex <= 0 ? focusableArray.length - 1 : currentIndex - 1
        focusableArray[prevIndex]?.focus()
      }
    }
  }, [isOpen, onClose, containerRef])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Focus sur le premier élément focusable quand la sidebar s'ouvre
      setTimeout(() => {
        if (containerRef?.current) {
          const firstFocusable = containerRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement
          firstFocusable?.focus()
        }
      }, 100)
    } else {
      document.removeEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown, containerRef])
}
