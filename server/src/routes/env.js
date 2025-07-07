const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/env:
 *   get:
 *     summary: Obtenir les variables d'environnement de l'API
 *     description: Retourne les variables d'environnement importantes pour la configuration de l'API (version sécurisée)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Variables d'environnement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 environment:
 *                   type: string
 *                   description: Environnement actuel
 *                 apiUrl:
 *                   type: string
 *                   description: URL de l'API
 *                 frontendUrl:
 *                   type: string
 *                   description: URL du frontend
 *                 database:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       description: Type de base de données
 *                     host:
 *                       type: string
 *                       description: Hôte de la base de données
 *                     port:
 *                       type: string
 *                       description: Port de la base de données
 *                     name:
 *                       type: string
 *                       description: Nom de la base de données
 *                 redis:
 *                   type: object
 *                   properties:
 *                     host:
 *                       type: string
 *                       description: Hôte Redis
 *                     port:
 *                       type: string
 *                       description: Port Redis
 *                 email:
 *                   type: object
 *                   properties:
 *                     provider:
 *                       type: string
 *                       description: Fournisseur email
 *                     host:
 *                       type: string
 *                       description: Hôte SMTP
 *                     port:
 *                       type: string
 *                       description: Port SMTP
 *                 stripe:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                       description: Stripe activé
 *                     mode:
 *                       type: string
 *                       description: Mode Stripe (test/live)
 *                 monitoring:
 *                   type: object
 *                   properties:
 *                     sentry:
 *                       type: boolean
 *                       description: Sentry activé
 *                     grafana:
 *                       type: boolean
 *                       description: Grafana activé
 *                     prometheus:
 *                       type: boolean
 *                       description: Prometheus activé
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès interdit
 */
router.get('/', (req, res) => {
  // Vérifier si l'utilisateur est admin (optionnel, pour plus de sécurité)
  // if (req.user && req.user.role !== 'admin') {
  //   return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  // }

  // Extraire les informations de la base de données depuis DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL || '';
  const dbInfo = {
    type: 'postgresql',
    host: 'localhost',
    port: '5432',
    name: 'ads_saas'
  };

  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      dbInfo.host = url.hostname;
      dbInfo.port = url.port;
      dbInfo.name = url.pathname.substring(1);
    } catch (error) {
      console.warn('Impossible de parser DATABASE_URL:', error.message);
    }
  }

  // Extraire les informations Redis
  const redisUrl = process.env.REDIS_URL || '';
  const redisInfo = {
    host: 'localhost',
    port: '6379'
  };

  if (redisUrl) {
    try {
      const url = new URL(redisUrl);
      redisInfo.host = url.hostname;
      redisInfo.port = url.port;
    } catch (error) {
      console.warn('Impossible de parser REDIS_URL:', error.message);
    }
  }

  // Extraire les informations email
  const emailInfo = {
    provider: 'smtp',
    host: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_SMTP_PORT || '587'
  };

  // Informations Stripe
  const stripeInfo = {
    enabled: !!process.env.STRIPE_SECRET_KEY,
    mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 'live'
  };

  // Informations monitoring
  const monitoringInfo = {
    sentry: !!process.env.SENTRY_DSN,
    grafana: true, // Toujours activé dans notre setup
    prometheus: true // Toujours activé dans notre setup
  };

  res.json({
    environment: process.env.NODE_ENV || 'development',
    apiUrl: process.env.API_URL || 'http://localhost:8000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    database: dbInfo,
    redis: redisInfo,
    email: emailInfo,
    stripe: stripeInfo,
    monitoring: monitoringInfo,
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 