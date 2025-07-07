#!/bin/bash

# =============================================================================
# SCRIPT DE CONFIGURATION MONITORING - SaaS ADS (SANS DOCKER)
# =============================================================================

set -e

echo "📊 Configuration du monitoring local pour ADS SaaS..."

# Couleurs pour les logs
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

# Créer les répertoires nécessaires
log "Création des répertoires de monitoring..."
mkdir -p monitoring/logs
mkdir -p monitoring/metrics
mkdir -p monitoring/dashboards

# Configuration du monitoring local
log "Configuration du monitoring local..."

# Créer un script de monitoring simple
cat > monitoring/monitor.sh << 'EOF'
#!/bin/bash

# Script de monitoring local pour ADS SaaS
LOG_FILE="monitoring/logs/application.log"
METRICS_FILE="monitoring/metrics/current.json"

# Créer le répertoire de logs s'il n'existe pas
mkdir -p monitoring/logs
mkdir -p monitoring/metrics

# Fonction pour collecter les métriques
collect_metrics() {
    local timestamp=$(date +%s)
    local cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
    local memory_usage=$(top -l 1 | grep "PhysMem" | awk '{print $2}' | sed 's/[A-Z]//g')
    local disk_usage=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    # Vérifier les services
    local server_status=0
    local client_status=0
    
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        server_status=1
    fi
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        client_status=1
    fi
    
    # Créer le JSON des métriques
    cat > "$METRICS_FILE" << JSON
{
    "timestamp": $timestamp,
    "cpu_usage": $cpu_usage,
    "memory_usage": $memory_usage,
    "disk_usage": $disk_usage,
    "services": {
        "server": $server_status,
        "client": $client_status
    },
    "uptime": $(uptime | awk '{print $3}' | sed 's/,//')
}
JSON
}

# Collecter les métriques
collect_metrics

# Logger les métriques
echo "[$(date)] Métriques collectées: CPU: ${cpu_usage}%, Mémoire: ${memory_usage}MB, Disque: ${disk_usage}%" >> "$LOG_FILE"
EOF

chmod +x monitoring/monitor.sh

# Créer un dashboard HTML simple
cat > monitoring/dashboard.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ADS SaaS - Monitoring Local</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2em; font-weight: bold; color: #3498db; }
        .metric-label { color: #7f8c8d; margin-top: 5px; }
        .status-online { color: #27ae60; }
        .status-offline { color: #e74c3c; }
        .refresh-btn { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        .refresh-btn:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 ADS SaaS - Monitoring Local</h1>
            <p>Tableau de bord en temps réel</p>
        </div>
        
        <button class="refresh-btn" onclick="loadMetrics()">🔄 Actualiser</button>
        
        <div class="metrics-grid" id="metrics">
            <!-- Les métriques seront chargées ici -->
        </div>
    </div>

    <script>
        function loadMetrics() {
            fetch('metrics/current.json')
                .then(response => response.json())
                .then(data => {
                    const metricsDiv = document.getElementById('metrics');
                    const timestamp = new Date(data.timestamp * 1000).toLocaleString();
                    
                    metricsDiv.innerHTML = `
                        <div class="metric-card">
                            <div class="metric-value">${data.cpu_usage}%</div>
                            <div class="metric-label">Utilisation CPU</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${data.memory_usage} MB</div>
                            <div class="metric-label">Utilisation Mémoire</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${data.disk_usage}%</div>
                            <div class="metric-label">Utilisation Disque</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value status-${data.services.server ? 'online' : 'offline'}">
                                ${data.services.server ? '🟢' : '🔴'}
                            </div>
                            <div class="metric-label">Serveur Backend</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value status-${data.services.client ? 'online' : 'offline'}">
                                ${data.services.client ? '🟢' : '🔴'}
                            </div>
                            <div class="metric-label">Client Frontend</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${data.uptime}</div>
                            <div class="metric-label">Temps de fonctionnement</div>
                        </div>
                    `;
                })
                .catch(error => {
                    console.error('Erreur lors du chargement des métriques:', error);
                    document.getElementById('metrics').innerHTML = '<p>Erreur lors du chargement des métriques</p>';
                });
        }

        // Charger les métriques au démarrage et toutes les 30 secondes
        loadMetrics();
        setInterval(loadMetrics, 30000);
    </script>
</body>
</html>
EOF

# Créer un script de démarrage du monitoring
cat > monitoring/start-monitoring.sh << 'EOF'
#!/bin/bash

echo "🚀 Démarrage du monitoring local..."

# Démarrer la collecte de métriques en arrière-plan
while true; do
    ./monitoring/monitor.sh
    sleep 30
done &
MONITOR_PID=$!

echo "✅ Monitoring démarré (PID: $MONITOR_PID)"
echo "📊 Dashboard disponible sur: file://$(pwd)/monitoring/dashboard.html"
echo "📋 Logs disponibles dans: monitoring/logs/application.log"
echo "🛑 Pour arrêter: kill $MONITOR_PID"

# Garder le script en vie
wait $MONITOR_PID
EOF

chmod +x monitoring/start-monitoring.sh

# Créer un script de test de santé
cat > monitoring/health-check.sh << 'EOF'
#!/bin/bash

echo "🏥 Test de santé des services..."

# Test du serveur backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Serveur backend: En ligne"
else
    echo "❌ Serveur backend: Hors ligne"
fi

# Test du client frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Client frontend: En ligne"
else
    echo "❌ Client frontend: Hors ligne"
fi

# Test de la base de données (si SQLite)
if [ -f "server/dev.db" ]; then
    echo "✅ Base de données: Présente"
else
    echo "❌ Base de données: Manquante"
fi

echo "📊 Métriques système:"
echo "  - CPU: $(top -l 1 | grep "CPU usage" | awk '{print $3}')"
echo "  - Mémoire: $(top -l 1 | grep "PhysMem" | awk '{print $2}')"
echo "  - Disque: $(df -h / | tail -1 | awk '{print $5}')"
EOF

chmod +x monitoring/health-check.sh

log "✅ Monitoring local configuré avec succès !"
echo
echo "🔗 URLs et fichiers:"
echo "  - Dashboard: file://$(pwd)/monitoring/dashboard.html"
echo "  - Logs: monitoring/logs/application.log"
echo "  - Métriques: monitoring/metrics/current.json"
echo
echo "🚀 Commandes disponibles:"
echo "  - Démarrer monitoring: ./monitoring/start-monitoring.sh"
echo "  - Test de santé: ./monitoring/health-check.sh"
echo "  - Collecte manuelle: ./monitoring/monitor.sh"
echo
echo "📊 Fonctionnalités:"
echo "  - Surveillance CPU, mémoire, disque"
echo "  - Statut des services en temps réel"
echo "  - Dashboard web interactif"
echo "  - Logs automatiques"
echo
log "Monitoring local opérationnel !" 