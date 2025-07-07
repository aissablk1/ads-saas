#!/bin/bash

# 🚀 Intégration AdonisJS dans l'arborescence existante ADS SaaS
# Ce script intègre AdonisJS dans le dossier server/ existant

set -e

echo "🚀 Intégration AdonisJS dans l'arborescence existante"
echo "===================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
log_info "Vérification des prérequis..."

if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js 18+ est requis (version actuelle: $(node -v))"
    exit 1
fi

log_success "Prérequis vérifiés"

# Sauvegarde du backend existant
log_info "Sauvegarde du backend Express.js existant..."
cp -r server server-backup-$(date +%Y%m%d_%H%M%S)
log_success "Sauvegarde créée: server-backup-$(date +%Y%m%d_%H%M%S)"

# Création d'un répertoire temporaire pour AdonisJS
log_info "Création d'un projet AdonisJS temporaire..."
mkdir -p temp-adonisjs
cd temp-adonisjs

# Installation d'AdonisJS CLI
log_info "Installation d'AdonisJS CLI..."
npm i -g @adonisjs/cli

# Création du projet AdonisJS
log_info "Création du projet AdonisJS..."
adonis new . --api-only --skip-install

# Installation des dépendances
log_info "Installation des dépendances AdonisJS..."
npm install

# Configuration des packages AdonisJS
log_info "Configuration des packages AdonisJS..."

# Configuration de Lucid (ORM)
adonis configure @adonisjs/lucid

# Configuration de l'authentification
adonis configure @adonisjs/auth

# Configuration de la validation
adonis configure @adonisjs/validator

# Configuration des tests
adonis configure @adonisjs/test

# Configuration du cache
adonis configure @adonisjs/cache

# Configuration des sessions
adonis configure @adonisjs/session

# Retour au répertoire racine
cd ..

# Migration des fichiers AdonisJS vers server/
log_info "Migration des fichiers AdonisJS vers server/..."

# Copier les fichiers de configuration AdonisJS
cp temp-adonisjs/.adonisrc.json server/
cp temp-adonisjs/tsconfig.json server/
cp temp-adonisjs/ace server/

# Copier les dossiers AdonisJS
cp -r temp-adonisjs/app server/
cp -r temp-adonisjs/config server/
cp -r temp-adonisjs/database server/
cp -r temp-adonisjs/start server/

# Copier les fichiers de configuration
cp temp-adonisjs/package.json server/package-adonisjs.json
cp temp-adonisjs/package-lock.json server/package-lock-adonisjs.json

# Nettoyage du répertoire temporaire
rm -rf temp-adonisjs

# Fusion des package.json
log_info "Fusion des dépendances AdonisJS avec le package.json existant..."

# Création d'un script de fusion des dépendances
cat > scripts/merge-adonisjs-deps.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Lire les package.json
const expressPackage = JSON.parse(fs.readFileSync('server/package.json', 'utf8'));
const adonisPackage = JSON.parse(fs.readFileSync('server/package-adonisjs.json', 'utf8'));

// Fusionner les dépendances
const mergedDependencies = {
  ...expressPackage.dependencies,
  ...adonisPackage.dependencies
};

const mergedDevDependencies = {
  ...expressPackage.devDependencies,
  ...adonisPackage.devDependencies
};

// Créer le nouveau package.json fusionné
const mergedPackage = {
  ...expressPackage,
  dependencies: mergedDependencies,
  devDependencies: mergedDevDependencies,
  scripts: {
    ...expressPackage.scripts,
    "adonis:dev": "adonis serve --dev",
    "adonis:build": "adonis build --production",
    "adonis:start": "adonis serve --production",
    "adonis:test": "adonis test",
    "adonis:migration:run": "adonis migration:run",
    "adonis:migration:rollback": "adonis migration:rollback",
    "adonis:db:seed": "adonis db:seed"
  }
};

// Sauvegarder le package.json fusionné
fs.writeFileSync('server/package.json', JSON.stringify(mergedPackage, null, 2));

console.log('✅ Package.json fusionné avec succès');
EOF

# Exécuter le script de fusion
node scripts/merge-adonisjs-deps.js

# Supprimer les fichiers temporaires
rm server/package-adonisjs.json server/package-lock-adonisjs.json

# Création de la configuration AdonisJS adaptée
log_info "Configuration d'AdonisJS pour l'arborescence existante..."

