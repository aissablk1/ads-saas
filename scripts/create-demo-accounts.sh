#!/bin/bash

# =============================================================================
# SCRIPT DE CRÉATION DES COMPTES DE DÉMONSTRATION - SaaS ADS
# =============================================================================

set -e

echo "👥 Création des comptes de démonstration pour ADS SaaS..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️ $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️ $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Vérifier que le serveur est accessible
info "Vérification de l'accès au serveur..."
if curl -s http://localhost:8000/health > /dev/null; then
    log "Serveur backend accessible"
else
    error "Serveur backend non accessible sur http://localhost:8000"
    echo "Veuillez démarrer le serveur avec: cd server/src && node index.js"
    exit 1
fi

# Fonction pour créer un compte
create_account() {
    local email=$1
    local password=$2
    local firstName=$3
    local lastName=$4
    local role=${5:-"USER"}
    
    info "Création du compte: $email"
    
    # Données du compte
    local account_data='{
        "email": "'$email'",
        "password": "'$password'",
        "firstName": "'$firstName'",
        "lastName": "'$lastName'"
    }'
    
    # Tentative de création
    local response=$(curl -s -X POST http://localhost:8000/api/auth/register \
        -H "Content-Type: application/json" \
        -d "$account_data" 2>/dev/null)
    
    if echo "$response" | grep -q "accessToken"; then
        log "Compte créé avec succès: $email"
        
        # Si c'est un admin, mettre à jour le rôle (nécessiterait une route admin)
        if [ "$role" = "ADMIN" ]; then
            warn "Note: Pour promouvoir en admin, utilisez la base de données directement"
            info "Commande SQL: UPDATE users SET role = 'ADMIN' WHERE email = '$email';"
        fi
        
        return 0
    elif echo "$response" | grep -q "existe déjà"; then
        warn "Compte existe déjà: $email"
        return 0
    else
        error "Erreur lors de la création de: $email"
        echo "Réponse: $response"
        return 1
    fi
}

# Création du compte administrateur
echo
info "=== CRÉATION DU COMPTE ADMINISTRATEUR ==="
create_account "admin@ads-saas.com" "admin123" "Admin" "ADS SaaS" "ADMIN"

# Création du compte utilisateur démo
echo
info "=== CRÉATION DU COMPTE UTILISATEUR DÉMO ==="
create_account "demo@ads-saas.com" "demo123" "Utilisateur" "Démo" "USER"

# Création de comptes supplémentaires pour les tests
echo
info "=== CRÉATION DE COMPTES SUPPLÉMENTAIRES ==="
create_account "test@ads-saas.com" "Test123!" "Test" "User" "USER"
create_account "manager@ads-saas.com" "manager123" "Manager" "ADS" "USER"

# Mise à jour des rôles en base de données (si PostgreSQL est accessible)
info "Mise à jour des rôles en base de données..."

cd server

# Vérifier si on peut accéder à Prisma
if npx prisma --version > /dev/null 2>&1; then
    info "Mise à jour du rôle administrateur..."
    
    # Créer un script Prisma temporaire pour mettre à jour les rôles
    cat > update_roles.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

async function updateRoles() {
  const prisma = new PrismaClient();
  
  try {
    // Mettre à jour le compte admin
    const adminUser = await prisma.user.updateMany({
      where: { email: 'admin@ads-saas.com' },
      data: { role: 'ADMIN' }
    });
    
    console.log('✅ Rôle admin mis à jour');
    
    // Créer quelques campagnes de démonstration
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@ads-saas.com' }
    });
    
    if (demoUser) {
      // Campagne démo 1
      await prisma.campaign.upsert({
        where: { id: 'demo-campaign-1' },
        update: {},
        create: {
          id: 'demo-campaign-1',
          name: 'Campagne Démo - Produits Tech',
          description: 'Campagne de démonstration pour les produits technologiques',
          status: 'ACTIVE',
          budget: 1000.0,
          spent: 250.75,
          impressions: 15420,
          clicks: 847,
          conversions: 23,
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
          userId: demoUser.id
        }
      });
      
      // Campagne démo 2
      await prisma.campaign.upsert({
        where: { id: 'demo-campaign-2' },
        update: {},
        create: {
          id: 'demo-campaign-2',
          name: 'Campagne Démo - Services',
          description: 'Campagne de démonstration pour les services en ligne',
          status: 'PAUSED',
          budget: 500.0,
          spent: 89.50,
          impressions: 5230,
          clicks: 312,
          conversions: 8,
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
          userId: demoUser.id
        }
      });
      
      console.log('✅ Campagnes de démonstration créées');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateRoles();
EOF

    # Exécuter le script
    node update_roles.js
    
    # Nettoyer
    rm update_roles.js
    
    log "Rôles et données de démonstration mis à jour"
else
    warn "Prisma non accessible, mise à jour manuelle nécessaire"
fi

cd ..

# Résumé final
echo
echo "🎉 COMPTES DE DÉMONSTRATION CRÉÉS AVEC SUCCÈS"
echo
echo "📋 Comptes disponibles:"
echo
echo "👑 ADMINISTRATEUR:"
echo "  Email: admin@ads-saas.com"
echo "  Mot de passe: admin123"
echo "  Rôle: Admin (accès complet)"
echo
echo "👤 UTILISATEUR DÉMO:"
echo "  Email: demo@ads-saas.com"
echo "  Mot de passe: demo123"
echo "  Rôle: Utilisateur (fonctionnalités standard)"
echo "  Données: 2 campagnes de démonstration"
echo
echo "🧪 COMPTES DE TEST:"
echo "  Email: test@ads-saas.com"
echo "  Mot de passe: Test123!"
echo
echo "  Email: manager@ads-saas.com"
echo "  Mot de passe: manager123"
echo
echo "🔗 Pour tester:"
echo "  1. Allez sur http://localhost:3000/login"
echo "  2. Cliquez sur 'Admin' ou 'Utilisateur Démo'"
echo "  3. Les champs seront remplis automatiquement"
echo "  4. Cliquez sur 'Se connecter'"
echo

log "Comptes de démonstration prêts à l'emploi !" 