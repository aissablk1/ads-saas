#!/bin/bash

# =================================
# Script de Configuration Logrotate - ADS SaaS
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
PROJECT_DIR=$(pwd)
LOGS_DIR="$PROJECT_DIR/logs"
LOGROTATE_CONF="/etc/logrotate.d/ads-saas"

# Fonction pour afficher l'aide
show_help() {
    echo -e "${CYAN}📋 Configuration Logrotate - ADS SaaS${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    echo -e "${GREEN}Usage:${NC} $0 [COMMANDE]"
    echo
    echo -e "${GREEN}Commandes disponibles:${NC}"
    echo -e "  ${YELLOW}install${NC}   - Installer la configuration logrotate"
    echo -e "  ${YELLOW}remove${NC}    - Supprimer la configuration logrotate"
    echo -e "  ${YELLOW}test${NC}      - Tester la configuration logrotate"
    echo -e "  ${YELLOW}status${NC}    - Afficher le statut de logrotate"
    echo -e "  ${YELLOW}help${NC}      - Afficher cette aide"
    echo
    echo -e "${GREEN}Exemples:${NC}"
    echo -e "  $0 install"
    echo -e "  $0 test"
    echo -e "  $0 status"
    echo
}

# Fonction pour vérifier les privilèges root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}❌ Ce script nécessite des privilèges root${NC}"
        echo -e "${YELLOW}💡 Utilisez: sudo $0 $*${NC}"
        exit 1
    fi
}

