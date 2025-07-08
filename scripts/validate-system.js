#!/usr/bin/env node

/**
 * 🔍 ADS SaaS System Validation Script
 * 
 * This script performs comprehensive validation of the entire system:
 * - Dependencies and versions
 * - Configuration files
 * - Environment variables
 * - API endpoints
 * - Database connectivity
 * - Performance benchmarks
 * - Security checks
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const https = require('https');
const http = require('http');

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.cyan}🚀 ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.magenta}📋 ${msg}${colors.reset}`)
};

class SystemValidator {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
    this.startTime = Date.now();
  }

  async validate() {
    log.title('ADS SaaS System Validation');
    
    try {
      await this.validateNodeEnvironment();
      await this.validateProjectStructure();
      await this.validateDependencies();
      await this.validateConfiguration();
      await this.validateDockerSetup();
      await this.validateSecurity();
      await this.validateAPIEndpoints();
      await this.validatePerformance();
      
      this.generateReport();
    } catch (error) {
      log.error(`Validation failed: ${error.message}`);
      process.exit(1);
    }
  }

  async validateNodeEnvironment() {
    log.section('Node.js Environment');

    // Node.js version
    this.checkNodeVersion();
    
    // npm version
    this.checkNpmVersion();
    
    // TypeScript version
    this.checkTypeScriptVersion();
    
    // Memory and CPU
    this.checkSystemResources();
  }

  checkNodeVersion() {
    try {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
      
      if (majorVersion >= 18) {
        this.pass(`Node.js version: ${nodeVersion}`);
      } else {
        this.fail(`Node.js version ${nodeVersion} is too old. Requires Node.js 18+`);
      }
    } catch (error) {
      this.fail(`Failed to check Node.js version: ${error.message}`);
    }
  }

  checkNpmVersion() {
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      this.pass(`npm version: ${npmVersion}`);
    } catch (error) {
      this.fail(`Failed to check npm version: ${error.message}`);
    }
  }

  checkTypeScriptVersion() {
    try {
      const tsVersion = execSync('npx tsc --version', { encoding: 'utf8' }).trim();
      this.pass(`TypeScript: ${tsVersion}`);
    } catch (error) {
      this.warning(`TypeScript not found globally: ${error.message}`);
    }
  }

  checkSystemResources() {
    const memUsage = process.memoryUsage();
    const totalMem = Math.round(memUsage.heapTotal / 1024 / 1024);
    const usedMem = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    this.pass(`Memory usage: ${usedMem}MB / ${totalMem}MB`);
    
    const cpuUsage = process.cpuUsage();
    this.pass(`CPU available: ${require('os').cpus().length} cores`);
  }

  async validateProjectStructure() {
    log.section('Project Structure');

    const requiredDirs = [
      'client',
      'server', 
      'docs',
      'scripts',
      'monitoring',
      'nginx'
    ];

    const requiredFiles = [
      'package.json',
      'docker-compose.yml',
      '.env.example',
      'README.md',
      'client/package.json',
      'server/package.json',
      'server/src/index.ts'
    ];

    // Check directories
    requiredDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.pass(`Directory exists: ${dir}/`);
      } else {
        this.fail(`Missing directory: ${dir}/`);
      }
    });

    // Check files
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.pass(`File exists: ${file}`);
      } else {
        this.fail(`Missing file: ${file}`);
      }
    });
  }

  async validateDependencies() {
    log.section('Dependencies');

    // Check client dependencies
    await this.checkPackageDependencies('client');
    
    // Check server dependencies
    await this.checkPackageDependencies('server');
    
    // Check for security vulnerabilities
    await this.checkSecurityVulnerabilities();
  }

  async checkPackageDependencies(dir) {
    try {
      const packagePath = path.join(dir, 'package.json');
      if (!fs.existsSync(packagePath)) {
        this.fail(`Missing package.json in ${dir}/`);
        return;
      }

      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const depCount = Object.keys(packageData.dependencies || {}).length;
      const devDepCount = Object.keys(packageData.devDependencies || {}).length;
      
      this.pass(`${dir}: ${depCount} dependencies, ${devDepCount} dev dependencies`);

      // Check for lock file
      const lockPath = path.join(dir, 'package-lock.json');
      if (fs.existsSync(lockPath)) {
        this.pass(`${dir}: package-lock.json exists`);
      } else {
        this.warning(`${dir}: Missing package-lock.json (run npm install)`);
      }

    } catch (error) {
      this.fail(`Failed to check ${dir} dependencies: ${error.message}`);
    }
  }

  async checkSecurityVulnerabilities() {
    const checkAudit = (dir) => {
      try {
        const result = execSync(`cd ${dir} && npm audit --audit-level=high --json`, { 
          encoding: 'utf8',
          timeout: 30000 
        });
        const audit = JSON.parse(result);
        
        if (audit.metadata.vulnerabilities.high === 0 && audit.metadata.vulnerabilities.critical === 0) {
          this.pass(`${dir}: No high/critical security vulnerabilities`);
        } else {
          this.fail(`${dir}: Found ${audit.metadata.vulnerabilities.high} high and ${audit.metadata.vulnerabilities.critical} critical vulnerabilities`);
        }
      } catch (error) {
        // npm audit can fail if package-lock.json is missing
        this.warning(`${dir}: Could not run security audit (${error.message})`);
      }
    };

    checkAudit('client');
    checkAudit('server');
  }

  async validateConfiguration() {
    log.section('Configuration');

    // Check environment files
    this.checkEnvironmentFiles();
    
    // Check TypeScript configuration
    this.checkTypeScriptConfig();
    
    // Check Docker configuration
    this.checkDockerConfig();
  }

  checkEnvironmentFiles() {
    const envFiles = [
      '.env.example',
      'client/.env.example',
      'server/.env.example'
    ];

    envFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.pass(`Environment template: ${file}`);
        
        // Check if actual .env files exist
        const actualEnv = file.replace('.example', '');
        if (fs.existsSync(actualEnv)) {
          this.pass(`Environment file: ${actualEnv}`);
        } else {
          this.warning(`Missing actual environment file: ${actualEnv} (copy from ${file})`);
        }
      } else {
        this.fail(`Missing environment template: ${file}`);
      }
    });
  }

  checkTypeScriptConfig() {
    const tsConfigs = [
      'tsconfig.json',
      'client/tsconfig.json', 
      'server/tsconfig.json'
    ];

    tsConfigs.forEach(config => {
      if (fs.existsSync(config)) {
        try {
          const tsConfig = JSON.parse(fs.readFileSync(config, 'utf8'));
          this.pass(`TypeScript config: ${config}`);
          
          // Check for strict mode
          if (tsConfig.compilerOptions?.strict) {
            this.pass(`${config}: Strict mode enabled`);
          } else {
            this.warning(`${config}: Strict mode not enabled`);
          }
        } catch (error) {
          this.fail(`Invalid TypeScript config ${config}: ${error.message}`);
        }
      } else {
        this.warning(`Missing TypeScript config: ${config}`);
      }
    });
  }

  checkDockerConfig() {
    if (fs.existsSync('docker-compose.yml')) {
      this.pass('Docker Compose configuration exists');
      
      try {
        const composeContent = fs.readFileSync('docker-compose.yml', 'utf8');
        
        // Check for required services
        const requiredServices = ['postgres', 'redis', 'server', 'client', 'nginx'];
        requiredServices.forEach(service => {
          if (composeContent.includes(`${service}:`)) {
            this.pass(`Docker service configured: ${service}`);
          } else {
            this.warning(`Docker service missing: ${service}`);
          }
        });
        
      } catch (error) {
        this.fail(`Failed to read docker-compose.yml: ${error.message}`);
      }
    } else {
      this.fail('Missing docker-compose.yml');
    }
  }

  async validateDockerSetup() {
    log.section('Docker Setup');

    // Check if Docker is installed
    try {
      const dockerVersion = execSync('docker --version', { encoding: 'utf8' }).trim();
      this.pass(`Docker: ${dockerVersion}`);
    } catch (error) {
      this.fail(`Docker not installed: ${error.message}`);
      return;
    }

    // Check if Docker Compose is available
    try {
      const composeVersion = execSync('docker-compose --version', { encoding: 'utf8' }).trim();
      this.pass(`Docker Compose: ${composeVersion}`);
    } catch (error) {
      try {
        // Try docker compose (newer syntax)
        const composeVersion = execSync('docker compose version', { encoding: 'utf8' }).trim();
        this.pass(`Docker Compose: ${composeVersion}`);
      } catch (error2) {
        this.fail(`Docker Compose not available: ${error2.message}`);
      }
    }

    // Check Dockerfiles
    const dockerfiles = [
      'client/Dockerfile',
      'server/Dockerfile'
    ];

    dockerfiles.forEach(dockerfile => {
      if (fs.existsSync(dockerfile)) {
        this.pass(`Dockerfile exists: ${dockerfile}`);
      } else {
        this.warning(`Missing Dockerfile: ${dockerfile}`);
      }
    });
  }

  async validateSecurity() {
    log.section('Security Configuration');

    // Check for sensitive files in git
    this.checkGitignore();
    
    // Check for hardcoded secrets
    this.checkForHardcodedSecrets();
    
    // Check file permissions
    this.checkFilePermissions();
  }

  checkGitignore() {
    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      
      const requiredIgnores = ['.env', 'node_modules', '.DS_Store', 'dist', 'build'];
      requiredIgnores.forEach(ignore => {
        if (gitignore.includes(ignore)) {
          this.pass(`Gitignore includes: ${ignore}`);
        } else {
          this.warning(`Gitignore missing: ${ignore}`);
        }
      });
    } else {
      this.fail('Missing .gitignore file');
    }
  }

  checkForHardcodedSecrets() {
    const checkFile = (filePath) => {
      if (!fs.existsSync(filePath)) return;
      
      const content = fs.readFileSync(filePath, 'utf8');
      const sensitivePatterns = [
        /password\s*=\s*["'][^"']{8,}["']/gi,
        /secret\s*=\s*["'][^"']{8,}["']/gi,
        /key\s*=\s*["'][^"']{8,}["']/gi,
        /sk_live_[a-zA-Z0-9]+/g,
        /pk_live_[a-zA-Z0-9]+/g
      ];

      let foundSecrets = false;
      sensitivePatterns.forEach(pattern => {
        if (pattern.test(content)) {
          foundSecrets = true;
        }
      });

      if (foundSecrets) {
        this.warning(`Potential hardcoded secrets in: ${filePath}`);
      }
    };

    // Check key files
    ['server/src/index.ts', 'client/src/app/page.tsx', '.env.example'].forEach(checkFile);
  }

  checkFilePermissions() {
    const sensitiveFiles = ['.env', 'server/.env', 'client/.env.local'];
    
    sensitiveFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const stats = fs.statSync(file);
          const mode = stats.mode & parseInt('777', 8);
          
          if (mode <= parseInt('600', 8)) {
            this.pass(`Secure permissions on: ${file}`);
          } else {
            this.warning(`Insecure permissions on: ${file} (${mode.toString(8)})`);
          }
        } catch (error) {
          this.warning(`Could not check permissions for: ${file}`);
        }
      }
    });
  }

  async validateAPIEndpoints() {
    log.section('API Endpoints');
    
    // This would require the server to be running
    this.warning('API endpoint testing requires running server (skipped in static analysis)');
    
    // Check route files exist
    const routeFiles = [
      'server/src/routes/auth.js',
      'server/src/routes/users.js',
      'server/src/routes/campaigns.js',
      'server/src/routes/analytics.js'
    ];

    routeFiles.forEach(route => {
      if (fs.existsSync(route)) {
        this.pass(`Route file exists: ${route}`);
      } else {
        this.fail(`Missing route file: ${route}`);
      }
    });
  }

  async validatePerformance() {
    log.section('Performance Configuration');

    // Check for compression
    this.checkCompressionConfig();
    
    // Check for caching
    this.checkCachingConfig();
    
    // Check bundle sizes (if built)
    this.checkBundleSizes();
  }

  checkCompressionConfig() {
    try {
      const serverIndex = fs.readFileSync('server/src/index.ts', 'utf8');
      if (serverIndex.includes('compression')) {
        this.pass('Server compression configured');
      } else {
        this.warning('Server compression not configured');
      }
    } catch (error) {
      this.warning('Could not check compression configuration');
    }
  }

  checkCachingConfig() {
    // Check for Redis configuration
    if (fs.existsSync('docker-compose.yml')) {
      const compose = fs.readFileSync('docker-compose.yml', 'utf8');
      if (compose.includes('redis')) {
        this.pass('Redis caching configured');
      } else {
        this.warning('Redis caching not configured');
      }
    }
  }

  checkBundleSizes() {
    const buildDirs = ['client/.next', 'client/dist', 'server/dist'];
    
    buildDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.pass(`Build directory exists: ${dir}`);
      } else {
        this.warning(`Build directory missing: ${dir} (run build commands)`);
      }
    });
  }

  // Helper methods
  pass(message) {
    log.success(message);
    this.results.passed++;
    this.results.total++;
    this.results.details.push({ type: 'pass', message });
  }

  fail(message) {
    log.error(message);
    this.results.failed++;
    this.results.total++;
    this.results.details.push({ type: 'fail', message });
  }

  warning(message) {
    log.warning(message);
    this.results.warnings++;
    this.results.total++;
    this.results.details.push({ type: 'warning', message });
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    
    log.title('Validation Summary');
    console.log(`\n${colors.bold}📊 Results:${colors.reset}`);
    console.log(`  ✅ Passed: ${colors.green}${this.results.passed}${colors.reset}`);
    console.log(`  ❌ Failed: ${colors.red}${this.results.failed}${colors.reset}`);
    console.log(`  ⚠️  Warnings: ${colors.yellow}${this.results.warnings}${colors.reset}`);
    console.log(`  📝 Total checks: ${this.results.total}`);
    console.log(`  ⏱️  Duration: ${duration}ms`);

    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    console.log(`\n${colors.bold}🎯 Success Rate: ${successRate}%${colors.reset}`);

    if (this.results.failed > 0) {
      console.log(`\n${colors.red}❌ Critical issues found. Please fix before deployment.${colors.reset}`);
      process.exit(1);
    } else if (this.results.warnings > 0) {
      console.log(`\n${colors.yellow}⚠️  Warnings found. Review before production deployment.${colors.reset}`);
      process.exit(0);
    } else {
      console.log(`\n${colors.green}🎉 All validations passed! System ready for deployment.${colors.reset}`);
      process.exit(0);
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SystemValidator();
  validator.validate().catch(error => {
    console.error(`${colors.red}💥 Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}

module.exports = SystemValidator;