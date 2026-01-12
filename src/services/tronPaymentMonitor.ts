// src/services/tronPaymentMonitor.ts
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { NotificationService } from './notificationService'
// TronWeb will be loaded dynamically

export interface PaymentTransaction {
  hash: string
  from: string
  to: string
  amount: number
  timestamp: number
  confirmed: boolean
  userId?: string
  planId?: string
}

export class TronPaymentMonitor {
  private tronWeb: any
  private supabase = createAdminSupabaseClient()
  private notificationService = new NotificationService()

  // Adresse USDT TRC20 de l'entreprise
  private PAYMENT_ADDRESS = '0x63eF5b765D8d408274172804D31fB0a2Ea5416c0'

  // Adresse USDT TRC20 contract sur Tron
  private USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'

  // Montants des packs (en euros)
  private PACK_AMOUNTS = [100, 225, 999, 1999]

  constructor() {
    // TronWeb will be initialized asynchronously
    this.initializeTronWeb()
  }

  private async initializeTronWeb() {
    try {
      // Wait for TronWeb to be available (loaded via CDN in client)
      let attempts = 0
      while (!(globalThis as any).TronWeb && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      if ((globalThis as any).TronWeb) {
        const TronWeb = (globalThis as any).TronWeb
        // Initialisation TronWeb avec noeuds publics gratuits
        this.tronWeb = new TronWeb({
          fullHost: 'https://api.trongrid.io',
          headers: { 'TRON-PRO-API-KEY': process.env.TRONGRID_API_KEY || '' }
        })
        console.log('TronPaymentMonitor: TronWeb initialized')
      } else {
        console.error('TronPaymentMonitor: TronWeb not available after waiting')
        this.tronWeb = null
      }
    } catch (error) {
      console.error('Failed to initialize TronWeb:', error)
      this.tronWeb = null
    }
  }

  /**
   * Vérifie la connectivité TronWeb
   */
  async isConnected(): Promise<boolean> {
    // Wait for TronWeb to be initialized if it's not ready yet
    if (!this.tronWeb) {
      await new Promise(resolve => setTimeout(resolve, 200)) // Wait a bit longer
      if (!this.tronWeb) return false
    }

    try {
      await this.tronWeb.trx.getNodeInfo()
      return true
    } catch (error) {
      console.error('Erreur connexion TronWeb:', error)
      return false
    }
  }

  /**
   * Vérifie les paiements USDT vers l'adresse fixe
   */
  async checkPayments(): Promise<PaymentTransaction[]> {
    // Ensure TronWeb is initialized
    if (!this.tronWeb) {
      await new Promise(resolve => setTimeout(resolve, 300)) // Wait longer
      if (!this.tronWeb) {
        console.error('TronWeb not initialized in checkPayments')
        return []
      }
    }

    try {
      console.log(`🔍 Vérification paiements vers ${this.PAYMENT_ADDRESS}...`)

      // Récupère les événements Transfer du contrat USDT
      const events = await this.tronWeb.getEventResult(
        this.USDT_CONTRACT,
        {
          eventName: 'Transfer',
          filters: {
            to: this.PAYMENT_ADDRESS
          },
          size: 50, // Dernières 50 transactions
          sort: 'block_timestamp',
          order: 'desc'
        }
      )

      const validPayments: PaymentTransaction[] = []

      for (const event of events) {
        const payment = await this.processEvent(event)
        if (payment) {
          validPayments.push(payment)
        }
      }

      console.log(`✅ ${validPayments.length} paiement(s) valide(s) trouvé(s)`)
      return validPayments

    } catch (error) {
      console.error('❌ Erreur vérification paiements:', error)
      return []
    }
  }

  /**
   * Traite un événement Transfer USDT
   */
  private async processEvent(event: any): Promise<PaymentTransaction | null> {
    try {
      const txHash = event.transaction_id

      // Évite les doublons - vérifie si déjà traité
      const { data: existingPayment } = await this.supabase
        .from('subscriptions')
        .select('id')
        .eq('payment_tx_hash', txHash)
        .single()

      if (existingPayment) {
        return null // Déjà traité
      }

      // Vérifie si transaction récente (< 24h)
      const eventTime = event.block_timestamp / 1000
      const hoursAgo = (Date.now() - eventTime * 1000) / (1000 * 60 * 60)

      if (hoursAgo > 24) {
        return null
      }

      // Récupère les détails de la transaction
      const txDetails = await this.getTransactionDetails(txHash)
      if (!txDetails || !txDetails.confirmed) {
        return null
      }

      // Vérifie le montant (doit correspondre à un pack)
      const amountEUR = txDetails.amount
      if (!this.PACK_AMOUNTS.includes(amountEUR)) {
        console.log(`❌ Montant invalide: ${amountEUR}€ (doit être ${this.PACK_AMOUNTS.join(', ')}€)`)
        return null
      }

      const payment: PaymentTransaction = {
        hash: txHash,
        from: txDetails.from,
        to: txDetails.to,
        amount: amountEUR,
        timestamp: eventTime,
        confirmed: true
      }

      console.log(`💰 Paiement détecté: ${amountEUR}€ de ${payment.from}`)

      // ✅ Notification : Paiement détecté
      const userId = await this.findUserForPayment(amountEUR, eventTime)
      if (userId) {
        await this.notificationService.notifyPaymentDetected(userId, amountEUR, txHash)
      }

      return payment

    } catch (error) {
      console.error('Erreur traitement événement:', error)
      return null
    }
  }

  /**
   * Récupère les détails d'une transaction USDT
   */
  private async getTransactionDetails(txHash: string): Promise<any> {
    try {
      // Récupère la transaction
      const tx = await this.tronWeb.trx.getTransaction(txHash)
      if (!tx || tx.ret[0].contractRet !== 'SUCCESS') {
        return null
      }

      // Analyse les données de la transaction USDT
      const contract = tx.raw_data.contract[0]
      if (contract.type !== 'TriggerSmartContract') {
        return null
      }

      const parameter = contract.parameter.value
      const data = parameter.data

      // Décode les paramètres USDT Transfer (method: 0xa9059cbb)
      if (!data.startsWith('a9059cbb')) {
        return null
      }

      // Extrait le destinataire (to address)
      const toAddress = '41' + data.substr(32, 40) // Remove 0x prefix, add 41 for TRON
      const decodedTo = this.tronWeb.address.fromHex(toAddress)

      if (decodedTo !== this.PAYMENT_ADDRESS) {
        return null
      }

      // Extrait le montant (derniers 32 bytes)
      const amountHex = data.substr(-32)
      const amount = parseInt(amountHex, 16) / 1_000_000 // USDT a 6 décimales

      return {
        from: this.tronWeb.address.fromHex(parameter.owner_address),
        to: decodedTo,
        amount: Math.round(amount), // Arrondi à l'euro près
        confirmed: true
      }

    } catch (error) {
      console.error('Erreur récupération détails transaction:', error)
      return null
    }
  }

  /**
   * Trouve l'utilisateur associé à un paiement récent
   * Pour l'instant, on utilise une logique simple basée sur le timing
   */
  async findUserForPayment(amount: number, timestamp: number): Promise<string | null> {
    try {
      // Recherche les sessions de paiement actives pour ce montant
      const { data: sessions } = await this.supabase
        .from('payment_sessions')
        .select('user_id, created_at')
        .eq('amount', amount)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(5)

      if (!sessions || sessions.length === 0) {
        return null
      }

      // Prend la session la plus récente
      return sessions[0].user_id

    } catch (error) {
      console.error('Erreur recherche utilisateur:', error)
      return null
    }
  }
}
