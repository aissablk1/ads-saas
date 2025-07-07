#!/bin/bash

# 🚀 Script d'intégration hybride AdonisJS pour ADS SaaS
# Ce script ajoute AdonisJS en parallèle du backend Express.js existant

set -e

echo "🚀 Intégration hybride AdonisJS pour ADS SaaS"
echo "=============================================="

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

# Création du répertoire AdonisJS
log_info "Création du répertoire AdonisJS..."
mkdir -p adonisjs-backend
cd adonisjs-backend

# Installation d'AdonisJS CLI
log_info "Installation d'AdonisJS CLI..."
npm i -g @adonisjs/cli

# Création du projet AdonisJS
log_info "Création du projet AdonisJS..."
adonis new . --api-only --typescript --skip-install

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

# Création de la configuration hybride
log_info "Configuration de l'intégration hybride..."

# Modification du package.json principal
cat >> package.json << 'EOF'

  "adonisjs": {
    "dev": "cd adonisjs-backend && adonis serve --dev",
    "build": "cd adonisjs-backend && adonis build --production",
    "start": "cd adonisjs-backend && adonis serve --production",
    "test": "cd adonisjs-backend && adonis test",
    "migration:run": "cd adonisjs-backend && adonis migration:run",
    "migration:rollback": "cd adonisjs-backend && adonis migration:rollback",
    "db:seed": "cd adonisjs-backend && adonis db:seed"
  }
EOF

# Création du script de démarrage hybride
cat > scripts/start-hybrid.sh << 'EOF'
#!/bin/bash

# Script de démarrage hybride Express.js + AdonisJS

echo "🚀 Démarrage hybride Express.js + AdonisJS"

# Démarrage du backend Express.js existant
echo "📡 Démarrage du backend Express.js (port 8000)..."
cd server && npm run dev &
EXPRESS_PID=$!

# Attendre que Express.js démarre
sleep 5

# Démarrage du backend AdonisJS
echo "⚡ Démarrage du backend AdonisJS (port 3333)..."
cd ../adonisjs-backend && adonis serve --dev &
ADONIS_PID=$!

# Démarrage du frontend Next.js
echo "🎨 Démarrage du frontend Next.js (port 3000)..."
cd ../client && npm run dev &
NEXT_PID=$!

echo "✅ Services démarrés:"
echo "  - Express.js: PID $EXPRESS_PID (port 8000)"
echo "  - AdonisJS: PID $ADONIS_PID (port 3333)"
echo "  - Next.js: PID $NEXT_PID (port 3000)"

# Fonction de nettoyage
cleanup() {
    echo "🛑 Arrêt des services..."
    kill $EXPRESS_PID $ADONIS_PID $NEXT_PID 2>/dev/null
    exit 0
}

# Capture des signaux d'arrêt
trap cleanup SIGINT SIGTERM

# Attendre que tous les processus se terminent
wait
EOF

chmod +x scripts/start-hybrid.sh

# Création de la configuration Docker hybride
cat > docker-compose.hybrid.yml << 'EOF'
version: '3.8'

services:
  # Backend Express.js existant
  express-backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    volumes:
      - ./logs:/app/logs
    networks:
      - ads-network

  # Backend AdonisJS
  adonisjs-backend:
    build:
      context: ./adonisjs-backend
      dockerfile: Dockerfile
    ports:
      - "3333:3333"
    environment:
      - NODE_ENV=production
      - DB_CONNECTION=${DB_CONNECTION}
    volumes:
      - ./logs:/app/logs
    networks:
      - ads-network

  # Frontend Next.js
  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
      - NEXT_PUBLIC_ADONIS_API_URL=http://localhost:3333
    depends_on:
      - express-backend
      - adonisjs-backend
    networks:
      - ads-network

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.hybrid.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - express-backend
      - adonisjs-backend
      - frontend
    networks:
      - ads-network

networks:
  ads-network:
    driver: bridge
EOF

# Création de la configuration Nginx hybride
cat > nginx/nginx.hybrid.conf << 'EOF'
# Configuration Nginx pour ADS SaaS (Express.js + AdonisJS)

events {
    worker_connections 1024;
}

