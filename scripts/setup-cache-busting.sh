#!/bin/bash

# Script de configuration du Cache Busting pour ADS SaaS
# Configure automatiquement les variables d'environnement et les paramètres

set -e

echo "🔄 Configuration du Cache Busting pour ADS SaaS..."
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
    log_error "Ce script doit être exécuté depuis la racine du projet ADS SaaS"
    exit 1
fi

# Configuration des variables d'environnement
log_info "Configuration des variables d'environnement..."

# Générer une version unique basée sur le timestamp
APP_VERSION=$(date +%s)
BUILD_HASH=$(echo $APP_VERSION | md5sum | cut -d' ' -f1 | cut -c1-8)

# Créer ou mettre à jour le fichier .env
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    log_warning "Fichier .env non trouvé, création d'un nouveau fichier..."
    touch "$ENV_FILE"
fi

# Fonction pour ajouter ou mettre à jour une variable d'environnement
update_env_var() {
    local key=$1
    local value=$2
    local file=$3
    
    if grep -q "^${key}=" "$file"; then
        # Variable existe, la mettre à jour
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^${key}=.*/${key}=${value}/" "$file"
        else
            # Linux
            sed -i "s/^${key}=.*/${key}=${value}/" "$file"
        fi
        log_success "Variable ${key} mise à jour"
    else
        # Variable n'existe pas, l'ajouter
        echo "${key}=${value}" >> "$file"
        log_success "Variable ${key} ajoutée"
    fi
}

# Ajouter les variables de cache busting
update_env_var "NEXT_PUBLIC_VERSION_MODE" "build" "$ENV_FILE"
update_env_var "NEXT_PUBLIC_APP_VERSION" "$APP_VERSION" "$ENV_FILE"
update_env_var "NEXT_PUBLIC_BUILD_HASH" "$BUILD_HASH" "$ENV_FILE"

# Configuration pour le développement
DEV_ENV_FILE=".env.development"
if [ ! -f "$DEV_ENV_FILE" ]; then
    log_info "Création du fichier .env.development..."
    cat > "$DEV_ENV_FILE" << EOF
# Configuration de développement pour le cache busting
NEXT_PUBLIC_VERSION_MODE=timestamp
NEXT_PUBLIC_APP_VERSION=$APP_VERSION
NEXT_PUBLIC_BUILD_HASH=$BUILD_HASH
EOF
    log_success "Fichier .env.development créé"
fi

# Configuration pour la production
PROD_ENV_FILE=".env.production"
if [ ! -f "$PROD_ENV_FILE" ]; then
    log_info "Création du fichier .env.production..."
    cat > "$PROD_ENV_FILE" << EOF
# Configuration de production pour le cache busting
NEXT_PUBLIC_VERSION_MODE=build
NEXT_PUBLIC_APP_VERSION=$APP_VERSION
NEXT_PUBLIC_BUILD_HASH=$BUILD_HASH
EOF
    log_success "Fichier .env.production créé"
fi

# Vérifier la configuration Next.js
log_info "Vérification de la configuration Next.js..."

NEXT_CONFIG="client/next.config.js"
if [ -f "$NEXT_CONFIG" ]; then
    if grep -q "Cache-Control" "$NEXT_CONFIG"; then
        log_success "Configuration Next.js déjà configurée pour le cache busting"
    else
        log_warning "Configuration Next.js nécessite une mise à jour manuelle"
        echo "Ajoutez les headers de cache busting dans client/next.config.js"
    fi
else
    log_error "Fichier next.config.js non trouvé"
fi

# Vérifier le middleware
log_info "Vérification du middleware..."

MIDDLEWARE_FILE="client/src/middleware.ts"
if [ -f "$MIDDLEWARE_FILE" ]; then
    if grep -q "cache busting" "$MIDDLEWARE_FILE"; then
        log_success "Middleware de cache busting déjà configuré"
    else
        log_warning "Middleware nécessite une configuration manuelle"
    fi
