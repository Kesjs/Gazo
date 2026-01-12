#!/usr/bin/env node

/**
 * Script de vérification de la configuration des variables d'environnement
 * Usage: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80));
}

// Variables requises
const requiredVars = {
  public: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ],
  optional: [
    'NEXT_PUBLIC_APP_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]
};

// Patterns de test à éviter
const testPatterns = ['your-', 'example', 'test', 'demo', 'xxxxx', 'votre'];

function checkEnvFile() {
  logSection('📁 Vérification des fichiers de configuration');

  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  // Vérifier .env.example
  if (fs.existsSync(envExamplePath)) {
    log('✅ .env.example trouvé', 'green');
  } else {
    log('⚠️  .env.example non trouvé', 'yellow');
  }

  // Vérifier .env.local
  if (fs.existsSync(envLocalPath)) {
    log('✅ .env.local trouvé', 'green');
    return true;
  } else {
    log('❌ .env.local non trouvé', 'red');
    console.log('\n📝 Actions à effectuer:');
    console.log('1. Copiez .env.example vers .env.local');
    console.log('2. Remplissez les valeurs depuis https://app.supabase.com');
    console.log('3. Relancez ce script\n');
    return false;
  }
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });

  return env;
}

function checkRequiredVars(env) {
  logSection('🔍 Vérification des variables requises');

  let allValid = true;

  // Variables publiques requises
  log('\n📢 Variables publiques:', 'blue');
  requiredVars.public.forEach(key => {
    if (env[key] && env[key].trim() !== '') {
      log(`  ✅ ${key}`, 'green');
    } else {
      log(`  ❌ ${key} - MANQUANTE`, 'red');
      allValid = false;
    }
  });

  // Variables optionnelles
  log('\n📦 Variables optionnelles:', 'blue');
  requiredVars.optional.forEach(key => {
    if (env[key] && env[key].trim() !== '') {
      log(`  ✅ ${key}`, 'green');
    } else {
      log(`  ⚠️  ${key} - Non configurée`, 'yellow');
    }
  });

  return allValid;
}

function validateValues(env) {
  logSection('✔️  Validation des valeurs');

  let allValid = true;

  // Vérifier NEXT_PUBLIC_SUPABASE_URL
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  if (url) {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes('supabase')) {
        log('✅ URL Supabase valide', 'green');
      } else {
        log('⚠️  L\'URL ne semble pas être une URL Supabase', 'yellow');
      }
    } catch {
      log('❌ URL Supabase invalide', 'red');
      allValid = false;
    }
  }

  // Vérifier les patterns de test
  log('\n🔍 Détection de valeurs de test:', 'blue');
  let hasTestValues = false;

  Object.entries(env).forEach(([key, value]) => {
    if (!value) return;
    
    const lowerValue = value.toLowerCase();
    for (const pattern of testPatterns) {
      if (lowerValue.includes(pattern)) {
        log(`  ⚠️  ${key} contient "${pattern}" - Valeur de test détectée`, 'yellow');
        hasTestValues = true;
        allValid = false;
      }
    }
  });

  if (!hasTestValues) {
    log('  ✅ Aucune valeur de test détectée', 'green');
  }

  // Vérifier la longueur des clés
  log('\n🔑 Validation des clés:', 'blue');
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (anonKey) {
    if (anonKey.length > 30) {
      log('  ✅ Clé anon semble valide', 'green');
    } else {
      log('  ❌ Clé anon trop courte', 'red');
      allValid = false;
    }
  }

  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    if (serviceKey.length > 30) {
      log('  ✅ Clé service_role semble valide', 'green');
    } else {
      log('  ❌ Clé service_role trop courte', 'red');
      allValid = false;
    }

    // Vérifier que les clés sont différentes
    if (anonKey && serviceKey === anonKey) {
      log('  ❌ Les clés anon et service_role sont identiques!', 'red');
      allValid = false;
    }
  }

  return allValid;
}

function checkGitignore() {
  logSection('🔒 Vérification de la sécurité');

  const gitignorePath = path.join(process.cwd(), '.gitignore');
  
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    
    if (gitignoreContent.includes('.env.local')) {
      log('✅ .env.local est dans .gitignore', 'green');
    } else {
      log('❌ .env.local N\'EST PAS dans .gitignore!', 'red');
      log('   🚨 DANGER: Vos secrets pourraient être commités!', 'red');
      return false;
    }
  } else {
    log('⚠️  .gitignore non trouvé', 'yellow');
    return false;
  }

  return true;
}

function printSummary(hasEnvFile, varsValid, valuesValid, gitignoreValid) {
  logSection('📊 Résumé');

  const allValid = hasEnvFile && varsValid && valuesValid && gitignoreValid;

  if (allValid) {
    log('\n🎉 Configuration valide! Vous pouvez démarrer l\'application.\n', 'green');
    process.exit(0);
  } else {
    log('\n❌ Configuration invalide. Veuillez corriger les erreurs ci-dessus.\n', 'red');
    
    if (!hasEnvFile) {
      console.log('📝 Créez un fichier .env.local avec vos clés Supabase');
    }
    if (!varsValid) {
      console.log('📝 Ajoutez toutes les variables requises');
    }
    if (!valuesValid) {
      console.log('📝 Remplacez les valeurs de test par vos vraies clés');
    }
    if (!gitignoreValid) {
      console.log('📝 Ajoutez .env.local à votre .gitignore');
    }
    
    console.log('\n📚 Consultez SECURITY.md pour plus d\'informations\n');
    process.exit(1);
  }
}

// Exécution principale
function main() {
  console.clear();
  log('\n🔐 Vérification de la Configuration - Gazoduc Invest\n', 'cyan');

  const hasEnvFile = checkEnvFile();
  
  if (!hasEnvFile) {
    printSummary(false, false, false, false);
    return;
  }

  const env = loadEnvFile();
  const varsValid = checkRequiredVars(env);
  const valuesValid = validateValues(env);
  const gitignoreValid = checkGitignore();

  printSummary(hasEnvFile, varsValid, valuesValid, gitignoreValid);
}

main();
