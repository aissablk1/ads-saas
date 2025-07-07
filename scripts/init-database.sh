#!/bin/bash

# =============================================================================
# SCRIPT D'INITIALISATION DE LA BASE DE DONNÉES - SaaS ADS (SANS DOCKER)
# =============================================================================

set -e

echo "🗄️  Initialisation de la base de données SQLite pour ADS SaaS..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    error "Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
    exit 1
fi

log "Node.js détecté: $(node --version)"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé"
    exit 1
fi

log "npm détecté: $(npm --version)"

# Aller dans le répertoire server
cd server

log "Configuration de la base de données SQLite..."

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    info "Installation des dépendances serveur..."
    npm install
fi

# Vérifier que Prisma est installé
if ! npx prisma --version > /dev/null 2>&1; then
    error "Prisma n'est pas installé"
    exit 1
fi

log "Prisma détecté: $(npx prisma --version)"

# Générer le client Prisma
info "Génération du client Prisma..."
npx prisma generate

# Créer la base de données SQLite avec push (évite les problèmes de migration)
info "Création de la base de données SQLite..."
if [ -f "dev.db" ]; then
    warn "Base de données existante détectée, suppression..."
    rm -f dev.db
    log "Ancienne base de données supprimée"
fi
npx prisma db push --force-reset

log "Base de données SQLite créée"

# Seeder la base de données avec des données de démonstration
info "Ajout des données de démonstration..."

# Créer un script de seeding temporaire
cat > seed-demo.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Ajout des données de démonstration...');

    // Créer l'utilisateur administrateur
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@ads-saas.com' },
      update: {},
              create: {
          email: 'admin@ads-saas.com',
          password: adminPassword,
          firstName: 'Admin',
          lastName: 'ADS SaaS',
          role: 'ADMIN',
          emailVerified: true,
          twoFactorEnabled: false
        }
    });

    console.log('✅ Utilisateur administrateur créé');

    // Créer l'utilisateur démo
    const demoPassword = await bcrypt.hash('demo123', 10);
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@ads-saas.com' },
      update: {},
              create: {
          email: 'demo@ads-saas.com',
          password: demoPassword,
          firstName: 'Utilisateur',
          lastName: 'Démo',
          role: 'USER',
          emailVerified: true,
          twoFactorEnabled: false
        }
    });

    console.log('✅ Utilisateur démo créé');

    // Créer quelques campagnes de démonstration
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

    console.log('🎉 Base de données initialisée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
EOF

# Exécuter le script de seeding
node seed-demo.js

# Nettoyer le script temporaire
rm seed-demo.js

# Retourner à la racine
cd ..

log "✅ Base de données SQLite initialisée avec succès !"
echo
echo "📋 Récapitulatif:"
echo "   ✅ Base de données SQLite créée"
echo "   ✅ Utilisateur administrateur créé"
echo "   ✅ Utilisateur démo créé"
echo "   ✅ Campagnes de démonstration ajoutées"
echo "   ✅ Dépendances installées"
echo
echo "🔑 Identifiants d'accès:"
echo "   👤 Admin: admin@ads-saas.com / admin123"
echo "   👤 Démo:  demo@ads-saas.com / demo123"
echo
echo "🌐 URLs d'accès:"
echo "   🏠 Application: http://localhost:3000"
echo "   🔧 Admin: http://localhost:3000/admin/login"
echo "   📊 API: http://localhost:8000"
echo
echo "🗄️  Base de données:"
echo "   - Fichier: server/dev.db"
echo "   - Type: SQLite"
echo "   - Taille: $(ls -lh server/dev.db 2>/dev/null | awk '{print $5}' || echo 'N/A')"
echo
echo "🚀 Pour démarrer le système:"
echo "   ./run.sh start"
echo
log "Base de données prête à l'emploi !" 