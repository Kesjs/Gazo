'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts';
import { createClient } from '@/lib/supabase';
import { usePlans, useSubscriptions, useBalance, useCreateSubscription } from '@/hooks/useDashboardData';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WithdrawModal } from '@/components/dashboard/WithdrawModal';
import { Progress } from '@/components/ui/progress';
import {
  ChartBarIcon,
  ClockIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  StarIcon,
  SparklesIcon,
  BoltIcon,
  LightBulbIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

interface Plan {
  id: number;
  name: string;
  description: string;
  min_amount: number;
  daily_profit: number;
  duration_days: number;
  features: string[];
  color: string;
  icon: React.ComponentType<any>;
  popular?: boolean;
  badge?: string;
  gradient: string;
  hoverBg: string;
  iconColor: string;
}

interface Subscription {
  id: string;
  plan_id: number;
  amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: (i: number) => ({
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    })
  }
};

const plans: Plan[] = [
  {
    id: 1,
    name: 'Starter GNL',
    description: 'Parfait pour débuter',
    min_amount: 100,
    daily_profit: 1.5,
    duration_days: 90,
    badge: 'Parfait pour débuter',
    icon: BoltIcon,
    color: 'bg-blue-500',
    iconColor: 'text-blue-400',
    gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-400/10',
    hoverBg: 'hover:bg-blue-500/10',
    features: [
      'Retour sur investissement garanti',
      'Support prioritaire',
      'Accès à la plateforme',
      'Rapports mensuels'
    ]
  },
  {
    id: 2,
    name: 'Premium GNL',
    description: 'Investissement équilibré',
    min_amount: 225,
    daily_profit: 2.0,
    duration_days: 120,
    badge: 'Investissement équilibré',
    icon: ChartBarIcon,
    color: 'bg-emerald-500',
    popular: true,
    iconColor: 'text-emerald-400',
    gradient: 'bg-gradient-to-br from-emerald-500/20 to-teal-400/10',
    hoverBg: 'hover:bg-emerald-500/10',
    features: [
      'Tout dans Starter, plus:',
      'Retour sur investissement supérieur',
      'Support 24/7',
      'Analyse personnalisée',
      'Rapports hebdomadaires'
    ]
  },
  {
    id: 3,
    name: 'Elite GNL',
    description: 'Investisseur avancé',
    min_amount: 999,
    daily_profit: 2.5,
    duration_days: 180,
    badge: 'Investisseur avancé',
    icon: CubeIcon,
    color: 'bg-purple-500',
    iconColor: 'text-purple-400',
    gradient: 'bg-gradient-to-br from-purple-600/20 to-indigo-500/10',
    hoverBg: 'hover:bg-purple-500/10',
    features: [
      'Tout dans Premium, plus:',
      'Gestion de portefeuille personnalisée',
      'Rencontres trimestrielles',
      'Accès anticipé aux opportunités',
      'Rapports détaillés',
      'Assistance VIP dédiée'
    ]
  },
  {
    id: 4,
    name: 'Élite GNL',
    description: 'Investisseur professionnel',
    min_amount: 1999,
    daily_profit: 3.0,
    duration_days: 365,
    badge: 'Investisseur professionnel',
    icon: SparklesIcon,
    color: 'bg-orange-500',
    iconColor: 'text-orange-400',
    gradient: 'bg-gradient-to-br from-amber-500/20 to-orange-500/10',
    hoverBg: 'hover:bg-orange-500/10',
    features: [
      'Tout dans Elite, plus:',
      'Stratégie d\'investissement sur mesure',
      'Rencontres mensuelles',
      'Accès exclusif aux opportunités',
      'Rapports personnalisés',
      'Conseiller personnel dédié',
      'Invitations aux événements VIP'
    ]
  }
];

