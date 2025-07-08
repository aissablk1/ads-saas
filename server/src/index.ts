import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import cluster from 'cluster';
import os from 'os';

// Load environment variables first
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';  
import campaignRoutes from './routes/campaigns.js';
import analyticsRoutes from './routes/analytics.js';
import subscriptionRoutes from './routes/subscriptions.js';
import notificationRoutes from './routes/notifications.js';
import fileRoutes from './routes/files.js';
import integrationRoutes from './routes/integrations.js';
import sitemapRoutes from './routes/sitemap.js';
import adminRoutes from './routes/admin.js';

// Middleware
import errorHandler from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

const app = express();
const PORT = parseInt(process.env.PORT || '8000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLUSTER_MODE = process.env.CLUSTER_MODE === 'true' && NODE_ENV === 'production';

// Cluster mode for production scaling
if (CLUSTER_MODE && cluster.isPrimary) {
  console.log(`🚀 Master process ${process.pid} is running`);
  
  const numCPUs = os.cpus().length;
  const workers = Math.min(numCPUs, 4); // Limit to 4 workers max
  
  for (let i = 0; i < workers; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`💥 Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  startServer();
}

function startServer() {
  // Trust proxy for rate limiting and IP detection
  app.set('trust proxy', 1);

  // Enhanced security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000']
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Compression middleware with optimized settings
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    }
  }));

  // Enhanced rate limiting with different tiers
  const createRateLimit = (windowMs: number, max: number, message: string) => 
    rateLimit({
      windowMs,
      max,
      message: { error: message },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          error: message,
          retryAfter: Math.round(windowMs / 1000)
        });
      }
    });

  // Global rate limiting
  app.use('/api', createRateLimit(
    parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    'Trop de requêtes depuis cette IP, réessayez dans 15 minutes.'
  ));

  // Stricter rate limiting for auth endpoints
  app.use('/api/auth', createRateLimit(
    5 * 60 * 1000, // 5 minutes
    10, // 10 requests per 5 minutes
    'Trop de tentatives de connexion, réessayez dans 5 minutes.'
  ));

  // Enhanced logging
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'server.log'), 
    { flags: 'a' }
  );

  const logFormat = NODE_ENV === 'production' 
    ? 'combined' 
    : process.env.LOG_FORMAT || 'dev';

  app.use(morgan(logFormat, { 
    stream: accessLogStream,
    skip: (req, res) => res.statusCode < 400 && NODE_ENV === 'production'
  }));

  if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // CORS with enhanced security
  app.use(cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000'
      ];
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Non autorisé par CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Body parsing with size limits
  app.use(express.json({ 
    limit: process.env.MAX_JSON_SIZE || '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ 
    extended: true,
    limit: process.env.MAX_URL_ENCODED_SIZE || '10mb'
  }));

  // Request ID middleware for tracking
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.id = Math.random().toString(36).substr(2, 9);
    res.setHeader('X-Request-ID', req.id);
    next();
  });

  // Performance monitoring middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 1000) { // Log slow requests
        console.warn(`🐌 Slow request: ${req.method} ${req.path} took ${duration}ms`);
      }
    });
    
    next();
  });

  // Health check with enhanced metrics
  app.get('/health', (req: Request, res: Response) => {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    res.json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor(uptime),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      },
      pid: process.pid,
      cluster: CLUSTER_MODE ? 'enabled' : 'disabled'
    });
  });

  // Metrics endpoint for monitoring
  app.get('/metrics', (req: Request, res: Response) => {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    res.setHeader('Content-Type', 'text/plain');
    res.send(`
# HELP nodejs_heap_used_bytes Node.js heap used bytes
# TYPE nodejs_heap_used_bytes gauge
nodejs_heap_used_bytes ${memUsage.heapUsed}

# HELP nodejs_heap_total_bytes Node.js heap total bytes  
# TYPE nodejs_heap_total_bytes gauge
nodejs_heap_total_bytes ${memUsage.heapTotal}

# HELP nodejs_external_memory_bytes Node.js external memory bytes
# TYPE nodejs_external_memory_bytes gauge
nodejs_external_memory_bytes ${memUsage.external}

# HELP process_cpu_user_seconds_total User CPU time spent in seconds
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total ${cpuUsage.user / 1000000}

# HELP process_cpu_system_seconds_total System CPU time spent in seconds  
# TYPE process_cpu_system_seconds_total counter
process_cpu_system_seconds_total ${cpuUsage.system / 1000000}
    `.trim());
  });

  // API Routes with proper error handling
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/users', authenticateToken, userRoutes);
  app.use('/api/campaigns', authenticateToken, campaignRoutes);
  app.use('/api/analytics', authenticateToken, analyticsRoutes);
  app.use('/api/subscriptions', authenticateToken, subscriptionRoutes);
  app.use('/api/notifications', authenticateToken, notificationRoutes);
  app.use('/api/files', authenticateToken, fileRoutes);
  app.use('/api/integrations', authenticateToken, integrationRoutes);
  app.use('/api/sitemap', sitemapRoutes);

  // Enhanced API Documentation
  app.get('/api/docs', (req: Request, res: Response) => {
    res.json({
      title: 'ADS SaaS API Documentation',
      version: '1.0.0',
      environment: NODE_ENV,
      server: {
        url: `http://localhost:${PORT}`,
        description: 'ADS SaaS API Server'
      },
      endpoints: {
        auth: {
          'POST /api/auth/register': 'Créer un compte utilisateur',
          'POST /api/auth/login': 'Se connecter',
          'POST /api/auth/refresh': 'Renouveler le token',
          'POST /api/auth/logout': 'Se déconnecter',
          'POST /api/auth/2fa/setup': 'Configuration 2FA',
          'POST /api/auth/2fa/verify': 'Vérification 2FA'
        },
        users: {
          'GET /api/users/me': 'Profil utilisateur actuel',
          'PUT /api/users/me': 'Mettre à jour le profil',
          'DELETE /api/users/me': 'Supprimer le compte',
          'GET /api/users/team': 'Membres de l\'équipe',
          'POST /api/users/invite': 'Inviter un membre'
        },
        campaigns: {
          'GET /api/campaigns': 'Liste des campagnes',
          'POST /api/campaigns': 'Créer une campagne',
          'GET /api/campaigns/:id': 'Détails d\'une campagne',
          'PUT /api/campaigns/:id': 'Mettre à jour une campagne',
          'DELETE /api/campaigns/:id': 'Supprimer une campagne',
          'GET /api/campaigns/:id/stats': 'Statistiques de campagne'
        },
        analytics: {
          'GET /api/analytics/dashboard': 'Données du tableau de bord',
          'GET /api/analytics/campaigns/:id': 'Analytics d\'une campagne',
          'GET /api/analytics/export': 'Export des données',
          'POST /api/analytics/reports': 'Créer un rapport'
        },
        subscriptions: {
          'GET /api/subscriptions/plans': 'Plans disponibles',
          'POST /api/subscriptions/subscribe': 'S\'abonner à un plan',
          'GET /api/subscriptions/current': 'Abonnement actuel',
          'POST /api/subscriptions/cancel': 'Annuler abonnement'
        },
        notifications: {
          'GET /api/notifications': 'Liste des notifications',
          'PUT /api/notifications/:id/read': 'Marquer comme lu',
          'GET /api/notifications/settings': 'Paramètres notifications',
          'PUT /api/notifications/settings': 'Mettre à jour paramètres'
        },
        files: {
          'POST /api/files/upload': 'Upload de fichiers',
          'GET /api/files': 'Liste des fichiers',
          'DELETE /api/files/:id': 'Supprimer un fichier',
          'POST /api/files/optimize': 'Optimiser une image'
        },
        integrations: {
          'GET /api/integrations': 'Liste des intégrations',
          'POST /api/integrations/connect': 'Connecter une intégration',
          'GET /api/integrations/platforms': 'Plateformes disponibles',
          'POST /api/integrations/:id/test': 'Tester une connexion'
        }
      },
      monitoring: {
        'GET /health': 'Status de santé du serveur',
        'GET /metrics': 'Métriques Prometheus'
      }
    });
  });

  // 404 handler
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      error: 'Route non trouvée',
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
      requestId: req.id
    });
  });

  // Error handler middleware (must be last)
  app.use(errorHandler);

  // Graceful shutdown handling
  const gracefulShutdown = (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Graceful shutdown initiated...`);
    
    server.close((err) => {
      if (err) {
        console.error('❌ Error during server closure:', err);
        process.exit(1);
      }
      
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
    
    // Force exit after 30 seconds
    setTimeout(() => {
      console.error('⚠️ Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  // Start server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ADS SaaS Server started successfully`);
    console.log(`📍 Environment: ${NODE_ENV}`);
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
    console.log(`🔧 Cluster Mode: ${CLUSTER_MODE ? 'Enabled' : 'Disabled'}`);
    console.log(`🆔 Process ID: ${process.pid}`);
    
    if (NODE_ENV === 'development') {
      console.log(`🔥 Hot reload: Enabled`);
    }
  });

  // Configure server timeouts
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught exceptions and rejections
  process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
  });
}

// Extend Express Request interface for custom properties
declare global {
  namespace Express {
    interface Request {
      id?: string;
      rawBody?: Buffer;
    }
  }
} 