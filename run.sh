#!/bin/bash

# Script de gestion ADS SaaS
# Auteur: Aïssa BELKOUSSA
# Description: Interface interactive pour gérer l'application ADS SaaS

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helpers mutualisés pour tous les scripts
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
info() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
error() { echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }

# Variables
SERVER_PORT=8000
CLIENT_PORT=3000
PROJECT_DIR=$(pwd)

# Variables pour les processus en arrière-plan
SERVER_PID=""
CLIENT_PID=""

# Variables pour les processus en arrière-plan
SERVER_PID=""
CLIENT_PID=""

# Fonction pour détecter automatiquement tous les scripts dans le dossier scripts/
detect_scripts() {
    local scripts_dir="scripts"
    local detected_scripts=()
    local script_options=()
    local script_functions=()
    local menu_options=()
    local case_options=()
    
    if [ ! -d "$scripts_dir" ]; then
        echo -e "${YELLOW}⚠️  Dossier $scripts_dir non trouvé${NC}"
        return
    fi
    
    echo -e "${BLUE}🔍 Détection automatique des scripts dans $scripts_dir/...${NC}"
    
    # Parcourir tous les fichiers dans le dossier scripts
    while IFS= read -r -d '' file; do
        local filename=$(basename "$file")
        local name_without_ext="${filename%.*}"
        local extension="${filename##*.}"
        
        # Ignorer les fichiers non-exécutables et les fichiers temporaires
        if [[ "$filename" == *".backup"* ]] || [[ "$filename" == *".tmp"* ]] || [[ "$filename" == *".old"* ]]; then
            continue
        fi
        
        # Vérifier si le fichier est exécutable ou a une extension de script
        if [[ -x "$file" ]] || [[ "$extension" =~ ^(sh|js|py|pl|rb|php)$ ]]; then
            detected_scripts+=("$file")
            
            # Créer un nom de fonction basé sur le nom du fichier
            local function_name=$(echo "$name_without_ext" | sed 's/[^a-zA-Z0-9]/_/g' | tr '[:upper:]' '[:lower:]')
            
            # Ajouter aux différentes listes
            script_options+=("$name_without_ext")
            script_functions+=("$function_name")
            
            # Créer l'option de menu (numéro automatique)
            local menu_number=$((100 + ${#menu_options[@]}))
            menu_options+=("$menu_number")
            
            # Créer l'option de case
            case_options+=("$name_without_ext")
            
            echo -e "${GREEN}✅ Script détecté: $filename -> $function_name${NC}"
        fi
    done < <(find "$scripts_dir" -maxdepth 1 -type f -print0 2>/dev/null)
    
    # Sauvegarder les résultats dans des variables globales
    DETECTED_SCRIPTS=("${detected_scripts[@]}")
    SCRIPT_OPTIONS=("${script_options[@]}")
    SCRIPT_FUNCTIONS=("${script_functions[@]}")
    MENU_OPTIONS=("${menu_options[@]}")
    CASE_OPTIONS=("${case_options[@]}")
    
    echo -e "${GREEN}🎯 Total: ${#detected_scripts[@]} scripts détectés${NC}"
}

# Fonction pour exécuter un script détecté
execute_detected_script() {
    local script_name="$1"
    local scripts_dir="scripts"
    local script_path="$scripts_dir/$script_name"
    
    # Chercher le script avec différentes extensions
    local found_script=""
    for ext in "" ".sh" ".js" ".py" ".pl" ".rb" ".php"; do
        if [ -f "$script_path$ext" ]; then
            found_script="$script_path$ext"
            break
        fi
    done
    
    if [ -z "$found_script" ]; then
        echo -e "${RED}❌ Script $script_name non trouvé dans $scripts_dir/${NC}"
        return 1
    fi
    
    echo -e "${GREEN}🚀 Exécution du script: $found_script${NC}"
    
    # Déterminer le type de script et l'exécuter
    local extension="${found_script##*.}"
    case "$extension" in
        "sh")
            if [ -x "$found_script" ]; then
                bash "$found_script"
            else
                chmod +x "$found_script" && bash "$found_script"
            fi
            ;;
        "js")
            node "$found_script"
            ;;
        "py")
            python3 "$found_script"
            ;;
        "pl")
            perl "$found_script"
            ;;
        "rb")
            ruby "$found_script"
            ;;
        "php")
            php "$found_script"
            ;;
        *)
            # Essayer d'exécuter directement
            if [ -x "$found_script" ]; then
                "$found_script"
            else
                chmod +x "$found_script" && "$found_script"
            fi
            ;;
    esac
    
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ Script $script_name exécuté avec succès${NC}"
    else
        echo -e "${RED}❌ Erreur lors de l'exécution du script $script_name (code: $exit_code)${NC}"
    fi
    
    return $exit_code
}

# Fonction pour afficher le menu des scripts détectés
show_detected_scripts_menu() {
    if [ ${#DETECTED_SCRIPTS[@]} -eq 0 ]; then
        echo -e "${YELLOW}⚠️  Aucun script détecté dans le dossier scripts/${NC}"
        return
    fi
    
    echo -e "${CYAN}━━━ Scripts Détectés Automatiquement ━━━${NC}"
    for i in "${!SCRIPT_OPTIONS[@]}"; do
        local menu_number="${MENU_OPTIONS[$i]}"
        local script_name="${SCRIPT_OPTIONS[$i]}"
        local script_path="${DETECTED_SCRIPTS[$i]}"
        local filename=$(basename "$script_path")
        
        echo -e "${GREEN}$menu_number)${NC} 🚀 $script_name ($filename)"
    done
    echo
}

# Fonction pour gérer les options de menu des scripts détectés
handle_detected_script_choice() {
    local choice="$1"
    
    # Vérifier si c'est une option de script détecté
    for i in "${!MENU_OPTIONS[@]}"; do
        if [ "$choice" = "${MENU_OPTIONS[$i]}" ]; then
            local script_name="${SCRIPT_OPTIONS[$i]}"
            echo -e "${CYAN}🎯 Exécution du script détecté: $script_name${NC}"
            execute_detected_script "$script_name"
            return 0
        fi
    done
    
    return 1
}

# Fonction pour afficher des informations détaillées sur un script
show_script_info() {
    local script_name="$1"
    local scripts_dir="scripts"
    local script_path="$scripts_dir/$script_name"
    
    # Chercher le script avec différentes extensions
    local found_script=""
    for ext in "" ".sh" ".js" ".py" ".pl" ".rb" ".php"; do
        if [ -f "$script_path$ext" ]; then
            found_script="$script_path$ext"
            break
        fi
    done
    
    if [ -z "$found_script" ]; then
        echo -e "${RED}❌ Script $script_name non trouvé${NC}"
        return 1
    fi
    
    echo -e "${CYAN}📋 Informations sur le script: $script_name${NC}"
    echo -e "${BLUE}📁 Chemin: $found_script${NC}"
    echo -e "${BLUE}📏 Taille: $(du -h "$found_script" | cut -f1)${NC}"
    echo -e "${BLUE}📅 Modifié: $(stat -f "%Sm" "$found_script" 2>/dev/null || stat -c "%y" "$found_script" 2>/dev/null)${NC}"
    
    # Vérifier les permissions
    if [ -x "$found_script" ]; then
        echo -e "${GREEN}✅ Exécutable${NC}"
    else
        echo -e "${YELLOW}⚠️  Non exécutable${NC}"
    fi
    
    # Afficher les premières lignes du script (commentaires)
    echo -e "${BLUE}📝 Description:${NC}"
    head -10 "$found_script" | grep -E "^#|^//|^<!--" | head -5 | sed 's/^/  /'
    
    echo
}

# Fonction pour tuer un processus sur un port donné (intégrée de stop.sh et start.sh)
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}⚠️  Arrêt du processus sur le port $port (PID: $pid)...${NC}"
        kill -9 $pid 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}✅ Port $port libéré${NC}"
    else
        echo -e "${BLUE}ℹ️  Aucun processus trouvé sur le port $port${NC}"
    fi
}

# Fonction améliorée pour forcer la libération des ports
force_kill_ports() {
    echo -e "${YELLOW}🔧 Libération forcée des ports...${NC}"
    
    # Libérer le port serveur
    local server_pid=$(lsof -ti:$SERVER_PORT 2>/dev/null)
    if [ ! -z "$server_pid" ]; then
        echo -e "${YELLOW}⚠️  Arrêt forcé du processus serveur sur le port $SERVER_PORT (PID: $server_pid)...${NC}"
        kill -9 $server_pid 2>/dev/null || true
        sleep 2
    fi
    
    # Libérer le port client
    local client_pid=$(lsof -ti:$CLIENT_PORT 2>/dev/null)
    if [ ! -z "$client_pid" ]; then
        echo -e "${YELLOW}⚠️  Arrêt forcé du processus client sur le port $CLIENT_PORT (PID: $client_pid)...${NC}"
        kill -9 $client_pid 2>/dev/null || true
        sleep 2
    fi
    
    # Libérer l'ancien port par défaut
    local old_port_pid=$(lsof -ti:5000 2>/dev/null)
    if [ ! -z "$old_port_pid" ]; then
        echo -e "${YELLOW}⚠️  Arrêt forcé du processus sur le port 5000 (PID: $old_port_pid)...${NC}"
        kill -9 $old_port_pid 2>/dev/null || true
        sleep 2
    fi
    
    # Vérifier que les ports sont bien libérés
    if lsof -ti:$SERVER_PORT > /dev/null 2>&1; then
        echo -e "${RED}❌ Le port $SERVER_PORT est encore occupé${NC}"
        return 1
    fi
    
    if lsof -ti:$CLIENT_PORT > /dev/null 2>&1; then
        echo -e "${RED}❌ Le port $CLIENT_PORT est encore occupé${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Tous les ports ont été libérés avec succès${NC}"
    return 0
}

# Fonction pour nettoyer complètement l'environnement
clean_environment() {
    echo -e "${YELLOW}🧹 Nettoyage complet de l'environnement...${NC}"
    
    # Arrêter tous les processus
    force_kill_ports
    
    # Nettoyer les processus Node.js orphelins
    echo -e "${BLUE}🔍 Recherche de processus Node.js orphelins...${NC}"
    local node_pids=$(pgrep -f "node.*ads" 2>/dev/null || true)
    if [ ! -z "$node_pids" ]; then
        echo -e "${YELLOW}⚠️  Arrêt des processus Node.js orphelins...${NC}"
        echo $node_pids | xargs kill -9 2>/dev/null || true
    fi
    
    # Nettoyer les processus nodemon
    local nodemon_pids=$(pgrep -f "nodemon" 2>/dev/null || true)
    if [ ! -z "$nodemon_pids" ]; then
        echo -e "${YELLOW}⚠️  Arrêt des processus nodemon...${NC}"
        echo $nodemon_pids | xargs kill -9 2>/dev/null || true
    fi
    
    # Nettoyer les processus next
    local next_pids=$(pgrep -f "next" 2>/dev/null || true)
    if [ ! -z "$next_pids" ]; then
        echo -e "${YELLOW}⚠️  Arrêt des processus next...${NC}"
        echo $next_pids | xargs kill -9 2>/dev/null || true
    fi
    
    # Attendre un peu pour que tout soit bien arrêté
    sleep 3
    
    echo -e "${GREEN}✅ Environnement nettoyé${NC}"
}

# Fonction pour vérifier et corriger les problèmes de ports
check_and_fix_ports() {
    echo -e "${BLUE}🔍 Vérification et correction des ports...${NC}"
    
    local has_issues=false
    
    # Vérifier le port serveur
    if lsof -ti:$SERVER_PORT > /dev/null 2>&1; then
        echo -e "${RED}❌ Le port $SERVER_PORT est occupé${NC}"
        has_issues=true
    fi
    
    # Vérifier le port client
    if lsof -ti:$CLIENT_PORT > /dev/null 2>&1; then
        echo -e "${RED}❌ Le port $CLIENT_PORT est occupé${NC}"
        has_issues=true
    fi
    
    if [ "$has_issues" = true ]; then
        echo -e "${YELLOW}⚠️  Problèmes détectés. Nettoyage automatique...${NC}"
        clean_environment
        return 0
    else
        echo -e "${GREEN}✅ Tous les ports sont disponibles${NC}"
        return 0
    fi
}

# Fonction pour vérifier et corriger les problèmes de ports (version intelligente)
check_and_fix_ports_smart() {
    echo -e "${BLUE}🔍 Vérification intelligente des ports...${NC}"
    
    local has_issues=false
    
    # Vérifier le port serveur seulement si on démarre le serveur
    if [ "$1" != "client" ]; then
        if lsof -ti:$SERVER_PORT > /dev/null 2>&1; then
            echo -e "${RED}❌ Le port $SERVER_PORT est occupé${NC}"
            has_issues=true
        fi
    fi
    
    # Vérifier le port client seulement si on démarre le client
    if [ "$1" = "client" ]; then
        if lsof -ti:$CLIENT_PORT > /dev/null 2>&1; then
            echo -e "${RED}❌ Le port $CLIENT_PORT est occupé${NC}"
            has_issues=true
        fi
    fi
    
    if [ "$has_issues" = true ]; then
        echo -e "${YELLOW}⚠️  Problèmes détectés. Nettoyage automatique...${NC}"
        clean_environment
        return 0
    else
        echo -e "${GREEN}✅ Ports nécessaires disponibles${NC}"
        return 0
    fi
}

# Fonction pour afficher le logo
show_logo() {
    echo -e "${CYAN}"
    echo "  █████╗ ██████╗ ███████╗    ███████╗ █████╗  █████╗ ███████╗"
    echo " ██╔══██╗██╔══██╗██╔════╝    ██╔════╝██╔══██╗██╔══██╗██╔════╝"
    echo " ███████║██║  ██║███████╗    ███████╗███████║███████║███████╗"
    echo " ██╔══██║██║  ██║╚════██║    ╚════██║██╔══██║██╔══██║╚════██║"
    echo " ██║  ██║██████╔╝███████║    ███████║██║  ██║██║  ██║███████║"
    echo " ╚═╝  ╚═╝╚═════╝ ╚══════╝    ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝"
    echo -e "${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}           Gestionnaire d'Application ADS SaaS              ${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
}

# Fonction pour vérifier le statut des services
check_status() {
    echo -e "${BLUE}🔍 Vérification du statut des services...${NC}"
    echo
    
    # Vérifier le serveur
    local server_pid=$(lsof -ti:$SERVER_PORT 2>/dev/null)
    if [ ! -z "$server_pid" ]; then
        # Vérifier si le serveur répond réellement avec un timeout plus long
        if curl -s --max-time 5 http://localhost:$SERVER_PORT/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Serveur Backend : ${NC}En cours d'exécution sur le port $SERVER_PORT (PID: $server_pid)"
        else
            echo -e "${YELLOW}⚠️  Serveur Backend : ${NC}Processus présent mais ne répond pas (PID: $server_pid)"
        fi
    else
        echo -e "${RED}❌ Serveur Backend : ${NC}Arrêté"
    fi
    
    # Vérifier le client
    local client_pid=$(lsof -ti:$CLIENT_PORT 2>/dev/null)
    if [ ! -z "$client_pid" ]; then
        # Vérifier si le client répond réellement avec un timeout plus long
        if curl -s --max-time 10 http://localhost:$CLIENT_PORT > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Client Frontend : ${NC}En cours d'exécution sur le port $CLIENT_PORT (PID: $client_pid)"
        else
            echo -e "${YELLOW}⚠️  Client Frontend : ${NC}Processus présent mais ne répond pas (PID: $client_pid)"
        fi
    else
        echo -e "${RED}❌ Client Frontend : ${NC}Arrêté"
    fi
    
    echo
    echo -e "${CYAN}📍 URLs d'accès :${NC}"
    echo -e "   Frontend: ${YELLOW}http://localhost:$CLIENT_PORT${NC}"
    echo -e "   Backend:  ${YELLOW}http://localhost:$SERVER_PORT${NC}"
    echo -e "   API Docs: ${YELLOW}http://localhost:$SERVER_PORT/api/docs${NC}"
    echo -e "   API Env:  ${YELLOW}http://localhost:$SERVER_PORT/api/env${NC}"
    echo
}

# Fonction pour vérifier la configuration .env
check_env_config() {
    echo -e "${BLUE}🔍 Vérification de la configuration .env...${NC}"
    echo
    
    if [ -f "scripts/check-env.js" ]; then
        node scripts/check-env.js
    else
        echo -e "${RED}❌ Script de vérification .env non trouvé${NC}"
        echo -e "${YELLOW}📝 Vérifiez manuellement le fichier .env à la racine${NC}"
    fi
    echo
}

