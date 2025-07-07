#!/bin/bash

# Script de diagnostic des dépendances AdonisJS
# Analyse les conflits et fournit des recommandations

set -e

echo "🔍 Diagnostic des dépendances AdonisJS..."
echo "=========================================="

# Vérification de l'environnement
if [ ! -d "server" ]; then
    echo "❌ Erreur: Répertoire server/ non trouvé"
    exit 1
fi

cd server

echo "📋 Étape 1/6: Vérification de l'environnement système"
echo "🔍 Node.js: $(node --version)"
echo "🔍 npm: $(npm --version)"
echo "🔍 Répertoire: $(pwd)"

echo ""
echo "📋 Étape 2/6: Analyse du package.json"
if [ -f "package.json" ]; then
    echo "✅ package.json trouvé"
    
    # Extraction des versions AdonisJS
    echo "🔍 Versions AdonisJS dans package.json:"
    grep -E "@adonisjs/[^:]+" package.json | head -10 || echo "   Aucune dépendance AdonisJS trouvée"
else
    echo "❌ package.json non trouvé"
    exit 1
fi

echo ""
echo "📋 Étape 3/6: Vérification des node_modules"
if [ -d "node_modules" ]; then
    echo "✅ node_modules trouvé"
    
    # Vérification des packages AdonisJS installés
    echo "🔍 Packages AdonisJS installés:"
    if [ -d "node_modules/@adonisjs" ]; then
        ls -la node_modules/@adonisjs/ | head -10
    else
        echo "   Aucun package AdonisJS installé"
    fi
    
    # Vérification des conflits
    echo ""
    echo "🔍 Vérification des conflits de dépendances:"
    npm ls --depth=0 2>&1 | grep -E "(conflict|error|unmet peer|ERESOLVE)" || echo "   Aucun conflit détecté"
else
    echo "⚠️  node_modules non trouvé - exécutez 'npm install' d'abord"
fi

echo ""
echo "📋 Étape 4/6: Analyse des erreurs npm"
echo "🔍 Tentative d'installation pour détecter les erreurs:"
npm install --dry-run 2>&1 | grep -E "(error|conflict|ERESOLVE|unmet peer)" || echo "   Aucune erreur détectée en mode dry-run"

echo ""
echo "📋 Étape 5/6: Recommandations de correction"
echo "🔧 Solutions recommandées:"

# Détection des problèmes spécifiques
if npm ls @adonisjs/core 2>/dev/null | grep -q "missing"; then
    echo "1. ❌ @adonisjs/core manquant - Installer: npm install @adonisjs/core@^6.2.0"
fi

if npm ls @adonisjs/mail 2>/dev/null | grep -q "missing"; then
    echo "2. ❌ @adonisjs/mail manquant - Installer: npm install @adonisjs/mail@^9.0.0"
fi

# Vérification des versions incompatibles
if npm ls @adonisjs/mail 2>/dev/null | grep -q "8.2.1"; then
    echo "3. ⚠️  @adonisjs/mail v8.2.1 incompatible avec AdonisJS v6"
    echo "   Mettre à jour vers: npm install @adonisjs/mail@^9.0.0"
fi

echo "4. 🔧 Nettoyer et réinstaller:"
echo "   rm -rf node_modules package-lock.json"
echo "   npm install --legacy-peer-deps"

echo "5. 🔧 Alternative avec force:"
echo "   npm install --force"

echo ""
echo "📋 Étape 6/6: Vérification de la structure AdonisJS"
echo "🔍 Structure du projet:"

# Vérification des fichiers AdonisJS typiques
ADONISJS_FILES=("start/routes.ts" "start/kernel.ts" "app/Controllers" "config/app.ts")
for file in "${ADONISJS_FILES[@]}"; do
    if [ -e "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (manquant)"
    fi
done

echo ""
echo "🎯 Résumé du diagnostic:"
echo "========================"

# Résumé des problèmes détectés
PROBLEMS=0

if [ ! -d "node_modules" ]; then
    echo "❌ node_modules manquant"
    PROBLEMS=$((PROBLEMS + 1))
fi

if npm ls --depth=0 2>&1 | grep -q "unmet peer"; then
    echo "❌ Conflits de dépendances détectés"
    PROBLEMS=$((PROBLEMS + 1))
fi

if [ $PROBLEMS -eq 0 ]; then
    echo "✅ Aucun problème majeur détecté"
else
    echo "⚠️  $PROBLEMS problème(s) détecté(s)"
fi

echo ""
echo "🚀 Actions recommandées:"
echo "========================"
echo "1. Exécuter: ./scripts/fix-adonisjs-dependencies.sh"
echo "2. Tester: npm run dev"
echo "3. Vérifier: curl http://localhost:8000/health"
echo ""
echo "📚 Documentation utile:"
echo "- AdonisJS v6: https://docs.adonisjs.com/"
echo "- Migration v5 vers v6: https://docs.adonisjs.com/guides/upgrade-guides/v6"
echo "" 