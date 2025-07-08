#!/bin/bash

# Server Management Script
# Extracted from monolithic run.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SERVER_PORT=8000
SERVER_DIR="server"

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

# Start server
start_server() {
    log "Starting server on port $SERVER_PORT..."
    
    if [ ! -d "$SERVER_DIR" ]; then
        error "Server directory not found: $SERVER_DIR"
        exit 1
    fi
    
    cd "$SERVER_DIR"
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        log "Installing server dependencies..."
        npm install
    fi
    
    # Start server in background
    nohup npm run dev > ../logs/server.log 2>&1 &
    local server_pid=$!
    
    log "Server started with PID: $server_pid"
    echo $server_pid > ../logs/server.pid
    
    cd ..
}

# Stop server
stop_server() {
    log "Stopping server..."
    
    # Try to stop using PID file
    if [ -f "logs/server.pid" ]; then
        local pid=$(cat logs/server.pid)
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid
            rm logs/server.pid
            log "Server stopped (PID: $pid)"
        else
            warn "Server PID file exists but process not found"
            rm logs/server.pid
        fi
    fi
    
    # Force kill on port
    kill_port $SERVER_PORT
}

# Check server status
check_server() {
    local pid=$(lsof -ti:$SERVER_PORT 2>/dev/null)
    if [ ! -z "$pid" ]; then
        if curl -s --max-time 5 http://localhost:$SERVER_PORT/health > /dev/null 2>&1; then
            log "Server is running and responding (PID: $pid)"
            return 0
        else
            warn "Server process exists but not responding (PID: $pid)"
            return 1
        fi
    else
        error "Server is not running"
        return 1
    fi
}

# Main execution
case "${1:-}" in
    "start")
        start_server
        ;;
    "stop")
        stop_server
        ;;
    "restart")
        stop_server
        sleep 2
        start_server
        ;;
    "status")
        check_server
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac