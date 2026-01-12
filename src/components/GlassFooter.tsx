import { useRouter } from 'next/navigation'

export default function GlassFooter() {
  const router = useRouter()

  const navigateTo = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      router.push(href)
    }
  }

  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Entreprise */}
          <div className="md:col-span-2">
            <h3 className="text-white font-bold text-xl mb-4">Gazoduc Invest</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              Investissez dans l&apos;énergie de demain avec le Gaz Naturel Liquéfié.
              Des rendements sécurisés pour votre avenir financier.
            </p>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">
                <span className="font-medium">Email:</span> contact@gazoducinvest.com
              </p>
              <p className="text-gray-400 text-sm">
                <span className="font-medium">Support:</span> 24/7 disponible
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold text-base mb-6">Navigation</h4>
            <nav>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => navigateTo('/')}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm block"
                  >
                    Accueil
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('/dashboard')}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm block"
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('#plans')}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm block"
                  >
                    Nos offres
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('#about')}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm block"
                  >
                    À propos
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-base mb-6">Support</h4>
            <nav>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => navigateTo('/support')}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm block"
                  >
                    Centre d&apos;aide
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('/contact')}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm block"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('/politique-confidentialite')}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm block"
                  >
                    Confidentialité
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-800 mt-12 mb-8"></div>

        {/* Copyright et Légal alignés */}
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
          <p className="text-gray-400 text-sm">
            © 2025 Gazoduc Invest. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <button
              onClick={() => navigateTo('/terms')}
              className="hover:text-white transition-colors duration-200"
            >
              Conditions générales
            </button>
            <span>•</span>
            <button
              onClick={() => navigateTo('/privacy')}
              className="hover:text-white transition-colors duration-200"
            >
              Politique de confidentialité
            </button>
            <span>•</span>
            <button
              onClick={() => navigateTo('/cookies')}
              className="hover:text-white transition-colors duration-200"
            >
              Gestion des cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