else
    log_warning "Fichier middleware.ts non trouvé, création recommandée"
fi

# Créer un script de test du cache busting
log_info "Création d'un script de test..."

TEST_SCRIPT="scripts/test-cache-busting.sh"
cat > "$TEST_SCRIPT" << 'EOF'
#!/bin/bash

# Script de test du cache busting
echo "🧪 Test du Cache Busting..."

# Vérifier les variables d'environnement
echo "Variables d'environnement:"
echo "NEXT_PUBLIC_VERSION_MODE: $NEXT_PUBLIC_VERSION_MODE"
echo "NEXT_PUBLIC_APP_VERSION: $NEXT_PUBLIC_APP_VERSION"
echo "NEXT_PUBLIC_BUILD_HASH: $NEXT_PUBLIC_BUILD_HASH"

# Tester les URLs avec version
echo ""
echo "URLs de test:"
echo "Image: /images/logo.png?v=$NEXT_PUBLIC_APP_VERSION"
echo "CSS: /styles/main.css?v=$NEXT_PUBLIC_APP_VERSION"
echo "JS: /scripts/app.js?v=$NEXT_PUBLIC_APP_VERSION"

echo ""
echo "✅ Test terminé"
EOF

chmod +x "$TEST_SCRIPT"
log_success "Script de test créé: $TEST_SCRIPT"

# Créer un script de mise à jour de version
log_info "Création d'un script de mise à jour de version..."

UPDATE_SCRIPT="scripts/update-version.sh"
cat > "$UPDATE_SCRIPT" << 'EOF'
#!/bin/bash

# Script de mise à jour de version pour le cache busting
echo "🔄 Mise à jour de la version..."

# Générer une nouvelle version
NEW_VERSION=$(date +%s)
NEW_HASH=$(echo $NEW_VERSION | md5sum | cut -d' ' -f1 | cut -c1-8)

# Mettre à jour les fichiers .env
for env_file in .env .env.development .env.production; do
    if [ -f "$env_file" ]; then
        sed -i "s/NEXT_PUBLIC_APP_VERSION=.*/NEXT_PUBLIC_APP_VERSION=$NEW_VERSION/" "$env_file"
        sed -i "s/NEXT_PUBLIC_BUILD_HASH=.*/NEXT_PUBLIC_BUILD_HASH=$NEW_HASH/" "$env_file"
        echo "✅ $env_file mis à jour"
    fi
done

echo "Nouvelle version: $NEW_VERSION"
echo "Nouveau hash: $NEW_HASH"
echo "✅ Mise à jour terminée"
EOF

chmod +x "$UPDATE_SCRIPT"
log_success "Script de mise à jour créé: $UPDATE_SCRIPT"

# Instructions d'utilisation
echo ""
echo "🎉 Configuration du Cache Busting terminée !"
echo "============================================="
echo ""
echo "📋 Prochaines étapes:"
echo "1. Redémarrez votre application: ./scripts/quick-start.sh"
echo "2. Testez le cache busting: ./scripts/test-cache-busting.sh"
echo "3. Pour mettre à jour la version: ./scripts/update-version.sh"
echo ""
echo "🔧 Utilisation dans votre code:"
echo "import { VersionedImage, useVersionedUrl } from './lib/versioned-asset';"
echo "import { useCacheBuster } from './lib/cache-buster';"
echo ""
echo "📖 Documentation:"
echo "- Composants: VersionedImage, VersionedAsset, VersionedScript, VersionedLink"
echo "- Hooks: useVersionedUrl, useVersionedUrls, useCacheBuster"
echo "- Middleware: Automatique pour tous les assets statiques"
echo ""
echo "⚙️  Configuration:"
echo "- Mode: $NEXT_PUBLIC_VERSION_MODE"
echo "- Version: $APP_VERSION"
echo "- Hash: $BUILD_HASH"
echo ""

log_success "Configuration terminée avec succès !" 