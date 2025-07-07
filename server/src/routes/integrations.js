const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const axios = require('axios');

const router = express.Router();
const prisma = new PrismaClient();

// Plateformes d'intégration disponibles organisées par catégories
const INTEGRATION_PLATFORMS = {
  // === RÉSEAUX SOCIAUX & PUBLICITÉ ===
  FACEBOOK_ADS: {
    name: 'Facebook Ads',
    description: 'Connectez et gérez vos campagnes Facebook Ads',
    category: 'social_advertising',
    requiredFields: [
      { name: 'accessToken', label: 'Token d\'accès', type: 'password', required: true, placeholder: 'EAAxxxxx...' },
      { name: 'adAccountId', label: 'ID du compte publicitaire', type: 'text', required: true, placeholder: 'act_123456789' }
    ],
    icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    color: '#1877F2',
    status: 'active',
    instructions: 'Rendez-vous dans Meta Business Manager > Outils > Comptes publicitaires pour obtenir votre ID de compte.'
  },
  INSTAGRAM_ADS: {
    name: 'Instagram Ads',
    description: 'Gérez vos campagnes Instagram Business',
    category: 'social_advertising',
    requiredFields: [
      { name: 'accessToken', label: 'Token d\'accès Instagram', type: 'password', required: true },
      { name: 'businessAccountId', label: 'ID du compte professionnel', type: 'text', required: true }
    ],
    icon: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg',
    color: '#E4405F',
    status: 'active'
  },
  GOOGLE_ADS: {
    name: 'Google Ads',
    description: 'Synchronisez et optimisez vos campagnes Google Ads',
    category: 'search_advertising', 
    requiredFields: [
      { name: 'clientId', label: 'Client ID', type: 'text', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { name: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
      { name: 'customerId', label: 'Customer ID', type: 'text', required: true, placeholder: '123-456-7890' }
    ],
    icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Ads_logo.svg',
    color: '#4285F4',
    status: 'active',
    instructions: 'Créez un projet dans Google Cloud Console et activez l\'API Google Ads.'
  },
  LINKEDIN_ADS: {
    name: 'LinkedIn Ads',
    description: 'Gérez vos campagnes LinkedIn pour le B2B',
    category: 'social_advertising',
    requiredFields: [
      { name: 'accessToken', label: 'Token d\'accès LinkedIn', type: 'password', required: true },
      { name: 'adAccountId', label: 'ID du compte publicitaire', type: 'text', required: true }
    ],
    icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
    color: '#0A66C2',
    status: 'active'
  },
  TWITTER_ADS: {
    name: 'Twitter Ads',
    description: 'Connectez vos campagnes Twitter (X) Ads',
    category: 'social_advertising',
    requiredFields: [
      { name: 'apiKey', label: 'API Key', type: 'text', required: true },
      { name: 'apiSecret', label: 'API Secret', type: 'password', required: true },
      { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { name: 'accessTokenSecret', label: 'Access Token Secret', type: 'password', required: true }
    ],
    icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg',
    color: '#1DA1F2',
    status: 'active'
  },
  TIKTOK_ADS: {
    name: 'TikTok Ads',
    description: 'Gérez vos campagnes TikTok for Business',
    category: 'social_advertising',
    requiredFields: [
      { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { name: 'advertiserId', label: 'Advertiser ID', type: 'text', required: true }
    ],
    icon: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg',
    color: '#FF0050',
    status: 'active'
  },
  SNAPCHAT_ADS: {
    name: 'Snapchat Ads',
    description: 'Connectez Snapchat Ads Manager',
    category: 'social_advertising',
    requiredFields: [
      { name: 'clientId', label: 'Client ID', type: 'text', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { name: 'refreshToken', label: 'Refresh Token', type: 'password', required: true }
    ],
    icon: 'https://upload.wikimedia.org/wikipedia/en/c/c4/Snapchat_logo.svg',
    color: '#FFFC00',
    status: 'active'
  },

  // === EMAIL MARKETING ===
  MAILCHIMP: {
    name: 'Mailchimp',
    description: 'Synchronisez vos listes et campagnes email',
    category: 'email_marketing',
    requiredFields: [
      { name: 'apiKey', label: 'Clé API Mailchimp', type: 'password', required: true, placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-us1' },
      { name: 'serverPrefix', label: 'Préfixe serveur', type: 'text', required: true, placeholder: 'us1' }
    ],
    icon: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Mailchimp_Logo.svg',
    color: '#FFE01B',
    status: 'active'
  },
  SENDGRID: {
    name: 'SendGrid',
    description: 'Intégrez votre plateforme email SendGrid',
    category: 'email_marketing',
    requiredFields: [
      { name: 'apiKey', label: 'Clé API SendGrid', type: 'password', required: true }
    ],
    icon: 'https://sendgrid.com/wp-content/themes/sgdotcom/pages/resource/brand/2016/SendGrid-Logomark.png',
    color: '#1A82E2',
    status: 'active'
  },
  KLAVIYO: {
    name: 'Klaviyo',
    description: 'Connectez votre plateforme email marketing Klaviyo',
    category: 'email_marketing',
    requiredFields: [
      { name: 'apiKey', label: 'Clé API Klaviyo', type: 'password', required: true },
      { name: 'companyId', label: 'Company ID', type: 'text', required: true }
    ],
    icon: 'https://help.klaviyo.com/hc/article_attachments/360042728812/klaviyo_logo.png',
    color: '#7B68EE',
    status: 'active'
  },

  // === CRM & VENTES ===
  SALESFORCE: {
    name: 'Salesforce',
    description: 'Connectez votre CRM Salesforce',
    category: 'crm',
    requiredFields: [
      { name: 'instanceUrl', label: 'URL de l\'instance', type: 'url', required: true, placeholder: 'https://yourcompany.salesforce.com' },
      { name: 'accessToken', label: 'Token d\'accès', type: 'password', required: true },
      { name: 'refreshToken', label: 'Refresh Token', type: 'password', required: true }
    ],
    icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
    color: '#00A1E0',
    status: 'active'
  },
  HUBSPOT: {
    name: 'HubSpot',
    description: 'Intégrez votre CRM et marketing HubSpot',
    category: 'crm',
    requiredFields: [
      { name: 'accessToken', label: 'Token d\'accès HubSpot', type: 'password', required: true },
      { name: 'portalId', label: 'Portal ID', type: 'text', required: true }
    ],
    icon: 'https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png',
    color: '#FF7A59',
    status: 'active'
  },
  PIPEDRIVE: {
    name: 'Pipedrive',
    description: 'Synchronisez votre pipeline de vente Pipedrive',
    category: 'crm',
    requiredFields: [
      { name: 'apiToken', label: 'Token API Pipedrive', type: 'password', required: true },
      { name: 'companyDomain', label: 'Domaine de l\'entreprise', type: 'text', required: true, placeholder: 'yourcompany' }
    ],
    icon: 'https://cdn.worldvectorlogo.com/logos/pipedrive.svg',
    color: '#28BE5A',
    status: 'active'
  },

  // === ANALYTICS & TRACKING ===
  GOOGLE_ANALYTICS: {
    name: 'Google Analytics',
    description: 'Trackez et analysez vos conversions',
    category: 'analytics',
    requiredFields: [
      { name: 'trackingId', label: 'ID de suivi GA', type: 'text', required: true, placeholder: 'GA_MEASUREMENT_ID' },
      { name: 'serviceAccountKey', label: 'Clé du compte de service', type: 'password', required: true }
    ],
    icon: 'https://upload.wikimedia.org/wikipedia/commons/7/77/GAnalytics.svg',
    color: '#F4B400',
    status: 'active'
  },
  PIXEL_FACEBOOK: {
    name: 'Facebook Pixel',
    description: 'Suivi des conversions et retargeting Facebook',
    category: 'analytics',
    requiredFields: [
      { name: 'pixelId', label: 'ID du Pixel Facebook', type: 'text', required: true, placeholder: '123456789012345' }
    ],
    icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    color: '#1877F2',
    status: 'active'
  },
  GOOGLE_TAG_MANAGER: {
    name: 'Google Tag Manager',
    description: 'Gérez vos tags et pixels de tracking',
    category: 'analytics',
    requiredFields: [
      { name: 'containerId', label: 'ID du conteneur GTM', type: 'text', required: true, placeholder: 'GTM-XXXXXXX' }
    ],
    icon: 'https://www.gstatic.com/analytics-suite/header/suite/v2/ic_tag_manager.svg',
    color: '#4285F4',
    status: 'active'
  },

  // === COMMUNICATION ===
  SLACK: {
    name: 'Slack',
    description: 'Recevez des notifications dans Slack',
    category: 'communication',
    requiredFields: [
      { name: 'webhookUrl', label: 'URL du Webhook Slack', type: 'url', required: true, placeholder: 'https://hooks.slack.com/services/...' }
    ],
    icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
    color: '#4A154B',
    status: 'active'
  },
  DISCORD: {
    name: 'Discord',
    description: 'Notifications et intégration Discord',
    category: 'communication',
    requiredFields: [
      { name: 'webhookUrl', label: 'URL du Webhook Discord', type: 'url', required: true }
    ],
    icon: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
    color: '#5865F2',
    status: 'active'
  },
  MICROSOFT_TEAMS: {
    name: 'Microsoft Teams',
    description: 'Intégration avec Microsoft Teams',
    category: 'communication',
    requiredFields: [
      { name: 'webhookUrl', label: 'URL du Webhook Teams', type: 'url', required: true }
    ],
    icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg',
    color: '#6264A7',
    status: 'active'
  },

  // === AUTOMATION ===
  ZAPIER: {
    name: 'Zapier',
    description: 'Automatisez vos workflows avec Zapier',
    category: 'automation',
    requiredFields: [
      { name: 'webhookUrl', label: 'URL du Webhook Zapier', type: 'url', required: true }
    ],
    icon: 'https://cdn.worldvectorlogo.com/logos/zapier.svg',
    color: '#FF4A00',
    status: 'active'
  },
  MAKE: {
    name: 'Make (ex-Integromat)',
    description: 'Créez des automatisations complexes avec Make',
    category: 'automation',
    requiredFields: [
      { name: 'apiKey', label: 'Clé API Make', type: 'password', required: true },
      { name: 'webhookUrl', label: 'URL du Webhook', type: 'url', required: true }
    ],
    icon: 'https://www.make.com/en/help/image/uuid-e2baa12e-3b8b-3a26-fd37-b9ac2ec0db37.png',
    color: '#6366F1',
    status: 'active'
  },

  // === E-COMMERCE ===
  SHOPIFY: {
    name: 'Shopify',
    description: 'Connectez votre boutique Shopify',
    category: 'ecommerce',
    requiredFields: [
      { name: 'shopDomain', label: 'Domaine de la boutique', type: 'text', required: true, placeholder: 'votre-boutique.myshopify.com' },
      { name: 'accessToken', label: 'Token d\'accès', type: 'password', required: true }
    ],
    icon: 'https://cdn.worldvectorlogo.com/logos/shopify.svg',
    color: '#95BF47',
    status: 'active'
  },
  WOOCOMMERCE: {
    name: 'WooCommerce',
    description: 'Intégrez votre boutique WooCommerce',
    category: 'ecommerce',
    requiredFields: [
      { name: 'siteUrl', label: 'URL du site', type: 'url', required: true },
      { name: 'consumerKey', label: 'Consumer Key', type: 'text', required: true },
      { name: 'consumerSecret', label: 'Consumer Secret', type: 'password', required: true }
    ],
    icon: 'https://woocommerce.com/wp-content/themes/woo/images/logo-woocommerce@2x.png',
    color: '#96588A',
    status: 'active'
  }
};

// Catégories avec leurs métadonnées en français
const CATEGORIES = {
  social_advertising: {
    name: 'Réseaux Sociaux',
    description: 'Publicités sur les réseaux sociaux',
    icon: '📱',
    color: 'bg-blue-100 text-blue-800'
  },
  search_advertising: {
    name: 'Publicité Recherche',
    description: 'Moteurs de recherche et publicités payantes',
    icon: '🔍',
    color: 'bg-green-100 text-green-800'
  },
  email_marketing: {
    name: 'Email Marketing',
    description: 'Plateformes d\'email marketing',
    icon: '📧',
    color: 'bg-yellow-100 text-yellow-800'
  },
  crm: {
    name: 'CRM & Ventes',
    description: 'Gestion de la relation client',
    icon: '👥',
    color: 'bg-purple-100 text-purple-800'
  },
  analytics: {
    name: 'Analytics & Tracking',
    description: 'Suivi et analyse des performances',
    icon: '📊',
    color: 'bg-indigo-100 text-indigo-800'
  },
  communication: {
    name: 'Communication',
    description: 'Outils de communication et notifications',
    icon: '💬',
    color: 'bg-pink-100 text-pink-800'
  },
  automation: {
    name: 'Automation',
    description: 'Automatisation et workflows',
    icon: '⚡',
    color: 'bg-orange-100 text-orange-800'
  },
  ecommerce: {
    name: 'E-commerce',
    description: 'Plateformes de vente en ligne',
    icon: '🛒',
    color: 'bg-teal-100 text-teal-800'
  }
};

// Validation middleware
const validateIntegration = [
  body('platform').isIn(Object.keys(INTEGRATION_PLATFORMS)).withMessage('Plateforme invalide'),
  body('name').trim().isLength({ min: 3 }).withMessage('Nom requis (min 3 caractères)'),
  body('credentials').isObject().withMessage('Credentials requis')
];

// GET /api/integrations/platforms - Liste des plateformes disponibles
router.get('/platforms', async (req, res, next) => {
  try {
    const { category } = req.query;

    let platforms = Object.entries(INTEGRATION_PLATFORMS).map(([key, platform]) => ({
      id: key,
      ...platform
    }));

    if (category) {
      platforms = platforms.filter(p => p.category === category);
    }

    // Récupérer les intégrations actives de l'utilisateur
    const userIntegrations = await prisma.integration.findMany({
      where: { userId: req.user.id },
      select: { platform: true, status: true }
    });

    // Marquer les plateformes déjà connectées
    platforms = platforms.map(platform => ({
      ...platform,
      connected: userIntegrations.some(i => i.platform === platform.id && i.status === 'CONNECTED')
    }));

    res.json({
      platforms,
      categories: CATEGORIES,
      platformsByCategory: Object.keys(CATEGORIES).reduce((acc, categoryKey) => {
        acc[categoryKey] = platforms.filter(p => p.category === categoryKey);
        return acc;
      }, {})
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/integrations - Liste des intégrations de l'utilisateur
router.get('/', async (req, res, next) => {
  try {
    const { status, category, platform } = req.query;

    const where = {
      userId: req.user.id,
      ...(status && { status }),
      ...(platform && { platform })
    };

    if (category) {
      const platformsInCategory = Object.entries(INTEGRATION_PLATFORMS)
        .filter(([, p]) => p.category === category)
        .map(([key]) => key);
      where.platform = { in: platformsInCategory };
    }

    const integrations = await prisma.integration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        platform: true,
        name: true,
        status: true,
        lastSyncAt: true,
        syncStatus: true,
        metadata: true,
        createdAt: true
      }
    });

    // Enrichir avec les infos de plateforme
    const enrichedIntegrations = integrations.map(integration => ({
      ...integration,
      platformInfo: INTEGRATION_PLATFORMS[integration.platform]
    }));

    res.json({
      integrations: enrichedIntegrations,
      summary: {
        total: integrations.length,
        connected: integrations.filter(i => i.status === 'CONNECTED').length,
        error: integrations.filter(i => i.status === 'ERROR').length
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/integrations - Créer une nouvelle intégration
router.post('/', validateIntegration, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { platform, name, credentials, settings = {} } = req.body;

    // Vérifier si une intégration existe déjà pour cette plateforme
    const existingIntegration = await prisma.integration.findFirst({
      where: {
        userId: req.user.id,
        platform
      }
    });

    if (existingIntegration) {
      return res.status(409).json({
        error: 'Une intégration existe déjà pour cette plateforme'
      });
    }

    // Valider les credentials requis
    const platformInfo = INTEGRATION_PLATFORMS[platform];
    const missingFields = platformInfo.requiredFields.filter(
      field => !credentials[field] || credentials[field].toString().trim() === ''
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Credentials incomplets',
        missingFields
      });
    }

    // Tester la connexion
    let connectionTest;
    try {
      connectionTest = await testConnection(platform, credentials);
    } catch (testError) {
      return res.status(400).json({
        error: 'Échec du test de connexion',
        details: testError.message
      });
    }

    // Chiffrer les credentials
    const encryptedCredentials = encryptCredentials(credentials);

    // Créer l'intégration
    const integration = await prisma.integration.create({
      data: {
        platform,
        name,
        credentials: encryptedCredentials,
        settings,
        status: 'CONNECTED',
        metadata: {
          connectionTest,
          setupDate: new Date().toISOString()
        },
        userId: req.user.id
      }
    });

    // Enregistrer l'activité
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'INTEGRATION_CONNECTED',
        title: 'Intégration ajoutée',
        description: `Nouvelle intégration: ${platformInfo.name}`,
        metadata: { 
          integrationId: integration.id,
          platform
        }
      }
    });

    res.status(201).json({
      message: 'Intégration créée avec succès',
      integration: {
        ...integration,
        credentials: '***', // Masquer les credentials
        platformInfo
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/integrations/:id - Détails d'une intégration
router.get('/:id', async (req, res, next) => {
  try {
    const integration = await prisma.integration.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!integration) {
      return res.status(404).json({
        error: 'Intégration non trouvée'
      });
    }

    res.json({
      ...integration,
      credentials: '***', // Masquer les credentials
      platformInfo: INTEGRATION_PLATFORMS[integration.platform]
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/integrations/:id - Mettre à jour une intégration
router.put('/:id', async (req, res, next) => {
  try {
    const { name, credentials, settings, enabled } = req.body;

    const integration = await prisma.integration.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!integration) {
      return res.status(404).json({
        error: 'Intégration non trouvée'
      });
    }

    const updateData = {
      ...(name && { name }),
      ...(settings && { settings }),
      ...(enabled !== undefined && { enabled })
    };

    // Si nouvelles credentials, les tester et chiffrer
    if (credentials) {
      try {
        await testConnection(integration.platform, credentials);
        updateData.credentials = encryptCredentials(credentials);
        updateData.status = 'CONNECTED';
      } catch (testError) {
        return res.status(400).json({
          error: 'Échec du test de connexion',
          details: testError.message
        });
      }
    }

    const updatedIntegration = await prisma.integration.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      message: 'Intégration mise à jour',
      integration: {
        ...updatedIntegration,
        credentials: '***',
        platformInfo: INTEGRATION_PLATFORMS[integration.platform]
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/integrations/:id/test - Tester une intégration
router.post('/:id/test', async (req, res, next) => {
  try {
    const integration = await prisma.integration.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!integration) {
      return res.status(404).json({
        error: 'Intégration non trouvée'
      });
    }

    const decryptedCredentials = decryptCredentials(integration.credentials);
    
    try {
      const testResult = await testConnection(integration.platform, decryptedCredentials);
      
      // Mettre à jour le statut
      await prisma.integration.update({
        where: { id: req.params.id },
        data: { 
          status: 'CONNECTED',
          lastSyncAt: new Date(),
          syncStatus: 'SUCCESS'
        }
      });

      res.json({
        message: 'Test de connexion réussi',
        result: testResult
      });
    } catch (testError) {
      // Marquer comme en erreur
      await prisma.integration.update({
        where: { id: req.params.id },
        data: { 
          status: 'ERROR',
          syncStatus: 'FAILED',
          metadata: {
            ...integration.metadata,
            lastError: testError.message,
            lastErrorAt: new Date().toISOString()
          }
        }
      });

      res.status(400).json({
        error: 'Test de connexion échoué',
        details: testError.message
      });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/integrations/:id/sync - Synchroniser une intégration
router.post('/:id/sync', async (req, res, next) => {
  try {
    const { syncType = 'full' } = req.body;

    const integration = await prisma.integration.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!integration) {
      return res.status(404).json({
        error: 'Intégration non trouvée'
      });
    }

    if (integration.status !== 'CONNECTED') {
      return res.status(400).json({
        error: 'Intégration non connectée'
      });
    }

    // Marquer la sync comme en cours
    await prisma.integration.update({
      where: { id: req.params.id },
      data: { syncStatus: 'IN_PROGRESS' }
    });

    try {
      const decryptedCredentials = decryptCredentials(integration.credentials);
      const syncResult = await performSync(integration.platform, decryptedCredentials, syncType);

      // Mettre à jour avec le résultat
      await prisma.integration.update({
        where: { id: req.params.id },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'SUCCESS',
          metadata: {
            ...integration.metadata,
            lastSync: {
              type: syncType,
              result: syncResult,
              timestamp: new Date().toISOString()
            }
          }
        }
      });

      res.json({
        message: 'Synchronisation réussie',
        result: syncResult
      });
    } catch (syncError) {
      // Marquer la sync comme échouée
      await prisma.integration.update({
        where: { id: req.params.id },
        data: {
          syncStatus: 'FAILED',
          metadata: {
            ...integration.metadata,
            lastError: syncError.message,
            lastErrorAt: new Date().toISOString()
          }
        }
      });

      res.status(500).json({
        error: 'Échec de la synchronisation',
        details: syncError.message
      });
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/integrations/:id - Supprimer une intégration
router.delete('/:id', async (req, res, next) => {
  try {
    const integration = await prisma.integration.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!integration) {
      return res.status(404).json({
        error: 'Intégration non trouvée'
      });
    }

    await prisma.integration.delete({
      where: { id: req.params.id }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'INTEGRATION_DISCONNECTED',
        title: 'Intégration supprimée',
        description: `Intégration supprimée: ${INTEGRATION_PLATFORMS[integration.platform].name}`,
        metadata: { platform: integration.platform }
      }
    });

    res.json({
      message: 'Intégration supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/integrations/:id/data - Récupérer des données depuis l'intégration
router.get('/:id/data', async (req, res, next) => {
  try {
    const { dataType, limit = 100, offset = 0 } = req.query;

    const integration = await prisma.integration.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!integration) {
      return res.status(404).json({
        error: 'Intégration non trouvée'
      });
    }

    if (integration.status !== 'CONNECTED') {
      return res.status(400).json({
        error: 'Intégration non connectée'
      });
    }

    const decryptedCredentials = decryptCredentials(integration.credentials);
    const data = await fetchIntegrationData(
      integration.platform, 
      decryptedCredentials, 
      dataType, 
      { limit: parseInt(limit), offset: parseInt(offset) }
    );

    res.json({
      data,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: data.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Fonctions utilitaires

function encryptCredentials(credentials) {
  const algorithm = 'aes-256-gcm';
  const secretKey = process.env.ENCRYPTION_KEY || 'default-secret-key-32-chars-long';
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, secretKey);
  let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex')
  };
}

function decryptCredentials(encryptedData) {
  const algorithm = 'aes-256-gcm';
  const secretKey = process.env.ENCRYPTION_KEY || 'default-secret-key-32-chars-long';
  
  const decipher = crypto.createDecipher(algorithm, secretKey);
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

async function testConnection(platform, credentials) {
  switch (platform) {
    case 'FACEBOOK_ADS':
      return await testFacebookConnection(credentials);
    case 'GOOGLE_ADS':
      return await testGoogleAdsConnection(credentials);
    case 'MAILCHIMP':
      return await testMailchimpConnection(credentials);
    case 'SLACK':
      return await testSlackConnection(credentials);
    default:
      return { status: 'success', message: 'Connexion simulée réussie' };
  }
}

async function testFacebookConnection(credentials) {
  try {
    const response = await axios.get(`https://graph.facebook.com/v18.0/me/adaccounts`, {
      params: {
        access_token: credentials.accessToken,
        fields: 'account_id,name,account_status'
      }
    });
    
    return {
      status: 'success',
      accountsFound: response.data.data.length,
      accounts: response.data.data
    };
  } catch (error) {
    throw new Error(`Erreur Facebook API: ${error.response?.data?.error?.message || error.message}`);
  }
}

async function testGoogleAdsConnection(credentials) {
  // Simulation - dans un vrai projet, utiliser l'API Google Ads
  return {
    status: 'success',
    message: 'Connexion Google Ads simulée'
  };
}

async function testMailchimpConnection(credentials) {
  try {
    const response = await axios.get(`https://${credentials.serverPrefix}.api.mailchimp.com/3.0/lists`, {
      headers: {
        'Authorization': `apikey ${credentials.apiKey}`
      }
    });
    
    return {
      status: 'success',
      listsFound: response.data.total_items
    };
  } catch (error) {
    throw new Error(`Erreur Mailchimp API: ${error.response?.data?.detail || error.message}`);
  }
}

async function testSlackConnection(credentials) {
  try {
    const response = await axios.post(credentials.webhookUrl, {
      text: 'Test de connexion ADS Platform ✅'
    });
    
    return {
      status: 'success',
      message: 'Message de test envoyé'
    };
  } catch (error) {
    throw new Error(`Erreur Slack Webhook: ${error.message}`);
  }
}

async function performSync(platform, credentials, syncType) {
  // Ici on implémenterait la logique de sync spécifique à chaque plateforme
  return {
    type: syncType,
    itemsSynced: Math.floor(Math.random() * 100) + 1,
    timestamp: new Date().toISOString()
  };
}

async function fetchIntegrationData(platform, credentials, dataType, options) {
  // Ici on implémenterait la récupération de données spécifique à chaque plateforme
  return Array.from({ length: Math.min(options.limit, 10) }, (_, i) => ({
    id: i + options.offset,
    name: `Item ${i + options.offset + 1}`,
    platform,
    dataType,
    timestamp: new Date().toISOString()
  }));
}

module.exports = router; 