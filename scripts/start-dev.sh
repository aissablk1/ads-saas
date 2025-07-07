#!/bin/bash

# Script pour démarrer les services de développement
echo "🚀 Démarrage des services de développement..."

# Vérifier si Docker est démarré
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker n'est pas démarré. Démarrage en mode local..."
    
    # Démarrer le serveur backend
    echo "📡 Démarrage du serveur backend..."
    cd server
    npm run dev &
    SERVER_PID=$!
    cd ..
    
    # Démarrer le client frontend
    echo "🌐 Démarrage du client frontend..."
    cd client
    npm run dev &
    CLIENT_PID=$!
    cd ..
    
    echo "✅ Services démarrés en mode local"
    echo "📱 Client: http://localhost:3000"
    echo "🔧 API: http://localhost:8000"
    echo "🏗️  Builder: http://localhost:3000/admin/builder"
    
    # Fonction pour arrêter les services
    cleanup() {
        echo "🛑 Arrêt des services..."
        kill $SERVER_PID 2>/dev/null
        kill $CLIENT_PID 2>/dev/null
        exit 0
    }
    
    # Capturer Ctrl+C
    trap cleanup SIGINT
    
    # Attendre
    wait
else
    echo "🐳 Docker est disponible. Démarrage avec Docker Compose..."
    docker-compose up -d
    
    echo "✅ Services démarrés avec Docker"
    echo "📱 Application: https://localhost"
    echo "🏗️  Builder: https://localhost/admin/builder"
    
    # Surveiller les logs
    docker-compose logs -f
fi 