'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Zap, Award, Flame } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const PricingSection = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handlePlanSelect = (planPrice: number, planName: string) => {
    if (loadingPlan) return; // Prevent multiple clicks

    if (!user) {
      // Rediriger vers la page d'inscription si l'utilisateur n'est pas connecté
      router.push('/auth/signup?message=Veuillez-vous-inscrire-pour-commencer-vos-investissements');
      return;
    }

    // Démarrer le chargement pour ce plan spécifique
    setLoadingPlan(planName);

    // Délai pour montrer le feedback visuel
    setTimeout(() => {
      // Si l'utilisateur est connecté, rediriger vers le dashboard des packs avec le plan spécifique
      router.push(`/dashboard/packs?from=landing&plan=${planPrice}`);
    }, 500); // 500ms pour montrer le feedback
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

  const plans = [
    {
      name: 'Starter GNL',
      price: 100,
      badge: 'Parfait pour débuter',
      icon: Zap,
      popular: false,
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
      name: 'Premium GNL',
      price: 225,
      badge: 'Investissement équilibré',
      icon: TrendingUp,
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
      name: 'Elite GNL',
      price: 999,
      badge: 'Investisseur avancé',
      icon: Award,
      popular: false,
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
      name: 'Élite GNL',
      price: 1999,
      badge: 'Investisseur professionnel',
      icon: Flame,
      popular: false,
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

  return (
    <section id="plans" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-dark from-blue-900 via-blue-800 to-green-900"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px 0px" }}
          variants={fadeInUp}
        >
          <span className="inline-block px-3 py-1 text-sm font-semibold text-red-500 bg-red-500/10 rounded-full mb-4">
            Nos offres
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Choisissez votre plan d&apos;investissement
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Sélectionnez le forfait qui correspond à vos objectifs financiers et commencez à générer des revenus dès aujourd&apos;hui.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px 0px" }}
                variants={fadeInUp}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  plan.popular
                    ? `border-emerald-400/50 ${plan.gradient} hover:bg-emerald-500/10`
                    : 'border-white/10 bg-white/5'
                } ${plan.hoverBg}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    Populaire
                  </div>
                )}

                <div className="p-6 flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                        <span className="text-sm text-blue-300">{plan.badge}</span>
                      </div>
                      <div>
                        <Icon className={`w-8 h-8 ${plan.iconColor}`} />
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="block text-sm text-gray-400 mt-1">Investissement unique</span>
                    </div>

                    <ul className="space-y-3 mb-6 text-sm text-gray-300">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg className="w-4 h-4 mt-0.5 mr-2 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handlePlanSelect(plan.price, plan.name)}
                    disabled={!!loadingPlan}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      plan.popular
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loadingPlan === plan.name ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Redirection...
                      </div>
                    ) : (
                      `Souscrire ${plan.name}`
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-16 text-center text-gray-300 text-sm"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px 0px" }}
          variants={fadeInUp}
        >
          <p>Vous avez besoin d&apos;une solution personnalisée ? <a href="#contact" className="text-red-500 hover:underline">Contactez-nous</a></p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
