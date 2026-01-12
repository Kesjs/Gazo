import { motion } from 'framer-motion'
import { CheckCircle2, Shield, AlertCircle } from 'lucide-react'

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated' | 'error'

interface AuthLoaderProps {
  status: AuthStatus
  progress: number
  title?: string
  description?: string
}

export function AuthLoader({
  status,
  progress,
  title,
  description
}: AuthLoaderProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: (
            <div className="relative">
              <Shield className="w-16 h-16 text-blue-500" />
              <motion.div
                className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ),
          defaultTitle: 'Vérification de sécurité',
          defaultDescription: 'Authentification en cours...',
          textColor: 'text-blue-400'
        }
      case 'authenticated':
        return {
          icon: (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </motion.div>
          ),
          defaultTitle: 'Connexion réussie',
          defaultDescription: 'Redirection vers votre espace...',
          textColor: 'text-green-400'
        }
      case 'unauthenticated':
        return {
          icon: <AlertCircle className="w-16 h-16 text-orange-500" />,
          defaultTitle: 'Session expirée',
          defaultDescription: 'Veuillez vous reconnecter',
          textColor: 'text-orange-400'
        }
      case 'error':
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-500" />,
          defaultTitle: 'Erreur de connexion',
          defaultDescription: 'Redirection en cours...',
          textColor: 'text-red-400'
        }
    }
  }

  const statusConfig = getStatusConfig()
  const displayTitle = title || statusConfig.defaultTitle
  const displayDescription = description || statusConfig.defaultDescription

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 max-w-md w-full text-center"
    >
      {/* Icon */}
      <div className="flex justify-center mb-6">
        {statusConfig.icon}
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {displayTitle}
      </h2>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {displayDescription}
      </p>

      {/* Progress bar */}
      {status === 'checking' && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {progress}%
          </p>
        </div>
      )}

      {/* Security badge */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Shield className="w-4 h-4" />
          <span>Connexion sécurisée SSL</span>
        </div>
      </div>
    </motion.div>
  )
}
