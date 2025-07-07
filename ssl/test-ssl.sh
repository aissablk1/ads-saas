#!/bin/bash

echo "🧪 Test de la configuration SSL..."

# Vérifier les fichiers SSL
if [ -f "ssl/certs/localhost.crt" ]; then
    echo "✅ Certificat SSL présent"
else
    echo "❌ Certificat SSL manquant"
    exit 1
fi

if [ -f "ssl/private/localhost.key" ]; then
    echo "✅ Clé privée SSL présente"
else
    echo "❌ Clé privée SSL manquante"
    exit 1
fi

# Vérifier la validité du certificat
echo "📋 Informations du certificat:"
openssl x509 -in ssl/certs/localhost.crt -text -noout | grep -E "(Subject:|Not Before|Not After|DNS:|IP Address:)"

# Tester la connexion HTTPS
echo ""
echo "🔒 Test de connexion HTTPS..."
if curl -k -s https://localhost:8443 > /dev/null; then
    echo "✅ Serveur HTTPS accessible"
else
    echo "⚠️  Serveur HTTPS non accessible (normal si pas démarré)"
fi

echo ""
echo "📊 Résumé SSL:"
echo "  - Certificat: ssl/certs/localhost.crt"
echo "  - Clé privée: ssl/private/localhost.key"
echo "  - Bundle: ssl/localhost.pem"
echo "  - Test serveur: node ssl/https-server.js"
echo "  - Test URL: https://localhost:8443"
