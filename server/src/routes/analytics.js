const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

// Types de rapports disponibles
const REPORT_TYPES = {
  CAMPAIGN_PERFORMANCE: {
    name: 'Performance des campagnes',
    description: 'Analyse détaillée des métriques de performance',
    metrics: ['impressions', 'clicks', 'conversions', 'cost', 'ctr', 'conversionRate']
  },
  BUDGET_ANALYSIS: {
    name: 'Analyse budgétaire',
    description: 'Suivi des dépenses et optimisation du budget',
    metrics: ['cost', 'budget', 'spent', 'remaining', 'efficiency']
  },
  AUDIENCE_INSIGHTS: {
    name: 'Insights audience',
    description: 'Analyse démographique et comportementale',
    metrics: ['demographics', 'interests', 'behavior', 'devices']
  },
  CONVERSION_FUNNEL: {
    name: 'Entonnoir de conversion',
    description: 'Analyse du parcours utilisateur et des conversions',
    metrics: ['impressions', 'clicks', 'conversions', 'stages']
  },
  CUSTOM: {
    name: 'Rapport personnalisé',
    description: 'Rapport avec métriques et filtres personnalisés',
    metrics: []
  }
};

// Validation middleware
const validateReportRequest = [
  body('name').notEmpty().withMessage('Le nom du rapport est requis'),
  body('type').isIn(Object.keys(REPORT_TYPES)).withMessage('Type de rapport invalide'),
  body('format').isIn(['pdf', 'excel', 'csv', 'json']).withMessage('Format invalide'),
  body('dateRange.start').isISO8601().withMessage('Date de début invalide'),
  body('dateRange.end').isISO8601().withMessage('Date de fin invalide')
];

