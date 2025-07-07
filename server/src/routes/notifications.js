const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const axios = require('axios');

const router = express.Router();
const prisma = new PrismaClient();

// Types de notifications
const NOTIFICATION_TYPES = {
  CAMPAIGN_STATUS_CHANGED: {
    name: 'Changement de statut de campagne',
    description: 'Notification quand une campagne change de statut',
    category: 'campaigns'
  },
  BUDGET_ALERT: {
    name: 'Alerte budget',
    description: 'Notification quand le budget atteint un seuil',
    category: 'budget'
  },
  PERFORMANCE_ALERT: {
    name: 'Alerte performance',
    description: 'Notification pour performances anormales',
    category: 'performance'
  },
  TEAM_INVITATION: {
    name: 'Invitation équipe',
    description: 'Notification d\'invitation à rejoindre une équipe',
    category: 'team'
  },
  PAYMENT_ISSUE: {
    name: 'Problème de paiement',
    description: 'Notification d\'échec de paiement',
    category: 'billing'
  },
  REPORT_READY: {
    name: 'Rapport prêt',
    description: 'Notification quand un rapport est généré',
    category: 'reports'
  }
};

// Validation middleware
const validateNotificationSettings = [
  body('email').isObject().withMessage('email doit être un objet'),
  body('push').isObject().withMessage('push doit être un objet'),
  body('email.campaign_status').optional().isBoolean().withMessage('email.campaign_status doit être un booléen'),
  body('email.budget_alerts').optional().isBoolean().withMessage('email.budget_alerts doit être un booléen'),
  body('email.performance_alerts').optional().isBoolean().withMessage('email.performance_alerts doit être un booléen'),
  body('email.team_invitations').optional().isBoolean().withMessage('email.team_invitations doit être un booléen'),
  body('email.payment_issues').optional().isBoolean().withMessage('email.payment_issues doit être un booléen'),
  body('email.reports').optional().isBoolean().withMessage('email.reports doit être un booléen'),
  body('push.campaign_status').optional().isBoolean().withMessage('push.campaign_status doit être un booléen'),
  body('push.budget_alerts').optional().isBoolean().withMessage('push.budget_alerts doit être un booléen'),
  body('push.performance_alerts').optional().isBoolean().withMessage('push.performance_alerts doit être un booléen'),
  body('push.team_invitations').optional().isBoolean().withMessage('push.team_invitations doit être un booléen'),
  body('push.payment_issues').optional().isBoolean().withMessage('push.payment_issues doit être un booléen'),
  body('push.reports').optional().isBoolean().withMessage('push.reports doit être un booléen'),
  body('emailNotifications').optional().isBoolean().withMessage('emailNotifications doit être un booléen'),
  body('pushNotifications').optional().isBoolean().withMessage('pushNotifications doit être un booléen')
];

const validateWebhook = [
  body('url').isURL().withMessage('URL invalide'),
  body('events').isArray({ min: 1 }).withMessage('Au moins un événement requis'),
  body('name').trim().isLength({ min: 3 }).withMessage('Nom requis (min 3 caractères)')
];

