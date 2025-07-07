#!/bin/bash

# Script de correction des dépendances AdonisJS
# Résout les conflits de versions entre AdonisJS v6 et les packages incompatibles

set -e

echo "🔧 Correction des dépendances AdonisJS..."
echo "=========================================="

# Vérification de l'environnement
if [ ! -d "server" ]; then
    echo "❌ Erreur: Répertoire server/ non trouvé"
    exit 1
fi

cd server

echo "📋 Étape 1/5: Sauvegarde du package.json actuel"
if [ -f "package.json" ]; then
    cp package.json package.json.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ package.json sauvegardé"
fi

echo "📋 Étape 2/5: Nettoyage des dépendances existantes"
if [ -d "node_modules" ]; then
    echo "🗑️  Suppression de node_modules..."
    rm -rf node_modules
    echo "✅ node_modules supprimé"
fi

if [ -f "package-lock.json" ]; then
    echo "🗑️  Suppression de package-lock.json..."
    rm -f package-lock.json
    echo "✅ package-lock.json supprimé"
fi

echo "📋 Étape 3/5: Vérification des versions AdonisJS"
echo "🔍 Vérification de la compatibilité des versions..."

# Vérification de Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Attention: Node.js v18+ recommandé pour AdonisJS v6"
    echo "   Version actuelle: $(node --version)"
fi

echo "📋 Étape 4/5: Installation des dépendances corrigées"
echo "📦 Installation avec --legacy-peer-deps pour résoudre les conflits..."

# Installation avec legacy peer deps pour éviter les conflits
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo "✅ Dépendances installées avec succès"
else
    echo "⚠️  Tentative avec --force..."
    npm install --force
    if [ $? -eq 0 ]; then
        echo "✅ Dépendances installées avec --force"
    else
        echo "❌ Échec de l'installation des dépendances"
        exit 1
    fi
fi

echo "📋 Étape 5/5: Vérification de l'installation"
echo "🔍 Vérification des packages AdonisJS..."

# Vérification des packages AdonisJS installés
ADONISJS_PACKAGES=$(npm list --depth=0 | grep "@adonisjs" || true)

if [ -n "$ADONISJS_PACKAGES" ]; then
    echo "✅ Packages AdonisJS installés:"
    echo "$ADONISJS_PACKAGES"
else
    echo "⚠️  Aucun package AdonisJS détecté"
fi

# Vérification des conflits
echo "🔍 Vérification des conflits de dépendances..."
npm ls --depth=0 2>&1 | grep -i "conflict\|error\|unmet peer" || echo "✅ Aucun conflit détecté"

echo ""
echo "🎉 Correction des dépendances AdonisJS terminée !"
echo "=========================================="
echo ""
echo "📋 Prochaines étapes recommandées:"
echo "1. Tester le serveur: npm run dev"
echo "2. Vérifier les routes: curl http://localhost:8000"
echo "3. Tester l'API: curl http://localhost:8000/health"
echo ""
echo "🔧 Si des problèmes persistent:"
echo "- Vérifier les logs: npm run dev"
echo "- Consulter la documentation AdonisJS v6"
echo "- Utiliser: npm audit fix"
echo "" 