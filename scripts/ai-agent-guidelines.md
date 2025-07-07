# AI Agent Operational Guidelines for ADS SaaS Platform

## Critical AI Agent Rules

### Core Principles
- **Autonomous Operation**: Make decisions independently without constant confirmation
- **Error Correction**: Correct errors intelligently and continue with alternative approaches
- **Production-First**: Always prioritize production server requirements over development conveniences
- **Security-First**: Implement security-first practices for all online deployments
- **Defensive Programming**: Assume hostile environments and implement robust error handling
- **Trash Management**: NEVER delete files directly - always use the internal trash system

### File Operations Protocol
- **NEVER** use direct deletion commands (rm, del, unlink)
- **ALWAYS** use the trash system: `./scripts/trash-manager.sh delete <file_path>`
- Create timestamped backups before any destructive operation
- Maintain comprehensive audit trails of all operations
- Implement automatic rollback mechanisms for critical changes
- Always verify system integrity after modifications

## Online Server Critical Considerations

### Production Environment Specifics
- **Server Hardening**: Implement proper security baselines and hardening procedures
- **Monitoring & Alerting**: Set up comprehensive monitoring for all server components
- **Backup & Recovery**: Implement automated backup and disaster recovery procedures
- **Logging & Analysis**: Set up proper log aggregation and analysis systems
- **Performance Monitoring**: Implement real-time performance monitoring and optimization
- **Security Scanning**: Regular security scanning and automated patching
- **Access Controls**: Proper authentication and authorization for all server access
- **Configuration Management**: Secure configuration management and secrets handling
- **Capacity Planning**: Implement proper capacity planning and auto-scaling
- **Incident Response**: Set up proper incident response and recovery procedures

### Network Infrastructure Criticals
- **Redundancy & Failover**: Implement proper network redundancy and failover mechanisms
- **Network Monitoring**: Comprehensive network monitoring and alerting
- **Security & Firewalls**: Next-generation firewalls with deep packet inspection
- **Access Controls**: Proper network access controls and segmentation
- **Performance Optimization**: Network performance monitoring and optimization
- **Backup & Recovery**: Network configuration backup and recovery procedures
- **Incident Response**: Network incident response and recovery procedures
- **Compliance & Audit**: Network compliance and audit procedures
- **Documentation**: Comprehensive network documentation and runbooks
- **Change Management**: Proper network change management and approval workflows

### Database Production Requirements
- **Backup & Recovery**: Automated database backup and recovery procedures
- **Monitoring & Alerting**: Database performance monitoring and alerting
- **Security & Access**: Database security and access controls
- **Performance Optimization**: Database performance optimization and tuning
- **Replication & Failover**: Database replication and failover mechanisms
- **Incident Response**: Database incident response and recovery
- **Compliance & Audit**: Database compliance and audit procedures
- **Documentation**: Database documentation and runbooks
- **Change Management**: Database change management and approval workflows
- **Testing & Validation**: Database testing and validation procedures

### Application Production Criticals
- **Monitoring & Alerting**: Application performance monitoring and alerting
- **Security & Access**: Application security and access controls
- **Performance Optimization**: Application performance optimization
- **Backup & Recovery**: Application backup and recovery procedures
- **Incident Response**: Application incident response and recovery
- **Compliance & Audit**: Application compliance and audit procedures
- **Documentation**: Application documentation and runbooks
- **Change Management**: Application change management and approval workflows
- **Testing & Validation**: Application testing and validation procedures
- **Communication**: Proper communication protocols and notification systems

## Security Framework

### Threat Modeling & Risk Assessment
- **STRIDE Methodology**: Implement comprehensive threat modeling
- **Security Audits**: Regular security risk assessments and penetration testing
- **Security-by-Design**: Implement security principles from architecture phase
- **OWASP Top 10**: Use as minimum security baseline
- **Compliance Checks**: Regular security audits and compliance checks
- **Incident Response**: Proper security incident response procedures
- **Threat Intelligence**: Use threat intelligence feeds for proactive defense
- **Security Metrics**: Implement proper security metrics and KPIs
- **Red Team Exercises**: Regular red team exercises and purple team collaboration

### Advanced Authentication & Authorization
- **Multi-Factor Authentication**: MFA for all user accounts
- **Hardware Security Keys**: FIDO2/WebAuthn for critical operations
- **Password Policies**: Minimum 12 characters with complexity requirements
- **Session Management**: Proper session management with automatic timeout
- **OAuth 2.0**: Use OAuth 2.0 and OpenID Connect for third-party authentication
- **Role-Based Access Control**: Implement proper RBAC
- **Attribute-Based Access Control**: Use ABAC for fine-grained permissions
- **Privilege Escalation**: Implement proper privilege escalation controls
- **Account Lockout**: Implement proper account lockout mechanisms
- **Audit Logging**: Proper audit logging for all authentication events

### Data Protection & Encryption
- **End-to-End Encryption**: Implement for sensitive data
- **AES-256**: Use for data at rest encryption
- **Key Management**: Proper key management and rotation procedures
- **Hardware Security Modules**: Use HSM for key storage
- **Data Classification**: Implement proper data classification and labeling
- **TLS 1.3**: Use secure data transmission protocols
- **Data Anonymization**: Implement proper data anonymization and pseudonymization
- **Secure Destruction**: Use secure data destruction procedures
- **Backup Encryption**: Implement proper backup encryption and secure storage
- **Data Loss Prevention**: Implement proper DLP systems

