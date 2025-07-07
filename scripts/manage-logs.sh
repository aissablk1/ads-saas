#!/bin/bash

# =================================
# Script de Gestion des Logs ADS SaaS
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
MAX_LOG_SIZE="100M"
MAX_LOG_DAYS=30
BACKUP_DIR="./logs/backups"

# Fonction pour afficher l'aide
show_help() {
    echo -e "${CYAN}📋 Script de Gestion des Logs ADS SaaS${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    echo -e "${GREEN}Usage:${NC} $0 [COMMANDE]"
    echo
    echo -e "${GREEN}Commandes disponibles:${NC}"
    echo -e "  ${YELLOW}status${NC}     - Afficher le statut des logs"
    echo -e "  ${YELLOW}rotate${NC}     - Rotation des logs"
    echo -e "  ${YELLOW}clean${NC}      - Nettoyer les anciens logs"
    echo -e "  ${YELLOW}backup${NC}     - Sauvegarder les logs"
    echo -e "  ${YELLOW}monitor${NC}    - Surveiller les logs en temps réel"
    echo -e "  ${YELLOW}search${NC}     - Rechercher dans les logs"
    echo -e "  ${YELLOW}setup${NC}      - Configuration initiale"
    echo -e "  ${YELLOW}help${NC}       - Afficher cette aide"
    echo
    echo -e "${GREEN}Exemples:${NC}"
    echo -e "  $0 status"
    echo -e "  $0 rotate"
    echo -e "  $0 search error"
    echo -e "  $0 monitor server"
    echo
}

# Fonction pour vérifier si le dossier logs existe
check_logs_dir() {
    if [ ! -d "$LOGS_DIR" ]; then
        echo -e "${YELLOW}📁 Création du dossier logs...${NC}"
        mkdir -p "$LOGS_DIR"
        mkdir -p "$BACKUP_DIR"
        echo -e "${GREEN}✅ Dossier logs créé${NC}"
    fi
}

