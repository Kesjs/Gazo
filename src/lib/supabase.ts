import { createBrowserClient } from '@supabase/ssr'
import { ENV_CONSTANTS } from './env-constants'

/**
 * Crée et retourne un client Supabase pour le navigateur
 * Utilise les constantes d'environnement
 * 
 * @returns Client Supabase configuré
 */
export function createClient() {
  return createBrowserClient(
    ENV_CONSTANTS.SUPABASE_URL,
    ENV_CONSTANTS.SUPABASE_ANON_KEY
  )
}