## Performance & Scalability

### Caching Strategies
- **Redis**: Implement Redis for session and data caching
- **CDN**: Use CDN for static assets and media files
- **Browser Caching**: Implement proper browser caching strategies
- **Cache Invalidation**: Implement proper cache invalidation strategies
- **Distributed Caching**: Use distributed caching for scalability

### Database Optimization
- **Indexing**: Implement proper database indexing
- **Query Optimization**: Optimize database queries with EXPLAIN analysis
- **Read Replicas**: Use database read replicas for heavy read operations
- **Connection Pooling**: Implement proper database connection pooling
- **Pagination**: Implement proper pagination for large datasets

### Application Performance
- **Code Splitting**: Implement code splitting and bundle optimization
- **Image Optimization**: Optimize images and implement lazy loading
- **Compression**: Use compression (gzip, brotli) for all responses
- **Service Workers**: Use service workers for offline functionality
- **Resource Preloading**: Implement proper resource preloading

## Monitoring & Maintenance

### Error Tracking & Alerting
- **Comprehensive Error Tracking**: Implement comprehensive error tracking and alerting
- **Performance Monitoring**: Performance monitoring and metrics collection
- **Automated Backup Systems**: Implement automated backup systems
- **Log Aggregation**: Implement log aggregation and analysis
- **Health Checks**: Implement health check endpoints
- **Graceful Degradation**: Implement graceful degradation strategies
- **Zero-Downtime Deployment**: Implement zero-downtime deployment procedures

### APM & Distributed Tracing
- **Application Performance Monitoring**: Implement proper APM
- **Distributed Tracing**: Use distributed tracing for microservices
- **Log Rotation**: Implement proper log rotation and retention policies
- **Automated Alerting**: Set up automated alerting for critical metrics
- **Synthetic Monitoring**: Use synthetic monitoring for user experience

## Emergency Procedures

### Critical Error Response
1. **Immediate Fallback**: Implement immediate fallback mechanisms
2. **Error Logging**: Log detailed error information for debugging
3. **User Communication**: Provide user-friendly error messages
4. **System Stability**: Maintain system stability above all else
5. **Rollback Strategies**: Consider rollback strategies for failed deployments
6. **Incident Response**: Activate incident response procedures immediately
7. **Stakeholder Notification**: Notify stakeholders and users appropriately
8. **Evidence Preservation**: Preserve evidence for post-incident analysis
9. **Communication Channels**: Implement proper communication channels
10. **Documentation**: Document all actions taken during the incident

## AI-Specific Considerations

### File System Operations
- **Permission Validation**: Always validate file system permissions before operations
- **Error Recovery**: Implement proper error recovery mechanisms for failed operations
- **Timeout Handling**: Use proper timeout handling for all external API calls
- **Retry Logic**: Implement proper retry logic with exponential backoff
- **Memory Management**: Consider memory usage and implement proper cleanup

### Async Operations
- **Async/Await Patterns**: Use proper async/await patterns to avoid blocking operations
- **Logging**: Implement proper logging for all AI agent actions
- **Timezone Issues**: Consider timezone and locale issues in all operations
- **Configuration Validation**: Implement proper validation for all configuration values
- **Error Codes**: Use proper error codes and messages for debugging

### Security Implications
- **File Operations**: Consider security implications of all file operations
- **Backup Creation**: Implement proper backup before making destructive changes
- **Environment Variables**: Use proper environment variable validation
- **Performance Impact**: Consider performance impact of all operations
- **Temporary Files**: Implement proper cleanup of temporary files and resources

## Trash Management System

### Usage Protocol
- **Safe Deletion**: Use `./scripts/trash-manager.sh delete <file_path>`
- **Recovery**: Use `./scripts/trash-manager.sh recover <item_id>`
- **Listing**: Use `./scripts/trash-manager.sh list [category]`
- **Cleanup**: Use `./scripts/trash-manager.sh cleanup [force]`
- **Statistics**: Use `./scripts/trash-manager.sh stats`

### Categories
- **Backups**: Automatic system backups (30-day retention)
- **Deleted**: User-initiated deletions (7-day retention)
- **Temp**: Temporary files (24-hour retention)

### Features
- **Metadata Tracking**: Complete audit trail of all operations
- **Recovery System**: Easy restoration of deleted files
- **Retention Policies**: Automatic cleanup based on file types
- **Compression**: Storage optimization for large files
- **Encryption**: Optional encryption for sensitive data

## Remember

This is a production SaaS platform - every decision must consider:
- **Real Users**: Impact on actual users and their data
- **Data Security**: Protection of sensitive user information
- **System Reliability**: Maintaining high availability and performance
- **Compliance**: Meeting regulatory and legal requirements
- **Scalability**: Ability to handle growth and increased load

Always think like a security expert and systems administrator, not just a developer. Assume every system is compromised and design defense in depth accordingly. NEVER delete files directly - always use the internal trash system for safe file management. 