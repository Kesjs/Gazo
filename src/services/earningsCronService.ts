// src/services/earningsCronService.ts
import { EarningsService } from './earningsService'

export class EarningsCronService {
  private earningsService = new EarningsService()
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false

  /**
   * Démarre le service cron automatique
   * Exécute les crédits journaliers toutes les heures en vérifiant s'il faut créditer
   */
  start() {
    if (this.isRunning) {
      console.log('🔄 Service cron des gains déjà en cours')
      return
    }

    console.log('🚀 Démarrage du service cron automatique des gains...')

    this.isRunning = true

    // Exécute immédiatement au démarrage
    this.processEarnings()

    // Puis tous les jours à 2h du matin (86400000 ms = 24 heures)
    this.intervalId = setInterval(() => {
      this.processEarnings()
    }, 24 * 60 * 60 * 1000) // 24 heures

    console.log('✅ Service cron démarré - Crédits vérifiés tous les jours à 2h')
  }

  /**
   * Arrête le service cron
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('🛑 Service cron des gains arrêté')
  }

  /**
   * Traite les gains (activation + crédits journaliers)
   */
  private async processEarnings() {
    try {
      console.log('⏰ Vérification automatique des gains...')

      // 1. Activer les souscriptions en attente depuis plus de 24h
      await this.earningsService.activatePendingSubscriptions()

      // 2. Créditer les gains journaliers
      await this.earningsService.processDailyCredits()

      console.log('✅ Vérification automatique terminée')

    } catch (error) {
      console.error('❌ Erreur dans le service cron:', error)
    }
  }

  /**
   * Force l'exécution immédiate (pour les tests)
   */
  async forceProcessEarnings() {
    console.log('🔧 Exécution forcée du traitement des gains...')
    await this.processEarnings()
  }

  /**
   * Vérifie si le service est en cours d'exécution
   */
  isActive() {
    return this.isRunning
  }
}

// Instance globale singleton
export const earningsCronService = new EarningsCronService()
