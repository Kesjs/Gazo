import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { planId, amount } = await request.json()

  console.log('🔍 API Subscribe - Données reçues:', { planId, amount })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  console.log('👤 Utilisateur authentifié:', user.id)

  try {
    // Générer un ID de session unique
    const sessionId = `pay_${Date.now()}_${randomBytes(4).toString('hex')}`
    console.log('🆔 Session ID généré:', sessionId)

    // Adresse USDT de l'entreprise (à remplacer par une vraie adresse)
    const companyUSDTAddress = process.env.COMPANY_USDT_ADDRESS || 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuW9'

    // Calculer la date d'expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    console.log('⏰ Expiration:', expiresAt.toISOString())

    // Créer d'abord la souscription en status 'active' (temporaire pour contourner la contrainte)
    console.log('📝 Création de la souscription...')
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount,
        status: 'active', // Temporairement 'active' au lieu de 'pending'
        start_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (subError) {
      console.error('❌ Erreur création souscription:', subError)
      return NextResponse.json({ error: 'Erreur lors de la création de la souscription' }, { status: 400 })
    }

    console.log('✅ Souscription créée:', subscription.id)

    // Vérifier si la table payment_sessions existe et la créer si nécessaire
    console.log('🔍 Vérification de la table payment_sessions...')

    // Étape 1: Tester une requête simple pour voir si la table existe
    try {
      console.log('🔍 Test 1: SELECT simple...')
      const { data: simpleTest, error: simpleError } = await supabase
        .from('payment_sessions')
        .select('id')
        .limit(1)

      if (simpleError) {
        console.log('❌ Test 1 échoué:', simpleError)
        console.log('❌ Code d\'erreur:', simpleError.code)
        console.log('❌ Message:', simpleError.message)

        if (simpleError.code === 'PGRST204' || simpleError.code === '42703') {
          console.log('🚨 TABLE payment_sessions ENDOMMAGÉE OU INEXISTANTE !')
          console.log('🔧 Suppression et recréation complète...')

          // Étape 1: Supprimer la table défaillante
          console.log('🗑️ Suppression de la table défaillante...')
          const dropQuery = `DROP TABLE IF EXISTS payment_sessions CASCADE;`
          const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropQuery })

          if (dropError) {
            console.log('⚠️ Échec de suppression via RPC (normal):', dropError.message)
          } else {
            console.log('✅ Table supprimée via RPC')
          }

          // Étape 2: Créer la table correctement
          console.log('🏗️ Création de la nouvelle table...')
          const createQuery = `
            CREATE TABLE payment_sessions (
              id SERIAL PRIMARY KEY,
              user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
              subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
              session_id TEXT UNIQUE NOT NULL,
              payment_address TEXT NOT NULL,
              amount DECIMAL(10,2) NOT NULL,
              status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
              blockchain_tx_hash TEXT,
              expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
              completed_at TIMESTAMP WITH TIME ZONE
            );
          `

          const { error: createError } = await supabase.rpc('exec_sql', { sql: createQuery })

          if (createError) {
            console.log('❌ Échec de création via RPC:', createError)

            // Retourner une erreur avec les instructions manuelles
            await supabase.from('subscriptions').delete().eq('id', subscription.id)
            return NextResponse.json({
              error: 'Table payment_sessions inaccessible',
              details: 'Création automatique impossible',
              manual_solution: {
                step1: 'DROP TABLE IF EXISTS payment_sessions CASCADE;',
                step2: `CREATE TABLE payment_sessions (
                  id SERIAL PRIMARY KEY,
                  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
                  subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
                  session_id TEXT UNIQUE NOT NULL,
                  payment_address TEXT NOT NULL,
                  amount DECIMAL(10,2) NOT NULL,
                  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
                  blockchain_tx_hash TEXT,
                  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                  completed_at TIMESTAMP WITH TIME ZONE
                );`,
                step3: 'GRANT ALL ON payment_sessions TO anon, authenticated;',
                step4: 'ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;'
              }
            }, { status: 500 })
          }

          console.log('✅ Nouvelle table créée avec succès !')

          // Étape 3: Permissions
          const permQuery = `GRANT ALL ON payment_sessions TO anon, authenticated;`
          await supabase.rpc('exec_sql', { sql: permQuery })

          // Étape 4: RLS
          const rlsQuery = `ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;`
          await supabase.rpc('exec_sql', { sql: rlsQuery })

          console.log('✅ Permissions et RLS configurés')
        }
      } else {
        console.log('✅ Test 1 réussi - Table existe')
      }
    } catch (testError) {
      console.log('💥 Erreur lors du test:', testError)
    }

    // Créer la session de paiement
    console.log('💰 Création de la session de paiement...')
    console.log('📊 Données:', {
      user_id: user.id,
      subscription_id: subscription.id,
      session_id: sessionId,
      payment_address: companyUSDTAddress,
      amount: amount,
      expires_at: expiresAt.toISOString()
    })

    const { data: paymentSession, error: paymentError } = await supabase
      .from('payment_sessions')
      .insert({
        user_id: user.id,
        subscription_id: subscription.id,
        session_id: sessionId,
        payment_address: companyUSDTAddress,
        amount,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (paymentError) {
      console.error('❌ Erreur création session paiement:', paymentError)
      console.error('❌ Code:', paymentError.code)
      console.error('❌ Message:', paymentError.message)
      console.error('❌ Détails:', paymentError.details)
      console.error('❌ Hint:', paymentError.hint)

      // Nettoyer la souscription
      console.log('🗑️ Nettoyage: suppression de la souscription...')
      await supabase.from('subscriptions').delete().eq('id', subscription.id)

      return NextResponse.json({
        error: 'Erreur lors de la création de la session de paiement',
        details: paymentError.message,
        code: paymentError.code
      }, { status: 400 })
    }

    console.log('✅ Session de paiement créée:', paymentSession.id)

    // Mettre à jour le static_balance de la souscription avec le montant investi
    console.log('💰 Mise à jour du solde investi...')

    // Vérifier d'abord si la colonne updated_at existe
    try {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          static_balance: amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id)

      if (updateError) {
        console.error('❌ Erreur mise à jour solde:', updateError)
        // Si c'est une erreur de colonne updated_at, essayer sans
        if (updateError.message && updateError.message.includes('updated_at')) {
          console.log('🔄 Tentative sans updated_at...')
          const { error: updateError2 } = await supabase
            .from('subscriptions')
            .update({
              static_balance: amount
            })
            .eq('id', subscription.id)

          if (updateError2) {
            console.error('❌ Erreur mise à jour solde (sans updated_at):', updateError2)
          } else {
            console.log('✅ Solde investi mis à jour (sans updated_at)')
          }
        }
      } else {
        console.log('✅ Solde investi mis à jour')
      }
    } catch (error) {
      console.error('💥 Erreur inattendue lors de la mise à jour:', error)
    }

    return NextResponse.json({
      success: true,
      sessionId,
      paymentAddress: companyUSDTAddress,
      amount,
      expiresAt: expiresAt.toISOString(),
      userId: user.id
    })

  } catch (error) {
    console.error('💥 Erreur API subscribe:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
