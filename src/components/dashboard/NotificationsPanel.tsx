// src/components/dashboard/NotificationsPanel.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Archive,
  EyeOff,
  DollarSign,
  TrendingUp,
  Gem,
  CreditCard,
  AlertCircle,
  Info
} from 'lucide-react'

interface NotificationsPanelProps {
  userId: string
}

export function NotificationsPanel({ userId }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'payment_detected',
      title: 'Paiement détecté',
      message: 'Votre paiement de 225€ a été détecté et traité.',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      id: '2',
      type: 'subscription_created',
      title: 'Souscription créée',
      message: 'Votre pack Premium GNL a été activé avec succès.',
      is_read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: '3',
      type: 'daily_credits',
      title: 'Crédits journaliers',
      message: 'Vos gains quotidiens de 3.38€ ont été crédités.',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    }
  ])

  const unreadCount = notifications.filter(n => !n.is_read).length
  const isLoading = false

  // Fonctions de gestion des notifications
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, is_read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const archiveNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const hideNotification = (notificationId: string) => {
    // Pour masquer temporairement, on pourrait ajouter un champ is_hidden
    // Pour simplifier, on archive aussi
    archiveNotification(notificationId)
  }

  // Fonction pour obtenir l'icône selon le type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_detected':
        return <DollarSign className="w-5 h-5 text-blue-500" />
      case 'subscription_created':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'subscription_activated':
        return <Gem className="w-5 h-5 text-purple-500" />
      case 'daily_credits':
        return <CreditCard className="w-5 h-5 text-yellow-500" />
      case 'pack_completed':
        return <Check className="w-5 h-5 text-emerald-500" />
      case 'withdrawal_processed':
        return <DollarSign className="w-5 h-5 text-red-500" />
      case 'system_info':
        return <Info className="w-5 h-5 text-gray-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  // Fonction pour obtenir la couleur selon le type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'payment_detected':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'subscription_created':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
      case 'subscription_activated':
        return 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20'
      case 'daily_credits':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'pack_completed':
        return 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
      case 'withdrawal_processed':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
      case 'system_info':
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  // Formater la date relative
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'À l\'instant'
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
    return `Il y a ${Math.floor(diffInSeconds / 86400)} j`
  }

  return (
    <div className="relative">
      {/* Bouton de notifications */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-0"
        aria-label={`${unreadCount} notifications non lues`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panneau de notifications */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-96 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Tout marquer lu
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Aucune notification pour le moment
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group ${
                        !notification.is_read
                          ? getNotificationColor(notification.type)
                          : 'border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.is_read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded"
                                  title="Marquer comme lu"
                                >
                                  <CheckCheck className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => hideNotification(notification.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                                title="Masquer"
                              >
                                <EyeOff className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => archiveNotification(notification.id)}
                                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                                title="Archiver"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatRelativeTime(notification.created_at)}
                            </span>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Fermer
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
