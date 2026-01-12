// src/app/dashboard/packs/payment/[sessionId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts'
import { PaymentWaitingScreen } from '@/components/payment/PaymentWaitingScreen'
import { createClient } from '@/lib/supabase'

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

export default function PaymentWaitingPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<PaymentSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Vérifier la session de paiement au chargement
  useEffect(() => {
    if (!user || !sessionId) return

    const checkSession = async (retryCount = 0) => {
      try {
        const supabase = createClient()

        // Récupérer la session de paiement
        const { data: sessionData, error: sessionError } = await supabase
          .from('payment_sessions')
          .select('*')
          .eq('session_id', sessionId)
          .eq('user_id', user.id)
          .single()

        if (sessionError || !sessionData) {
          // Retry up to 3 times with 1 second delay
          if (retryCount < 3) {
            setTimeout(() => checkSession(retryCount + 1), 1000)
            return
          }
          setError('Session de paiement introuvable ou expirée')
          setLoading(false)
          return
        }

        // Vérifier si la session n'est pas expirée
        const expiresAt = new Date(sessionData.expires_at)
        const now = new Date()

        if (now > expiresAt) {
          setError('Cette session de paiement a expiré')
          setLoading(false)
          return
        }

        // Vérifier si la session n'est pas déjà complétée
        if (sessionData.status === 'completed') {
          // Rediriger vers le dashboard avec succès
          router.push('/dashboard?payment=success')
          return
        }

        setSession(sessionData)
        setLoading(false)

      } catch (err) {
        console.error('Erreur vérification session:', err)
        setError('Erreur lors de la vérification de la session')
        setLoading(false)
      }
    }

    checkSession()
  }, [user, sessionId, router])

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification de votre session de paiement...</p>
        </div>
      </div>
    )
  }

  // Erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Session invalide
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => router.push('/dashboard/packs')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Retour aux packs
          </button>
        </div>
      </div>
    )
  }

  // Session valide - afficher l'écran d'attente
  if (session) {
    return <PaymentWaitingScreen session={session} />
  }

  return null
}
