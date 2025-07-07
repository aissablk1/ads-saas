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
