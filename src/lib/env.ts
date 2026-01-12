/**
 * Utilitaire centralisé pour la gestion et validation des variables d'environnement
 * Garantit que toutes les variables requises sont présentes et valides
 */

interface EnvConfig {
  // Variables publiques (accessibles côté client)
  public: {
    supabaseUrl: string
    supabaseAnonKey: string
    appUrl: string
  }
  // Variables privées (uniquement côté serveur)
  private: {
    supabaseServiceRoleKey?: string
  }
  // Métadonnées
  nodeEnv: 'development' | 'production' | 'test'
  isDevelopment: boolean
  isProduction: boolean
  isTest: boolean
}

/**
 * Récupère une variable d'environnement avec validation
 */
function getEnvVar(
  key: string,
  options: {
    required?: boolean
    defaultValue?: string
    isPublic?: boolean
  } = {}
): string {
  const { required = true, defaultValue = '', isPublic = true } = options
  
  // Récupérer la valeur depuis process.env
  const value = process.env[key]

  // Si la variable n'existe pas ou est vide
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    if (required) {
      // Côté serveur uniquement, on peut throw
      if (typeof window === 'undefined') {
        console.error(
          `❌ Variable d'environnement requise manquante: ${key}\n` +
          `Créez un fichier .env.local à la racine du projet.\n` +
          `Consultez .env.example pour un modèle de configuration.`
        )
        throw new Error(`Variable manquante: ${key}`)
      }
      // Côté client, on log et retourne la valeur par défaut
      console.warn(`⚠️ Variable manquante côté client: ${key}, utilisation de la valeur par défaut`)
      return defaultValue
    }
    return defaultValue
  }

  // Vérification de sécurité pour les variables publiques
  if (isPublic && !key.startsWith('NEXT_PUBLIC_')) {
    if (typeof window === 'undefined') {
      console.warn(
        `⚠️  La variable "${key}" devrait commencer par NEXT_PUBLIC_ ` +
        `pour être accessible côté client.`
      )
    }
  }

  // Vérification de sécurité pour les variables privées
  if (!isPublic && key.startsWith('NEXT_PUBLIC_')) {
    throw new Error(
      `🔒 ERREUR DE SÉCURITÉ: "${key}" ne doit PAS commencer par NEXT_PUBLIC_\n` +
      `Cette variable contient des informations sensibles.`
    )
  }

  return typeof value === 'string' ? value.trim() : String(value)
}

/**
 * Valide le format d'une URL
 */
function validateUrl(url: string, name: string): void {
  try {
    new URL(url)
  } catch {
    throw new Error(
      `❌ URL invalide pour ${name}: ${url}\n` +
      `Format attendu: https://exemple.com`
    )
  }
}

/**
 * Valide la configuration Supabase
 */
function validateSupabaseConfig(url: string, key: string): void {
  // Valider l'URL
  validateUrl(url, 'NEXT_PUBLIC_SUPABASE_URL')

  // Vérifier que c'est bien une URL Supabase
  if (!url.includes('supabase')) {
    console.warn(
      `⚠️  L'URL ne semble pas être une URL Supabase: ${url}\n` +
      `Format attendu: https://xxxxx.supabase.co`
    )
  }

  // Vérifier la longueur de la clé
  if (key.length < 30) {
    throw new Error(
      `❌ La clé Supabase semble invalide (${key.length} caractères).\n` +
      `Vérifiez que vous avez copié la clé complète.`
    )
  }

  // Détecter les valeurs de test/exemple
  const testPatterns = ['your-', 'example', 'test', 'demo', 'xxxxx', 'votre']
  const lowerKey = key.toLowerCase()
  const lowerUrl = url.toLowerCase()

  for (const pattern of testPatterns) {
    if (lowerKey.includes(pattern) || lowerUrl.includes(pattern)) {
      throw new Error(
        `❌ Configuration Supabase invalide détectée.\n` +
        `Vous utilisez des valeurs de test/exemple.\n` +
        `Obtenez vos vraies clés depuis: https://app.supabase.com`
      )
    }
  }
}

/**
 * Charge et valide toutes les variables d'environnement
 * À appeler au démarrage de l'application
 */
