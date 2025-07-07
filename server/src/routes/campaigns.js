const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateCampaign = [
  body('name').trim().isLength({ min: 3 }).withMessage('Le nom doit contenir au moins 3 caractères'),
  body('budget').isFloat({ min: 0 }).withMessage('Le budget doit être un nombre positif'),
  body('description').optional().trim(),
  body('startDate').optional().isISO8601().withMessage('Date de début invalide'),
  body('endDate').optional().isISO8601().withMessage('Date de fin invalide')
];

const validateAd = [
  body('title').trim().isLength({ min: 3 }).withMessage('Le titre doit contenir au moins 3 caractères'),
  body('description').trim().isLength({ min: 10 }).withMessage('La description doit contenir au moins 10 caractères'),
  body('callToAction').trim().notEmpty().withMessage('L\'appel à l\'action est requis'),
  body('imageUrl').optional().isURL().withMessage('URL d\'image invalide'),
  body('videoUrl').optional().isURL().withMessage('URL de vidéo invalide'),
  body('targetUrl').isURL().withMessage('URL de destination requise')
];

// GET /api/campaigns - Liste des campagnes
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search, archived = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId: req.user.id,
      archived: archived === 'true',
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          ads: {
            select: {
              id: true,
              title: true,
              status: true,
              impressions: true,
              clicks: true,
              conversions: true
            }
          },
          _count: {
            select: { ads: true }
          }
        }
      }),
      prisma.campaign.count({ where })
    ]);

    // Calculer les métriques agrégées pour chaque campagne
    const campaignsWithMetrics = campaigns.map(campaign => {
      const totalImpressions = campaign.ads.reduce((sum, ad) => sum + ad.impressions, 0);
      const totalClicks = campaign.ads.reduce((sum, ad) => sum + ad.clicks, 0);
      const totalConversions = campaign.ads.reduce((sum, ad) => sum + ad.conversions, 0);
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      
      return {
        ...campaign,
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
        ctr: parseFloat(ctr.toFixed(2))
      };
    });

    res.json({
      data: campaignsWithMetrics,
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

// GET /api/campaigns/:id - Détails d'une campagne
router.get('/:id', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        ads: {
          orderBy: { createdAt: 'desc' }
        },
        analytics: {
          orderBy: { date: 'desc' },
          take: 30 // 30 derniers jours
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({
        error: 'Campagne non trouvée'
      });
    }

    res.json(campaign);
  } catch (error) {
    next(error);
  }
});

