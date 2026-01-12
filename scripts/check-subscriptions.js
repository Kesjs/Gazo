#!/usr/bin/env node

/**
 * Script pour vérifier l'état des souscriptions et soldes
 */

const { createClient } = require('@supabase/supabase-js');

async function checkSubscriptions() {
  console.log('🔍 Vérification des souscriptions et soldes...\n');

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
    console.log('📋 Récupération de toutes les souscriptions...');

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Erreur récupération souscriptions:', error);
      process.exit(1);
    }

    console.log(`📊 ${subscriptions?.length || 0} souscriptions trouvées:\n`);

    subscriptions?.forEach((sub, index) => {
      console.log(`${index + 1}. ID: ${sub.id}`);
      console.log(`   User: ${sub.user_id}`);
      console.log(`   Plan: ${sub.plan_id}`);
      console.log(`   Amount: ${sub.amount}€`);
      console.log(`   Static Balance: ${sub.static_balance || 0}€`);
      console.log(`   Dynamic Balance: ${sub.dynamic_balance || 0}€`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Created: ${new Date(sub.created_at).toLocaleString('fr-FR')}\n`);
    });

    // Calculer le solde total investi
    const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active') || [];
    const totalInvested = activeSubscriptions.reduce((sum, sub) => sum + (sub.static_balance || 0), 0);

    console.log('💰 RÉSUMÉ:');
    console.log(`   Souscriptions actives: ${activeSubscriptions.length}`);
    console.log(`   Solde investi total: ${totalInvested}€`);

    if (activeSubscriptions.length > 0) {
      console.log('\n✅ Les souscriptions actives devraient apparaître dans le dashboard');
    } else {
      console.log('\n⚠️ Aucune souscription active trouvée');
      console.log('   → Vérifiez que le paiement a été confirmé');
      console.log('   → Ou que le statut est bien "active"');
    }

    // Vérifier s'il y a des souscriptions en pending
    const pendingSubscriptions = subscriptions?.filter(sub => sub.status === 'pending') || [];
    if (pendingSubscriptions.length > 0) {
      console.log(`\n⏳ ${pendingSubscriptions.length} souscription(s) en attente de paiement:`);
      pendingSubscriptions.forEach(sub => {
        console.log(`   - ID ${sub.id}: ${sub.amount}€ (statut: ${sub.status})`);
      });
    }

  } catch (error) {
    console.error('💥 Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
checkSubscriptions();
