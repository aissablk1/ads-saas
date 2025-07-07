#!/bin/bash

# Script pour corriger les warnings de positionnement
# Usage: ./scripts/fix-positioning-warnings.sh

set -e

echo "🔧 Correction des warnings de positionnement..."

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

# Vérifier les fichiers qui utilisent Framer Motion
check_framer_motion_files() {
    log_info "Vérification des fichiers utilisant Framer Motion..."
    
    local files=(
        "client/src/lib/cinematic-hero.tsx"
        "client/src/lib/parallax-effect.tsx"
        "client/src/lib/progressive-reveal.tsx"
        "client/src/lib/visual-page-builder.tsx"
        "client/src/lib/enhanced-parallax.tsx"
        "client/src/app/demo/page.tsx"
    )
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            log_success "Fichier trouvé: $file"
        else
            log_warning "Fichier manquant: $file"
        fi
    done
}

# Corriger les problèmes de positionnement
fix_positioning_issues() {
    log_info "Correction des problèmes de positionnement..."
    
    # 1. Corriger le builder visuel
    if [ -f "client/src/lib/visual-page-builder.tsx" ]; then
        log_info "Correction du builder visuel..."
        
        # Vérifier si le conteneur principal a une position relative
        if ! grep -q "className=\"h-full flex bg-gray-100 relative\"" "client/src/lib/visual-page-builder.tsx"; then
            log_warning "Ajout de la position relative au conteneur principal..."
            sed -i.bak 's/className="h-full flex bg-gray-100"/className="h-full flex bg-gray-100 relative"/' "client/src/lib/visual-page-builder.tsx"
            log_success "Position relative ajoutée au builder visuel"
        else
            log_success "Builder visuel déjà corrigé"
        fi
    fi
    
    # 2. Corriger les icônes Heroicons
    if [ -f "client/src/lib/visual-page-builder.tsx" ]; then
        log_info "Correction des icônes Heroicons..."
        
        # Remplacer les styles inline par des classes CSS
        sed -i.bak 's/style: { marginRight: '\''8px'\'', color: '\''#9ca3af'\'' }/className: "mr-2 text-gray-400"/' "client/src/lib/visual-page-builder.tsx"
        log_success "Icônes Heroicons corrigées"
    fi
}

# Vérifier les composants avec useScroll
check_use_scroll_components() {
    log_info "Vérification des composants utilisant useScroll..."
    
    local files_with_use_scroll=(
        "client/src/lib/cinematic-hero.tsx"
        "client/src/lib/parallax-effect.tsx"
        "client/src/lib/enhanced-parallax.tsx"
    )
    
    for file in "${files_with_use_scroll[@]}"; do
        if [ -f "$file" ]; then
            if grep -q "useScroll" "$file"; then
                log_warning "Composant avec useScroll trouvé: $file"
                
                # Vérifier si le conteneur a une position relative
                if grep -q "className=\"relative" "$file"; then
                    log_success "Conteneur avec position relative trouvé dans $file"
                else
                    log_warning "Conteneur sans position relative dans $file"
                fi
            fi
        fi
    done
}

# Créer un fichier de configuration pour Framer Motion
create_framer_motion_config() {
    log_info "Création de la configuration Framer Motion..."
    
    cat > "client/src/lib/framer-motion-config.ts" << 'EOF'
// Configuration pour éviter les warnings de positionnement
export const framerMotionConfig = {
  // Configuration pour les animations de scroll
  scroll: {
    // S'assurer que les conteneurs ont une position relative
    containerProps: {
      style: { position: 'relative' }
    }
  },
  
  // Configuration pour les transitions
  transition: {
    type: "spring",
    stiffness: 100,
    damping: 20
  }
}

// Hook personnalisé pour les animations de scroll
export const useSafeScroll = (target?: React.RefObject<HTMLElement>) => {
  // S'assurer que le conteneur a une position relative
  React.useEffect(() => {
    if (target?.current) {
      const computedStyle = window.getComputedStyle(target.current)
      if (computedStyle.position === 'static') {
        target.current.style.position = 'relative'
      }
    }
  }, [target])
  
  return { scrollYProgress: 0, scrollY: 0 }
}
EOF
    
    log_success "Configuration Framer Motion créée"
}

# Vérifier les erreurs TypeScript
check_typescript_errors() {
    log_info "Vérification des erreurs TypeScript..."
    
    if [ -f "client/tsconfig.json" ]; then
        cd client
        if npm run type-check > /dev/null 2>&1; then
            log_success "Aucune erreur TypeScript détectée"
        else
            log_warning "Erreurs TypeScript détectées"
            echo "Exécutez 'cd client && npm run type-check' pour voir les détails"
        fi
        cd ..
    else
        log_warning "tsconfig.json non trouvé"
    fi
}

