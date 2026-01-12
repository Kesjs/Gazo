/**
 * Constantes d'environnement
 * Ces valeurs sont chargées au build time par Next.js
 */

// Récupération des variables avec valeurs par défaut
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jblynzsxefbfhmgrhfyy.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibHluenN4ZWZiZmhtZ3JoZnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTkxMTUsImV4cCI6MjA3NjczNTExNX0.2TXI_7BkkaJvQxTxNuaBCPdlamc7NRlBn11bsRoDBD0'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const ENV_CONSTANTS = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  APP_URL,
} as const

// Log en développement pour vérifier
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔧 ENV_CONSTANTS loaded:', {
    SUPABASE_URL: ENV_CONSTANTS.SUPABASE_URL ? '✅' : '❌',
    SUPABASE_ANON_KEY: ENV_CONSTANTS.SUPABASE_ANON_KEY ? '✅' : '❌',
    APP_URL: ENV_CONSTANTS.APP_URL,
  })
}