export default function PacksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Hooks pour les données
  const { data: userSubscriptions = [], isLoading: subscriptionsLoading } = useSubscriptions(user?.id);
  const { data: userBalance = 0, isLoading: balanceLoading } = useBalance(user?.id);
  const createSubscription = useCreateSubscription();

  // Calculer les abonnements actifs
  const activeSubscriptions = userSubscriptions.filter(sub => sub.status === 'active');

  // Gérer la souscription avec paiement USDT
  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      toast.error('Erreur', { description: 'Vous devez être connecté pour investir' });
      return;
    }

    try {
      // Créer une session de paiement pour cet utilisateur et ce plan
      const response = await fetch('/api/payments/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id })
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la préparation du paiement');
        return;
      }

      const sessionData = await response.json();
      setSessionData(sessionData);

      setSelectedPlan(plan);

      // Fermer le modal actuel et ouvrir le modal de paiement USDT
      setShowPaymentModal(true);

    } catch (error) {
      console.error('Erreur création session paiement:', error);
      toast.error('Erreur lors de la préparation du paiement');
    }
  };

  // Gérer l'ouverture du modal
  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setInvestmentAmount(plan.min_amount.toString());
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="min-h-full w-full flex items-center justify-center"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
          <p className="text-muted-foreground">Vous devez être connecté pour accéder aux packs d&apos;investissement.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-full w-full"
    >
      <div className="w-full max-w-none">
        <div className="space-y-6 md:space-y-8">
          {/* En-tête */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Mes Packs d&apos;Investissement</h1>
              <p className="text-muted-foreground mt-1">
                Choisissez le pack qui correspond à votre stratégie d&apos;investissement
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-card border rounded-lg px-3 py-2">
                <span className="text-muted-foreground">Solde disponible:</span>
                <span className="font-semibold ml-2 text-green-600">
                  {balanceLoading ? '...' : `${userBalance.toFixed(2)}€`}
                </span>
              </div>
            </div>
          </div>

          {/* Abonnements actifs */}
          {activeSubscriptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                Vos Investissements Actifs
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeSubscriptions.map((subscription) => {
                  const plan = plans.find(p => p.id === subscription.plan_id);
                  if (!plan) return null;

                  const startDate = new Date(subscription.start_date);
                  const endDate = new Date(subscription.end_date);
                  const now = new Date();
                  const progress = Math.min(100, Math.max(0,
                    ((now.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100
                  ));

                  return (
                    <Card key={subscription.id} className="border-green-200 dark:border-green-800">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Actif
                          </Badge>
                        </div>
                        <CardDescription>
                          Investissement: {subscription.amount}€
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progression</span>
                              <span>{progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Profit journalier</span>
                            <span className="font-semibold text-green-600">
                              +{(subscription.amount * plan.daily_profit / 100).toFixed(2)}€
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Packs disponibles */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Packs Disponibles</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  custom={index}
                  className="group"
                >
                  <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${plan.gradient} border-2 ${plan.popular ? 'border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-200 dark:ring-emerald-800' : 'border-border hover:border-primary/50'}`}>
                    {plan.popular && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                          <StarIcon className="w-3 h-3 mr-1" />
                          Populaire
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${plan.color} ${plan.iconColor}`}>
                          <plan.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{plan.name}</CardTitle>
                          <CardDescription className="text-sm">{plan.description}</CardDescription>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">À partir de</span>
                          <span className="text-4xl font-bold text-primary">{plan.min_amount}€</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ClockIcon className="w-4 h-4" />
                          <span>{plan.duration_days} jours</span>
                          <span>•</span>
                          <span>+{plan.daily_profit}% / jour</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <SparklesIcon className="w-4 h-4" />
                          Avantages inclus
                        </h4>
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-muted-foreground">Retour estimé</span>
                          <span className="font-semibold text-green-600">
                            +{(plan.min_amount * plan.daily_profit * plan.duration_days / 100).toFixed(2)}€
                          </span>
                        </div>
                        <Button
                          onClick={() => handlePlanSelect(plan)}
                          className="w-full group-hover:scale-105 transition-transform duration-200"
                          disabled={createSubscription.isPending}
                        >
                          {createSubscription.isPending ? 'Traitement...' : 'Investir maintenant'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de paiement USDT */}
      {showPaymentModal && selectedPlan && sessionData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Souscription - {selectedPlan.name}
                </h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPlan(null);
                    setSessionData(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Récapitulatif du pack */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlan.min_amount} EUR</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Investissement</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{selectedPlan.daily_profit}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Par jour</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{selectedPlan.duration_days}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Jours</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      +{((selectedPlan.min_amount * selectedPlan.daily_profit * selectedPlan.duration_days) / 100).toFixed(0)} EUR
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Gain estimé</div>
                  </div>
                </div>
              </div>

              {/* Sélection automatique USDT TRC20 */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">Paiement en USDT (TRC20)</h3>

                <div className="flex justify-center">
                  {/* Tether USDT TRC20 - Sélectionné automatiquement */}
                  <div className="flex items-center p-6 border-2 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="relative w-16 h-16 mr-6">
                      <Image
                        src="https://th.bing.com/th/id/R.6cd272d6637fa8f3d2e59d7dba789e69?rik=1ff2pq%2b9yfPodQ&riu=http%3a%2f%2fusdtpiggybank.com%2fimages%2fusdt_logo.png&ehk=PTFeI45LUsBAzaWI8EYmS8RyN8%2bbCoEuGWtJ9qz3q%2bM%3d&risl=&pid=ImgRaw&r=0"
                        alt="Logo Tether USDT"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-lg">Tether (USDT)</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Réseau TRC20 - Stablecoin</div>
                    </div>
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center" aria-hidden="true">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Affichage de l'adresse USDT */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Adresse USDT (TRC20) :
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border font-mono text-sm break-all">
                    {sessionData.paymentAddress || '0x63eF5b765D8d408274172804D31fB0a2Ea5416c0'}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Envoyez exactement {selectedPlan.min_amount}€ en USDT (TRC20) à cette adresse depuis votre wallet.
                    Votre pack sera activé automatiquement après confirmation de la transaction sur la blockchain.
                  </p>
                </div>

                {/* Conditions générales */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      className="mt-1 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <label htmlFor="acceptTerms" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        J&apos;accepte les{' '}
                        <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
                          conditions générales d&apos;utilisation
                        </a>
                        {' '}et la{' '}
                        <a href="/politique-confidentialite" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
                          politique de confidentialité
                        </a>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton de paiement */}
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPlan(null);
                    setSessionData(null);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => {
                    const acceptTermsCheckbox = document.getElementById('acceptTerms') as HTMLInputElement;
                    if (!acceptTermsCheckbox?.checked) {
                      toast.error('Conditions non acceptées', {
                        description: 'Veuillez accepter les conditions générales pour continuer.'
                      });
                      return;
                    }

                    // Activer l'état de redirection
                    setIsRedirecting(true);

                    // Rediriger vers la page d'attente de paiement
                    toast.success('Session de paiement créée !', {
                      description: `Vous allez être redirigé vers la page de paiement sécurisée.`,
                      duration: 3000
                    });

                    // Fermer la modale et rediriger
                    setShowPaymentModal(false);

                    // Redirection vers la page d'attente
                    setTimeout(() => {
                      router.push(`/dashboard/packs/payment/${sessionData.session_id}`)
                      setSelectedPlan(null);
                      setSessionData(null);
                      setIsRedirecting(false); // Au cas où
                    }, 1500);
                  }}
                  disabled={isRedirecting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  {isRedirecting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Paiement en cours...</span>
                    </div>
                  ) : (
                    `Payer ${selectedPlan.min_amount}€`
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
