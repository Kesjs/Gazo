'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Cookie, Settings, Info } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export default function CookiesPage() {
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
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Cookie className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Politique des <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">cookies</span>
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
            className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8"
          >
            <div className="prose prose-lg prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Info className="w-6 h-6 mr-3 text-blue-400" />
                Qu&apos;est-ce qu&apos;un cookie ?
              </h2>
              <p className="text-gray-300 mb-6">
                Un cookie est un petit fichier texte stocké sur votre ordinateur ou appareil mobile lorsque vous visitez un site web.
                Les cookies nous permettent de reconnaître votre navigateur et de mémoriser certaines informations pour améliorer votre expérience.
              </p>

              <h2 className="text-2xl font-bold text-white mb-6">Types de cookies utilisés</h2>

              <div className="space-y-6 mb-8">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h3 className="text-green-300 font-semibold mb-2 flex items-center">
                    <Cookie className="w-5 h-5 mr-2" />
                    Cookies essentiels
                  </h3>
                  <p className="text-green-100/80 text-sm">
                    Nécessaires au fonctionnement du site. Ils permettent la navigation, l&apos;authentification et la sécurité.
                    Ces cookies ne peuvent pas être désactivés.
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="text-blue-300 font-semibold mb-2 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Cookies de performance
                  </h3>
                  <p className="text-blue-100/80 text-sm">
                    Nous aident à comprendre comment vous utilisez le site pour l&apos;améliorer.
                    Ils collectent des informations anonymes sur les pages visitées.
                  </p>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h3 className="text-purple-300 font-semibold mb-2 flex items-center">
                    <Cookie className="w-5 h-5 mr-2" />
                    Cookies fonctionnels
                  </h3>
                  <p className="text-purple-100/80 text-sm">
                    Mémorisent vos préférences (thème, langue) pour personnaliser votre expérience.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-6">Gestion des cookies</h2>
              <p className="text-gray-300 mb-6">
                Vous pouvez contrôler l&apos;utilisation des cookies de plusieurs manières :
              </p>

              <ul className="text-gray-300 mb-6 ml-6 space-y-2">
                <li>• <strong>Paramètres du navigateur</strong> : Désactivez les cookies dans les préférences</li>
                <li>• <strong>Mode privé</strong> : Les cookies sont automatiquement supprimés à la fermeture</li>
                <li>• <strong>Outils de développement</strong> : Inspectez et supprimez les cookies manuellement</li>
              </ul>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <p className="text-yellow-200 font-medium mb-2">⚠️ Impact de la désactivation</p>
                <p className="text-yellow-100/80 text-sm">
                  La désactivation des cookies peut affecter certaines fonctionnalités du site,
                  comme la mémorisation de votre session ou vos préférences.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-white mb-6">Durée de conservation</h2>
              <p className="text-gray-300 mb-6">
                Les cookies ont différentes durées de vie selon leur type :
              </p>
              <ul className="text-gray-300 mb-6 ml-6 space-y-2">
                <li>• <strong>Cookies de session</strong> : Supprimés &agrave; la fermeture du navigateur</li>
                <li>• <strong>Cookies persistants</strong> : Jusqu&apos;&agrave; 13 mois maximum selon la loi</li>
                <li>• <strong>Cookies essentiels</strong> : Durée variable selon l&apos;usage</li>
              </ul>

              <h2 className="text-2xl font-bold text-white mb-6">Mises à jour</h2>
              <p className="text-gray-300 mb-6">
                Cette politique peut être mise à jour pour refléter les changements dans nos pratiques
                ou la législation applicable. Nous vous informerons de toute modification importante.
              </p>

              <h2 className="text-2xl font-bold text-white mb-6">Contact</h2>
              <p className="text-gray-300">
                Pour toute question concernant l&apos;utilisation des cookies :
              </p>
              <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
                <p className="text-gray-300"><strong>Email :</strong> cookies@gazoducinvest.com</p>
                <p className="text-gray-300"><strong>Support :</strong> <Link href="/support" className="text-blue-400 hover:underline">Centre d&apos;aide</Link></p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
