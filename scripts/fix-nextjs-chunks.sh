#!/bin/bash

# Script de nettoyage et rebuild pour Next.js
# Résout les problèmes de ChunkLoadError

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Nettoyage et rebuild Next.js...${NC}"

# 1. Arrêter tous les processus Next.js
echo -e "${YELLOW}1. Arrêt des processus Next.js...${NC}"
pkill -f "next dev" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
sleep 2

# 2. Nettoyer le cache Next.js
echo -e "${YELLOW}2. Nettoyage du cache Next.js...${NC}"
cd client
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc

# 3. Nettoyer les dépendances
echo -e "${YELLOW}3. Nettoyage des dépendances...${NC}"
rm -rf node_modules
rm -f package-lock.json

# 4. Réinstaller les dépendances
echo -e "${YELLOW}4. Réinstallation des dépendances...${NC}"
npm install

# 5. Vérifier TypeScript
echo -e "${YELLOW}5. Vérification TypeScript...${NC}"
npx tsc --noEmit

# 6. Build de production pour tester
echo -e "${YELLOW}6. Build de production...${NC}"
npm run build

# 7. Démarrer en mode développement
echo -e "${YELLOW}7. Démarrage en mode développement...${NC}"
npm run dev &

# Attendre que le serveur démarre
sleep 5

# 8. Tester l'accès
echo -e "${YELLOW}8. Test de l'accès...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo -e "${GREEN}✅ Serveur accessible sur http://localhost:3000${NC}"
elif curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
    echo -e "${GREEN}✅ Serveur accessible sur http://localhost:3001${NC}"
else
    echo -e "${RED}❌ Serveur non accessible${NC}"
fi

echo -e "${GREEN}✅ Nettoyage et rebuild terminés${NC}"
echo -e "${BLUE}🌐 Accédez à http://localhost:3000/dashboard ou http://localhost:3001/dashboard${NC}" 