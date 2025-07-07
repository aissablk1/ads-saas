const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();

// Configuration multer pour l'upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads', file.fieldname);
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Générer un nom unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Filtres pour les types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    videos: ['video/mp4', 'video/webm', 'video/quicktime'],
    documents: ['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  };

  const fieldname = file.fieldname;
  const allowedMimeTypes = allowedTypes[fieldname] || [];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé pour ${fieldname}: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 10 // Max 10 fichiers
  }
});

// Middleware pour les uploads multiples
const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 },
  { name: 'documents', maxCount: 5 }
]);

// POST /api/files/upload - Upload de fichiers
router.post('/upload', uploadFields, async (req, res, next) => {
  try {
    const { category = 'general', campaignId } = req.body;
    const uploadedFiles = [];

    // Traiter chaque type de fichier
    for (const [fieldname, files] of Object.entries(req.files || {})) {
      for (const file of files) {
        try {
          let processedFile = { ...file };

          // Traitement spécifique par type
          if (fieldname === 'images') {
            processedFile = await processImage(file);
          } else if (fieldname === 'videos') {
            processedFile = await processVideo(file);
          }

          // Enregistrer en base de données
          const fileRecord = await prisma.file.create({
            data: {
              originalName: file.originalname,
              filename: processedFile.filename,
              mimetype: file.mimetype,
              size: file.size,
              path: processedFile.path,
              url: `/uploads/${fieldname}/${processedFile.filename}`,
              type: fieldname.slice(0, -1), // 'images' -> 'image'
              category,
              userId: req.user.id,
              campaignId: campaignId || null,
              metadata: processedFile.metadata || {}
            }
          });

          uploadedFiles.push(fileRecord);

        } catch (processError) {
          console.error('Erreur traitement fichier:', processError);
          // Supprimer le fichier en cas d'erreur
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
    }

    // Enregistrer l'activité
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'FILES_UPLOADED',
        title: 'Fichiers uploadés',
        description: `${uploadedFiles.length} fichier(s) uploadé(s)`,
        metadata: { 
          fileCount: uploadedFiles.length,
          category,
          campaignId
        }
      }
    });

    res.status(201).json({
      message: `${uploadedFiles.length} fichier(s) uploadé(s) avec succès`,
      files: uploadedFiles
    });

  } catch (error) {
    // Nettoyer les fichiers en cas d'erreur
    if (req.files) {
      for (const files of Object.values(req.files)) {
        for (const file of files) {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
    }
    next(error);
  }
});

// GET /api/files - Liste des fichiers
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      category, 
      campaignId,
      search 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId: req.user.id,
      ...(type && { type }),
      ...(category && { category }),
      ...(campaignId && { campaignId }),
      ...(search && {
        OR: [
          { originalName: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          campaign: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.file.count({ where })
    ]);

    // Calculer les statistiques
    const stats = await prisma.file.groupBy({
      by: ['type'],
      where: { userId: req.user.id },
      _count: { type: true },
      _sum: { size: true }
    });

    res.json({
      data: files,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat.type] = {
          count: stat._count.type,
          totalSize: stat._sum.size
        };
        return acc;
      }, {})
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/files/:id - Détails d'un fichier
router.get('/:id', async (req, res, next) => {
  try {
    const file = await prisma.file.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!file) {
      return res.status(404).json({
        error: 'Fichier non trouvé'
      });
    }

    res.json(file);
  } catch (error) {
    next(error);
  }
});

// PUT /api/files/:id - Mettre à jour les métadonnées d'un fichier
router.put('/:id', async (req, res, next) => {
  try {
    const { category, altText, description } = req.body;

    const file = await prisma.file.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!file) {
      return res.status(404).json({
        error: 'Fichier non trouvé'
      });
    }

    const updatedFile = await prisma.file.update({
      where: { id: req.params.id },
      data: {
        category,
        metadata: {
          ...file.metadata,
          altText,
          description
        }
      }
    });

    res.json({
      message: 'Fichier mis à jour',
      file: updatedFile
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/files/:id - Supprimer un fichier
router.delete('/:id', async (req, res, next) => {
  try {
    const file = await prisma.file.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!file) {
      return res.status(404).json({
        error: 'Fichier non trouvé'
      });
    }

    // Supprimer le fichier physique
    const filePath = path.join(__dirname, '../../', file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Supprimer les miniatures si elles existent
    if (file.metadata?.thumbnails) {
      for (const thumbnail of file.metadata.thumbnails) {
        const thumbPath = path.join(__dirname, '../../', thumbnail.path);
        if (fs.existsSync(thumbPath)) {
          fs.unlinkSync(thumbPath);
        }
      }
    }

    // Supprimer de la base de données
    await prisma.file.delete({
      where: { id: req.params.id }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'FILE_DELETED',
        title: 'Fichier supprimé',
        description: `Fichier supprimé: ${file.originalName}`,
        metadata: { fileId: file.id }
      }
    });

    res.json({
      message: 'Fichier supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/files/:id/optimize - Optimiser une image
router.post('/:id/optimize', async (req, res, next) => {
  try {
    const { quality = 80, width, height, format } = req.body;

    const file = await prisma.file.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
        type: 'image'
      }
    });

    if (!file) {
      return res.status(404).json({
        error: 'Image non trouvée'
      });
    }

    const originalPath = path.join(__dirname, '../../', file.path);
    const optimizedFileName = `optimized-${Date.now()}-${file.filename}`;
    const optimizedPath = path.join(path.dirname(originalPath), optimizedFileName);

    let processor = sharp(originalPath);

    // Redimensionner si nécessaire
    if (width || height) {
      processor = processor.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convertir le format si nécessaire
    if (format && format !== path.extname(file.filename).slice(1)) {
      if (format === 'jpeg') {
        processor = processor.jpeg({ quality });
      } else if (format === 'png') {
        processor = processor.png({ quality });
      } else if (format === 'webp') {
        processor = processor.webp({ quality });
      }
    }

    // Sauvegarder l'image optimisée
    await processor.toFile(optimizedPath);

    // Obtenir les infos du fichier optimisé
    const stats = fs.statSync(optimizedPath);
    const optimizedSize = stats.size;
    
    // Créer un nouvel enregistrement pour l'image optimisée
    const optimizedFile = await prisma.file.create({
      data: {
        originalName: `optimized-${file.originalName}`,
        filename: optimizedFileName,
        mimetype: format ? `image/${format}` : file.mimetype,
        size: optimizedSize,
        path: optimizedPath.replace(path.join(__dirname, '../../'), ''),
        url: `/uploads/images/${optimizedFileName}`,
        type: 'image',
        category: file.category,
        userId: req.user.id,
        campaignId: file.campaignId,
        metadata: {
          ...file.metadata,
          optimized: true,
          originalFileId: file.id,
          compressionRatio: ((file.size - optimizedSize) / file.size * 100).toFixed(2)
        }
      }
    });

    res.json({
      message: 'Image optimisée avec succès',
      original: file,
      optimized: optimizedFile,
      savings: {
        sizeReduction: file.size - optimizedSize,
        percentageReduction: ((file.size - optimizedSize) / file.size * 100).toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/files/stats - Statistiques des fichiers
router.get('/usage/stats', async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    const startDate = new Date();
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

    const [totalFiles, totalSize, recentUploads, typeDistribution] = await Promise.all([
      prisma.file.count({
        where: { userId: req.user.id }
      }),
      prisma.file.aggregate({
        where: { userId: req.user.id },
        _sum: { size: true }
      }),
      prisma.file.count({
        where: {
          userId: req.user.id,
          createdAt: { gte: startDate }
        }
      }),
      prisma.file.groupBy({
        by: ['type'],
        where: { userId: req.user.id },
        _count: { type: true },
        _sum: { size: true }
      })
    ]);

    // Calculer l'utilisation par rapport aux limites
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    const storageLimits = {
      FREE: 1 * 1024 * 1024 * 1024, // 1GB
      STARTER: 10 * 1024 * 1024 * 1024, // 10GB
      PRO: 100 * 1024 * 1024 * 1024, // 100GB
      ENTERPRISE: Infinity
    };

    const plan = subscription?.plan || 'FREE';
    const storageLimit = storageLimits[plan];
    const storageUsed = totalSize._sum.size || 0;
    const storageUsagePercent = storageLimit === Infinity ? 0 : (storageUsed / storageLimit) * 100;

    res.json({
      summary: {
        totalFiles,
        totalSize: storageUsed,
        recentUploads,
        storageLimit,
        storageUsagePercent: parseFloat(storageUsagePercent.toFixed(2))
      },
      distribution: typeDistribution.map(item => ({
        type: item.type,
        count: item._count.type,
        size: item._sum.size
      })),
      period
    });
  } catch (error) {
    next(error);
  }
});

// Fonctions utilitaires

async function processImage(file) {
  try {
    const metadata = await sharp(file.path).metadata();
    const thumbnails = [];

    // Générer différentes tailles de miniatures
    const sizes = [
      { name: 'thumb', width: 150, height: 150 },
      { name: 'small', width: 400, height: 300 },
      { name: 'medium', width: 800, height: 600 }
    ];

    for (const size of sizes) {
      const thumbFilename = `${size.name}-${file.filename}`;
      const thumbPath = path.join(path.dirname(file.path), thumbFilename);

      await sharp(file.path)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(thumbPath);

      thumbnails.push({
        name: size.name,
        width: size.width,
        height: size.height,
        path: thumbPath.replace(path.join(__dirname, '../../'), ''),
        url: `/uploads/images/${thumbFilename}`
      });
    }

    return {
      ...file,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        colorSpace: metadata.space,
        hasAlpha: metadata.hasAlpha,
        thumbnails
      }
    };
  } catch (error) {
    console.error('Erreur traitement image:', error);
    return file;
  }
}

async function processVideo(file) {
  try {
    // Pour les vidéos, on peut ajouter des métadonnées basiques
    // Dans un vrai projet, on utiliserait ffmpeg pour extraire des métadonnées
    const stats = fs.statSync(file.path);
    
    return {
      ...file,
      metadata: {
        duration: null, // À implémenter avec ffmpeg
        resolution: null, // À implémenter avec ffmpeg
        bitrate: null, // À implémenter avec ffmpeg
        format: path.extname(file.originalname).slice(1),
        size: stats.size
      }
    };
  } catch (error) {
    console.error('Erreur traitement vidéo:', error);
    return file;
  }
}

module.exports = router; 