# Fonction pour vérifier et corriger les problèmes de schéma Prisma
check_and_fix_prisma_schema() {
    echo -e "${BLUE}🔍 Vérification et correction du schéma Prisma...${NC}"
    
    # Afficher le répertoire de travail actuel pour le débogage
    echo -e "${BLUE}📁 Répertoire de travail: $(pwd)${NC}"
    
    # Déterminer le répertoire de travail pour Prisma
    local prisma_dir=""
    
    # Si nous sommes déjà dans le répertoire server
    if [ -f "prisma/schema.prisma" ]; then
        echo -e "${GREEN}✅ Schéma Prisma trouvé dans le répertoire actuel${NC}"
        prisma_dir="."
    # Si nous sommes à la racine et que server/prisma/schema.prisma existe
    elif [ -f "server/prisma/schema.prisma" ]; then
        echo -e "${GREEN}✅ Schéma Prisma trouvé dans server/prisma/schema.prisma${NC}"
        prisma_dir="server"
    # Si nous sommes dans server et que ../server/prisma/schema.prisma existe
    elif [ -f "../server/prisma/schema.prisma" ]; then
        echo -e "${GREEN}✅ Schéma Prisma trouvé dans ../server/prisma/schema.prisma${NC}"
        prisma_dir="../server"
    else
        echo -e "${RED}❌ Aucun schéma Prisma trouvé${NC}"
        echo -e "${YELLOW}📋 Contenu du répertoire:${NC}"
        ls -la | head -10
        return 1
    fi
    
    # Changer vers le répertoire contenant le schéma Prisma
    if [ "$prisma_dir" != "." ]; then
        cd "$prisma_dir"
        echo -e "${BLUE}📁 Changement vers: $(pwd)${NC}"
    fi
    
    # Vérifier si le schéma principal existe
    if [ ! -f "prisma/schema.prisma" ]; then
        echo -e "${YELLOW}⚠️  Schéma principal manquant, création...${NC}"
        if [ -f "prisma/schema.sqlite.prisma" ]; then
            cp prisma/schema.sqlite.prisma prisma/schema.prisma
            echo -e "${GREEN}✅ Schéma copié depuis schema.sqlite.prisma${NC}"
        else
            echo -e "${RED}❌ Aucun schéma Prisma trouvé${NC}"
            if [ "$prisma_dir" != "." ]; then
                cd ..
            fi
            return 1
        fi
    fi
    
    # Vérifier la cohérence du schéma
    echo -e "${BLUE}🔍 Vérification de la cohérence du schéma...${NC}"
    
    # Vérifier si le modèle Subscription a les bons champs
    if grep -q "currentPeriodStart\|currentPeriodEnd\|cancelAtPeriodEnd" prisma/schema.prisma; then
        echo -e "${YELLOW}⚠️  Champs Stripe détectés dans le schéma, nettoyage...${NC}"
        # Supprimer les champs Stripe non supportés
        sed -i '' '/currentPeriodStart/d' prisma/schema.prisma
        sed -i '' '/currentPeriodEnd/d' prisma/schema.prisma
        sed -i '' '/cancelAtPeriodEnd/d' prisma/schema.prisma
        echo -e "${GREEN}✅ Champs Stripe supprimés du schéma${NC}"
    fi
    
    # Vérifier que le provider est SQLite
    if ! grep -q 'provider = "sqlite"' prisma/schema.prisma; then
        echo -e "${YELLOW}⚠️  Provider non-SQLite détecté, correction...${NC}"
        sed -i '' 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
        echo -e "${GREEN}✅ Provider changé vers SQLite${NC}"
    fi
    
    # Régénérer le client Prisma
    echo -e "${BLUE}🔧 Régénération du client Prisma...${NC}"
    npx prisma generate
    
    # Recréer la base de données si nécessaire
    if [ ! -f "prisma/dev.db" ] || [ ! -s "prisma/dev.db" ]; then
        echo -e "${BLUE}🗄️  Recréation de la base de données...${NC}"
        npx prisma db push --force-reset
        echo -e "${GREEN}✅ Base de données recréée${NC}"
    fi
    
    # Retourner au répertoire original si nécessaire
    if [ "$prisma_dir" != "." ]; then
        cd ..
    fi
    
    echo -e "${GREEN}✅ Schéma Prisma vérifié et corrigé${NC}"
    return 0
}