// GET /api/notifications - Liste des notifications
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, read, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId: req.user.id,
      ...(read !== undefined && { read: read === 'true' }),
      ...(type && { type })
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: req.user.id, read: false }
      })
    ]);

    res.json({
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      unreadCount
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/:id/read - Marquer comme lu
router.post('/:id/read', async (req, res, next) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Notification non trouvée'
      });
    }

    await prisma.notification.update({
      where: { id: req.params.id },
      data: { 
        read: true,
        readAt: new Date()
      }
    });

    res.json({
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/mark-all-read - Marquer toutes comme lues
router.post('/mark-all-read', async (req, res, next) => {
  try {
    const { type } = req.body;

    const where = {
      userId: req.user.id,
      read: false,
      ...(type && { type })
    };

    await prisma.notification.updateMany({
      where,
      data: { 
        read: true,
        readAt: new Date()
      }
    });

    res.json({
      message: 'Notifications marquées comme lues'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notifications/:id - Supprimer une notification
router.delete('/:id', async (req, res, next) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Notification non trouvée'
      });
    }

    await prisma.notification.delete({
      where: { id: req.params.id }
    });

    res.json({
      message: 'Notification supprimée'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications/settings - Paramètres de notification
router.get('/settings', async (req, res, next) => {
  try {
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: req.user.id }
    });

    if (!settings) {
      // Créer des paramètres par défaut avec la nouvelle structure
      const defaultSettings = {
        email: {
          campaign_status: true,
          budget_alerts: true,
          performance_alerts: true,
          team_invitations: true,
          payment_issues: true,
          reports: true
        },
        push: {
          campaign_status: false,
          budget_alerts: true,
          performance_alerts: true,
          team_invitations: true,
          payment_issues: true,
          reports: false
        }
      };
      
      settings = await prisma.notificationSettings.create({
        data: {
          userId: req.user.id,
          emailNotifications: true,
          pushNotifications: true,
          types: defaultSettings
        }
      });
      
      // Retourner la structure correcte
      return res.json({
        settings: defaultSettings,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        availableTypes: Object.entries(NOTIFICATION_TYPES).map(([key, type]) => ({
          id: key,
          ...type
        }))
      });
    }

    // Si les paramètres existent, parser la structure JSON
    let parsedSettings;
    try {
      parsedSettings = settings.types ? settings.types : {
        email: {
          campaign_status: true,
          budget_alerts: true,
          performance_alerts: true,
          team_invitations: true,
          payment_issues: true,
          reports: true
        },
        push: {
          campaign_status: false,
          budget_alerts: true,
          performance_alerts: true,
          team_invitations: true,
          payment_issues: true,
          reports: false
        }
      };
    } catch (parseError) {
      // En cas d'erreur de parsing, utiliser les paramètres par défaut
      parsedSettings = {
        email: {
          campaign_status: true,
          budget_alerts: true,
          performance_alerts: true,
          team_invitations: true,
          payment_issues: true,
          reports: true
        },
        push: {
          campaign_status: false,
          budget_alerts: true,
          performance_alerts: true,
          team_invitations: true,
          payment_issues: true,
          reports: false
        }
      };
    }

    res.json({
      settings: parsedSettings,
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
      availableTypes: Object.entries(NOTIFICATION_TYPES).map(([key, type]) => ({
        id: key,
        ...type
      }))
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/settings - Mettre à jour les paramètres
router.put('/settings', validateNotificationSettings, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Erreurs de validation:', errors.array());
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array().map(err => ({
          field: err.path || err.param,
          message: err.msg,
          value: err.value
        }))
      });
    }

    const { email, push, emailNotifications, pushNotifications } = req.body;

    // Validation plus détaillée avec valeurs par défaut
    if (!email || typeof email !== 'object') {
      return res.status(400).json({
        error: 'Données invalides',
        details: 'Le paramètre email est requis et doit être un objet'
      });
    }

    if (!push || typeof push !== 'object') {
      return res.status(400).json({
        error: 'Données invalides',
        details: 'Le paramètre push est requis et doit être un objet'
      });
    }

    // Propriétés requises avec valeurs par défaut
    const requiredProperties = ['campaign_status', 'budget_alerts', 'performance_alerts', 'team_invitations', 'payment_issues', 'reports'];
    
    const defaultEmailSettings = {
      campaign_status: true,
      budget_alerts: true,
      performance_alerts: true,
      team_invitations: true,
      payment_issues: true,
      reports: true
    };

    const defaultPushSettings = {
      campaign_status: false,
      budget_alerts: true,
      performance_alerts: true,
      team_invitations: true,
      payment_issues: true,
      reports: false
    };

    // Compléter les objets avec les valeurs par défaut si des propriétés manquent
    const completeEmailSettings = { ...defaultEmailSettings, ...email };
    const completePushSettings = { ...defaultPushSettings, ...push };
    
    // Validation des types pour les propriétés complètes
    for (const prop of requiredProperties) {
      if (typeof completeEmailSettings[prop] !== 'boolean') {
        return res.status(400).json({
          error: 'Données invalides',
          details: `La propriété email.${prop} doit être un booléen, reçu: ${typeof completeEmailSettings[prop]}`
        });
      }
      if (typeof completePushSettings[prop] !== 'boolean') {
        return res.status(400).json({
          error: 'Données invalides',
          details: `La propriété push.${prop} doit être un booléen, reçu: ${typeof completePushSettings[prop]}`
        });
      }
    }

    // Utiliser les paramètres complétés
    const newSettings = { 
      email: completeEmailSettings, 
      push: completePushSettings 
    };
    
    console.log('Mise à jour des paramètres de notification pour l\'utilisateur:', req.user.id);
    console.log('Nouvelles données:', JSON.stringify(newSettings, null, 2));
    
    const settings = await prisma.notificationSettings.upsert({
      where: { userId: req.user.id },
      update: {
        types: newSettings,
        emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
        pushNotifications: pushNotifications !== undefined ? pushNotifications : true,
        updatedAt: new Date()
      },
      create: {
        userId: req.user.id,
        types: newSettings,
        emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
        pushNotifications: pushNotifications !== undefined ? pushNotifications : true
      }
    });

    console.log('Paramètres mis à jour avec succès');

    res.json({
      message: 'Paramètres mis à jour avec succès',
      settings: newSettings,
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    next(error);
  }
});

// GET /api/notifications/webhooks - Liste des webhooks
router.get('/webhooks', async (req, res, next) => {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ webhooks });
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/webhooks - Créer un webhook
router.post('/webhooks', validateWebhook, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { name, url, events, secret } = req.body;

    // Générer un secret si non fourni
    const webhookSecret = secret || crypto.randomBytes(32).toString('hex');

    const webhook = await prisma.webhook.create({
      data: {
        name,
        url,
        events,
        secret: webhookSecret,
        userId: req.user.id,
        enabled: true
      }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'WEBHOOK_CREATED',
        title: 'Webhook créé',
        description: `Nouveau webhook: ${name}`,
        metadata: { webhookId: webhook.id }
      }
    });

    res.status(201).json({
      message: 'Webhook créé avec succès',
      webhook: {
        ...webhook,
        secret: '***' // Masquer le secret dans la réponse
      }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/webhooks/:id - Mettre à jour un webhook
router.put('/webhooks/:id', validateWebhook, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { name, url, events, enabled } = req.body;

    const webhook = await prisma.webhook.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!webhook) {
      return res.status(404).json({
        error: 'Webhook non trouvé'
      });
    }

    const updatedWebhook = await prisma.webhook.update({
      where: { id: req.params.id },
      data: {
        name,
        url,
        events,
        enabled: enabled !== undefined ? enabled : webhook.enabled
      }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'WEBHOOK_UPDATED',
        title: 'Webhook mis à jour',
        description: `Webhook modifié: ${name}`,
        metadata: { webhookId: webhook.id }
      }
    });

    res.json({
      message: 'Webhook mis à jour',
      webhook: {
        ...updatedWebhook,
        secret: '***'
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/webhooks/:id/test - Tester un webhook
router.post('/webhooks/:id/test', async (req, res, next) => {
  try {
    const webhook = await prisma.webhook.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!webhook) {
      return res.status(404).json({
        error: 'Webhook non trouvé'
      });
    }

    // Payload de test
    const testPayload = {
      event: 'webhook.test',
      data: {
        message: 'Test webhook',
        timestamp: new Date().toISOString(),
        webhook_id: webhook.id
      },
      webhook: {
        id: webhook.id,
        name: webhook.name
      }
    };

    try {
      const response = await sendWebhook(webhook, testPayload);
      
      // Enregistrer la tentative
      await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event: 'webhook.test',
          payload: testPayload,
          status: 'SUCCESS',
          statusCode: response.status,
          response: response.data
        }
      });

      res.json({
        message: 'Webhook testé avec succès',
        status: response.status,
        response: response.data
      });
    } catch (webhookError) {
      // Enregistrer l'échec
      await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event: 'webhook.test',
          payload: testPayload,
          status: 'FAILED',
          statusCode: webhookError.response?.status || 0,
          error: webhookError.message
        }
      });

      res.status(400).json({
        error: 'Échec du test webhook',
        details: webhookError.message
      });
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notifications/webhooks/:id - Supprimer un webhook
router.delete('/webhooks/:id', async (req, res, next) => {
  try {
    const webhook = await prisma.webhook.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!webhook) {
      return res.status(404).json({
        error: 'Webhook non trouvé'
      });
    }

    await prisma.webhook.delete({
      where: { id: req.params.id }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'WEBHOOK_DELETED',
        title: 'Webhook supprimé',
        description: `Webhook supprimé: ${webhook.name}`,
        metadata: { webhookId: webhook.id }
      }
    });

    res.json({
      message: 'Webhook supprimé'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications/webhooks/:id/deliveries - Historique des livraisons
router.get('/webhooks/:id/deliveries', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const webhook = await prisma.webhook.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!webhook) {
      return res.status(404).json({
        error: 'Webhook non trouvé'
      });
    }

    const [deliveries, total] = await Promise.all([
      prisma.webhookDelivery.findMany({
        where: { webhookId: req.params.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.webhookDelivery.count({
        where: { webhookId: req.params.id }
      })
    ]);

    res.json({
      data: deliveries,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications/types - Types de notifications disponibles
router.get('/types', async (req, res, next) => {
  try {
    const types = Object.entries(NOTIFICATION_TYPES).map(([key, type]) => ({
      id: key,
      ...type
    }));

    res.json({ types });
  } catch (error) {
    next(error);
  }
});

// Fonctions utilitaires

async function sendWebhook(webhook, payload) {
  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return await axios.post(webhook.url, payload, {
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': `sha256=${signature}`,
      'User-Agent': 'ADS-Platform/1.0'
    },
    timeout: 30000 // 30 secondes
  });
}

// Fonction pour envoyer les notifications
async function sendNotification(userId, type, title, message, metadata = {}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      metadata,
      read: false
    }
  });

  return notification;
}

module.exports = router; 