# Fonction pour créer la configuration logrotate
create_logrotate_config() {
    echo -e "${BLUE}📝 Création de la configuration logrotate...${NC}"
    
    cat > "$LOGROTATE_CONF" << EOF
# Configuration Logrotate pour ADS SaaS
# Généré automatiquement le $(date)

$LOGS_DIR/*.log {
    # Rotation quotidienne
    daily
    
    # Continuer même si le fichier n'existe pas
    missingok
    
    # Rotation de 7 fichiers
    rotate 7
    
    # Compresser les fichiers rotés
    compress
    
    # Compresser avec délai (pas le fichier actuel)
    delaycompress
    
    # Ne pas créer de fichier vide si le log est vide
    notifempty
    
    # Permissions pour les nouveaux fichiers
    create 644 root root
    
    # Script post-rotation
    postrotate
        # Redémarrer les services si nécessaire
        if [ -f /var/run/docker.pid ]; then
            docker-compose -f $PROJECT_DIR/docker-compose.yml restart nginx 2>/dev/null || true
        fi
    endscript
    
    # Script de partage (pour les logs partagés)
    sharedscripts
}

# Configuration spécifique pour les logs volumineux
$LOGS_DIR/nginx.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        if [ -f /var/run/docker.pid ]; then
            docker-compose -f $PROJECT_DIR/docker-compose.yml restart nginx 2>/dev/null || true
        fi
    endscript
}

# Configuration pour les logs de déploiement
$LOGS_DIR/deploy.log {
    weekly
    missingok
    rotate 4
    compress
    delaycompress
    notifempty
    create 644 root root
}

# Configuration pour les logs SSL
$LOGS_DIR/ssl-renewal.log {
    monthly
    missingok
    rotate 12
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

    echo -e "${GREEN}✅ Configuration logrotate créée: $LOGROTATE_CONF${NC}"
}

# Fonction pour installer logrotate
install_logrotate() {
    echo -e "${BLUE}🚀 Installation de la configuration logrotate...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    
    # Vérifier les privilèges root
    check_root
    
    # Vérifier si logrotate est installé
    if ! command -v logrotate &> /dev/null; then
        echo -e "${YELLOW}📦 Installation de logrotate...${NC}"
        
        # Détecter le système d'exploitation
        if command -v apt-get &> /dev/null; then
            # Debian/Ubuntu
            apt-get update
            apt-get install -y logrotate
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            yum install -y logrotate
        elif command -v brew &> /dev/null; then
            # macOS
            brew install logrotate
        else
            echo -e "${RED}❌ Impossible de détecter le gestionnaire de paquets${NC}"
            echo -e "${YELLOW}💡 Installez logrotate manuellement${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ Logrotate est installé${NC}"
    
    # Créer le dossier logs s'il n'existe pas
    if [ ! -d "$LOGS_DIR" ]; then
        echo -e "${YELLOW}📁 Création du dossier logs...${NC}"
        mkdir -p "$LOGS_DIR"
        chmod 755 "$LOGS_DIR"
    fi
    
    # Créer la configuration
    create_logrotate_config
    
    # Tester la configuration
    echo -e "${YELLOW}🧪 Test de la configuration...${NC}"
    if logrotate -d "$LOGROTATE_CONF" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Configuration logrotate valide${NC}"
    else
        echo -e "${RED}❌ Configuration logrotate invalide${NC}"
        echo -e "${YELLOW}💡 Vérifiez le fichier: $LOGROTATE_CONF${NC}"
        return 1
    fi
    
    # Créer un fichier de test
    echo -e "${YELLOW}📄 Création d'un fichier de test...${NC}"
    touch "$LOGS_DIR/test.log"
    echo "Test log entry $(date)" > "$LOGS_DIR/test.log"
    
    # Forcer une rotation de test
    echo -e "${YELLOW}🔄 Test de rotation...${NC}"
    logrotate -f "$LOGROTATE_CONF"
    
    if [ -f "$LOGS_DIR/test.log.1.gz" ]; then
        echo -e "${GREEN}✅ Rotation de test réussie${NC}"
        rm -f "$LOGS_DIR/test.log.1.gz"
    else
        echo -e "${YELLOW}⚠️  Rotation de test non effectuée (normal pour un premier test)${NC}"
    fi
    
    # Configurer le cron pour la rotation automatique
    echo -e "${YELLOW}⏰ Configuration du cron pour la rotation automatique...${NC}"
    
    # Vérifier si la tâche cron existe déjà
    if ! crontab -l 2>/dev/null | grep -q "logrotate.*ads-saas"; then
        # Ajouter la tâche cron
        (crontab -l 2>/dev/null; echo "0 2 * * * /usr/sbin/logrotate $LOGROTATE_CONF") | crontab -
        echo -e "${GREEN}✅ Tâche cron ajoutée (rotation quotidienne à 2h00)${NC}"
    else
        echo -e "${BLUE}ℹ️  Tâche cron déjà configurée${NC}"
    fi
    
    echo -e "${GREEN}✅ Installation logrotate terminée${NC}"
    echo
    echo -e "${CYAN}📋 Configuration:${NC}"
    echo -e "   Fichier: ${YELLOW}$LOGROTATE_CONF${NC}"
    echo -e "   Dossier logs: ${YELLOW}$LOGS_DIR${NC}"
    echo -e "   Rotation: ${YELLOW}Quotidienne à 2h00${NC}"
    echo -e "   Rétention: ${YELLOW}7 jours${NC}"
    echo
}

# Fonction pour supprimer la configuration logrotate
remove_logrotate() {
    echo -e "${BLUE}🗑️  Suppression de la configuration logrotate...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    
    # Vérifier les privilèges root
    check_root
    
    # Supprimer le fichier de configuration
    if [ -f "$LOGROTATE_CONF" ]; then
        rm -f "$LOGROTATE_CONF"
        echo -e "${GREEN}✅ Configuration logrotate supprimée${NC}"
    else
        echo -e "${BLUE}ℹ️  Configuration logrotate non trouvée${NC}"
    fi
    
    # Supprimer la tâche cron
    if crontab -l 2>/dev/null | grep -q "logrotate.*ads-saas"; then
        crontab -l 2>/dev/null | grep -v "logrotate.*ads-saas" | crontab -
        echo -e "${GREEN}✅ Tâche cron supprimée${NC}"
    else
        echo -e "${BLUE}ℹ️  Tâche cron non trouvée${NC}"
    fi
    
    echo -e "${GREEN}✅ Suppression terminée${NC}"
    echo
}

# Fonction pour tester la configuration logrotate
test_logrotate() {
    echo -e "${BLUE}🧪 Test de la configuration logrotate...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    
    # Vérifier si le fichier de configuration existe
    if [ ! -f "$LOGROTATE_CONF" ]; then
        echo -e "${RED}❌ Configuration logrotate non trouvée${NC}"
        echo -e "${YELLOW}💡 Installez d'abord avec: $0 install${NC}"
        return 1
    fi
    
    # Test de syntaxe
    echo -e "${YELLOW}📝 Test de syntaxe...${NC}"
    if logrotate -d "$LOGROTATE_CONF" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Syntaxe valide${NC}"
    else
        echo -e "${RED}❌ Erreur de syntaxe${NC}"
        logrotate -d "$LOGROTATE_CONF"
        return 1
    fi
    
    # Test de rotation
    echo -e "${YELLOW}🔄 Test de rotation...${NC}"
    
    # Créer un fichier de test
    test_file="$LOGS_DIR/test-rotation.log"
    echo "Test entry $(date)" > "$test_file"
    echo "Test entry 2 $(date)" >> "$test_file"
    
    # Effectuer la rotation
    logrotate -f "$LOGROTATE_CONF"
    
    # Vérifier le résultat
    if [ -f "$test_file.1.gz" ]; then
        echo -e "${GREEN}✅ Rotation réussie${NC}"
        echo -e "${CYAN}   Fichier original: $test_file${NC}"
        echo -e "${CYAN}   Fichier roté: $test_file.1.gz${NC}"
        
        # Nettoyer
        rm -f "$test_file.1.gz"
    else
        echo -e "${YELLOW}⚠️  Rotation non effectuée (peut être normal selon la configuration)${NC}"
    fi
    
    # Nettoyer le fichier de test
    rm -f "$test_file"
    
    echo -e "${GREEN}✅ Test terminé${NC}"
    echo
}

# Fonction pour afficher le statut de logrotate
show_status() {
    echo -e "${BLUE}📊 Statut de logrotate...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    
    # Vérifier si logrotate est installé
    if command -v logrotate &> /dev/null; then
        version=$(logrotate --version | head -1)
        echo -e "${GREEN}✅ Logrotate installé:${NC} $version"
    else
        echo -e "${RED}❌ Logrotate non installé${NC}"
        return 1
    fi
    
    # Vérifier le fichier de configuration
    if [ -f "$LOGROTATE_CONF" ]; then
        echo -e "${GREEN}✅ Configuration trouvée:${NC} $LOGROTATE_CONF"
        
        # Afficher la configuration
        echo -e "${CYAN}📋 Configuration:${NC}"
        cat "$LOGROTATE_CONF" | grep -E "^(daily|weekly|monthly|rotate|compress|missingok)" | head -10
    else
        echo -e "${RED}❌ Configuration non trouvée${NC}"
    fi
    
    # Vérifier la tâche cron
    if crontab -l 2>/dev/null | grep -q "logrotate.*ads-saas"; then
        echo -e "${GREEN}✅ Tâche cron configurée${NC}"
        crontab -l 2>/dev/null | grep "logrotate.*ads-saas"
    else
        echo -e "${RED}❌ Tâche cron non configurée${NC}"
    fi
    
    # Vérifier les fichiers de logs
    echo -e "${CYAN}📄 Fichiers de logs:${NC}"
    if [ -d "$LOGS_DIR" ]; then
        for log_file in "$LOGS_DIR"/*.log; do
            if [ -f "$log_file" ]; then
                filename=$(basename "$log_file")
                size=$(du -h "$log_file" 2>/dev/null | cut -f1 || echo '0B')
                echo -e "   ${YELLOW}$filename${NC} - ${CYAN}$size${NC}"
            fi
        done
    else
        echo -e "   ${RED}Dossier logs non trouvé${NC}"
    fi
    
    # Vérifier les fichiers rotés
    echo -e "${CYAN}🔄 Fichiers rotés:${NC}"
    rotated_count=$(find "$LOGS_DIR" -name "*.log.*" 2>/dev/null | wc -l)
    if [ $rotated_count -gt 0 ]; then
        find "$LOGS_DIR" -name "*.log.*" -exec basename {} \; | head -5
        if [ $rotated_count -gt 5 ]; then
            echo -e "   ${CYAN}... et $((rotated_count - 5)) autres fichiers${NC}"
        fi
    else
        echo -e "   ${BLUE}Aucun fichier roté trouvé${NC}"
    fi
    
    echo
}

# Fonction principale
main() {
    case ${1:-"help"} in
        "install")
            install_logrotate
            ;;
        "remove")
            remove_logrotate
            ;;
        "test")
            test_logrotate
            ;;
        "status")
            show_status
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Exécution du script
main "$@" 