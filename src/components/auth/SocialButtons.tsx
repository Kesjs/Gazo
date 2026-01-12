'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { FaGoogle } from 'react-icons/fa'
// import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export function SocialButtons() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })

      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  return (
    <div className="space-y-4 w-full">
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700/30"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-gray-800/50 text-xs text-gray-400">
            Ou continuer avec
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-600 hover:border-gray-500 bg-white/5 hover:bg-white/10 transition-all duration-200"
      >
        <div className="relative w-5 h-5">
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 13.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V6.07H2.18C1.43 7.55 1 9.22 1 11s.43 3.45 1.18 4.93l2.85-2.22.81-.61z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.93l3.66 2.84c.87-2.6 3.3-4.39 6.16-4.39z" fill="#EA4335"/>
          </svg>
        </div>
        <span className="text-sm font-medium text-gray-200">
          Google
        </span>
      </button>
    </div>
  )
}
