const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { generateTokens, authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un compte utilisateur
 *     description: Inscription d'un nouvel utilisateur avec validation des données
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de l'utilisateur
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Mot de passe (minimum 8 caractères)
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 description: Prénom de l'utilisateur
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 description: Nom de l'utilisateur
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/auth/register
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Un compte avec cet email existe déjà'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        // emailVerified sera ajouté au schéma plus tard
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    // Créer un abonnement gratuit par défaut
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'FREE',
        status: 'ACTIVE'
      }
    });

    // Enregistrer l'activité
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'LOGIN',
        title: 'Inscription réussie',
        description: 'Nouveau compte créé'
      }
    });

    // Générer les tokens
    const tokens = generateTokens(user.id);

    res.status(201).json({
      message: 'Compte créé avec succès',
      user,
      ...tokens
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Se connecter
 *     description: Authentification d'un utilisateur avec support 2FA
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de l'utilisateur
 *               password:
 *                 type: string
 *                 description: Mot de passe
 *               twoFactorCode:
 *                 type: string
 *                 description: Code 2FA (si activé)
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 requires2FA:
 *                   type: boolean
 *                   description: Indique si un code 2FA est requis
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Email ou mot de passe incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Email non vérifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/auth/login
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { email, password, twoFactorCode } = req.body;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le statut du compte
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        error: 'Compte suspendu ou désactivé'
      });
    }

    // Vérifier si l'email est vérifié (seulement en production)
    if (process.env.NODE_ENV === 'production' && !user.emailVerified) {
      return res.status(403).json({
        error: 'Veuillez vérifier votre email avant de vous connecter'
      });
    }

    // Si 2FA activé, vérifier le code
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          message: 'Code 2FA requis',
          requires2FA: true
        });
      }

      const isValid2FA = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2
      });

      if (!isValid2FA) {
        return res.status(401).json({
          error: 'Code 2FA invalide'
        });
      }
    }

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Enregistrer l'activité
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'LOGIN',
        title: 'Connexion réussie',
        description: `Connexion depuis ${req.ip}`
      }
    });

    // Générer les tokens
    const tokens = generateTokens(user.id);

    // Réponse sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Connexion réussie',
      user: userWithoutPassword,
      ...tokens
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    // En JWT, la déconnexion côté serveur consiste principalement à 
    // enregistrer l'activité et demander au client de supprimer le token
    
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      // Optionnel: Vous pourriez maintenir une liste noire des tokens
      // pour une sécurité renforcée
    }

    res.json({
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Token de rafraîchissement requis'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Token invalide'
      });
    }

    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        error: 'Utilisateur non valide'
      });
    }

    // Générer de nouveaux tokens
    const tokens = generateTokens(user.id);

    res.json({
      message: 'Token rafraîchi avec succès',
      user,
      ...tokens
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token invalide ou expiré'
      });
    }
    next(error);
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token de vérification requis'
      });
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: 'EMAIL_VERIFICATION',
        expiresAt: { gt: new Date() }
      },
      include: {
        user: true
      }
    });

    if (!verificationToken) {
      return res.status(400).json({
        error: 'Token invalide ou expiré'
      });
    }

    // Marquer l'email comme vérifié
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true }
    });

    // Supprimer le token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    });

    // Enregistrer l'activité
    await prisma.activity.create({
      data: {
        userId: verificationToken.userId,
        type: 'EMAIL_VERIFIED',
        title: 'Email vérifié',
        description: 'Adresse email vérifiée avec succès'
      }
    });

    res.json({
      message: 'Email vérifié avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email requis'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Ne pas révéler si l'email existe ou non
      return res.json({
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation'
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Supprimer les anciens tokens
    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: 'PASSWORD_RESET'
      }
    });

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1h
      }
    });

    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'PASSWORD_RESET_REQUESTED',
        title: 'Réinitialisation demandée',
        description: 'Demande de réinitialisation de mot de passe'
      }
    });

    res.json({
      message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        error: 'Token et mot de passe requis'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: 'PASSWORD_RESET',
        expiresAt: { gt: new Date() }
      }
    });

    if (!verificationToken) {
      return res.status(400).json({
        error: 'Token invalide ou expiré'
      });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { password: hashedPassword }
    });

    // Supprimer le token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    });

    await prisma.activity.create({
      data: {
        userId: verificationToken.userId,
        type: 'PASSWORD_RESET_COMPLETED',
        title: 'Mot de passe réinitialisé',
        description: 'Mot de passe réinitialisé avec succès'
      }
    });

    res.json({
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/2fa/setup
router.post('/2fa/setup', authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        error: '2FA déjà activé'
      });
    }

    // Générer un secret 2FA
    const secret = speakeasy.generateSecret({
      name: `ADS Platform (${user.email})`,
      issuer: 'ADS Platform',
      length: 20
    });

    // Stocker temporairement le secret (pas encore activé)
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret.base32 }
    });

    // Générer le QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      message: 'Configuration 2FA initialisée',
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: generateBackupCodes()
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/2fa/verify
router.post('/2fa/verify', authenticateToken, async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Code 2FA requis'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        error: 'Configuration 2FA non initialisée'
      });
    }

    // Vérifier le code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!isValid) {
      return res.status(400).json({
        error: 'Code 2FA invalide'
      });
    }

    // Activer 2FA
    const backupCodes = generateBackupCodes();
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFactorEnabled: true,
        twoFactorBackupCodes: backupCodes.map(code => bcrypt.hashSync(code, 10))
      }
    });

    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'TWO_FA_ENABLED',
        title: '2FA activé',
        description: 'Authentification à deux facteurs activée'
      }
    });

    res.json({
      message: '2FA activé avec succès',
      backupCodes
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/2fa/disable
router.post('/2fa/disable', authenticateToken, async (req, res, next) => {
  try {
    const { password, token } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        error: '2FA non activé'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Mot de passe incorrect'
      });
    }

    // Vérifier le code 2FA ou code de sauvegarde
    let isValidToken = false;

    if (token) {
      // Vérifier le code TOTP
      isValidToken = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2
      });

      // Si échec, vérifier les codes de sauvegarde
      if (!isValidToken && user.twoFactorBackupCodes) {
        for (const hashedCode of user.twoFactorBackupCodes) {
          if (bcrypt.compareSync(token, hashedCode)) {
            isValidToken = true;
            break;
          }
        }
      }
    }

    if (!isValidToken) {
      return res.status(401).json({
        error: 'Code 2FA invalide'
      });
    }

    // Désactiver 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null
      }
    });

    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'TWO_FA_DISABLED',
        title: '2FA désactivé',
        description: 'Authentification à deux facteurs désactivée'
      }
    });

    res.json({
      message: '2FA désactivé avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/2fa/backup-codes/regenerate
router.post('/2fa/backup-codes/regenerate', authenticateToken, async (req, res, next) => {
  try {
    const { password } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        error: '2FA non activé'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Mot de passe incorrect'
      });
    }

    // Générer de nouveaux codes
    const backupCodes = generateBackupCodes();
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFactorBackupCodes: backupCodes.map(code => bcrypt.hashSync(code, 10))
      }
    });

    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'TWO_FA_BACKUP_CODES_REGENERATED',
        title: 'Codes de sauvegarde régénérés',
        description: 'Nouveaux codes de sauvegarde 2FA générés'
      }
    });

    res.json({
      message: 'Codes de sauvegarde régénérés',
      backupCodes
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/2fa/status
router.get('/2fa/status', authenticateToken, async (req, res, next) => {
  try {
    // Vérifier que req.user existe
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: 'Utilisateur non authentifié'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({
      enabled: user.twoFactorEnabled || false,
      hasBackupCodes: user.twoFactorBackupCodes && user.twoFactorBackupCodes.length > 0
    });
  } catch (error) {
    next(error);
  }
});

// Fonctions utilitaires

function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    // Générer un code de 8 caractères
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

module.exports = router; 