http {
    upstream express_backend {
        server express-backend:8000;
    }

    upstream adonisjs_backend {
        server adonisjs-backend:3333;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Routes Express.js (API existante)
    server {
        listen 80;
        server_name localhost;

        # API Express.js (routes existantes)
        location /api/ {
            proxy_pass http://express_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API AdonisJS (nouvelles fonctionnalités)
        location /adonis/ {
            proxy_pass http://adonisjs_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend Next.js
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# Création du Dockerfile pour AdonisJS
cat > adonisjs-backend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY .adonisrc.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

EXPOSE 3333

CMD ["node", "build/server.js"]
EOF

# Création d'un exemple de contrôleur AdonisJS
cat > adonisjs-backend/app/Controllers/ExampleController.ts << 'EOF'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExampleController {
  public async index({ response }: HttpContextContract) {
    return response.json({
      message: 'API AdonisJS fonctionnelle !',
      timestamp: new Date().toISOString(),
      framework: 'AdonisJS',
      version: '5.x'
    })
  }

  public async health({ response }: HttpContextContract) {
    return response.json({
      status: 'healthy',
      service: 'adonisjs-backend',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    })
  }
}
EOF

# Configuration des routes AdonisJS
cat > adonisjs-backend/start/routes.ts << 'EOF'
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

# Création du fichier .env pour AdonisJS
cat > adonisjs-backend/.env << 'EOF'
NODE_ENV=development
PORT=3333
HOST=0.0.0.0

# Base de données
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
EOF

# Création du script de migration des données
cat > scripts/migrate-to-adonisjs.sh << 'EOF'
#!/bin/bash

echo "🔄 Migration des données vers AdonisJS..."

# Créer les migrations AdonisJS basées sur le schéma Prisma
cd adonisjs-backend

# Migration des utilisateurs
adonis make:migration users
adonis make:migration campaigns
adonis make:migration activities
adonis make:migration subscriptions
adonis make:migration files

# Exécuter les migrations
adonis migration:run

# Créer les seeders
adonis make:seeder UserSeeder
adonis make:seeder CampaignSeeder

# Exécuter les seeders
adonis db:seed

echo "✅ Migration terminée !"
EOF

chmod +x scripts/migrate-to-adonisjs.sh

# Création du guide d'utilisation
cat > docs/INTEGRATION_ADONISJS_HYBRIDE.md << 'EOF'
# 🔄 Intégration Hybride AdonisJS

## Vue d'ensemble

Cette intégration permet d'utiliser AdonisJS en parallèle de votre backend Express.js existant, offrant une transition progressive vers une architecture plus robuste.

## Architecture

```
ADS SaaS (Hybride)
├── server/           # Backend Express.js (port 8000)
├── adonisjs-backend/ # Backend AdonisJS (port 3333)
├── client/           # Frontend Next.js (port 3000)
└── nginx/            # Reverse proxy
```

## URLs d'accès

- **Frontend:** http://localhost:3000
- **API Express.js:** http://localhost:8000/api/
- **API AdonisJS:** http://localhost:3333/adonis/
- **Nginx Proxy:** http://localhost (routage automatique)

## Démarrage

### Mode développement
```bash
# Démarrage hybride
./scripts/start-hybrid.sh

# Ou individuellement
npm run server:dev    # Express.js
npm run adonisjs:dev  # AdonisJS
npm run client:dev    # Next.js
```

### Mode production
```bash
# Docker Compose hybride
docker-compose -f docker-compose.hybrid.yml up -d
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

1. **Transition progressive** sans interruption
2. **Réutilisation** du code existant
3. **Test** d'AdonisJS sur de nouvelles fonctionnalités
4. **Rollback** facile si nécessaire
5. **Performance** optimisée avec deux backends spécialisés

## Prochaines étapes

1. Tester l'intégration hybride
2. Migrer progressivement les fonctionnalités
3. Optimiser les performances
4. Consolider vers AdonisJS complet
EOF

log_success "Intégration hybride AdonisJS terminée !"
log_info "Prochaines étapes:"
log_info "1. cd adonisjs-backend && npm install"
log_info "2. ./scripts/start-hybrid.sh"
log_info "3. Consulter docs/INTEGRATION_ADONISJS_HYBRIDE.md"

echo ""
echo "🎉 Intégration AdonisJS terminée avec succès !"
echo "📖 Documentation: docs/INTEGRATION_ADONISJS_HYBRIDE.md"
echo "🚀 Pour démarrer: ./scripts/start-hybrid.sh" 