# Modification du .adonisrc.json pour adapter les chemins
cat > server/.adonisrc.json << 'EOF'
{
  "typescript": true,
  "directories": {
    "config": "config",
    "public": "public",
    "database": "database",
    "incremental": "./tmp/incremental",
    "tmp": "./tmp",
    "start": "start"
  },
  "exceptionHandlerNamespace": "App/Exceptions/Handler",
  "preloads": [
    "./start/routes",
    "./start/kernel"
  ],
  "providers": [
    "./providers/AppProvider",
    "@adonisjs/core/providers/AppProvider",
    "@adonisjs/session/providers/SessionProvider",
    "@adonisjs/auth/providers/AuthProvider",
    "@adonisjs/lucid/providers/LucidProvider",
    "@adonisjs/redis/providers/RedisProvider",
    "@adonisjs/validator/providers/ValidatorProvider"
  ],
  "aceProviders": [
    "@adonisjs/lucid/providers/LucidProvider",
    "@adonisjs/lucid/providers/MigrationProvider",
    "@adonisjs/lucid/providers/SeederProvider",
    "@adonisjs/lucid/providers/FactoryProvider"
  ],
  "metaFiles": [
    {
      "pattern": "public/**",
      "reloadServer": false
    },
    {
      "pattern": "resources/views/**/*.edge",
      "reloadServer": false
    }
  ],
  "commands": [
    "./commands",
    "@adonisjs/core/commands",
    "@adonisjs/lucid/commands"
  ]
}
EOF

# Création de la configuration de base de données AdonisJS
cat > server/config/database.ts << 'EOF'
import Env from '@ioc:Adonis/Core/Env'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

const databaseConfig: DatabaseConfig = {
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: Env.get('DB_CONNECTION', 'database/database.sqlite3'),
      },
      useNullAsDefault: true,
      debug: false,
    },
    // Configuration pour PostgreSQL (production)
    pg: {
      client: 'pg',
      connection: {
        host: Env.get('PG_HOST'),
        port: Env.get('PG_PORT'),
        user: Env.get('PG_USER'),
        password: Env.get('PG_PASSWORD'),
        database: Env.get('PG_DB_NAME'),
      },
    },
  },
}

export default databaseConfig
EOF

# Création du fichier .env pour AdonisJS
cat > server/.env << 'EOF'
NODE_ENV=development
PORT=8000
HOST=0.0.0.0

# Base de données (utilise la même que Express.js)
DB_CONNECTION=sqlite
SQLITE_FILENAME=database/database.sqlite3

# Authentification
APP_KEY=your-app-key-here
JWT_SECRET=your-jwt-secret-here

# Cache
CACHE_VIEWS=false
REDIS_CONNECTION=local

# Session
SESSION_DRIVER=cookie
SESSION_COOKIE_NAME=ads_session

# Variables d'environnement existantes
DATABASE_URL=file:./dev.db
JWT_SECRET=your-jwt-secret-here
FRONTEND_URL=http://localhost:3000
EOF

# Création d'un contrôleur AdonisJS d'exemple
cat > server/app/Controllers/ExampleController.ts << 'EOF'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExampleController {
  public async index({ response }: HttpContextContract) {
    return response.json({
      message: 'API AdonisJS intégrée dans l\'arborescence existante !',
      timestamp: new Date().toISOString(),
      framework: 'AdonisJS',
      version: '5.x',
      integration: 'hybrid'
    })
  }

  public async health({ response }: HttpContextContract) {
    return response.json({
      status: 'healthy',
      service: 'adonisjs-backend',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      integration: 'existing-structure'
    })
  }
}
EOF

# Configuration des routes AdonisJS
cat > server/start/routes.ts << 'EOF'
import Route from '@ioc:Adonis/Core/Route'

// Routes publiques
Route.get('/', 'ExampleController.index')
Route.get('/health', 'ExampleController.health')

// Routes API avec préfixe /adonis
Route.group(() => {
  Route.get('/', 'ExampleController.index')
  Route.get('/health', 'ExampleController.health')
}).prefix('/adonis')

// Routes d'authentification
Route.group(() => {
  Route.post('/login', 'AuthController.login')
  Route.post('/register', 'AuthController.register')
  Route.post('/logout', 'AuthController.logout').middleware('auth:api')
}).prefix('/adonis/auth')

// Routes protégées
Route.group(() => {
  Route.get('/me', 'UsersController.me')
  Route.put('/me', 'UsersController.update')
}).prefix('/adonis/users').middleware('auth:api')
EOF

# Création d'un script de démarrage hybride
cat > scripts/start-adonisjs-hybrid.sh << 'EOF'
#!/bin/bash

echo "🚀 Démarrage hybride Express.js + AdonisJS (même arborescence)"

# Vérifier si AdonisJS est configuré
if [ ! -f "server/.adonisrc.json" ]; then
    echo "❌ AdonisJS n'est pas configuré. Exécutez d'abord: ./scripts/integrate-adonisjs-existing.sh"
    exit 1
fi

# Aller dans le dossier server
cd server

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Démarrer AdonisJS
echo "⚡ Démarrage d'AdonisJS sur le port 8000..."
adonis serve --dev &
ADONIS_PID=$!

# Retourner au répertoire racine
cd ..

# Démarrer le frontend Next.js
echo "🎨 Démarrage du frontend Next.js sur le port 3000..."
cd client && npm run dev &
NEXT_PID=$!

echo "✅ Services démarrés:"
echo "  - AdonisJS: PID $ADONIS_PID (port 8000)"
echo "  - Next.js: PID $NEXT_PID (port 3000)"