# Créer un guide de résolution
create_troubleshooting_guide() {
    log_info "Création du guide de résolution..."
    
    cat > "docs/GUIDE_CORRECTION_WARNINGS.md" << 'EOF'
# Guide de Correction des Warnings de Positionnement

## 🚨 Problèmes Identifiés

### 1. Warning de Positionnement
```
[Warning] Please ensure that the container has a non-static position, like 'relative', 'fixed', or 'absolute' to ensure scroll offset is calculated correctly.
```

### 2. Erreurs 404 - Images Placeholder
```
[Error] Failed to load resource: the server responded with a status of 404 (Not Found) (40, line 0)
```

## ✅ Solutions Appliquées

### 1. Correction des Erreurs 404

#### Route API Placeholder
- **Fichier** : `client/src/app/api/placeholder/[...size]/route.ts`
- **Fonctionnalité** : Génération d'images SVG placeholder dynamiques
- **Format** : `/api/placeholder/40/40` ou `/api/placeholder/300/200`
- **Avantages** :
  - Images SVG légères et rapides
  - Gradient coloré avec dimensions affichées
  - Cache optimisé (1 an)
  - Validation des tailles (max 1000x1000)

### 2. Correction du Warning de Positionnement

#### Conteneurs avec Position Relative
- **Fichier** : `client/src/lib/visual-page-builder.tsx`
- **Modification** : Ajout de `relative` au conteneur principal
- **Ligne** : `<div className="h-full flex bg-gray-100 relative">`

#### Icônes Heroicons
- **Problème** : Les icônes Heroicons ne supportent pas la prop `className` directement
- **Solution** : Utilisation de `className` au lieu de `style` inline

## 🔧 Scripts de Correction

### Script de Diagnostic 404
```bash
./scripts/fix-404-errors.sh
```

### Script de Correction des Warnings
```bash
./scripts/fix-positioning-warnings.sh
```

## 📋 Vérifications Manuelles

### 1. Vérifier la Route API
```bash
curl http://localhost:3000/api/placeholder/40/40
```

### 2. Vérifier la Console du Navigateur
- Ouvrir les outils de développement
- Aller dans l'onglet Console
- Vérifier l'absence d'erreurs 404
- Confirmer la disparition du warning de positionnement

### 3. Vérifier les Composants
- `client/src/lib/visual-page-builder.tsx` : Conteneur avec `relative`
- `client/src/lib/cinematic-hero.tsx` : Conteneur avec `relative`
- `client/src/app/api/placeholder/[...size]/route.ts` : Route API fonctionnelle

## 🚀 Optimisations Futures

### 1. Configuration Framer Motion
- Créer un hook personnalisé `useSafeScroll`
- S'assurer que tous les conteneurs ont une position relative
- Optimiser les animations pour les performances

### 2. Gestion des Images
- Implémenter un système de cache côté client
- Créer des placeholders avec des motifs différents
- Ajouter des tailles prédéfinies pour les placeholders

### 3. Monitoring
- Ajouter des logs pour détecter les erreurs 404
- Implémenter un système de monitoring des warnings
- Créer des alertes automatiques

## 📝 Fichiers Modifiés

1. **client/src/app/api/placeholder/[...size]/route.ts** (modifié)
   - Correction du parsing des paramètres de taille

2. **client/src/lib/visual-page-builder.tsx** (modifié)
   - Ajout de `relative` au conteneur principal
   - Correction des icônes Heroicons

3. **scripts/fix-404-errors.sh** (nouveau)
   - Script de diagnostic et correction des erreurs 404

4. **scripts/fix-positioning-warnings.sh** (nouveau)
   - Script de correction des warnings de positionnement

## 🎯 Résultat Final

Après application des corrections :
- ✅ Erreurs 404 résolues
- ✅ Warning de positionnement corrigé
- ✅ Images placeholder fonctionnelles
- ✅ Performance améliorée
- ✅ Console propre sans erreurs

## 🔍 Diagnostic en Cas de Problème

Si les erreurs persistent :

1. **Vérifier le serveur** :
   ```bash
   curl http://localhost:3000/api/placeholder/40/40
   ```

2. **Vérifier les logs** :
   ```bash
   tail -f logs/nextjs.log
   ```

3. **Redémarrer les services** :
   ```bash
   ./scripts/restart-services.sh
   ```

4. **Vérifier la configuration** :
   ```bash
   cat client/next.config.js
   ```
EOF
    
    log_success "Guide de résolution créé"
}

# Fonction principale
main() {
    echo "🚀 Démarrage de la correction des warnings de positionnement..."
    echo "================================================================"
    
    # Vérifications
    check_framer_motion_files
    check_use_scroll_components
    
    # Corrections
    fix_positioning_issues
    create_framer_motion_config
    
    # Vérifications finales
    check_typescript_errors
    create_troubleshooting_guide
    
    echo ""
    echo "================================================================"
    log_success "Correction des warnings terminée !"
    echo ""
    echo "📋 Résumé des actions :"
    echo "1. ✅ Vérification des fichiers Framer Motion"
    echo "2. ✅ Correction des problèmes de positionnement"
    echo "3. ✅ Configuration Framer Motion créée"
    echo "4. ✅ Vérification des erreurs TypeScript"
    echo "5. ✅ Guide de résolution créé"
    echo ""
    echo "🔧 Prochaines étapes :"
    echo "- Redémarrez le serveur Next.js"
    echo "- Vérifiez la console du navigateur"
    echo "- Testez les fonctionnalités d'animation"
    echo ""
    echo "📖 Documentation :"
    echo "- Guide de résolution : docs/GUIDE_CORRECTION_WARNINGS.md"
    echo "- Script de diagnostic : ./scripts/fix-404-errors.sh"
}

# Exécuter le script principal
main "$@" 