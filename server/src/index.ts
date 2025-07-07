import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';

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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Trop de requêtes depuis cette IP, réessayez dans 15 minutes.'
  }
});

// Middleware global
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'server.log'), { flags: 'a' });
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API Routes
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

// API Documentation
app.get('/api/docs', (req: Request, res: Response) => {
  res.json({
    title: 'ADS SaaS API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Créer un compte utilisateur',
        'POST /api/auth/login': 'Se connecter',
        'POST /api/auth/refresh': 'Renouveler le token',
        'POST /api/auth/logout': 'Se déconnecter'
      },
      users: {
        'GET /api/users/me': 'Profil utilisateur actuel',
        'PUT /api/users/me': 'Mettre à jour le profil',
        'DELETE /api/users/me': 'Supprimer le compte'
      },
      campaigns: {
        'GET /api/campaigns': 'Liste des campagnes',
        'POST /api/campaigns': 'Créer une campagne',
        'GET /api/campaigns/:id': 'Détails d\'une campagne',
        'PUT /api/campaigns/:id': 'Mettre à jour une campagne',
        'DELETE /api/campaigns/:id': 'Supprimer une campagne'
      },
      analytics: {
        'GET /api/analytics/dashboard': 'Données du tableau de bord',
        'GET /api/analytics/campaigns/:id': 'Analytics d\'une campagne'
      },
      subscriptions: {
        'GET /api/subscriptions/plans': 'Plans disponibles',
        'POST /api/subscriptions/subscribe': 'S\'abonner à un plan',
        'GET /api/subscriptions/current': 'Abonnement actuel'
      },
      notifications: {
        'GET /api/notifications': 'Liste des notifications',
        'PUT /api/notifications/:id/read': 'Marquer comme lu',
        'GET /api/notifications/settings': 'Paramètres notifications'
      },
      files: {
        'POST /api/files/upload': 'Upload de fichiers',
        'GET /api/files': 'Liste des fichiers',
        'DELETE /api/files/:id': 'Supprimer un fichier'
      },
      integrations: {
        'GET /api/integrations': 'Liste des intégrations',
        'POST /api/integrations/connect': 'Connecter une intégration',
        'GET /api/integrations/platforms': 'Plateformes disponibles'
      },
      sitemap: {
        'GET /api/sitemap/urls': 'URLs dynamiques pour sitemap',
        'GET /api/sitemap/status': 'Statut du sitemap',
        'POST /api/sitemap/generate': 'Régénérer le sitemap (admin uniquement)'
      }
    }
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Error handler middleware (doit être en dernier)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Serveur ADS SaaS démarré sur le port ${PORT}`);
  console.log(`📖 Documentation API: http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
}); 