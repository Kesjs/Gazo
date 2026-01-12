'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, BarChart3, ArrowUp as ArrowPathIcon } from 'lucide-react'
import { useAuth } from '@/contexts'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

export default function GlassNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)
  const [isLoadingSignin, setIsLoadingSignin] = useState(false)
  const [isLoadingSignup, setIsLoadingSignup] = useState(false)
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [fromLanding, setFromLanding] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'Utilisateur'

    // Try to get display name from user metadata first
    if (user.user_metadata?.full_name) {
      // Clean up the name by removing "Tableau de bord" prefix if present
      let name = user.user_metadata.full_name
      name = name.replace(/^Tableau de bord\s*-\s*/i, '') // Remove "Tableau de bord - " prefix
      name = name.replace(/\s*tableau de bord\s*$/i, '') // Remove "tableau de bord" suffix
      return name.trim()
    }

    // Fallback to email username part
    if (user.email) {
      return user.email.split('@')[0]
    }

    return 'Utilisateur'
  }

  useEffect(() => {
    // Vérification de l'authentification
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
      } catch (error) {
        console.error('Erreur lors de la vérification d\'authentification:', error)
        setIsAuthenticated(false)
      }
    }

    // Détecter si on vient de la landing page
    const fromParam = searchParams.get('from')
    setFromLanding(fromParam === 'landing')

    checkAuth()

    // Gestion du défilement
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrolled, searchParams])

  const handleDashboardNavigation = async () => {
    if (isLoadingDashboard) return // Prevent multiple clicks

    setIsLoadingDashboard(true)
    setIsMenuOpen(false) // Close mobile menu if open

    // Redirect to auth verification page
    router.push('/auth/verify')
  }

  const handleSigninNavigation = async () => {
    if (isLoadingSignin) return // Prevent multiple clicks

    setIsLoadingSignin(true)
    setIsMenuOpen(false) // Close mobile menu if open

    // Small delay to show the loading feedback before navigation
    setTimeout(() => {
      router.push('/auth/signin')
    }, 150) // 150ms delay to feel the click

    // Keep loading state active until navigation completes
    setTimeout(() => {
      setIsLoadingSignin(false)
    }, 1200) // Keep spinner for 1.2s to cover navigation
  }

  const handleSignupNavigation = async () => {
    if (isLoadingSignup) return // Prevent multiple clicks

    setIsLoadingSignup(true)
    setIsMenuOpen(false) // Close mobile menu if open

    // Small delay to show the loading feedback before navigation
    setTimeout(() => {
      router.push('/auth/signup')
    }, 150) // 150ms delay to feel the click

    // Keep loading state active until navigation completes
    setTimeout(() => {
      setIsLoadingSignup(false)
    }, 1200) // Keep spinner for 1.2s to cover navigation
  }

  const handleLogout = async () => {
    if (isLoggingOut) return // Prevent multiple clicks

    setIsLoggingOut(true)
    setIsDashboardMenuOpen(false) // Close dropdown menu

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Erreur lors de la déconnexion:', error)
        toast.error('Erreur de déconnexion', {
          description: 'Impossible de vous déconnecter. Veuillez réessayer.'
        })
      } else {
        // Successfully logged out
        setIsAuthenticated(false)
        toast.success('Déconnexion réussie', {
          description: 'À bientôt !'
        })
        // Redirect to home page
        router.push('/')
      }
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error)
      toast.error('Erreur de déconnexion', {
        description: 'Une erreur inattendue s\'est produite.'
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <nav 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl rounded-xl transition-all duration-300 ${
        scrolled 
          ? 'bg-black/60 backdrop-blur-lg border border-gray-700/30' 
          : 'bg-black/40 backdrop-blur-md border border-gray-700/20'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <Link 
          href="/" 
          className="flex items-center space-x-2 text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent flex-shrink-0"
          aria-label="Gazoduc Invest"
        >
          <img
            src="/Gazoduc.png?v=1"
            alt="Logo Gazoduc Invest"            className="w-8 h-10 mr-3 object-contain"

            onError={(e) => console.log('Logo failed to load:', e)}
          />
          <span>Gazoduc Invest</span>
        </Link>
        
        {/* Menu Desktop */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          <Link 
            href="#about" 
            className="text-gray-300 hover:text-white transition-colors font-medium text-sm uppercase tracking-wider hover:bg-gray-800/50 px-3 py-2 rounded-lg"
          >
            À propos
          </Link>
          <Link 
            href="#plans" 
            className="text-gray-300 hover:text-white transition-colors font-medium text-sm uppercase tracking-wider hover:bg-gray-800/50 px-3 py-2 rounded-lg"
          >
            Nos offres
          </Link>
          <Link 
            href="#pricing" 
            className="text-gray-300 hover:text-white transition-colors font-medium text-sm uppercase tracking-wider hover:bg-gray-800/50 px-3 py-2 rounded-lg"
          >
            Pricing
          </Link>
          <Link 
            href="#contact" 
            className="text-gray-300 hover:text-white transition-colors font-medium text-sm uppercase tracking-wider hover:bg-gray-800/50 px-3 py-2 rounded-lg"
          >
            Contact
          </Link>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          
          <div className="hidden md:flex items-center space-x-3 xl:space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                {/* Dashboard Button with Adjacent Dropdown Arrow */}
                <div className="flex items-center">
                  <button 
                    onClick={handleDashboardNavigation}
                    disabled={isLoadingDashboard}
                    className={`bg-gradient-to-r from-red-500 to-red-600 text-white px-4 xl:px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm shadow-lg shadow-red-500/20 flex items-center disabled:opacity-70 disabled:cursor-not-allowed ${
                      isLoadingDashboard ? 'animate-pulse scale-105' : 'hover:opacity-90'
                    }`}
                  >
                    {isLoadingDashboard ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Accès en cours...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        <span className="hidden xl:block">Tableau de bord</span>
                        <span className="xl:hidden">Dashboard</span>
                      </>
                    )}
                  </button>

                  {/* Adjacent Clickable Dropdown Arrow */}
                  {!isLoadingDashboard && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsDashboardMenuOpen(!isDashboardMenuOpen)
                      }}
                      className={`ml-2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200 border border-white/20 hover:border-white/40 group ${
                        isDashboardMenuOpen ? 'rotate-180 scale-110 bg-white/20' : 'hover:scale-105'
                      }`}
                      aria-label="Options du tableau de bord"
                    >
                      <svg 
                        className={`w-4 h-4 text-white transition-transform duration-200 ${
                          isDashboardMenuOpen ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}

                  {/* Dropdown Menu */}
                  {isDashboardMenuOpen && !isLoadingDashboard && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-auto min-w-48 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-lg shadow-xl py-2 z-50"
                    >
                      {/* User Info Section */}
                      <div className="px-3 py-2 border-b border-gray-700/50 mb-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {getUserDisplayName().charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white text-sm font-medium">
                              {getUserDisplayName()}
                            </span>
                            {fromLanding && (
                              <span className="text-xs text-red-300 bg-red-500/20 px-2 py-0.5 rounded-full">
                                Via landing
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed rounded-md mx-1"
                      >
                        {isLoggingOut ? (
                          <>
                            <ArrowPathIcon className="w-4 h-4 mr-3 animate-spin" />
                            <span className="text-sm">Déconnexion...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="text-sm font-medium">Déconnexion</span>
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <motion.button
                  onClick={handleSigninNavigation}
                  disabled={isLoadingSignin}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className={`text-gray-300 hover:text-white transition-all duration-200 font-medium text-sm flex items-center disabled:opacity-70 disabled:cursor-not-allowed ${
                    isLoadingSignin ? 'animate-pulse' : 'hover:bg-gray-800/50 px-3 py-2 rounded-lg'
                  }`}
                >
                  {isLoadingSignin ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <span className="hidden sm:block">Connexion</span>
                  )}
                </motion.button>
                <motion.button
                  onClick={handleSignupNavigation}
                  disabled={isLoadingSignup}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className={`bg-gradient-to-r from-red-500 to-red-600 text-white px-4 xl:px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm shadow-lg shadow-red-500/20 flex items-center disabled:opacity-70 disabled:cursor-not-allowed ${
                    isLoadingSignup ? 'animate-pulse scale-105' : 'hover:opacity-90'
                  }`}
                >
                  {isLoadingSignup ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    <span className="hidden xl:block">S&apos;inscrire</span>
                  )}
                </motion.button>
              </>
            )}
          </div>

          {/* Bouton menu mobile */}
          <button 
            className="lg:hidden p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800 mt-2 rounded-b-xl overflow-hidden max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col space-y-1 p-3 sm:p-4">
            <Link 
              href="#about" 
              className="text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-gray-800 font-medium text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              À propos
            </Link>
            <Link 
              href="#plans" 
              className="text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-gray-800 font-medium text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              Nos offres
            </Link>
            <Link 
              href="#testimonials" 
              className="text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-gray-800 font-medium text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              Témoignages
            </Link>
            <Link 
              href="#contact" 
              className="text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-gray-800 font-medium text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-2 mt-2 border-t border-gray-800">
              {isAuthenticated ? (
                <button 
                  onClick={handleDashboardNavigation}
                  disabled={isLoadingDashboard}
                  className={`w-full text-center bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed ${
                    isLoadingDashboard ? 'animate-pulse scale-105' : 'hover:opacity-90'
                  }`}
                >
                  {isLoadingDashboard ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Accès en cours...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Tableau de bord
                    </>
                  )}
                </button>
              ) : (
                <>
                  <motion.button
                    onClick={handleSigninNavigation}
                    disabled={isLoadingSignin}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.1 }}
                    className={`w-full text-center text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-gray-800 mb-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed ${
                      isLoadingSignin ? 'animate-pulse' : ''
                    }`}
                  >
                    {isLoadingSignin ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      'Connexion'
                    )}
                  </motion.button>
                  <motion.button
                    onClick={handleSignupNavigation}
                    disabled={isLoadingSignup}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.1 }}
                    className={`w-full text-center bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed ${
                      isLoadingSignup ? 'animate-pulse scale-105' : ''
                    }`}
                  >
                    {isLoadingSignup ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        Inscription...
                      </>
                    ) : (
                      "S'inscrire"
                    )}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
    </>
  )
}
