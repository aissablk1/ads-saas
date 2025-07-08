#!/bin/bash

# Application Management Script
# Coordinates server and client management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="logs"

# Logging functions
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
error() { echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
info() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }

# Create logs directory if it doesn't exist
mkdir -p "$LOGS_DIR"

# Show logo
show_logo() {
    echo -e "${CYAN}"
    echo "  █████╗ ██████╗ ███████╗    ███████╗ █████╗  █████╗ ███████╗"
    echo " ██╔══██╗██╔══██╗██╔════╝    ██╔════╝██╔══██╗██╔══██╗██╔════╝"
    echo " ███████║██║  ██║███████╗    ███████╗███████║███████║███████╗"
    echo " ██╔══██║██║  ██║╚════██║    ╚════██║██╔══██║██╔══██║╚════██║"
    echo " ██║  ██║██████╔╝███████║    ███████║██║  ██║██║  ██║███████║"
    echo " ╚═╝  ╚═╝╚═════╝ ╚══════╝    ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝"
    echo -e "${NC}"
    echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}           ADS SaaS Application Management                  ${NC}"
    echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
    echo
}

# Start both services
start_all() {
    log "Starting ADS SaaS application..."
    
    # Start server
    info "Starting server..."
    bash "$SCRIPT_DIR/server-management.sh" start
    
    # Wait a bit for server to start
    sleep 3
    
    # Start client
    info "Starting client..."
    bash "$SCRIPT_DIR/client-management.sh" start
    
    # Wait a bit for client to start
    sleep 5
    
    # Check status
    status_all
}

# Stop both services
stop_all() {
    log "Stopping ADS SaaS application..."
    
    # Stop client
    info "Stopping client..."
    bash "$SCRIPT_DIR/client-management.sh" stop
    
    # Stop server
    info "Stopping server..."
    bash "$SCRIPT_DIR/server-management.sh" stop
    
    log "Application stopped"
}

# Restart both services
restart_all() {
    log "Restarting ADS SaaS application..."
    stop_all
    sleep 2
    start_all
}

# Check status of both services
status_all() {
    info "Checking application status..."
    echo
    
    # Check server
    if bash "$SCRIPT_DIR/server-management.sh" status > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server Backend:${NC} Running (http://localhost:8000)"
    else
        echo -e "${RED}❌ Server Backend:${NC} Not running"
    fi
    
    # Check client
    if bash "$SCRIPT_DIR/client-management.sh" status > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Client Frontend:${NC} Running (http://localhost:3000)"
    else
        echo -e "${RED}❌ Client Frontend:${NC} Not running"
    fi
    
    echo
    echo -e "${CYAN}📍 URLs:${NC}"
    echo -e "   Frontend: ${YELLOW}http://localhost:3000${NC}"
    echo -e "   Backend:  ${YELLOW}http://localhost:8000${NC}"
    echo -e "   API Docs: ${YELLOW}http://localhost:8000/docs${NC}"
    echo
}

# Build for production
build_all() {
    log "Building ADS SaaS application for production..."
    
    # Build client
    info "Building client..."
    bash "$SCRIPT_DIR/client-management.sh" build
    
    # Build server (if needed)
    info "Building server..."
    cd server && npm run build && cd ..
    
    log "Build completed"
}

# Show help
show_help() {
    echo "ADS SaaS Application Management"
    echo
    echo "Usage: $0 {start|stop|restart|status|build|help}"
    echo
    echo "Commands:"
    echo "  start    - Start both server and client"
    echo "  stop     - Stop both server and client"
    echo "  restart  - Restart both server and client"
    echo "  status   - Check status of both services"
    echo "  build    - Build for production"
    echo "  help     - Show this help message"
    echo
}

# Main execution
case "${1:-}" in
    "start")
        show_logo
        start_all
        ;;
    "stop")
        stop_all
        ;;
    "restart")
        restart_all
        ;;
    "status")
        status_all
        ;;
    "build")
        build_all
        ;;
    "help")
        show_help
        ;;
    *)
        show_help
        exit 1
        ;;
esac