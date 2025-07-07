#!/bin/bash

# ========================================
# Gestionnaire de Variables d'Environnement ADS SaaS
# ========================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonctions utilitaires
error() {
    echo -e "${RED}❌ Erreur: $1${NC}" >&2
    exit 1
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Vérifier que nous sommes à la racine du projet
if [ ! -f ".env.example" ]; then
    error "Ce script doit être exécuté depuis la racine du projet ADS"
fi

# Fonction pour afficher le menu principal
show_menu() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║           Gestionnaire de Variables d'Environnement       ║"
    echo "║                    ADS SaaS                               ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo "📋 Que voulez-vous faire ?"
    echo "1) 🔧 Créer/Configurer le fichier .env"
    echo "2) 📝 Éditer le fichier .env"
    echo "3) 👀 Afficher le contenu du fichier .env"
    echo "4) 🔍 Vérifier la configuration"
    echo "5) 🔍 Vérifier la configuration des applications"
    echo "6) 📋 Afficher toutes les variables disponibles"
    echo "7) 🧪 Tester la configuration"
    echo "8) 🚪 Quitter"
    echo
}

# Fonction pour créer/configurer le fichier .env
setup_env() {
    info "Configuration du fichier .env..."
    
    if [ -f ".env" ]; then
        warning "Le fichier .env existe déjà"
        read -p "Voulez-vous le sauvegarder et créer un nouveau ? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
            success "Sauvegarde créée"
        else
            info "Configuration annulée"
            return
        fi
    fi
    
    cp .env.example .env
    success "Fichier .env créé à partir de .env.example"
    
    warning "N'oubliez pas de modifier le fichier .env avec vos vraies valeurs !"
    echo "Variables importantes à configurer :"
    echo "  - JWT_SECRET (clé secrète pour les tokens JWT)"
    echo "  - DATABASE_URL (URL de votre base de données)"
    echo "  - STRIPE_SECRET_KEY (si vous utilisez Stripe)"
    echo "  - SMTP_* (si vous utilisez l'envoi d'emails)"
}

# Fonction pour éditer le fichier .env
edit_env() {
    if [ ! -f ".env" ]; then
        error "Le fichier .env n'existe pas. Utilisez l'option 1 pour le créer."
    fi
    
    info "Ouverture du fichier .env dans l'éditeur..."
    
    # Détecter l'éditeur préféré
    if command -v code &> /dev/null; then
        code .env
    elif command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    else
        error "Aucun éditeur de texte trouvé. Ouvrez manuellement le fichier .env"
    fi
}

# Fonction pour afficher le contenu du fichier .env
show_env() {
    if [ ! -f ".env" ]; then
        error "Le fichier .env n'existe pas"
    fi
    
    echo -e "${CYAN}Contenu du fichier .env :${NC}"
    echo "═══════════════════════════════════════════════════════════"
    cat .env
    echo "═══════════════════════════════════════════════════════════"
}

# Fonction pour vérifier la configuration
check_config() {
    info "Vérification de la configuration..."
    
    # Vérifier l'existence des fichiers
    if [ ! -f ".env" ]; then
        error "Fichier .env manquant"
    fi
    
    # Vérifier que les applications sont configurées pour utiliser le fichier .env à la racine
    if grep -q "dotenv.*config.*path.*\.\./\.env" server/src/index.js; then
        success "Serveur configuré pour utiliser .env à la racine"
    else
        warning "Serveur non configuré pour utiliser .env à la racine"
    fi
    
    if grep -q "dotenv.*config.*path.*\.\./\.env" client/next.config.js; then
        success "Client configuré pour utiliser .env à la racine"
    else
        warning "Client non configuré pour utiliser .env à la racine"
    fi
    
    # Vérifier les variables importantes
    source .env 2>/dev/null || warning "Impossible de charger le fichier .env"
    
    if [ -z "$JWT_SECRET" ]; then
        warning "JWT_SECRET non défini"
    else
        success "JWT_SECRET défini"
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        warning "DATABASE_URL non défini"
    else
        success "DATABASE_URL défini"
    fi
    
    if [ -z "$PORT" ]; then
        warning "PORT non défini"
    else
        success "PORT défini: $PORT"
    fi
    
    success "Vérification terminée"
}

# Fonction pour vérifier la configuration des applications
check_app_config() {
    info "Vérification de la configuration des applications..."
    
    # Vérifier le serveur
    if grep -q "dotenv.*config.*path.*\.\./\.env" server/src/index.js; then
        success "Serveur configuré pour utiliser .env à la racine"
    else
        warning "Serveur non configuré pour utiliser .env à la racine"
        echo "Ajoutez: require('dotenv').config({ path: '../.env' }); au début de server/src/index.js"
    fi
    
    # Vérifier le client
    if grep -q "dotenv.*config.*path.*\.\./\.env" client/next.config.js; then
        success "Client configuré pour utiliser .env à la racine"
    else
        warning "Client non configuré pour utiliser .env à la racine"
        echo "Ajoutez: require('dotenv').config({ path: '../.env' }); au début de client/next.config.js"
    fi
    
    success "Vérification terminée"
}