export function loadEnvConfig(): EnvConfig {
  try {
    // Variables publiques (côté client)
    const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', { 
      isPublic: true,
      required: typeof window === 'undefined', // Requis seulement côté serveur
      defaultValue: ''
    })
    const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', { 
      isPublic: true,
      required: typeof window === 'undefined', // Requis seulement côté serveur
      defaultValue: ''
    })
    const appUrl = getEnvVar('NEXT_PUBLIC_APP_URL', {
      isPublic: true,
      required: false,
      defaultValue: 'http://localhost:3000'
    })

    // Valider la configuration Supabase seulement côté serveur
    if (typeof window === 'undefined' && supabaseUrl && supabaseAnonKey) {
      validateSupabaseConfig(supabaseUrl, supabaseAnonKey)
      validateUrl(appUrl, 'NEXT_PUBLIC_APP_URL')
    }

    // Variables privées (côté serveur uniquement)
    const supabaseServiceRoleKey = typeof window === 'undefined' 
      ? getEnvVar('SUPABASE_SERVICE_ROLE_KEY', {
          isPublic: false,
          required: false
        })
      : undefined

    // Métadonnées d'environnement
    const nodeEnv = (process.env.NODE_ENV || 'development') as EnvConfig['nodeEnv']

    const config: EnvConfig = {
      public: {
        supabaseUrl: supabaseUrl || '',
        supabaseAnonKey: supabaseAnonKey || '',
        appUrl: appUrl || 'http://localhost:3000'
      },
      private: {
        supabaseServiceRoleKey: supabaseServiceRoleKey || undefined
      },
      nodeEnv,
      isDevelopment: nodeEnv === 'development',
      isProduction: nodeEnv === 'production',
      isTest: nodeEnv === 'test'
    }

    // Log en développement côté serveur uniquement
    if (config.isDevelopment && typeof window === 'undefined') {
      console.log('✅ Configuration d\'environnement chargée avec succès')
      console.log('📍 Environnement:', nodeEnv)
      console.log('🌐 URL Supabase:', supabaseUrl)
      console.log('🔗 URL Application:', appUrl)
    }

    return config
  } catch (error) {
    // Log détaillé en développement côté serveur uniquement
    if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
      console.error('\n' + '='.repeat(80))
      console.error('🚨 ERREUR DE CONFIGURATION')
      console.error('='.repeat(80))
      console.error(error instanceof Error ? error.message : String(error))
      console.error('='.repeat(80))
      console.error('\n📝 Actions à effectuer:')
      console.error('1. Copiez .env.example vers .env.local')
      console.error('2. Remplissez les valeurs depuis https://app.supabase.com')
      console.error('3. Redémarrez le serveur de développement')
      console.error('='.repeat(80) + '\n')
    }

    // Côté client, retourner une config par défaut au lieu de throw
    if (typeof window !== 'undefined') {
      console.warn('⚠️ Utilisation de la configuration par défaut côté client')
      return {
        public: {
          supabaseUrl: '',
          supabaseAnonKey: '',
          appUrl: 'http://localhost:3000'
        },
        private: {},
        nodeEnv: 'development',
        isDevelopment: true,
        isProduction: false,
        isTest: false
      }
    }

    throw error
  }
}

/**
 * Instance singleton de la configuration
 * Chargée une seule fois au démarrage
 */
let envConfig: EnvConfig | null = null

/**
 * Récupère la configuration d'environnement
 * Charge la config si ce n'est pas déjà fait
 */
export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    envConfig = loadEnvConfig()
  }
  return envConfig
}

/**
 * Utilitaires d'accès rapide aux variables courantes
 */
export const env = {
  get supabaseUrl() {
    return getEnvConfig().public.supabaseUrl
  },
  get supabaseAnonKey() {
    return getEnvConfig().public.supabaseAnonKey
  },
  get appUrl() {
    return getEnvConfig().public.appUrl
  },
  get supabaseServiceRoleKey() {
    return getEnvConfig().private.supabaseServiceRoleKey
  },
  get isDevelopment() {
    return getEnvConfig().isDevelopment
  },
  get isProduction() {
    return getEnvConfig().isProduction
  },
  get isTest() {
    return getEnvConfig().isTest
  }
}
