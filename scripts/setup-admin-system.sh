#!/bin/bash

# Script d'initialisation du système d'administration ADS
# Ce script configure la base de données, crée l'utilisateur admin et génère les données de test

set -e

echo "🚀 Initialisation du système d'administration ADS..."
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    print_error "Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

print_status "Vérification de l'environnement..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé"
    exit 1
fi

print_success "Node.js détecté: $(node --version)"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
fi

print_success "npm détecté: $(npm --version)"

# Aller dans le répertoire server
cd server

print_status "Configuration de la base de données..."

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    print_status "Installation des dépendances serveur..."
    npm install
fi

# Générer le client Prisma
print_status "Génération du client Prisma..."
npx prisma generate

# Application des migrations de base de données (remplacé par db push)
print_status "(RESET) Synchronisation du schéma Prisma avec la base SQLite..."
if [ -f "dev.db" ]; then
    print_warning "Base existante supprimée pour éviter les conflits."
    rm -f dev.db
fi
npx prisma db push --force-reset

print_success "Base de données configurée"

# Créer l'utilisateur administrateur
print_status "Création de l'utilisateur administrateur..."
node scripts/create-admin-user.js

# Générer les données de test
print_status "Génération des données de test..."
node scripts/seed-test-data.js

# Retourner à la racine
cd ..

# Installer les dépendances client si nécessaire
if [ ! -d "client/node_modules" ]; then
    print_status "Installation des dépendances client..."
    cd client
    npm install
    cd ..
fi

print_success "Système d'administration initialisé avec succès!"
echo ""
echo "📋 Récapitulatif:"
echo "   ✅ Base de données configurée"
echo "   ✅ Utilisateur administrateur créé"
echo "   ✅ Données de test générées"
echo "   ✅ Dépendances installées"
echo ""
echo "🔑 Identifiants d'accès:"
echo "   👤 Admin: admin@ads-saas.com / ADS2024Secure!"
echo "   👤 Test: john.doe@example.com / password123"
echo ""
echo "🌐 URLs d'accès:"
echo "   🏠 Application: http://localhost:3000"
echo "   🔧 Admin: http://localhost:3000/admin/login"
echo "   📊 API: http://localhost:8000"
echo ""
echo "🚀 Pour démarrer le système:"
echo "   npm run dev"
echo ""
print_warning "IMPORTANT: Changez les mots de passe par défaut en production!" 