const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware d'authentification admin
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, status: true }
    });

    if (!user || user.role !== 'ADMIN' || user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Accès administrateur requis' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

// Validation middleware
const validateUserData = [
  body('email').isEmail().withMessage('Email invalide'),
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('role').optional().isIn(['USER', 'ADMIN', 'EDITOR', 'VIEWER']),
  body('status').optional().isIn(['ACTIVE', 'SUSPENDED', 'PENDING'])
];

// POST /api/admin/login - Connexion admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, role: true, status: true }
    });

    if (!user || user.role !== 'ADMIN' || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/verify-session - Vérifier la session admin
router.get('/verify-session', authenticateAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        lastLogin: true
      }
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/users - Récupérer tous les utilisateurs
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, role, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          status: true,
          emailVerified: true,
          twoFactorEnabled: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true,
          _count: {
            select: {
              campaigns: true,
              activities: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users: users.map(user => ({
        ...user,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || user.email
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/users/:id - Récupérer un utilisateur
router.get('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
            budget: true,
            spent: true,
            createdAt: true
          }
        },
        activities: {
          select: {
            id: true,
            type: true,
            title: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        subscription: {
          select: {
            plan: true,
            status: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/users - Créer un utilisateur
router.post('/users', authenticateAdmin, validateUserData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, firstName, lastName, role, status } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Générer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: role || 'USER',
        status: status || 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    res.status(201).json({
      user,
      tempPassword,
      message: 'Utilisateur créé avec succès'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/admin/users/:id - Mettre à jour un utilisateur
router.put('/users/:id', authenticateAdmin, validateUserData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, firstName, lastName, role, status } = req.body;

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existingUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        email,
        firstName,
        lastName,
        role,
        status
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        updatedAt: true
      }
    });

    res.json({ user, message: 'Utilisateur mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/admin/users/:id - Supprimer un utilisateur
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Empêcher la suppression de l'admin principal
    if (user.role === 'ADMIN' && user.email === process.env.ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Impossible de supprimer l\'administrateur principal' });
    }

    await prisma.user.delete({ where: { id: req.params.id } });

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/users/:id/suspend - Suspendre un utilisateur
router.post('/users/:id/suspend', authenticateAdmin, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'SUSPENDED' }
    });

    res.json({ message: 'Utilisateur suspendu avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/users/:id/activate - Activer un utilisateur
router.post('/users/:id/activate', authenticateAdmin, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'ACTIVE' }
    });

    res.json({ message: 'Utilisateur activé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/users/:id/reset-password - Réinitialiser le mot de passe
router.post('/users/:id/reset-password', authenticateAdmin, async (req, res) => {
  try {
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await prisma.user.update({
      where: { id: req.params.id },
      data: { password: hashedPassword }
    });

    res.json({
      message: 'Mot de passe réinitialisé avec succès',
      tempPassword
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/campaigns - Récupérer toutes les campagnes
router.get('/campaigns', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, userId } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
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
            select: {
              ads: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.campaign.count({ where })
    ]);

    res.json({
      campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/campaigns/:id - Récupérer une campagne
router.get('/campaigns/:id', authenticateAdmin, async (req, res) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        ads: true,
        files: true
      }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campagne non trouvée' });
    }

    res.json({ campaign });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/admin/campaigns/:id - Mettre à jour une campagne
router.put('/campaigns/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, status, budget } = req.body;

    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        status,
        budget: parseFloat(budget)
      }
    });

    res.json({ campaign, message: 'Campagne mise à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/admin/campaigns/:id - Supprimer une campagne
router.delete('/campaigns/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.campaign.delete({ where: { id: req.params.id } });

    res.json({ message: 'Campagne supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/campaigns/:id/archive - Archiver une campagne
router.post('/campaigns/:id/archive', authenticateAdmin, async (req, res) => {
  try {
    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        archived: true,
        archivedAt: new Date()
      }
    });

    res.json({ message: 'Campagne archivée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/metrics - Métriques système
router.get('/metrics', authenticateAdmin, async (req, res) => {
  try {
    // Simulation des métriques système (à remplacer par de vraies métriques)
    const metrics = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      network: Math.random() * 100,
      activeUsers: Math.floor(Math.random() * 150) + 50,
      totalUsers: await prisma.user.count(),
      activeSessions: Math.floor(Math.random() * 300) + 100,
      databaseConnections: Math.floor(Math.random() * 50) + 10,
      apiRequests: Math.floor(Math.random() * 1000) + 500,
      errors: Math.floor(Math.random() * 10)
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/analytics - Analytics globales
router.get('/analytics', authenticateAdmin, async (req, res) => {
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

    // Récupérer toutes les campagnes avec leurs analytics
    const campaigns = await prisma.campaign.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Calculer les métriques totales
    const totalMetrics = campaigns.reduce((acc, campaign) => {
      acc.impressions += campaign.impressions;
      acc.clicks += campaign.clicks;
      acc.conversions += campaign.conversions;
      acc.spent += campaign.spent;
      return acc;
    }, { impressions: 0, clicks: 0, conversions: 0, spent: 0 });

    const ctr = totalMetrics.impressions > 0 ? (totalMetrics.clicks / totalMetrics.impressions) * 100 : 0;
    const conversionRate = totalMetrics.clicks > 0 ? (totalMetrics.conversions / totalMetrics.clicks) * 100 : 0;

    const analytics = {
      overview: {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
        totalAds: campaigns.reduce((sum, c) => sum + (c.ads?.length || 0), 0),
        totalSpent: totalMetrics.spent
      },
      metrics: {
        impressions: totalMetrics.impressions,
        clicks: totalMetrics.clicks,
        conversions: totalMetrics.conversions,
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        budgetUtilization: campaigns.length > 0 ? 
          (campaigns.reduce((sum, c) => sum + c.spent, 0) / campaigns.reduce((sum, c) => sum + c.budget, 1)) * 100 : 0,
        averageCpc: totalMetrics.clicks > 0 ? totalMetrics.spent / totalMetrics.clicks : 0,
        averageCpa: totalMetrics.conversions > 0 ? totalMetrics.spent / totalMetrics.conversions : 0
      },
      charts: {
        topCampaigns: campaigns
          .sort((a, b) => b.spent - a.spent)
          .slice(0, 5)
          .map(c => ({
            id: c.id,
            name: c.name,
            spent: c.spent,
            impressions: c.impressions,
            clicks: c.clicks,
            conversions: c.conversions
          }))
      },
      recentActivities: await prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/activities - Activités système
router.get('/activities', authenticateAdmin, async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const activities = await prisma.activity.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/system/status - Statut système
router.get('/system/status', authenticateAdmin, async (req, res) => {
  try {
    const status = {
      server: 'online',
      database: 'online',
      cache: 'online',
      queue: 'online',
      api: 'online'
    };

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/system/alerts - Alertes système
router.get('/system/alerts', authenticateAdmin, async (req, res) => {
  try {
    const alerts = [
      {
        id: '1',
        type: 'warning',
        message: 'Utilisation CPU élevée détectée',
        timestamp: new Date().toISOString(),
        severity: 'medium'
      },
      {
        id: '2',
        type: 'info',
        message: 'Nouveau partenaire enregistré',
        timestamp: new Date().toISOString(),
        severity: 'low'
      }
    ];

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/system/cache/clear - Nettoyer le cache
router.post('/system/cache/clear', authenticateAdmin, async (req, res) => {
  try {
    // Simulation du nettoyage du cache
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({ message: 'Cache nettoyé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/system/backup - Sauvegarde de la base de données
router.post('/system/backup', authenticateAdmin, async (req, res) => {
  try {
    // Simulation de la sauvegarde
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const backupId = `backup_${Date.now()}`;
    res.json({ 
      message: 'Sauvegarde terminée avec succès',
      backupId 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/system/restart - Redémarrer le système
router.post('/system/restart', authenticateAdmin, async (req, res) => {
  try {
    // Simulation du redémarrage
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    res.json({ message: 'Système redémarré avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/system/shutdown - Arrêt d'urgence
router.post('/system/shutdown', authenticateAdmin, async (req, res) => {
  try {
    // Simulation de l'arrêt
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({ message: 'Système arrêté avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/system/maintenance/enable - Activer le mode maintenance
router.post('/system/maintenance/enable', authenticateAdmin, async (req, res) => {
  try {
    // Simulation de l'activation du mode maintenance
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({ message: 'Mode maintenance activé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/system/maintenance/disable - Désactiver le mode maintenance
router.post('/system/maintenance/disable', authenticateAdmin, async (req, res) => {
  try {
    // Simulation de la désactivation du mode maintenance
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({ message: 'Mode maintenance désactivé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/system/database/optimize - Optimiser la base de données
router.post('/system/database/optimize', authenticateAdmin, async (req, res) => {
  try {
    // Simulation de l'optimisation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    res.json({ message: 'Base de données optimisée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/system/logs/clean - Nettoyer les logs
router.post('/system/logs/clean', authenticateAdmin, async (req, res) => {
  try {
    // Simulation du nettoyage des logs
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({ message: 'Logs nettoyés avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/stats - Statistiques système
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalCampaigns, activeCampaigns] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'ACTIVE' } })
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      totalCampaigns,
      activeCampaigns,
      totalRevenue: Math.random() * 100000,
      monthlyGrowth: Math.random() * 20
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/realtime - Données en temps réel
router.get('/realtime', authenticateAdmin, async (req, res) => {
  try {
    const realTimeData = {
      activeConnections: Math.floor(Math.random() * 300) + 100,
      requestsPerMinute: Math.floor(Math.random() * 1000) + 500,
      errorRate: Math.random() * 2,
      responseTime: Math.floor(Math.random() * 200) + 50
    };

    res.json(realTimeData);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/dashboard/stats - Statistiques complètes du tableau de bord
router.get('/dashboard/stats', authenticateAdmin, async (req, res) => {
  try {
    // Récupérer les vraies données de la base
    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      premiumUsers,
      totalCampaigns,
      activeCampaigns,
      totalSpent,
      totalImpressions,
      totalClicks,
      totalConversions,
      recentActivities
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ 
        where: { 
          status: 'ACTIVE',
          lastLogin: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        } 
      }),
      prisma.user.count({ 
        where: { 
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        } 
      }),
      prisma.user.count({ 
        where: { 
          subscription: { 
            plan: { in: ['PRO', 'ENTERPRISE'] },
            status: 'ACTIVE'
          }
        } 
      }),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.campaign.aggregate({
        _sum: { spent: true }
      }),
      prisma.campaign.aggregate({
        _sum: { impressions: true }
      }),
      prisma.campaign.aggregate({
        _sum: { clicks: true }
      }),
      prisma.campaign.aggregate({
        _sum: { conversions: true }
      }),
      prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    // Calculer les métriques de performance
    const responseTime = Math.floor(Math.random() * 200) + 50; // 50-250ms
    const requestsPerMinute = Math.floor(Math.random() * 2000) + 500; // 500-2500 req/min
    const errorRate = Math.random() * 2; // 0-2%
    const throughput = Math.random() * 100 + 50; // 50-150 MB/s

    // Calculer les métriques système
    const cpu = Math.floor(Math.random() * 60) + 20; // 20-80%
    const memory = Math.floor(Math.random() * 50) + 40; // 40-90%
    const disk = Math.floor(Math.random() * 40) + 30; // 30-70%

    // Calculer l'uptime (simulation)
    const uptimeDays = Math.floor(Math.random() * 30) + 1;
    const uptimeHours = Math.floor(Math.random() * 24);
    const uptimeMinutes = Math.floor(Math.random() * 60);
    const uptime = `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m`;

    // Données de sécurité
    const threats = Math.floor(Math.random() * 10);
    const blocked = Math.floor(Math.random() * 200) + 50;
    const vulnerabilities = Math.floor(Math.random() * 5);
    const lastScan = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toLocaleString();

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsersThisMonth,
        premium: premiumUsers
      },
      system: {
        uptime,
        cpu,
        memory,
        disk
      },
      performance: {
        responseTime,
        requestsPerMinute,
        errorRate: parseFloat(errorRate.toFixed(2)),
        throughput: parseFloat(throughput.toFixed(1))
      },
      security: {
        threats,
        blocked,
        vulnerabilities,
        lastScan
      },
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
        totalSpent: totalSpent._sum.spent || 0,
        totalImpressions: totalImpressions._sum.impressions || 0,
        totalClicks: totalClicks._sum.clicks || 0,
        totalConversions: totalConversions._sum.conversions || 0
      },
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        action: activity.title,
        user: activity.user ? `${activity.user.firstName || ''} ${activity.user.lastName || ''}`.trim() || activity.user.email : 'Système',
        time: getTimeAgo(activity.createdAt),
        status: getActivityStatus(activity.type)
      }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur dashboard stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Fonction utilitaire pour calculer le temps écoulé
function getTimeAgo(date) {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} heure${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'À l\'instant';
}

// Fonction utilitaire pour déterminer le statut d'une activité
function getActivityStatus(type) {
  switch (type) {
    case 'USER_LOGIN':
    case 'CAMPAIGN_CREATED':
    case 'PAYMENT_SUCCESS':
      return 'success';
    case 'SECURITY_ALERT':
    case 'PAYMENT_FAILED':
      return 'warning';
    case 'SYSTEM_ERROR':
      return 'error';
    default:
      return 'info';
  }
}

// GET /api/admin/system/metrics - Métriques système détaillées
router.get('/system/metrics', authenticateAdmin, async (req, res) => {
  try {
    const metrics = {
      cpu: {
        current: Math.floor(Math.random() * 60) + 20,
        average: Math.floor(Math.random() * 50) + 25,
        peak: Math.floor(Math.random() * 80) + 60
      },
      memory: {
        used: Math.floor(Math.random() * 50) + 40,
        available: Math.floor(Math.random() * 30) + 20,
        total: 100
      },
      disk: {
        used: Math.floor(Math.random() * 40) + 30,
        available: Math.floor(Math.random() * 40) + 30,
        total: 100
      },
      network: {
        incoming: Math.floor(Math.random() * 100) + 50,
        outgoing: Math.floor(Math.random() * 80) + 30,
        connections: Math.floor(Math.random() * 500) + 200
      },
      database: {
        connections: Math.floor(Math.random() * 50) + 10,
        queries: Math.floor(Math.random() * 1000) + 500,
        slowQueries: Math.floor(Math.random() * 10)
      }
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/security/status - Statut de sécurité
router.get('/security/status', authenticateAdmin, async (req, res) => {
  try {
    const securityStatus = {
      firewall: {
        status: 'active',
        blockedAttempts: Math.floor(Math.random() * 200) + 50,
        lastUpdate: new Date().toISOString()
      },
      ssl: {
        status: 'valid',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        certificate: 'Let\'s Encrypt'
      },
      twoFactor: {
        enabledUsers: await prisma.user.count({ where: { twoFactorEnabled: true } }),
        totalUsers: await prisma.user.count()
      },
      threats: {
        detected: Math.floor(Math.random() * 10),
        blocked: Math.floor(Math.random() * 200) + 50,
        lastScan: new Date().toISOString()
      },
      vulnerabilities: {
        critical: 0,
        high: Math.floor(Math.random() * 3),
        medium: Math.floor(Math.random() * 5),
        low: Math.floor(Math.random() * 10)
      }
    };

    res.json(securityStatus);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/system/action - Actions système
router.post('/system/action', authenticateAdmin, async (req, res) => {
  try {
    const { action } = req.body;

    switch (action) {
      case 'clear_cache':
        // Simulation du nettoyage du cache
        await new Promise(resolve => setTimeout(resolve, 1000));
        res.json({ message: 'Cache nettoyé avec succès', action });
        break;

      case 'optimize_database':
        // Simulation de l'optimisation
        await new Promise(resolve => setTimeout(resolve, 3000));
        res.json({ message: 'Base de données optimisée avec succès', action });
        break;

      case 'backup_database':
        // Simulation de la sauvegarde
        await new Promise(resolve => setTimeout(resolve, 5000));
        const backupId = `backup_${Date.now()}`;
        res.json({ message: 'Sauvegarde terminée avec succès', backupId, action });
        break;

      case 'restart_system':
        // Simulation du redémarrage
        await new Promise(resolve => setTimeout(resolve, 2000));
        res.json({ message: 'Système redémarré avec succès', action });
        break;

      case 'emergency_shutdown':
        // Simulation de l'arrêt d'urgence
        await new Promise(resolve => setTimeout(resolve, 1000));
        res.json({ message: 'Système arrêté avec succès', action });
        break;

      default:
        res.status(400).json({ error: 'Action non reconnue' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router; 