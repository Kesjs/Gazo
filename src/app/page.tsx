'use client'

import dynamic from 'next/dynamic'
import React, { Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Leaf, 
  TrendingUp, 
  DollarSign, 
  Star,
  ArrowRight,
  ChevronUp
} from 'lucide-react'
import { CTAButton, ContactButton } from '@/components/ui/AnimatedButton'

// Import dynamique des composants avec chargement personnalisé
const GlassNavbar = dynamic(() => import('@/components/GlassNavbar'), { ssr: false })
const HeroSection = dynamic(() => import('@/components/HeroSection'), { ssr: false })
const HowItWorks = dynamic(() => import('@/components/HowItWorks'), { ssr: false })
const PricingSection = dynamic(() => import('@/components/PricingSection'), { ssr: false })
const GlassFooter = dynamic(() => import('@/components/GlassFooter'), { ssr: false })

// Bouton flottant retour en haut
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) return null

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      aria-label="Retour en haut"
    >
      <ChevronUp className="w-6 h-6" />
    </motion.button>
  )
}

// Section À propos
function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 px-4 bg-black">
      <div className="container mx-auto text-center max-w-6xl">
        <motion.h2 
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Pourquoi choisir Gazoduc Invest ?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Énergie Durable",
              description: "Le GNL est une source d'énergie propre et efficace pour l'avenir, réduisant considérablement les émissions de CO2.",
              icon: <Leaf className="w-8 h-8 text-green-400" />
            },
            {
              title: "Marché en Croissance",
              description: "Le secteur du GNL connaît une croissance exponentielle avec une demande mondiale en hausse constante.",
              icon: <TrendingUp className="w-8 h-8 text-red-400" />
            },
            {
              title: "Rendements Attractifs",
              description: "Bénéficiez de rendements compétitifs avec des investissements sécurisés dans des infrastructures de pointe.",
              icon: <DollarSign className="w-8 h-8 text-yellow-400" />
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-500/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center mb-6 mx-auto">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Section Témoignages
function Testimonials() {
  return (
    <section id="testimonials" className="py-16 md:py-24 px-4 bg-gray-900/50">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Ce que disent nos investisseurs
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Découvrez les témoignages de nos clients satisfaits qui ont choisi Gazoduc Invest.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              quote: "Gazoduc Invest m'a permis d'investir facilement dans le GNL avec des rendements réguliers et un excellent accompagnement.",
              author: "Jean Dupont",
              role: "Investisseur depuis 2022"
            },
            {
              quote: "Plateforme intuitive et sécurisée. Je recommande vivement pour investir dans l'énergie de demain.",
              author: "Marie Martin",
              role: "Investisseuse professionnelle"
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 inline-block" fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-300 text-lg mb-6">&quot;{testimonial.quote}&quot;</p>
              <div>
                <p className="font-semibold text-white">{testimonial.author}</p>
                <p className="text-sm text-gray-400">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Section Contact
function ContactSection() {
  return (
    <section id="contact" className="py-16 md:py-24 px-4 bg-black">
      <div className="container mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Rejoignez des milliers d&apos;investisseurs qui font confiance à Gazoduc Invest pour développer leur patrimoine.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton href="/auth/signup">
              Ouvrir un compte
            </CTAButton>
            <ContactButton href="mailto:contact@gazoducinvest.com">
              Nous contacter
            </ContactButton>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="bg-black text-white">
      <GlassNavbar />
      
      <Suspense fallback={<div className="h-screen bg-black"></div>}>
        <HeroSection />
        <AboutSection />
        <HowItWorks />
        <PricingSection />
        <Testimonials />
        <ContactSection />
      </Suspense>
      
      <GlassFooter />
      <ScrollToTopButton />
    </div>
  )
}
