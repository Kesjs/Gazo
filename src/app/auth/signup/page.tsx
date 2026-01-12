'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Mail, Lock, User } from 'lucide-react'
import { SocialButtons } from '@/components/auth/SocialButtons'
import { motion } from 'framer-motion'
import { useLoadingWithDelay } from '@/hooks/useLoadingWithDelay'

// Wrapper component for useSearchParams
function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [errorTimestamp, setErrorTimestamp] = useState<number | null>(null)
  const [success, setSuccess] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [formErrors, setFormErrors] = useState<{email?: string, password?: string, fullName?: string}>({})
  const [formErrorsTimestamp, setFormErrorsTimestamp] = useState<number | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const { loading, startLoading, stopLoading } = useLoadingWithDelay({
    minDelay: 1200, // Délai minimum légèrement plus long pour l'inscription
  })

  // Effet pour charger l'email depuis localStorage au montage
  useEffect(() => {
    const savedEmail = localStorage.getItem('signup_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setResendEmail(savedEmail)
    }
  }, [])

  // Effet pour nettoyer les erreurs après un délai minimum
  useEffect(() => {
    if (errorTimestamp) {
      const timer = setTimeout(() => {
        setError('')
        setErrorTimestamp(null)
      }, 2500) // Garder l'erreur visible 2.5 secondes

      return () => clearTimeout(timer)
    }
  }, [errorTimestamp])

  // Effet pour nettoyer les erreurs de formulaire après un délai minimum
  useEffect(() => {
    if (formErrorsTimestamp && Object.keys(formErrors).length > 0) {
      const timer = setTimeout(() => {
        // N'effacer que si l'utilisateur a eu le temps de voir l'erreur
        const timeElapsed = Date.now() - formErrorsTimestamp
        if (timeElapsed > 2000) { // 2 secondes minimum
          setFormErrors({})
          setFormErrorsTimestamp(null)
        }
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [formErrorsTimestamp, formErrors])

  const handleResendVerification = async () => {
    const emailToUse = resendEmail || email
    if (!emailToUse || !/\S+@\S+\.\S+/.test(emailToUse)) {
      setError('Veuillez saisir une adresse email valide.')
      return
    }

    setResendLoading(true)
    setResendSuccess(false)
    setError('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToUse,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      
      setResendSuccess(true)
      setSuccess('Un nouvel email de vérification a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception.')
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue lors de l\'envoi de l\'email de vérification.')
    } finally {
      setResendLoading(false)
    }
  }

  const getErrorMessage = (error: any) => {
    const message = error?.message || ''
    
    if (message.includes('email') || message.includes('Email')) {
      setFormErrors(prev => ({ ...prev, email: 'Email invalide' }))
      setFormErrorsTimestamp(Date.now())
      return ''
    }
    
    if (message.includes('password') || message.includes('mot de passe')) {
      setFormErrors(prev => ({ ...prev, password: 'Le mot de passe doit contenir au moins 6 caractères' }))
      setFormErrorsTimestamp(Date.now())
      return ''
    }

    switch (message) {
      case 'User already registered':
        setFormErrors(prev => ({ ...prev, email: 'Un compte existe déjà avec cet email' }))
        setFormErrorsTimestamp(Date.now())
        return ''
      case 'Email rate limit exceeded':
        return 'Trop de tentatives. Veuillez réessayer plus tard.'
      default:
        return message || 'Une erreur est survenue lors de la création du compte.'
    }
  }

  const validateForm = () => {
    const errors: {email?: string, password?: string, fullName?: string} = {}
    let isValid = true

    if (!fullName.trim()) {
      errors.fullName = 'Le nom complet est requis'
      isValid = false
    }

    if (!email.trim()) {
      errors.email = 'L\'email est requis'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email invalide'
      isValid = false
    }

    if (!password.trim()) {
      errors.password = 'Le mot de passe est requis'
      isValid = false
    } else if (password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
      isValid = false
    }

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      setFormErrorsTimestamp(Date.now())
    }
    return isValid
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setErrorTimestamp(null)

    if (!validateForm()) {
      return
    }

    startLoading()

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName.trim(),
          }
        }
      })

      if (authError) {
        const errorMessage = getErrorMessage(authError)
        if (errorMessage) {
          setError(errorMessage)
          setErrorTimestamp(Date.now())
        }
        await stopLoading(false)
      } else {
        setEmailSent(true)
        setResendEmail(email.trim())
        localStorage.setItem('signup_email', email.trim())
        setSuccess('Inscription réussie ! Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception et cliquer sur le lien pour activer votre compte.')
        await stopLoading(false)
      }
    } catch (err) {
      setError('Erreur de connexion. Vérifiez votre connexion internet.')
      setErrorTimestamp(Date.now())
      await stopLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8 relative">
        <Link 
          href="/"
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
          Retour à l&apos;accueil
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-700/50"
        >
          <div className="px-8 py-10 sm:px-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-white">
                Vérifiez votre email
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Nous avons envoyé un lien de confirmation à
              </p>
              <p className="font-medium text-blue-400 break-all">{email}</p>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30 text-sm text-gray-300">
              <p>Cliquez sur le lien dans l&apos;email pour confirmer votre inscription.</p>
              <p className="mt-2">Si vous ne voyez pas l&apos;email, vérifiez votre dossier de courrier indésirable.</p>
            </div>

            {!resendEmail && (
              <div className="mt-4">
                <label htmlFor="resendEmail" className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse email pour renvoyer la vérification
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    id="resendEmail"
                    name="resendEmail"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 rounded-lg block w-full pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>
            )}
            
            <motion.button
              onClick={handleResendVerification}
              disabled={resendLoading || resendSuccess}
              whileTap={{ scale: resendLoading || resendSuccess ? 1 : 0.98 }}
              className={`w-full py-3 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all mt-6 ${
                resendLoading || resendSuccess ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {resendLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Envoi en cours...
                </span>
              ) : resendSuccess ? (
                'Email renvoyé !'
              ) : (
                'Renvoyer l\'email de vérification'
              )}
            </motion.button>

            <div className="pt-4 mt-6 border-t border-gray-700/50">
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour à la connexion
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8 relative">
      <button 
        onClick={() => router.push('/')}
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
        Retour à l&apos;accueil
      </button>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-700/50"
      >
        <div className="px-8 py-10 sm:px-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-white">
              Créer un compte
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Déjà un compte ?{' '}
              <button
                onClick={() => router.push('/auth/signin')}
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                Se connecter
              </button>
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                Nom complet
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`bg-gray-700/50 border ${
                    formErrors.fullName ? 'border-red-500' : 'border-gray-600'
                  } text-white placeholder-gray-400 rounded-lg block w-full pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="Jean Dupont"
                />
              </div>
              {formErrors.fullName && (
                <p className="mt-1 text-sm text-red-400">{formErrors.fullName}</p>
              )}
            </div>

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
                  className={`bg-gray-700/50 border ${
                    formErrors.email ? 'border-red-500' : 'border-gray-600'
                  } text-white placeholder-gray-400 rounded-lg block w-full pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="votre@email.com"
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Mot de passe
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
                  className={`bg-gray-700/50 border ${
                    formErrors.password ? 'border-red-500' : 'border-gray-600'
                  } text-white placeholder-gray-400 rounded-lg block w-full pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                />
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
              )}
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
                    <span className="font-semibold">Inscription en cours...</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-lg animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">S&apos;inscrire</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-cyan-600/0 hover:from-blue-600/10 hover:to-cyan-600/10 rounded-lg transition-all duration-300"></div>
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-8">
            <SocialButtons />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function SignUp() {
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
      <SignUpForm />
    </Suspense>
  )
}
