'use client'

import { motion } from 'framer-motion'
import { 
  UserPlus,
  CreditCard,
  LineChart,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Zap
} from 'lucide-react'

const steps = [
  {
    icon: <UserPlus className="w-8 h-8 text-blue-400" />,
    step: "01",
    title: "Créez votre compte",
    description: "Inscrivez-vous en quelques clics et vérifiez votre identité pour sécuriser votre espace personnel.",
    features: [
      "Vérification d'identité rapide et sécurisée",
      "Accès immédiat à votre tableau de bord",
      "Support client disponible 24/7"
    ],
    delay: 0.1
  },
  {
    icon: <CreditCard className="w-8 h-8 text-green-400" />,
    step: "02",
    title: "Souscrivez à un plan",
    description: "Choisissez le plan d'investissement qui correspond à vos objectifs financiers et à votre profil de risque.",
    features: [
      "Plans flexibles adaptés à tous les budgets",
      "Rendements compétitifs garantis",
      "Retraits partiels autorisés"
    ],
    delay: 0.3
  },
  {
    icon: <LineChart className="w-8 h-8 text-yellow-400" />,
    step: "03",
    title: "Observez votre portefeuille croître",
    description: "Suivez en temps réel la performance de vos investissements et voyez vos gains augmenter jour après jour.",
    features: [
      "Tableau de bord interactif et intuitif",
      "Rapports détaillés mensuels",
      "Croissance exponentielle de votre capital"
    ],
    delay: 0.5
  }
]

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark from-black to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Comment ça marche
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-400 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Découvrez comment faire croître votre patrimoine en seulement 3 étapes simples
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-b from-gray-900/80 to-gray-900/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 hover:border-red-500/50 transition-all hover:shadow-2xl hover:shadow-red-500/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: step.delay }}
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-6 mx-auto">
                <div className="text-2xl font-bold text-red-400">{step.step}</div>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 mb-4">{step.description}</p>
              </div>
              
              <ul className="space-y-3">
                {step.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {index === 0 && (
                <motion.div 
                  className="mt-6 pt-6 border-t border-gray-800"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <div className="flex items-center justify-center space-x-2 text-sm text-blue-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sécurisé et régulé</span>
                  </div>
                </motion.div>
              )}
              
              {index === 1 && (
                <motion.div 
                  className="mt-6 pt-6 border-t border-gray-800"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                >
                  <div className="flex items-center justify-center space-x-2 text-sm text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>Rendements optimisés</span>
                  </div>
                </motion.div>
              )}
              
              {index === 2 && (
                <motion.div 
                  className="mt-6 pt-6 border-t border-gray-800"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  <div className="flex items-center justify-center space-x-2 text-sm text-yellow-400">
                    <Zap className="w-4 h-4" />
                    <span>Croissance exponentielle</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          
        </motion.div>
      </div>
    </section>
  )
}
