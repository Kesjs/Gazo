#!/usr/bin/env node

/**
 * Script de déploiement du système d'approvisionnement automatique
 * Configure le cron job pour les crédits journaliers
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deployEarningsSystem() {
  console.log('🚀 Déploiement du système d\'approvisionnement automatique...\n');

  try {
    // 1. Vérifier que les variables d'environnement sont configurées
    console.log('1️⃣ Vérification de la configuration...');
    require('dotenv').config();

    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error('❌ Variables d\'environnement manquantes:', missingVars.join(', '));
      process.exit(1);
    }

    console.log('✅ Configuration OK\n');

    // 2. Démarrer le service cron
    console.log('2️⃣ Démarrage du service cron...');
    const { earningsCronService } = require('../src/services/earningsCronService');

    if (earningsCronService.isActive()) {
      console.log('⚠️ Service cron déjà actif');
    } else {
      earningsCronService.start();
      console.log('✅ Service cron démarré');
    }
    console.log();

    // 3. Exécuter un test du système
    console.log('3️⃣ Test du système d\'approvisionnement...');
    await earningsCronService.forceProcessEarnings();
    console.log('✅ Test terminé\n');

    // 4. Créer la configuration cron (optionnel)
    console.log('4️⃣ Configuration cron job (optionnel)...');
    console.log('Pour configurer un cron job automatique, ajoutez cette ligne à votre crontab:');
    console.log('0 2 * * * curl -X POST http://localhost:3000/api/admin/earnings -H "Content-Type: application/json" -d \'{"action": "force_process"}\'');
    console.log();

    // 5. Instructions de monitoring
    console.log('5️⃣ Instructions de monitoring:');
    console.log('• Script de monitoring: npm run monitor-earnings');
    console.log('• API admin: POST /api/admin/earnings');
    console.log('• Logs automatiques toutes les heures');
    console.log();

    console.log('🎉 Déploiement terminé avec succès!');
    console.log('Le système d\'approvisionnement automatique est maintenant opérationnel.');

  } catch (error) {
    console.error('❌ Erreur lors du déploiement:', error);
    process.exit(1);
  }
}

// Ajouter la commande npm au package.json si elle n'existe pas
function updatePackageJson() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  if (!packageJson.scripts) packageJson.scripts = {};
  if (!packageJson.scripts['deploy-earnings']) {
    packageJson.scripts['deploy-earnings'] = 'node scripts/deploy-earnings-system.js';
  }
  if (!packageJson.scripts['monitor-earnings']) {
    packageJson.scripts['monitor-earnings'] = 'node scripts/monitor-earnings.js';
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('📝 Scripts ajoutés au package.json');
}

// Exécuter le déploiement
updatePackageJson();
deployEarningsSystem();
