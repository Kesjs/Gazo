'use client'

import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import GlassNavbar from '@/components/GlassNavbar'
import GlassFooter from '@/components/GlassFooter'

const supportChannels = [
  {
    title: "Chat en Direct",
    description: "Discutez instantanément avec notre équipe support",
    icon: ChatBubbleLeftRightIcon,
    color: "from-green-500 to-emerald-500",
    availability: "24/7",
    response: "< 5 min",
    action: "Ouvrir le chat",
    link: "/dashboard" // Redirige vers dashboard où il y a le chat
  },
  {
    title: "Email Support",
    description: "Envoyez-nous un email détaillé",
    icon: EnvelopeIcon,
    color: "from-blue-500 to-cyan-500",
    availability: "24/7",
    response: "< 24h",
    action: "Envoyer un email",
    link: "mailto:support@gazoducinvest.com"
  },
  {
    title: "Support Téléphonique",
    description: "Parlez directement avec un conseiller",
    icon: PhoneIcon,
    color: "from-purple-500 to-pink-500",
    availability: "Lundi-Vendredi 9h-18h",
    response: "Immédiat",
    action: "Appeler maintenant",
    link: "tel:+31206743379"
  }
]

const commonIssues = [
  {
    question: "Comment effectuer un dépôt ?",
    answer: "Accédez à votre dashboard, cliquez sur 'Dépôt' dans la carte solde, choisissez votre méthode de paiement et suivez les instructions."
  },
  {
    question: "Mon retrait est bloqué",
    answer: "Vérifiez que vous avez suffisamment de fonds disponibles et que vous respectez les conditions de votre plan d'investissement."
  },
  {
    question: "Comment modifier mes informations ?",
    answer: "Allez dans votre profil dans le dashboard et cliquez sur 'Modifier le profil' pour mettre à jour vos informations."
  },
  {
    question: "Problème de connexion",
    answer: "Essayez de vider votre cache navigateur ou contactez le support si le problème persiste."
  }
]

export default function SupportPage() {
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null)

  return (
    <div className="bg-black text-white">
      <Suspense fallback={<div className="h-16 bg-black"></div>}>
        <GlassNavbar />
      </Suspense>

      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden pt-20">
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
              <ChatBubbleLeftRightIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Centre d&apos;Aide & Support
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Notre équipe est là pour vous accompagner dans votre expérience d&apos;investissement
            </p>
          </motion.div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comment pouvons-nous vous aider ?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Choisissez le canal de support qui vous convient le mieux
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {supportChannels.map((channel, index) => {
              const Icon = channel.icon
              return (
                <motion.div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${channel.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">{channel.title}</h3>
                  <p className="text-gray-300 mb-6">{channel.description}</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Disponibilité:</span>
                      <span className="text-sm text-green-400">{channel.availability}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Réponse:</span>
                      <span className="text-sm text-blue-400">{channel.response}</span>
                    </div>
                  </div>

                  {channel.link.startsWith('http') || channel.link.startsWith('mailto') || channel.link.startsWith('tel') ? (
                    <a
                      href={channel.link}
                      className="w-full bg-gradient-to-r from-gray-700 to-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-500 transition-all flex items-center justify-center group-hover:shadow-lg"
                    >
                      {channel.action}
                      <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <Link
                      href={channel.link}
                      className="w-full bg-gradient-to-r from-gray-700 to-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-500 transition-all flex items-center justify-center group-hover:shadow-lg"
                    >
                      {channel.action}
                      <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Quick Help */}
          <motion.div
            className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Aide Rapide</h3>
              <p className="text-gray-300">Solutions aux problèmes les plus courants</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {commonIssues.map((issue, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 rounded-xl p-6 cursor-pointer hover:bg-gray-800/70 transition-colors"
                  onClick={() => setSelectedIssue(selectedIssue === index ? null : index)}
                >
                  <h4 className="font-semibold text-white mb-2">{issue.question}</h4>
                  {selectedIssue === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-gray-300 text-sm mt-3 pt-3 border-t border-gray-700"
                    >
                      {issue.answer}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            className="mt-16 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-8 border border-blue-500/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Informations de Contact</h3>
              <p className="text-gray-300">Autres moyens de nous joindre</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EnvelopeIcon className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">Email</h4>
                <p className="text-gray-300 text-sm">support@gazoducinvest.com</p>
                <p className="text-gray-400 text-xs mt-1">Réponse sous 24h</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PhoneIcon className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">Téléphone</h4>
                <p className="text-gray-300 text-sm">020-674 33 79</p>
                <p className="text-gray-400 text-xs mt-1">Lundi-Vendredi 9h-18h</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">Heures d&apos;ouverture</h4>
                <p className="text-gray-300 text-sm">Lundi - Vendredi</p>
                <p className="text-gray-400 text-xs mt-1">9h00 - 18h00 CET</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPinIcon className="w-6 h-6 text-orange-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">Adresse</h4>
                <p className="text-gray-300 text-sm">Admiraal de Ruijterweg 401</p>
                <p className="text-gray-300 text-sm">1055MD Amsterdam</p>
                <p className="text-gray-400 text-xs mt-1">Pays-Bas</p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
              <h3 className="text-2xl font-bold text-white mb-4">
                Besoin d&apos;aide urgente ?
              </h3>
              <p className="text-gray-300 mb-6">
                Pour les questions urgentes concernant vos investissements, contactez-nous directement.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Accéder au Dashboard
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <GlassFooter />
    </div>
  )
}