// POST /api/campaigns - Créer une campagne
router.post('/', validateCampaign, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { 
      name, 
      description, 
      budget, 
      budgetType = 'TOTAL',
      startDate, 
      endDate,
      objective,
      targetAudience,
      adSets = [],
      conversionTracking
    } = req.body;

    // Vérifier les limites d'abonnement
    const userSubscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    const campaignCount = await prisma.campaign.count({
      where: { userId: req.user.id, archived: false }
    });

    const limits = {
      FREE: 3,
      STARTER: 25,
      PRO: 100,
      ENTERPRISE: Infinity
    };

    if (campaignCount >= limits[userSubscription?.plan || 'FREE']) {
      return res.status(403).json({
        error: 'Limite de campagnes atteinte pour votre abonnement'
      });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        budget: parseFloat(budget),
        budgetType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        objective,
        targetAudience: targetAudience || {},
        conversionTracking: conversionTracking || {},
        status: 'DRAFT',
        userId: req.user.id
      }
    });

    // Créer les annonces si fournies
    if (adSets && adSets.length > 0) {
      await Promise.all(
        adSets.map(ad => 
          prisma.ad.create({
            data: {
              title: ad.headline,
              description: ad.description,
              callToAction: ad.callToAction,
              imageUrl: ad.imageUrl,
              videoUrl: ad.videoUrl,
              targetUrl: ad.targetUrl || '#',
              campaignId: campaign.id,
              status: 'DRAFT'
            }
          })
        )
      );
    }

    // Enregistrer l'activité
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'CAMPAIGN_CREATED',
        title: 'Campagne créée',
        description: `Nouvelle campagne: ${name}`,
        metadata: { campaignId: campaign.id }
      }
    });

    const campaignWithAds = await prisma.campaign.findUnique({
      where: { id: campaign.id },
      include: { ads: true }
    });

    res.status(201).json({
      message: 'Campagne créée avec succès',
      campaign: campaignWithAds
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/campaigns/:id/duplicate - Dupliquer une campagne
router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const originalCampaign = await prisma.campaign.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        ads: true
      }
    });

    if (!originalCampaign) {
      return res.status(404).json({
        error: 'Campagne non trouvée'
      });
    }

    const { name } = req.body;
    const newName = name || `${originalCampaign.name} (Copie)`;

    const duplicatedCampaign = await prisma.campaign.create({
      data: {
        name: newName,
        description: originalCampaign.description,
        budget: originalCampaign.budget,
        budgetType: originalCampaign.budgetType,
        objective: originalCampaign.objective,
        targetAudience: originalCampaign.targetAudience,
        conversionTracking: originalCampaign.conversionTracking,
        status: 'DRAFT',
        userId: req.user.id
      }
    });

    // Dupliquer les annonces
    if (originalCampaign.ads.length > 0) {
      await Promise.all(
        originalCampaign.ads.map(ad => 
          prisma.ad.create({
            data: {
              title: ad.title,
              description: ad.description,
              callToAction: ad.callToAction,
              imageUrl: ad.imageUrl,
              videoUrl: ad.videoUrl,
              targetUrl: ad.targetUrl,
              campaignId: duplicatedCampaign.id,
              status: 'DRAFT'
            }
          })
        )
      );
    }

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'CAMPAIGN_DUPLICATED',
        title: 'Campagne dupliquée',
        description: `Campagne dupliquée: ${newName}`,
        metadata: { 
          originalCampaignId: originalCampaign.id,
          newCampaignId: duplicatedCampaign.id 
        }
      }
    });

    const campaignWithAds = await prisma.campaign.findUnique({
      where: { id: duplicatedCampaign.id },
      include: { ads: true }
    });

    res.status(201).json({
      message: 'Campagne dupliquée avec succès',
      campaign: campaignWithAds
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/campaigns/:id/archive - Archiver une campagne
router.put('/:id/archive', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!campaign) {
      return res.status(404).json({
        error: 'Campagne non trouvée'
      });
    }

    await prisma.campaign.update({
      where: { id: req.params.id },
      data: { 
        archived: true,
        status: 'CANCELLED',
        archivedAt: new Date()
      }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'CAMPAIGN_ARCHIVED',
        title: 'Campagne archivée',
        description: `Campagne archivée: ${campaign.name}`,
        metadata: { campaignId: campaign.id }
      }
    });

    res.json({
      message: 'Campagne archivée avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/campaigns/:id/restore - Restaurer une campagne archivée
router.put('/:id/restore', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
        archived: true
      }
    });

    if (!campaign) {
      return res.status(404).json({
        error: 'Campagne archivée non trouvée'
      });
    }

    await prisma.campaign.update({
      where: { id: req.params.id },
      data: { 
        archived: false,
        status: 'DRAFT',
        archivedAt: null
      }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'CAMPAIGN_RESTORED',
        title: 'Campagne restaurée',
        description: `Campagne restaurée: ${campaign.name}`,
        metadata: { campaignId: campaign.id }
      }
    });

    res.json({
      message: 'Campagne restaurée avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/campaigns/:id - Mettre à jour une campagne
router.put('/:id', validateCampaign, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { name, description, budget, budgetType, startDate, endDate, status, objective, targetAudience } = req.body;

    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingCampaign) {
      return res.status(404).json({
        error: 'Campagne non trouvée'
      });
    }

    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        budget: parseFloat(budget),
        budgetType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        objective,
        targetAudience,
        ...(status && { status })
      },
      include: {
        ads: true
      }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'CAMPAIGN_UPDATED',
        title: 'Campagne modifiée',
        description: `Campagne modifiée: ${name}`,
        metadata: { campaignId: campaign.id }
      }
    });

    res.json({
      message: 'Campagne mise à jour avec succès',
      campaign
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/campaigns/:id - Supprimer une campagne
router.delete('/:id', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!campaign) {
      return res.status(404).json({
        error: 'Campagne non trouvée'
      });
    }

    await prisma.campaign.delete({
      where: { id: req.params.id }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'CAMPAIGN_DELETED',
        title: 'Campagne supprimée',
        description: `Campagne supprimée: ${campaign.name}`,
        metadata: { campaignId: campaign.id }
      }
    });

    res.json({
      message: 'Campagne supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/campaigns/:id/stats - Statistiques d'une campagne
router.get('/:id/stats', async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        ads: true,
        analytics: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({
        error: 'Campagne non trouvée'
      });
    }

    // Filtrer par période
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    const filteredAnalytics = campaign.analytics.filter(
      analytic => new Date(analytic.date) >= startDate
    );

    const totalImpressions = campaign.ads.reduce((sum, ad) => sum + ad.impressions, 0);
    const totalClicks = campaign.ads.reduce((sum, ad) => sum + ad.clicks, 0);
    const totalConversions = campaign.ads.reduce((sum, ad) => sum + ad.conversions, 0);
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    const stats = {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        budget: campaign.budget,
        spent: campaign.spent
      },
      metrics: {
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        costPerClick: totalClicks > 0 ? campaign.spent / totalClicks : 0,
        costPerConversion: totalConversions > 0 ? campaign.spent / totalConversions : 0
      },
      timeline: filteredAnalytics.map(analytic => ({
        date: analytic.date,
        impressions: analytic.impressions,
        clicks: analytic.clicks,
        conversions: analytic.conversions,
        cost: analytic.cost
      })),
      ads: campaign.ads.map(ad => ({
        id: ad.id,
        title: ad.title,
        status: ad.status,
        impressions: ad.impressions,
        clicks: ad.clicks,
        conversions: ad.conversions,
        ctr: ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0
      }))
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Routes pour la gestion des annonces dans une campagne

// GET /api/campaigns/:id/ads - Liste des annonces d'une campagne
router.get('/:id/ads', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!campaign) {
      return res.status(404).json({
        error: 'Campagne non trouvée'
      });
    }

    const ads = await prisma.ad.findMany({
      where: { campaignId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ ads });
  } catch (error) {
    next(error);
  }
});

// POST /api/campaigns/:id/ads - Créer une annonce dans une campagne
router.post('/:id/ads', validateAd, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!campaign) {
      return res.status(404).json({
        error: 'Campagne non trouvée'
      });
    }

    const { title, description, callToAction, imageUrl, videoUrl, targetUrl } = req.body;

    const ad = await prisma.ad.create({
      data: {
        title,
        description,
        callToAction,
        imageUrl,
        videoUrl,
        targetUrl,
        campaignId: req.params.id,
        status: 'DRAFT'
      }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'AD_CREATED',
        title: 'Annonce créée',
        description: `Nouvelle annonce: ${title}`,
        metadata: { 
          campaignId: req.params.id,
          adId: ad.id 
        }
      }
    });

    res.status(201).json({
      message: 'Annonce créée avec succès',
      ad
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/campaigns/:campaignId/ads/:adId - Mettre à jour une annonce
router.put('/:campaignId/ads/:adId', validateAd, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: req.params.campaignId,
        userId: req.user.id
      }
    });

    if (!campaign) {
      return res.status(404).json({
        error: 'Campagne non trouvée'
      });
    }

    const { title, description, callToAction, imageUrl, videoUrl, targetUrl, status } = req.body;

    const ad = await prisma.ad.update({
      where: { 
        id: req.params.adId,
        campaignId: req.params.campaignId 
      },
      data: {
        title,
        description,
        callToAction,
        imageUrl,
        videoUrl,
        targetUrl,
        ...(status && { status })
      }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'AD_UPDATED',
        title: 'Annonce modifiée',
        description: `Annonce modifiée: ${title}`,
        metadata: { 
          campaignId: req.params.campaignId,
          adId: ad.id 
        }
      }
    });

    res.json({
      message: 'Annonce mise à jour avec succès',
      ad
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/campaigns/:campaignId/ads/:adId - Supprimer une annonce
router.delete('/:campaignId/ads/:adId', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: req.params.campaignId,
        userId: req.user.id
      }
    });

    if (!campaign) {
      return res.status(404).json({
        error: 'Campagne non trouvée'
      });
    }

    const ad = await prisma.ad.findFirst({
      where: {
        id: req.params.adId,
        campaignId: req.params.campaignId
      }
    });

    if (!ad) {
      return res.status(404).json({
        error: 'Annonce non trouvée'
      });
    }

    await prisma.ad.delete({
      where: { id: req.params.adId }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'AD_DELETED',
        title: 'Annonce supprimée',
        description: `Annonce supprimée: ${ad.title}`,
        metadata: { 
          campaignId: req.params.campaignId,
          adId: ad.id 
        }
      }
    });

    res.json({
      message: 'Annonce supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 