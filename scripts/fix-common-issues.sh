#!/bin/bash

# Script de correction automatique des problèmes courants
# Auteur: Aïssa BELKOUSSA
# Description: Correction automatique des problèmes courants d'ADS SaaS

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helpers
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
info() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
error() { echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }

# Variables
SERVER_PORT=8000
CLIENT_PORT=3000

echo -e "${CYAN}🔧 Correction automatique des problèmes courants d'ADS SaaS${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo

# 1. Vérification de l'environnement
log "1️⃣ Vérification de l'environnement..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    error "❌ Node.js n'est pas installé"
    echo "Installez Node.js 18+ depuis https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "❌ Node.js version 18+ requis. Version actuelle: $(node -v)"
    exit 1
fi

log "✅ Node.js $(node -v) détecté"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    error "❌ npm n'est pas installé"
    exit 1
fi

log "✅ npm $(npm --version) détecté"

# 2. Nettoyage des processus
log "2️⃣ Nettoyage des processus..."

# Arrêter les processus sur les ports utilisés
for port in $SERVER_PORT $CLIENT_PORT 5000; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        warn "⚠️  Arrêt du processus sur le port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi
done

# Nettoyer les processus Node.js orphelins
node_pids=$(pgrep -f "node.*ads" 2>/dev/null || true)
if [ ! -z "$node_pids" ]; then
    warn "⚠️  Arrêt des processus Node.js orphelins"
    echo $node_pids | xargs kill -9 2>/dev/null || true
fi

log "✅ Nettoyage des processus terminé"

# 3. Correction du schéma Prisma
log "3️⃣ Correction du schéma Prisma..."

if [ -d "server" ]; then
    cd server
    
    # Vérifier si le schéma principal existe
    if [ ! -f "prisma/schema.prisma" ]; then
        warn "⚠️  Schéma principal manquant, création..."
        if [ -f "prisma/schema.sqlite.prisma" ]; then
            cp prisma/schema.sqlite.prisma prisma/schema.prisma
            log "✅ Schéma copié depuis schema.sqlite.prisma"
        else
            error "❌ Aucun schéma Prisma trouvé"
            cd ..
            exit 1
        fi
    fi
    
    # Vérifier et corriger le provider
    if ! grep -q 'provider = "sqlite"' prisma/schema.prisma; then
        warn "⚠️  Provider non-SQLite détecté, correction..."
        sed -i '' 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
        log "✅ Provider changé vers SQLite"
    fi
    
    # Supprimer les champs Stripe non supportés
    if grep -q "currentPeriodStart\|currentPeriodEnd\|cancelAtPeriodEnd" prisma/schema.prisma; then
        warn "⚠️  Champs Stripe détectés, nettoyage..."
        sed -i '' '/currentPeriodStart/d' prisma/schema.prisma
        sed -i '' '/currentPeriodEnd/d' prisma/schema.prisma
        sed -i '' '/cancelAtPeriodEnd/d' prisma/schema.prisma
        log "✅ Champs Stripe supprimés"
    fi
    
    # Régénérer le client Prisma
    log "🔧 Régénération du client Prisma..."
    npx prisma generate
    
    cd ..
    log "✅ Schéma Prisma corrigé"
else
    error "❌ Répertoire server non trouvé"
    exit 1
fi

# 4. Correction des dépendances
log "4️⃣ Correction des dépendances..."

# Réinstaller les dépendances du serveur
if [ -d "server" ]; then
    cd server
    log "📦 Réinstallation des dépendances du serveur..."
    rm -rf node_modules package-lock.json
    npm install
    cd ..
    log "✅ Dépendances du serveur réinstallées"
fi

# Réinstaller les dépendances du client
if [ -d "client" ]; then
    cd client
    log "📦 Réinstallation des dépendances du client..."
    rm -rf node_modules package-lock.json .next
    npm install
    cd ..
    log "✅ Dépendances du client réinstallées"
fi

# 5. Correction de la base de données
log "5️⃣ Correction de la base de données..."

