#!/bin/bash

# =============================================================================
# SCRIPT DE REDÉMARRAGE DES SERVICES - SaaS ADS
# =============================================================================

echo "🔄 Redémarrage des services SaaS ADS..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️ $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️ $1${NC}"
}

# 1. Arrêt des services existants
info "Arrêt des services existants..."
pkill -f "node.*server" || true
pkill -f "next dev" || true
sleep 2
log "Services arrêtés"

# 2. Nettoyage des ports
info "Libération des ports..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
log "Ports libérés"

# 3. Démarrage du backend
info "Démarrage du backend sur port 8000..."
cd server/src
mkdir -p ../../logs
nohup node index.js > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Attendre que le backend soit prêt
sleep 3
if curl -s http://localhost:8000/health > /dev/null; then
    log "Backend démarré avec succès (PID: $BACKEND_PID)"
else
    warn "Le backend met plus de temps à démarrer, vérifiez les logs"
fi

# 4. Démarrage du frontend
info "Démarrage du frontend sur port 3000..."
cd client
mkdir -p ../logs
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Attendre que le frontend soit prêt
info "Attente du démarrage du frontend (peut prendre 10-15 secondes)..."
timeout=30
while ! curl -s http://localhost:3000 > /dev/null; do
    sleep 1
    timeout=$((timeout - 1))
    if [ $timeout -eq 0 ]; then
        warn "Le frontend met plus de temps à démarrer, vérifiez les logs"
        break
    fi
done

if curl -s http://localhost:3000 > /dev/null; then
    log "Frontend démarré avec succès (PID: $FRONTEND_PID)"
fi

# 5. Test rapide des services
info "Test des services..."

# Test backend
if curl -s http://localhost:8000/api/docs > /dev/null; then
    log "API Documentation accessible"
else
    warn "Problème avec l'API, vérifiez les logs backend"
fi

# Test frontend
if curl -s http://localhost:3000/login > /dev/null; then
    log "Page de login accessible"
else
    warn "Problème avec le frontend, vérifiez les logs"
fi

# 6. Affichage des informations
echo
echo "🎉 SERVICES REDÉMARRÉS AVEC SUCCÈS"
echo
echo "📊 État des services:"
echo "  - Backend API: http://localhost:8000"
echo "  - Frontend: http://localhost:3000"
echo "  - PIDs: Backend($BACKEND_PID), Frontend($FRONTEND_PID)"
echo
echo "🔗 URLs utiles:"
echo "  - Health Check: http://localhost:8000/health"
echo "  - API Docs: http://localhost:8000/api/docs"
echo "  - Login: http://localhost:3000/login"
echo "  - Dashboard: http://localhost:3000/dashboard"
echo
echo "📁 Logs disponibles:"
echo "  - Backend: logs/backend.log"
echo "  - Frontend: logs/frontend.log"
echo
echo "🛠️ Commandes utiles:"
echo "  - Voir logs backend: tail -f logs/backend.log"
echo "  - Voir logs frontend: tail -f logs/frontend.log"
echo "  - Arrêter services: pkill -f 'node.*server' && pkill -f 'next dev'"
echo

log "🚀 SaaS ADS prêt à l'emploi !" 