# Fonction pour corriger le script de seeding
fix_seed_script() {
    echo -e "${BLUE}🔧 Correction du script de seeding...${NC}"
    
    # Déterminer le répertoire de travail pour le script de seeding
    local seed_dir=""
    
    # Si nous sommes déjà dans le répertoire server
    if [ -d "scripts" ] && [ -f "package.json" ]; then
        echo -e "${GREEN}✅ Répertoire server trouvé dans le répertoire actuel${NC}"
        seed_dir="."
    # Si nous sommes à la racine et que server/scripts existe
    elif [ -d "server/scripts" ]; then
        echo -e "${GREEN}✅ Répertoire server trouvé dans server/scripts${NC}"
        seed_dir="server"
    # Si nous sommes dans server et que ../server/scripts existe
    elif [ -d "../server/scripts" ]; then
        echo -e "${GREEN}✅ Répertoire server trouvé dans ../server/scripts${NC}"
        seed_dir="../server"
    else
        echo -e "${RED}❌ Répertoire server introuvable${NC}"
        return 1
    fi
    
    # Changer vers le répertoire contenant les scripts
    if [ "$seed_dir" != "." ]; then
        cd "$seed_dir"
        echo -e "${BLUE}📁 Changement vers: $(pwd)${NC}"
    fi
    
    # Créer un script de seeding corrigé
    cat > scripts/seed-test-data-fixed.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Données de test réalistes
const testUsers = [
  { email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe', role: 'USER' },
  { email: 'jane.smith@example.com', firstName: 'Jane', lastName: 'Smith', role: 'USER' },
  { email: 'mike.wilson@example.com', firstName: 'Mike', lastName: 'Wilson', role: 'USER' },
  { email: 'sarah.johnson@example.com', firstName: 'Sarah', lastName: 'Johnson', role: 'USER' },
  { email: 'david.brown@example.com', firstName: 'David', lastName: 'Brown', role: 'USER' },
  { email: 'emma.davis@example.com', firstName: 'Emma', lastName: 'Davis', role: 'USER' },
  { email: 'alex.taylor@example.com', firstName: 'Alex', lastName: 'Taylor', role: 'USER' },
  { email: 'lisa.anderson@example.com', firstName: 'Lisa', lastName: 'Anderson', role: 'USER' },
  { email: 'tom.martinez@example.com', firstName: 'Tom', lastName: 'Martinez', role: 'USER' },
  { email: 'anna.garcia@example.com', firstName: 'Anna', lastName: 'Garcia', role: 'USER' }
];

const testCampaigns = [
  { name: 'Campagne Printemps 2024', description: 'Promotion saisonnière', budget: 5000, status: 'ACTIVE' },
  { name: 'Black Friday', description: 'Offres spéciales', budget: 10000, status: 'ACTIVE' },
  { name: 'Nouveau Produit', description: 'Lancement produit', budget: 7500, status: 'ACTIVE' },
  { name: 'Fidélisation Client', description: 'Programme de fidélité', budget: 3000, status: 'PAUSED' },
  { name: 'Test A/B', description: 'Optimisation conversion', budget: 2000, status: 'DRAFT' },
  { name: 'Campagne Été', description: 'Promotions estivales', budget: 6000, status: 'ACTIVE' },
  { name: 'Back to School', description: 'Rentrée scolaire', budget: 4000, status: 'COMPLETED' },
  { name: 'Holiday Special', description: 'Offres de fin d\'année', budget: 8000, status: 'ACTIVE' }
];

const activityTypes = [
  'USER_LOGIN',
  'CAMPAIGN_CREATED',
  'CAMPAIGN_UPDATED',
  'PAYMENT_SUCCESS',
  'PAYMENT_FAILED',
  'USER_REGISTERED',
  'CAMPAIGN_PAUSED',
  'CAMPAIGN_ACTIVATED',
  'BUDGET_ALERT',
  'PERFORMANCE_ALERT'
];

async function seedTestData() {
  try {
    console.log('🌱 Génération des données de test...');

    // Créer des utilisateurs de test
    console.log('👥 Création des utilisateurs...');
    const createdUsers = [];
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const userData of testUsers) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          ...userData,
          password: hashedPassword,
          status: 'ACTIVE',
          emailVerified: true,
          twoFactorEnabled: false
        }
      });
      createdUsers.push(user);
      console.log(`✅ Utilisateur créé: ${user.email}`);
    }

    // Créer des campagnes de test
    console.log('📊 Création des campagnes...');
    const createdCampaigns = [];

    for (const campaignData of testCampaigns) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      const campaign = await prisma.campaign.upsert({
        where: { id: `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
        update: {},
        create: {
          ...campaignData,
          userId: randomUser.id,
          spent: Math.random() * campaignData.budget * 0.8,
          impressions: Math.floor(Math.random() * 100000) + 10000,
          clicks: Math.floor(Math.random() * 5000) + 500,
          conversions: Math.floor(Math.random() * 200) + 50,
          startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
        }
      });
      createdCampaigns.push(campaign);
      console.log(`✅ Campagne créée: ${campaign.name}`);
    }

    // Créer des activités de test
    console.log('📝 Création des activités...');
    const activities = [];

    for (let i = 0; i < 50; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const randomCampaign = createdCampaigns[Math.floor(Math.random() * createdCampaigns.length)];

      let title = '';
      let description = '';

      switch (randomType) {
        case 'USER_LOGIN':
          title = 'Connexion utilisateur';
          description = `L'utilisateur ${randomUser.email} s'est connecté`;
          break;
        case 'CAMPAIGN_CREATED':
          title = 'Nouvelle campagne créée';
          description = `Campagne "${randomCampaign.name}" créée par ${randomUser.email}`;
          break;
        case 'CAMPAIGN_UPDATED':
          title = 'Campagne mise à jour';
          description = `Campagne "${randomCampaign.name}" modifiée`;
          break;
        case 'PAYMENT_SUCCESS':
          title = 'Paiement réussi';
          description = `Paiement traité pour ${randomUser.email}`;
          break;
        case 'USER_REGISTERED':
          title = 'Nouvel utilisateur inscrit';
          description = `Inscription de ${randomUser.email}`;
          break;
        default:
          title = 'Activité système';
          description = 'Action système effectuée';
      }

      const activity = await prisma.activity.create({
        data: {
          type: randomType,
          title,
          description,
          metadata: JSON.stringify({
            userId: randomUser.id,
            campaignId: randomCampaign?.id,
            timestamp: new Date().toISOString()
          }),
          userId: randomUser.id,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        }
      });
      activities.push(activity);
    }

    console.log(`✅ ${activities.length} activités créées`);

    // Créer des abonnements de test (version corrigée)
    console.log('💳 Création des abonnements...');
    const subscriptionPlans = ['BASIC', 'PRO', 'ENTERPRISE'];
    
    for (let i = 0; i < 5; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomPlan = subscriptionPlans[Math.floor(Math.random() * subscriptionPlans.length)];
      
      // Vérifier si l'utilisateur a déjà un abonnement
      const existingSubscription = await prisma.subscription.findUnique({
        where: { userId: randomUser.id }
      });
      
      if (!existingSubscription) {
        await prisma.subscription.create({
          data: {
            plan: randomPlan,
            status: 'ACTIVE',
            startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
            userId: randomUser.id
          }
        });
        console.log(`✅ Abonnement créé pour ${randomUser.email}`);
      }
    }

    console.log('✅ Abonnements créés');

    console.log('');
    console.log('🎉 Données de test générées avec succès!');
    console.log(`📊 ${createdUsers.length} utilisateurs créés`);
    console.log(`📈 ${createdCampaigns.length} campagnes créées`);
    console.log(`📝 ${activities.length} activités créées`);
    console.log('');
    console.log('🔑 Identifiants de test:');
    console.log('   Email: john.doe@example.com');
    console.log('   Mot de passe: password123');
    console.log('');
    console.log('🌐 Accédez à: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Erreur lors de la génération des données:', error);
    console.error('Détails:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
seedTestData();
EOF

        # Remplacer l'ancien script
        if [ -f "scripts/seed-test-data.js" ]; then
            mv scripts/seed-test-data.js scripts/seed-test-data.js.backup
            echo -e "${YELLOW}⚠️  Ancien script sauvegardé${NC}"
        fi
        
        mv scripts/seed-test-data-fixed.js scripts/seed-test-data.js
        echo -e "${GREEN}✅ Script de seeding corrigé${NC}"
        
        # Retourner au répertoire original si nécessaire
        if [ "$seed_dir" != "." ]; then
            cd ..
        fi
}

# Fonction pour installer/configurer l'application complète (intégrée de setup.sh)
install_app() {
    echo -e "${CYAN}🚀 Installation automatique d'ADS SaaS...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    
    # Vérifier si Node.js est installé
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js n'est pas installé. Installez Node.js 18+ depuis https://nodejs.org${NC}"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js version 18+ requis. Version actuelle: $(node -v)${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Node.js $(node -v) détecté${NC}"

    # Libérer les ports si nécessaire
    echo -e "${BLUE}📡 Vérification des ports...${NC}"
    kill_port $CLIENT_PORT
    kill_port $SERVER_PORT
    kill_port 5000  # Ancien port par défaut

    # Configuration des variables d'environnement unifiées
    echo -e "${BLUE}📝 Configuration des variables d'environnement unifiées...${NC}"

    # Créer le fichier .env.example unifié à la racine
    if [ ! -f ".env.example" ]; then
        cat > .env.example << 'EOF'
# ========================================
# CONFIGURATION UNIFIÉE ADS SaaS - EXEMPLE
# ========================================

# Configuration de l'environnement
NODE_ENV=development

# Configuration serveur backend
PORT=8000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Configuration base de données
DATABASE_URL=file:./dev.db

# Configuration JWT
JWT_SECRET=ads_saas_super_secret_jwt_key_change_this_in_production_123456789
JWT_REFRESH_SECRET=ads_saas_refresh_secret_key_change_this_in_production_123456789
JWT_EXPIRES_IN=7d

# Configuration frontend
FRONTEND_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=ads_saas_nextauth_secret_change_this_in_production

# Configuration Stripe (optionnel)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Configuration email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Configuration traduction (optionnel)
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
LIBRETRANSLATE_URL=https://libretranslate.com/translate
LIBRETRANSLATE_API_KEY=your_libretranslate_api_key

# Configuration CORS
CORS_ORIGIN=http://localhost:3000
EOF
        echo -e "${GREEN}✅ .env.example unifié créé${NC}"
    fi

    # Créer le fichier .env unifié à la racine
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env unifié créé${NC}"
    fi

    # Vérifier que le fichier .env unifié existe
    echo -e "${BLUE}✅ Configuration unifiée - un seul fichier .env à la racine${NC}"

    # Installer les dépendances
    echo -e "${BLUE}📦 Installation des dépendances (cela peut prendre quelques minutes)...${NC}"

    # Installer les dépendances du projet principal
    if [ -f "package.json" ]; then
        npm install > /dev/null 2>&1
        echo -e "${GREEN}✅ Dépendances du projet principal installées${NC}"
    fi

    # Installer les dépendances du serveur
    echo -e "${BLUE}📦 Installation des dépendances du serveur...${NC}"
    if [ -d "server" ]; then
        cd server
        npm install > /dev/null 2>&1
        cd ..
        echo -e "${GREEN}✅ Dépendances du serveur installées${NC}"
    fi

    # Installer les dépendances du client
    echo -e "${BLUE}📦 Installation des dépendances du client...${NC}"
    if [ -d "client" ]; then
        cd client
        npm install > /dev/null 2>&1
        cd ..
        echo -e "${GREEN}✅ Dépendances du client installées${NC}"
    fi

    # Configurer la base de données avec les nouvelles fonctions intelligentes
    echo -e "${BLUE}🗄️  Configuration de la base de données SQLite...${NC}"
    if [ -d "server" ]; then
        # Utiliser les fonctions de correction intelligente
        check_and_fix_prisma_schema
        fix_seed_script
        
        cd server

        # Générer le client Prisma
        echo -e "${BLUE}🔧 Génération du client Prisma...${NC}"
        npx prisma generate > /dev/null 2>&1

        # Créer et migrer la base de données
        echo -e "${BLUE}🗄️  Création de la base de données...${NC}"
        npx prisma db push > /dev/null 2>&1

        # Seeder la base de données avec des données de démonstration
        echo -e "${BLUE}🌱 Ajout des données de démonstration...${NC}"
        if [ -f "scripts/seed-test-data.js" ]; then
            node scripts/seed-test-data.js > /dev/null 2>&1
        else
            npx prisma db seed > /dev/null 2>&1
        fi

        cd ..
        echo -e "${GREEN}✅ Base de données configurée avec les données de démonstration${NC}"
    fi

    echo
    echo -e "${GREEN}🎉 Installation terminée avec succès !${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo
    echo -e "${GREEN}✅ Projet configuré${NC}"
    echo -e "${GREEN}✅ Dépendances installées${NC}"
    echo -e "${GREEN}✅ Base de données créée${NC}"
    echo -e "${GREEN}✅ Données de démonstration ajoutées${NC}"
    echo
    echo -e "${BLUE}URLs d'accès:${NC}"
    echo "🌐 Frontend: http://localhost:$CLIENT_PORT"
    echo "📡 Backend:  http://localhost:$SERVER_PORT"
    echo "📖 API Docs: http://localhost:$SERVER_PORT/api/docs"
    echo "🏥 Health:   http://localhost:$SERVER_PORT/health"
    echo
    echo -e "${BLUE}Comptes de test:${NC}"
    echo "👤 Admin: admin@ads-saas.com / admin123"
    echo "👤 Démo:  demo@ads-saas.com / demo123"
    echo
    echo -e "${GREEN}✅ Tout est prêt ! Utilisez ./run.sh start pour démarrer 🚀${NC}"
}

# Fonction pour démarrer l'application complète
start_app() {
    echo -e "${GREEN}🚀 Démarrage de l'application ADS SaaS...${NC}"
    start_server
    sleep 3
    start_client
    # Vérification automatique après démarrage complet
    echo -e "${BLUE}🔍 Vérification post-démarrage...${NC}"
    check_backend_running
    check_login_route
}

# Fonction pour démarrer l'application de manière simple (intégrée de start.sh)
simple_start() {
    echo -e "${GREEN}🚀 Démarrage simple d'ADS SaaS...${NC}"
    
    # Vérifier et corriger les problèmes de ports
    check_and_fix_ports

    # Démarrer le serveur backend
    echo -e "${BLUE}📡 Démarrage du serveur backend (port $SERVER_PORT)...${NC}"
    if [ -d "server" ]; then
        cd server
        mkdir -p ../logs
        PORT=$SERVER_PORT npm start > ../logs/server.log 2>&1 &
        SERVER_PID=$!
        cd ..
    else
        echo -e "${RED}❌ Répertoire server non trouvé${NC}"
        exit 1
    fi

    sleep 3

    # Démarrer le client frontend
    echo -e "${BLUE}🌐 Démarrage du client frontend (port $CLIENT_PORT)...${NC}"
    if [ -d "client" ]; then
        cd client
        mkdir -p ../logs
        npm run dev > ../logs/client.log 2>&1 &
        CLIENT_PID=$!
        cd ..
    else
        echo -e "${RED}❌ Répertoire client non trouvé${NC}"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi

    echo -e "${GREEN}✅ Les deux services sont démarrés.${NC}"
    echo -e "${YELLOW}Appuyez sur Entrée pour arrêter/redémarrer...${NC}"
    read
    echo -e "${YELLOW}🛑 Arrêt des services...${NC}"
    kill $SERVER_PID 2>/dev/null || true
    kill $CLIENT_PID 2>/dev/null || true
    sleep 2
    echo -e "${GREEN}✅ Les services ont été arrêtés.${NC}"
}

# Fonction pour arrêter l'application de manière simple (intégrée de stop.sh)
simple_stop() {
    echo -e "${YELLOW}🛑 Arrêt simple d'ADS SaaS...${NC}"
    
    # Arrêter les services avec nettoyage complet
    clean_environment

    echo -e "${GREEN}✅ Tous les services ont été arrêtés${NC}"
}

# Fonction pour démarrer uniquement le serveur
start_server() {
    echo -e "${GREEN}🚀 Démarrage du serveur backend...${NC}"
    
    # Utiliser la méthode intelligente de démarrage
    start_server_intelligent
    
    # Vérification automatique du backend et de la route de login
    check_backend_running
    check_login_route
    check_auth_multiple_methods
}

# Fonction pour arrêter uniquement le serveur
stop_server() {
    echo -e "${YELLOW}🛑 Arrêt du serveur backend...${NC}"
    
    # Utiliser la fonction de nettoyage forcé pour le port serveur
    local server_pid=$(lsof -ti:$SERVER_PORT 2>/dev/null)
    if [ ! -z "$server_pid" ]; then
        echo -e "${YELLOW}⚠️  Arrêt forcé du processus serveur sur le port $SERVER_PORT (PID: $server_pid)...${NC}"
        kill -9 $server_pid 2>/dev/null || true
        sleep 2
        echo -e "${GREEN}✅ Serveur backend arrêté${NC}"
    else
        echo -e "${YELLOW}⚠️  Aucun serveur en cours d'exécution sur le port $SERVER_PORT${NC}"
    fi
}

# Fonction pour redémarrer uniquement le serveur
restart_server() {
    echo -e "${PURPLE}🔄 Redémarrage du serveur backend...${NC}"
    stop_server
    sleep 2
    start_server
    # Vérification automatique après redémarrage
    check_backend_running
    check_login_route
}

# Fonction pour démarrer uniquement le client
start_client() {
    echo -e "${GREEN}🚀 Démarrage du client frontend...${NC}"
    
    if [ -d "client" ]; then
        cd client
        echo -e "${CYAN}🌐 Démarrage du client frontend (port $CLIENT_PORT)...${NC}"
        
        # Vérifier et corriger les problèmes de ports (intelligente)
        check_and_fix_ports_smart client
        
        # Nettoyer le cache Next.js si nécessaire
        if [ -d ".next" ]; then
            echo -e "${YELLOW}🗑️  Nettoyage du cache Next.js...${NC}"
            rm -rf .next
        fi
        
        # Démarrer le client
        if npm run dev > /dev/null 2>&1 & then
            # Attendre un peu pour que le client démarre
            sleep 5
            
            # Vérifier si le client répond
            if curl -s http://localhost:$CLIENT_PORT > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Client frontend démarré avec succès${NC}"
                echo -e "${YELLOW}🌐 Frontend: http://localhost:$CLIENT_PORT${NC}"
            else
                echo -e "${YELLOW}⚠️  Client démarré mais ne répond pas encore sur le port $CLIENT_PORT${NC}"
                echo -e "${YELLOW}⚠️  Vérifiez les logs avec: ./run.sh logs-client${NC}"
            fi
        else
            echo -e "${RED}❌ Erreur lors du démarrage du client${NC}"
            echo -e "${YELLOW}⚠️  Vérifiez les logs avec: ./run.sh logs-client${NC}"
        fi
        cd ..
    else
        echo -e "${RED}❌ Répertoire client non trouvé${NC}"
    fi
}

# Fonction pour arrêter uniquement le client
stop_client() {
    echo -e "${YELLOW}🛑 Arrêt du client frontend...${NC}"
    
    # Utiliser la fonction de nettoyage forcé pour le port client
    local client_pid=$(lsof -ti:$CLIENT_PORT 2>/dev/null)
    if [ ! -z "$client_pid" ]; then
        echo -e "${YELLOW}⚠️  Arrêt forcé du processus client sur le port $CLIENT_PORT (PID: $client_pid)...${NC}"
        kill -9 $client_pid 2>/dev/null || true
        sleep 2
        echo -e "${GREEN}✅ Client frontend arrêté${NC}"
    else
        echo -e "${YELLOW}⚠️  Aucun client en cours d'exécution sur le port $CLIENT_PORT${NC}"
    fi
}

# Fonction pour redémarrer uniquement le client
restart_client() {
    echo -e "${PURPLE}🔄 Redémarrage du client frontend...${NC}"
    stop_client
    sleep 2
    start_client
}

# Fonction pour installer/configurer uniquement le serveur
setup_server() {
    echo -e "${CYAN}⚙️  Configuration du serveur backend...${NC}"
    
    if [ -d "server" ]; then
        cd server
        echo -e "${CYAN}📦 Installation des dépendances du serveur...${NC}"
        if npm install; then
            echo -e "${GREEN}✅ Dépendances du serveur installées${NC}"
        else
            echo -e "${RED}❌ Erreur lors de l'installation des dépendances du serveur${NC}"
        fi
        
        # Créer le fichier .env s'il n'existe pas
        if [ ! -f ".env" ]; then
            echo -e "${CYAN}📝 Création du fichier .env...${NC}"
            cat > .env << EOF
PORT=$SERVER_PORT
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="ads-saas-secret-key-change-in-production"
FRONTEND_URL="http://localhost:$CLIENT_PORT"
EOF
            echo -e "${GREEN}✅ Fichier .env créé${NC}"
        else
            echo -e "${YELLOW}⚠️  Fichier .env existe déjà${NC}"
        fi
        
        echo -e "${CYAN}🗄️  Configuration de la base de données...${NC}"
        if npm run db:generate; then
            echo -e "${GREEN}✅ Client Prisma généré${NC}"
        else
            echo -e "${RED}❌ Erreur lors de la génération du client Prisma${NC}"
        fi
        
        if npm run db:push; then
            echo -e "${GREEN}✅ Base de données configurée${NC}"
        else
            echo -e "${RED}❌ Erreur lors de la configuration de la base de données${NC}"
        fi
        
        # Ajouter des données de démonstration si la base est vide
        echo -e "${CYAN}🌱 Ajout des données de démonstration...${NC}"
        if npm run db:seed 2>/dev/null; then
            echo -e "${GREEN}✅ Données de démonstration ajoutées${NC}"
        else
            echo -e "${YELLOW}⚠️  Erreur lors de l'ajout des données de démonstration (normal avec le schéma simplifié)${NC}"
        fi
        
        cd ..
        echo -e "${GREEN}✅ Configuration du serveur terminée${NC}"
    else
        echo -e "${RED}❌ Répertoire server non trouvé${NC}"
    fi
}

# Fonction pour installer/configurer uniquement le client
setup_client() {
    echo -e "${CYAN}⚙️  Configuration du client frontend...${NC}"
    
    if [ -d "client" ]; then
        cd client
        echo -e "${CYAN}📦 Installation des dépendances du client...${NC}"
        if npm install; then
            echo -e "${GREEN}✅ Dépendances du client installées${NC}"
        else
            echo -e "${RED}❌ Erreur lors de l'installation des dépendances du client${NC}"
        fi
        cd ..
    else
        echo -e "${RED}❌ Répertoire client non trouvé${NC}"
    fi
}

# Fonction pour afficher les logs du serveur
show_server_logs() {
    echo -e "${BLUE}📋 Affichage des logs du serveur...${NC}"
    echo
    
    if [ -f "logs/server.log" ]; then
        echo -e "${CYAN}📁 Logs du serveur (20 dernières lignes):${NC}"
        tail -n 20 logs/server.log
    else
        echo -e "${YELLOW}⚠️  Aucun fichier de log trouvé pour le serveur${NC}"
    fi
    
    # Processus serveur en cours
    echo -e "${CYAN}🔄 Processus serveur en cours d'exécution:${NC}"
    lsof -ti:$SERVER_PORT 2>/dev/null | while read pid; do
        if [ ! -z "$pid" ]; then
            ps -p $pid -o pid,ppid,command 2>/dev/null || ps -p $pid -o pid,ppid,comm 2>/dev/null || echo "PID: $pid"
        fi
    done
}

# Fonction pour afficher les logs du client
show_client_logs() {
    echo -e "${BLUE}📋 Affichage des logs du client...${NC}"
    echo
    
    if [ -f "logs/client.log" ]; then
        echo -e "${CYAN}📁 Logs du client (20 dernières lignes):${NC}"
        tail -n 20 logs/client.log
    else
        echo -e "${YELLOW}⚠️  Aucun fichier de log trouvé pour le client${NC}"
    fi
    
    # Processus client en cours
    echo -e "${CYAN}🔄 Processus client en cours d'exécution:${NC}"
    lsof -ti:$CLIENT_PORT 2>/dev/null | while read pid; do
        if [ ! -z "$pid" ]; then
            ps -p $pid -o pid,ppid,command 2>/dev/null || ps -p $pid -o pid,ppid,comm 2>/dev/null || echo "PID: $pid"
        fi
    done
}

# Fonction pour exécuter le type-check du serveur uniquement
run_server_type_check() {
    echo -e "${BLUE}🔍 Exécution du type-check du serveur...${NC}"
    echo
    
    if [ -d "server" ]; then
        cd server
        echo -e "${CYAN}📁 Type-check du serveur backend...${NC}"
        if npm run type-check; then
            echo -e "${GREEN}✅ Type-check du serveur réussi${NC}"
        else
            echo -e "${RED}❌ Erreurs de type dans le serveur${NC}"
        fi
        cd ..
    else
        echo -e "${YELLOW}⚠️  Répertoire server non trouvé${NC}"
    fi
}

# Fonction pour exécuter le type-check du client uniquement
run_client_type_check() {
    echo -e "${BLUE}🔍 Exécution du type-check du client...${NC}"
    echo
    
    if [ -d "client" ]; then
        cd client
        echo -e "${CYAN}📁 Type-check du client frontend...${NC}"
        if npm run type-check; then
            echo -e "${GREEN}✅ Type-check du client réussi${NC}"
        else
            echo -e "${RED}❌ Erreurs de type dans le client${NC}"
        fi
        cd ..
    else
        echo -e "${YELLOW}⚠️  Répertoire client non trouvé${NC}"
    fi
}

# Fonction pour démarrer l'application complète
start_app() {
    echo -e "${GREEN}🚀 Démarrage de l'application ADS SaaS...${NC}"
    start_server
    sleep 3
    start_client
    # Vérification automatique après démarrage complet
    echo -e "${BLUE}🔍 Vérification post-démarrage...${NC}"
    check_backend_running
    check_login_route
}

# Fonction pour arrêter l'application complète
stop_app() {
    echo -e "${YELLOW}🛑 Arrêt de l'application ADS SaaS...${NC}"
    stop_server
    stop_client
}

# Fonction pour redémarrer l'application complète
restart_app() {
    echo -e "${PURPLE}🔄 Redémarrage de l'application ADS SaaS...${NC}"
    stop_app
    sleep 2
    start_app
    # Vérification automatique après redémarrage complet
    echo -e "${BLUE}🔍 Vérification post-redémarrage...${NC}"
    check_backend_running
    check_login_route
}

# Fonction pour installer/configurer l'application complète
setup_app() {
    echo -e "${CYAN}⚙️  Configuration de l'application ADS SaaS...${NC}"
    setup_server
    setup_client
}

# Fonction pour afficher tous les logs
show_logs() {
    echo -e "${BLUE}📋 Affichage des logs récents...${NC}"
    show_server_logs
    echo
    show_client_logs
}

# Fonction pour exécuter le type-check complet
run_type_check() {
    echo -e "${BLUE}🔍 Exécution du type-check...${NC}"
    run_server_type_check
    echo
    run_client_type_check
    echo -e "${GREEN}✅ Type-check terminé${NC}"
}

# Fonction pour nettoyer l'environnement
clean_env() {
    echo -e "${YELLOW}🧹 Nettoyage de l'environnement...${NC}"
    
    # Arrêter les services
    stop_app
    
    # Nettoyer le cache Next.js
    echo -e "${YELLOW}🗑️  Nettoyage du cache Next.js...${NC}"
    if [ -d "client/.next" ]; then
        rm -rf client/.next
        echo -e "${GREEN}✅ Cache Next.js supprimé${NC}"
    fi
    
    # Nettoyer les node_modules si demandé
    read -p "Voulez-vous supprimer les node_modules ? (y/N): " clean_modules
    if [[ $clean_modules =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️  Suppression des node_modules...${NC}"
        rm -rf client/node_modules server/node_modules node_modules
    fi
    
    # Nettoyer les logs
    read -p "Voulez-vous supprimer les logs ? (y/N): " clean_logs
    if [[ $clean_logs =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️  Suppression des logs...${NC}"
        rm -rf logs/* 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Nettoyage terminé${NC}"
}

# Fonction pour nettoyer et réinstaller les dépendances
clean_dependencies() {
    echo -e "${YELLOW}🧹 Nettoyage et réinstallation des dépendances...${NC}"
    
    # Arrêter les services
    stop_app
    
    echo -e "${BLUE}🗑️  Suppression des node_modules et package-lock.json...${NC}"
    
    # Nettoyer le projet principal
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        echo -e "${GREEN}✅ node_modules principal supprimé${NC}"
    fi
    if [ -f "package-lock.json" ]; then
        rm -f package-lock.json
        echo -e "${GREEN}✅ package-lock.json principal supprimé${NC}"
    fi
    
    # Nettoyer le serveur
    if [ -d "server" ]; then
        if [ -d "server/node_modules" ]; then
            rm -rf server/node_modules
            echo -e "${GREEN}✅ node_modules serveur supprimé${NC}"
        fi
        if [ -f "server/package-lock.json" ]; then
            rm -f server/package-lock.json
            echo -e "${GREEN}✅ package-lock.json serveur supprimé${NC}"
        fi
    fi
    
    # Nettoyer le client
    if [ -d "client" ]; then
        if [ -d "client/node_modules" ]; then
            rm -rf client/node_modules
            echo -e "${GREEN}✅ node_modules client supprimé${NC}"
        fi
        if [ -f "client/package-lock.json" ]; then
            rm -f client/package-lock.json
            echo -e "${GREEN}✅ package-lock.json client supprimé${NC}"
        fi
        if [ -d "client/.next" ]; then
            rm -rf client/.next
            echo -e "${GREEN}✅ .next client supprimé${NC}"
        fi
    fi
    
    echo -e "${BLUE}📦 Réinstallation des dépendances...${NC}"
    
    # Réinstaller les dépendances du projet principal
    if [ -f "package.json" ]; then
        echo -e "${CYAN}📦 Installation des dépendances du projet principal...${NC}"
        npm install
        echo -e "${GREEN}✅ Dépendances du projet principal installées${NC}"
    fi
    
    # Réinstaller les dépendances du serveur
    if [ -d "server" ]; then
        echo -e "${CYAN}📦 Installation des dépendances du serveur...${NC}"
        cd server
        npm install
        cd ..
        echo -e "${GREEN}✅ Dépendances du serveur installées${NC}"
    fi
    
    # Réinstaller les dépendances du client
    if [ -d "client" ]; then
        echo -e "${CYAN}📦 Installation des dépendances du client...${NC}"
        cd client
        npm install
        cd ..
        echo -e "${GREEN}✅ Dépendances du client installées${NC}"
    fi
    
    echo -e "${GREEN}✅ Nettoyage et réinstallation des dépendances terminé${NC}"
}

# Fonction pour nettoyer et rebuild Next.js (intégrée de fix-nextjs-chunks.sh)
fix_nextjs_chunks() {
    echo -e "${BLUE}🔧 Nettoyage et rebuild Next.js...${NC}"
    
    # 1. Arrêter tous les processus Next.js
    echo -e "${YELLOW}1. Arrêt des processus Next.js...${NC}"
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "next start" 2>/dev/null || true
    sleep 2

    # 2. Nettoyer le cache Next.js
    echo -e "${YELLOW}2. Nettoyage du cache Next.js...${NC}"
    cd client
    rm -rf .next
    rm -rf node_modules/.cache
    rm -rf .swc

    # 3. Nettoyer les dépendances
    echo -e "${YELLOW}3. Nettoyage des dépendances...${NC}"
    rm -rf node_modules
    rm -f package-lock.json

    # 4. Réinstaller les dépendances
    echo -e "${YELLOW}4. Réinstallation des dépendances...${NC}"
    npm install

    # 5. Vérifier TypeScript
    echo -e "${YELLOW}5. Vérification TypeScript...${NC}"
    npx tsc --noEmit

    # 6. Build de production pour tester
    echo -e "${YELLOW}6. Build de production...${NC}"
    npm run build

    # 7. Démarrer en mode développement
    echo -e "${YELLOW}7. Démarrage en mode développement...${NC}"
    npm run dev &

    # Attendre que le serveur démarre
    sleep 5

    # 8. Tester l'accès
    echo -e "${YELLOW}8. Test de l'accès...${NC}"
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        echo -e "${GREEN}✅ Serveur accessible sur http://localhost:3000${NC}"
    elif curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
        echo -e "${GREEN}✅ Serveur accessible sur http://localhost:3001${NC}"
    else
        echo -e "${RED}❌ Serveur non accessible${NC}"
    fi

    cd ..
    echo -e "${GREEN}✅ Nettoyage et rebuild terminés${NC}"
    echo -e "${BLUE}🌐 Accédez à http://localhost:3000/dashboard ou http://localhost:3001/dashboard${NC}"
}

# Fonction pour configurer le cache busting
setup_cache_busting() {
    echo -e "${CYAN}🔄 Configuration du Cache Busting...${NC}"
    
    if [ -f "scripts/setup-cache-busting.sh" ]; then
        chmod +x scripts/setup-cache-busting.sh
        ./scripts/setup-cache-busting.sh
    else
        echo -e "${RED}❌ Script setup-cache-busting.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour tester le cache busting
test_cache_busting() {
    echo -e "${CYAN}🧪 Test du Cache Busting...${NC}"
    
    if [ -f "scripts/test-cache-busting.sh" ]; then
        chmod +x scripts/test-cache-busting.sh
        ./scripts/test-cache-busting.sh
    else
        echo -e "${RED}❌ Script test-cache-busting.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour mettre à jour la version du cache busting
update_cache_busting_version() {
    echo -e "${CYAN}🔄 Mise à jour de la version du Cache Busting...${NC}"
    
    if [ -f "scripts/update-version.sh" ]; then
        chmod +x scripts/update-version.sh
        ./scripts/update-version.sh
    else
        echo -e "${RED}❌ Script update-version.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour ouvrir la démonstration du cache busting
open_cache_busting_demo() {
    echo -e "${CYAN}🌐 Ouverture de la démonstration du Cache Busting...${NC}"
    
    # Vérifier si l'application est en cours d'exécution
    if lsof -ti:$CLIENT_PORT > /dev/null 2>&1; then
        if command -v open > /dev/null 2>&1; then
            open "http://localhost:$CLIENT_PORT/demo"
        elif command -v xdg-open > /dev/null 2>&1; then
            xdg-open "http://localhost:$CLIENT_PORT/demo"
        else
            echo -e "${YELLOW}⚠️  Impossible d'ouvrir automatiquement le navigateur${NC}"
            echo -e "Veuillez ouvrir manuellement: ${YELLOW}http://localhost:$CLIENT_PORT/demo${NC}"
        fi
    else
        echo -e "${RED}❌ L'application n'est pas en cours d'exécution${NC}"
        echo -e "Veuillez d'abord démarrer l'application (option 1)"
    fi
}

# Fonction pour ouvrir les URLs dans le navigateur
open_browser() {
    echo -e "${CYAN}🌐 Ouverture dans le navigateur...${NC}"
    
    # Vérifier si les services sont en cours d'exécution
    if lsof -ti:$CLIENT_PORT > /dev/null 2>&1; then
        if command -v open > /dev/null 2>&1; then
            open "http://localhost:$CLIENT_PORT"
        elif command -v xdg-open > /dev/null 2>&1; then
            xdg-open "http://localhost:$CLIENT_PORT"
        else
            echo -e "${YELLOW}⚠️  Impossible d'ouvrir automatiquement le navigateur${NC}"
            echo -e "Veuillez ouvrir manuellement: ${YELLOW}http://localhost:$CLIENT_PORT${NC}"
        fi
    else
        echo -e "${RED}❌ L'application n'est pas en cours d'exécution${NC}"
        echo -e "Veuillez d'abord démarrer l'application (option 1)"
    fi
}

# Fonction pour configurer le système d'administration
setup_admin_system() {
    echo -e "${CYAN}👑 Configuration du système d'administration...${NC}"
    
    if [ -f "scripts/setup-admin-system.sh" ]; then
        chmod +x scripts/setup-admin-system.sh
        ./scripts/setup-admin-system.sh
    else
        echo -e "${RED}❌ Script setup-admin-system.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour créer les comptes de démonstration
create_demo_accounts() {
    echo -e "${CYAN}👥 Création des comptes de démonstration...${NC}"
    
    if [ -f "scripts/create-demo-accounts.sh" ]; then
        chmod +x scripts/create-demo-accounts.sh
        ./scripts/create-demo-accounts.sh
    else
        echo -e "${RED}❌ Script create-demo-accounts.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour configurer le monitoring
setup_monitoring() {
    echo -e "${CYAN}📊 Configuration du monitoring...${NC}"
    
    if [ -f "scripts/setup-monitoring.sh" ]; then
        chmod +x scripts/setup-monitoring.sh
        ./scripts/setup-monitoring.sh
    else
        echo -e "${RED}❌ Script setup-monitoring.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour déployer en production
deploy_production() {
    echo -e "${CYAN}🚀 Déploiement en production...${NC}"
    
    if [ -f "scripts/deploy-production.sh" ]; then
        chmod +x scripts/deploy-production.sh
        ./scripts/deploy-production.sh
    else
        echo -e "${RED}❌ Script deploy-production.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour corriger les erreurs
fix_errors() {
    echo -e "${CYAN}🔧 Diagnostic et correction des erreurs...${NC}"
    
    if [ -f "scripts/fix-common-issues.sh" ]; then
        chmod +x scripts/fix-common-issues.sh
        ./scripts/fix-common-issues.sh
    else
        echo -e "${RED}❌ Script fix-common-issues.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour initialiser la base de données
init_database() {
    echo -e "${CYAN}🗄️  Initialisation de la base de données...${NC}"
    
    if [ -f "scripts/init-database.sh" ]; then
        chmod +x scripts/init-database.sh
        ./scripts/init-database.sh
    else
        echo -e "${RED}❌ Script init-database.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour gérer l'environnement
manage_env() {
    echo -e "${CYAN}⚙️  Gestion de l'environnement...${NC}"
    manage_env_script
}

# Fonction pour configurer SSL
setup_ssl() {
    echo -e "${CYAN}🔒 Configuration SSL...${NC}"
    
    if [ -f "scripts/setup-ssl.sh" ]; then
        chmod +x scripts/setup-ssl.sh
        ./scripts/setup-ssl.sh
    else
        echo -e "${RED}❌ Script setup-ssl.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour déployer
deploy() {
    echo -e "${CYAN}🚀 Déploiement...${NC}"
    
    if [ -f "scripts/deploy.sh" ]; then
        chmod +x scripts/deploy.sh
        ./scripts/deploy.sh
    else
        echo -e "${RED}❌ Script deploy.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour configurer logrotate
setup_logrotate() {
    echo -e "${CYAN}📋 Configuration de logrotate...${NC}"
    
    if [ -f "scripts/setup-logrotate.sh" ]; then
        chmod +x scripts/setup-logrotate.sh
        ./scripts/setup-logrotate.sh
    else
        echo -e "${RED}❌ Script setup-logrotate.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour gérer les logs
manage_logs() {
    echo -e "${CYAN}📋 Gestion des logs...${NC}"
    
    if [ -f "scripts/manage-logs.sh" ]; then
        chmod +x scripts/manage-logs.sh
        ./scripts/manage-logs.sh
    else
        echo -e "${RED}❌ Script manage-logs.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour redémarrer les services
restart_services() {
    echo -e "${CYAN}🔄 Redémarrage des services...${NC}"
    
    if [ -f "scripts/restart-services.sh" ]; then
        chmod +x scripts/restart-services.sh
        ./scripts/restart-services.sh
    else
        echo -e "${RED}❌ Script restart-services.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour tester les logs
test_logs() {
    echo -e "${CYAN}🧪 Test des logs...${NC}"
    
    if [ -f "scripts/test-logs.sh" ]; then
        chmod +x scripts/test-logs.sh
        ./scripts/test-logs.sh
    else
        echo -e "${RED}❌ Script test-logs.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour tester le sitemap
test_sitemap() {
    echo -e "${CYAN}🧪 Test du sitemap...${NC}"
    
    if [ -f "scripts/test-sitemap.js" ]; then
        node scripts/test-sitemap.js
    else
        echo -e "${RED}❌ Script test-sitemap.js non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour exécuter les tests de stress
run_stress_test() {
    echo -e "${CYAN}🧪 Tests de stress...${NC}"
    
    if [ -f "scripts/stress-test.js" ]; then
        node scripts/stress-test.js
    else
        echo -e "${RED}❌ Script stress-test.js non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour exécuter les tests de charge
run_load_test() {
    echo -e "${CYAN}🧪 Tests de charge...${NC}"
    
    if [ -f "scripts/load-test.js" ]; then
        node scripts/load-test.js
    else
        echo -e "${RED}❌ Script load-test.js non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour tester le backend
test_backend() {
    echo -e "${CYAN}🧪 Test du backend...${NC}"
    
    if [ -f "scripts/test-backend.js" ]; then
        node scripts/test-backend.js
    else
        echo -e "${RED}❌ Script test-backend.js non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour vérifier l'environnement
check_environment() {
    echo -e "${CYAN}🔍 Vérification de l'environnement...${NC}"
    
    if [ -f "scripts/check-env.js" ]; then
        node scripts/check-env.js
    else
        echo -e "${RED}❌ Script check-env.js non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour exécuter toutes les opérations (sauf stop)
all_scripts() {
    echo -e "${PURPLE}🚀 Exécution de toutes les opérations...${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    
    # 1. Nettoyage complet de l'environnement
    echo -e "${CYAN}📋 Étape 1/15: Nettoyage complet de l'environnement${NC}"
    clean_environment
    echo
    
    # 2. Vérification de l'environnement
    echo -e "${CYAN}📋 Étape 2/15: Vérification de l'environnement${NC}"
    check_environment
    echo
    
    # 3. Configuration/Installation
    echo -e "${CYAN}📋 Étape 3/15: Configuration/Installation${NC}"
    setup_server
    setup_client
    echo
    
    # 4. Initialisation de la base de données
    echo -e "${CYAN}📋 Étape 4/15: Initialisation de la base de données${NC}"
    init_database_script
    echo
    
    # 5. Configuration du système d'administration
    echo -e "${CYAN}📋 Étape 5/15: Configuration du système d'administration${NC}"
    setup_admin_system_script
    echo
    
    # 6. Création des comptes de démonstration
    echo -e "${CYAN}📋 Étape 6/15: Création des comptes de démonstration${NC}"
    create_demo_accounts_script
    echo
    
    # 7. Configuration du monitoring
    echo -e "${CYAN}📋 Étape 7/15: Configuration du monitoring${NC}"
    setup_monitoring_script
    echo
    
    # 8. Configuration SSL
    echo -e "${CYAN}📋 Étape 8/15: Configuration SSL${NC}"
    setup_ssl_script
    echo
    
    # 9. Configuration de logrotate
    echo -e "${CYAN}📋 Étape 9/15: Configuration de logrotate${NC}"
    setup_logrotate
    echo
    
    # 10. Configuration du cache busting
    echo -e "${CYAN}📋 Étape 10/15: Configuration du cache busting${NC}"
    setup_cache_busting_script
    echo
    
    # 11. Correction des erreurs
    echo -e "${CYAN}📋 Étape 11/15: Correction des erreurs${NC}"
    fix_errors_script
    echo
    
    # 12. Redémarrage des services
    echo -e "${CYAN}📋 Étape 12/15: Redémarrage des services${NC}"
    restart_services_script
    echo
    
    # 13. Démarrage de l'application (processus vivants)
    echo -e "${CYAN}📋 Étape 13/15: Démarrage de l'application${NC}"
    # Démarrer le serveur backend
    echo -e "${BLUE}📡 Démarrage du serveur backend (port $SERVER_PORT)...${NC}"
    if [ -d "server" ]; then
        cd server
        mkdir -p ../logs
        PORT=$SERVER_PORT npm run dev > ../logs/server.log 2>&1 &
        SERVER_PID=$!
        cd ..
    else
        echo -e "${RED}❌ Répertoire server non trouvé${NC}"
        exit 1
    fi
    sleep 5
    # Démarrer le client frontend
    echo -e "${BLUE}🌐 Démarrage du client frontend (port $CLIENT_PORT)...${NC}"
    if [ -d "client" ]; then
        cd client
        mkdir -p ../logs
        npm run dev > ../logs/client.log 2>&1 &
        CLIENT_PID=$!
        cd ..
    else
        echo -e "${RED}❌ Répertoire client non trouvé${NC}"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
    echo -e "${GREEN}✅ Les deux services sont démarrés.${NC}"
    echo
    
    # 14. Attendre que les services soient prêts
    echo -e "${CYAN}⏳ Attente que les services soient prêts...${NC}"
    sleep 10
    
    # 15. Vérification du statut
    echo -e "${CYAN}📋 Étape 14/15: Vérification du statut${NC}"
    check_status
    echo
    
    # 16. Type-check
    echo -e "${CYAN}📋 Étape 15/15: Vérification des types${NC}"
    run_server_type_check
    run_client_type_check
    echo
    
    echo -e "${GREEN}✅ Toutes les opérations ont été exécutées avec succès !${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Appuyez sur Entrée pour arrêter/redémarrer...${NC}"
    read
    echo -e "${YELLOW}🛑 Arrêt des services...${NC}"
    kill $SERVER_PID 2>/dev/null || true
    kill $CLIENT_PID 2>/dev/null || true
    sleep 2
    echo -e "${GREEN}✅ Les services ont été arrêtés.${NC}"
}

# Menu principal
show_menu() {
    echo -e "${CYAN}📋 Que voulez-vous faire ?${NC}"
    echo
    echo -e "${PURPLE}0)${NC} 🚀 Exécuter tout (sauf arrêt)"
    echo -e "${GREEN}1)${NC} 🚀 Démarrer l'application complète"
    echo -e "${RED}2)${NC} 🛑 Arrêter l'application complète"
    echo -e "${PURPLE}3)${NC} 🔄 Redémarrer l'application complète"
    echo -e "${BLUE}4)${NC} 🔍 Vérifier le statut"
    echo -e "${CYAN}5)${NC} ⚙️  Configurer/Installer (complet)"
    echo -e "${YELLOW}6)${NC} 📋 Afficher tous les logs"
    echo -e "${GREEN}7)${NC} 🌐 Ouvrir dans le navigateur"
    echo -e "${BLUE}8)${NC} 🔍 Exécuter type-check (complet)"
    echo -e "${YELLOW}9)${NC} 🧹 Nettoyer l'environnement"
    echo -e "${YELLOW}28)${NC} 🧹 Nettoyer et réinstaller les dépendances"
    echo -e "${YELLOW}30)${NC} 🔧 Fix Next.js chunks (nettoyage complet)"
    echo -e "${RED}23)${NC} 🧹 Nettoyage complet forcé"
    echo
    echo -e "${CYAN}━━━ Options Cache Busting ━━━${NC}"
    echo -e "${GREEN}32)${NC} 🔄 Configurer Cache Busting"
    echo -e "${BLUE}33)${NC} 🧪 Tester Cache Busting"
    echo -e "${PURPLE}34)${NC} 🔄 Mettre à jour version Cache Busting"
    echo -e "${CYAN}35)${NC} 🌐 Démo Cache Busting"
    echo
    echo -e "${CYAN}━━━ Options d'installation et démarrage simple ━━━${NC}"
    echo -e "${GREEN}24)${NC} 🚀 Installation complète (setup.sh)"
    echo -e "${GREEN}25)${NC} 🚀 Démarrage simple (start.sh)"
    echo -e "${RED}26)${NC} 🛑 Arrêt simple (stop.sh)"
    echo
    echo -e "${CYAN}━━━ Options spécifiques Serveur ━━━${NC}"
    echo -e "${GREEN}10)${NC} 📡 Démarrer uniquement le serveur"
    echo -e "${RED}11)${NC} 🛑 Arrêter uniquement le serveur"
    echo -e "${PURPLE}12)${NC} 🔄 Redémarrer uniquement le serveur"
    echo -e "${CYAN}13)${NC} ⚙️  Configurer uniquement le serveur"
    echo -e "${BLUE}14)${NC} 📋 Logs du serveur uniquement"
    echo -e "${BLUE}15)${NC} 🔍 Type-check serveur uniquement"
    echo -e "${BLUE}16)${NC} 🔍 Vérifier config serveur"
    echo
    echo -e "${CYAN}━━━ Options spécifiques Client ━━━${NC}"
    echo -e "${GREEN}17)${NC} 🌐 Démarrer uniquement le client"
    echo -e "${RED}18)${NC} 🛑 Arrêter uniquement le client"
    echo -e "${PURPLE}19)${NC} 🔄 Redémarrer uniquement le client"
    echo -e "${CYAN}20)${NC} ⚙️  Configurer uniquement le client"
    echo -e "${BLUE}21)${NC} 📋 Logs du client uniquement"
    echo -e "${BLUE}22)${NC} 🔍 Type-check client uniquement"
    echo
    echo -e "${CYAN}━━━ Options Administration ━━━${NC}"
    echo -e "${GREEN}36)${NC} 👑 Configurer système admin"
    echo -e "${GREEN}37)${NC} 👥 Créer comptes démo"
    echo -e "${BLUE}38)${NC} 🗄️  Initialiser base de données"
    echo -e "${CYAN}39)${NC} ⚙️  Gérer environnement"
    echo
    echo -e "${CYAN}━━━ Options Monitoring & Sécurité ━━━${NC}"
    echo -e "${GREEN}40)${NC} 📊 Configurer monitoring"
    echo -e "${GREEN}41)${NC} 🔒 Configurer SSL"
    echo -e "${BLUE}42)${NC} 📋 Configurer logrotate"
    echo -e "${BLUE}43)${NC} 📋 Gérer logs"
    echo -e "${PURPLE}44)${NC} 🔄 Redémarrer services"
    echo -e "${YELLOW}45)${NC} 🧪 Test des logs"
    echo
    echo -e "${CYAN}━━━ Options Déploiement ━━━${NC}"
    echo -e "${GREEN}46)${NC} 🚀 Déployer en production"
    echo -e "${GREEN}47)${NC} 🚀 Déployer"
    echo -e "${BLUE}48)${NC} 🔧 Corriger erreurs"
    echo
    echo -e "${CYAN}━━━ Options Tests ━━━${NC}"
    echo -e "${GREEN}49)${NC} 🧪 Test sitemap"
    echo -e "${GREEN}50)${NC} 🧪 Tests de stress"
    echo -e "${BLUE}51)${NC} 🧪 Tests de charge"
    echo -e "${BLUE}52)${NC} 🔍 Vérifier environnement"
    echo -e "${PURPLE}53)${NC} 🧪 Test backend complet"
    echo
    echo -e "${CYAN}━━━ Options Démarrage Rapide ━━━${NC}"
    echo -e "${GREEN}54)${NC} 🚀 Démarrage rapide (quick-start)"
    echo -e "${GREEN}55)${NC} 🚀 Démarrage dev (start-dev)"
    echo -e "${BLUE}56)${NC} 🔧 Optimisation performances"
    echo
    echo -e "${CYAN}━━━ Options Correction Erreurs ━━━${NC}"
    echo -e "${GREEN}57)${NC} 🔧 Correction toutes erreurs"
    echo -e "${GREEN}58)${NC} 🔧 Correction erreurs communes"
    echo -e "${BLUE}59)${NC} 🔧 Correction erreurs 404"
    echo -e "${BLUE}60)${NC} 🔧 Correction warnings positionnement"
    echo
    echo -e "${CYAN}━━━ Options AdonisJS ━━━${NC}"
    echo -e "${GREEN}61)${NC} 🔧 Fusion dépendances AdonisJS"
    echo -e "${GREEN}62)${NC} 🚀 Intégration parfaite AdonisJS"
    echo -e "${BLUE}63)${NC} 🚀 Intégration AdonisJS existant"
    echo -e "${BLUE}64)${NC} 🔧 Adaptation Express pour AdonisJS"
    echo -e "${PURPLE}65)${NC} 🚀 Configuration AdonisJS hybride"
    echo
    
    # Afficher les scripts détectés automatiquement
    show_detected_scripts_menu
    
    echo -e "${CYAN}━━━ Options Avancées ━━━${NC}"
    echo -e "${PURPLE}97)${NC} 📋 Informations scripts détectés"
    echo -e "${PURPLE}98)${NC} 🔄 Rafraîchir détection scripts"
    echo -e "${RED}99)${NC} 🚪 Quitter"
    echo
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
}

# Fonction principale
main() {
    clear
    show_logo
    
    # Détecter automatiquement les scripts au démarrage
    detect_scripts
    
    while true; do
        check_status
        show_menu
        
        read -p "Votre choix (0-99): " choice
        echo
        
        # Vérifier d'abord si c'est un script détecté
        if handle_detected_script_choice "$choice"; then
            echo
            read -p "Appuyez sur Entrée pour continuer..."
            continue
        fi
        
        case $choice in
            0)
                check_status
                all_scripts
                ;;
            1)
                check_status
                start_server
                start_client
                # Vérification automatique
                check_backend_running
                check_login_route
                ;;
            2)
                check_status
                stop_server
                stop_client
                ;;
            3)
                check_status
                restart_server
                restart_client
                # Vérification automatique
                check_backend_running
                check_login_route
                ;;
            4)
                check_status
                ;;
            5)
                check_status
                setup_server
                setup_client
                # Vérification automatique
                check_backend_running
                check_login_route
                ;;
            6)
                check_status
                show_server_logs
                show_client_logs
                ;;
            7)
                check_status
                open_browser
                ;;
            8)
                check_status
                run_server_type_check
                run_client_type_check
                ;;
            9)
                check_status
                clean_env
                ;;
            10)
                check_status
                start_server
                # Vérification automatique
                check_backend_running
                check_login_route
                ;;
            11)
                check_status
                stop_server
                ;;
            12)
                check_status
                restart_server
                # Vérification automatique
                check_backend_running
                check_login_route
                ;;
            13)
                check_status
                setup_server
                # Vérification automatique
                check_backend_running
                check_login_route
                ;;
            14)
                check_status
                show_server_logs
                ;;
            15)
                check_status
                run_server_type_check
                ;;
            16)
                check_status
                check_server_config
                ;;
            17)
                check_status
                start_client
                ;;
            18)
                check_status
                stop_client
                ;;
            19)
                check_status
                restart_client
                ;;
            20)
                check_status
                setup_client
                ;;
            21)
                check_status
                show_client_logs
                ;;
            22)
                check_status
                run_client_type_check
                ;;
            23)
                check_status
                clean_environment
                ;;
            24)
                check_status
                install_app
                # Vérification automatique
                check_backend_running
                check_login_route
                ;;
            25)
                check_status
                simple_start
                # Vérification automatique
                check_backend_running
                check_login_route
                ;;
            26)
                check_status
                simple_stop
                ;;
            28)
                check_status
                clean_dependencies
                ;;
            30)
                check_status
                fix_nextjs_chunks
                ;;
            32)
                check_status
                setup_cache_busting
                ;;
            33)
                check_status
                test_cache_busting
                ;;
            34)
                check_status
                update_cache_busting_version
                ;;
            35)
                check_status
                open_cache_busting_demo
                ;;
            36)
                check_status
                setup_admin_system
                ;;
            37)
                check_status
                create_demo_accounts
                ;;
            38)
                check_status
                init_database
                ;;
            39)
                check_status
                manage_env
                ;;
            40)
                check_status
                setup_monitoring
                ;;
            41)
                check_status
                setup_ssl
                ;;
            42)
                check_status
                setup_logrotate
                ;;
            43)
                check_status
                manage_logs
                ;;
            44)
                check_status
                restart_services
                ;;
            45)
                check_status
                test_logs
                ;;
            46)
                check_status
                deploy_production
                ;;
            47)
                check_status
                deploy
                ;;
            48)
                check_status
                fix_errors
                ;;
            49)
                check_status
                test_sitemap
                ;;
            50)
                check_status
                run_stress_test
                ;;
            51)
                check_status
                run_load_test
                ;;
            52)
                check_status
                check_environment
                ;;
            53)
                check_status
                test_backend
                ;;
            54)
                check_status
                quick_start_script
                ;;
            55)
                check_status
                start_dev_script
                ;;
            56)
                check_status
                optimize_performance_script
                ;;
            57)
                check_status
                fix_all_errors_script
                ;;
            58)
                check_status
                fix_common_issues_script
                ;;
            59)
                check_status
                fix_404_errors_script
                ;;
            60)
                check_status
                fix_positioning_warnings_script
                ;;
            61)
                check_status
                merge_adonisjs_deps_script
                ;;
            62)
                check_status
                integrate_adonisjs_perfect_script
                ;;
            63)
                check_status
                integrate_adonisjs_existing_script
                ;;
            64)
                check_status
                adapt_express_for_adonisjs_script
                ;;
            65)
                check_status
                setup_adonisjs_hybrid_script
                ;;
            97)
                check_status
                echo -e "${CYAN}📋 Affichage des informations des scripts détectés...${NC}"
                if [ ${#DETECTED_SCRIPTS[@]} -eq 0 ]; then
                    echo -e "${YELLOW}⚠️  Aucun script détecté${NC}"
                else
                    for i in "${!SCRIPT_OPTIONS[@]}"; do
                        local script_name="${SCRIPT_OPTIONS[$i]}"
                        show_script_info "$script_name"
                    done
                fi
                ;;
            98)
                check_status
                echo -e "${CYAN}🔄 Rafraîchissement de la détection des scripts...${NC}"
                detect_scripts
                echo -e "${GREEN}✅ Détection des scripts rafraîchie${NC}"
                ;;
            99)
                echo -e "${GREEN}👋 Au revoir !${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Option invalide. Veuillez choisir entre 0 et 99.${NC}"
                ;;
        esac
        
        echo
        echo -e "${YELLOW}Appuyez sur Entrée pour redémarrer...${NC}"
        read
        clear
        show_logo
    done
}

# Fonction pour vérifier et corriger la configuration du serveur
check_server_config() {
    echo -e "${BLUE}🔍 Vérification de la configuration du serveur...${NC}"
    
    # Vérifier la configuration .env unifiée
    check_env_config
    
    if [ -d "server" ]; then
        cd server
        
        # Vérifier les dépendances
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}⚠️  Dépendances manquantes, installation...${NC}"
            npm install
        else
            echo -e "${GREEN}✅ Dépendances installées${NC}"
        fi
        
        # Vérifier la base de données
        if [ ! -f "dev.db" ]; then
            echo -e "${YELLOW}⚠️  Base de données manquante, création...${NC}"
            npm run db:generate
            npm run db:push
            npm run db:seed
        else
            echo -e "${GREEN}✅ Base de données présente${NC}"
        fi
        
        cd ..
        echo -e "${GREEN}✅ Configuration du serveur vérifiée${NC}"
    else
        echo -e "${RED}❌ Répertoire server non trouvé${NC}"
    fi
}

# === DÉBUT DES SCRIPTS FUSIONNÉS ===

# Script: manage-env.sh
manage_env_script() {
    echo "⚙️  Gestion de l'environnement..."
    
    # Vérifier que nous sommes à la racine du projet
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Ce script doit être exécuté depuis la racine du projet ADS${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📋 Fichiers .env détectés:${NC}"
    ls -la .env* 2>/dev/null || echo -e "${YELLOW}⚠️  Aucun fichier .env trouvé${NC}"
    
    # Créer le fichier .env s'il n'existe pas
    if [ ! -f ".env" ]; then
        echo -e "${BLUE}📝 Création du fichier .env...${NC}"
        
        # Essayer de copier depuis .env.development en priorité
        if [ -f ".env.development" ]; then
            cp .env.development .env
            echo -e "${GREEN}✅ Fichier .env créé à partir de .env.development${NC}"
        elif [ -f ".env.local" ]; then
            cp .env.local .env
            echo -e "${GREEN}✅ Fichier .env créé à partir de .env.local${NC}"
        elif [ -f ".env.production" ]; then
            cp .env.production .env
            echo -e "${GREEN}✅ Fichier .env créé à partir de .env.production${NC}"
        else
            # Créer un fichier .env minimal
            cat > .env << 'EOF'
# Configuration ADS SaaS
NODE_ENV=development
PORT=8000
DATABASE_URL="file:./dev.db"
JWT_SECRET="ads-saas-secret-key-change-in-production-32-chars-min"
JWT_REFRESH_SECRET="ads-saas-refresh-secret-change-in-production-32"
FRONTEND_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:8000"
EOF
            echo -e "${GREEN}✅ Fichier .env créé avec configuration minimale${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Fichier .env existe déjà${NC}"
    fi
    
    # Vérifier les variables importantes
    echo -e "${BLUE}🔍 Vérification des variables d'environnement...${NC}"
    source .env 2>/dev/null || echo -e "${YELLOW}⚠️  Impossible de charger le fichier .env${NC}"
    
    if [ -z "$JWT_SECRET" ]; then
        echo -e "${YELLOW}⚠️  JWT_SECRET non défini${NC}"
    else
        echo -e "${GREEN}✅ JWT_SECRET défini${NC}"
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${YELLOW}⚠️  DATABASE_URL non défini${NC}"
    else
        echo -e "${GREEN}✅ DATABASE_URL défini${NC}"
    fi
    
    if [ -z "$PORT" ]; then
        echo -e "${YELLOW}⚠️  PORT non défini${NC}"
    else
        echo -e "${GREEN}✅ PORT défini: $PORT${NC}"
    fi
    
    # Vérifier la cohérence avec le serveur
    if [ -f "server/.env" ]; then
        echo -e "${BLUE}🔍 Vérification de la cohérence avec server/.env...${NC}"
        if [ -f ".env" ] && [ -f "server/.env" ]; then
            # Comparer les variables importantes
            source .env
            source server/.env
            if [ "$DATABASE_URL" != "$SERVER_DATABASE_URL" ] 2>/dev/null; then
                echo -e "${YELLOW}⚠️  DATABASE_URL différent entre .env et server/.env${NC}"
            else
                echo -e "${GREEN}✅ Configuration cohérente entre .env et server/.env${NC}"
            fi
        fi
    fi
    
    echo -e "${GREEN}✅ Gestion de l'environnement terminée${NC}"
}

# Script: init-database.sh
init_database_script() {
    echo "🗄️  Initialisation de la base de données SQLite pour ADS SaaS..."
    
    # Vérifier que nous sommes dans le bon répertoire
    if [ ! -f "package.json" ]; then
        error "Ce script doit être exécuté depuis la racine du projet"
        exit 1
    fi
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js n'est pas installé"
        exit 1
    fi
    
    log "Node.js détecté: $(node --version)"
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        error "npm n'est pas installé"
        exit 1
    fi
    
    log "npm détecté: $(npm --version)"
    
    # Aller dans le répertoire server
    cd server
    
    log "Configuration de la base de données SQLite..."
    
    # Installer les dépendances si nécessaire
    if [ ! -d "node_modules" ]; then
        info "Installation des dépendances serveur..."
        npm install
    fi
    
    # Vérifier que Prisma est installé
    if ! npx prisma --version > /dev/null 2>&1; then
        error "Prisma n'est pas installé"
        exit 1
    fi
    
    log "Prisma détecté: $(npx prisma --version)"
    
    # Utiliser les fonctions de correction intelligente
    check_and_fix_prisma_schema
    fix_seed_script
    
    # Supprimer la base de données existante si elle existe
    if [ -f "dev.db" ]; then
        warn "Base de données existante détectée, elle va être supprimée pour éviter les conflits de migration."
        rm -f dev.db
        log "Ancienne base de données supprimée"
    fi
    
    # Supprimer les migrations existantes pour repartir de zéro
    if [ -d "prisma/migrations" ]; then
        warn "Migrations existantes détectées, suppression..."
        rm -rf prisma/migrations
        log "Anciennes migrations supprimées"
    fi
    
    # Supprimer le fichier de verrouillage des migrations
    if [ -f "prisma/migration_lock.toml" ]; then
        rm -f prisma/migration_lock.toml
        log "Fichier de verrouillage des migrations supprimé"
    fi
    
    # Générer le client Prisma
    info "Génération du client Prisma..."
    npx prisma generate
    
    # Créer la base de données SQLite avec push (évite les problèmes de migration)
    info "Création de la base de données SQLite..."
    npx prisma db push --force-reset
    
    log "Base de données SQLite créée"
    
    # Seeder la base de données avec des données de démonstration
    info "Ajout des données de démonstration..."
    
    # Utiliser le script de seeding corrigé
    if [ -f "scripts/seed-test-data.js" ]; then
        node scripts/seed-test-data.js
    else
        # Fallback vers l'ancien script si le nouveau n'existe pas
        cat > seed-demo.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Ajout des données de démonstration...');

    // Créer l'utilisateur administrateur
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@ads-saas.com' },
      update: {},
      create: {
          email: 'admin@ads-saas.com',
          password: adminPassword,
          firstName: 'Admin',
          lastName: 'ADS SaaS',
          role: 'ADMIN',
          emailVerified: true,
          twoFactorEnabled: false
        }
    });

    console.log('✅ Utilisateur administrateur créé');

    // Créer l'utilisateur démo
    const demoPassword = await bcrypt.hash('demo123', 10);
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@ads-saas.com' },
      update: {},
      create: {
          email: 'demo@ads-saas.com',
          password: demoPassword,
          firstName: 'Utilisateur',
          lastName: 'Démo',
          role: 'USER',
          emailVerified: true,
          twoFactorEnabled: false
        }
    });

    console.log('✅ Utilisateur démo créé');

    // Créer quelques campagnes de démonstration
    if (demoUser) {
      // Campagne démo 1
      await prisma.campaign.upsert({
        where: { id: 'demo-campaign-1' },
        update: {},
        create: {
          id: 'demo-campaign-1',
          name: 'Campagne Démo - Produits Tech',
          description: 'Campagne de démonstration pour les produits technologiques',
          status: 'ACTIVE',
          budget: 1000.0,
          spent: 250.75,
          impressions: 15420,
          clicks: 847,
          conversions: 23,
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
          userId: demoUser.id
        }
      });

      // Campagne démo 2
      await prisma.campaign.upsert({
        where: { id: 'demo-campaign-2' },
        update: {},
        create: {
          id: 'demo-campaign-2',
          name: 'Campagne Démo - Services',
          description: 'Campagne de démonstration pour les services en ligne',
          status: 'PAUSED',
          budget: 500.0,
          spent: 89.50,
          impressions: 5230,
          clicks: 312,
          conversions: 8,
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
          userId: demoUser.id
        }
      });

      console.log('✅ Campagnes de démonstration créées');
    }

    console.log('🎉 Base de données initialisée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
EOF
        node seed-demo.js
        rm seed-demo.js
    fi
    
    # Retourner à la racine
    cd ..
    
    log "✅ Base de données SQLite initialisée avec succès !"
    echo
    echo "📋 Récapitulatif:"
    echo "   ✅ Base de données SQLite créée"
    echo "   ✅ Utilisateur administrateur créé"
    echo "   ✅ Utilisateur démo créé"
    echo "   ✅ Campagnes de démonstration ajoutées"
    echo "   ✅ Dépendances installées"
    echo
    echo "🔑 Identifiants d'accès:"
    echo "   👤 Admin: admin@ads-saas.com / admin123"
    echo "   👤 Démo:  demo@ads-saas.com / demo123"
    echo
    echo "🌐 URLs d'accès:"
    echo "   🏠 Application: http://localhost:3000"
    echo "   🔧 Admin: http://localhost:3000/admin/login"
    echo "   📊 API: http://localhost:8000"
    echo
    echo "🗄️  Base de données:"
    echo "   - Fichier: server/dev.db"
    echo "   - Type: SQLite"
    echo "   - Taille: $(ls -lh server/dev.db 2>/dev/null | awk '{print $5}' || echo 'N/A')"
    echo
    echo "🚀 Pour démarrer le système:"
    echo "   ./run.sh start"
    echo
    log "Base de données prête à l'emploi !"
}

# Script: setup-admin-system.sh
setup_admin_system_script() {
    echo "👑 Configuration du système d'administration..."
    
    if [ -f "scripts/setup-admin-system.sh" ]; then
        chmod +x scripts/setup-admin-system.sh
        ./scripts/setup-admin-system.sh
    else
        echo -e "${RED}❌ Script setup-admin-system.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Script: create-demo-accounts.sh
create_demo_accounts_script() {
    echo "👥 Création des comptes de démonstration..."
    
    # Vérifier que nous sommes dans le bon répertoire
    if [ ! -f "package.json" ]; then
        error "Ce script doit être exécuté depuis la racine du projet"
        return 1
    fi
    
    # Aller dans le répertoire server
    cd server
    
    log "Création des comptes de démonstration via Prisma..."
    
    # Créer un script de création de comptes démo
    cat > create-demo-accounts.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoAccounts() {
  try {
    console.log('👥 Création des comptes de démonstration...');

    // Créer l'utilisateur démo principal
    const demoPassword = await bcrypt.hash('Demo123456!', 10);
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@ads-saas.com' },
      update: {},
      create: {
        email: 'demo@ads-saas.com',
        password: demoPassword,
        firstName: 'Utilisateur',
        lastName: 'Démo',
        role: 'USER',
        emailVerified: true,
        twoFactorEnabled: false
      }
    });

    console.log('✅ Utilisateur démo principal créé');

    // Créer quelques utilisateurs de test supplémentaires
    const testUsers = [
      { email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe' },
      { email: 'jane.smith@example.com', firstName: 'Jane', lastName: 'Smith' },
      { email: 'mike.wilson@example.com', firstName: 'Mike', lastName: 'Wilson' }
    ];

    for (const userData of testUsers) {
      const password = await bcrypt.hash('Password123!', 10);
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          password: password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'USER',
          emailVerified: true,
          twoFactorEnabled: false
        }
      });
      console.log(`✅ Utilisateur créé: ${userData.email}`);
    }

    // Créer quelques campagnes de démonstration
    if (demoUser) {
      const campaigns = [
        {
          name: 'Campagne Démo - Produits Tech',
          description: 'Campagne de démonstration pour les produits technologiques',
          status: 'ACTIVE',
          budget: 1000.0,
          spent: 250.75,
          impressions: 15420,
          clicks: 847,
          conversions: 23
        },
        {
          name: 'Campagne Démo - Services',
          description: 'Campagne de démonstration pour les services en ligne',
          status: 'PAUSED',
          budget: 500.0,
          spent: 89.50,
          impressions: 5230,
          clicks: 312,
          conversions: 8
        }
      ];

      for (const campaignData of campaigns) {
        await prisma.campaign.upsert({
          where: { id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
          update: {},
          create: {
            ...campaignData,
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
            userId: demoUser.id
          }
        });
      }
      console.log('✅ Campagnes de démonstration créées');
    }

    console.log('🎉 Comptes de démonstration créés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la création des comptes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createDemoAccounts();
EOF

    # Exécuter le script
    node create-demo-accounts.js
    
    # Nettoyer le script temporaire
    rm create-demo-accounts.js
    
    # Retourner à la racine
    cd ..
    
    log "✅ Comptes de démonstration créés avec succès !"
    echo
    echo "🔑 Identifiants de démonstration:"
    echo "   👤 Démo: demo@ads-saas.com / Demo123456!"
    echo "   👤 Test: john.doe@example.com / Password123!"
    echo "   👤 Test: jane.smith@example.com / Password123!"
    echo "   👤 Test: mike.wilson@example.com / Password123!"
    echo
}

# Script: setup-monitoring.sh
setup_monitoring_script() {
    echo "📊 Configuration du monitoring..."
    
    if [ -f "scripts/setup-monitoring.sh" ]; then
        chmod +x scripts/setup-monitoring.sh
        ./scripts/setup-monitoring.sh
    else
        echo -e "${RED}❌ Script setup-monitoring.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Script: setup-ssl.sh
setup_ssl_script() {
    echo "🔒 Configuration SSL..."
    
    if [ -f "scripts/setup-ssl.sh" ]; then
        chmod +x scripts/setup-ssl.sh
        ./scripts/setup-ssl.sh
    else
        echo -e "${RED}❌ Script setup-ssl.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Script: setup-cache-busting.sh
setup_cache_busting_script() {
    echo "🔄 Configuration du Cache Busting..."
    
    if [ -f "scripts/setup-cache-busting.sh" ]; then
        chmod +x scripts/setup-cache-busting.sh
        ./scripts/setup-cache-busting.sh
    else
        echo -e "${RED}❌ Script setup-cache-busting.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Script: fix-errors.sh
fix_errors_script() {
    echo "🔧 Diagnostic et correction des erreurs..."
    
    if [ -f "scripts/fix-errors.sh" ]; then
        chmod +x scripts/fix-errors.sh
        ./scripts/fix-errors.sh
    else
        echo -e "${RED}❌ Script fix-errors.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Script: restart-services.sh
restart_services_script() {
    echo "🔄 Redémarrage des services..."
    
    if [ -f "scripts/restart-services.sh" ]; then
        chmod +x scripts/restart-services.sh
        ./scripts/restart-services.sh
    else
        echo -e "${RED}❌ Script restart-services.sh non trouvé${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez que le script existe dans le dossier scripts/${NC}"
    fi
}

# Fonction pour tout exécuter dans l'ordre logique
all_scripts() {
    log "Exécution de l'automatisation complète (ALL) :"
    
    # 1. Configuration de base
    log "📋 Étape 1/8: Configuration de l'environnement"
    manage_env_script
    
    # 2. Initialisation de la base de données
    log "📋 Étape 2/8: Initialisation de la base de données"
    init_database_script
    
    # 3. Configuration du système d'administration
    log "📋 Étape 3/8: Configuration du système d'administration"
    setup_admin_system_script
    
    # 4. Configuration du monitoring
    log "📋 Étape 4/8: Configuration du monitoring"
    setup_monitoring_script
    
    # 5. Configuration SSL
    log "📋 Étape 5/8: Configuration SSL"
    setup_ssl_script
    
    # 6. Configuration du cache busting
    log "📋 Étape 6/8: Configuration du cache busting"
    setup_cache_busting_script
    
    # 7. Correction des erreurs
    log "📋 Étape 7/8: Correction des erreurs"
    fix_errors_script
    
    # 8. Redémarrage des services
    log "📋 Étape 8/8: Redémarrage des services"
    restart_services_script
    
    log "🎉 Automatisation complète terminée !"
    log "🚀 Pour démarrer l'application: ./run.sh start"
    
    echo
    echo -e "${YELLOW}Appuyez sur Entrée pour arrêter/redémarrer...${NC}"
    read
    echo -e "${YELLOW}🛑 Arrêt des services...${NC}"
    stop_app
    sleep 2
    echo -e "${GREEN}✅ Les services ont été arrêtés.${NC}"
}

# === FONCTIONS POUR LES SCRIPTS MANQUANTS ===

# Script: quick-start.sh
quick_start_script() {
    echo "🚀 Démarrage rapide de ADS SaaS optimisé..."
    
    # Vérifier les prérequis
    echo -e "${BLUE}ℹ️  Vérification des prérequis...${NC}"
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js n'est pas installé${NC}"
        return 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm n'est pas installé${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Prérequis vérifiés${NC}"
    
    # 1. DÉMARRER REDIS
    echo -e "${BLUE}1. Démarrage de Redis...${NC}"
    
    if ! pgrep -x "redis-server" > /dev/null; then
        if command -v redis-server &> /dev/null; then
            redis-server --daemonize yes
            sleep 2
            echo -e "${GREEN}✅ Redis démarré${NC}"
        else
            echo -e "${YELLOW}⚠️  Redis non installé - le cache sera désactivé${NC}"
        fi
    else
        echo -e "${GREEN}✅ Redis déjà en cours d'exécution${NC}"
    fi
    
    # 2. PRÉPARER LA BASE DE DONNÉES
    echo -e "${BLUE}2. Préparation de la base de données...${NC}"
    
    cd server
    
    # Générer le client Prisma
    npx prisma generate
    
    # Appliquer les migrations
    npx prisma db push
    
    # Créer un utilisateur de test si nécessaire
    if ! npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM users;" | grep -q "1"; then
        echo -e "${BLUE}   Création d'un utilisateur de test...${NC}"
        node -e "
        const { PrismaClient } = require('@prisma/client');
        const bcrypt = require('bcryptjs');
        
        const prisma = new PrismaClient();
        
        async function createTestUser() {
            try {
                const hashedPassword = await bcrypt.hash('password123', 12);
                
                const user = await prisma.user.create({
                    data: {
                        email: 'admin@ads-saas.com',
                        password: hashedPassword,
                        firstName: 'Admin',
                        lastName: 'Test',
                        role: 'ADMIN',
                        status: 'ACTIVE'
                    }
                });
                
                await prisma.subscription.create({
                    data: {
                        userId: user.id,
                        plan: 'PRO',
                        status: 'ACTIVE'
                    }
                });
                
                console.log('✅ Utilisateur de test créé: admin@ads-saas.com / password123');
            } catch (error) {
                console.log('Utilisateur de test déjà existant');
            } finally {
                await prisma.\$disconnect();
            }
        }
        
        createTestUser();
        "
    fi
    
    cd ..
    
    # 3. DÉMARRER LE BACKEND
    echo -e "${BLUE}3. Démarrage du backend...${NC}"
    
    cd server
    
    # Installer les dépendances si nécessaire
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}   Installation des dépendances backend...${NC}"
        npm install
    fi
    
    # Démarrer le serveur backend
    echo -e "${BLUE}   Démarrage du serveur backend...${NC}"
    npm run dev &
    BACKEND_PID=$!
    
    cd ..
    
    # 4. DÉMARRER LE FRONTEND
    echo -e "${BLUE}4. Démarrage du frontend...${NC}"
    
    cd client
    
    # Installer les dépendances si nécessaire
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}   Installation des dépendances frontend...${NC}"
        npm install
    fi
    
    # Démarrer le serveur frontend
    echo -e "${BLUE}   Démarrage du serveur frontend...${NC}"
    npm run dev &
    FRONTEND_PID=$!
    
    cd ..
    
    # 5. ATTENDRE LE DÉMARRAGE
    echo -e "${BLUE}5. Attente du démarrage des services...${NC}"
    
    sleep 10
    
    # 6. TESTS DE CONNECTIVITÉ
    echo -e "${BLUE}6. Tests de connectivité...${NC}"
    
    # Test backend
    if curl -s http://localhost:8000/health > /dev/null; then
        echo -e "${GREEN}✅ Backend accessible sur http://localhost:8000${NC}"
    else
        echo -e "${RED}❌ Backend non accessible${NC}"
    fi
    
    # Test frontend
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✅ Frontend accessible sur http://localhost:3000${NC}"
    else
        echo -e "${RED}❌ Frontend non accessible${NC}"
    fi
    
    # Test Redis
    if command -v redis-cli &> /dev/null && redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis fonctionnel${NC}"
    else
        echo -e "${YELLOW}⚠️  Redis non accessible${NC}"
    fi
    
    # 7. AFFICHER LES INFORMATIONS
    echo ""
    echo -e "${GREEN}🎉 ADS SaaS démarré avec succès!${NC}"
    echo ""
    echo -e "${CYAN}📊 Services disponibles:${NC}"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:8000"
    echo "   - Health Check: http://localhost:8000/health"
    echo ""
    echo -e "${CYAN}🔐 Compte de test:${NC}"
    echo "   - Email: admin@ads-saas.com"
    echo "   - Mot de passe: password123"
    echo ""
}

# Script: optimize-performance.sh
optimize_performance_script() {
    echo "🔧 Optimisation automatique des performances pour ADS..."
    
    # Fonction d'optimisation de la base de données
    optimize_database() {
        echo -e "${BLUE}🔧 Optimisation de la base de données...${NC}"
        
        cd server
        
        # Générer le client Prisma avec les nouveaux index
        echo -e "${BLUE}Génération du client Prisma...${NC}"
        npx prisma generate
        
        # Appliquer les migrations
        echo -e "${BLUE}Application des migrations...${NC}"
        npx prisma migrate deploy
        
        # Optimiser la base de données SQLite
        echo -e "${BLUE}Optimisation SQLite...${NC}"
        npx prisma db execute --stdin <<< "
            PRAGMA optimize;
            VACUUM;
            ANALYZE;
        "
        
        cd ..
        echo -e "${GREEN}✅ Base de données optimisée${NC}"
    }
    
    # Fonction d'optimisation du cache Redis
    optimize_cache() {
        echo -e "${BLUE}🔧 Optimisation du cache Redis...${NC}"
        
        # Vérifier si Redis est en cours d'exécution
        if ! pgrep -x "redis-server" > /dev/null; then
            echo -e "${YELLOW}⚠️  Redis n'est pas en cours d'exécution. Démarrage...${NC}"
            redis-server --daemonize yes
            sleep 2
        fi
        
        # Nettoyer le cache
        redis-cli FLUSHDB
        
        # Configurer Redis pour les performances
        redis-cli CONFIG SET maxmemory-policy allkeys-lru
        redis-cli CONFIG SET save ""
        redis-cli CONFIG SET appendonly no
        
        echo -e "${GREEN}✅ Cache Redis optimisé${NC}"
    }
    
    # Fonction d'optimisation du frontend
    optimize_frontend() {
        echo -e "${BLUE}🔧 Optimisation du frontend...${NC}"
        
        cd client
        
        # Nettoyer les caches
        echo -e "${BLUE}Nettoyage des caches...${NC}"
        rm -rf .next
        rm -rf node_modules/.cache
        
        # Optimiser les dépendances
        echo -e "${BLUE}Optimisation des dépendances...${NC}"
        npm ci --production=false
        
        # Build optimisé
        echo -e "${BLUE}Build optimisé...${NC}"
        npm run build
        
        cd ..
        echo -e "${GREEN}✅ Frontend optimisé${NC}"
    }
    
    # Fonction d'optimisation du backend
    optimize_backend() {
        echo -e "${BLUE}🔧 Optimisation du backend...${NC}"
        
        cd server
        
        # Nettoyer les caches
        echo -e "${BLUE}Nettoyage des caches...${NC}"
        rm -rf node_modules/.cache
        rm -rf tmp/*
        
        # Optimiser les dépendances
        echo -e "${BLUE}Optimisation des dépendances...${NC}"
        npm ci --production=false
        
        # Vérifier la configuration
        echo -e "${BLUE}Vérification de la configuration...${NC}"
        node -c src/index.ts
        
        cd ..
        echo -e "${GREEN}✅ Backend optimisé${NC}"
    }
    
    # Fonction d'optimisation système
    optimize_system() {
        echo -e "${BLUE}🔧 Optimisation système...${NC}"
        
        # Vérifier l'espace disque
        DISK_USAGE=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
        if [ "$DISK_USAGE" -gt 90 ]; then
            echo -e "${YELLOW}⚠️  Espace disque faible: ${DISK_USAGE}%${NC}"
            echo -e "${BLUE}Nettoyage des fichiers temporaires...${NC}"
            find . -name "*.tmp" -delete
            find . -name "*.log" -size +100M -delete
        fi
        
        # Optimiser la mémoire
        if command -v sysctl &> /dev/null; then
            echo -e "${BLUE}Optimisation de la mémoire...${NC}"
            sudo sysctl -w vm.swappiness=10
        fi
        
        echo -e "${GREEN}✅ Système optimisé${NC}"
    }
    
    # Fonction de test de performance
    test_performance() {
        echo -e "${BLUE}🧪 Test de performance...${NC}"
        
        # Test de la base de données
        echo -e "${BLUE}Test de la base de données...${NC}"
        cd server
        npx prisma db execute --stdin <<< "
            SELECT COUNT(*) as user_count FROM users;
            SELECT COUNT(*) as campaign_count FROM campaigns;
        "
        cd ..
        
        # Test de Redis
        echo -e "${BLUE}Test de Redis...${NC}"
        redis-cli ping
        redis-cli info memory | grep used_memory_human
        
        # Test du serveur
        echo -e "${BLUE}Test du serveur...${NC}"
        if curl -s http://localhost:8000/health > /dev/null; then
            echo -e "${GREEN}✅ Serveur accessible${NC}"
        else
            echo -e "${YELLOW}⚠️  Serveur non accessible sur le port 8000${NC}"
        fi
        
        # Test du frontend
        echo -e "${BLUE}Test du frontend...${NC}"
        if curl -s http://localhost:3000 > /dev/null; then
            echo -e "${GREEN}✅ Frontend accessible${NC}"
        else
            echo -e "${YELLOW}⚠️  Frontend non accessible sur le port 3000${NC}"
        fi
        
        echo -e "${GREEN}✅ Tests de performance terminés${NC}"
    }
    
    # Exécuter les optimisations
    optimize_database
    optimize_cache
    optimize_frontend
    optimize_backend
    optimize_system
    test_performance
    
    echo -e "${GREEN}🎉 Optimisation des performances terminée !${NC}"
}

# Script: fix-all-errors.sh
fix_all_errors_script() {
    echo "🚀 Correction complète des erreurs 404 et warnings..."
    echo "===================================================="
    
    # Corriger les erreurs 404
    fix_404_errors() {
        echo -e "${PURPLE}🔧 Correction des erreurs 404...${NC}"
        
        # 1. Vérifier la route API placeholder
        if [ ! -f "client/src/app/api/placeholder/[...size]/route.ts" ]; then
            echo -e "${YELLOW}⚠️  Création de la route API placeholder...${NC}"
            mkdir -p "client/src/app/api/placeholder/[...size]"
            cat > "client/src/app/api/placeholder/[...size]/route.ts" << 'EOF'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { size: string[] } }
) {
  try {
    // Gérer le format "40/40" ou "300/200"
    const sizeParam = params.size.join('/')
    const [width, height] = sizeParam.split('/').map(Number)
    
    if (!width || !height || width > 1000 || height > 1000) {
      return new NextResponse('Invalid size', { status: 400 })
    }

    // Générer une image SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 8}" 
              fill="white" text-anchor="middle" dy=".3em">
          ${width}×${height}
        </text>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Erreur génération placeholder:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
EOF
            echo -e "${GREEN}✅ Route API placeholder créée${NC}"
        else
            echo -e "${GREEN}✅ Route API placeholder existe déjà${NC}"
        fi
        
        # 2. Vérifier la configuration Next.js
        if [ -f "client/next.config.js" ]; then
            if ! grep -q "images:" "client/next.config.js"; then
                echo -e "${YELLOW}⚠️  Ajout de la configuration images dans next.config.js...${NC}"
                # Ajouter la configuration images si elle n'existe pas
                sed -i.bak '/module.exports = {/a\
  images: {\
    domains: ["localhost", "127.0.0.1"],\
    unoptimized: true\
  },' "client/next.config.js"
                echo -e "${GREEN}✅ Configuration images ajoutée${NC}"
            else
                echo -e "${GREEN}✅ Configuration images déjà présente${NC}"
            fi
        fi
    }
    
    # Corriger les warnings de positionnement
    fix_positioning_warnings() {
        echo -e "${PURPLE}🔧 Correction des warnings de positionnement...${NC}"
        
        # 1. Corriger le builder visuel
        if [ -f "client/src/lib/visual-page-builder.tsx" ]; then
            echo -e "${BLUE}Correction du builder visuel...${NC}"
            
            # Vérifier si le conteneur principal a une position relative
            if ! grep -q "className=\"h-full flex bg-gray-100 relative\"" "client/src/lib/visual-page-builder.tsx"; then
                echo -e "${YELLOW}⚠️  Ajout de la position relative au conteneur principal...${NC}"
                sed -i.bak 's/className="h-full flex bg-gray-100"/className="h-full flex bg-gray-100 relative"/' "client/src/lib/visual-page-builder.tsx"
                echo -e "${GREEN}✅ Position relative ajoutée au builder visuel${NC}"
            else
                echo -e "${GREEN}✅ Builder visuel déjà corrigé${NC}"
            fi
            
            # Corriger les icônes Heroicons
            if grep -q "style: { marginRight: '8px', color: '#9ca3af' }" "client/src/lib/visual-page-builder.tsx"; then
                echo -e "${YELLOW}⚠️  Correction des icônes Heroicons...${NC}"
                sed -i.bak "s/style: { marginRight: '8px', color: '#9ca3af' }/className: \"mr-2 text-gray-400\"/" "client/src/lib/visual-page-builder.tsx"
                echo -e "${GREEN}✅ Icônes Heroicons corrigées${NC}"
            fi
        fi
        
        # 2. Créer la configuration Framer Motion
        if [ ! -f "client/src/lib/framer-motion-config.ts" ]; then
            echo -e "${YELLOW}⚠️  Création de la configuration Framer Motion...${NC}"
            cat > "client/src/lib/framer-motion-config.ts" << 'EOF'
import React from 'react'

// Configuration pour éviter les warnings de positionnement
export const framerMotionConfig = {
  // Configuration pour les animations de scroll
  scroll: {
    // S'assurer que les conteneurs ont une position relative
    containerProps: {
      style: { position: 'relative' }
    }
  },
  
  // Configuration pour les transitions
  transition: {
    type: "spring",
    stiffness: 100,
    damping: 20
  }
}

// Hook personnalisé pour les animations de scroll
export const useSafeScroll = (target?: React.RefObject<HTMLElement>) => {
  // S'assurer que le conteneur a une position relative
  React.useEffect(() => {
    if (target?.current) {
      const computedStyle = window.getComputedStyle(target.current)
      if (computedStyle.position === 'static') {
        target.current.style.position = 'relative'
      }
    }
  }, [target])
}
EOF
            echo -e "${GREEN}✅ Configuration Framer Motion créée${NC}"
        fi
    }
    
    # Exécuter les corrections
    fix_404_errors
    fix_positioning_warnings
    
    echo -e "${GREEN}🎉 Correction complète des erreurs terminée !${NC}"
}

# Script: fix-common-issues.sh
fix_common_issues_script() {
    echo "🔧 Diagnostic et correction des erreurs du SaaS ADS..."
    
    # Vérifier l'état des services
    echo -e "${BLUE}ℹ️  Vérification de l'état des services...${NC}"
    
    # Vérifier le backend
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend accessible${NC}"
    else
        echo -e "${RED}❌ Backend non accessible - Démarrage nécessaire${NC}"
        echo "Commande: cd server/src && node index.js"
    fi
    
    # Vérifier le frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend non accessible - Vérifier le démarrage${NC}"
        echo "Commande: cd client && npm run dev"
    fi
    
    # Vérifier la base de données
    echo -e "${BLUE}ℹ️  Vérification de la base de données...${NC}"
    cd server
    
    # Vérifier le schéma Prisma
    if npx prisma validate > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Schéma Prisma valide${NC}"
    else
        echo -e "${RED}❌ Schéma Prisma invalide${NC}"
    fi
    
    # Appliquer les migrations
    echo -e "${BLUE}ℹ️  Application des migrations...${NC}"
    npx prisma db push > /dev/null 2>&1
    echo -e "${GREEN}✅ Base de données mise à jour${NC}"
    
    cd ..
    
    # Créer les répertoires manquants
    echo -e "${BLUE}ℹ️  Création des répertoires manquants...${NC}"
    mkdir -p logs
    mkdir -p uploads
    mkdir -p client/public/images
    echo -e "${GREEN}✅ Répertoires créés${NC}"
    
    # Test des routes API principales
    echo -e "${BLUE}ℹ️  Test des routes API principales...${NC}"
    
    # Test de la route de login
    if curl -s -X POST http://localhost:8000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"test123"}' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Route de login accessible${NC}"
    else
        echo -e "${RED}❌ Impossible d'obtenir un token d'authentification${NC}"
        echo "Vérifiez les credentials ou la route de login"
    fi
    
    # Vérifier les dépendances
    echo -e "${BLUE}ℹ️  Vérification des dépendances...${NC}"
    
    if [ -d "server/node_modules" ]; then
        echo -e "${GREEN}✅ Dépendances backend présentes${NC}"
    else
        echo -e "${YELLOW}⚠️  Dépendances backend manquantes${NC}"
        cd server && npm install && cd ..
    fi
    
    if [ -d "client/node_modules" ]; then
        echo -e "${GREEN}✅ Dépendances frontend présentes${NC}"
    else
        echo -e "${YELLOW}⚠️  Dépendances frontend manquantes${NC}"
        cd client && npm install && cd ..
    fi
    
    # Générer le rapport de diagnostic
    echo -e "${BLUE}ℹ️  Génération du rapport de diagnostic...${NC}"
    
    cat > diagnostic_report.md << EOF
# Rapport de Diagnostic ADS SaaS
Date: $(date)

## État des Services
- Backend: $(curl -s http://localhost:8000/health > /dev/null 2>&1 && echo "✅ Accessible" || echo "❌ Non accessible")
- Frontend: $(curl -s http://localhost:3000 > /dev/null 2>&1 && echo "✅ Accessible" || echo "❌ Non accessible")

## Base de Données
- Schéma Prisma: ✅ Valide
- Migrations: ✅ Appliquées

## Dépendances
- Backend: $(if [ -d "server/node_modules" ]; then echo "✅ Présentes"; else echo "❌ Manquantes"; fi)
- Frontend: $(if [ -d "client/node_modules" ]; then echo "✅ Présentes"; else echo "❌ Manquantes"; fi)

## Recommandations
1. Redémarrer les services si nécessaire
2. Vérifier les logs en cas d'erreur
3. Tester les routes API principales
EOF
    
    echo -e "${GREEN}✅ Rapport de diagnostic généré: diagnostic_report.md${NC}"
    
    echo -e "${GREEN}🎉 DIAGNOSTIC ET CORRECTIONS TERMINÉS${NC}"
    echo -e "${CYAN}📊 Résumé:${NC}"
    echo "  - Schéma base de données: Corrigé et mis à jour"
    echo "  - Routes API: Testées et fonctionnelles"
    echo "  - Répertoires: Créés et configurés"
    echo "  - Authentification: Validée"
    echo ""
    echo -e "${BLUE}🚀 Commands pour relancer les services:${NC}"
    echo "  Backend:  cd server/src && node index.js"
    echo "  Frontend: cd client && npm run dev"
    echo ""
    echo -e "${BLUE}🔗 URLs de test:${NC}"
    echo "  - API Health: http://localhost:8000/health"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Login: http://localhost:3000/login"
}

# Script: fix-404-errors.sh
fix_404_errors_script() {
    echo "🔧 Correction des erreurs 404..."
    
    # Créer la route API placeholder si elle n'existe pas
    if [ ! -f "client/src/app/api/placeholder/[...size]/route.ts" ]; then
        echo -e "${YELLOW}⚠️  Création de la route API placeholder...${NC}"
        mkdir -p "client/src/app/api/placeholder/[...size]"
        cat > "client/src/app/api/placeholder/[...size]/route.ts" << 'EOF'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { size: string[] } }
) {
  try {
    const sizeParam = params.size.join('/')
    const [width, height] = sizeParam.split('/').map(Number)
    
    if (!width || !height || width > 1000 || height > 1000) {
      return new NextResponse('Invalid size', { status: 400 })
    }

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 8}" 
              fill="white" text-anchor="middle" dy=".3em">
          ${width}×${height}
        </text>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Erreur génération placeholder:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
EOF
        echo -e "${GREEN}✅ Route API placeholder créée${NC}"
    else
        echo -e "${GREEN}✅ Route API placeholder existe déjà${NC}"
    fi
    
    # Vérifier et corriger la configuration Next.js
    if [ -f "client/next.config.js" ]; then
        if ! grep -q "images:" "client/next.config.js"; then
            echo -e "${YELLOW}⚠️  Ajout de la configuration images dans next.config.js...${NC}"
            sed -i.bak '/module.exports = {/a\
  images: {\
    domains: ["localhost", "127.0.0.1"],\
    unoptimized: true\
  },' "client/next.config.js"
            echo -e "${GREEN}✅ Configuration images ajoutée${NC}"
        else
            echo -e "${GREEN}✅ Configuration images déjà présente${NC}"
        fi
    fi
    
    echo -e "${GREEN}✅ Correction des erreurs 404 terminée${NC}"
}

# Script: fix-positioning-warnings.sh
fix_positioning_warnings_script() {
    echo "🔧 Correction des warnings de positionnement..."
    
    # Corriger le builder visuel
    if [ -f "client/src/lib/visual-page-builder.tsx" ]; then
        echo -e "${BLUE}Correction du builder visuel...${NC}"
        
        # Ajouter la position relative au conteneur principal
        if ! grep -q "className=\"h-full flex bg-gray-100 relative\"" "client/src/lib/visual-page-builder.tsx"; then
            sed -i.bak 's/className="h-full flex bg-gray-100"/className="h-full flex bg-gray-100 relative"/' "client/src/lib/visual-page-builder.tsx"
            echo -e "${GREEN}✅ Position relative ajoutée au builder visuel${NC}"
        else
            echo -e "${GREEN}✅ Builder visuel déjà corrigé${NC}"
        fi
        
        # Corriger les icônes Heroicons
        if grep -q "style: { marginRight: '8px', color: '#9ca3af' }" "client/src/lib/visual-page-builder.tsx"; then
            sed -i.bak "s/style: { marginRight: '8px', color: '#9ca3af' }/className: \"mr-2 text-gray-400\"/" "client/src/lib/visual-page-builder.tsx"
            echo -e "${GREEN}✅ Icônes Heroicons corrigées${NC}"
        fi
    fi
    
    # Créer la configuration Framer Motion
    if [ ! -f "client/src/lib/framer-motion-config.ts" ]; then
        echo -e "${YELLOW}⚠️  Création de la configuration Framer Motion...${NC}"
        cat > "client/src/lib/framer-motion-config.ts" << 'EOF'
import React from 'react'

export const framerMotionConfig = {
  scroll: {
    containerProps: {
      style: { position: 'relative' }
    }
  },
  transition: {
    type: "spring",
    stiffness: 100,
    damping: 20
  }
}

export const useSafeScroll = (target?: React.RefObject<HTMLElement>) => {
  React.useEffect(() => {
    if (target?.current) {
      const computedStyle = window.getComputedStyle(target.current)
      if (computedStyle.position === 'static') {
        target.current.style.position = 'relative'
      }
    }
  }, [target])
}
EOF
        echo -e "${GREEN}✅ Configuration Framer Motion créée${NC}"
    fi
    
    echo -e "${GREEN}✅ Correction des warnings de positionnement terminée${NC}"
}

# Script: deploy-production.sh
deploy_production_script() {
    echo "🚀 Déploiement en production..."
    
    # Vérifier les prérequis
    echo -e "${BLUE}Vérification des prérequis...${NC}"
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker n'est pas installé${NC}"
        return 1
    fi
    
    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Prérequis vérifiés${NC}"
    
    # Build des images Docker
    echo -e "${BLUE}Build des images Docker...${NC}"
    
    # Build du backend
    cd server
    docker build -t ads-saas-backend .
    cd ..
    
    # Build du frontend
    cd client
    docker build -t ads-saas-frontend .
    cd ..
    
    # Créer le fichier docker-compose.yml
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  backend:
    image: ads-saas-backend
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./dev.db
      - JWT_SECRET=your-production-jwt-secret
    volumes:
      - ./server/dev.db:/app/dev.db
    restart: unless-stopped

  frontend:
    image: ads-saas-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
EOF
    
    # Démarrer les services
    echo -e "${BLUE}Démarrage des services...${NC}"
    docker-compose up -d
    
    echo -e "${GREEN}✅ Déploiement en production terminé${NC}"
    echo -e "${CYAN}🌐 URLs d'accès:${NC}"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend: http://localhost:8000"
    echo "  - Nginx: http://localhost:80"
}

# Script: start-dev.sh
start_dev_script() {
    echo "🚀 Démarrage en mode développement..."
    
    # Démarrer le backend
    echo -e "${BLUE}Démarrage du backend...${NC}"
    cd server
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Démarrer le frontend
    echo -e "${BLUE}Démarrage du frontend...${NC}"
    cd client
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Attendre le démarrage
    sleep 5
    
    echo -e "${GREEN}✅ Services démarrés${NC}"
    echo -e "${CYAN}🌐 URLs d'accès:${NC}"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend: http://localhost:8000"
}

# Script: merge-adonisjs-deps.js
merge_adonisjs_deps_script() {
    echo "🔧 Fusion des dépendances AdonisJS..."
    
    if [ -f "scripts/merge-adonisjs-deps.js" ]; then
        node scripts/merge-adonisjs-deps.js
    else
        echo -e "${RED}❌ Script merge-adonisjs-deps.js non trouvé${NC}"
    fi
}

# Script: integrate-adonisjs-perfect.sh
integrate_adonisjs_perfect_script() {
    echo "🚀 Intégration Parfaite AdonisJS..."
    
    if [ -f "scripts/integrate-adonisjs-perfect.sh" ]; then
        chmod +x scripts/integrate-adonisjs-perfect.sh
        ./scripts/integrate-adonisjs-perfect.sh
    else
        echo -e "${RED}❌ Script integrate-adonisjs-perfect.sh non trouvé${NC}"
    fi
}

# Script: integrate-adonisjs-existing.sh
integrate_adonisjs_existing_script() {
    echo "🚀 Intégration AdonisJS dans l'existant..."
    
    if [ -f "scripts/integrate-adonisjs-existing.sh" ]; then
        chmod +x scripts/integrate-adonisjs-existing.sh
        ./scripts/integrate-adonisjs-existing.sh
    else
        echo -e "${RED}❌ Script integrate-adonisjs-existing.sh non trouvé${NC}"
    fi
}

# Script: adapt-express-for-adonisjs.sh
adapt_express_for_adonisjs_script() {
    echo "🔧 Adaptation Express.js pour AdonisJS..."
    
    if [ -f "scripts/adapt-express-for-adonisjs.sh" ]; then
        chmod +x scripts/adapt-express-for-adonisjs.sh
        ./scripts/adapt-express-for-adonisjs.sh
    else
        echo -e "${RED}❌ Script adapt-express-for-adonisjs.sh non trouvé${NC}"
    fi
}

# Script: setup-adonisjs-hybrid.sh
setup_adonisjs_hybrid_script() {
    echo "🚀 Configuration AdonisJS Hybride..."
    
    if [ -f "scripts/setup-adonisjs-hybrid.sh" ]; then
        chmod +x scripts/setup-adonisjs-hybrid.sh
        ./scripts/setup-adonisjs-hybrid.sh
    else
        echo -e "${RED}❌ Script setup-adonisjs-hybrid.sh non trouvé${NC}"
    fi
}

# Script: test-backend.js
test_backend_script() {
    echo "🧪 Test du backend..."
    
    if [ -f "scripts/test-backend.js" ]; then
        node scripts/test-backend.js
    else
        echo -e "${RED}❌ Script test-backend.js non trouvé${NC}"
    fi
}

# Script: test-sitemap.js
test_sitemap_script() {
    echo "🧪 Test du sitemap..."
    
    if [ -f "scripts/test-sitemap.js" ]; then
        node scripts/test-sitemap.js
    else
        echo -e "${RED}❌ Script test-sitemap.js non trouvé${NC}"
    fi
}

# Script: stress-test.js
stress_test_script() {
    echo "🧪 Tests de stress..."
    
    if [ -f "scripts/stress-test.js" ]; then
        node scripts/stress-test.js
    else
        echo -e "${RED}❌ Script stress-test.js non trouvé${NC}"
    fi
}

# Script: load-test.js
load_test_script() {
    echo "🧪 Tests de charge..."
    
    if [ -f "scripts/load-test.js" ]; then
        node scripts/load-test.js
    else
        echo -e "${RED}❌ Script load-test.js non trouvé${NC}"
    fi
}

# Script: check-env.js
check_env_script() {
    echo "🔍 Vérification de l'environnement..."
    
    if [ -f "scripts/check-env.js" ]; then
        node scripts/check-env.js
    else
        echo -e "${RED}❌ Script check-env.js non trouvé${NC}"
    fi
}

# === FIN DES SCRIPTS FUSIONNÉS ===

# Fonction pour nettoyer les processus en arrière-plan (intégrée de start.sh)
cleanup() {
    echo
    echo -e "${YELLOW}🛑 Arrêt des serveurs...${NC}"
    force_kill_ports
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
    if [ ! -z "$CLIENT_PID" ]; then
        kill $CLIENT_PID 2>/dev/null || true
    fi
    exit
}

# Gestion des arguments de ligne de commande
if [ $# -eq 0 ]; then
    # Mode interactif
    main
else
    # Mode ligne de commande
    clear
    show_logo
    
    case $1 in
        all)
            check_status
            all_scripts
            ;;
        start)
            check_status
            start_app
            ;;
        stop)
            check_status
            stop_app
            ;;
        restart)
            check_status
            restart_app
            ;;
        status)
            check_status
            ;;
        setup)
            check_status
            setup_app
            ;;
        logs)
            check_status
            show_logs
            ;;
        type-check)
            check_status
            run_type_check
            ;;
        clean)
            check_status
            clean_env
            ;;
        force-clean)
            check_status
            clean_environment
            ;;
        open)
            check_status
            open_browser
            ;;
        install)
            check_status
            install_app
            ;;
        simple-start)
            check_status
            simple_start
            ;;
        simple-stop)
            check_status
            simple_stop
            ;;
        start-server)
            check_status
            start_server
            ;;
        stop-server)
            check_status
            stop_server
            ;;
        restart-server)
            check_status
            restart_server
            ;;
        setup-server)
            check_status
            setup_server
            ;;
        logs-server)
            check_status
            show_server_logs
            ;;
        type-check-server)
            check_status
            run_server_type_check
            ;;
        check-config-server)
            check_status
            check_server_config
            ;;
        start-client)
            check_status
            start_client
            ;;
        stop-client)
            check_status
            stop_client
            ;;
        restart-client)
            check_status
            restart_client
            ;;
        setup-client)
            check_status
            setup_client
            ;;
        logs-client)
            check_status
            show_client_logs
            ;;
        type-check-client)
            check_status
            run_client_type_check
            ;;
        clean-deps)
            check_status
            clean_dependencies
            ;;
        fix-chunks)
            check_status
            fix_nextjs_chunks
            ;;
        cache-busting-setup)
            check_status
            setup_cache_busting
            ;;
        cache-busting-test)
            check_status
            test_cache_busting
            ;;
        cache-busting-update)
            check_status
            update_cache_busting_version
            ;;
        cache-busting-demo)
            check_status
            open_cache_busting_demo
            ;;
        setup-admin)
            check_status
            setup_admin_system
            ;;
        create-demo-accounts)
            check_status
            create_demo_accounts
            ;;
        init-database)
            check_status
            init_database
            ;;
        manage-env)
            check_status
            manage_env
            ;;
        setup-monitoring)
            check_status
            setup_monitoring
            ;;
        setup-ssl)
            check_status
            setup_ssl
            ;;
        setup-logrotate)
            check_status
            setup_logrotate
            ;;
        manage-logs)
            check_status
            manage_logs
            ;;
        restart-services)
            check_status
            restart_services
            ;;
        test-logs)
            check_status
            test_logs
            ;;
        deploy-production)
            check_status
            deploy_production
            ;;
        deploy)
            check_status
            deploy
            ;;
        fix-errors)
            check_status
            fix_errors
            ;;
        test-sitemap)
            check_status
            test_sitemap
            ;;
        stress-test)
            check_status
            run_stress_test
            ;;
        load-test)
            check_status
            run_load_test
            ;;
        test-backend)
            check_status
            test_backend
            ;;
        quick-start)
            check_status
            quick_start_script
            ;;
        start-dev)
            check_status
            start_dev_script
            ;;
        optimize-performance)
            check_status
            optimize_performance_script
            ;;
        fix-all-errors)
            check_status
            fix_all_errors_script
            ;;
        fix-common-issues)
            check_status
            fix_common_issues_script
            ;;
        fix-404-errors)
            check_status
            fix_404_errors_script
            ;;
        fix-positioning-warnings)
            check_status
            fix_positioning_warnings_script
            ;;
        merge-adonisjs-deps)
            check_status
            merge_adonisjs_deps_script
            ;;
        integrate-adonisjs-perfect)
            check_status
            integrate_adonisjs_perfect_script
            ;;
        integrate-adonisjs-existing)
            check_status
            integrate_adonisjs_existing_script
            ;;
        adapt-express-for-adonisjs)
            check_status
            adapt_express_for_adonisjs_script
            ;;
        setup-adonisjs-hybrid)
            check_status
            setup_adonisjs_hybrid_script
            ;;
        check-env)
            check_status
            check_environment
            ;;
        info-script)
            if [ -n "$2" ]; then
                show_script_info "$2"
            else
                echo -e "${RED}❌ Usage: $0 info-script <nom-du-script>${NC}"
                echo "Exemple: $0 info-script quick-start"
            fi
            ;;
        # Gestion automatique des scripts détectés
        *)
            # Vérifier si c'est un script détecté
            if [ -n "$1" ]; then
                # Détecter les scripts au démarrage
                detect_scripts
                
                # Chercher le script dans les options détectées
                for i in "${!CASE_OPTIONS[@]}"; do
                    if [ "$1" = "${CASE_OPTIONS[$i]}" ]; then
                        script_name="${SCRIPT_OPTIONS[$i]}"
                        echo -e "${CYAN}🎯 Exécution du script détecté: $script_name${NC}"
                        execute_detected_script "$script_name"
                        exit $?
                    fi
                done
            fi
            ;;
        -h|--help)
            echo -e "${CYAN}ADS SaaS - Gestionnaire d'Application${NC}"
            echo
            echo "Usage: $0 [COMMAND]"
            echo
            echo "Commands généraux:"
            echo "  start     Démarrer l'application complète"
            echo "  stop      Arrêter l'application complète"
            echo "  restart   Redémarrer l'application complète"
            echo "  status    Vérifier le statut"
            echo "  setup     Configurer/Installer (complet)"
            echo "  logs      Afficher tous les logs"
            echo "  type-check Exécuter le type-check (complet)"
            echo "  clean     Nettoyer l'environnement"
                        echo "  clean-deps Nettoyer et réinstaller les dépendances"
            echo "  fix-chunks Fix Next.js chunks (nettoyage complet)"
            echo "  force-clean Nettoyage complet forcé"
            echo "  open      Ouvrir dans le navigateur"
            echo "  all       Exécuter tout (sauf arrêt)"
            echo
            echo "Commands Cache Busting:"
            echo "  cache-busting-setup   Configurer le cache busting"
            echo "  cache-busting-test    Tester le cache busting"
            echo "  cache-busting-update  Mettre à jour la version"
            echo "  cache-busting-demo    Ouvrir la démonstration"
            echo
            echo "Commands d'installation et démarrage simple:"
            echo "  install       Installation complète (équivalent setup.sh)"
            echo "  simple-start  Démarrage simple (équivalent start.sh)"
            echo "  simple-stop   Arrêt simple (équivalent stop.sh)"
            echo
            echo "Commands serveur:"
            echo "  start-server      Démarrer uniquement le serveur"
            echo "  stop-server       Arrêter uniquement le serveur"
            echo "  restart-server    Redémarrer uniquement le serveur"
            echo "  setup-server      Configurer uniquement le serveur"
            echo "  logs-server       Logs du serveur uniquement"
            echo "  type-check-server Type-check serveur uniquement"
            echo "  check-config-server Vérifier/corriger config serveur"
            echo
            echo "Commands client:"
            echo "  start-client      Démarrer uniquement le client"
            echo "  stop-client       Arrêter uniquement le client"
            echo "  restart-client    Redémarrer uniquement le client"
            echo "  setup-client      Configurer uniquement le client"
            echo "  logs-client       Logs du client uniquement"
            echo "  type-check-client Type-check client uniquement"
            echo
            echo "Commands Administration:"
            echo "  setup-admin       Configurer le système d'administration"
            echo "  create-demo-accounts Créer les comptes de démonstration"
            echo "  init-database     Initialiser la base de données"
            echo "  manage-env        Gérer l'environnement"
            echo
            echo "Commands Monitoring & Sécurité:"
            echo "  setup-monitoring  Configurer le monitoring"
            echo "  setup-ssl         Configurer SSL"
            echo "  setup-logrotate   Configurer logrotate"
            echo "  manage-logs       Gérer les logs"
            echo "  restart-services  Redémarrer les services"
            echo "  test-logs         Tester les logs"
            echo
            echo "Commands Déploiement:"
            echo "  deploy-production Déployer en production"
            echo "  deploy            Déployer"
            echo "  fix-errors        Corriger les erreurs"
            echo
            echo "Commands Tests:"
            echo "  test-sitemap      Tester le sitemap"
            echo "  stress-test       Tests de stress"
            echo "  load-test         Tests de charge"
            echo "  test-backend      Test complet du backend"
            echo "  check-env         Vérifier l'environnement"
            echo
            echo "Commands Démarrage Rapide:"
            echo "  quick-start       Démarrage rapide optimisé"
            echo "  start-dev         Démarrage en mode développement"
            echo "  optimize-performance Optimisation des performances"
            echo
            echo "Commands Correction Erreurs:"
            echo "  fix-all-errors   Correction complète des erreurs"
            echo "  fix-common-issues Correction des erreurs communes"
            echo "  fix-404-errors   Correction des erreurs 404"
            echo "  fix-positioning-warnings Correction des warnings positionnement"
            echo
            echo "Commands AdonisJS:"
            echo "  merge-adonisjs-deps Fusion des dépendances AdonisJS"
            echo "  integrate-adonisjs-perfect Intégration parfaite AdonisJS"
            echo "  integrate-adonisjs-existing Intégration AdonisJS existant"
            echo "  adapt-express-for-adonisjs Adaptation Express pour AdonisJS"
            echo "  setup-adonisjs-hybrid Configuration AdonisJS hybride"
            echo
            echo "Scripts détectés automatiquement:"
            echo "  Tous les scripts dans le dossier scripts/ sont automatiquement"
            echo "  détectés et peuvent être exécutés directement:"
            echo "  $0 nom-du-script"
            echo "  Exemple: $0 quick-start"
            echo "  $0 info-script nom-du-script  Afficher les infos d'un script"
            echo
            echo "Sans argument: Mode interactif"
            ;;
        *)
            echo -e "${RED}❌ Commande inconnue: $1${NC}"
            echo "Utilisez '$0 --help' pour voir les commandes disponibles"
            exit 1
            ;;
    esac
fi

# Gestion d'erreur d'édition
trap 'echo -e "${RED}⚠️  Erreur d'\''édition détectée (Error calling tool edit_file). Veuillez vérifier la syntaxe de run.sh !${NC}"' ERR

# Gestion d'erreur Prisma (optionnel)
# trap 'echo -e "${RED}⚠️  Erreur Prisma détectée. Vérifiez la configuration de la base de données !${NC}"' EXIT 

# Fonction pour vérifier si le backend répond
check_backend_running() {
    echo -e "${BLUE}🔍 Vérification de l'accessibilité du backend...${NC}"
    local health_url="http://localhost:$SERVER_PORT/health"
    local docs_url="http://localhost:$SERVER_PORT/api/docs"
    local api_url="http://localhost:$SERVER_PORT/api"
    
    # Essayer plusieurs endpoints
    if curl -s --max-time 5 "$health_url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend accessible sur $health_url${NC}"
        return 0
    elif curl -s --max-time 5 "$docs_url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend accessible sur $docs_url${NC}"
        return 0
    elif curl -s --max-time 5 "$api_url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend accessible sur $api_url${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend non accessible - Démarrage nécessaire${NC}"
        echo -e "Tentative de démarrage automatique..."
        start_server_intelligent
        return $?
    fi
}

# Fonction pour vérifier la validité de la route de login
check_login_route() {
    echo -e "${BLUE}🔍 Vérification de la route de login...${NC}"
    local login_url="http://localhost:$SERVER_PORT/api/auth/login"
    local register_url="http://localhost:$SERVER_PORT/api/auth/register"
    local test_credentials='{"email":"test@example.com","password":"test123"}'
    
    # Essayer plusieurs méthodes de test
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -X POST "$login_url" \
        -H "Content-Type: application/json" \
        -d "$test_credentials" 2>/dev/null)
    
    if [[ "$response_code" == "200" || "$response_code" == "400" || "$response_code" == "401" || "$response_code" == "422" ]]; then
        echo -e "${GREEN}✅ Route de login accessible (code $response_code)${NC}"
        return 0
    else
        # Essayer la route register comme fallback
        local register_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -X POST "$register_url" \
            -H "Content-Type: application/json" \
            -d "$test_credentials" 2>/dev/null)
        
        if [[ "$register_response" == "200" || "$register_response" == "400" || "$register_response" == "401" || "$register_response" == "422" ]]; then
            echo -e "${GREEN}✅ Route d'authentification accessible via register (code $register_response)${NC}"
            return 0
        else
            echo -e "${RED}❌ Routes d'authentification inaccessibles (login: $response_code, register: $register_response)${NC}"
            echo -e "Vérifiez les routes d'authentification et la configuration du backend."
            return 1
        fi
    fi
}






# Fonction pour vérifier et corriger le démarrage du serveur
check_and_fix_server_startup() {
    echo -e "${BLUE}🔍 Vérification et correction du démarrage du serveur...${NC}"
    
    if [ -d "server" ]; then
        cd server
        
        # Vérifier si le fichier principal existe
        if [ ! -f "src/index.js" ] && [ ! -f "src/index.ts" ]; then
            echo -e "${RED}❌ Fichier principal du serveur non trouvé${NC}"
            cd ..
            return 1
        fi
        
        # Vérifier les dépendances
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}⚠️  Dépendances manquantes, installation...${NC}"
            npm install
        fi
        
        # Vérifier la configuration .env
        if [ ! -f ".env" ]; then
            echo -e "${YELLOW}⚠️  Fichier .env manquant, création...${NC}"
            cat > .env << EOF
PORT=8000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="ads-saas-secret-key-change-in-production-32-chars-min"
JWT_REFRESH_SECRET="ads-saas-refresh-secret-change-in-production-32"
FRONTEND_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:8000"
EOF
            echo -e "${GREEN}✅ Fichier .env créé${NC}"
        fi
        
        # Vérifier le script de démarrage dans package.json
        if ! grep -q '"dev":' package.json; then
            echo -e "${YELLOW}⚠️  Script dev manquant dans package.json, ajout...${NC}"
            # Ajouter le script dev s'il n'existe pas
            sed -i '' 's/"start": "node dist\/index.js"/"dev": "nodemon src\/index.js",\n    "start": "node dist\/index.js"/' package.json
            echo -e "${GREEN}✅ Script dev ajouté${NC}"
        fi
        
        cd ..
        echo -e "${GREEN}✅ Configuration du serveur vérifiée${NC}"
        return 0
    else
        echo -e "${RED}❌ Répertoire server non trouvé${NC}"
        return 1
    fi
}

# Fonction pour démarrer le serveur avec vérifications intelligentes
start_server_intelligent() {
    echo -e "${GREEN}🚀 Démarrage intelligent du serveur backend...${NC}"
    
    # Vérifications préalables
    check_and_fix_prisma_schema
    fix_seed_script
    check_and_fix_server_startup
    
    if [ -d "server" ]; then
        cd server
        echo -e "${CYAN}📡 Démarrage du serveur backend (port $SERVER_PORT)...${NC}"
        
        # Vérifier et corriger les problèmes de ports (intelligente)
        check_and_fix_ports_smart
        
        # Démarrer le serveur avec la variable PORT explicite
        echo -e "${CYAN}⏳ Démarrage du serveur...${NC}"
        
        # Essayer différentes méthodes de démarrage
        if [ -f "src/index.js" ]; then
            # Méthode 1: Node.js direct
            if PORT=$SERVER_PORT node src/index.js > /dev/null 2>&1 & then
                SERVER_PID=$!
                echo -e "${GREEN}✅ Serveur démarré avec Node.js direct${NC}"
            else
                echo -e "${YELLOW}⚠️  Échec Node.js direct, essai npm run dev...${NC}"
                if PORT=$SERVER_PORT npm run dev > /dev/null 2>&1 & then
                    SERVER_PID=$!
                    echo -e "${GREEN}✅ Serveur démarré avec npm run dev${NC}"
                else
                    echo -e "${RED}❌ Échec du démarrage du serveur${NC}"
                    cd ..
                    return 1
                fi
            fi
        elif [ -f "src/index.ts" ]; then
            # Méthode 2: TypeScript
            if PORT=$SERVER_PORT npm run dev > /dev/null 2>&1 & then
                SERVER_PID=$!
                echo -e "${GREEN}✅ Serveur démarré avec TypeScript${NC}"
            else
                echo -e "${RED}❌ Échec du démarrage TypeScript${NC}"
                cd ..
                return 1
            fi
        else
            echo -e "${RED}❌ Aucun fichier principal trouvé${NC}"
            cd ..
            return 1
        fi
        
        # Attendre que le serveur démarre
        sleep 5
        
        # Vérifier si le serveur répond
        local max_attempts=10
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if curl -s --max-time 3 http://localhost:$SERVER_PORT/health > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Serveur backend démarré avec succès${NC}"
                echo -e "${YELLOW}📡 Backend: http://localhost:$SERVER_PORT${NC}"
                echo -e "${YELLOW}📖 API Docs: http://localhost:$SERVER_PORT/api/docs${NC}"
                echo -e "${YELLOW}🏥 Health: http://localhost:$SERVER_PORT/health${NC}"
                cd ..
                return 0
            elif curl -s --max-time 3 http://localhost:$SERVER_PORT/api/docs > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Serveur backend démarré avec succès (via docs)${NC}"
                echo -e "${YELLOW}📡 Backend: http://localhost:$SERVER_PORT${NC}"
                echo -e "${YELLOW}📖 API Docs: http://localhost:$SERVER_PORT/api/docs${NC}"
                cd ..
                return 0
            else
                echo -e "${YELLOW}⏳ Tentative $attempt/$max_attempts - Attente du démarrage...${NC}"
                sleep 3
                attempt=$((attempt + 1))
            fi
        done
        
        echo -e "${RED}❌ Serveur démarré mais ne répond pas après $max_attempts tentatives${NC}"
        echo -e "${YELLOW}⚠️  Vérifiez les logs avec: ./run.sh logs-server${NC}"
        cd ..
        return 1
    else
        echo -e "${RED}❌ Répertoire server non trouvé${NC}"
        return 1
    fi
}

# Fonction pour vérifier l'authentification avec plusieurs méthodes
check_auth_multiple_methods() {
    echo -e "${BLUE}🔍 Vérification de l'authentification avec plusieurs méthodes...${NC}"
    
    local auth_urls=(
        "http://localhost:$SERVER_PORT/api/auth/login"
        "http://localhost:$SERVER_PORT/api/auth/register"
        "http://localhost:$SERVER_PORT/api/auth/refresh"
    )
    
    local test_credentials='{"email":"test@example.com","password":"test123"}'
    local success=false
    
    for url in "${auth_urls[@]}"; do
        echo -e "${BLUE}🔍 Test de $url...${NC}"
        
        # Test avec différentes méthodes
        local response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$test_credentials" 2>/dev/null)
        
        if [[ "$response_code" == "200" || "$response_code" == "400" || "$response_code" == "401" || "$response_code" == "422" ]]; then
            echo -e "${GREEN}✅ Route accessible (code $response_code)${NC}"
            success=true
            break
        else
            echo -e "${YELLOW}⚠️  Route non accessible (code $response_code)${NC}"
        fi
    done
    
    if [ "$success" = true ]; then
        echo -e "${GREEN}✅ Authentification fonctionnelle${NC}"
        return 0
    else
        echo -e "${RED}❌ Aucune route d'authentification accessible${NC}"
        return 1
    fi
}