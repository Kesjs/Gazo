'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span className="text-white font-bold text-xl">Gazoduc Invest</span>
            </Link>
            <Link href="/" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l&apos;accueil</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Conditions générales d&apos;<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">utilisation</span>
            </h1>
            <p className="text-xl text-gray-300">
              Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50"
          >
            <div className="prose prose-lg prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-white mb-6">1. Acceptation des conditions</h2>
              <p className="text-gray-300 mb-6">
                En accédant et en utilisant les services de Gazoduc Invest, vous acceptez d&apos;être lié par les présentes conditions générales d&apos;utilisation.
                Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser nos services.
              </p>

              <h2 className="text-2xl font-bold text-white mb-6">2. Description des services</h2>
              <p className="text-gray-300 mb-6">
                Gazoduc Invest fournit une plateforme d&apos;investissement dans les infrastructures de Gaz Naturel Liquéfié (GNL).
                Nos services incluent la gestion de portefeuille, le suivi des performances et l&apos;accompagnement personnalisé.
              </p>

              <h2 className="text-2xl font-bold text-white mb-6">3. Obligations de l&apos;utilisateur</h2>
              <p className="text-gray-300 mb-6">
                Vous vous engagez à fournir des informations exactes et &agrave; jour lors de votre inscription.
                Vous êtes responsable de la confidentialité de vos identifiants de connexion.
              </p>

              <h2 className="text-2xl font-bold text-white mb-6">4. Risques d&apos;investissement</h2>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-200 font-medium">Avertissement sur les risques</p>
                    <p className="text-yellow-100/80 text-sm">
                      Tout investissement comporte des risques, y compris la perte partielle ou totale du capital investi.
                      Les performances passées ne garantissent pas les résultats futurs.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-6">5. Propriété intellectuelle</h2>
              <p className="text-gray-300 mb-6">
                Tous les contenus présents sur la plateforme Gazoduc Invest sont protégés par les droits d&apos;auteur et autres droits de propriété intellectuelle.
              </p>

              <h2 className="text-2xl font-bold text-white mb-6">6. Modification des conditions</h2>
              <p className="text-gray-300 mb-6">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet immédiatement après leur publication.
              </p>

              <h2 className="text-2xl font-bold text-white mb-6">7. Contact</h2>
              <p className="text-gray-300">
                Pour toute question concernant ces conditions, contactez-nous à contact@gazoducinvest.com
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
