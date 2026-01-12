// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { useAuth } from '@/contexts';
// import { createClient } from '@/lib/supabase';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { WithdrawModal } from '@/components/dashboard/WithdrawModal';
// import { Progress } from '@/components/ui/progress';
// import {
//   ChartBarIcon,
//   ClockIcon,
//   CurrencyEuroIcon,
//   CheckCircleIcon,
//   StarIcon,
//   SparklesIcon,
//   BoltIcon,
//   LightBulbIcon,
//   CubeIcon
// } from '@heroicons/react/24/outline';
// import { motion } from 'framer-motion';

// interface Plan {
//   id: string;
//   name: string;
//   description: string;
//   min_amount: number;
//   daily_profit: number;
//   duration_days: number;
//   features: string[];
//   color: string;
//   icon: React.ComponentType<any>;
//   popular?: boolean;
//   badge?: string;
//   gradient: string;
//   hoverBg: string;
//   iconColor: string;
// }

// interface Subscription {
//   id: string;
//   plan_id: string;
//   amount: number;
//   start_date: string;
//   end_date: string;
//   status: 'active' | 'completed' | 'cancelled';
//   progress: number;
// }

// const fadeInUp = {
//   hidden: { opacity: 0, y: 40 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: (i: number) => ({
//       delay: i * 0.1,
//       duration: 0.6,
//       ease: [0.22, 1, 0.36, 1]
//     })
//   }
// };

// const plans: Plan[] = [
//   {
//     id: 'starter',
//     name: 'Starter GNL',
//     description: 'Parfait pour débuter',
//     min_amount: 100,
//     daily_profit: 1.5,
//     duration_days: 90,
//     badge: 'Parfait pour débuter',
//     icon: BoltIcon,
//     color: 'bg-blue-500',
//     iconColor: 'text-blue-400',
//     gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-400/10',
//     hoverBg: 'hover:bg-blue-500/10',
//     features: [
//       'Retour sur investissement garanti',
//       'Support prioritaire',
//       'Accès à la plateforme',
//       'Rapports mensuels'
//     ]
//   },
//   {
//     id: 'premium',
//     name: 'Premium GNL',
//     description: 'Investissement équilibré',
//     min_amount: 225,
//     daily_profit: 2.0,
//     duration_days: 120,
//     badge: 'Investissement équilibré',
//     icon: ChartBarIcon,
//     color: 'bg-emerald-500',
//     popular: true,
//     iconColor: 'text-emerald-400',
//     gradient: 'bg-gradient-to-br from-emerald-500/20 to-teal-400/10',
//     hoverBg: 'hover:bg-emerald-500/10',
//     features: [
//       'Tout dans Starter, plus:',
//       'Retour sur investissement supérieur',
//       'Support 24/7',
//       'Analyse personnalisée',
//       'Rapports hebdomadaires'
//     ]
//   },
//   {
//     id: 'elite',
//     name: 'Elite GNL',
//     description: 'Investisseur avancé',
//     min_amount: 999,
//     daily_profit: 2.5,
//     duration_days: 180,
//     badge: 'Investisseur avancé',
//     icon: CubeIcon,
//     color: 'bg-purple-500',
//     iconColor: 'text-purple-400',
//     gradient: 'bg-gradient-to-br from-purple-600/20 to-indigo-500/10',
//     hoverBg: 'hover:bg-purple-500/10',
//     features: [
//       'Tout dans Premium, plus:',
//       'Gestion de portefeuille personnalisée',
//       'Rencontres trimestrielles',
//       'Accès anticipé aux opportunités',
//       'Rapports détaillés',
//       'Assistance VIP dédiée'
//     ]
//   },
//   {
//     id: 'ultimate',
//     name: 'Élite GNL',
//     description: 'Investisseur professionnel',
//     min_amount: 1999,
//     daily_profit: 3.0,
//     duration_days: 365,
//     badge: 'Investisseur professionnel',
//     icon: SparklesIcon,
//     color: 'bg-orange-500',
//     iconColor: 'text-orange-400',
//     gradient: 'bg-gradient-to-br from-amber-500/20 to-orange-500/10',
//     hoverBg: 'hover:bg-orange-500/10',
//     features: [
//       'Tout dans Elite, plus:',
//       'Stratégie d\'investissement sur mesure',
//       'Rencontres mensuelles',
//       'Accès exclusif aux opportunités',
//       'Rapports personnalisés',
//       'Conseiller personnel dédié',
//       'Invitations aux événements VIP'
//     ]
//   }
// ];

