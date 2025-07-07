const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();
const prisma = new PrismaClient();

// Configuration email (à configurer selon votre fournisseur)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Rôles et permissions
const ROLES = {
  OWNER: {
    name: 'Propriétaire',
    permissions: ['*'], // Toutes les permissions
    level: 100
  },
  ADMIN: {
    name: 'Administrateur',
    permissions: [
      'campaigns.create', 'campaigns.edit', 'campaigns.delete', 'campaigns.view',
      'analytics.view', 'analytics.export',
      'team.invite', 'team.edit', 'team.remove',
      'billing.view'
    ],
    level: 80
  },
  EDITOR: {
    name: 'Éditeur',
    permissions: [
      'campaigns.create', 'campaigns.edit', 'campaigns.view',
      'analytics.view'
    ],
    level: 60
  },
  VIEWER: {
    name: 'Observateur',
    permissions: [
      'campaigns.view',
      'analytics.view'
    ],
    level: 40
  }
};

// Validation middleware
const validateInvitation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('role').isIn(Object.keys(ROLES)).withMessage('Rôle invalide'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message trop long')
];

const validateRoleUpdate = [
  body('role').isIn(Object.keys(ROLES)).withMessage('Rôle invalide')
];

// GET /api/users/me - Profil utilisateur actuel
router.get('/me', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    // Récupérer les statistiques utilisateur
    const [campaignCount, activities] = await Promise.all([
      prisma.campaign.count({
        where: { userId: req.user.id, archived: false }
      }),
      prisma.activity.count({
        where: { userId: req.user.id }
      })
    ]);

    res.json({
      user: {
        ...user,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || user.email
      },
      stats: {
        campaigns: campaignCount,
        activities
      }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/me - Mettre à jour le profil
router.put('/me', async (req, res, next) => {
  try {
    const { firstName, lastName, email, avatar } = req.body;

    // Construire l'objet de données à mettre à jour
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true
      }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'PROFILE_UPDATED',
        title: 'Profil mis à jour',
        description: 'Informations de profil modifiées'
      }
    });

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        ...user,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/teams - Équipes de l'utilisateur
router.get('/teams', async (req, res, next) => {
  try {
    // Équipes où l'utilisateur est propriétaire
    const ownedTeams = await prisma.team.findMany({
      where: { ownerId: req.user.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                lastLoginAt: true
              }
            }
          }
        },
        invitations: {
          where: { status: 'PENDING' }
        },
        _count: {
          select: {
            members: true,
            campaigns: true
          }
        }
      }
    });

    // Équipes où l'utilisateur est membre
    const memberTeams = await prisma.teamMember.findMany({
      where: { userId: req.user.id },
      include: {
        team: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    lastLoginAt: true
                  }
                }
              }
            },
            _count: {
              select: {
                members: true,
                campaigns: true
              }
            }
          }
        }
      }
    });

    const teams = [
      ...ownedTeams.map(team => ({
        ...team,
        role: 'OWNER',
        isOwner: true
      })),
      ...memberTeams.map(membership => ({
        ...membership.team,
        role: membership.role,
        isOwner: false,
        joinedAt: membership.createdAt
      }))
    ];

    res.json({
      data: teams,
      summary: {
        owned: ownedTeams.length,
        member: memberTeams.length,
        total: teams.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/teams - Créer une équipe
router.post('/teams', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        error: 'Le nom de l\'équipe doit contenir au moins 3 caractères'
      });
    }

    // Vérifier les limites d'abonnement
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    const teamCount = await prisma.team.count({
      where: { ownerId: req.user.id }
    });

    const limits = {
      FREE: 1,
      STARTER: 3,
      PRO: 10,
      ENTERPRISE: Infinity
    };

    if (teamCount >= limits[subscription?.plan || 'FREE']) {
      return res.status(403).json({
        error: 'Limite d\'équipes atteinte pour votre abonnement'
      });
    }

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        ownerId: req.user.id
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'TEAM_CREATED',
        title: 'Équipe créée',
        description: `Nouvelle équipe: ${name}`,
        metadata: { teamId: team.id }
      }
    });

    res.status(201).json({
      message: 'Équipe créée avec succès',
      team
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/teams/:teamId - Détails d'une équipe
router.get('/teams/:teamId', async (req, res, next) => {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: req.params.teamId,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                lastLoginAt: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        invitations: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'desc' }
        },
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        activities: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!team) {
      return res.status(404).json({
        error: 'Équipe non trouvée'
      });
    }

    // Déterminer le rôle de l'utilisateur actuel
    const userRole = team.ownerId === req.user.id ? 'OWNER' : 
      team.members.find(m => m.userId === req.user.id)?.role || null;

    res.json({
      ...team,
      userRole,
      stats: {
        members: team.members.length + 1, // +1 pour le propriétaire
        pendingInvitations: team.invitations.length,
        campaigns: team.campaigns.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/teams/:teamId/invite - Inviter un membre
router.post('/teams/:teamId/invite', validateInvitation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { email, role, message } = req.body;

    // Vérifier que l'équipe existe et que l'utilisateur peut inviter
    const team = await prisma.team.findFirst({
      where: {
        id: req.params.teamId,
        OR: [
          { ownerId: req.user.id },
          { 
            members: { 
              some: { 
                userId: req.user.id,
                role: { in: ['ADMIN'] }
              } 
            } 
          }
        ]
      },
      include: {
        members: true,
        invitations: {
          where: { status: 'PENDING' }
        }
      }
    });

    if (!team) {
      return res.status(404).json({
        error: 'Équipe non trouvée ou permissions insuffisantes'
      });
    }

    // Vérifier si l'utilisateur est déjà membre ou invité
    const existingMember = team.members.find(m => m.user?.email === email);
    const existingInvitation = team.invitations.find(i => i.email === email);

    if (existingMember) {
      return res.status(400).json({
        error: 'Cet utilisateur est déjà membre de l\'équipe'
      });
    }

    if (existingInvitation) {
      return res.status(400).json({
        error: 'Une invitation est déjà en attente pour cet email'
      });
    }

    // Vérifier les limites d'abonnement
    const subscription = await prisma.subscription.findUnique({
      where: { userId: team.ownerId }
    });

    const memberLimits = {
      FREE: 3,
      STARTER: 10,
      PRO: 25,
      ENTERPRISE: Infinity
    };

    const currentMembers = team.members.length + 1; // +1 pour le propriétaire
    if (currentMembers >= memberLimits[subscription?.plan || 'FREE']) {
      return res.status(403).json({
        error: 'Limite de membres atteinte pour cet abonnement'
      });
    }

    // Vérifier que le rôle n'est pas supérieur à celui de l'inviteur
    const inviterRole = team.ownerId === req.user.id ? 'OWNER' : 
      team.members.find(m => m.userId === req.user.id)?.role;
    
    if (ROLES[role].level >= ROLES[inviterRole].level) {
      return res.status(403).json({
        error: 'Vous ne pouvez pas inviter avec un rôle supérieur ou égal au vôtre'
      });
    }

    // Créer l'invitation
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    const invitation = await prisma.teamInvitation.create({
      data: {
        teamId: req.params.teamId,
        email: email.toLowerCase(),
        role,
        message,
        token: invitationToken,
        expiresAt,
        invitedById: req.user.id
      },
      include: {
        team: {
          select: {
            name: true
          }
        },
        invitedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Envoyer l'email d'invitation
    try {
      const inviteUrl = `${process.env.CLIENT_URL}/team/invite/${invitationToken}`;
      
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: `Invitation à rejoindre l'équipe ${team.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Invitation à rejoindre une équipe</h2>
            <p>Bonjour,</p>
            <p><strong>${invitation.invitedBy.name}</strong> vous invite à rejoindre l'équipe <strong>${team.name}</strong> en tant que <strong>${ROLES[role].name}</strong>.</p>
            ${message ? `<div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;"><em>"${message}"</em></div>` : ''}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Accepter l'invitation</a>
            </div>
            <p style="color: #666; font-size: 14px;">Cette invitation expire le ${expiresAt.toLocaleDateString('fr-FR')}.</p>
            <p style="color: #666; font-size: 14px;">Si vous ne souhaitez pas rejoindre cette équipe, vous pouvez ignorer cet email.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      // On continue même si l'email échoue, l'invitation est créée
    }

    // Enregistrer l'activité
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'TEAM_INVITATION_SENT',
        title: 'Invitation envoyée',
        description: `Invitation envoyée à ${email} pour l'équipe ${team.name}`,
        metadata: { 
          teamId: req.params.teamId,
          invitationId: invitation.id,
          email,
          role
        }
      }
    });

    res.status(201).json({
      message: 'Invitation envoyée avec succès',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/teams/accept-invite/:token - Accepter une invitation
router.post('/teams/accept-invite/:token', async (req, res, next) => {
  try {
    const invitation = await prisma.teamInvitation.findFirst({
      where: {
        token: req.params.token,
        status: 'PENDING',
        expiresAt: { gt: new Date() }
      },
      include: {
        team: {
          include: {
            owner: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!invitation) {
      return res.status(404).json({
        error: 'Invitation invalide ou expirée'
      });
    }

    // Vérifier que l'utilisateur connecté correspond à l'email invité
    if (req.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({
        error: 'Cette invitation n\'est pas pour votre compte'
      });
    }

    // Vérifier si l'utilisateur n'est pas déjà membre
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: invitation.teamId,
        userId: req.user.id
      }
    });

    if (existingMember) {
      return res.status(400).json({
        error: 'Vous êtes déjà membre de cette équipe'
      });
    }

    // Créer le membre et marquer l'invitation comme acceptée
    await prisma.$transaction([
      prisma.teamMember.create({
        data: {
          teamId: invitation.teamId,
          userId: req.user.id,
          role: invitation.role
        }
      }),
      prisma.teamInvitation.update({
        where: { id: invitation.id },
        data: { 
          status: 'ACCEPTED',
          acceptedAt: new Date()
        }
      })
    ]);

    // Enregistrer l'activité
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'TEAM_JOINED',
        title: 'Équipe rejointe',
        description: `Invitation acceptée pour l'équipe ${invitation.team.name}`,
        metadata: { 
          teamId: invitation.teamId,
          invitationId: invitation.id
        }
      }
    });

    res.json({
      message: 'Invitation acceptée avec succès',
      team: {
        id: invitation.team.id,
        name: invitation.team.name,
        role: invitation.role,
        owner: invitation.team.owner
      }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/teams/:teamId/invitations/:invitationId - Annuler une invitation
router.delete('/teams/:teamId/invitations/:invitationId', async (req, res, next) => {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: req.params.teamId,
        OR: [
          { ownerId: req.user.id },
          { 
            members: { 
              some: { 
                userId: req.user.id,
                role: { in: ['ADMIN'] }
              } 
            } 
          }
        ]
      }
    });

    if (!team) {
      return res.status(404).json({
        error: 'Équipe non trouvée ou permissions insuffisantes'
      });
    }

    const invitation = await prisma.teamInvitation.findFirst({
      where: {
        id: req.params.invitationId,
        teamId: req.params.teamId,
        status: 'PENDING'
      }
    });

    if (!invitation) {
      return res.status(404).json({
        error: 'Invitation non trouvée'
      });
    }

    await prisma.teamInvitation.update({
      where: { id: invitation.id },
      data: { 
        status: 'CANCELLED',
        cancelledAt: new Date()
      }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'TEAM_INVITATION_CANCELLED',
        title: 'Invitation annulée',
        description: `Invitation annulée pour ${invitation.email}`,
        metadata: { 
          teamId: req.params.teamId,
          invitationId: invitation.id
        }
      }
    });

    res.json({
      message: 'Invitation annulée avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/teams/:teamId/members/:memberId/role - Modifier le rôle d'un membre
router.put('/teams/:teamId/members/:memberId/role', validateRoleUpdate, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { role } = req.body;

    const team = await prisma.team.findFirst({
      where: {
        id: req.params.teamId,
        OR: [
          { ownerId: req.user.id },
          { 
            members: { 
              some: { 
                userId: req.user.id,
                role: { in: ['ADMIN'] }
              } 
            } 
          }
        ]
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!team) {
      return res.status(404).json({
        error: 'Équipe non trouvée ou permissions insuffisantes'
      });
    }

    const member = team.members.find(m => m.id === req.params.memberId);
    
    if (!member) {
      return res.status(404).json({
        error: 'Membre non trouvé'
      });
    }

    // Vérifier les permissions
    const userRole = team.ownerId === req.user.id ? 'OWNER' : 
      team.members.find(m => m.userId === req.user.id)?.role;
    
    if (ROLES[role].level >= ROLES[userRole].level) {
      return res.status(403).json({
        error: 'Vous ne pouvez pas attribuer un rôle supérieur ou égal au vôtre'
      });
    }

    if (ROLES[member.role].level >= ROLES[userRole].level) {
      return res.status(403).json({
        error: 'Vous ne pouvez pas modifier le rôle de ce membre'
      });
    }

    const updatedMember = await prisma.teamMember.update({
      where: { id: req.params.memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'TEAM_MEMBER_ROLE_UPDATED',
        title: 'Rôle de membre modifié',
        description: `Rôle de ${member.user.name} changé vers ${ROLES[role].name}`,
        metadata: { 
          teamId: req.params.teamId,
          memberId: req.params.memberId,
          oldRole: member.role,
          newRole: role
        }
      }
    });

    res.json({
      message: 'Rôle mis à jour avec succès',
      member: updatedMember
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/teams/:teamId/members/:memberId - Retirer un membre
router.delete('/teams/:teamId/members/:memberId', async (req, res, next) => {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: req.params.teamId,
        OR: [
          { ownerId: req.user.id },
          { 
            members: { 
              some: { 
                userId: req.user.id,
                role: { in: ['ADMIN'] }
              } 
            } 
          }
        ]
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!team) {
      return res.status(404).json({
        error: 'Équipe non trouvée ou permissions insuffisantes'
      });
    }

    const member = team.members.find(m => m.id === req.params.memberId);
    
    if (!member) {
      return res.status(404).json({
        error: 'Membre non trouvé'
      });
    }

    // Vérifier les permissions
    const userRole = team.ownerId === req.user.id ? 'OWNER' : 
      team.members.find(m => m.userId === req.user.id)?.role;
    
    if (ROLES[member.role].level >= ROLES[userRole].level) {
      return res.status(403).json({
        error: 'Vous ne pouvez pas retirer ce membre'
      });
    }

    await prisma.teamMember.delete({
      where: { id: req.params.memberId }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'TEAM_MEMBER_REMOVED',
        title: 'Membre retiré',
        description: `${member.user.name} a été retiré de l'équipe`,
        metadata: { 
          teamId: req.params.teamId,
          memberId: req.params.memberId,
          memberName: member.user.name
        }
      }
    });

    res.json({
      message: 'Membre retiré avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/teams/:teamId/leave - Quitter une équipe
router.post('/teams/:teamId/leave', async (req, res, next) => {
  try {
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: req.params.teamId,
        userId: req.user.id
      },
      include: {
        team: {
          select: {
            name: true,
            ownerId: true
          }
        }
      }
    });

    if (!membership) {
      return res.status(404).json({
        error: 'Vous n\'êtes pas membre de cette équipe'
      });
    }

    if (membership.team.ownerId === req.user.id) {
      return res.status(400).json({
        error: 'Le propriétaire ne peut pas quitter son équipe'
      });
    }

    await prisma.teamMember.delete({
      where: { id: membership.id }
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'TEAM_LEFT',
        title: 'Équipe quittée',
        description: `Vous avez quitté l'équipe ${membership.team.name}`,
        metadata: { 
          teamId: req.params.teamId,
          teamName: membership.team.name
        }
      }
    });

    res.json({
      message: 'Vous avez quitté l\'équipe avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/roles - Liste des rôles disponibles
router.get('/roles', async (req, res, next) => {
  try {
    const roles = Object.entries(ROLES).map(([key, role]) => ({
      id: key,
      name: role.name,
      permissions: role.permissions,
      level: role.level
    }));

    res.json({ roles });
  } catch (error) {
    next(error);
  }
});

// Routes simplifiées pour l'équipe principale de l'utilisateur
// GET /api/users/team - Membres de l'équipe principale
router.get('/team', async (req, res, next) => {
  try {
    // Pour simplifier, on utilise l'équipe principale de l'utilisateur ou on crée une équipe virtuelle
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        subscription: true
      }
    });

    // Récupérer tous les utilisateurs pour simulation d'équipe
    const members = await prisma.user.findMany({
      where: {
        OR: [
          { id: req.user.id },
          { id: { not: req.user.id } } // autres utilisateurs pour la démo
        ]
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true
      },
      take: 10 // Limiter à 10 pour la démo
    });

    // Simuler les données d'équipe
    const teamMembers = members.map(member => ({
      ...member,
      role: member.id === req.user.id ? 'OWNER' : (member.role === 'ADMIN' ? 'ADMIN' : 'EDITOR'),
      status: 'ACTIVE'
    }));

    res.json({
      members: teamMembers
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/invitations/pending - Invitations en attente
router.get('/invitations/pending', async (req, res, next) => {
  try {
    // Pour la démonstration, retourner des invitations vides ou simulées
    const invitations = [];

    res.json({
      invitations
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/invite - Inviter un membre
router.post('/invite', validateInvitation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { email, role, message } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Cet utilisateur existe déjà dans le système'
      });
    }

    // Pour la démo, on simule l'envoi d'invitation
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'TEAM_INVITATION_SENT',
        title: 'Invitation envoyée',
        description: `Invitation envoyée à ${email}`,
        metadata: { email, role }
      }
    });

    res.status(201).json({
      message: 'Invitation envoyée avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/team/:userId/role - Mettre à jour le rôle d'un membre
router.put('/team/:userId/role', validateRoleUpdate, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { role } = req.body;

    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: req.params.userId }
    });

    if (!targetUser) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    // Pour la démo, on peut pas vraiment changer les rôles, mais on simule
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'TEAM_MEMBER_ROLE_UPDATED',
        title: 'Rôle de membre modifié',
        description: `Rôle de ${targetUser.firstName || targetUser.email} modifié`,
        metadata: { targetUserId: req.params.userId, newRole: role }
      }
    });

    res.json({
      message: 'Rôle mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/team/:userId - Retirer un membre
router.delete('/team/:userId', async (req, res, next) => {
  try {
    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: req.params.userId }
    });

    if (!targetUser) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    if (targetUser.id === req.user.id) {
      return res.status(400).json({
        error: 'Vous ne pouvez pas vous retirer vous-même'
      });
    }

    // Pour la démo, on simule le retrait
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'TEAM_MEMBER_REMOVED',
        title: 'Membre retiré',
        description: `${targetUser.firstName || targetUser.email} a été retiré de l'équipe`,
        metadata: { targetUserId: req.params.userId }
      }
    });

    res.json({
      message: 'Membre retiré avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/invitations/:id/resend - Renvoyer une invitation
router.post('/invitations/:id/resend', async (req, res, next) => {
  try {
    // Pour la démo, on simule le renvoi
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'TEAM_INVITATION_SENT',
        title: 'Invitation renvoyée',
        description: 'Invitation renvoyée',
        metadata: { invitationId: req.params.id }
      }
    });

    res.json({
      message: 'Invitation renvoyée avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/invitations/:id - Annuler une invitation
router.delete('/invitations/:id', async (req, res, next) => {
  try {
    // Pour la démo, on simule l'annulation
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'TEAM_INVITATION_CANCELLED',
        title: 'Invitation annulée',
        description: 'Invitation annulée',
        metadata: { invitationId: req.params.id }
      }
    });

    res.json({
      message: 'Invitation annulée avec succès'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 