#!/usr/bin/env node

/**
 * Script d'installation automatique des variables d'environnement
 * Usage: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

console.log('🔧 Configuration automatique des variables d\'environnement...\n');

// Vérifier si .env.example existe
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ Fichier .env.example non trouvé!');
  process.exit(1);
}

// Lire .env.example
const envExampleContent = fs.readFileSync(envExamplePath, 'utf-8');

// Copier vers .env.local
fs.writeFileSync(envLocalPath, envExampleContent, 'utf-8');

console.log('✅ Fichier .env.local créé avec succès!');
console.log('📁 Emplacement:', envLocalPath);
console.log('\n✨ Vous pouvez maintenant démarrer l\'application avec: npm run dev\n');
