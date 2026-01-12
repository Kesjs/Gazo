'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts'
import { useDashboardData, usePlans, useCreateDeposit, useCreateWithdrawal } from '@/hooks/useDashboardData'
import { DepositModal, WithdrawModal } from '@/components/ui'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/react-query'
import {
  User,
  TrendingUp,
  DollarSign,
  Shield,
  BarChart3,
  Lightbulb,
  Sparkles,
  Gem,
  CreditCard,
  ArrowUpRight,
  Minus,
} from 'lucide-react'
import {
  ArrowPathIcon,
  DocumentArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion'

interface Profile {
  id: string
  email: string
  full_name: string
}

interface Subscription {
  id: number
  plan_id: number
  amount: number
  start_date: string
  status: string
}

interface Transaction {
  id: number
  type: string
  amount: number
  description?: string
  created_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  // ✅ React Query : Une seule ligne pour toutes les données
  const { data: dashboardData, isLoading, error } = useDashboardData(user?.id)

  console.log('📊 Dashboard render - user:', user?.id)
  console.log('📊 Dashboard data loading:', isLoading)
  console.log('📊 Dashboard data error:', error)
  console.log('📊 Dashboard data:', dashboardData)
  const { data: plans = [] } = usePlans()
  
  // ✅ Mutations avec toasts automatiques
  const createDeposit = useCreateDeposit()
  const createWithdrawal = useCreateWithdrawal()
  
  // États locaux pour les modales uniquement
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [refreshingData, setRefreshingData] = useState(false)
  const [paymentSuccessBanner, setPaymentSuccessBanner] = useState(false)
  
  // Extraire les données du dashboard avec useMemo pour stabilité
  const profile = useMemo(() => dashboardData?.profile, [dashboardData?.profile])
  const balance = useMemo(() => dashboardData?.balance || { static: 0, dynamic: 0, total: 0 }, [dashboardData?.balance])
  const subscriptions = useMemo(() => dashboardData?.subscriptions || [], [dashboardData?.subscriptions])
  const transactions = useMemo(() => {
    const txns = dashboardData?.transactions || []
    console.log('📊 Transactions récupérées dans dashboard:', txns.length, txns)
    return txns
  }, [dashboardData?.transactions])

  // Calculer les soldes
  const investedBalance = useMemo(() => balance.static || 0, [balance])
  const evolvingBalance = useMemo(() => balance.dynamic || 0, [balance])

  // Déterminer le montant minimum pour le retrait selon les packs actifs
  const getMinimumWithdrawal = useMemo(() => {
    if (!plans || plans.length === 0) return 0;

    const activePlans = subscriptions
      .filter(s => s.status === 'active')
      .map(s => plans.find(p => p.id === s.plan_id))
      .filter(Boolean)

    // Logique pour déterminer le minimum selon les packs actifs
    // Utilise l'option 1 (25%) par défaut comme demandé, arrondie
    const minAmounts = activePlans.map(plan => {
      if (!plan) return 0
      switch (plan.min_amount) {
        case 100: return 25 // Starter
        case 225: return 50 // Premium (arrondi de 56.25)
        case 999: return 200 // Elite (arrondi de 249.75)
        case 1999: return 400 // Élite (arrondi de 499.75)
        default: return 0
      }
    })

    return Math.max(...minAmounts, 0)
  }, [subscriptions, plans])

  const minimumWithdrawal = getMinimumWithdrawal
  const canWithdraw = evolvingBalance >= minimumWithdrawal

  // Gérer le succès de paiement
  useEffect(() => {
    const paymentParam = searchParams.get('payment')
    if (paymentParam === 'success' && user?.id) {
      // Invalider le cache des données du dashboard
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(user.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions(user.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.balance(user.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(user.id) })

      // Afficher la bannière de succès persistant
      setPaymentSuccessBanner(true)

      // Afficher un message de succès temporaire
      toast.success('Paiement confirmé !', {
        description: 'Votre souscription a été activée avec succès.',
      })

      // Nettoyer l'URL
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('payment')
      const newUrl = newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''
      router.replace(`/dashboard${newUrl}`, { scroll: false })
    }
  }, [searchParams, user?.id, queryClient, router])

  // Ancienne position du hook useCachedPlans (maintenant déplacé plus haut)

  // ✅ Plus besoin de fonctions fetch manuelles !
  // React Query gère tout automatiquement

  const handleDeposit = async (amount: number, method: string) => {
    try {
      // ✅ Toast automatique dans le hook
      await createDeposit.mutateAsync({ amount, method })
      setDepositModalOpen(false)
    } catch (error) {
      // ✅ Erreur déjà gérée par le hook
      console.error('Deposit error:', error)
    }
  }

  const handleWithdraw = async (amount: number, method: string) => {
    try {
      // ✅ Toast automatique dans le hook
      await createWithdrawal.mutateAsync({ amount, method })
      setWithdrawModalOpen(false)
    } catch (error) {
      // ✅ Erreur déjà gérée par le hook
      console.error('Withdraw error:', error)
    }
  }

  const handleRefreshData = async () => {
    if (refreshingData) return // Prevent multiple clicks

    setRefreshingData(true)
    console.log('🔄 Rafraîchissement manuel du dashboard...')

    try {
      if (!user?.id) return;

      // Invalider tous les caches liés au dashboard
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(user.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions(user.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.balance(user.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions(user.id) })
      ])

      toast.success('Données mises à jour !', {
        description: 'Votre dashboard a été actualisé avec succès.',
        duration: 3000
      })

    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error)
      toast.error('Erreur de mise à jour', {
        description: 'Impossible de rafraîchir les données.',
        duration: 3000
      })
    } finally {
      setRefreshingData(false)
    }
  }

  // ✅ Loading state amélioré
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de votre dashboard...</p>
        </div>
      </div>
    )
  }

  // ✅ Error state amélioré
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg max-w-md text-center">
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="mb-4">{error.message || 'Une erreur est survenue'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          >
            Rafraîchir la page
          </button>
        </div>
      </div>
    )
  }

  // Dashboard complet pour tous les utilisateurs
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-full w-full"
    >
      <div className="w-full max-w-none">
        <div className="space-y-6 md:space-y-8">
          <div className="mb-6 md:mb-8 dashboard-header">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 px-2 text-gray-900 dark:text-white">Tableau de bord - {profile?.full_name}</h1>
                <p className="text-gray-600 dark:text-gray-400 px-2 text-sm sm:text-base">
                  Gérez vos investissements dans le GNL et suivez vos performances en temps réel
                </p>
              </div>
              <button
                onClick={handleRefreshData}
                disabled={refreshingData || isLoading}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${
                  refreshingData
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                title={refreshingData ? "Actualisation en cours..." : "Actualiser le dashboard"}
              >
                <ArrowPathIcon className={`w-5 h-5 mr-2 ${refreshingData ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {refreshingData ? 'Actualisation...' : 'Actualiser'}
                </span>
                <span className="sm:hidden">
                  {refreshingData ? '...' : '↻'}
                </span>
              </button>
            </div>
          </div>

          {/* Packs en attente d'activation - Section prioritaire */}
          {subscriptions.filter(s => s.status === 'pending_activation').length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 mb-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    ⏳ Packs en attente d&apos;activation
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {subscriptions.filter(s => s.status === 'pending_activation').length > 1
                      ? `${subscriptions.filter(s => s.status === 'pending_activation').length} packs sont en cours d'activation et seront disponibles dans 24 heures.`
                      : 'Votre pack est en cours d\'activation et sera disponible dans 24 heures.'
                    }
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subscriptions.filter(s => s.status === 'pending_activation').map(sub => {
                      const plan = plans.find(p => p.id === sub.plan_id)
                      return (
                        <div key={sub.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{plan?.name || `Pack ${sub.plan_id}`}</h4>
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-xs rounded-full border border-yellow-200 dark:border-yellow-700">
                              En attente
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Investissement: <span className="font-semibold text-green-600 dark:text-green-400">${sub.amount}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Activation dans ~{Math.max(0, Math.floor((24 * 60 * 60 * 1000 - (Date.now() - new Date(sub.start_date).getTime())) / (60 * 60 * 1000)))}h
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bannière de succès de paiement */}
          {paymentSuccessBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6 mb-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                     Paiement confirmé avec succès !
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Votre souscription a été activée et vos fonds sont maintenant disponibles dans votre portefeuille. Vous pouvez commencer à investir immédiatement.
                  </p>
                  <button
                    onClick={() => setPaymentSuccessBanner(false)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                  >
                    Compris !
                  </button>
                </div>
                <button
                  onClick={() => setPaymentSuccessBanner(false)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  title="Fermer"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Message d'encouragement pour les nouveaux utilisateurs */}
          {subscriptions.filter(s => s.status === 'active').length === 0 && subscriptions.filter(s => s.status === 'pending_activation').length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                     Bienvenue sur Gazoduc Invest !
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Vous n&apos;avez pas encore d&apos;investissement actif. Commencez dès maintenant à faire fructifier votre capital avec nos plans d&apos;investissement GNL sécurisés et rentables.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => router.push('/dashboard/investissement')}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                    >
                      <Gem className="w-4 h-4 mr-2" />
                      Découvrir nos plans
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/support')}
                      className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
                    >
                      Besoin d&apos;aide ?
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Solde Investi (Statique) */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow hover:shadow-lg dark:shadow-gray-900/20 transition-all duration-200 balance-card border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Solde Investi</h3>
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">${investedBalance.toFixed(2)}</p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4">
                Montant total investi dans vos packs actifs et en attente
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1 mb-1">
                  <Shield className="w-3 h-3" />
                  <span>Capital sécurisé</span>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {subscriptions.filter(s => s.status === 'active' || s.status === 'pending_activation').length} pack{subscriptions.filter(s => s.status === 'active' || s.status === 'pending_activation').length > 1 ? 's' : ''} actif{subscriptions.filter(s => s.status === 'active' || s.status === 'pending_activation').length > 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Solde Évolutif (Gains) */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow hover:shadow-lg dark:shadow-gray-900/20 transition-all duration-200 balance-card border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Solde Évolutif</h3>
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400 mb-1">${evolvingBalance.toFixed(2)}</p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4">
                Gains générés par vos investissements actifs
              </p>
              <div className="space-y-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Minimum retrait: ${25.00.toFixed(2)} {/* Minimum de base pour pack 1 */}
                </div>
                <button
                  onClick={() => evolvingBalance >= 25 && setWithdrawModalOpen(true)}
                  disabled={evolvingBalance < 25}
                  className={`w-full text-xs px-3 py-2 rounded-lg transition-all duration-200 ${
                    evolvingBalance >= 25
                      ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white transform hover:scale-105 shadow-sm hover:shadow-md'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {evolvingBalance >= 25 ? 'Retirer' : 'Montant insuffisant'}
                </button>
              </div>
            </div>

            {/* Souscriptions actives */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow hover:shadow-lg dark:shadow-gray-900/20 transition-all duration-200 subscriptions-active-card border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Souscriptions actives</h3>
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                  <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {subscriptions.filter(s => s.status === 'active').length}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Plans d&apos;investissement générant actuellement des revenus
              </p>
            </div>

            {/* Performance totale */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow hover:shadow-lg dark:shadow-gray-900/20 transition-all duration-200 performance-card border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Performance totale</h3>
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
                  <Lightbulb className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                ${(investedBalance + evolvingBalance).toFixed(2)}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Valeur totale de votre portefeuille
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow mb-6 md:mb-8 subscriptions-section">
            <div className="mb-4">
              <h2 className="text-lg md:text-xl font-bold mb-2 text-gray-900 dark:text-white">Mes Souscriptions</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Liste de tous vos investissements : actifs, en attente d&apos;activation et terminés
              </p>
            </div>
            {subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">Aucune souscription</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Commencez par choisir un plan d&apos;investissement ci-dessous</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {subscriptions.map(sub => {
                  const plan = plans.find(p => p.id === sub.plan_id)
                  const startDate = new Date(sub.start_date)
                  const endDate = new Date(startDate)
                  endDate.setDate(startDate.getDate() + (plan?.duration_days || 30))

                  return (
                    <div key={sub.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors min-h-[200px] flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{plan?.name || `Plan ${sub.plan_id}`}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sub.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700'
                            : sub.status === 'pending_activation'
                            ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700'
                            : sub.status === 'inactive'
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                            : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
                        }`}>
                          {sub.status === 'active' ? '✓ Actif' : sub.status === 'pending_activation' ? '⏳ En attente' : sub.status === 'inactive' ? '⏸ Inactif' : '✓ Terminé'}
                        </span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-600 dark:text-gray-400">Investissement:</span>
                          <p className="text-green-600 dark:text-green-400 font-semibold">${sub.amount}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">Début:</span>
                            <p>{startDate.toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div>
                            <span className="font-medium">Fin:</span>
                            <p>{endDate.toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                        {plan && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            <div>
                              <span className="font-medium">Profit quotidien:</span> ${plan.daily_profit}
                            </div>
                            <div>
                              <span className="font-medium">Durée:</span> {plan.duration_days} jours
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Section Transactions - Lien vers page dédiée */}
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow mb-6 md:mb-8">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Historique des Transactions
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Consultez toutes vos transactions : investissements, gains quotidiens et retraits
              </p>
              <button
                onClick={() => router.push('/dashboard/transactions')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Voir toutes les transactions
              </button>
            </div>
          </div>

          {/* Modals de paiement */}
          <DepositModal
            isOpen={depositModalOpen}
            onClose={() => setDepositModalOpen(false)}
            onDeposit={handleDeposit}
          />

          <WithdrawModal
            isOpen={withdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            onWithdraw={handleWithdraw}
            maxAmount={balance.dynamic}
            minimumAmount={25} // Minimum de base, sera ajusté selon les packs
          />
        </div>
      </div>
    </motion.div>
  )
}
