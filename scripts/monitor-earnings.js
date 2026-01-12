#!/usr/bin/env node

/**
 * Script de monitoring du système d'approvisionnement automatique
 */

const { createClient } = require('@supabase/supabase-js');
const { earningsCronService } = require('../src/services/earningsCronService');

async function monitorEarningsSystem() {
  console.log('🔍 Monitoring du système d\'approvisionnement...\n');

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
    console.log('📊 État du service cron:');
    console.log(`   Actif: ${earningsCronService.isActive() ? '✅' : '❌'}\n`);

    // Récupérer les statistiques générales
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('id, status, dynamic_balance, last_credit_date, start_date, plan_id')
      .order('created_at', { ascending: false });

    if (subError) {
      console.error('❌ Erreur récupération souscriptions:', subError);
      process.exit(1);
    }

    const activeSubs = subscriptions.filter(sub => sub.status === 'active');
    const pendingSubs = subscriptions.filter(sub => sub.status === 'pending_activation');
    const totalDynamicBalance = activeSubs.reduce((sum, sub) => sum + (sub.dynamic_balance || 0), 0);

    console.log('📈 Statistiques générales:');
    console.log(`   Total souscriptions: ${subscriptions.length}`);
    console.log(`   Souscriptions actives: ${activeSubs.length}`);
    console.log(`   Souscriptions en attente: ${pendingSubs.length}`);
    console.log(`   Solde dynamique total: ${totalDynamicBalance.toFixed(2)}€\n`);

    // Vérifier les dernières transactions de gains
    const { data: recentEarnings, error: earnError } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', 'earnings')
      .order('created_at', { ascending: false })
      .limit(5);

    if (earnError) {
      console.error('❌ Erreur récupération gains récents:', earnError);
    } else {
      console.log('💰 Derniers gains crédités:');
      if (recentEarnings && recentEarnings.length > 0) {
        recentEarnings.forEach((earning, index) => {
          const date = new Date(earning.created_at).toLocaleString('fr-FR');
          console.log(`   ${index + 1}. ${earning.amount.toFixed(2)}€ - ${earning.description} (${date})`);
        });
      } else {
        console.log('   Aucun gain trouvé récemment');
      }
      console.log();
    }

    // Vérifier les crédits d'aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    const { data: todayCredits, error: creditError } = await supabase
      .from('investment_credits')
      .select('*')
      .gte('credit_date', today);

    if (creditError) {
      console.error('❌ Erreur récupération crédits du jour:', creditError);
    } else {
      console.log('📅 Crédits d\'aujourd\'hui:');
      console.log(`   Total crédits: ${todayCredits?.length || 0}`);
      const totalCreditedToday = todayCredits?.reduce((sum, credit) => sum + credit.amount, 0) || 0;
      console.log(`   Montant total crédité: ${totalCreditedToday.toFixed(2)}€\n`);
    }

    // Vérifier les souscriptions qui devraient recevoir des gains
    console.log('🎯 Souscriptions éligibles aux gains aujourd\'hui:');
    let eligibleCount = 0;

    for (const sub of activeSubs) {
      const activationDate = new Date(sub.start_date);
      const hoursSinceActivation = (Date.now() - activationDate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceActivation >= 24) {
        // Vérifier si déjà crédité aujourd'hui
        const { data: existingCredit } = await supabase
          .from('investment_credits')
          .select('id')
          .eq('subscription_id', sub.id)
          .gte('credit_date', today)
          .single();

        if (!existingCredit) {
          const plan = getPlanById(sub.plan_id);
          const dailyCredit = (sub.static_balance * plan.daily_profit) / 100;

          console.log(`   ✅ Souscription ${sub.id}: ${dailyCredit.toFixed(2)}€ attendu (${plan.name})`);
          eligibleCount++;
        }
      }
    }

    if (eligibleCount === 0) {
      console.log('   Aucune souscription éligible aux gains actuellement');
    }

    console.log(`\n✅ Monitoring terminé - ${eligibleCount} souscription(s) en attente de crédits`);

  } catch (error) {
    console.error('💥 Erreur monitoring:', error);
    process.exit(1);
  }
}

// Fonction helper pour récupérer les plans
function getPlanById(planId) {
  const plans = [
    { id: 1, name: 'Starter GNL', daily_profit: 1.5 },
    { id: 2, name: 'Premium GNL', daily_profit: 2.0 },
    { id: 3, name: 'Elite GNL', daily_profit: 2.5 },
    { id: 4, name: 'Élite GNL', daily_profit: 3.0 }
  ];
  return plans.find(p => p.id === planId) || { name: 'Unknown', daily_profit: 0 };
}

// Exécuter le script
monitorEarningsSystem();
