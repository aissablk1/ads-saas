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
