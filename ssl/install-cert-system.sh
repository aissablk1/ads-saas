#!/bin/bash

echo "🔧 Installation du certificat dans le système..."

# macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Installation pour macOS..."
    sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ssl/certs/localhost.crt
    echo "✅ Certificat installé dans le trousseau système macOS"
    
# Linux
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Installation pour Linux..."
    sudo cp ssl/certs/localhost.crt /usr/local/share/ca-certificates/
    sudo update-ca-certificates
    echo "✅ Certificat installé dans le système Linux"
    
# Windows
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    echo "🪟 Installation pour Windows..."
    echo "⚠️  Installation manuelle requise pour Windows"
    echo "  1. Double-cliquez sur ssl/certs/localhost.crt"
    echo "  2. Cliquez sur 'Installer le certificat'"
    echo "  3. Choisissez 'Ordinateur local'"
    echo "  4. Sélectionnez 'Placer tous les certificats dans le magasin suivant'"
    echo "  5. Cliquez sur 'Parcourir' et sélectionnez 'Autorités de certification racines de confiance'"
    echo "  6. Cliquez sur 'Suivant' puis 'Terminer'"
else
    echo "⚠️  Système d'exploitation non reconnu"
    echo "   Installation manuelle du certificat requise"
fi

echo ""
echo "🔗 Après installation, vous pourrez accéder à:"
echo "  - https://localhost:8443 (serveur de test)"
echo "  - https://localhost:3000 (application, si configurée)"
echo "  - https://localhost:8000 (API, si configurée)"
