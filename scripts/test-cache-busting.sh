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
