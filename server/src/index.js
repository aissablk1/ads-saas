require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

// Import Swagger specs
const swaggerSpecs = require('./swagger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');  
const campaignRoutes = require('./routes/campaigns');
const analyticsRoutes = require('./routes/analytics');
const subscriptionRoutes = require('./routes/subscriptions');
const notificationRoutes = require('./routes/notifications');
const fileRoutes = require('./routes/files');
const integrationRoutes = require('./routes/integrations');
const sitemapRoutes = require('./routes/sitemap');
const envRoutes = require('./routes/env');
const adminRoutes = require('./routes/admin');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

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
app.use(helmet());
app.use(compression());
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'server.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/campaigns', authenticateToken, campaignRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/subscriptions', authenticateToken, subscriptionRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/files', authenticateToken, fileRoutes);
app.use('/api/integrations', authenticateToken, integrationRoutes);
app.use('/api/sitemap', sitemapRoutes);
app.use('/api/env', envRoutes);
app.use('/api/admin', adminRoutes);

// Swagger UI Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ADS SaaS API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));

// API Documentation JSON (pour compatibilité)
app.get('/api/docs.json', (req, res) => {
  res.json({
    title: 'ADS SaaS API Documentation',
    version: '1.0.0',
    swaggerUrl: '/api/docs',
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
      },
      configuration: {
        'GET /api/env': 'Variables d\'environnement de l\'API'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
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