'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AuthLoader } from '@/components/ui/AuthLoader'

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated' | 'error'

export default function AuthVerifyPage() {
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90))
        }, 200)

        // Check current session
        const { data: { session }, error } = await supabase.auth.getSession()

        clearInterval(progressInterval)

        if (error) {
          console.error('Auth verification error:', error)
          setStatus('error')
          setProgress(100)
          setTimeout(() => router.push('/auth/signin'), 2000)
          return
        }

        if (session?.user) {
          setStatus('authenticated')
          setProgress(100)
          // Small delay to show success state
          setTimeout(() => router.push('/dashboard'), 1000)
        } else {
          setStatus('unauthenticated')
          setProgress(100)
          setTimeout(() => router.push('/auth/signin'), 2000)
        }
      } catch (error) {
        console.error('Unexpected auth error:', error)
        setStatus('error')
        setProgress(100)
        setTimeout(() => router.push('/auth/signin'), 2000)
      }
    }

    checkAuth()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthLoader
          status={status}
          progress={progress}
        />

        {/* Brand footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gazoduc Invest
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Plateforme sécurisée d&apos;investissement
          </p>
        </div>
      </div>
    </div>
  )
}
