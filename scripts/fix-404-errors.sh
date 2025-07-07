#!/bin/bash

# Script pour diagnostiquer et corriger les erreurs 404
# Usage: ./scripts/fix-404-errors.sh

set -e

echo "🔍 Diagnostic des erreurs 404..."

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si le serveur Next.js est en cours d'exécution
check_nextjs_server() {
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_success "Serveur Next.js détecté sur le port 3000"
        return 0
    else
        log_warning "Serveur Next.js non détecté sur le port 3000"
        return 1
    fi
}

# Tester la route API placeholder
test_placeholder_api() {
    log_info "Test de la route API placeholder..."
    
    # Test avec différentes tailles
    local sizes=("40/40" "100/100" "300/200" "800/600")
    
    for size in "${sizes[@]}"; do
        if curl -s "http://localhost:3000/api/placeholder/$size" > /dev/null 2>&1; then
            log_success "Route /api/placeholder/$size fonctionne"
        else
            log_error "Route /api/placeholder/$size échoue"
        fi
    done
}

# Vérifier les fichiers de configuration
check_config_files() {
    log_info "Vérification des fichiers de configuration..."
    
    # Vérifier next.config.js
    if [ -f "client/next.config.js" ]; then
        log_success "next.config.js trouvé"
    else
        log_error "next.config.js manquant"
    fi
    
    # Vérifier la route API placeholder
    if [ -f "client/src/app/api/placeholder/[...size]/route.ts" ]; then
        log_success "Route API placeholder trouvée"
    else
        log_error "Route API placeholder manquante"
    fi
}

# Analyser les logs pour les erreurs 404
analyze_logs() {
    log_info "Analyse des erreurs 404 dans les logs..."
    
    # Chercher les erreurs 404 dans les logs
    if [ -f "logs/nextjs.log" ]; then
        local error_count=$(grep -c "404" logs/nextjs.log 2>/dev/null || echo "0")
        if [ "$error_count" -gt 0 ]; then
            log_warning "Trouvé $error_count erreurs 404 dans les logs"
            echo "Dernières erreurs 404:"
            grep "404" logs/nextjs.log | tail -5
        else
            log_success "Aucune erreur 404 trouvée dans les logs"
        fi
    else
        log_warning "Fichier de logs non trouvé"
    fi
}

# Corriger les problèmes courants
fix_common_issues() {
    log_info "Correction des problèmes courants..."
    
    # 1. Vérifier que la route API placeholder existe
    if [ ! -f "client/src/app/api/placeholder/[...size]/route.ts" ]; then
        log_warning "Création de la route API placeholder..."
        mkdir -p "client/src/app/api/placeholder/[...size]"
        cat > "client/src/app/api/placeholder/[...size]/route.ts" << 'EOF'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { size: string[] } }
) {
  try {
    // Gérer le format "40/40" ou "300/200"
    const sizeParam = params.size.join('/')
    const [width, height] = sizeParam.split('/').map(Number)
    
    if (!width || !height || width > 1000 || height > 1000) {
      return new NextResponse('Invalid size', { status: 400 })
    }

    // Générer une image SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 8}" 
              fill="white" text-anchor="middle" dy=".3em">
          ${width}×${height}
        </text>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Erreur génération placeholder:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
EOF
        log_success "Route API placeholder créée"
    fi
    
    # 2. Vérifier la configuration Next.js
    if [ -f "client/next.config.js" ]; then
        if ! grep -q "images:" "client/next.config.js"; then
            log_warning "Ajout de la configuration images dans next.config.js..."
            # Ajouter la configuration images si elle n'existe pas
            sed -i.bak '/module.exports = {/a\
  images: {\
    domains: ["localhost", "127.0.0.1"],\
    unoptimized: true\
  },' "client/next.config.js"
            log_success "Configuration images ajoutée"
        fi
    fi
}

# Redémarrer les services si nécessaire
restart_services() {
    log_info "Redémarrage des services..."
    
    # Redémarrer le client Next.js
    if pgrep -f "next" > /dev/null; then
        log_info "Redémarrage du serveur Next.js..."
        pkill -f "next" || true
        sleep 2
        cd client && npm run dev > /dev/null 2>&1 &
        sleep 5
        log_success "Serveur Next.js redémarré"
    fi
}

# Fonction principale
main() {
    echo "🚀 Démarrage du diagnostic des erreurs 404..."
    echo "================================================"
    
    # Vérifications
    check_config_files
    analyze_logs
    
    # Corriger les problèmes
    fix_common_issues
    
    # Vérifier le serveur
    if check_nextjs_server; then
        test_placeholder_api
    else
        log_warning "Démarrage du serveur Next.js..."
        cd client && npm run dev > /dev/null 2>&1 &
        sleep 10
        
        if check_nextjs_server; then
            test_placeholder_api
        else
            log_error "Impossible de démarrer le serveur Next.js"
        fi
    fi
    
    echo ""
    echo "================================================"
    log_success "Diagnostic terminé !"
    echo ""
    echo "📋 Résumé des actions :"
    echo "1. ✅ Vérification des fichiers de configuration"
    echo "2. ✅ Analyse des logs d'erreurs"
    echo "3. ✅ Correction des problèmes courants"
    echo "4. ✅ Test des routes API"
    echo ""
    echo "🔧 Si des erreurs persistent :"
    echo "- Vérifiez que le serveur Next.js est en cours d'exécution"
    echo "- Consultez les logs dans la console du navigateur"
    echo "- Redémarrez le serveur avec : cd client && npm run dev"
}

# Exécuter le script principal
main "$@" 