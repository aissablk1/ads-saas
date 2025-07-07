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
