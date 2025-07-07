#!/bin/bash

# =================================
# Script de Déploiement ADS SaaS
# =================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ads-saas"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy.log"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a $LOG_FILE
}

# Pre-deployment checks
pre_deployment_checks() {
    log "🔍 Exécution des vérifications pré-déploiement..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        error "Docker n'est pas en cours d'exécution"
        exit 1
    fi
    
    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        error "Fichier d'environnement $ENV_FILE introuvable"
        exit 1
    fi
    
    # Check if docker-compose file exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        error "Fichier docker-compose $COMPOSE_FILE introuvable"
        exit 1
    fi
    
    # Check disk space (minimum 2GB)
    available_space=$(df . | awk 'NR==2 {print $4}')
    if [ $available_space -lt 2097152 ]; then
        error "Espace disque insuffisant (minimum 2GB requis)"
        exit 1
    fi
    
    log "✅ Toutes les vérifications pré-déploiement sont passées"
}

# Create backup
create_backup() {
    log "💾 Création d'une sauvegarde..."
    
    mkdir -p $BACKUP_DIR
    backup_name="backup_$(date +%Y%m%d_%H%M%S)"
    
    # Backup database
    if docker-compose ps postgres | grep -q "Up"; then
        log "Sauvegarde de la base de données..."
        docker-compose exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > "$BACKUP_DIR/${backup_name}_db.sql"
    fi
    
    # Backup uploaded files
    if [ -d "./server/uploads" ]; then
        log "Sauvegarde des fichiers uploadés..."
        tar -czf "$BACKUP_DIR/${backup_name}_uploads.tar.gz" -C ./server uploads/
    fi
    
    # Backup configuration
    cp $ENV_FILE "$BACKUP_DIR/${backup_name}_env"
    
    log "✅ Sauvegarde créée: $backup_name"
    echo "$backup_name" > "$BACKUP_DIR/latest_backup"
}

# Build images
build_images() {
    log "🏗️ Construction des images Docker..."
    
    # Pull latest base images
    docker-compose pull postgres redis nginx prometheus grafana node-exporter
    
    # Build application images
    docker-compose build --no-cache --parallel client server
    
    log "✅ Images construites avec succès"
}

# Health check
health_check() {
    log "🏥 Vérification de la santé des services..."
    
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost/health >/dev/null 2>&1; then
            log "✅ Application accessible et en bonne santé"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log "Tentative $attempt/$max_attempts - En attente..."
        sleep 10
    done
    
    error "L'application n'est pas accessible après $max_attempts tentatives"
    return 1
}

# Rollback function
rollback() {
    log "🔄 Rollback en cours..."
    
    if [ -f "$BACKUP_DIR/latest_backup" ]; then
        backup_name=$(cat "$BACKUP_DIR/latest_backup")
        
        # Stop current services
        docker-compose down
        
        # Restore database
        if [ -f "$BACKUP_DIR/${backup_name}_db.sql" ]; then
            log "Restauration de la base de données..."
            docker-compose up -d postgres
            sleep 10
            cat "$BACKUP_DIR/${backup_name}_db.sql" | docker-compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
        fi
        
        # Restore files
        if [ -f "$BACKUP_DIR/${backup_name}_uploads.tar.gz" ]; then
            log "Restauration des fichiers..."
            tar -xzf "$BACKUP_DIR/${backup_name}_uploads.tar.gz" -C ./server/
        fi
        
        # Restore environment
        if [ -f "$BACKUP_DIR/${backup_name}_env" ]; then
            cp "$BACKUP_DIR/${backup_name}_env" $ENV_FILE
        fi
        
        log "✅ Rollback terminé"
    else
        error "Aucune sauvegarde trouvée pour le rollback"
    fi
}

# Deploy function
deploy() {
    log "🚀 Début du déploiement de $PROJECT_NAME..."
    
    # Load environment variables
    export $(cat $ENV_FILE | grep -v '^#' | xargs)
    
    # Run database migrations
    log "Exécution des migrations de base de données..."
    docker-compose run --rm server npx prisma migrate deploy
    
    # Start services with zero-downtime deployment
    log "Démarrage des services..."
    docker-compose up -d --remove-orphans
    
    # Wait for services to be ready
    log "Attente du démarrage des services..."
    sleep 30
    
    # Health check
    if health_check; then
        log "🎉 Déploiement réussi!"
        
        # Cleanup old images
        docker image prune -f
        
        # Send success notification
        if [ -n "$WEBHOOK_URL" ]; then
            curl -X POST "$WEBHOOK_URL" \
                -H "Content-Type: application/json" \
                -d "{\"text\":\"✅ Déploiement ADS SaaS réussi\"}"
        fi
        
        return 0
    else
        error "Le déploiement a échoué lors de la vérification de santé"
        return 1
    fi
}

# Main deployment process
main() {
    log "🎯 Début du processus de déploiement"
    
    # Trap for cleanup on failure
    trap 'error "Déploiement échoué. Rollback disponible avec: ./deploy.sh rollback"' ERR
    
    # S'assurer que le dossier logs existe
    mkdir -p ./logs
    
    case "${1:-deploy}" in
        "deploy")
            pre_deployment_checks
            create_backup
            build_images
            if ! deploy; then
                error "Déploiement échoué"
                read -p "Voulez-vous effectuer un rollback automatique? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    rollback
                fi
                exit 1
            fi
            ;;
        "rollback")
            log "🔄 Rollback demandé"
            rollback
            docker-compose up -d
            ;;
        "status")
            log "📊 Statut des services:"
            docker-compose ps
            ;;
        "logs")
            log "📋 Logs des services:"
            docker-compose logs --tail=100 -f
            ;;
        "backup")
            create_backup
            ;;
        "health")
            health_check
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|status|logs|backup|health}"
            echo "  deploy  - Déploie l'application (défaut)"
            echo "  rollback - Rollback vers la dernière sauvegarde"
            echo "  status  - Affiche le statut des services"
            echo "  logs    - Affiche les logs des services"
            echo "  backup  - Crée une sauvegarde manuelle"
            echo "  health  - Vérifie la santé de l'application"
            exit 1
            ;;
    esac
}

# Run main function
main "$@" 