'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Phone, MapPin, Clock } from 'lucide-react'
import { CTAButton } from '@/components/ui/AnimatedButton'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export default function ContactPage() {
  const router = useRouter()

  const navigateTo = (href: string) => {
    router.push(href)
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigateTo('/')} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span className="text-white font-bold text-xl">Gazoduc Invest</span>
            </button>
            <button onClick={() => navigateTo('/')} className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l&apos;accueil</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Contactez-<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">nous</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Notre équipe est là pour répondre à toutes vos questions sur l&apos;investissement dans le GNL.
              N&apos;hésitez pas à nous contacter.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold text-white mb-8">Informations de contact</h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Email</h3>
                    <p className="text-gray-300">contact@gazoducinvest.com</p>
                    <p className="text-gray-400 text-sm">Réponse sous 24h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Téléphone</h3>
                    <p className="text-gray-300"> 020-674 33 79</p>
                   
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Adresse</h3>
                    <p className="text-gray-300">Admiraal de Ruijterweg 401</p>
                    <p className="text-gray-300">1055 MD Amsterdam</p>
                  </div>
                </div>

               
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold text-white mb-8">Envoyez-nous un message</h2>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Prénom</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Nom</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="votre.email@exemple.com"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Sujet</label>
                  <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="" className="bg-gray-800">Choisissez un sujet</option>
                    <option value="investment" className="bg-gray-800">Questions sur l&apos;investissement</option>
                    <option value="support" className="bg-gray-800">Support technique</option>
                    <option value="partnership" className="bg-gray-800">Partenariat</option>
                    <option value="other" className="bg-gray-800">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Message</label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    placeholder="Votre message..."
                  />
                </div>

                <CTAButton href="#" className="w-full">
                  Envoyer le message
                </CTAButton>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
