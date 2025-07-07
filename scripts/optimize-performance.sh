#!/bin/bash

# Script d'optimisation automatique des performances pour ADS
# Usage: ./scripts/optimize-performance.sh [option]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
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
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    error "Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Fonction d'optimisation de la base de données
optimize_database() {
    log "🔧 Optimisation de la base de données..."
    
    cd server
    
    # Générer le client Prisma avec les nouveaux index
    log "Génération du client Prisma..."
    npx prisma generate
    
    # Appliquer les migrations
    log "Application des migrations..."
    npx prisma migrate deploy
    
    # Optimiser la base de données SQLite
    log "Optimisation SQLite..."
    npx prisma db execute --stdin <<< "
        PRAGMA optimize;
        VACUUM;
        ANALYZE;
    "
    
    cd ..
    log "✅ Base de données optimisée"
}

# Fonction d'optimisation du cache Redis
optimize_cache() {
    log "🔧 Optimisation du cache Redis..."
    
    # Vérifier si Redis est en cours d'exécution
    if ! pgrep -x "redis-server" > /dev/null; then
        warn "Redis n'est pas en cours d'exécution. Démarrage..."
        redis-server --daemonize yes
        sleep 2
    fi
    
    # Nettoyer le cache
    redis-cli FLUSHDB
    
    # Configurer Redis pour les performances
    redis-cli CONFIG SET maxmemory-policy allkeys-lru
    redis-cli CONFIG SET save ""
    redis-cli CONFIG SET appendonly no
    
    log "✅ Cache Redis optimisé"
}

# Fonction d'optimisation du frontend
optimize_frontend() {
    log "🔧 Optimisation du frontend..."
    
    cd client
    
    # Nettoyer les caches
    log "Nettoyage des caches..."
    rm -rf .next
    rm -rf node_modules/.cache
    
    # Optimiser les dépendances
    log "Optimisation des dépendances..."
    npm ci --production=false
    
    # Build optimisé
    log "Build optimisé..."
    npm run build
    
    cd ..
    log "✅ Frontend optimisé"
}

# Fonction d'optimisation du backend
optimize_backend() {
    log "🔧 Optimisation du backend..."
    
    cd server
    
    # Nettoyer les caches
    log "Nettoyage des caches..."
    rm -rf node_modules/.cache
    rm -rf tmp/*
    
    # Optimiser les dépendances
    log "Optimisation des dépendances..."
    npm ci --production=false
    
    # Vérifier la configuration
    log "Vérification de la configuration..."
    node -c src/index.ts
    
    cd ..
    log "✅ Backend optimisé"
}

# Fonction d'optimisation système
optimize_system() {
    log "🔧 Optimisation système..."
    
    # Vérifier l'espace disque
    DISK_USAGE=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 90 ]; then
        warn "Espace disque faible: ${DISK_USAGE}%"
        log "Nettoyage des fichiers temporaires..."
        find . -name "*.tmp" -delete
        find . -name "*.log" -size +100M -delete
    fi
    
    # Optimiser la mémoire
    if command -v sysctl &> /dev/null; then
        log "Optimisation de la mémoire..."
        sudo sysctl -w vm.swappiness=10
    fi
    
    log "✅ Système optimisé"
}

# Fonction de test de performance
test_performance() {
    log "🧪 Test de performance..."
    
    # Test de la base de données
    log "Test de la base de données..."
    cd server
    npx prisma db execute --stdin <<< "
        SELECT COUNT(*) as user_count FROM users;
        SELECT COUNT(*) as campaign_count FROM campaigns;
    "
    cd ..
    
    # Test de Redis
    log "Test de Redis..."
    redis-cli ping
    redis-cli info memory | grep used_memory_human
    
    # Test du serveur
    log "Test du serveur..."
    if curl -s http://localhost:8000/health > /dev/null; then
        log "✅ Serveur accessible"
    else
        warn "Serveur non accessible sur le port 8000"
    fi
    
    # Test du frontend
    log "Test du frontend..."
    if curl -s http://localhost:3000 > /dev/null; then
        log "✅ Frontend accessible"
    else
        warn "Frontend non accessible sur le port 3000"
    fi
    
    log "✅ Tests de performance terminés"
}

# Fonction de monitoring
start_monitoring() {
    log "📊 Démarrage du monitoring..."
    
    # Démarrer Prometheus et Grafana si disponibles
    if [ -d "monitoring" ]; then
        cd monitoring
        if [ -f "start-monitoring.sh" ]; then
            ./start-monitoring.sh &
            log "Monitoring démarré"
        fi
        cd ..
    fi
    
    # Afficher les métriques en temps réel
    log "Métriques en temps réel (Ctrl+C pour arrêter):"
    while true; do
        echo "--- $(date) ---"
        
        # CPU et mémoire
        echo "CPU: $(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')%"
        echo "Mémoire: $(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//') pages libres"
        
        # Base de données
        if command -v sqlite3 &> /dev/null; then
            echo "DB taille: $(ls -lh server/prisma/dev.db | awk '{print $5}')"
        fi
        
        # Redis
        if command -v redis-cli &> /dev/null; then
            echo "Redis mémoire: $(redis-cli info memory | grep used_memory_human | cut -d: -f2)"
        fi
        
        sleep 5
    done
}

# Fonction d'aide
show_help() {
    echo "Script d'optimisation des performances pour ADS"
    echo ""
    echo "Usage: $0 [option]"
    echo ""
    echo "Options:"
    echo "  all           Optimisation complète (défaut)"
    echo "  db            Optimisation de la base de données uniquement"
    echo "  cache         Optimisation du cache Redis uniquement"
    echo "  frontend      Optimisation du frontend uniquement"
    echo "  backend       Optimisation du backend uniquement"
    echo "  system        Optimisation système uniquement"
    echo "  test          Test de performance"
    echo "  monitor       Démarrer le monitoring"
    echo "  help          Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0             # Optimisation complète"
    echo "  $0 db          # Optimisation DB uniquement"
    echo "  $0 test        # Test de performance"
}

# Fonction principale
main() {
    case "${1:-all}" in
        "all")
            log "🚀 Optimisation complète des performances..."
            optimize_database
            optimize_cache
            optimize_frontend
            optimize_backend
            optimize_system
            test_performance
            log "✅ Optimisation complète terminée"
            ;;
        "db")
            optimize_database
            ;;
        "cache")
            optimize_cache
            ;;
        "frontend")
            optimize_frontend
            ;;
        "backend")
            optimize_backend
            ;;
        "system")
            optimize_system
            ;;
        "test")
            test_performance
            ;;
        "monitor")
            start_monitoring
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            error "Option invalide: $1"
            show_help
            exit 1
            ;;
    esac
}

# Exécuter le script
main "$@" 