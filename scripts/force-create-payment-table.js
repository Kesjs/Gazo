#!/usr/bin/env node

/**
 * Script final pour forcer la création de la table payment_sessions
 * Utilise une approche directe avec Supabase Admin
 */

const { createClient } = require('@supabase/supabase-js');

async function forceCreatePaymentTable() {
  console.log('🚀 FORÇAGE de la création de la table payment_sessions...\n');

  // Charger les variables d'environnement
  require('dotenv').config();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes');
    console.log('🔧 Ajoutez dans votre .env.local:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=votre_url');
    console.log('SUPABASE_SERVICE_ROLE_KEY=votre_clé_service');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔍 Vérification de l\'accès admin...');

    // Tester l'accès admin
    const { data: adminTest, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .limit(1);

    if (adminError) {
      console.error('❌ Accès admin refusé:', adminError.message);
      process.exit(1);
    }

    console.log('✅ Accès admin confirmé');

    console.log('📋 Exécution des commandes SQL...');

    // Exécuter les commandes SQL une par une
    const sqlCommands = [
      // Supprimer les politiques existantes
      `DROP POLICY IF EXISTS "Users can view own payment sessions" ON public.payment_sessions;`,
      `DROP POLICY IF EXISTS "Users can insert own payment sessions" ON public.payment_sessions;`,
      `DROP POLICY IF EXISTS "Only admins can modify payment sessions" ON public.payment_sessions;`,

      // Créer la table
      `CREATE TABLE IF NOT EXISTS public.payment_sessions (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
        subscription_id INTEGER REFERENCES public.subscriptions(id) ON DELETE CASCADE,
        session_id TEXT UNIQUE NOT NULL,
        payment_address TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
        blockchain_tx_hash TEXT,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE
      );`,

      // Permissions
      `GRANT ALL ON public.payment_sessions TO anon, authenticated;`,

      // RLS
      `ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;`,

      // Politiques
      `CREATE POLICY "Users can view own payment sessions" ON public.payment_sessions
          FOR SELECT USING (auth.uid() = user_id);`,

      `CREATE POLICY "Users can insert own payment sessions" ON public.payment_sessions
          FOR INSERT WITH CHECK (auth.uid() = user_id);`,

      `CREATE POLICY "Only admins can modify payment sessions" ON public.payment_sessions
          FOR UPDATE USING (
              EXISTS (
                  SELECT 1 FROM public.admins
                  WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
              )
          );`,

      // Corriger la contrainte subscriptions
      `ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;`,
      `ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check CHECK (status IN ('pending', 'active', 'inactive', 'completed'));`
    ];

    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i];
      console.log(`⚡ Commande ${i + 1}/${sqlCommands.length}...`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql });

        if (error) {
          console.log(`   ⚠️  Échec (normal si déjà exécuté): ${error.message}`);
        } else {
          console.log(`   ✅ Exécutée avec succès`);
        }
      } catch (err) {
        console.log(`   ⚠️  Erreur ignorée: ${err.message}`);
      }
    }

    console.log('\n🔍 Vérification finale...');

    // Tester la table
    const { data: testData, error: testError } = await supabase
      .from('payment_sessions')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ La table n\'a pas été créée correctement:', testError.message);

      console.log('\n🔧 SOLUTION FINALE - Exécutez manuellement dans Supabase SQL Editor:');
      console.log('https://supabase.com/dashboard/project/YOUR_PROJECT/sql');

      console.log('\nCopiez-collez ce script complet:');
      console.log(`
-- Script final pour Supabase SQL Editor
DROP POLICY IF EXISTS "Users can view own payment sessions" ON public.payment_sessions;
DROP POLICY IF EXISTS "Users can insert own payment sessions" ON public.payment_sessions;
DROP POLICY IF EXISTS "Only admins can modify payment sessions" ON public.payment_sessions;

CREATE TABLE IF NOT EXISTS public.payment_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_id INTEGER REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  payment_address TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  blockchain_tx_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

GRANT ALL ON public.payment_sessions TO anon, authenticated;
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment sessions" ON public.payment_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment sessions" ON public.payment_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can modify payment sessions" ON public.payment_sessions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check CHECK (status IN ('pending', 'active', 'inactive', 'completed'));

SELECT '✅ Configuration terminée !' as status;
      `);

      process.exit(1);
    }

    console.log('✅ Table payment_sessions créée et accessible !');
    console.log('🎉 Le système de paiement devrait maintenant fonctionner.');

    // Tester une insertion factice pour confirmer
    const testSessionId = `test_${Date.now()}`;
    const { error: insertError } = await supabase
      .from('payment_sessions')
      .insert({
        user_id: '6ed056f5-43db-48b2-bda1-750a594ac7a9', // User ID de test
        subscription_id: 1,
        session_id: testSessionId,
        payment_address: 'TEST_ADDRESS',
        amount: 100,
        expires_at: new Date(Date.now() + 60000).toISOString()
      });

    if (insertError && insertError.code !== '23505') { // 23505 = duplicate
      console.log('⚠️ Test d\'insertion échoué:', insertError.message);
    } else {
      console.log('✅ Test d\'insertion réussi');

      // Nettoyer le test
      await supabase
        .from('payment_sessions')
        .delete()
        .eq('session_id', testSessionId);
    }

  } catch (error) {
    console.error('💥 Erreur inattendue:', error);
    process.exit(1);
  }
}

// Exécuter le script
forceCreatePaymentTable();