// export default function PacksPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { user } = useAuth();
//   const supabase = createClient();
//   const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([]);
//   const [showDepositModal, setShowDepositModal] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
//   const [investedBalance, setInvestedBalance] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [isProcessingPayment, setIsProcessingPayment] = useState(false);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
//   const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');
//   const [balance, setBalance] = useState(0);
//   const [showWithdrawModal, setShowWithdrawModal] = useState(false);

//   const handleDeposit = async (amount: number, method: string, acceptTerms: boolean = false) => {
//     if (isProcessingPayment) return;

//     // Vérifier que les conditions sont acceptées
//     if (!acceptTerms) {
//       alert('Veuillez accepter les conditions générales pour continuer.');
//       return;
//     }

//     // Si un plan est sélectionné, c'est une souscription
//     if (selectedPlan) {
//       setIsProcessingPayment(true);

//       try {
//         // Vérification que le montant correspond au minimum du plan
//         if (amount !== selectedPlan.min_amount) {
//           alert(`Pour souscrire au pack ${selectedPlan.name}, le montant doit être exactement de ${selectedPlan.min_amount}€.`);
//           setIsProcessingPayment(false);
//           return;
//         }

//         // Créer la souscription
//         const res = await fetch('/api/subscribe', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             planId: selectedPlan.id,
//             amount: selectedPlan.min_amount
//           }),
//         });

//         if (res.ok) {
//           alert(`Souscription au pack ${selectedPlan.name} réussie ! Votre investissement de ${selectedPlan.min_amount}€ provenant de fonds externes a été ajouté à votre solde investi.`);
//           // Rafraîchir les données depuis la base de données
//           await fetchData();
//           // Fermer la modale
//           setShowPaymentModal(false);
//           setSelectedPlan(null);
//           // Rediriger vers le dashboard principal pour voir les changements
//           router.push('/dashboard');
//         } else {
//           alert('Erreur lors de la souscription. Veuillez réessayer.');
//         }
//       } catch (error) {
//         alert('Erreur réseau. Veuillez réessayer.');
//       } finally {
//         setIsProcessingPayment(false);
//       }
//     }
//   };

//   // Rediriger si non connecté
//   useEffect(() => {
//     if (!user) {
//       router.push('/auth/signin');
//     }
//   }, [router]); // Removed user from dependencies

//   // Détecter les paramètres d'URL pour navigation automatique
//   useEffect(() => {
//     const fromParam = searchParams.get('from');
//     const planParam = searchParams.get('plan');

//     if (fromParam === 'landing' && !loading && balance >= 0) {
//       // Trouver le plan correspondant au prix passé en paramètre
//       if (planParam) {
//         const price = parseInt(planParam);
//         const plan = plans.find(p => p.min_amount === price);
//         if (plan) {
//           setSelectedPlan(plan);
//           setShowPaymentModal(true);
//           // Nettoyer l'URL
//           router.replace('/dashboard/packs', undefined);
//         }
//       }
//     }
//   }, [searchParams, loading, balance, router]);

//   const fetchData = useCallback(async () => {
//     try {
//       setError('');
//       const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

//       if (userError) {
//         setError('Erreur d\'authentification. Veuillez vous reconnecter.');
//         router.push('/auth/signin');
//         return;
//       }

//       if (!currentUser) {
//         setError('Session expirée. Veuillez vous reconnecter.');
//         router.push('/auth/signin');
//         return;
//       }

//       // Fetch transactions for balance
//       const { data: trans, error: transError } = await supabase
//         .from('transactions')
//         .select('*')
//         .eq('user_id', currentUser.id)
//         .order('created_at', { ascending: false });

//       if (transError) {
//         setError('Erreur lors du chargement du solde.');
//         console.error('Transactions error:', transError);
//       } else {
//         const total = trans?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0;
//         setBalance(total);
//       }

//       // Fetch active subscriptions
//       const { data: subs, error: subsError } = await supabase
//         .from('subscriptions')
//         .select('*')
//         .eq('user_id', currentUser.id)
//         .eq('status', 'active');

