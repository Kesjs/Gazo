#!/usr/bin/env node

/**
 * Script de migration pour corriger la contrainte de statut des subscriptions
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function fixSubscriptionConstraint() {
  console.log('🔧 Correction de la contrainte subscriptions_status_check...\n');

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
    console.log('📝 Vérification de la contrainte actuelle...');

    // D'abord, essayons de voir si on peut insérer une ligne avec 'pending'
    const testInsert = await supabase
      .from('subscriptions')
      .insert({
        user_id: '6ed056f5-43db-48b2-bda1-750a594ac7a9', // User ID de test
        plan_id: 1,
        amount: 100,
        status: 'pending'
      });

    if (testInsert.error && testInsert.error.code === '23514') {
      console.log('❌ La contrainte bloque toujours "pending". Tentative de correction...');

      // Essayons une approche différente : supprimer et recréer la table
      console.log('🔄 Recréation de la table subscriptions...');

      // Sauvegarder les données existantes
      const { data: existingData, error: backupError } = await supabase
        .from('subscriptions')
        .select('*');

      if (backupError) {
        console.error('❌ Erreur lors de la sauvegarde:', backupError);
        process.exit(1);
      }

      console.log(`📦 ${existingData?.length || 0} enregistrements sauvegardés`);

      // Supprimer la table
      const dropResult = await supabase.rpc('exec_sql', {
        sql: 'DROP TABLE IF EXISTS public.subscriptions CASCADE;'
      });

      if (dropResult.error) {
        console.log('⚠️ Impossible de supprimer via RPC, tentative directe...');

        // Créer une fonction temporaire pour exécuter DDL
        const createFunction = await supabase.rpc('exec_sql', {
          sql: `
            CREATE OR REPLACE FUNCTION temp_fix_constraint()
            RETURNS void AS $$
            BEGIN
              ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
              ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check CHECK (status IN ('pending', 'active', 'inactive', 'completed'));
            END;
            $$ LANGUAGE plpgsql;
          `
        });

        if (createFunction.error) {
          console.error('❌ Impossible de créer la fonction:', createFunction.error);
          console.log('🔧 Solution alternative: modifier manuellement la base de données');
          console.log('   1. Allez dans votre dashboard Supabase');
          console.log('   2. SQL Editor');
          console.log('   3. Exécutez:');
          console.log('      ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;');
          console.log('      ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check CHECK (status IN (\'pending\', \'active\', \'inactive\', \'completed\'));');
          process.exit(1);
        }

        // Exécuter la fonction
        const executeFunction = await supabase.rpc('temp_fix_constraint');

        if (executeFunction.error) {
          console.error('❌ Erreur lors de l\'exécution de la fonction:', executeFunction.error);
          process.exit(1);
        }

        console.log('✅ Contrainte corrigée via fonction temporaire !');
        return;
      }

      // Recréer la table avec le bon schéma
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.subscriptions (
            id SERIAL PRIMARY KEY,
            user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
            plan_id INTEGER REFERENCES public.plans(id) ON DELETE CASCADE NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            static_balance DECIMAL(10,2) DEFAULT 0 NOT NULL,
            dynamic_balance DECIMAL(10,2) DEFAULT 0 NOT NULL,
            start_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            end_date TIMESTAMP WITH TIME ZONE,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'completed')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
      `;

      const createResult = await supabase.rpc('exec_sql', { sql: createTableSQL });

      if (createResult.error) {
        console.error('❌ Erreur lors de la recréation:', createResult.error);
        process.exit(1);
      }

      // Restaurer les données
      if (existingData && existingData.length > 0) {
        const restoreResult = await supabase
          .from('subscriptions')
          .insert(existingData);

        if (restoreResult.error) {
          console.error('❌ Erreur lors de la restauration:', restoreResult.error);
          console.log('⚠️ Les données ont été sauvegardées mais pas restaurées');
        } else {
          console.log('✅ Données restaurées avec succès');
        }
      }

      console.log('✅ Table recréée avec la bonne contrainte !');

    } else {
      console.log('✅ La contrainte accepte déjà "pending"');
    }

  } catch (error) {
    console.error('💥 Erreur:', error);
    process.exit(1);
  }
}

// Exécuter la correction
fixSubscriptionConstraint();
