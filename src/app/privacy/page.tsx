'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Eye, Lock } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export default function PrivacyPage() {
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
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Politique de <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">confidentialité</span>
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
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Lock className="w-6 h-6 mr-3 text-green-400" />
                Collecte des données
              </h2>
              <p className="text-gray-300 mb-6">
                Nous collectons uniquement les informations nécessaires pour vous fournir nos services d&apos;investissement.
                Cela inclut votre nom, email, informations de paiement sécurisées, et données d&apos;utilisation de la plateforme.
              </p>

              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Eye className="w-6 h-6 mr-3 text-blue-400" />
                Utilisation des données
              </h2>
              <p className="text-gray-300 mb-6">
                Vos données sont utilisées pour :
              </p>
              <ul className="text-gray-300 mb-6 ml-6 space-y-2">
                <li>• Gérer votre compte et vos investissements</li>
                <li>• Vous fournir un support client personnalisé</li>
                <li>• Améliorer nos services et votre expérience</li>
                <li>• Respecter nos obligations légales et réglementaires</li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-6">Protection des données</h2>
              <p className="text-gray-300 mb-6">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction.
              </p>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-200 font-medium">Chiffrement SSL</p>
                    <p className="text-green-100/80 text-sm">
                      Toutes les communications sont chiffrées avec le protocole SSL/TLS 256 bits.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-6">Partage des données</h2>
              <p className="text-gray-300 mb-6">
                Nous ne vendons, n&apos;échangeons ni ne louons vos données personnelles à des tiers.
                Vos données ne sont partagées qu&apos;avec :
              </p>
              <ul className="text-gray-300 mb-6 ml-6 space-y-2">
                <li>• Nos prestataires de services techniques (hébergement, paiement sécurisé)</li>
                <li>• Les autorités compétentes dans le cadre légal</li>
                <li>• Votre consentement explicite</li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-6">Vos droits</h2>
              <p className="text-gray-300 mb-6">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="text-gray-300 mb-6 ml-6 space-y-2">
                <li>• <strong>Droit d&apos;accès</strong> : Connaître les données que nous détenons sur vous</li>
                <li>• <strong>Droit de rectification</strong> : Corriger des données inexactes</li>
                <li>• <strong>Droit à l&apos;effacement</strong> : Supprimer vos données</li>
                <li>• <strong>Droit à la portabilité</strong> : Récupérer vos données</li>
                <li>• <strong>Droit d&apos;opposition</strong> : Refuser certains traitements</li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-6">Contact</h2>
              <p className="text-gray-300">
                Pour exercer vos droits ou poser des questions sur cette politique :
              </p>
              <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
                <p className="text-gray-300"><strong>Email :</strong> privacy@gazoducinvest.com</p>
                <p className="text-gray-300"><strong>Adresse :</strong> 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