//       if (subsError) {
//         console.error('Subscriptions error:', subsError);
//       } else {
//         // Convertir les données de la DB au format attendu par le composant
//         const formattedSubs: Subscription[] = (subs || []).map((sub: any) => ({
//           id: sub.id.toString(),
//           plan_id: sub.plan_id,
//           amount: sub.amount,
//           start_date: sub.start_date,
//           end_date: sub.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Fallback
//           status: sub.status as 'active' | 'completed' | 'cancelled',
//           progress: 0 // Calculé dynamiquement plus tard
//         }));
//         setActiveSubscriptions(formattedSubs);

//         // Calculer le solde investi (somme des souscriptions actives)
//         const totalInvested = formattedSubs.reduce((total, sub) => total + sub.amount, 0);
//         setInvestedBalance(totalInvested);
//       }

//     } catch (err) {
//       setError('Erreur inattendue. Veuillez rafraîchir la page.');
//       console.error('Dashboard error:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [router, supabase]);

//   useEffect(() => {
//     if (user) {
//       fetchData();
//     }
//   }, [fetchData]); // Removed user from dependencies

//   const handleSubscribe = (plan: Plan) => {
//     setSelectedPlan(plan);
//     setShowPaymentModal(true);
//   };

//   if (!user) {
//     return <div>Chargement...</div>;
//   }

//   if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
//         <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
//           <h3 className="text-lg font-semibold mb-2">Erreur</h3>
//           <p className="mb-4">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
//           >
//             Rafraîchir
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header avec soldes */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//             Mes Packs d&apos;Investissement
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">
//             Gérez vos investissements et découvrez de nouvelles opportunités
//           </p>
//         </div>
//         <div className="flex items-center space-x-6">
//           <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
//             <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Solde disponible</p>
//             <p className="text-lg font-bold text-green-600 dark:text-green-400">{balance.toFixed(2)}€</p>
//           </div>
//           <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
//             <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Solde investi</p>
//             <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{investedBalance.toFixed(2)}€</p>
//           </div>
//         </div>
//       </div>

//       {/* Sélecteur d'onglets */}
//       <div className="border-b border-gray-200 dark:border-gray-700">
//         <nav className="-mb-px flex space-x-8">
//           <button
//             onClick={() => setActiveTab('available')}
//             className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
//               activeTab === 'available'
//                 ? 'border-blue-500 text-blue-600 dark:text-blue-400'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
//             }`}
//           >
//             Packs Disponibles
//           </button>
//           <button
//             onClick={() => setActiveTab('active')}
//             className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
//               activeTab === 'active'
//                 ? 'border-blue-500 text-blue-600 dark:text-blue-400'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
//             }`}
//           >
//             Mes Packs Actifs ({activeSubscriptions.length})
//           </button>
//         </nav>
//       </div>

//       {/* Contenu des onglets */}
//       {activeTab === 'available' && (
//         <div className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {plans.map((plan) => {
//               const IconComponent = plan.icon;
//               const isSubscribed = activeSubscriptions.some(sub => sub.plan_id === plan.id);

//               return (
//                 <Card key={plan.id} className="relative overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 h-full flex flex-col">
//                   <CardHeader className="pb-4">
//                     <div className="flex items-center justify-between">
//                       <div className={`p-2 rounded-lg ${plan.color}`}>
//                         <IconComponent className="h-6 w-6 text-white" />
//                       </div>
//                       {plan.id === 'elite' && (
//                         <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
//                           <StarIcon className="h-3 w-3 mr-1" />
//                           Premium
//                         </Badge>
//                       )}
//                     </div>
//                     <CardTitle className="text-xl">{plan.name}</CardTitle>
//                     <CardDescription>{plan.description}</CardDescription>
//                   </CardHeader>

