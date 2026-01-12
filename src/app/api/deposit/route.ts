import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { amount } = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Insert transaction
  const { data, error } = await supabase.from('transactions').insert({
    user_id: user.id,
    type: 'deposit',
    amount,
  }).select()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true, transaction: data[0] })
}
