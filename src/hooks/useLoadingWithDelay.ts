import { useState, useCallback } from 'react'

interface UseLoadingWithDelayOptions {
  minDelay?: number
  onSuccess?: () => void
}

export function useLoadingWithDelay(options: UseLoadingWithDelayOptions = {}) {
  const { minDelay = 800, onSuccess } = options
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  const startLoading = useCallback(() => {
    setLoading(true)
    setStartTime(Date.now())
  }, [])

  const stopLoading = useCallback(async (isSuccess: boolean = false) => {
    if (isSuccess) {
      // Pour le succès, on garde le loading actif indéfiniment
      // La redirection se fera avant que le composant ne se démonte
      if (onSuccess) {
        onSuccess()
      }
      return
    }

    // Pour les erreurs, on applique le délai minimum puis on arrête le loading
    const elapsed = startTime ? Date.now() - startTime : 0
    const remainingDelay = Math.max(0, minDelay - elapsed)

    if (remainingDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingDelay))
    }

    setLoading(false)
    setStartTime(null)
  }, [startTime, minDelay, onSuccess])

  return {
    loading,
    startLoading,
    stopLoading
  }
}
