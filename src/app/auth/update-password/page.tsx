'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Lock, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLoadingWithDelay } from '@/hooks/useLoadingWithDelay'

// Wrapper component for useSearchParams
function UpdatePasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const { loading, startLoading, stopLoading } = useLoadingWithDelay({
    minDelay: 1200, // Délai minimum pour la mise à jour du mot de passe
  })

  useEffect(() => {
    // Vérifier si l'utilisateur a une session active
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/signin?message=Session expirée, veuillez réessayer')
      }
    }
    checkSession()
  }, [router, supabase])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    startLoading()

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setSuccess(true)

      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push('/auth/signin?message=Mot de passe mis à jour avec succès')
      }, 3000)

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.')
      await stopLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8 relative">
        <button 
          onClick={() => router.push('/auth/signin')}
          className="absolute top-6 left-6 flex items-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à la connexion
        </button>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-700/50 p-8 text-center"
        >
          <div className="space-y-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white">
                Mot de passe mis à jour !
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Votre mot de passe a été réinitialisé avec succès.
              </p>
            </div>

            <div className="pt-2">
              <p className="text-sm text-gray-400">
                Vous serez redirigé vers la page de connexion...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8 relative">
      <button 
        onClick={() => router.push('/auth/signin')}
        className="absolute top-6 left-6 flex items-center text-sm text-gray-400 hover:text-white transition-colors"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 mr-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
        Retour à la connexion
      </button>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-700/50"
      >
        <div className="px-8 py-10 sm:px-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-white">
              Nouveau mot de passe
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Entrez et confirmez votre nouveau mot de passe
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 rounded-lg block w-full pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Le mot de passe doit contenir au moins 6 caractères
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 rounded-lg block w-full pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    <span className="font-semibold">Mise à jour en cours...</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-lg animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">Mettre à jour le mot de passe</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-cyan-600/0 hover:from-blue-600/10 hover:to-cyan-600/10 rounded-lg transition-all duration-300"></div>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default function UpdatePassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-700/50 p-8">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Chargement...</p>
          </div>
        </div>
      </div>
    }>
      <UpdatePasswordForm />
    </Suspense>
  )
}
