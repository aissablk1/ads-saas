#!/bin/bash

# Client Management Script
# Extracted from monolithic run.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
CLIENT_PORT=3000
CLIENT_DIR="client"

# Logging functions
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
error() { echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }

# Kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        warn "Stopping process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
        sleep 1
        log "Port $port freed"
    else
        log "No process found on port $port"
    fi
}

# Start client
start_client() {
    log "Starting client on port $CLIENT_PORT..."
    
    if [ ! -d "$CLIENT_DIR" ]; then
        error "Client directory not found: $CLIENT_DIR"
        exit 1
    fi
    
    cd "$CLIENT_DIR"
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        log "Installing client dependencies..."
        npm install
    fi
    
    # Start client in background
    nohup npm run dev > ../logs/client.log 2>&1 &
    local client_pid=$!
    
    log "Client started with PID: $client_pid"
    echo $client_pid > ../logs/client.pid
    
    cd ..
}

# Stop client
stop_client() {
    log "Stopping client..."
    
    # Try to stop using PID file
    if [ -f "logs/client.pid" ]; then
        local pid=$(cat logs/client.pid)
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid
            rm logs/client.pid
            log "Client stopped (PID: $pid)"
        else
            warn "Client PID file exists but process not found"
            rm logs/client.pid
        fi
    fi
    
    # Force kill on port
    kill_port $CLIENT_PORT
}

# Check client status
check_client() {
    local pid=$(lsof -ti:$CLIENT_PORT 2>/dev/null)
    if [ ! -z "$pid" ]; then
        if curl -s --max-time 10 http://localhost:$CLIENT_PORT > /dev/null 2>&1; then
            log "Client is running and responding (PID: $pid)"
            return 0
        else
            warn "Client process exists but not responding (PID: $pid)"
            return 1
        fi
    else
        error "Client is not running"
        return 1
    fi
}

# Build client for production
build_client() {
    log "Building client for production..."
    
    if [ ! -d "$CLIENT_DIR" ]; then
        error "Client directory not found: $CLIENT_DIR"
        exit 1
    fi
    
    cd "$CLIENT_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log "Installing client dependencies..."
        npm install
    fi
    
    # Build
    npm run build
    
    log "Client build completed"
    cd ..
}

# Main execution
case "${1:-}" in
    "start")
        start_client
        ;;
    "stop")
        stop_client
        ;;
    "restart")
        stop_client
        sleep 2
        start_client
        ;;
    "status")
        check_client
        ;;
    "build")
        build_client
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|build}"
        exit 1
        ;;
esac