//                   <CardContent className="space-y-4 flex-grow">
//                     <div className="grid grid-cols-2 gap-4 text-sm">
//                       <div className="flex items-center">
//                         <CurrencyEuroIcon className="h-4 w-4 mr-2 text-gray-400" />
//                         <div>
//                           <p className="text-gray-500 dark:text-gray-400">Min. investissement</p>
//                           <p className="font-semibold">{plan.min_amount.toLocaleString()} €</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center">
//                         <ChartBarIcon className="h-4 w-4 mr-2 text-gray-400" />
//                         <div>
//                           <p className="text-gray-500 dark:text-gray-400">Rendement/jour</p>
//                           <p className="font-semibold text-green-600">{plan.daily_profit}%</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center">
//                         <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
//                         <div>
//                           <p className="text-gray-500 dark:text-gray-400">Durée</p>
//                           <p className="font-semibold">{plan.duration_days} jours</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center">
//                         <CheckCircleIcon className="h-4 w-4 mr-2 text-gray-400" />
//                         <div>
//                           <p className="text-gray-500 dark:text-gray-400">Gain estimé</p>
//                           <p className="font-semibold text-blue-600">
//                             +{((plan.min_amount * plan.daily_profit * plan.duration_days) / 100).toLocaleString()} €
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <h4 className="font-medium text-sm">Avantages inclus :</h4>
//                       <ul className="space-y-1">
//                         {plan.features.map((feature, index) => (
//                           <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
//                             <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
//                             {feature}
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   </CardContent>

//                   <CardFooter className="mt-auto">
//                     <Button
//                       onClick={() => handleSubscribe(plan)}
//                       disabled={isSubscribed}
//                       className={`w-full text-white ${isSubscribed ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
//                       variant={isSubscribed ? "secondary" : "default"}
//                     >
//                       {isSubscribed ? 'Déjà souscrit' : 'Souscrire maintenant'}
//                     </Button>
//                   </CardFooter>
//                 </Card>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Onglet packs actifs */}
//       {activeTab === 'active' && (
//         <div className="space-y-6">
//           {activeSubscriptions.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="mx-auto h-12 w-12 text-gray-400">
//                 <ChartBarIcon />
//               </div>
//               <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
//                 Aucun pack actif
//               </h3>
//               <p className="mt-2 text-gray-500 dark:text-gray-400">
//                 Souscrivez à un pack pour commencer à investir dans le GNL.
//               </p>
//               <Button
//                 onClick={() => setActiveTab('available')}
//                 className="mt-4"
//               >
//                 Voir les packs disponibles
//               </Button>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {activeSubscriptions.map((subscription) => {
//                 const plan = plans.find(p => p.id === subscription.plan_id);
//                 if (!plan) return null;

//                 const IconComponent = plan.icon;
//                 const endDate = new Date(subscription.end_date);
//                 const now = new Date();
//                 const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
//                 const progress = Math.min(100, Math.max(0, ((plan.duration_days - daysRemaining) / plan.duration_days) * 100));

//                 return (
//                   <Card key={subscription.id} className="overflow-hidden border border-gray-200 dark:border-gray-700">
//                     <CardHeader className="pb-4">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                           <div className={`p-2 rounded-lg ${plan.color}`}>
//                             <IconComponent className="h-5 w-5 text-white" />
//                           </div>
//                           <div>
//                             <CardTitle>{plan.name}</CardTitle>
//                             <CardDescription>
//                               Investissement: {subscription.amount.toLocaleString()} €
//                             </CardDescription>
//                           </div>
//                         </div>
//                         <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
//                           Actif
//                         </Badge>
//                       </div>
//                     </CardHeader>

//                     <CardContent className="space-y-4">
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                         <div>
//                           <p className="text-gray-500 dark:text-gray-400">Début</p>
//                           <p className="font-medium">
//                             {new Date(subscription.start_date).toLocaleDateString('fr-FR')}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-gray-500 dark:text-gray-400">Fin</p>
//                           <p className="font-medium">
//                             {endDate.toLocaleDateString('fr-FR')}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-gray-500 dark:text-gray-400">Jours restants</p>
//                           <p className="font-medium text-blue-600">{daysRemaining}</p>
//                         </div>
//                         <div>
//                           <p className="text-gray-500 dark:text-gray-400">Gain estimé total</p>
//                           <p className="font-medium text-green-600">
//                             +{((subscription.amount * plan.daily_profit * plan.duration_days) / 100).toLocaleString()} €
//                           </p>
//                         </div>
//                       </div>

//                       <div className="space-y-2">
//                         <div className="flex justify-between text-sm">
//                           <span>Progression</span>
//                           <span>{Math.round(progress)}%</span>
//                         </div>
//                         <Progress value={progress} className="h-2 border border-gray-200 dark:border-gray-700" />
//                       </div>
//                     </CardContent>

