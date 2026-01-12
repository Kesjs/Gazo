    'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  LockClosedIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import GlassNavbar from '@/components/GlassNavbar'
import GlassFooter from '@/components/GlassFooter'

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "Collecte des Données",
      icon: EyeIcon,
      content: [
        "Nous collectons les informations que vous nous fournissez directement lors de votre inscription et utilisation de nos services.",
        "Cela inclut votre nom, adresse email, numéro de téléphone, informations bancaires et données d'investissement.",
        "Nous collectons également automatiquement certaines informations techniques comme votre adresse IP, type de navigateur, et données d'utilisation."
      ]
    },
    {
      title: "Utilisation des Données",
      icon: DocumentTextIcon,
      content: [
        "Vos données sont utilisées pour fournir et améliorer nos services d'investissement.",
        "Nous traitons vos informations pour vérifier votre identité, exécuter vos transactions, et vous fournir un support client.",
        "Nous pouvons utiliser vos données pour vous envoyer des communications importantes concernant votre compte et nos services."
      ]
    },
    {
      title: "Protection des Données",
      icon: ShieldCheckIcon,
      content: [
        "Nous utilisons des mesures de sécurité avancées pour protéger vos données personnelles et financières.",
        "Toutes les communications sont chiffrées avec SSL/TLS, et vos données sensibles sont stockées de manière cryptée.",
        "Nous effectuons régulièrement des audits de sécurité et mettons à jour nos systèmes pour maintenir votre protection."
      ]
    },
    {
      title: "Partage des Données",
      icon: LockClosedIcon,
      content: [
        "Nous ne vendons, louons ou partageons jamais vos données personnelles avec des tiers à des fins commerciales.",
        "Vos données peuvent être partagées uniquement avec nos prestataires de services essentiels (banques, processeurs de paiement) sous contrats stricts.",
        "Nous pouvons être amenés à partager des informations si requis par la loi ou pour protéger nos droits légaux."
      ]
    }
  ]

  return (
    <div className="bg-black text-white">
      <Suspense fallback={<div className="h-16 bg-black"></div>}>
        <GlassNavbar />
      </Suspense>

      {/* Hero Section */}
      <section className="relative min-h-[30vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 to-black"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheckIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Votre confidentialité et la sécurité de vos données sont notre priorité absolue
            </p>
          </motion.div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="py-8 px-4 border-b border-gray-800">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-300 text-center">
              <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Introduction */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-6">Introduction</h2>
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed mb-4">
                Chez Gazoduc Invest, nous nous engageons à protéger votre vie privée et à assurer la sécurité de vos données personnelles.
                Cette politique de confidentialité explique comment nous collectons, utilisons, protégeons et partageons vos informations.
              </p>
              <p className="text-gray-300 leading-relaxed">
                En utilisant nos services, vous acceptez les pratiques décrites dans cette politique.
                Nous vous recommandons de la lire attentivement.
              </p>
            </div>
          </motion.div>

          {/* Sections détaillées */}
          <div className="space-y-12 mb-16">
            {sections.map((section, index) => {
              const Icon = section.icon
              return (
                <motion.div
                  key={index}
                  className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-800"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{section.title}</h3>
                  </div>

                  <div className="space-y-4">
                    {section.content.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-gray-300 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Vos Droits */}
          <motion.div
            className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl p-8 border border-green-500/20 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Vos Droits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-400 mb-3">Droits d&#39;Accès</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Accéder à vos données personnelles</li>
                  <li>• Rectifier des informations inexactes</li>
                  <li>• Demander la suppression de vos données</li>
                  <li>• Recevoir une copie de vos données</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-3">Droits de Contrôle</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Retirer votre consentement</li>
                  <li>• Vous opposer au traitement</li>
                  <li>• Limiter l&#39;utilisation de vos données</li>
                  <li>• Porter plainte auprès des autorités</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Cookies et Technologies */}
          <motion.div
            className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Cookies et Technologies Similaires</h3>
            <div className="space-y-4 text-gray-300">
              <p>
                Nous utilisons des cookies et technologies similaires pour améliorer votre expérience sur notre plateforme.
                Ces technologies nous aident à :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintenir votre session connectée</li>
                <li>Mémoriser vos préférences (thème, langue)</li>
                <li>Analyser l&#39;utilisation du site pour l&#39;améliorer</li>
                <li>Assurer la sécurité de vos transactions</li>
              </ul>
              <p>
                Vous pouvez contrôler l&#39;utilisation des cookies via les paramètres de votre navigateur.
                Notez que désactiver certains cookies peut limiter les fonctionnalités de notre plateforme.
              </p>
            </div>
          </motion.div>

          {/* Modifications */}
          <motion.div
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-white mb-4">Modifications de cette Politique</h3>
            <p className="text-gray-300 leading-relaxed">
              Nous pouvons mettre à jour cette politique de confidentialité périodiquement pour refléter les changements
              dans nos pratiques ou pour nous conformer aux réglementations. Nous vous informerons de tout changement
              important par email ou via une notification sur notre plateforme.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
              <h3 className="text-2xl font-bold text-white mb-4">
                Questions sur votre confidentialité ?
              </h3>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                Notre équipe de protection des données est là pour répondre à vos questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="mailto:privacy@gazoducinvest.com"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  Contact RGPD
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  href="/support"
                  className="px-6 py-3 bg-transparent text-white border border-gray-700 rounded-lg font-medium hover:bg-gray-800/50 transition-colors"
                >
                  Centre d&#39;Aide
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <GlassFooter />
    </div>
  )
}
