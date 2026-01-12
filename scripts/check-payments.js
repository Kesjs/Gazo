#!/usr/bin/env node

/**
 * Script de vérification automatique des paiements USDT
 * À exécuter toutes les heures via cron job
 *
 * Usage: node scripts/check-payments.js
 * Ou via cron: 0 * * * * cd /path/to/project && node scripts/check-payments.js
 */

import { TronPaymentMonitor } from '../src/services/tronPaymentMonitor.js'
import { EarningsService } from '../src/services/earningsService.js'
import { NotificationService } from '../src/services/notificationService.js'

async function checkPayments() {
  console.log(`[${new Date().toISOString()}] 🔍 Démarrage vérification automatique des paiements...`)

  try {
    const paymentMonitor = new TronPaymentMonitor()
    const earningsService = new EarningsService()
    const notificationService = new NotificationService()

    // Vérifier la connectivité
    const isConnected = await paymentMonitor.isConnected()
    if (!isConnected) {
      console.error('❌ Impossible de se connecter à TronWeb')
      process.exit(1)
    }

    // Rechercher les paiements
    const payments = await paymentMonitor.checkPayments()
    console.log(`📊 ${payments.length} paiement(s) détecté(s)`)

    // Traiter chaque paiement
    let processedCount = 0
    for (const payment of payments) {
      try {
        const success = await earningsService.processPayment(payment)
        if (success) {
          processedCount++
          console.log(`✅ Paiement traité: ${payment.amount}€ pour ${payment.userId}`)
        }
      } catch (error) {
        console.error(`❌ Erreur traitement paiement ${payment.hash}:`, error)
      }
    }

    // Activer les souscriptions en attente (24h+)
    await earningsService.activatePendingSubscriptions()
    console.log('⏰ Souscriptions en attente vérifiées')

    // Appliquer les crédits journaliers
    await earningsService.processDailyCredits()
    console.log('💰 Crédits journaliers appliqués')

    // Nettoyer les anciennes notifications (30 jours+)
    await notificationService.cleanupOldNotifications()
    console.log('🧹 Anciennes notifications nettoyées')

    console.log(`[${new Date().toISOString()}] ✅ Vérification terminée: ${processedCount} paiement(s) traité(s)`)

  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Erreur vérification paiements:`, error)
    process.exit(1)
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  checkPayments()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erreur fatale:', error)
      process.exit(1)
    })
}

export { checkPayments }