//                     <CardFooter className="flex justify-between">
//                       <Button variant="outline" size="sm">
//                         Voir détails
//                       </Button>
//                       <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
//                         Résilier
//                       </Button>
//                     </CardFooter>
//                   </Card>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Modale de paiement simplifiée */}
//       {showPaymentModal && selectedPlan && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//                   Souscription - {selectedPlan!.name}
//                 </h2>
//                 <button
//                   onClick={() => {
//                     setShowPaymentModal(false);
//                     setSelectedPlan(null);
//                     setSelectedPaymentMethod(null);
//                     setSelectedCrypto(null);
//                   }}
//                   className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//                 >
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>

//               {/* Récapitulatif du pack */}
//               <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//                   <div>
//                     <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlan!.min_amount} EUR</div>
//                     <div className="text-sm text-gray-600 dark:text-gray-400">Investissement</div>
//                   </div>
//                   <div>
//                     <div className="text-2xl font-bold text-green-600">{selectedPlan!.daily_profit}%</div>
//                     <div className="text-sm text-gray-600 dark:text-gray-400">Par jour</div>
//                   </div>
//                   <div>
//                     <div className="text-2xl font-bold text-blue-600">{selectedPlan!.duration_days}</div>
//                     <div className="text-sm text-gray-600 dark:text-gray-400">Jours</div>
//                   </div>
//                   <div>
//                     <div className="text-2xl font-bold text-purple-600">
//                       +{((selectedPlan!.min_amount * selectedPlan!.daily_profit * selectedPlan!.duration_days) / 100).toFixed(0)} EUR
//                     </div>
//                     <div className="text-sm text-gray-600 dark:text-gray-400">Gain estimé</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Sélection des cryptomonnaies */}
//               <div className="space-y-4 mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choisissez votre cryptomonnaie</h3>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* Bitcoin */}
//                   <button
//                     onClick={() => {
//                       setSelectedPaymentMethod('crypto');
//                       setSelectedCrypto('btc');
//                     }}
//                     className={`flex items-center p-4 border-2 rounded-lg transition-all ${
//                       selectedCrypto === 'btc'
//                         ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
//                         : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
//                     }`}
//                   >
//                     <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-4">
//                       <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                       </svg>
//                     </div>
//                     <div className="text-left flex-1">
//                       <div className="font-medium text-gray-900 dark:text-white">Carte bancaire</div>
//                       <div className="text-sm text-gray-500 dark:text-gray-400">Visa, Mastercard</div>
//                     </div>
//                     {selectedPaymentMethod === 'card' && (
//                       <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
//                         <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                         </svg>
//                       </div>
//                     )}
//                   </button>

//                   {/* PayPal */}
//                   <button
//                     onClick={() => {
//                       setSelectedPaymentMethod('paypal');
//                       setSelectedCrypto(null);
//                     }}
//                     className={`flex items-center p-4 border-2 rounded-lg transition-all ${
//                       selectedPaymentMethod === 'paypal'
//                         ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
//                         : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
//                     }`}
//                   >
//                     <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-4">
//                       <span className="text-blue-600 font-bold text-sm">P</span>
//                     </div>
//                     <div className="text-left flex-1">
//                       <div className="font-medium text-gray-900 dark:text-white">PayPal</div>
//                       <div className="text-sm text-gray-500 dark:text-gray-400">Paiement rapide</div>
//                     </div>
//                     {selectedPaymentMethod === 'paypal' && (
//                       <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
//                         <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                         </svg>
//                       </div>
//                     )}
//                   </button>
//                 </div>

//                 {/* Cryptomonnaies */}
//                 <div className="grid grid-cols-1 gap-4">
//                   <button
//                     onClick={() => setSelectedPaymentMethod('crypto')}
//                     className={`flex items-center p-4 border-2 rounded-lg transition-all ${
//                       selectedPaymentMethod === 'crypto'
//                         ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
//                         : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
//                     }`}
//                   >
//                     <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-4">
//                       <span className="text-orange-500 font-bold text-lg">₿</span>
//                     </div>
//                     <div className="text-left flex-1">
//                       <div className="font-medium text-gray-900 dark:text-white">Cryptomonnaies</div>
//                       <div className="text-sm text-gray-500 dark:text-gray-400">Bitcoin, Tether (USDT)</div>
//                     </div>
//                     {selectedPaymentMethod === 'crypto' && (
//                       <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
//                         <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                         </svg>
//                       </div>
//                     )}
//                   </button>
//                 </div>