// GET /api/analytics/dashboard - Données du tableau de bord
router.get('/dashboard', async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculer les dates
    const endDate = new Date();
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

    // Récupérer les campagnes de l'utilisateur avec leurs analytics
    const campaigns = await prisma.campaign.findMany({
      where: { userId: req.user.id },
      include: {
        analytics: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    });

    // Calculer les métriques totales
    let totalMetrics = {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      cost: 0
    };

    const dailyStats = [];
    const campaignStats = [];

    // Traitement des données par campagne
    campaigns.forEach(campaign => {
      let campaignMetrics = {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0
      };

      campaign.analytics.forEach(analytics => {
        campaignMetrics.impressions += analytics.impressions;
        campaignMetrics.clicks += analytics.clicks;
        campaignMetrics.conversions += analytics.conversions;
        campaignMetrics.cost += analytics.cost;
        
        totalMetrics.impressions += analytics.impressions;
        totalMetrics.clicks += analytics.clicks;
        totalMetrics.conversions += analytics.conversions;
        totalMetrics.cost += analytics.cost;

        // Agrégation par jour
        const dateKey = analytics.date.toISOString().split('T')[0];
        let dayData = dailyStats.find(d => d.date === dateKey);
        if (!dayData) {
          dayData = {
            date: dateKey,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            cost: 0,
            revenue: 0
          };
          dailyStats.push(dayData);
        }
        dayData.impressions += analytics.impressions;
        dayData.clicks += analytics.clicks;
        dayData.conversions += analytics.conversions;
        dayData.cost += analytics.cost;
        dayData.revenue += analytics.revenue || analytics.conversions * 50; // Estimation du revenu
      });

      // Calculer les métriques dérivées pour la campagne
      const ctr = campaignMetrics.impressions > 0 ? (campaignMetrics.clicks / campaignMetrics.impressions) * 100 : 0;
      const conversionRate = campaignMetrics.clicks > 0 ? (campaignMetrics.conversions / campaignMetrics.clicks) * 100 : 0;

      campaignStats.push({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        budget: campaign.budget,
        spent: campaign.spent,
        impressions: campaignMetrics.impressions,
        clicks: campaignMetrics.clicks,
        conversions: campaignMetrics.conversions,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        userId: campaign.userId,
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2))
      });
    });

    // Calculer les métriques globales dérivées
    const ctr = totalMetrics.impressions > 0 ? (totalMetrics.clicks / totalMetrics.impressions) * 100 : 0;
    const conversionRate = totalMetrics.clicks > 0 ? (totalMetrics.conversions / totalMetrics.clicks) * 100 : 0;
    const averageCpc = totalMetrics.clicks > 0 ? totalMetrics.cost / totalMetrics.clicks : 0;
    const averageCpa = totalMetrics.conversions > 0 ? totalMetrics.cost / totalMetrics.conversions : 0;
    const budgetUtilization = campaigns.length > 0 ? 
      (campaigns.reduce((sum, c) => sum + c.spent, 0) / campaigns.reduce((sum, c) => sum + c.budget, 1)) * 100 : 0;

    // Activités récentes
    const recentActivities = await prisma.activity.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Trier les stats quotidiennes par date
    dailyStats.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      overview: {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
        totalAds: campaigns.reduce((sum, c) => sum + (c.ads?.length || 0), 0),
        totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0)
      },
      metrics: {
        impressions: totalMetrics.impressions,
        clicks: totalMetrics.clicks,
        conversions: totalMetrics.conversions,
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        budgetUtilization: parseFloat(budgetUtilization.toFixed(1)),
        averageCpc: parseFloat(averageCpc.toFixed(2)),
        averageCpa: parseFloat(averageCpa.toFixed(2))
      },
      charts: {
        dailyStats: dailyStats,
        topCampaigns: campaignStats.slice(0, 5)
      },
      recentActivities: recentActivities
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/overview - Vue d'ensemble des analytics
router.get('/overview', async (req, res, next) => {
  try {
    const { period = '30d', campaignId } = req.query;
    
    // Calculer les dates
    const endDate = new Date();
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
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const whereClause = {
      campaign: { userId: req.user.id },
      date: {
        gte: startDate,
        lte: endDate
      },
      ...(campaignId && { campaignId })
    };

    // Métriques principales
    const analytics = await prisma.analytics.aggregate({
      where: whereClause,
      _sum: {
        impressions: true,
        clicks: true,
        conversions: true,
        cost: true
      }
    });

    const totalImpressions = analytics._sum.impressions || 0;
    const totalClicks = analytics._sum.clicks || 0;
    const totalConversions = analytics._sum.conversions || 0;
    const totalCost = analytics._sum.cost || 0;

    // Calculer les métriques dérivées
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const cpc = totalClicks > 0 ? totalCost / totalClicks : 0;
    const cpa = totalConversions > 0 ? totalCost / totalConversions : 0;

    // Évolution temporelle
    const timelineData = await prisma.analytics.findMany({
      where: whereClause,
      select: {
        date: true,
        impressions: true,
        clicks: true,
        conversions: true,
        cost: true
      },
      orderBy: { date: 'asc' }
    });

    // Données par campagne
    const campaignData = await prisma.analytics.groupBy({
      by: ['campaignId'],
      where: whereClause,
      _sum: {
        impressions: true,
        clicks: true,
        conversions: true,
        cost: true
      },
      _count: true
    });

    // Enrichir avec les informations de campagne
    const enrichedCampaignData = await Promise.all(
      campaignData.map(async (data) => {
        const campaign = await prisma.campaign.findUnique({
          where: { id: data.campaignId },
          select: { name: true, status: true, objective: true }
        });
        
        return {
          ...data,
          campaign,
          ctr: data._sum.impressions > 0 ? (data._sum.clicks / data._sum.impressions) * 100 : 0,
          cpc: data._sum.clicks > 0 ? data._sum.cost / data._sum.clicks : 0
        };
      })
    );

    // Comparaison avec la période précédente
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    const periodDiff = endDate.getTime() - startDate.getTime();
    previousStartDate.setTime(startDate.getTime() - periodDiff);

    const previousAnalytics = await prisma.analytics.aggregate({
      where: {
        campaign: { userId: req.user.id },
        date: {
          gte: previousStartDate,
          lte: previousEndDate
        },
        ...(campaignId && { campaignId })
      },
      _sum: {
        impressions: true,
        clicks: true,
        conversions: true,
        cost: true
      }
    });

    // Calculer les variations
    const calculateGrowth = (current, previous) => {
      if (!previous || previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const growth = {
      impressions: calculateGrowth(totalImpressions, previousAnalytics._sum.impressions || 0),
      clicks: calculateGrowth(totalClicks, previousAnalytics._sum.clicks || 0),
      conversions: calculateGrowth(totalConversions, previousAnalytics._sum.conversions || 0),
      cost: calculateGrowth(totalCost, previousAnalytics._sum.cost || 0)
    };

    res.json({
      period,
      dateRange: { start: startDate, end: endDate },
      metrics: {
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
        cost: totalCost,
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        cpa: parseFloat(cpa.toFixed(2))
      },
      growth,
      timeline: timelineData,
      campaigns: enrichedCampaignData,
      summary: {
        totalCampaigns: enrichedCampaignData.length,
        activeCampaigns: enrichedCampaignData.filter(c => c.campaign?.status === 'ACTIVE').length,
        bestPerformingCampaign: enrichedCampaignData.sort((a, b) => b.ctr - a.ctr)[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/campaigns/:campaignId - Analytics détaillées d'une campagne
router.get('/campaigns/:campaignId', async (req, res, next) => {
  try {
    const { period = '30d', breakdown = 'daily' } = req.query;

    // Vérifier que la campagne appartient à l'utilisateur
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: req.params.campaignId,
        userId: req.user.id
      },
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
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({
        error: 'Campagne non trouvée'
      });
    }

    // Calculer les dates
    const endDate = new Date();
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

    // Analytics de la campagne
    const analytics = await prisma.analytics.findMany({
      where: {
        campaignId: req.params.campaignId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // Grouper par période selon le breakdown
    const groupedData = groupDataByPeriod(analytics, breakdown);

    // Analytics par annonce
    const adAnalytics = campaign.ads.map(ad => {
      const adData = analytics.filter(a => a.adId === ad.id);
      const totals = adData.reduce(
        (acc, curr) => ({
          impressions: acc.impressions + curr.impressions,
          clicks: acc.clicks + curr.clicks,
          conversions: acc.conversions + curr.conversions,
          cost: acc.cost + curr.cost
        }),
        { impressions: 0, clicks: 0, conversions: 0, cost: 0 }
      );

      return {
        ...ad,
        analytics: totals,
        ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
        conversionRate: totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0,
        cpc: totals.clicks > 0 ? totals.cost / totals.clicks : 0
      };
    });

    // Analyse de l'audience (simulation avec des données réalistes)
    const audienceInsights = generateAudienceInsights(campaign);

    // Recommandations d'optimisation
    const recommendations = generateRecommendations(campaign, analytics);

    res.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        budget: campaign.budget,
        spent: campaign.spent
      },
      period,
      breakdown,
      timeline: groupedData,
      ads: adAnalytics,
      audienceInsights,
      recommendations,
      totals: analytics.reduce(
        (acc, curr) => ({
          impressions: acc.impressions + curr.impressions,
          clicks: acc.clicks + curr.clicks,
          conversions: acc.conversions + curr.conversions,
          cost: acc.cost + curr.cost
        }),
        { impressions: 0, clicks: 0, conversions: 0, cost: 0 }
      )
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/analytics/reports - Générer un rapport personnalisé
router.post('/reports', validateReportRequest, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const {
      type,
      name,
      description,
      dateRange,
      campaigns = [],
      metrics = [],
      filters = {},
      groupBy = 'date',
      format = 'json'
    } = req.body;

    // Construire la requête
    const whereClause = {
      campaign: { userId: req.user.id },
      date: {
        gte: new Date(dateRange.start),
        lte: new Date(dateRange.end)
      },
      ...(campaigns.length > 0 && { campaignId: { in: campaigns } }),
      ...(filters.minImpressions && { impressions: { gte: filters.minImpressions } }),
      ...(filters.minClicks && { clicks: { gte: filters.minClicks } })
    };

    // Récupérer les données
    let reportData;
    if (groupBy === 'campaign') {
      reportData = await prisma.analytics.groupBy({
        by: ['campaignId'],
        where: whereClause,
        _sum: {
          impressions: true,
          clicks: true,
          conversions: true,
          cost: true
        }
      });
      
      // Enrichir avec les infos de campagne
      reportData = await Promise.all(
        reportData.map(async (data) => {
          const campaign = await prisma.campaign.findUnique({
            where: { id: data.campaignId },
            select: { name: true, objective: true }
          });
          return { ...data, campaign };
        })
      );
    } else {
      reportData = await prisma.analytics.findMany({
        where: whereClause,
        include: {
          campaign: {
            select: { name: true, objective: true }
          }
        },
        orderBy: { date: 'asc' }
      });
    }

    // Traiter selon le type de rapport
    const processedData = await processReportData(type, reportData, metrics);

    // Créer l'enregistrement du rapport
    const report = await prisma.report.create({
      data: {
        name: name || `Rapport ${REPORT_TYPES[type].name}`,
        description,
        type,
        dateRange: {
          start: dateRange.start,
          end: dateRange.end
        },
        filters,
        data: processedData,
        userId: req.user.id,
        format,
        status: 'COMPLETED'
      }
    });

    // Générer le fichier selon le format demandé
    let fileUrl = null;
    if (format !== 'json') {
      fileUrl = await generateReportFile(report, processedData, format);
      
      // Mettre à jour le rapport avec l'URL du fichier
      await prisma.report.update({
        where: { id: report.id },
        data: { fileUrl }
      });
    }

    // Enregistrer l'activité
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'REPORT_GENERATED',
        title: 'Rapport généré',
        description: `Nouveau rapport: ${report.name}`,
        metadata: { reportId: report.id, type, format }
      }
    });

    res.status(201).json({
      message: 'Rapport généré avec succès',
      report: {
        id: report.id,
        name: report.name,
        type: report.type,
        status: report.status,
        format: report.format,
        fileUrl,
        createdAt: report.createdAt,
        data: format === 'json' ? processedData : null
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/reports - Liste des rapports
router.get('/reports', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId: req.user.id,
      ...(type && { type }),
      ...(status && { status })
    };

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          format: true,
          status: true,
          fileUrl: true,
          createdAt: true,
          dateRange: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.report.count({ where })
    ]);

    res.json({
      data: reports,
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

// GET /api/analytics/reports/:id - Détails d'un rapport
router.get('/reports/:id', async (req, res, next) => {
  try {
    const report = await prisma.report.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!report) {
      return res.status(404).json({
        error: 'Rapport non trouvé'
      });
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
});

// POST /api/analytics/reports/:id/schedule - Planifier un rapport récurrent
router.post('/reports/:id/schedule', async (req, res, next) => {
  try {
    const { frequency, recipients, enabled = true } = req.body;

    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({
        error: 'Fréquence invalide'
      });
    }

    const report = await prisma.report.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!report) {
      return res.status(404).json({
        error: 'Rapport non trouvé'
      });
    }

    const scheduledReport = await prisma.scheduledReport.create({
      data: {
        reportId: req.params.id,
        frequency,
        recipients: recipients || [req.user.email],
        enabled,
        nextRun: calculateNextRun(frequency),
        userId: req.user.id
      }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'REPORT_SCHEDULED',
        title: 'Rapport planifié',
        description: `Rapport "${report.name}" planifié (${frequency})`,
        metadata: { reportId: report.id, frequency }
      }
    });

    res.status(201).json({
      message: 'Rapport planifié avec succès',
      scheduledReport
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/reports/types - Types de rapports disponibles
router.get('/reports/types', async (req, res, next) => {
  try {
    const types = Object.entries(REPORT_TYPES).map(([key, type]) => ({
      id: key,
      ...type
    }));

    res.json({ types });
  } catch (error) {
    next(error);
  }
});

// POST /api/analytics/compare - Comparer des campagnes ou des périodes
router.post('/compare', async (req, res, next) => {
  try {
    const {
      type, // 'campaigns' ou 'periods'
      campaigns = [],
      periods = [],
      metrics = ['impressions', 'clicks', 'conversions', 'cost']
    } = req.body;

    let comparisonData = {};

    if (type === 'campaigns') {
      // Comparaison entre campagnes
      comparisonData = await compareCampaigns(campaigns, metrics, req.user.id);
    } else if (type === 'periods') {
      // Comparaison entre périodes
      comparisonData = await comparePeriods(periods, metrics, req.user.id);
    }

    res.json(comparisonData);
  } catch (error) {
    next(error);
  }
});

// Fonctions utilitaires

function groupDataByPeriod(data, breakdown) {
  // Grouper les données par période (daily, weekly, monthly)
  const groupedMap = new Map();

  data.forEach(item => {
    let key;
    const date = new Date(item.date);

    switch (breakdown) {
      case 'daily':
        key = date.toISOString().split('T')[0];
        break;
      case 'weekly':
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split('T')[0];
        break;
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        date: key,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0
      });
    }

    const existing = groupedMap.get(key);
    existing.impressions += item.impressions;
    existing.clicks += item.clicks;
    existing.conversions += item.conversions;
    existing.cost += item.cost;
  });

  return Array.from(groupedMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function generateAudienceInsights(campaign) {
  // Simulation d'insights d'audience basés sur l'objectif de campagne
  const baseInsights = {
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 15, performance: 'good' },
        { range: '25-34', percentage: 35, performance: 'excellent' },
        { range: '35-44', percentage: 25, performance: 'good' },
        { range: '45-54', percentage: 15, performance: 'average' },
        { range: '55+', percentage: 10, performance: 'poor' }
      ],
      genders: [
        { gender: 'Femmes', percentage: 52, performance: 'good' },
        { gender: 'Hommes', percentage: 48, performance: 'good' }
      ]
    },
    geography: [
      { location: 'Paris', percentage: 25, performance: 'excellent' },
      { location: 'Lyon', percentage: 12, performance: 'good' },
      { location: 'Marseille', percentage: 10, performance: 'good' },
      { location: 'Toulouse', percentage: 8, performance: 'average' },
      { location: 'Autres', percentage: 45, performance: 'average' }
    ],
    devices: [
      { device: 'Mobile', percentage: 65, performance: 'excellent' },
      { device: 'Desktop', percentage: 30, performance: 'good' },
      { device: 'Tablet', percentage: 5, performance: 'poor' }
    ]
  };

  return baseInsights;
}

function generateRecommendations(campaign, analytics) {
  const recommendations = [];
  
  // Analyser les performances pour générer des recommandations
  const totalClicks = analytics.reduce((sum, a) => sum + a.clicks, 0);
  const totalImpressions = analytics.reduce((sum, a) => sum + a.impressions, 0);
  const totalCost = analytics.reduce((sum, a) => sum + a.cost, 0);
  const totalConversions = analytics.reduce((sum, a) => sum + a.conversions, 0);

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const cpc = totalClicks > 0 ? totalCost / totalClicks : 0;

  if (ctr < 1) {
    recommendations.push({
      type: 'improve_ctr',
      priority: 'high',
      title: 'Améliorer le taux de clic',
      description: 'Votre CTR est faible. Essayez de modifier vos visuels ou votre message.',
      impact: 'high'
    });
  }

  if (conversionRate < 2) {
    recommendations.push({
      type: 'improve_conversion',
      priority: 'high',
      title: 'Optimiser les conversions',
      description: 'Vérifiez votre page de destination et simplifiez le processus de conversion.',
      impact: 'high'
    });
  }

  if (cpc > 2) {
    recommendations.push({
      type: 'reduce_cpc',
      priority: 'medium',
      title: 'Réduire le coût par clic',
      description: 'Affinez votre ciblage pour réduire la concurrence.',
      impact: 'medium'
    });
  }

  return recommendations;
}

async function processReportData(type, data, metrics) {
  switch (type) {
    case 'CAMPAIGN_PERFORMANCE':
      return data.map(item => ({
        ...item,
        ctr: item.impressions > 0 ? (item.clicks / item.impressions) * 100 : 0,
        conversionRate: item.clicks > 0 ? (item.conversions / item.clicks) * 100 : 0,
        cpc: item.clicks > 0 ? item.cost / item.clicks : 0,
        roas: item.cost > 0 ? (item.conversions * 50) / item.cost : 0 // Simulation ROAS
      }));
    
    case 'BUDGET_ANALYSIS':
      return {
        totalSpent: data.reduce((sum, item) => sum + item.cost, 0),
        averageCPC: data.reduce((sum, item) => sum + item.cost, 0) / data.reduce((sum, item) => sum + item.clicks, 0),
        budgetUtilization: 85, // Simulation
        costTrends: data
      };
    
    default:
      return data;
  }
}

async function generateReportFile(report, data, format) {
  const fileName = `report-${report.id}-${Date.now()}.${format}`;
  const filePath = path.join(__dirname, '../../uploads/reports', fileName);

  // Créer le dossier s'il n'existe pas
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  switch (format) {
    case 'excel':
      await generateExcelFile(report, data, filePath);
      break;
    case 'pdf':
      await generatePDFFile(report, data, filePath);
      break;
    case 'csv':
      await generateCSVFile(report, data, filePath);
      break;
  }

  return `/uploads/reports/${fileName}`;
}

async function generateExcelFile(report, data, filePath) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Rapport');

  // En-têtes
  worksheet.addRow(['Rapport:', report.name]);
  worksheet.addRow(['Type:', report.type]);
  worksheet.addRow(['Période:', `${report.dateRange.start} - ${report.dateRange.end}`]);
  worksheet.addRow([]);

  // Données
  if (Array.isArray(data) && data.length > 0) {
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);
    
    data.forEach(row => {
      worksheet.addRow(headers.map(header => row[header]));
    });
  }

  await workbook.xlsx.writeFile(filePath);
}

async function generatePDFFile(report, data, filePath) {
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // En-tête
  doc.fontSize(20).text(report.name, 50, 50);
  doc.fontSize(12).text(`Type: ${report.type}`, 50, 80);
  doc.text(`Période: ${report.dateRange.start} - ${report.dateRange.end}`, 50, 100);

  // Contenu (simplifié)
  doc.text('Données du rapport:', 50, 140);
  doc.text(JSON.stringify(data, null, 2), 50, 160);

  doc.end();

  return new Promise((resolve) => {
    stream.on('finish', resolve);
  });
}

async function generateCSVFile(report, data, filePath) {
  let csvContent = `Rapport,${report.name}\n`;
  csvContent += `Type,${report.type}\n`;
  csvContent += `Période,${report.dateRange.start} - ${report.dateRange.end}\n\n`;

  if (Array.isArray(data) && data.length > 0) {
    const headers = Object.keys(data[0]);
    csvContent += headers.join(',') + '\n';
    
    data.forEach(row => {
      csvContent += headers.map(header => row[header]).join(',') + '\n';
    });
  }

  fs.writeFileSync(filePath, csvContent);
}

async function compareCampaigns(campaignIds, metrics, userId) {
  const campaigns = await Promise.all(
    campaignIds.map(async (id) => {
      const campaign = await prisma.campaign.findFirst({
        where: { id, userId },
        include: {
          analytics: {
            where: {
              date: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            }
          }
        }
      });

      const totals = campaign.analytics.reduce(
        (acc, curr) => ({
          impressions: acc.impressions + curr.impressions,
          clicks: acc.clicks + curr.clicks,
          conversions: acc.conversions + curr.conversions,
          cost: acc.cost + curr.cost
        }),
        { impressions: 0, clicks: 0, conversions: 0, cost: 0 }
      );

      return {
        campaign: { id: campaign.id, name: campaign.name },
        metrics: totals
      };
    })
  );

  return { type: 'campaigns', data: campaigns };
}

async function comparePeriods(periods, metrics, userId) {
  const periodData = await Promise.all(
    periods.map(async (period) => {
      const analytics = await prisma.analytics.aggregate({
        where: {
          campaign: { userId },
          date: {
            gte: new Date(period.start),
            lte: new Date(period.end)
          }
        },
        _sum: {
          impressions: true,
          clicks: true,
          conversions: true,
          cost: true
        }
      });

      return {
        period: { start: period.start, end: period.end },
        metrics: analytics._sum
      };
    })
  );

  return { type: 'periods', data: periodData };
}

function calculateNextRun(frequency) {
  const now = new Date();
  
  switch (frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

module.exports = router; 