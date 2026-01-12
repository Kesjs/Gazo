// src/app/api/payments/check/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { TronPaymentMonitor } from '@/services/tronPaymentMonitor'
import { EarningsService } from '@/services/earningsService'

// Adresse de surveillance (celle fournie par l'utilisateur)
const PAYMENT_ADDRESS = '0x63eF5b765D8d408274172804D31fB0a2Ea5416c0'

const paymentMonitor = new TronPaymentMonitor()
const earningsService = new EarningsService()

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Démarrage vérification des paiements...')

    // Vérifie la connectivité TronWeb
    const isConnected = await paymentMonitor.isConnected()
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Impossible de se connecter à TronWeb' },
        { status: 503 }
      )
    }

    // Recherche les paiements
    const payments = await paymentMonitor.checkPayments()

    // Traite chaque paiement trouvé
    const processedPayments = []
    for (const payment of payments) {
      try {
        const success = await earningsService.processPayment(payment)
        if (success) {
          processedPayments.push({
            amount: payment.amount,
            hash: payment.hash,
            from: payment.from,
            timestamp: payment.timestamp
          })
        }
      } catch (error) {
        console.error(`Erreur traitement paiement ${payment.hash}:`, error)
      }
    }

    // Active les souscriptions en attente (24h+)
    await earningsService.activatePendingSubscriptions()

    return NextResponse.json({
      success: true,
      message: 'Vérification terminée',
      paymentsFound: payments.length,
      paymentsProcessed: processedPayments.length,
      payments: processedPayments
    })

  } catch (error) {
    console.error('Erreur API vérification paiements:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'activate_pending') {
      await earningsService.activatePendingSubscriptions()
      return NextResponse.json({ success: true, message: 'Souscriptions activées' })
    }

    if (action === 'daily_credits') {
      await earningsService.processDailyCredits()
      return NextResponse.json({ success: true, message: 'Crédits journaliers appliqués' })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })

  } catch (error) {
    console.error('Erreur API action:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