//                 {/* Sélection des cryptos */}
//                 {selectedPaymentMethod === 'crypto' && (
//                   <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
//                     <h4 className="font-medium text-gray-900 dark:text-white mb-3">Choisissez votre cryptomonnaie</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                       <button
//                         onClick={() => setSelectedCrypto('btc')}
//                         className={`flex items-center p-3 border rounded-lg transition-all ${
//                           selectedCrypto === 'btc'
//                             ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
//                             : 'border-gray-200 dark:border-gray-700 hover:border-orange-400'
//                         }`}
//                       >
//                         <span className="text-orange-500 font-bold mr-3">₿</span>
//                         <span className="font-medium text-gray-900 dark:text-white">Bitcoin (BTC)</span>
//                         {selectedCrypto === 'btc' && (
//                           <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center ml-auto">
//                             <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
//                               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                             </svg>
//                           </div>
//                         )}
//                       </button>
//                       <button
//                         onClick={() => setSelectedCrypto('usdt')}
//                         className={`flex items-center p-3 border rounded-lg transition-all ${
//                           selectedCrypto === 'usdt'
//                             ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
//                             : 'border-gray-200 dark:border-gray-700 hover:border-green-400'
//                         }`}
//                       >
//                         <span className="text-green-500 font-bold mr-3">T</span>
//                         <span className="font-medium text-gray-900 dark:text-white">Tether (USDT)</span>
//                         {selectedCrypto === 'usdt' && (
//                           <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center ml-auto">
//                             <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
//                               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                             </svg>
//                           </div>
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {/* Affichage de l'adresse si crypto sélectionnée */}
//                 {selectedCrypto && (
//                   <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-600">
//                     <h4 className="font-medium text-gray-900 dark:text-white mb-2">
//                       Adresse {selectedCrypto === 'btc' ? 'Bitcoin' : 'USDT (ERC20)'} :
//                     </h4>
//                     <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border font-mono text-sm break-all">
//                       {selectedCrypto === 'btc'
//                         ? 'bc1q0ulp4sauly9sahsq7jswy94ane0ev9ksjtvpzn'
//                         : '0x63eF5b765D8d408274172804D31fB0a2Ea5416c0'
//                       }
//                     </div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
//                       Envoyez exactement {selectedPlan!.min_amount}€ en {selectedCrypto === 'btc' ? 'BTC' : 'USDT'} à cette adresse.
//                       Votre pack sera activé automatiquement après confirmation de la transaction.
//                     </p>
//                   </div>
//                 )}

//                 {/* Conditions générales */}
//                 <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
//                   <div className="flex items-start space-x-3">
//                     <input
//                       type="checkbox"
//                       id="acceptTerms"
//                       className="mt-1 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
//                     />
//                     <div className="flex-1">
//                       <label htmlFor="acceptTerms" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
//                         J&apos;accepte les{' '}
//                         <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
//                           conditions générales d&apos;utilisation
//                         </a>
//                         {' '}et la{' '}
//                         <a href="/politique-confidentialite" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
//                           politique de confidentialité
//                         </a>
//                       </label>
//                     </div>
//                   </div>
//                 </div>

//               {/* Bouton de paiement */}
//               <div className="flex justify-end space-x-4">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setShowPaymentModal(false);
//                     setSelectedPlan(null);
//                     setSelectedPaymentMethod(null);
//                     setSelectedCrypto(null);
//                   }}
//                 >
//                   Annuler
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     const acceptTermsCheckbox = document.getElementById('acceptTerms') as HTMLInputElement;
//                     handleDeposit(selectedPlan!.min_amount, selectedPaymentMethod || 'card', acceptTermsCheckbox?.checked || false);
//                   }}
//                   disabled={isProcessingPayment || !selectedPaymentMethod || (selectedPaymentMethod === 'crypto' && !selectedCrypto)}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-8"
//                 >
//                   {isProcessingPayment ? (
//                     <div className="flex items-center">
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                       Traitement...
//                     </div>
//                   ) : (
//                     `Payer ${selectedPlan!.min_amount} EUR`
//                   )}
//                 </Button>
//               </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modales (conservés pour les retraits) */}
//       {showWithdrawModal && (
//         <WithdrawModal
//           balance={balance}
//           onConfirm={(amount: number) => {
//             fetchData(); // Refresh balance from DB
//             setShowWithdrawModal(false);
//           }}
//           onClose={() => setShowWithdrawModal(false)}
//         />
//       )}
//     </div>
//   );
// }
