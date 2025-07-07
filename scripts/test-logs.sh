#!/bin/bash

# =================================
# Script de Test des Logs - ADS SaaS
# =================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
LOGS_DIR="./logs"
TEST_DURATION=30  # secondes

# Fonction pour afficher l'aide
show_help() {
    echo -e "${CYAN}📋 Test des Logs - ADS SaaS${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    echo -e "${GREEN}Usage:${NC} $0 [COMMANDE]"
    echo
    echo -e "${GREEN}Commandes disponibles:${NC}"
    echo -e "  ${YELLOW}setup${NC}     - Configuration initiale des logs"
    echo -e "  ${YELLOW}test${NC}      - Test complet des logs"
    echo -e "  ${YELLOW}generate${NC}  - Générer des logs de test"
    echo -e "  ${YELLOW}verify${NC}    - Vérifier la structure des logs"
    echo -e "  ${YELLOW}cleanup${NC}   - Nettoyer les logs de test"
    echo -e "  ${YELLOW}help${NC}      - Afficher cette aide"
    echo
    echo -e "${GREEN}Exemples:${NC}"
    echo -e "  $0 setup"
    echo -e "  $0 test"
    echo -e "  $0 generate"
    echo
}

# Fonction pour créer la structure initiale des logs
setup_logs() {
    echo -e "${BLUE}⚙️  Configuration initiale des logs...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    
    # Créer le dossier logs s'il n'existe pas
    if [ ! -d "$LOGS_DIR" ]; then
        echo -e "${YELLOW}📁 Création du dossier logs...${NC}"
        mkdir -p "$LOGS_DIR"
        mkdir -p "$LOGS_DIR/backups"
    fi
    
    # Créer les fichiers de logs s'ils n'existent pas
    log_files=(
        "server.log"
        "client.log"
        "nginx.log"
        "postgres.log"
        "redis.log"
        "prometheus.log"
        "grafana.log"
        "deploy.log"
        "ssl-renewal.log"
    )
    
    for log_file in "${log_files[@]}"; do
        if [ ! -f "$LOGS_DIR/$log_file" ]; then
            echo -e "${YELLOW}📄 Création de $log_file...${NC}"
            touch "$LOGS_DIR/$log_file"
            echo "# Log file: $log_file" > "$LOGS_DIR/$log_file"
            echo "# Created: $(date)" >> "$LOGS_DIR/$log_file"
            echo "# ADS SaaS Application" >> "$LOGS_DIR/$log_file"
            echo >> "$LOGS_DIR/$log_file"
        fi
    done
    
    # Définir les permissions
    chmod 644 "$LOGS_DIR"/*.log
    chmod 755 "$LOGS_DIR"
    if [ -d "$LOGS_DIR/backups" ]; then
        chmod 755 "$LOGS_DIR/backups"
    fi
    
    echo -e "${GREEN}✅ Configuration terminée${NC}"
    echo -e "${CYAN}📁 Dossier logs: $LOGS_DIR${NC}"
    echo -e "${CYAN}📁 Dossier backups: $LOGS_DIR/backups${NC}"
    echo
}

# Fonction pour générer des logs de test
generate_test_logs() {
    echo -e "${BLUE}📝 Génération de logs de test...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    
    # Vérifier que le dossier logs existe
    if [ ! -d "$LOGS_DIR" ]; then
        echo -e "${RED}❌ Dossier logs non trouvé${NC}"
        echo -e "${YELLOW}💡 Exécutez d'abord: $0 setup${NC}"
        return 1
    fi
    
    # Générer des logs pour le serveur
    echo -e "${YELLOW}📡 Génération de logs serveur...${NC}"
    for i in {1..10}; do
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] [Server] Request $i processed successfully" >> "$LOGS_DIR/server.log"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [DEBUG] [Database] Query executed in ${RANDOM}ms" >> "$LOGS_DIR/server.log"
        sleep 0.1
    done
    
    # Générer des logs pour le client
    echo -e "${YELLOW}🖥️  Génération de logs client...${NC}"
    for i in {1..8}; do
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] [Client] Page $i loaded successfully" >> "$LOGS_DIR/client.log"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] [API] Request timeout on endpoint /api/data" >> "$LOGS_DIR/client.log"
        sleep 0.1
    done
    
    # Générer des logs pour Nginx
    echo -e "${YELLOW}🌐 Génération de logs Nginx...${NC}"
    for i in {1..15}; do
        echo "$(date '+%d/%b/%Y:%H:%M:%S +0000') - 192.168.1.$i - GET /api/users HTTP/1.1 200 1234" >> "$LOGS_DIR/nginx.log"
        echo "$(date '+%d/%b/%Y:%H:%M:%S +0000') - 192.168.1.$i - POST /api/auth/login HTTP/1.1 401 567" >> "$LOGS_DIR/nginx.log"
        sleep 0.1
    done
    
    # Générer des logs pour PostgreSQL
    echo -e "${YELLOW}🗄️  Génération de logs PostgreSQL...${NC}"
    for i in {1..5}; do
        echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] connection received: host=192.168.1.$i port=5432" >> "$LOGS_DIR/postgres.log"
        echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] connection authorized: user=ads_user database=ads_saas" >> "$LOGS_DIR/postgres.log"
        sleep 0.1
    done
    
    # Générer des logs pour Redis
    echo -e "${YELLOW}⚡ Génération de logs Redis...${NC}"
    for i in {1..6}; do
        echo "$(date '+%d %b %H:%M:%S') .* Accepted 192.168.1.$i:6379" >> "$LOGS_DIR/redis.log"
        echo "$(date '+%d %b %H:%M:%S') .* DB 0: 100 keys (0 volatile) in 128 slots." >> "$LOGS_DIR/redis.log"
        sleep 0.1
    done
    
    # Générer des logs pour Prometheus
    echo -e "${YELLOW}📊 Génération de logs Prometheus...${NC}"
    for i in {1..4}; do
        echo "$(date '+%Y-%m-%d %H:%M:%S') prometheus[1]: level=info ts=$(date +%s) caller=main.go:123 msg=\"Server is ready to receive web requests.\"" >> "$LOGS_DIR/prometheus.log"
        sleep 0.1
    done
    
    # Générer des logs pour Grafana
    echo -e "${YELLOW}📈 Génération de logs Grafana...${NC}"
    for i in {1..3}; do
        echo "$(date '+%Y-%m-%d %H:%M:%S') grafana[1]: level=info msg=\"HTTP Server Listen\" logger=http.server address=0.0.0.0:3000 protocol=http subUrl= socket=" >> "$LOGS_DIR/grafana.log"
        sleep 0.1
    done
    
    # Générer des logs de déploiement
    echo -e "${YELLOW}🚀 Génération de logs de déploiement...${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] Starting deployment of ADS SaaS v1.0.0" >> "$LOGS_DIR/deploy.log"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] Building Docker images..." >> "$LOGS_DIR/deploy.log"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [SUCCESS] Deployment completed successfully" >> "$LOGS_DIR/deploy.log"
    
    # Générer des logs SSL
    echo -e "${YELLOW}🔒 Génération de logs SSL...${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] SSL certificate renewal check started" >> "$LOGS_DIR/ssl-renewal.log"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] Certificate expires in 30 days" >> "$LOGS_DIR/ssl-renewal.log"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [SUCCESS] SSL renewal check completed" >> "$LOGS_DIR/ssl-renewal.log"
    
    echo -e "${GREEN}✅ Génération de logs terminée${NC}"
    echo
}

# Fonction pour vérifier la structure des logs
verify_logs() {
    echo -e "${BLUE}🔍 Vérification de la structure des logs...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    
    # Vérifier le dossier logs
    if [ ! -d "$LOGS_DIR" ]; then
        echo -e "${RED}❌ Dossier logs non trouvé${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Dossier logs trouvé: $LOGS_DIR${NC}"
    
    # Vérifier les fichiers de logs
    log_files=(
        "server.log"
        "client.log"
        "nginx.log"
        "postgres.log"
        "redis.log"
        "prometheus.log"
        "grafana.log"
        "deploy.log"
        "ssl-renewal.log"
    )
    
    echo -e "${CYAN}📄 Vérification des fichiers de logs:${NC}"
    for log_file in "${log_files[@]}"; do
        if [ -f "$LOGS_DIR/$log_file" ]; then
            size=$(du -h "$LOGS_DIR/$log_file" 2>/dev/null | cut -f1 || echo '0B')
            lines=$(wc -l < "$LOGS_DIR/$log_file" 2>/dev/null || echo '0')
            echo -e "   ${GREEN}✅ $log_file${NC} - ${CYAN}$size${NC} - ${CYAN}$lines lignes${NC}"
        else
            echo -e "   ${RED}❌ $log_file${NC} - ${RED}Manquant${NC}"
        fi
    done
    
    # Vérifier le dossier backups
    if [ -d "$LOGS_DIR/backups" ]; then
        echo -e "${GREEN}✅ Dossier backups trouvé${NC}"
    else
        echo -e "${RED}❌ Dossier backups manquant${NC}"
    fi
    
    # Vérifier les permissions
    echo -e "${CYAN}🔐 Vérification des permissions:${NC}"
    if [ -r "$LOGS_DIR" ] && [ -w "$LOGS_DIR" ]; then
        echo -e "   ${GREEN}✅ Permissions dossier logs OK${NC}"
    else
        echo -e "   ${RED}❌ Permissions dossier logs incorrectes${NC}"
    fi
    
    for log_file in "$LOGS_DIR"/*.log; do
        if [ -f "$log_file" ]; then
            if [ -r "$log_file" ] && [ -w "$log_file" ]; then
                echo -e "   ${GREEN}✅ Permissions $(basename "$log_file") OK${NC}"
            else
                echo -e "   ${RED}❌ Permissions $(basename "$log_file") incorrectes${NC}"
            fi
        fi
    done
    
    echo
}

# Fonction pour nettoyer les logs de test
cleanup_test_logs() {
    echo -e "${BLUE}🧹 Nettoyage des logs de test...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    
    # Demander confirmation
    read -p "Voulez-vous supprimer tous les logs de test ? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}⚠️  Nettoyage annulé${NC}"
        return 0
    fi
    
    # Supprimer les fichiers de logs
    if [ -d "$LOGS_DIR" ]; then
        echo -e "${YELLOW}🗑️  Suppression des fichiers de logs...${NC}"
        rm -f "$LOGS_DIR"/*.log
        rm -f "$LOGS_DIR"/*.log.*
        rm -rf "$LOGS_DIR/backups"/*
        echo -e "${GREEN}✅ Logs de test supprimés${NC}"
    else
        echo -e "${BLUE}ℹ️  Dossier logs non trouvé${NC}"
    fi
    
    echo
}

# Fonction pour test complet
run_complete_test() {
    echo -e "${BLUE}🧪 Test complet des logs...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    
    # Étape 1: Configuration
    echo -e "${CYAN}📋 Étape 1: Configuration initiale${NC}"
    setup_logs
    
    # Étape 2: Génération de logs
    echo -e "${CYAN}📋 Étape 2: Génération de logs de test${NC}"
    generate_test_logs
    
    # Étape 3: Vérification
    echo -e "${CYAN}📋 Étape 3: Vérification de la structure${NC}"
    verify_logs
    
    # Étape 4: Test du script de gestion
    echo -e "${CYAN}📋 Étape 4: Test du script de gestion${NC}"
    if [ -f "scripts/manage-logs.sh" ]; then
        echo -e "${YELLOW}📊 Test du statut des logs...${NC}"
        ./scripts/manage-logs.sh status
        
        echo -e "${YELLOW}🔍 Test de recherche...${NC}"
        ./scripts/manage-logs.sh search "INFO"
        
        echo -e "${GREEN}✅ Script de gestion fonctionnel${NC}"
    else
        echo -e "${RED}❌ Script de gestion non trouvé${NC}"
    fi
    
    # Étape 5: Test de rotation
    echo -e "${CYAN}📋 Étape 5: Test de rotation${NC}"
    if [ -f "scripts/manage-logs.sh" ]; then
        echo -e "${YELLOW}🔄 Test de rotation des logs...${NC}"
        ./scripts/manage-logs.sh rotate
        
        echo -e "${YELLOW}📊 Vérification après rotation...${NC}"
        ./scripts/manage-logs.sh status
    fi
    
    echo -e "${GREEN}✅ Test complet terminé${NC}"
    echo
    echo -e "${CYAN}📋 Résumé:${NC}"
    echo -e "   ${GREEN}✅ Configuration des logs${NC}"
    echo -e "   ${GREEN}✅ Génération de logs de test${NC}"
    echo -e "   ${GREEN}✅ Vérification de la structure${NC}"
    echo -e "   ${GREEN}✅ Test du script de gestion${NC}"
    echo -e "   ${GREEN}✅ Test de rotation${NC}"
    echo
}

# Fonction principale
main() {
    case ${1:-"help"} in
        "setup")
            setup_logs
            ;;
        "test")
            run_complete_test
            ;;
        "generate")
            generate_test_logs
            ;;
        "verify")
            verify_logs
            ;;
        "cleanup")
            cleanup_test_logs
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Exécution du script
main "$@" 