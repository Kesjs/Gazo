// src/services/notificationService.ts
import { createAdminSupabaseClient } from '@/lib/supabase-server'

export interface Notification {
  id: number
  user_id: string
  type: 'payment_detected' | 'subscription_created' | 'subscription_activated' | 'daily_credits' | 'pack_completed' | 'withdrawal_processed' | 'system_info'
  title: string
  message: string
  is_read: boolean
  related_id?: string
  metadata?: any
  created_at: string
}

export class NotificationService {
  private supabase = createAdminSupabaseClient()

  /**
   * Crée une notification pour un utilisateur
   */
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: notification.user_id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          is_read: notification.is_read || false,
          related_id: notification.related_id,
          metadata: notification.metadata
        })

      if (error) {
        console.error('Erreur création notification:', error)
      } else {
        console.log(`📢 Notification créée: ${notification.title}`)
      }
    } catch (error) {
      console.error('Erreur service notification:', error)
    }
  }

  /**
   * Notifications liées au paiement détecté
   */
  async notifyPaymentDetected(userId: string, amount: number, txHash: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: 'payment_detected',
      title: 'Paiement USDT détecté !',
      message: `Votre paiement de ${amount}€ en USDT a été détecté sur la blockchain. Votre souscription sera créée automatiquement.`,
      is_read: false,
      metadata: { amount, txHash, timestamp: new Date().toISOString() }
    })
  }

  /**
   * Notifications liées à la création de souscription
   */
  async notifySubscriptionCreated(userId: string, planName: string, amount: number, subscriptionId: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: 'subscription_created',
      title: 'Souscription créée !',
      message: `Votre souscription ${planName} de ${amount}€ a été créée avec succès. Elle sera activée dans 24 heures.`,
      is_read: false,
      related_id: subscriptionId,
      metadata: { planName, amount, status: 'pending_activation' }
    })
  }

  /**
   * Notifications liées à l'activation de souscription
   */
  async notifySubscriptionActivated(userId: string, planName: string, subscriptionId: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: 'subscription_activated',
      title: 'Pack activé ! 🎉',
      message: `Votre pack ${planName} est maintenant actif ! Les gains journaliers commenceront dès aujourd'hui.`,
      is_read: false,
      related_id: subscriptionId,
      metadata: { planName, status: 'active' }
    })
  }

  /**
   * Notifications liées aux crédits journaliers
   */
  async notifyDailyCredits(userId: string, planName: string, amount: number, totalCredits: number, subscriptionId: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: 'daily_credits',
      title: 'Crédits journaliers ajoutés ! 💰',
      message: `+${amount.toFixed(2)}€ ont été crédités à votre pack ${planName}. Total des gains : ${totalCredits.toFixed(2)}€`,
      is_read: false,
      related_id: subscriptionId,
      metadata: { planName, dailyCredit: amount, totalCredits }
    })
  }

  /**
   * Notifications liées à la fin d'un pack
   */
  async notifyPackCompleted(userId: string, planName: string, totalEarned: number, subscriptionId: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: 'pack_completed',
      title: 'Pack terminé ! 🎊',
      message: `Félicitations ! Votre pack ${planName} est terminé. Gains totaux : ${totalEarned.toFixed(2)}€`,
      is_read: false,
      related_id: subscriptionId,
      metadata: { planName, totalEarned, status: 'completed' }
    })
  }

  /**
   * Notifications liées aux retraits
   */
  async notifyWithdrawalProcessed(userId: string, amount: number, txHash?: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: 'withdrawal_processed',
      title: 'Retrait traité ! 💸',
      message: `Votre demande de retrait de ${amount.toFixed(2)}€ a été traitée avec succès.`,
      is_read: false,
      metadata: { amount, txHash, status: 'processed' }
    })
  }

  /**
   * Notifications système/information
   */
  async notifySystemInfo(userId: string, title: string, message: string, metadata?: any): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: 'system_info',
      title,
      message,
      is_read: false,
      metadata
    })
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(notificationId: number, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        console.error('Erreur marquage notification:', error)
      }
    } catch (error) {
      console.error('Erreur service notification:', error)
    }
  }

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('Erreur marquage notifications:', error)
      }
    } catch (error) {
      console.error('Erreur service notification:', error)
    }
  }

  /**
   * Supprime les anciennes notifications (plus de 30 jours)
   */
  async cleanupOldNotifications(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { error } = await this.supabase
        .from('notifications')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())

      if (error) {
        console.error('Erreur nettoyage notifications:', error)
      } else {
        console.log('🧹 Anciennes notifications nettoyées')
      }
    } catch (error) {
      console.error('Erreur nettoyage notifications:', error)
    }
  }
}
