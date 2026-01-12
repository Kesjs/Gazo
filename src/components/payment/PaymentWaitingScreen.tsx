// src/components/payment/PaymentWaitingScreen.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Loader2, Wallet, Shield, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentSession {
  session_id: string
  user_id: string
  plan_id: number
  payment_address: string
  amount: number
  status: 'active' | 'completed' | 'expired'
  expires_at: string
  created_at: string
}

interface PaymentWaitingScreenProps {
  session: PaymentSession
}

type PaymentStatus = 'waiting' | 'confirmed' | 'expired' | 'cancelled'

export function PaymentWaitingScreen({ session }: PaymentWaitingScreenProps) {
  const router = useRouter()
  const [status, setStatus] = useState<PaymentStatus>('waiting')
  const [timeLeft, setTimeLeft] = useState<number>(300) // 5 minutes en secondes
  const [checkingPayment, setCheckingPayment] = useState(false)

  // Calculer le temps restant
  useEffect(() => {
    const expiresAt = new Date(session.expires_at)
    const now = new Date()
    const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
    setTimeLeft(remaining)
  }, [session.expires_at])

  // Compte à rebours
  useEffect(() => {
    if (status !== 'waiting') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setStatus('expired')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status])

  // Vérification périodique du paiement
  const checkPaymentStatus = useCallback(async () => {
    if (status !== 'waiting') return

    setCheckingPayment(true)
    try {
      // Vérifier si la session a été marquée comme complétée
      const response = await fetch(`/api/payments/session/${session.session_id}/status`)
      const data = await response.json()

      if (data.status === 'completed') {
        setStatus('confirmed')
        toast.success('Paiement confirmé !', {
          description: 'Votre souscription a été créée avec succès.'
        })
        // Redirection après 3 secondes
        setTimeout(() => {
          router.push('/dashboard?payment=success')
        }, 3000)
      }
    } catch (error) {
      console.error('Erreur vérification paiement:', error)
    } finally {
      setCheckingPayment(false)
    }
  }, [session.session_id, status, router])

  // Vérifier le paiement toutes les 10 secondes
  useEffect(() => {
    if (status !== 'waiting') return

    const interval = setInterval(checkPaymentStatus, 10000)
    return () => clearInterval(interval)
  }, [checkPaymentStatus, status])

  // Vérification initiale
  useEffect(() => {
    checkPaymentStatus()
  }, [checkPaymentStatus])

  // Formater le temps restant
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Gestion de l'annulation
  const handleCancel = () => {
    setStatus('cancelled')
    toast.info('Paiement annulé', {
      description: 'Vous pouvez recommencer le processus à tout moment.'
    })
    setTimeout(() => {
      router.push('/dashboard/packs')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-900/20 dark:via-gray-900 dark:to-red-900/20 transition-colors duration-500 relative">
      {/* Décompte en haut à droite */}
      <div className="absolute top-8 right-8 z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border-2 border-red-200 dark:border-red-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="w-8 h-8 text-red-600 dark:text-red-400" />
              <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                Temps restant
              </span>
            </div>

            <div className="text-6xl font-bold text-red-600 dark:text-red-400 mb-3 font-mono">
              {formatTime(timeLeft)}
            </div>

            <div className="w-32 mx-auto mb-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 300) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round((timeLeft / 300) * 100)}% restant
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-2xl">
          {/* Header avec sécurité */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
              <span className="text-2xl font-semibold text-red-700 dark:text-red-300">Connexion sécurisée</span>
            </div>

            <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              En attente de paiement
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Envoyez <span className="font-bold text-red-600 dark:text-red-400">{session.amount}€</span> en USDT (TRC20)
            </p>
          </div>

          {/* Loader central rouge */}
          <div className="mb-12">
            {checkingPayment ? (
              <div className="space-y-6">
                <Loader2 className="w-20 h-20 animate-spin text-red-600 dark:text-red-400 mx-auto" />
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Vérification du paiement...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Nous vérifions votre transaction sur la blockchain
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <Loader2 className="w-20 h-20 animate-spin text-red-600 dark:text-red-400 mx-auto" />
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    En attente de votre paiement
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Votre transaction sera détectée automatiquement
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Adresse de paiement */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-8 border-2 border-dashed border-red-300 dark:border-red-600">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-red-600 dark:text-red-400" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Adresse USDT (TRC20)
              </span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="font-mono text-lg text-gray-900 dark:text-white break-all leading-relaxed">
                {session.payment_address}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-4">
                  Instructions importantes
                </h3>
                <div className="space-y-3 text-red-800 dark:text-red-200">
                  <div className="flex items-start gap-3">
                    <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                    <p>Ouvrez votre wallet TRON (TronLink, Trust Wallet, ou tout wallet compatible TRC20)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                    <p>Envoyez <strong>exactement {session.amount}€</strong> en USDT à l&apos;adresse ci-dessus</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                    <p>Utilisez <strong>uniquement le réseau TRC20</strong> (pas ERC20, BEP20, etc.)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                    <p>Le paiement sera détecté automatiquement - restez sur cette page</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton annuler */}
          <button
            onClick={handleCancel}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-4 px-8 rounded-xl transition-all duration-200 hover:shadow-lg"
          >
            Annuler le paiement
          </button>
        </div>
      </div>

      {/* États confirmés/expirés/annulés */}
      <AnimatePresence>
        {status === 'confirmed' && (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center max-w-md mx-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </motion.div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Paiement confirmé ! 🎉
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Votre souscription de {session.amount}€ a été créée avec succès.
              </p>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Redirection vers votre dashboard...
              </div>
            </div>
          </motion.div>
        )}

        {(status === 'expired' || status === 'cancelled') && (
          <motion.div
            key="expired"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center max-w-md mx-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </motion.div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {status === 'expired' ? 'Temps écoulé' : 'Paiement annulé'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {status === 'expired'
                  ? 'Le délai de 5 minutes pour effectuer le paiement est écoulé.'
                  : 'Le paiement a été annulé.'
                }
              </p>

              <button
                onClick={() => router.push('/dashboard/packs')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Recommencer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
