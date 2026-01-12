import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

interface ClickFeedbackProps {
  isLoading?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'purple'
}

export function ClickFeedback({
  isLoading = false,
  size = 'md',
  color = 'blue'
}: ClickFeedbackProps) {
  if (!isLoading) return null

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: 1, rotate: 360 }}
      transition={{
        opacity: { duration: 0.1 },
        rotate: { duration: 0.3, repeat: Infinity, ease: "linear" }
      }}
      className="flex items-center justify-center"
    >
      <ArrowPathIcon className={`${sizeClasses[size]} ${colorClasses[color]}`} />
    </motion.div>
  )
}

// Hook pour gérer le feedback de clic
export function useClickFeedback() {
  const [isLoading, setIsLoading] = useState(false)

  const startFeedback = () => setIsLoading(true)

  const stopFeedback = () => setIsLoading(false)

  const withFeedback = async (action: () => Promise<void> | void, delay = 150) => {
    startFeedback()

    setTimeout(async () => {
      try {
        await action()
      } finally {
        setTimeout(stopFeedback, 200)
      }
    }, delay)
  }

  return { isLoading, startFeedback, stopFeedback, withFeedback }
}
