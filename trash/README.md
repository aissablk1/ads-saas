# Internal Trash Management System

## Overview
This internal trash system provides safe file deletion and recovery capabilities for the ADS SaaS platform. It ensures that no files are permanently deleted without proper backup and tracking.

## Directory Structure
```
trash/
├── backups/          # Automatic backups before destructive operations
├── deleted/          # Files moved to trash by user/AI operations
├── temp/             # Temporary files and cache
├── trash-index.json  # Metadata and tracking information
└── README.md         # This documentation
```

## Features
- **Safe Deletion**: Files are moved to trash instead of being permanently deleted
- **Metadata Tracking**: Complete audit trail of all operations
- **Recovery System**: Easy restoration of deleted files
- **Retention Policies**: Automatic cleanup based on file types
- **Compression**: Storage optimization for large files
- **Encryption**: Optional encryption for sensitive data

## Usage

### For AI Agents
- NEVER use direct deletion commands (rm, del, unlink)
- ALWAYS use the trash system for file operations
- Check trash-index.json for current status
- Implement proper error handling for trash operations

### File Categories
- **Backups**: Automatic system backups (30-day retention)
- **Deleted**: User-initiated deletions (7-day retention)
- **Temp**: Temporary files (24-hour retention)

## Recovery Process
1. Check trash-index.json for file metadata
2. Locate file in appropriate trash subdirectory
3. Restore to original location with integrity verification
4. Update trash index and statistics

## Maintenance
- Automatic cleanup based on retention policies
- Size monitoring and alerts
- Integrity checks and repair
- Compression for storage optimization

## Security
- Access controls and permissions
- Audit logging for all operations
- Encryption for sensitive files
- Secure metadata storage 