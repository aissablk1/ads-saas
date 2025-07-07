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
