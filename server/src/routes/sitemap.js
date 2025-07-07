const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/sitemap/urls:
 *   get:
 *     summary: Récupère les URLs dynamiques pour le sitemap
 *     tags: [Sitemap]
 *     responses:
 *       200:
 *         description: Liste des URLs dynamiques
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                         description: URL de la page
 *                       lastModified:
 *                         type: string
 *                         format: date-time
 *                         description: Date de dernière modification
 *                       changeFrequency:
 *                         type: string
 *                         enum: [always, hourly, daily, weekly, monthly, yearly, never]
 *                         description: Fréquence de modification
 *                       priority:
 *                         type: number
 *                         minimum: 0
 *                         maximum: 1
 *                         description: Priorité de la page
 *                 total:
 *                   type: integer
 *                   description: Nombre total d'URLs
 */
router.get('/urls', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://ads-saas.com';
    const dynamicUrls = [];

    // Vous pouvez ajouter ici des URLs dynamiques basées sur votre base de données
    // Par exemple, des campagnes publiques, des pages de catégories, etc.
    
    // Exemple : URLs des campagnes publiques (si vous en avez)
    // const publicCampaigns = await prisma.campaign.findMany({
    //   where: { isPublic: true, status: 'active' },
    //   select: { id: true, updatedAt: true, name: true }
    // });
    
    // publicCampaigns.forEach(campaign => {
    //   dynamicUrls.push({
    //     url: `${baseUrl}/campaigns/${campaign.id}`,
    //     lastModified: campaign.updatedAt.toISOString(),
    //     changeFrequency: 'weekly',
    //     priority: 0.6
    //   });
    // });

    // Exemple : URLs des pages de blog (si vous en avez)
    // const blogPosts = await prisma.blogPost.findMany({
    //   where: { published: true },
    //   select: { slug: true, updatedAt: true }
    // });
    
    // blogPosts.forEach(post => {
    //   dynamicUrls.push({
    //     url: `${baseUrl}/blog/${post.slug}`,
    //     lastModified: post.updatedAt.toISOString(),
    //     changeFrequency: 'monthly',
    //     priority: 0.7
    //   });
    // });

    // Pour l'instant, on retourne des URLs d'exemple
    const exampleUrls = [
      {
        url: `${baseUrl}/features`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.8
      },
      {
        url: `${baseUrl}/pricing`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.9
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.6
      }
    ];

    dynamicUrls.push(...exampleUrls);

    res.json({
      urls: dynamicUrls,
      total: dynamicUrls.length,
      lastGenerated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la génération du sitemap dynamique:', error);
    res.status(500).json({
      error: 'Erreur lors de la génération du sitemap dynamique',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/sitemap/generate:
 *   post:
 *     summary: Régénère le sitemap (pour les administrateurs)
 *     tags: [Sitemap]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sitemap régénéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 totalUrls:
 *                   type: integer
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - droits administrateur requis
 */
router.post('/generate', async (req, res) => {
  try {
    // Vérifier que l'utilisateur est authentifié et est admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Droits administrateur requis pour régénérer le sitemap'
      });
    }

    // Ici vous pourriez déclencher une régénération du sitemap
    // Par exemple, mettre à jour un cache, notifier Next.js, etc.
    
    const timestamp = new Date().toISOString();
    
    // Simuler la régénération
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({
      message: 'Sitemap régénéré avec succès',
      timestamp,
      totalUrls: 25, // Nombre d'URLs générées
      status: 'success'
    });

  } catch (error) {
    console.error('Erreur lors de la régénération du sitemap:', error);
    res.status(500).json({
      error: 'Erreur lors de la régénération du sitemap',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/sitemap/status:
 *   get:
 *     summary: Récupère le statut du sitemap
 *     tags: [Sitemap]
 *     responses:
 *       200:
 *         description: Statut du sitemap
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lastGenerated:
 *                   type: string
 *                   format: date-time
 *                 totalUrls:
 *                   type: integer
 *                 staticUrls:
 *                   type: integer
 *                 dynamicUrls:
 *                   type: integer
 *                 status:
 *                   type: string
 *                   enum: [active, generating, error]
 */
router.get('/status', async (req, res) => {
  try {
    // Récupérer le statut du sitemap
    const status = {
      lastGenerated: new Date().toISOString(),
      totalUrls: 25,
      staticUrls: 18,
      dynamicUrls: 7,
      status: 'active',
      nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // +24h
    };

    res.json(status);

  } catch (error) {
    console.error('Erreur lors de la récupération du statut du sitemap:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du statut',
      message: error.message
    });
  }
});

module.exports = router; 