# Fonction pour afficher le statut des logs
show_status() {
    echo -e "${BLUE}🔍 Statut des logs ADS SaaS...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    
    check_logs_dir
    
    # Informations générales
    echo -e "${GREEN}📊 Informations générales:${NC}"
    echo -e "   Dossier logs: ${CYAN}$LOGS_DIR${NC}"
    echo -e "   Taille totale: ${CYAN}$(du -sh $LOGS_DIR 2>/dev/null | cut -f1 || echo '0B')${NC}"
    echo -e "   Nombre de fichiers: ${CYAN}$(find $LOGS_DIR -name "*.log" 2>/dev/null | wc -l)${NC}"
    echo
    
    # Liste des fichiers de logs
    echo -e "${GREEN}📄 Fichiers de logs:${NC}"
    if [ -d "$LOGS_DIR" ]; then
        for log_file in "$LOGS_DIR"/*.log; do
            if [ -f "$log_file" ]; then
                filename=$(basename "$log_file")
                size=$(du -h "$log_file" 2>/dev/null | cut -f1 || echo '0B')
                lines=$(wc -l < "$log_file" 2>/dev/null || echo '0')
                modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$log_file" 2>/dev/null || echo 'N/A')
                echo -e "   ${YELLOW}$filename${NC} - ${CYAN}$size${NC} - ${CYAN}$lines lignes${NC} - ${CYAN}$modified${NC}"
            fi
        done
    else
        echo -e "   ${RED}Aucun fichier de log trouvé${NC}"
    fi
    echo
    
    # Espace disque
    echo -e "${GREEN}💾 Espace disque:${NC}"
    df -h . | grep -E "(Filesystem|$(pwd))" || echo -e "   ${RED}Impossible de récupérer l'espace disque${NC}"
    echo
}

# Fonction pour la rotation des logs
rotate_logs() {
    echo -e "${BLUE}🔄 Rotation des logs...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    
    check_logs_dir
    
    # Créer le dossier de backup s'il n'existe pas
    mkdir -p "$BACKUP_DIR"
    
    # Date pour le backup
    backup_date=$(date +"%Y%m%d_%H%M%S")
    
    # Rotation des fichiers de logs
    for log_file in "$LOGS_DIR"/*.log; do
        if [ -f "$log_file" ]; then
            filename=$(basename "$log_file")
            size=$(du -h "$log_file" | cut -f1)
            
            echo -e "${YELLOW}📄 Rotation de $filename (${size})...${NC}"
            
            # Créer le backup
            backup_file="$BACKUP_DIR/${filename%.log}_${backup_date}.log"
            cp "$log_file" "$backup_file"
            
            # Vider le fichier original
            > "$log_file"
            
            echo -e "${GREEN}✅ $filename roté vers $backup_file${NC}"
        fi
    done
    
    # Nettoyer les anciens backups
    echo -e "${YELLOW}🧹 Nettoyage des anciens backups...${NC}"
    find "$BACKUP_DIR" -name "*.log" -mtime +$MAX_LOG_DAYS -delete 2>/dev/null || true
    
    echo -e "${GREEN}✅ Rotation terminée${NC}"
    echo
}

# Fonction pour nettoyer les anciens logs
clean_logs() {
    echo -e "${BLUE}🧹 Nettoyage des anciens logs...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    
    check_logs_dir
    
    # Nettoyer les logs trop anciens
    echo -e "${YELLOW}🗑️  Suppression des logs de plus de $MAX_LOG_DAYS jours...${NC}"
    deleted_count=$(find "$LOGS_DIR" -name "*.log" -mtime +$MAX_LOG_DAYS -delete -print | wc -l)
    echo -e "${GREEN}✅ $deleted_count fichiers supprimés${NC}"
    
    # Nettoyer les backups trop anciens
    if [ -d "$BACKUP_DIR" ]; then
        echo -e "${YELLOW}🗑️  Suppression des backups de plus de $MAX_LOG_DAYS jours...${NC}"
        deleted_backups=$(find "$BACKUP_DIR" -name "*.log" -mtime +$MAX_LOG_DAYS -delete -print | wc -l)
        echo -e "${GREEN}✅ $deleted_backups backups supprimés${NC}"
    fi
    
    # Nettoyer les fichiers vides
    echo -e "${YELLOW}🗑️  Suppression des fichiers vides...${NC}"
    empty_count=$(find "$LOGS_DIR" -name "*.log" -empty -delete -print | wc -l)
    echo -e "${GREEN}✅ $empty_count fichiers vides supprimés${NC}"
    
    echo -e "${GREEN}✅ Nettoyage terminé${NC}"
    echo
}

# Fonction pour sauvegarder les logs
backup_logs() {
    echo -e "${BLUE}💾 Sauvegarde des logs...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    
    check_logs_dir
    
    # Date pour le backup
    backup_date=$(date +"%Y%m%d_%H%M%S")
    backup_file="$BACKUP_DIR/logs_backup_${backup_date}.tar.gz"
    
    echo -e "${YELLOW}📦 Création de la sauvegarde...${NC}"
    
    # Créer l'archive
    if tar -czf "$backup_file" -C "$LOGS_DIR" . 2>/dev/null; then
        size=$(du -h "$backup_file" | cut -f1)
        echo -e "${GREEN}✅ Sauvegarde créée: $backup_file (${size})${NC}"
    else
        echo -e "${RED}❌ Erreur lors de la création de la sauvegarde${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Sauvegarde terminée${NC}"
    echo
}

# Fonction pour surveiller les logs en temps réel
monitor_logs() {
    local log_type=${1:-"all"}
    
    echo -e "${BLUE}👁️  Surveillance des logs en temps réel...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    
    check_logs_dir
    
    case $log_type in
        "server"|"backend")
            if [ -f "$LOGS_DIR/server.log" ]; then
                echo -e "${GREEN}📡 Surveillance du serveur backend...${NC}"
                echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter${NC}"
                echo
                tail -f "$LOGS_DIR/server.log"
            else
                echo -e "${RED}❌ Fichier server.log non trouvé${NC}"
            fi
            ;;
        "client"|"frontend")
            if [ -f "$LOGS_DIR/client.log" ]; then
                echo -e "${GREEN}🖥️  Surveillance du client frontend...${NC}"
                echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter${NC}"
                echo
                tail -f "$LOGS_DIR/client.log"
            else
                echo -e "${RED}❌ Fichier client.log non trouvé${NC}"
            fi
            ;;
        "nginx")
            if [ -f "$LOGS_DIR/nginx.log" ]; then
                echo -e "${GREEN}🌐 Surveillance de Nginx...${NC}"
                echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter${NC}"
                echo
                tail -f "$LOGS_DIR/nginx.log"
            else
                echo -e "${RED}❌ Fichier nginx.log non trouvé${NC}"
            fi
            ;;
        "all")
            echo -e "${GREEN}📊 Surveillance de tous les logs...${NC}"
            echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter${NC}"
            echo
            tail -f "$LOGS_DIR"/*.log
            ;;
        *)
            echo -e "${RED}❌ Type de log invalide: $log_type${NC}"
            echo -e "${YELLOW}Types disponibles: server, client, nginx, all${NC}"
            ;;
    esac
}

# Fonction pour rechercher dans les logs
search_logs() {
    local search_term=${1:-""}
    
    if [ -z "$search_term" ]; then
        echo -e "${RED}❌ Terme de recherche requis${NC}"
        echo -e "${YELLOW}Usage: $0 search <terme>${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🔍 Recherche dans les logs...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Recherche:${NC} $search_term"
    echo
    
    check_logs_dir
    
    # Rechercher dans tous les fichiers de logs
    for log_file in "$LOGS_DIR"/*.log; do
        if [ -f "$log_file" ]; then
            filename=$(basename "$log_file")
            matches=$(grep -i "$search_term" "$log_file" 2>/dev/null | wc -l)
            
            if [ $matches -gt 0 ]; then
                echo -e "${YELLOW}📄 $filename (${matches} correspondances):${NC}"
                grep -i "$search_term" "$log_file" | head -10
                if [ $matches -gt 10 ]; then
                    echo -e "${CYAN}... et $((matches - 10)) autres correspondances${NC}"
                fi
                echo
            fi
        fi
    done
    
    echo -e "${GREEN}✅ Recherche terminée${NC}"
    echo
}

# Fonction pour la configuration initiale
setup_logs() {
    echo -e "${BLUE}⚙️  Configuration initiale des logs...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    
    # Créer les dossiers
    mkdir -p "$LOGS_DIR"
    mkdir -p "$BACKUP_DIR"
    
    # Créer les fichiers de logs s'ils n'existent pas
    touch "$LOGS_DIR/server.log"
    touch "$LOGS_DIR/client.log"
    touch "$LOGS_DIR/nginx.log"
    touch "$LOGS_DIR/postgres.log"
    touch "$LOGS_DIR/redis.log"
    touch "$LOGS_DIR/prometheus.log"
    touch "$LOGS_DIR/grafana.log"
    
    # Définir les permissions
    chmod 644 "$LOGS_DIR"/*.log
    
    echo -e "${GREEN}✅ Configuration terminée${NC}"
    echo -e "${CYAN}📁 Dossier logs: $LOGS_DIR${NC}"
    echo -e "${CYAN}📁 Dossier backups: $BACKUP_DIR${NC}"
    echo
}

# Fonction principale
main() {
    case ${1:-"help"} in
        "status")
            show_status
            ;;
        "rotate")
            rotate_logs
            ;;
        "clean")
            clean_logs
            ;;
        "backup")
            backup_logs
            ;;
        "monitor")
            monitor_logs "$2"
            ;;
        "search")
            search_logs "$2"
            ;;
        "setup")
            setup_logs
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Exécution du script
main "$@" 