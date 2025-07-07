#!/bin/bash

echo "🚀 Démarrage du serveur HTTPS de test..."

# Vérifier que les certificats existent
if [ ! -f "ssl/certs/localhost.crt" ] || [ ! -f "ssl/private/localhost.key" ]; then
    echo "❌ Certificats SSL manquants. Exécutez d'abord: ./scripts/setup-ssl.sh"
    exit 1
fi

# Démarrer le serveur HTTPS
cd ssl
node https-server.js
