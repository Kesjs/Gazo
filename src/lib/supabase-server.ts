import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ENV_CONSTANTS } from './env-constants'

/**
 * Crée un client Supabase pour le serveur (API Routes, Server Components)
 * Utilise les cookies pour maintenir la session utilisateur
 * 
 * @returns Client Supabase configuré côté serveur
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    ENV_CONSTANTS.SUPABASE_URL,
    ENV_CONSTANTS.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Gérer les erreurs de cookies (peut arriver dans certains contextes)
            console.error('Erreur lors de la définition du cookie:', error)
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            console.error('Erreur lors de la suppression du cookie:', error)
          }
        },
      },
    }
  )
}

/**
 * Crée un client Supabase ADMIN pour le serveur
 * Utilise la clé service_role pour contourner RLS
 * 
 * ⚠️ ATTENTION: À utiliser UNIQUEMENT pour les opérations administratives
 * Cette clé contourne toutes les politiques de sécurité RLS
 * 
 * @throws Error si la clé service_role n'est pas configurée
 * @returns Client Supabase avec privilèges administrateur
 */
export function createAdminSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error(
      '❌ SUPABASE_SERVICE_ROLE_KEY non configurée\n' +
      'Cette clé est requise pour les opérations administratives.\n' +
      'Ajoutez-la dans votre fichier .env.local'
    )
  }

  // Vérification de sécurité: s'assurer que ce n'est pas la clé anon
  if (serviceRoleKey === ENV_CONSTANTS.SUPABASE_ANON_KEY) {
    throw new Error(
      '🔒 ERREUR DE SÉCURITÉ: La clé service_role est identique à la clé anon\n' +
      'Utilisez la vraie clé service_role depuis votre dashboard Supabase'
    )
  }

  return createServerClient(
    ENV_CONSTANTS.SUPABASE_URL,
    serviceRoleKey,
    {
      cookies: {
        get() { return undefined },
        set() {},
        remove() {},
      },
    }
  )
}

/**
 * Vérifie si l'utilisateur actuel est authentifié
 * 
 * @returns true si l'utilisateur est authentifié, false sinon
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  } catch {
    return false
  }
}

/**
 * Récupère l'utilisateur actuel côté serveur
 * 
 * @returns L'utilisateur authentifié ou null
 */
export async function getCurrentUser() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Erreur inattendue:', error)
    return null
  }
}

/**
 * Vérifie si l'utilisateur actuel est un administrateur
 * 
 * @returns true si l'utilisateur est admin, false sinon
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user) return false

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('admins')
      .select('email')
      .eq('email', user.email)
      .single()

    if (error) {
      console.error('Erreur lors de la vérification admin:', error)
      return false
    }

    return !!data
  } catch {
    return false
  }
}