# Fonction pour afficher toutes les variables disponibles
show_variables() {
    echo -e "${CYAN}Variables d'environnement disponibles :${NC}"
    echo "═══════════════════════════════════════════════════════════"
    echo "🔧 Configuration générale :"
    echo "  NODE_ENV              - Environnement (development/production)"
    echo "  PORT                  - Port du serveur backend"
    echo
    echo "🗄️  Base de données :"
    echo "  DATABASE_URL          - URL de connexion à la base de données"
    echo
    echo "🔐 Authentification :"
    echo "  JWT_SECRET            - Clé secrète pour les tokens JWT"
    echo "  JWT_REFRESH_SECRET    - Clé secrète pour les refresh tokens"
    echo "  JWT_EXPIRES_IN        - Durée de validité des tokens"
    echo "  NEXTAUTH_SECRET       - Clé secrète pour NextAuth.js"
    echo
    echo "🌐 URLs :"
    echo "  FRONTEND_URL          - URL du frontend"
    echo "  NEXT_PUBLIC_API_URL   - URL de l'API (public)"
    echo "  NEXTAUTH_URL          - URL pour NextAuth.js"
    echo
    echo "💳 Stripe (optionnel) :"
    echo "  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY - Clé publique Stripe"
    echo "  STRIPE_SECRET_KEY     - Clé secrète Stripe"
    echo "  STRIPE_WEBHOOK_SECRET - Secret webhook Stripe"
    echo
    echo "📧 Email (optionnel) :"
    echo "  SMTP_HOST             - Serveur SMTP"
    echo "  SMTP_PORT             - Port SMTP"
    echo "  SMTP_USER             - Utilisateur SMTP"
    echo "  SMTP_PASS             - Mot de passe SMTP"
    echo
    echo "🌍 Traduction (optionnel) :"
    echo "  GOOGLE_TRANSLATE_API_KEY - Clé API Google Translate"
    echo "  LIBRETRANSLATE_URL    - URL LibreTranslate"
    echo "  LIBRETRANSLATE_API_KEY - Clé API LibreTranslate"
    echo
    echo "🔒 CORS :"
    echo "  CORS_ORIGIN           - Origine autorisée pour CORS"
    echo "═══════════════════════════════════════════════════════════"
}

# Fonction pour tester la configuration
test_config() {
    info "Test de la configuration..."
    
    if [ ! -f ".env" ]; then
        error "Fichier .env manquant"
    fi
    
    # Charger les variables
    source .env 2>/dev/null || error "Erreur lors du chargement du fichier .env"
    
    # Tests basiques
    echo "🔍 Tests de configuration :"
    
    if [ "$NODE_ENV" = "development" ] || [ "$NODE_ENV" = "production" ]; then
        success "NODE_ENV: $NODE_ENV"
    else
        warning "NODE_ENV: $NODE_ENV (devrait être 'development' ou 'production')"
    fi
    
    if [[ "$PORT" =~ ^[0-9]+$ ]] && [ "$PORT" -gt 0 ] && [ "$PORT" -lt 65536 ]; then
        success "PORT: $PORT"
    else
        warning "PORT: $PORT (devrait être un nombre entre 1 et 65535)"
    fi
    
    if [ -n "$JWT_SECRET" ]; then
        if [ ${#JWT_SECRET} -ge 32 ]; then
            success "JWT_SECRET: OK (${#JWT_SECRET} caractères)"
        else
            warning "JWT_SECRET: Trop court (${#JWT_SECRET} caractères, minimum 32)"
        fi
    else
        warning "JWT_SECRET: Non défini"
    fi
    
    if [ -n "$DATABASE_URL" ]; then
        success "DATABASE_URL: Défini"
    else
        warning "DATABASE_URL: Non défini"
    fi
    
    success "Tests terminés"
}

# Boucle principale
while true; do
    show_menu
    read -p "Votre choix (1-8): " -n 1 -r
    echo
    echo
    
    case $REPLY in
        1)
            setup_env
            ;;
        2)
            edit_env
            ;;
        3)
            show_env
            ;;
        4)
            check_config
            ;;
        5)
            check_app_config
            ;;
        6)
            show_variables
            ;;
        7)
            test_config
            ;;
        8)
            info "Au revoir !"
            exit 0
            ;;
        *)
            error "Choix invalide. Veuillez choisir un nombre entre 1 et 8."
            ;;
    esac
    
    echo
    read -p "Appuyez sur Entrée pour continuer..."
    echo
done 