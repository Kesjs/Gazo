import { NextRequest, NextResponse } from 'next/server'
import { EarningsService } from '@/services/earningsService'

export async function POST(request: NextRequest) {
  const { action } = await request.json()

  try {
    const earningsService = new EarningsService()

    switch (action) {
      case 'activate_pending':
        console.log('🧪 TEST: Activation des packs en attente...')
        await earningsService.activatePendingSubscriptions()
        return NextResponse.json({ success: true, message: 'Activation testée' })

      case 'process_earnings':
        console.log('🧪 TEST: Crédit des gains journaliers...')
        await earningsService.processDailyCredits()
        return NextResponse.json({ success: true, message: 'Crédits journaliers testés' })

      case 'full_cycle':
        console.log('🧪 TEST: Cycle complet (activation + gains)...')
        await earningsService.activatePendingSubscriptions()
        await earningsService.processDailyCredits()
        return NextResponse.json({ success: true, message: 'Cycle complet testé' })

      default:
        return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Erreur test:', error)
    return NextResponse.json({
      error: 'Erreur lors du test',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