# Fonction de nettoyage
cleanup() {
    echo "🛑 Arrêt des services..."
    kill $ADONIS_PID $NEXT_PID 2>/dev/null
    exit 0
}

# Capture des signaux d'arrêt
trap cleanup SIGINT SIGTERM

# Attendre que tous les processus se terminent
wait
EOF

chmod +x scripts/start-adonisjs-hybrid.sh

# Création d'un script de migration des modèles
cat > scripts/migrate-models-to-adonisjs.sh << 'EOF'
#!/bin/bash

echo "🔄 Migration des modèles Prisma vers AdonisJS..."

cd server

# Créer les migrations AdonisJS basées sur le schéma Prisma
echo "📝 Création des migrations..."

# Migration des utilisateurs
adonis make:migration users

# Migration des campagnes
adonis make:migration campaigns

# Migration des activités
adonis make:migration activities

# Migration des abonnements
adonis make:migration subscriptions

# Migration des fichiers
adonis make:migration files

# Exécuter les migrations
echo "🚀 Exécution des migrations..."
adonis migration:run

# Créer les seeders
echo "🌱 Création des seeders..."
adonis make:seeder UserSeeder
adonis make:seeder CampaignSeeder

# Exécuter les seeders
echo "🌱 Exécution des seeders..."
adonis db:seed

echo "✅ Migration terminée !"
EOF

chmod +x scripts/migrate-models-to-adonisjs.sh

# Création du guide d'utilisation
cat > docs/INTEGRATION_ADONISJS_EXISTING.md << 'EOF'
# 🔄 Intégration AdonisJS dans l'Arborescence Existante

## Vue d'ensemble

Cette intégration ajoute AdonisJS directement dans votre arborescence existante, sans modifier les chemins ni la structure actuelle.

## Architecture

```
ADS SaaS (Intégré)
├── server/           # Backend Express.js + AdonisJS (port 8000)
│   ├── src/         # Code Express.js existant
│   ├── app/         # Contrôleurs AdonisJS
│   ├── config/      # Configuration AdonisJS
│   ├── database/    # Migrations et seeders AdonisJS
│   └── start/       # Routes et kernel AdonisJS
├── client/           # Frontend Next.js (port 3000)
└── nginx/            # Reverse proxy
```

## URLs d'accès

- **Frontend:** http://localhost:3000
- **API Express.js:** http://localhost:8000/api/
- **API AdonisJS:** http://localhost:8000/adonis/
- **Health Check:** http://localhost:8000/health

## Démarrage

### Mode développement
```bash
# Démarrage hybride (AdonisJS + Next.js)
./scripts/start-adonisjs-hybrid.sh

# Ou individuellement
cd server && adonis serve --dev  # AdonisJS
cd client && npm run dev         # Next.js
```

### Mode production
```bash
# Build et démarrage
cd server && adonis build --production
cd server && adonis serve --production
```

## Migration des fonctionnalités

### 1. Nouvelles fonctionnalités → AdonisJS
- Système de notifications avancé
- Analytics en temps réel
- Gestion des webhooks
- Système de cache intelligent

### 2. Fonctionnalités existantes → Express.js
- Authentification de base
- Gestion des campagnes
- API utilisateurs
- Intégrations Stripe

## Avantages de cette approche

1. **Pas de changement de structure** - Garde votre arborescence actuelle
2. **Intégration transparente** - AdonisJS s'intègre dans server/
3. **Migration progressive** - Peut migrer fonctionnalité par fonctionnalité
4. **Même port** - Express.js et AdonisJS partagent le port 8000
5. **Dépendances fusionnées** - Un seul package.json

## Commandes utiles

```bash
# Démarrage
./scripts/start-adonisjs-hybrid.sh

# Migration des modèles
./scripts/migrate-models-to-adonisjs.sh

# Commandes AdonisJS
cd server
adonis serve --dev
adonis migration:run
adonis db:seed
adonis test
```

## Prochaines étapes

1. Tester l'intégration AdonisJS
2. Migrer progressivement les fonctionnalités
3. Optimiser les performances
4. Consolider vers AdonisJS complet si nécessaire
EOF

# Installation des dépendances AdonisJS
log_info "Installation des dépendances AdonisJS..."
cd server
npm install

# Génération de la clé d'application AdonisJS
log_info "Génération de la clé d'application AdonisJS..."
adonis key:generate

cd ..

log_success "Intégration AdonisJS terminée !"
log_info "Prochaines étapes:"
log_info "1. ./scripts/start-adonisjs-hybrid.sh"
log_info "2. ./scripts/migrate-models-to-adonisjs.sh"
log_info "3. Consulter docs/INTEGRATION_ADONISJS_EXISTING.md"

echo ""
echo "🎉 Intégration AdonisJS dans l'arborescence existante terminée !"
echo "📖 Documentation: docs/INTEGRATION_ADONISJS_EXISTING.md"
echo "🚀 Pour démarrer: ./scripts/start-adonisjs-hybrid.sh" 