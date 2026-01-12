/**
 * Configuration centralisée de l'application
 * Les variables sont injectées par Next.js au moment de la compilation
 */

export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
} as const

// Validation côté serveur uniquement
if (typeof window === 'undefined') {
  if (!config.supabase.url) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL manquante')
  }
  if (!config.supabase.anonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY manquante')
  }
}
