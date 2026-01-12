'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function EmailVerifiedPage() {
  const [countdown, setCountdown] = useState(5)
  const [user, setUser] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        setChecking(false)

        if (user) {
          // Si l'utilisateur est connecté, rediriger vers le dashboard après un court délai
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          // Si pas connecté, commencer le countdown pour la page de connexion
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer)
                router.push('/auth/signin?verified=true')
                return 0
              }
              return prev - 1
            })
          }, 1000)

          return () => clearInterval(timer)
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', error)
        setChecking(false)
        // En cas d'erreur, rediriger vers la connexion
        setTimeout(() => {
          router.push('/auth/signin?verified=true')
        }, 2000)
      }
    }

    checkUser()
  }, [router, supabase])

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-700/50"
        >
          <div className="px-8 py-10 sm:px-10 text-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Vérification en cours...</p>
          </div>
        </motion.div>
      </div>
    )
  }

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
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-8 h-8 text-green-400" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-extrabold text-white mb-2"
            >
              Email vérifié !
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-400 mb-8"
            >
              Votre adresse email a été confirmée avec succès.
              {user ? ' Vous êtes maintenant connecté.' : ' Vous pouvez maintenant vous connecter.'}
            </motion.p>

            {user ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30 mb-6"
              >
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirection vers votre tableau de bord...</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30 mb-6"
              >
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirection automatique vers la page de connexion dans {countdown} seconde{countdown !== 1 ? 's' : ''}...</span>
                </div>
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              onClick={() => user ? router.push('/dashboard') : router.push('/auth/signin?verified=true')}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
            >
              <span className="font-semibold">
                {user ? 'Accéder au tableau de bord' : 'Continuer vers la connexion'}
              </span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
