#!/bin/bash

# =============================================================================
# SCRIPT DE CONFIGURATION SSL - SaaS ADS (SANS DOCKER)
# =============================================================================

set -e

echo "🔒 Configuration SSL pour ADS SaaS (mode local)..."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Vérification des prérequis
log "Vérification des prérequis SSL..."

if ! command -v openssl &> /dev/null; then
    error "OpenSSL n'est pas installé"
    echo "Installez OpenSSL avec: brew install openssl (macOS) ou apt-get install openssl (Linux)"
    exit 1
fi

log "OpenSSL détecté: $(openssl version)"

# Créer les répertoires SSL
log "Création des répertoires SSL..."
mkdir -p ssl/certs
mkdir -p ssl/private
mkdir -p ssl/csr

# Génération des certificats SSL auto-signés
log "Génération des certificats SSL auto-signés..."

# Générer la clé privée
info "Génération de la clé privée..."
openssl genrsa -out ssl/private/localhost.key 2048

# Générer le certificat auto-signé
info "Génération du certificat auto-signé..."
openssl req -x509 -new -nodes \
    -key ssl/private/localhost.key \
    -sha256 -days 365 \
    -out ssl/certs/localhost.crt \
    -subj "/C=FR/ST=France/L=Paris/O=ADS SaaS/CN=localhost" \
    -extensions v3_req \
    -config <(cat << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = FR
ST = France
L = Paris
O = ADS SaaS
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
EOF
)

# Créer un bundle de certificats
info "Création du bundle de certificats..."
cat ssl/certs/localhost.crt ssl/private/localhost.key > ssl/localhost.pem

# Définir les permissions appropriées
chmod 600 ssl/private/localhost.key
chmod 644 ssl/certs/localhost.crt
chmod 600 ssl/localhost.pem

log "✅ Certificats SSL générés"

# Configuration du serveur HTTPS local
log "Configuration du serveur HTTPS local..."

# Créer un script de serveur HTTPS simple
cat > ssl/https-server.js << 'EOF'
const https = require('https');
const fs = require('fs');
const path = require('path');

const options = {
  key: fs.readFileSync(path.join(__dirname, 'private/localhost.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs/localhost.crt'))
};

const server = https.createServer(options, (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>ADS SaaS - HTTPS Test</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .success { color: #27ae60; font-weight: bold; }
            .info { background: #3498db; color: white; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔒 ADS SaaS - Test HTTPS</h1>
            <div class="success">✅ Connexion HTTPS sécurisée réussie !</div>
            <div class="info">
                <strong>Informations SSL :</strong><br>
                Certificat : Auto-signé<br>
                Validité : 365 jours<br>
                Domaine : localhost<br>
                Port : 8443
            </div>
            <p>Cette page confirme que votre configuration SSL fonctionne correctement.</p>
            <p><strong>Prochaine étape :</strong> Configurez votre application pour utiliser HTTPS.</p>
        </div>
    </body>
    </html>
  `);
});

const PORT = 8443;
server.listen(PORT, () => {
  console.log(`🔒 Serveur HTTPS démarré sur https://localhost:${PORT}`);
  console.log(`📋 Certificat: ${path.join(__dirname, 'certs/localhost.crt')}`);
  console.log(`🔑 Clé privée: ${path.join(__dirname, 'private/localhost.key')}`);
});
EOF

# Créer un script de test SSL
cat > ssl/test-ssl.sh << 'EOF'
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
EOF

chmod +x ssl/test-ssl.sh

# Créer un script de démarrage du serveur HTTPS
cat > ssl/start-https-server.sh << 'EOF'
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
EOF

chmod +x ssl/start-https-server.sh

# Configuration pour l'application
log "Configuration SSL pour l'application..."

# Créer un fichier de configuration SSL pour l'application
cat > ssl/ssl-config.js << 'EOF'
// Configuration SSL pour ADS SaaS
const fs = require('fs');
const path = require('path');

const sslConfig = {
  key: fs.readFileSync(path.join(__dirname, 'private/localhost.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs/localhost.crt')),
  ca: fs.readFileSync(path.join(__dirname, 'certs/localhost.crt')) // Auto-signé
};

module.exports = sslConfig;
EOF

# Créer un script d'installation des certificats système
cat > ssl/install-cert-system.sh << 'EOF'
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
EOF

chmod +x ssl/install-cert-system.sh

# Test de la configuration
log "Test de la configuration SSL..."
./ssl/test-ssl.sh

log "✅ Configuration SSL terminée avec succès !"
echo
echo "🔗 Fichiers SSL créés:"
echo "  - Certificat: ssl/certs/localhost.crt"
echo "  - Clé privée: ssl/private/localhost.key"
echo "  - Bundle: ssl/localhost.pem"
echo "  - Configuration: ssl/ssl-config.js"
echo
echo "🚀 Commandes disponibles:"
echo "  - Test SSL: ./ssl/test-ssl.sh"
echo "  - Serveur de test: ./ssl/start-https-server.sh"
echo "  - Installer certificat: ./ssl/install-cert-system.sh"
echo
echo "🔒 URLs de test:"
echo "  - Serveur HTTPS: https://localhost:8443"
echo "  - Application: https://localhost:3000 (après configuration)"
echo "  - API: https://localhost:8000 (après configuration)"
echo
echo "⚠️  Note: Les certificats sont auto-signés. Pour la production, utilisez Let's Encrypt ou un CA commercial."
echo
log "SSL configuré et prêt à l'emploi !" 