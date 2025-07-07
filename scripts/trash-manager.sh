#!/bin/bash

# Internal Trash Management System for ADS SaaS
# This script provides safe file deletion and recovery capabilities

set -euo pipefail

TRASH_DIR="./trash"
TRASH_INDEX="$TRASH_DIR/trash-index.json"
TRASH_BACKUPS="$TRASH_DIR/backups"
TRASH_DELETED="$TRASH_DIR/deleted"
TRASH_TEMP="$TRASH_DIR/temp"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Initialize trash system
init_trash() {
    if [[ ! -d "$TRASH_DIR" ]]; then
        log "Initializing trash system..."
        mkdir -p "$TRASH_BACKUPS" "$TRASH_DELETED" "$TRASH_TEMP"
        
        if [[ ! -f "$TRASH_INDEX" ]]; then
            cat > "$TRASH_INDEX" << 'EOF'
{
  "trash_system": {
    "version": "1.0.0",
    "created": "",
    "last_updated": "",
    "total_items": 0,
    "total_size_bytes": 0,
    "retention_policy": {
      "backups": "30_days",
      "deleted": "7_days",
      "temp": "24_hours"
    },
    "compression_enabled": true,
    "encryption_enabled": false,
    "max_size_mb": 1024
  },
  "items": [],
  "statistics": {
    "backups_count": 0,
    "deleted_count": 0,
    "temp_count": 0,
    "recovered_count": 0,
    "permanently_deleted_count": 0
  }
}
EOF
            # Update timestamps
            jq --arg now "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
               '.trash_system.created = $now | .trash_system.last_updated = $now' \
               "$TRASH_INDEX" > "$TRASH_INDEX.tmp" && mv "$TRASH_INDEX.tmp" "$TRASH_INDEX"
        fi
        success "Trash system initialized"
    fi
}

# Safe delete function
safe_delete() {
    local source_path="$1"
    local reason="${2:-AI_operation}"
    local category="${3:-deleted}"
    
    if [[ ! -e "$source_path" ]]; then
        error "File/directory does not exist: $source_path"
        return 1
    fi
    
    init_trash
    
    local filename=$(basename "$source_path")
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local unique_id=$(uuidgen 2>/dev/null || date +%s%N)
    local target_dir="$TRASH_DIR/$category"
    local target_path="$target_dir/${unique_id}_${filename}"
    
    # Create backup before moving
    if [[ "$category" == "deleted" ]]; then
        local backup_path="$TRASH_BACKUPS/${unique_id}_${filename}.backup"
        log "Creating backup: $backup_path"
        if [[ -d "$source_path" ]]; then
            cp -r "$source_path" "$backup_path"
        else
            cp "$source_path" "$backup_path"
        fi
    fi
    
    # Move to trash
    log "Moving to trash: $source_path -> $target_path"
    mv "$source_path" "$target_path"
    
    # Update trash index
    local file_size=$(du -sb "$target_path" 2>/dev/null | cut -f1 || echo "0")
    local file_type=$(file -b "$target_path" 2>/dev/null || echo "unknown")
    
    local new_item=$(jq -n \
        --arg id "$unique_id" \
        --arg original_path "$source_path" \
        --arg trash_path "$target_path" \
        --arg filename "$filename" \
        --arg timestamp "$timestamp" \
        --arg reason "$reason" \
        --arg category "$category" \
        --arg size "$file_size" \
        --arg type "$file_type" \
        '{
            id: $id,
            original_path: $original_path,
            trash_path: $trash_path,
            filename: $filename,
            timestamp: $timestamp,
            reason: $reason,
            category: $category,
            size_bytes: ($size | tonumber),
            file_type: $type,
            recovered: false
        }')
    
    # Add to trash index
    jq --argjson item "$new_item" \
       '.items += [$item] | 
        .trash_system.total_items += 1 | 
        .trash_system.total_size_bytes += $item.size_bytes |
        .trash_system.last_updated = "'$timestamp'" |
        .statistics.'$category'_count += 1' \
       "$TRASH_INDEX" > "$TRASH_INDEX.tmp" && mv "$TRASH_INDEX.tmp" "$TRASH_INDEX"
    
    success "Safely deleted: $source_path"
    log "Trash item ID: $unique_id"
}

