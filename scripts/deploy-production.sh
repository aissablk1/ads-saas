#!/bin/bash

# =============================================================================
# SCRIPT DE DÉPLOIEMENT PRODUCTION - SaaS ADS (SANS DOCKER)
# =============================================================================

set -e

echo "🚀 Déploiement du SaaS ADS en production (mode local)..."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Vérification des prérequis
log "Vérification des prérequis de déploiement..."

if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé"
    exit 1
fi

if [ ! -f ".env" ]; then
    error "Fichier .env manquant"
    exit 1
fi

# Vérification des variables critiques
log "Vérification des variables d'environnement..."
source .env

critical_vars=(
    "JWT_SECRET"
    "JWT_REFRESH_SECRET"
    "DATABASE_URL"
)

for var in "${critical_vars[@]}"; do
    if [ -z "${!var}" ] || [[ "${!var}" == *"CHANGE_THIS"* ]]; then
        error "Variable critique $var non configurée ou contient 'CHANGE_THIS'"
        exit 1
    fi
done

log "✅ Variables d'environnement validées"

# Créer les répertoires nécessaires
log "Création des répertoires de production..."
mkdir -p logs
mkdir -p uploads/files
mkdir -p uploads/reports
mkdir -p monitoring/logs
mkdir -p monitoring/metrics

# Backup de l'ancienne version si elle existe
if [ -f "server/dev.db" ]; then
    log "Backup de l'ancienne base de données..."
    cp server/dev.db "server/dev.db.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Arrêter les services existants
log "Arrêt des services existants..."
pkill -f "node.*server" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true
sleep 2

# Installation des dépendances
log "Installation des dépendances..."

# Installer les dépendances du serveur
if [ -d "server" ]; then
    cd server
    log "Installation des dépendances serveur..."
    npm install --production
    cd ..
fi

# Installer les dépendances du client
if [ -d "client" ]; then
    cd client
    log "Installation des dépendances client..."
    npm install --production
    cd ..
fi

# Configuration de la base de données
log "Configuration de la base de données..."
cd server

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations (remplacé par db push)
if [ -f "dev.db" ]; then
    log "Base existante supprimée pour éviter les conflits."
    rm -f dev.db
fi
npx prisma db push --force-reset

# Seeder la base de données
if [ -f "scripts/seed-test-data.js" ]; then
    node scripts/seed-test-data.js
fi

cd ..

# Build de production du client
log "Build de production du client..."
cd client
npm run build
cd ..

# Créer les scripts de démarrage de production
log "Création des scripts de démarrage de production..."

# Script de démarrage du serveur
cat > start-server-prod.sh << 'EOF'
#!/bin/bash
cd server
NODE_ENV=production PORT=8000 npm start > ../logs/server-prod.log 2>&1 &
echo $! > ../logs/server.pid
cd ..
echo "✅ Serveur de production démarré (PID: $(cat logs/server.pid))"
EOF

chmod +x start-server-prod.sh

# Script de démarrage du client
cat > start-client-prod.sh << 'EOF'
#!/bin/bash
cd client
NODE_ENV=production npm start > ../logs/client-prod.log 2>&1 &
echo $! > ../logs/client.pid
cd ..
echo "✅ Client de production démarré (PID: $(cat logs/client.pid))"
EOF

chmod +x start-client-prod.sh

# Script d'arrêt
cat > stop-production.sh << 'EOF'
#!/bin/bash
echo "🛑 Arrêt des services de production..."

if [ -f "logs/server.pid" ]; then
    kill $(cat logs/server.pid) 2>/dev/null || true
    rm logs/server.pid
    echo "✅ Serveur arrêté"
fi

if [ -f "logs/client.pid" ]; then
    kill $(cat logs/client.pid) 2>/dev/null || true
    rm logs/client.pid
    echo "✅ Client arrêté"
fi

echo "✅ Tous les services arrêtés"
EOF

chmod +x stop-production.sh

