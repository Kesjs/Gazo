import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  fr: {
    translation: {
      welcome: "Bienvenue sur Gazoduc Invest",
      investLNG: "Investissez dans le Gaz Naturel Liquéfié (GNL)",
      signUp: "S'inscrire",
      signIn: "Se connecter",
      dashboard: "Tableau de bord",
      // add more translations as needed
    }
  },
  en: {
    translation: {
      welcome: "Welcome to Gazoduc Invest",
      investLNG: "Invest in Liquefied Natural Gas (LNG)",
      signUp: "Sign Up",
      signIn: "Sign In",
      dashboard: "Dashboard",
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
