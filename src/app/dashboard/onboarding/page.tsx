'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Package,
  TrendingUp,
  Shield,
  Star,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default function OnboardingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-full">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bienvenue sur <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Gazoduc Invest</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Votre plateforme d&apos;investissement sécurisée et rentable
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-gray-700/50 mb-8"
        >
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Choisir un Pack</h3>
              <p className="text-gray-400">
                Sélectionnez le pack d&apos;investissement qui correspond à vos objectifs
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Souscrire</h3>
              <p className="text-gray-400">
                Effectuez votre dépôt initial pour activer votre pack d&apos;investissement
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="text-center"
            >
              <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Investir</h3>
              <p className="text-gray-400">
                Suivez vos gains évoluer et retirez vos profits quand vous le souhaitez
              </p>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Prêt à commencer votre aventure d&apos;investissement ?
            </h2>
            <p className="text-gray-300 mb-6">
              Découvrez nos packs d&apos;investissement optimisés pour maximiser vos rendements.
              Chaque pack est conçu pour offrir le meilleur équilibre entre sécurité et performance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => router.push('/dashboard/investissement')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                Voir les Packs
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <Link
                href="/dashboard/support"
                className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Support
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Rendements Élevés</h3>
            <p className="text-gray-400 text-sm">
              Profitez de rendements optimisés selon votre profil d&apos;investissement
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
            <Shield className="w-8 h-8 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Sécurité Maximale</h3>
            <p className="text-gray-400 text-sm">
              Vos investissements sont protégés par nos protocoles de sécurité avancés
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Support Premium</h3>
            <p className="text-gray-400 text-sm">
              Notre équipe est disponible pour vous accompagner dans votre parcours
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