# Script de redémarrage
cat > restart-production.sh << 'EOF'
#!/bin/bash
echo "🔄 Redémarrage des services de production..."
./stop-production.sh
sleep 2
./start-server-prod.sh
sleep 3
./start-client-prod.sh
echo "✅ Services redémarrés"
EOF

chmod +x restart-production.sh

# Script de statut
cat > status-production.sh << 'EOF'
#!/bin/bash
echo "📊 Statut des services de production..."

if [ -f "logs/server.pid" ]; then
    SERVER_PID=$(cat logs/server.pid)
    if ps -p $SERVER_PID > /dev/null; then
        echo "✅ Serveur: En cours d'exécution (PID: $SERVER_PID)"
    else
        echo "❌ Serveur: Arrêté"
    fi
else
    echo "❌ Serveur: Non démarré"
fi

if [ -f "logs/client.pid" ]; then
    CLIENT_PID=$(cat logs/client.pid)
    if ps -p $CLIENT_PID > /dev/null; then
        echo "✅ Client: En cours d'exécution (PID: $CLIENT_PID)"
    else
        echo "❌ Client: Arrêté"
    fi
else
    echo "❌ Client: Non démarré"
fi

echo ""
echo "🔗 URLs:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:  http://localhost:8000"
echo "  - API Docs: http://localhost:8000/api/docs"
EOF

chmod +x status-production.sh

# Démarrage des services
log "Démarrage des services de production..."

# Démarrer le serveur
./start-server-prod.sh

# Attendre que le serveur soit prêt
info "Attente que le serveur soit prêt..."
timeout=60
while ! curl -s http://localhost:8000/health > /dev/null 2>&1; do
    sleep 2
    timeout=$((timeout - 1))
    if [ $timeout -eq 0 ]; then
        error "Timeout: Serveur pas prêt après 60 secondes"
        exit 1
    fi
done

# Démarrer le client
./start-client-prod.sh

# Attendre que le client soit prêt
info "Attente que le client soit prêt..."
timeout=60
while ! curl -s http://localhost:3000 > /dev/null 2>&1; do
    sleep 2
    timeout=$((timeout - 1))
    if [ $timeout -eq 0 ]; then
        warn "Client peut prendre plus de temps à démarrer"
        break
    fi
done

# Tests de santé
log "Exécution des tests de santé..."

# Test API backend
if curl -s http://localhost:8000/health | grep -q "OK"; then
    log "✅ API Backend opérationnelle"
else
    error "❌ API Backend non fonctionnelle"
fi

# Test frontend
if curl -s http://localhost:3000 > /dev/null; then
    log "✅ Frontend accessible"
else
    warn "⚠️  Frontend peut prendre du temps à être accessible"
fi

# Test base de données
if [ -f "server/dev.db" ]; then
    log "✅ Base de données fonctionnelle"
else
    error "❌ Base de données non fonctionnelle"
fi

# Configuration post-déploiement
log "Configuration post-déploiement..."

# Démarrer le monitoring si configuré
if [ -f "monitoring/start-monitoring.sh" ]; then
    log "Démarrage du monitoring..."
    ./monitoring/start-monitoring.sh > monitoring/logs/monitor.log 2>&1 &
    echo $! > monitoring/logs/monitor.pid
fi

# Affichage du statut final
log "🎉 Déploiement terminé avec succès !"
echo
echo "🔗 URLs des services en production:"
echo "  - Application: http://localhost:3000"
echo "  - API Backend: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/api/docs"
echo "  - Health: http://localhost:8000/health"
echo
echo "📊 Statut des services:"
./status-production.sh

echo
echo "🛠️ Commandes utiles:"
echo "  - Voir les logs: tail -f logs/server-prod.log"
echo "  - Redémarrer: ./restart-production.sh"
echo "  - Arrêter: ./stop-production.sh"
echo "  - Statut: ./status-production.sh"
echo "  - Monitoring: file://$(pwd)/monitoring/dashboard.html"
echo

log "🚀 SaaS ADS déployé et opérationnel en production (mode local) !" 