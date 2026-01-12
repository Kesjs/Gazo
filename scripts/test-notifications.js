// Script de test des notifications
import { NotificationService } from '../src/services/notificationService.js'

async function testNotifications() {
  const notificationService = new NotificationService()

  try {
    // Créer une notification de test
    await notificationService.notifySystemInfo(
      '550e8400-e29b-41d4-a716-446655440000', // Remplacer par un vrai userId
      'Test du système de notifications',
      'Ceci est une notification de test pour vérifier le fonctionnement du système.'
    )

    console.log('✅ Notification de test créée avec succès')
  } catch (error) {
    console.error('❌ Erreur lors du test des notifications:', error)
  }
}

testNotifications()
