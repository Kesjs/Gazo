import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: subs } = await supabase.from('subscriptions').select('*, plans(*)').eq('user_id', user.id).eq('status', 'active')

  let totalEarnings = 0
  subs?.forEach((sub: any) => {
    const days = Math.floor((Date.now() - new Date(sub.start_date).getTime()) / (1000 * 60 * 60 * 24))
    totalEarnings += days * sub.plans.daily_profit
  })

  // Insert earnings transaction if not already
  if (totalEarnings > 0) {
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'earnings',
      amount: totalEarnings,
    })
  }

  return NextResponse.json({ earnings: totalEarnings })
}
