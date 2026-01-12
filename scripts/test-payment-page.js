// Script de test de la page de paiement
import { NotificationService } from '../src/services/notificationService.js'

async function testPaymentPage() {
  const notificationService = new NotificationService()

  try {
    // Créer une notification de test pour simuler un paiement détecté
    await notificationService.notifyPaymentDetected(
      '550e8400-e29b-41d4-a716-446655440000', // Remplacer par un vrai userId
      100,
      'abc123def456'
    )

    console.log('✅ Test de notification de paiement réussi')
    console.log('🔗 URL de test: http://localhost:3000/dashboard/packs/payment/test-session-123')
  } catch (error) {
    console.error('❌ Erreur test notification:', error)
  }
}

testPaymentPage()
