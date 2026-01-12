'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts';
import { createClient } from '@/lib/supabase';
import { usePlans, useSubscriptions, useCreateSubscription } from '@/hooks/useDashboardData';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  CubeIcon,
  BarChart3,
//   TrendingUp,
//   Zap,
//   Award,
//   Flame
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
    iconColor: 'text-blue-600',
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
    iconColor: 'text-emerald-600',
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
    iconColor: 'text-purple-600',
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
    iconColor: 'text-orange-600',
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

export default function InvestissementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);

  // Hooks pour les données
  const { data: userSubscriptions = [], isLoading: subscriptionsLoading } = useSubscriptions(user?.id);
  const createSubscription = useCreateSubscription();

  // Calculer les abonnements actifs
  const activeSubscriptions = userSubscriptions.filter(sub => sub.status === 'active');

  // Gérer la souscription avec paiement USDT
  const handleSubscribe = async (plan: Plan) => {
    if (loadingPlanId !== null) return; // Prevent multiple clicks

    setLoadingPlanId(plan.id);
    console.log('🚀 Démarrage souscription pour plan:', plan.id, 'montant:', plan.min_amount);

    try {
      console.log('📡 Appel API /api/subscribe...');

      // Créer la session de paiement directement via fetch
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, amount: plan.min_amount }),
      });

      console.log('📡 Réponse API reçue, status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API response:', errorText);
        let errorMessage = 'Erreur lors de la création de la session de paiement';

        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        } catch (parseError) {
          console.error('❌ Impossible de parser l\'erreur JSON:', parseError);
        }

        throw new Error(errorMessage);
      }

      const sessionData = await response.json();
      console.log('📦 Données session reçues:', sessionData);

      if (!sessionData.sessionId) {
        throw new Error('Session ID manquant dans la réponse');
      }

      // Rediriger directement vers la page de paiement complète
      console.log('🔄 Redirection vers la page de paiement:', sessionData.sessionId);
      console.log('🔄 URL cible:', `/dashboard/payment/${sessionData.sessionId}`);
      router.push(`/dashboard/payment/${sessionData.sessionId}`);

    } catch (error) {
      console.error('❌ Erreur lors de la souscription:', error);
      toast.error('Erreur lors de la préparation du paiement', {
        description: error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite',
        duration: 5000,
      });
    } finally {
      setLoadingPlanId(null);
    }
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
          <p className="text-muted-foreground">Vous devez être connecté pour accéder aux investissements.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="min-h-full w-full"
      >
        <div className="w-full max-w-none">

          <div className="space-y-6 md:space-y-8">

            {/* En-tête avec texte d'invitation */}
            <div className="text-center mb-16">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                {/* <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-300 bg-blue-300/10 rounded-full mb-4">
                  Nos offres d&apos;investissement
                </span> */}
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Choisissez votre plan d&apos;investissement
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                  Investissez intelligemment avec nos packs GNL et générez des revenus passifs garantis.
                </p>
              </motion.div>
            </div>

            {/* Navigation Tabs */}
            <Tabs defaultValue="investir" className="w-full mb-8">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="investir" className="text-sm font-medium">
                  Investir maintenant
                </TabsTrigger>
                <TabsTrigger value="mes-investissements" className="text-sm font-medium">
                  Mes investissements
                </TabsTrigger>
              </TabsList>

              {/* Onglet Investir maintenant */}
              <TabsContent value="investir" className="space-y-6">
                {/* Packs disponibles - Style PricingSection */}
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
                        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${plan.gradient} border-2 ${plan.popular ? 'border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-200/50 dark:ring-emerald-600/30 shadow-emerald-500/20 dark:shadow-emerald-500/10' : 'border-gray-300 dark:border-gray-600 hover:border-primary/60 dark:hover:border-primary/70 ring-1 ring-gray-200/30 dark:ring-gray-500/20 hover:ring-primary/30 dark:hover:ring-primary/40'}`}>
                          <CardHeader className="pb-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`p-3 rounded-xl bg-white/95 dark:bg-gray-700/95 shadow-lg backdrop-blur-sm ${plan.iconColor} ring-2 ring-gray-200/50 dark:ring-gray-500/30 border border-gray-200/30 dark:border-gray-600/30`}>
                                <plan.icon className="w-8 h-8 drop-shadow-sm" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                    {plan.name}
                                  </CardTitle>
                                  {plan.popular && (
                                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-2 py-1 font-semibold">
                                      <StarIcon className="w-3 h-3 mr-1" />
                                      Populaire
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                                  {plan.description}
                                </CardDescription>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-light text-gray-600 dark:text-gray-400">À partir de</span>
                                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                  {plan.min_amount}€
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <ClockIcon className="w-4 h-4 text-blue-500" />
                                <span className="font-medium">{plan.duration_days} jours</span>
                                <span className="text-gray-400 dark:text-gray-500">•</span>
                                <span className="font-medium text-green-600 dark:text-green-400">+{plan.daily_profit}% / jour</span>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-bold mb-4 flex items-center gap-2 text-base text-gray-900 dark:text-white">
                                <SparklesIcon className="w-4 h-4 text-yellow-500" />
                                Avantages inclus
                              </h4>
                              <ul className="space-y-3">
                                {plan.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                                    <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="flex-1">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-4">
                              <div className="flex items-center justify-between text-sm mb-4 pb-3 border-b border-gray-300 dark:border-gray-500">
                                <span className="text-muted-foreground font-medium">Retour estimé</span>
                                <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                                  +{(plan.min_amount * plan.daily_profit * plan.duration_days / 100).toFixed(2)}€
                                </span>
                              </div>
                              <div className="relative">
                                <Button
                                  onClick={() => handleSubscribe(plan)}
                                  disabled={loadingPlanId === plan.id}
                                  className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition-all duration-500 ease-out transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                                    plan.id === 1 ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white' :
                                    plan.id === 2 ? 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white' :
                                    plan.id === 3 ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white' :
                                    'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white'
                                  }`}
                                >
                                  {loadingPlanId === plan.id ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      <span className="font-semibold">Traitement...</span>
                                    </div>
                                  ) : (
                                    <span className="font-semibold">Souscrire</span>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
              </TabsContent>

              {/* Onglet Mes investissements */}
              <TabsContent value="mes-investissements" className="space-y-6">
                {/* Packs en attente d'activation */}
                {userSubscriptions.filter(s => s.status === 'pending_activation').length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6"
                  >
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-yellow-600" />
                      Packs en attente d&apos;activation
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {userSubscriptions.filter(s => s.status === 'pending_activation').length > 1
                        ? `${userSubscriptions.filter(s => s.status === 'pending_activation').length} packs sont en cours d'activation et seront disponibles dans 24 heures.`
                        : 'Votre pack est en cours d\'activation et sera disponible dans 24 heures.'
                      }
                    </p>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {userSubscriptions.filter(s => s.status === 'pending_activation').map((subscription) => {
                        const plan = plans.find(p => p.id === subscription.plan_id);
                        return (
                          <Card key={subscription.id} className="border-yellow-200 dark:border-yellow-700">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{plan?.name || `Pack ${subscription.plan_id}`}</CardTitle>
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  ⏳ En attente
                                </Badge>
                              </div>
                              <CardDescription>
                                Investissement: {subscription.amount}€
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Activation dans ~{Math.max(0, Math.floor((24 * 60 * 60 * 1000 - (Date.now() - new Date(subscription.start_date).getTime())) / (60 * 60 * 1000)))}h
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Abonnements actifs */}
                {activeSubscriptions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6"
                  >
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      Vos Investissements Actifs
                    </h3>
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
                                  ✓ Actif
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

                {/* Message si aucun investissement */}
                {activeSubscriptions.length === 0 && userSubscriptions.filter(s => s.status === 'pending_activation').length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Aucun investissement actif
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Vous n&apos;avez pas encore d&apos;investissement en cours.
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Basculez vers l&apos;onglet &quot;Investir maintenant&quot; pour découvrir nos packs.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>

    </>
  );
}
