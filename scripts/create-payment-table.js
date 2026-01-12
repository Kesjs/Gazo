#!/usr/bin/env node

/**
 * Script pour créer manuellement la table payment_sessions
 */

const { createClient } = require('@supabase/supabase-js');

async function createPaymentTable() {
  console.log('🔧 Création de la table payment_sessions...\n');

  // Charger les variables d'environnement
  require('dotenv').config();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('📋 Test de connexion à la base de données...');

    // Tester la connexion
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur de connexion:', testError);
      process.exit(1);
    }

    console.log('✅ Connexion réussie');

    // Essayer de créer la table en utilisant une approche différente
    console.log('📝 Création de la table payment_sessions...');

    // Méthode 1: Utiliser une requête RPC si elle existe
    try {
      const { error: rpcError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS payment_sessions (
            id SERIAL PRIMARY KEY,
            user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
            subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
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
      });

      if (!rpcError) {
        console.log('✅ Table créée via RPC');
      } else {
        throw rpcError;
      }
    } catch (rpcError) {
      console.log('⚠️ RPC échoué, tentative alternative...');

      // Méthode 2: Essayer d'insérer une ligne factice pour voir si la table existe
      try {
        const testInsert = await supabase
          .from('payment_sessions')
          .insert({
            user_id: '00000000-0000-0000-0000-000000000000',
            subscription_id: 1,
            session_id: 'test',
            payment_address: 'test',
            amount: 0,
            expires_at: new Date().toISOString()
          });

        if (testInsert.error && testInsert.error.code !== '23505') { // 23505 = duplicate key
          console.log('❌ Table n\'existe pas, création manuelle requise');
          console.log('\n🔧 Commandes SQL à exécuter dans Supabase Dashboard:');
          console.log('\n1. Créer la table payment_sessions:');
          console.log(`CREATE TABLE IF NOT EXISTS payment_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  payment_address TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  blockchain_tx_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);`);

          console.log('\n2. Donner les permissions:');
          console.log('GRANT ALL ON payment_sessions TO anon, authenticated;');

          console.log('\n3. Corriger la contrainte subscriptions:');
          console.log(`ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check CHECK (status IN ('pending', 'active', 'inactive', 'completed'));`);

          console.log('\n📍 Allez dans Supabase Dashboard → SQL Editor → Exécutez ces commandes');
          process.exit(1);
        } else {
          console.log('✅ Table existe déjà');

          // Supprimer la ligne de test
          await supabase
            .from('payment_sessions')
            .delete()
            .eq('session_id', 'test');
        }
      } catch (insertError) {
        console.log('❌ Erreur lors du test d\'insertion:', insertError.message);
        console.log('\n🔧 Veuillez exécuter manuellement dans Supabase SQL Editor:');

        console.log('\n1. Créer la table:');
        console.log(`CREATE TABLE IF NOT EXISTS payment_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  payment_address TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  blockchain_tx_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);`);

        console.log('\n2. Permissions:');
        console.log('GRANT ALL ON payment_sessions TO anon, authenticated;');

        process.exit(1);
      }
    }

    console.log('✅ Table payment_sessions créée avec succès !');
    console.log('🎉 Le système de paiement devrait maintenant fonctionner.');

  } catch (error) {
    console.error('💥 Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
createPaymentTable();