# Recovery function
recover() {
    local item_id="$1"
    local target_path="${2:-}"
    
    if [[ ! -f "$TRASH_INDEX" ]]; then
        error "Trash index not found"
        return 1
    fi
    
    local item_data=$(jq -r --arg id "$item_id" '.items[] | select(.id == $id)' "$TRASH_INDEX")
    
    if [[ -z "$item_data" ]]; then
        error "Item not found in trash: $item_id"
        return 1
    fi
    
    local trash_path=$(echo "$item_data" | jq -r '.trash_path')
    local original_path=$(echo "$item_data" | jq -r '.original_path')
    local filename=$(echo "$item_data" | jq -r '.filename')
    
    if [[ -z "$target_path" ]]; then
        target_path="$original_path"
    fi
    
    if [[ -e "$target_path" ]]; then
        error "Target path already exists: $target_path"
        return 1
    fi
    
    if [[ ! -e "$trash_path" ]]; then
        error "Trash file not found: $trash_path"
        return 1
    fi
    
    # Recover the file
    log "Recovering: $trash_path -> $target_path"
    mv "$trash_path" "$target_path"
    
    # Update trash index
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    jq --arg id "$item_id" \
       --arg timestamp "$timestamp" \
       '(.items[] | select(.id == $id)).recovered = true |
        .trash_system.last_updated = $timestamp |
        .statistics.recovered_count += 1' \
       "$TRASH_INDEX" > "$TRASH_INDEX.tmp" && mv "$TRASH_INDEX.tmp" "$TRASH_INDEX"
    
    success "Recovered: $target_path"
}

# List trash contents
list_trash() {
    local category="${1:-all}"
    
    if [[ ! -f "$TRASH_INDEX" ]]; then
        error "Trash index not found"
        return 1
    fi
    
    log "Trash contents (category: $category):"
    echo "=================================="
    
    if [[ "$category" == "all" ]]; then
        jq -r '.items[] | "\(.id) | \(.filename) | \(.original_path) | \(.timestamp) | \(.category) | \(.size_bytes) bytes | \(.recovered)"' "$TRASH_INDEX" | \
        while IFS='|' read -r id filename original_path timestamp category size recovered; do
            printf "%-36s | %-20s | %-30s | %-19s | %-8s | %-8s | %s\n" \
                   "$id" "$filename" "$original_path" "$timestamp" "$category" "$size" "$recovered"
        done
    else
        jq -r --arg cat "$category" '.items[] | select(.category == $cat) | "\(.id) | \(.filename) | \(.original_path) | \(.timestamp) | \(.size_bytes) bytes | \(.recovered)"' "$TRASH_INDEX" | \
        while IFS='|' read -r id filename original_path timestamp size recovered; do
            printf "%-36s | %-20s | %-30s | %-19s | %-8s | %s\n" \
                   "$id" "$filename" "$original_path" "$timestamp" "$size" "$recovered"
        done
    fi
    
    echo "=================================="
    local stats=$(jq -r '.statistics | "Backups: \(.backups_count), Deleted: \(.deleted_count), Temp: \(.temp_count), Recovered: \(.recovered_count)"' "$TRASH_INDEX")
    log "Statistics: $stats"
}