if [ -d "server" ]; then
    cd server
    
    # Supprimer la base de données existante
    if [ -f "dev.db" ]; then
        warn "⚠️  Suppression de l'ancienne base de données..."
        rm -f dev.db
    fi
    
    # Supprimer les migrations
    if [ -d "prisma/migrations" ]; then
        warn "⚠️  Suppression des anciennes migrations..."
        rm -rf prisma/migrations
    fi
    
    # Recréer la base de données
    log "🗄️  Recréation de la base de données..."
    npx prisma db push --force-reset
    
    # Ajouter les données de test
    log "🌱 Ajout des données de test..."
    if [ -f "scripts/seed-test-data.js" ]; then
        node scripts/seed-test-data.js
    else
        npx prisma db seed
    fi
    
    cd ..
    log "✅ Base de données corrigée"
fi

# 6. Correction des fichiers de configuration
log "6️⃣ Correction des fichiers de configuration..."

# Créer le fichier .env du serveur s'il n'existe pas
if [ -d "server" ] && [ ! -f "server/.env" ]; then
    warn "⚠️  Création du fichier .env du serveur..."
    cat > server/.env << EOF
PORT=8000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="ads-saas-secret-key-change-in-production-32-chars-min"
JWT_REFRESH_SECRET="ads-saas-refresh-secret-change-in-production-32"
FRONTEND_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:8000"
EOF
    log "✅ Fichier .env du serveur créé"
fi

# Créer le fichier .env principal s'il n'existe pas
if [ ! -f ".env" ]; then
    warn "⚠️  Création du fichier .env principal..."
    cat > .env << EOF
# Configuration ADS SaaS
NODE_ENV=development
PORT=8000
DATABASE_URL="file:./dev.db"
JWT_SECRET="ads-saas-secret-key-change-in-production-32-chars-min"
JWT_REFRESH_SECRET="ads-saas-refresh-secret-change-in-production-32"
FRONTEND_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:8000"
EOF
    log "✅ Fichier .env principal créé"
fi

# 7. Correction des scripts de démarrage
log "7️⃣ Correction des scripts de démarrage..."

# Vérifier le script dev dans package.json du serveur
if [ -d "server" ]; then
    cd server
    if ! grep -q '"dev":' package.json; then
        warn "⚠️  Ajout du script dev dans package.json..."
        # Ajouter le script dev s'il n'existe pas
        sed -i '' 's/"start": "node dist\/index.js"/"dev": "nodemon src\/index.js",\n    "start": "node dist\/index.js"/' package.json
        log "✅ Script dev ajouté"
    fi
    cd ..
fi

# 8. Test de la correction
log "8️⃣ Test de la correction..."

# Démarrer le serveur en arrière-plan
if [ -d "server" ]; then
    cd server
    log "🚀 Démarrage du serveur pour test..."
    PORT=$SERVER_PORT node src/index.js > /dev/null 2>&1 &
    SERVER_PID=$!
    cd ..
    
    # Attendre que le serveur démarre
    sleep 5
    
    # Tester l'accessibilité
    if curl -s --max-time 5 http://localhost:$SERVER_PORT/health > /dev/null 2>&1; then
        log "✅ Serveur accessible après correction"
    else
        warn "⚠️  Serveur non accessible, vérifiez les logs"
    fi
    
    # Arrêter le serveur de test
    kill $SERVER_PID 2>/dev/null || true
fi

echo
echo -e "${GREEN}🎉 Correction automatique terminée !${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo
echo -e "${BLUE}📋 Résumé des corrections:${NC}"
echo "   ✅ Environnement vérifié"
echo "   ✅ Processus nettoyés"
echo "   ✅ Schéma Prisma corrigé"
echo "   ✅ Dépendances réinstallées"
echo "   ✅ Base de données recréée"
echo "   ✅ Configuration corrigée"
echo "   ✅ Scripts de démarrage vérifiés"
echo "   ✅ Test de correction effectué"
echo
echo -e "${GREEN}🚀 Pour démarrer l'application:${NC}"
echo "   ./run.sh start"
echo
echo -e "${BLUE}🔧 Pour tester le backend:${NC}"
echo "   ./run.sh test-backend"
echo
echo -e "${CYAN}📖 Pour voir les logs:${NC}"
echo "   ./run.sh logs" 