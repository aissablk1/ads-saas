# Intégration des Scripts dans run.sh

## Vue d'ensemble

Les trois scripts originaux (`stop.sh`, `setup.sh`, `start.sh`) ont été intégrés méthodiquement dans le script principal `run.sh` pour centraliser toute la gestion de l'application ADS SaaS.

## Scripts intégrés

### 1. `stop.sh` → Fonction `simple_stop()`
**Fonctionnalités intégrées :**
- Arrêt simple de tous les services
- Libération des ports 3000, 8000 et 5000
- Gestion des processus avec `kill_port()`

**Utilisation :**
```bash
./run.sh simple-stop
```

### 2. `setup.sh` → Fonction `install_app()`
**Fonctionnalités intégrées :**
- Vérification de Node.js (version 18+)
- Création des fichiers de configuration (.env.example)
- Installation des dépendances (projet principal, serveur, client)
- Configuration de la base de données SQLite
- Génération du client Prisma
- Ajout des données de démonstration

**Utilisation :**
```bash
./run.sh install
```

### 3. `start.sh` → Fonction `simple_start()`
**Fonctionnalités intégrées :**
- Démarrage simple avec trap pour le nettoyage
- Libération automatique des ports
- Vérification de la création du fichier .env
- Démarrage séquentiel (serveur puis client)
- Vérification de la santé du serveur
- Attente interactive avec Ctrl+C pour arrêter

**Utilisation :**
```bash
./run.sh simple-start
```

## Nouvelles fonctions communes

### `kill_port(port)`
Fonction unifiée pour arrêter les processus sur un port donné :
- Détection automatique du PID
- Arrêt propre avec `kill -9`
- Messages informatifs colorés

### `cleanup()`
Fonction de nettoyage pour les processus en arrière-plan :
- Arrêt de tous les services
- Libération de tous les ports
- Gestion des PIDs stockés

## Menu interactif mis à jour

### Nouvelles options ajoutées :
- **24** : Installation complète (équivalent `setup.sh`)
- **25** : Démarrage simple (équivalent `start.sh`)
- **26** : Arrêt simple (équivalent `stop.sh`)

### Options disponibles (0-27) :
```
0) 🚀 Exécuter tout (sauf arrêt)
1) 🚀 Démarrer l'application complète
2) 🛑 Arrêter l'application complète
3) 🔄 Redémarrer l'application complète
4) 🔍 Vérifier le statut
5) ⚙️  Configurer/Installer (complet)
6) 📋 Afficher tous les logs
7) 🌐 Ouvrir dans le navigateur
8) 🔍 Exécuter type-check (complet)
9) 🧹 Nettoyer l'environnement

━━━ Options d'installation et démarrage simple ━━━
24) 🚀 Installation complète (setup.sh)
25) 🚀 Démarrage simple (start.sh)
26) 🛑 Arrêt simple (stop.sh)

━━━ Options spécifiques Serveur ━━━
10) 📡 Démarrer uniquement le serveur
11) 🛑 Arrêter uniquement le serveur
12) 🔄 Redémarrer uniquement le serveur
13) ⚙️  Configurer uniquement le serveur
14) 📋 Logs du serveur uniquement
15) 🔍 Type-check serveur uniquement
16) 🔍 Vérifier config serveur

━━━ Options spécifiques Client ━━━
17) 🌐 Démarrer uniquement le client
18) 🛑 Arrêter uniquement le client
19) 🔄 Redémarrer uniquement le client
20) ⚙️  Configurer uniquement le client
21) 📋 Logs du client uniquement
22) 🔍 Type-check client uniquement

27) 🚪 Quitter
```

## Commandes en ligne de commande

### Nouvelles commandes ajoutées :
```bash
./run.sh install        # Installation complète
./run.sh simple-start   # Démarrage simple
./run.sh simple-stop    # Arrêt simple
```

### Toutes les commandes disponibles :
```bash
# Générales
./run.sh start          # Démarrer l'application complète
./run.sh stop           # Arrêter l'application complète
./run.sh restart        # Redémarrer l'application complète
./run.sh status         # Vérifier le statut
./run.sh setup          # Configurer/Installer (complet)
./run.sh logs           # Afficher tous les logs
./run.sh type-check     # Exécuter le type-check (complet)
./run.sh clean          # Nettoyer l'environnement
./run.sh open           # Ouvrir dans le navigateur
./run.sh all            # Exécuter tout (sauf arrêt)

# Installation et démarrage simple
./run.sh install        # Installation complète (équivalent setup.sh)
./run.sh simple-start   # Démarrage simple (équivalent start.sh)
./run.sh simple-stop    # Arrêt simple (équivalent stop.sh)

# Serveur
./run.sh start-server   # Démarrer uniquement le serveur
./run.sh stop-server    # Arrêter uniquement le serveur
./run.sh restart-server # Redémarrer uniquement le serveur
./run.sh setup-server   # Configurer uniquement le serveur
./run.sh logs-server    # Logs du serveur uniquement
./run.sh type-check-server # Type-check serveur uniquement
./run.sh check-config-server # Vérifier/corriger config serveur

# Client
./run.sh start-client   # Démarrer uniquement le client
./run.sh stop-client    # Arrêter uniquement le client
./run.sh restart-client # Redémarrer uniquement le client
./run.sh setup-client   # Configurer uniquement le client
./run.sh logs-client    # Logs du client uniquement
./run.sh type-check-client # Type-check client uniquement
```

## Avantages de l'intégration

1. **Centralisation** : Un seul script pour gérer toute l'application
2. **Cohérence** : Interface unifiée avec couleurs et messages cohérents
3. **Flexibilité** : Mode interactif ET ligne de commande
4. **Maintenance** : Un seul fichier à maintenir
5. **Fonctionnalités étendues** : Plus d'options que les scripts originaux
6. **Gestion d'erreurs** : Meilleure gestion des erreurs et des cas limites

## Migration

Les scripts originaux ont été supprimés car leurs fonctionnalités sont maintenant disponibles dans `run.sh` :

- `stop.sh` → `./run.sh simple-stop`
- `setup.sh` → `./run.sh install`
- `start.sh` → `./run.sh simple-start`

## Compatibilité

Le script `run.sh` est entièrement compatible avec les fonctionnalités des scripts originaux tout en offrant des options supplémentaires pour une gestion plus avancée de l'application. 