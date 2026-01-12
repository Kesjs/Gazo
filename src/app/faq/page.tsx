'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronDownIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import GlassNavbar from '@/components/GlassNavbar'
import GlassFooter from '@/components/GlassFooter'

interface FAQItem {
  question: string
  answer: string
  category: string
  icon: any
}

const faqData: FAQItem[] = [
  {
    question: "Qu'est-ce que Gazoduc Invest ?",
    answer: "Gazoduc Invest est une plateforme d'investissement spécialisée dans le Gaz Naturel Liquéfié (GNL). Nous proposons des opportunités d'investissement dans des projets d'infrastructure énergétique durable avec des rendements réguliers et transparents.",
    category: "Général",
    icon: LightBulbIcon
  },
  {
    question: "Comment investir dans le GNL ?",
    answer: "Pour investir, créez un compte sur notre plateforme, choisissez un plan d'investissement adapté à votre budget, et effectuez votre dépôt via nos méthodes de paiement sécurisées (virement bancaire, crypto-monnaies).",
    category: "Investissement",
    icon: CurrencyDollarIcon
  },
  {
    question: "Quels sont les risques associés à l'investissement dans le GNL ?",
    answer: "Comme tout investissement, il existe des risques. Cependant, le secteur du GNL est réglementé et soutenu par des contrats long terme. Nous investissons dans des projets matures et diversifiés pour minimiser les risques.",
    category: "Risques",
    icon: ShieldCheckIcon
  },
  {
    question: "Quand recevrai-je mes premiers rendements ?",
    answer: "Les rendements sont versés quotidiennement selon le plan choisi. Par exemple, un plan de 30 jours verse des intérêts quotidiens pendant toute la durée de l'investissement.",
    category: "Rendements",
    icon: ClockIcon
  },
  {
    question: "Puis-je retirer mes fonds à tout moment ?",
    answer: "Vous pouvez retirer vos gains quotidiens à tout moment. Pour le capital initial, les conditions varient selon le plan choisi. Certains plans ont une durée minimale avant retrait du capital.",
    category: "Retraits",
    icon: CurrencyDollarIcon
  },
  {
    question: "Mes données personnelles sont-elles sécurisées ?",
    answer: "Oui, la sécurité de vos données est notre priorité. Nous utilisons le chiffrement SSL, stockons vos données sur des serveurs sécurisés et respectons le RGPD. Vos informations financières sont cryptées et jamais partagées.",
    category: "Sécurité",
    icon: ShieldCheckIcon
  },
  {
    question: "Quelles sont les méthodes de paiement acceptées ?",
    answer: "Nous acceptons les virements bancaires SEPA, ainsi que les crypto-monnaies Bitcoin (BTC) et Tether (USDT) pour des dépôts rapides et sécurisés.",
    category: "Paiement",
    icon: CurrencyDollarIcon
  },
  {
    question: "Puis-je investir depuis n'importe quel pays ?",
    answer: "Actuellement, nous acceptons les investisseurs de l'Union Européenne et de certains pays réglementés. Vérifiez les conditions légales dans votre pays avant d'investir.",
    category: "Légal",
    icon: ShieldCheckIcon
  },
  {
    question: "Comment contacter le support client ?",
    answer: "Notre équipe de support est disponible via le chat intégré dans votre dashboard, par email à support@gazoducinvest.com, ou via notre centre d'aide dans la section Support.",
    category: "Support",
    icon: QuestionMarkCircleIcon
  },
  {
    question: "Y a-t-il des frais cachés ?",
    answer: "Nous sommes transparents sur tous nos frais. Les frais de retrait sont clairement indiqués pour chaque méthode. Il n'y a pas de frais d'inscription ou de gestion cachés.",
    category: "Frais",
    icon: CurrencyDollarIcon
  }
]

const categories = ["Tous", "Général", "Investissement", "Risques", "Rendements", "Retraits", "Sécurité", "Paiement", "Légal", "Support", "Frais"]

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("Tous")
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  const filteredFAQs = activeCategory === "Tous"
    ? faqData
    : faqData.filter(item => item.category === activeCategory)

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
              <QuestionMarkCircleIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Questions Fréquemment Posées
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Trouvez rapidement les réponses à vos questions sur Gazoduc Invest
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Category Filter */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* FAQ Items */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {filteredFAQs.map((item, index) => {
              const Icon = item.icon
              const isOpen = openItems.has(index)

              return (
                <motion.div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{item.question}</h3>
                        <span className="text-sm text-blue-400">{item.category}</span>
                      </div>
                    </div>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-4"
                    >
                      <div className="pt-2 border-t border-gray-800">
                        <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-8 border border-blue-500/20">
              <h3 className="text-2xl font-bold text-white mb-4">
                Vous n&apos;avez pas trouvé votre réponse ?
              </h3>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                Notre équipe de support est là pour vous aider. Contactez-nous pour toute question supplémentaire.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Accéder au Dashboard
                </Link>
                <Link
                  href="#contact"
                  className="px-6 py-3 bg-transparent text-white border border-gray-700 rounded-lg font-medium hover:bg-gray-800/50 transition-colors"
                >
                  Nous contacter
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
