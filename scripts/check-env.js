#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction simple pour charger le fichier .env
function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return {};
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    
    content.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                env[key] = valueParts.join('=');
            }
        }
    });
    
    return env;
}

// Charger le fichier .env
const envPath = path.join(__dirname, '../.env');
const env = loadEnvFile(envPath);

console.log('🔍 Vérification de la configuration .env...\n');

// Variables requises pour le backend
const requiredBackendVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'PORT'
];

// Variables optionnelles mais recommandées
const recommendedVars = [
  'REDIS_URL',
  'EMAIL_SMTP_HOST',
  'EMAIL_SMTP_USER',
  'EMAIL_SMTP_PASSWORD',
  'STRIPE_SECRET_KEY',
  'SENTRY_DSN',
  'NODE_ENV'
];

// Variables pour le frontend
const frontendVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID'
];

// Variables Docker
const dockerVars = [
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'REDIS_PASSWORD',
  'GRAFANA_PASSWORD'
];

let allGood = true;

console.log('📋 Variables requises (Backend):');
requiredBackendVars.forEach(varName => {
  const value = env[varName];
  if (!value) {
    console.log(`  ❌ ${varName}: MANQUANT`);
    allGood = false;
  } else {
    const maskedValue = varName.includes('SECRET') || varName.includes('PASSWORD') 
      ? '*'.repeat(Math.min(value.length, 8)) 
      : value;
    console.log(`  ✅ ${varName}: ${maskedValue}`);
  }
});

console.log('\n📋 Variables recommandées:');
recommendedVars.forEach(varName => {
  const value = env[varName];
  if (!value) {
    console.log(`  ⚠️  ${varName}: NON CONFIGURÉ`);
  } else {
    const maskedValue = varName.includes('SECRET') || varName.includes('PASSWORD') 
      ? '*'.repeat(Math.min(value.length, 8)) 
      : value;
    console.log(`  ✅ ${varName}: ${maskedValue}`);
  }
});

console.log('\n📋 Variables Frontend (NEXT_PUBLIC_):');
frontendVars.forEach(varName => {
  const value = env[varName];
  if (!value) {
    console.log(`  ⚠️  ${varName}: NON CONFIGURÉ`);
  } else {
    console.log(`  ✅ ${varName}: ${value}`);
  }
});

console.log('\n📋 Variables Docker:');
dockerVars.forEach(varName => {
  const value = env[varName];
  if (!value) {
    console.log(`  ⚠️  ${varName}: NON CONFIGURÉ`);
  } else {
    const maskedValue = varName.includes('PASSWORD') 
      ? '*'.repeat(Math.min(value.length, 8)) 
      : value;
    console.log(`  ✅ ${varName}: ${maskedValue}`);
  }
});

// Vérifier la structure du fichier .env
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    console.log(`\n📄 Fichier .env: ${lines.length} variables configurées`);
    
    // Vérifier les variables non utilisées
    const allVars = [...requiredBackendVars, ...recommendedVars, ...frontendVars, ...dockerVars];
    const envVars = lines.map(line => line.split('=')[0]);
    const unusedVars = envVars.filter(varName => !allVars.includes(varName));
    
    if (unusedVars.length > 0) {
        console.log('\n⚠️  Variables non reconnues:');
        unusedVars.forEach(varName => {
            console.log(`  - ${varName}`);
        });
    }
} else {
    console.log('\n❌ Fichier .env non trouvé à la racine du projet');
    allGood = false;
}

// Résumé
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ Configuration .env valide !');
  console.log('🚀 Vous pouvez démarrer l\'application');
} else {
  console.log('❌ Configuration .env incomplète');
  console.log('📝 Veuillez configurer les variables manquantes');
}

console.log('\n🌐 URLs d\'accès:');
console.log(`   Frontend: ${env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}`);
console.log(`   Backend:  ${env.API_URL || 'http://localhost:8000'}`);
console.log(`   API Docs: ${env.API_URL || 'http://localhost:8000'}/api/docs`);

if (!allGood) {
  process.exit(1);
} 