'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLoadingWithDelay } from '@/hooks/useLoadingWithDelay'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { loading, startLoading, stopLoading } = useLoadingWithDelay({
    minDelay: 1000, // Délai minimum pour l'envoi d'email
  })

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Veuillez entrer votre adresse email')
      return
    }

    startLoading()

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) throw error

      setSuccess(true)
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
            <div>
              <h2 className="text-2xl font-bold text-white">
                Vérifiez votre boîte mail
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Nous avons envoyé un lien de réinitialisation à
              </p>
              <p className="font-medium text-blue-400 break-all mt-1">{email}</p>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30 text-sm text-gray-300">
              <p>Cliquez sur le lien dans l&apos;email pour réinitialiser votre mot de passe.</p>
              <p className="mt-2">Si vous ne voyez pas l&apos;email, vérifiez votre dossier de courrier indésirable.</p>
            </div>

            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full mt-6 py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Retour à la connexion
            </button>
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
              Mot de passe oublié
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Entrez votre adresse email pour réinitialiser votre mot de passe
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 rounded-lg block w-full pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="votre@email.com"
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
                    <span className="font-semibold">Envoi en cours...</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-lg animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">Réinitialiser le mot de passe</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-cyan-600/0 hover:from-blue-600/10 hover:to-cyan-600/10 rounded-lg transition-all duration-300"></div>
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <button 
              onClick={() => router.push('/auth/signin')}
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