# Cleanup old items
cleanup() {
    local force="${1:-false}"
    
    if [[ ! -f "$TRASH_INDEX" ]]; then
        error "Trash index not found"
        return 1
    fi
    
    log "Cleaning up old items..."
    
    local current_time=$(date -u +%s)
    local items_to_remove=()
    
    # Check retention policies
    while IFS= read -r item; do
        local id=$(echo "$item" | jq -r '.id')
        local timestamp=$(echo "$item" | jq -r '.timestamp')
        local category=$(echo "$item" | jq -r '.category')
        local recovered=$(echo "$item" | jq -r '.recovered')
        
        # Skip recovered items
        if [[ "$recovered" == "true" ]]; then
            continue
        fi
        
        # Calculate age in seconds
        local item_time=$(date -u -d "$timestamp" +%s 2>/dev/null || echo "0")
        local age=$((current_time - item_time))
        
        # Check retention policy
        local max_age=0
        case "$category" in
            "backups") max_age=$((30 * 24 * 3600)) ;; # 30 days
            "deleted") max_age=$((7 * 24 * 3600)) ;;  # 7 days
            "temp") max_age=$((24 * 3600)) ;;         # 24 hours
        esac
        
        if [[ $age -gt $max_age ]] || [[ "$force" == "true" ]]; then
            items_to_remove+=("$id")
        fi
    done < <(jq -c '.items[]' "$TRASH_INDEX")
    
    # Remove old items
    for id in "${items_to_remove[@]}"; do
        local item_data=$(jq -r --arg id "$id" '.items[] | select(.id == $id)' "$TRASH_INDEX")
        local trash_path=$(echo "$item_data" | jq -r '.trash_path')
        local category=$(echo "$item_data" | jq -r '.category')
        
        if [[ -e "$trash_path" ]]; then
            log "Removing old item: $id ($trash_path)"
            rm -rf "$trash_path"
        fi
        
        # Remove from index
        jq --arg id "$id" \
           'del(.items[] | select(.id == $id)) |
            .trash_system.total_items -= 1 |
            .statistics.permanently_deleted_count += 1' \
           "$TRASH_INDEX" > "$TRASH_INDEX.tmp" && mv "$TRASH_INDEX.tmp" "$TRASH_INDEX"
    done
    
    success "Cleanup completed. Removed ${#items_to_remove[@]} items."
}

# Show trash statistics
stats() {
    if [[ ! -f "$TRASH_INDEX" ]]; then
        error "Trash index not found"
        return 1
    fi
    
    log "Trash System Statistics:"
    echo "======================"
    
    local total_size=$(jq -r '.trash_system.total_size_bytes' "$TRASH_INDEX")
    local total_items=$(jq -r '.trash_system.total_items' "$TRASH_INDEX")
    local max_size=$(jq -r '.trash_system.max_size_mb' "$TRASH_INDEX")
    
    echo "Total items: $total_items"
    echo "Total size: $((total_size / 1024 / 1024)) MB / ${max_size} MB"
    echo "Usage: $((total_size * 100 / (max_size * 1024 * 1024)))%"
    echo ""
    
    jq -r '.statistics | "Backups: \(.backups_count)\nDeleted: \(.deleted_count)\nTemp: \(.temp_count)\nRecovered: \(.recovered_count)\nPermanently deleted: \(.permanently_deleted_count)"' "$TRASH_INDEX"
}

# Main function
main() {
    case "${1:-}" in
        "delete")
            if [[ -z "${2:-}" ]]; then
                error "Usage: $0 delete <file_path> [reason] [category]"
                exit 1
            fi
            safe_delete "$2" "${3:-AI_operation}" "${4:-deleted}"
            ;;
        "recover")
            if [[ -z "${2:-}" ]]; then
                error "Usage: $0 recover <item_id> [target_path]"
                exit 1
            fi
            recover "$2" "${3:-}"
            ;;
        "list")
            list_trash "${2:-all}"
            ;;
        "cleanup")
            cleanup "${2:-false}"
            ;;
        "stats")
            stats
            ;;
        "init")
            init_trash
            ;;
        *)
            echo "Internal Trash Management System"
            echo "Usage: $0 <command> [options]"
            echo ""
            echo "Commands:"
            echo "  delete <file> [reason] [category]  - Safely delete a file"
            echo "  recover <id> [target]             - Recover a deleted file"
            echo "  list [category]                   - List trash contents"
            echo "  cleanup [force]                   - Clean up old items"
            echo "  stats                             - Show statistics"
            echo "  init                              - Initialize trash system"
            echo ""
            echo "Categories: backups, deleted, temp"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 