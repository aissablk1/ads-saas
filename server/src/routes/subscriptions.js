const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();
const prisma = new PrismaClient();

// Plans disponibles
const PLANS = {
  free: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    interval: 'mois',
    stripePriceId: null,
    features: {
      campaigns: 3,
      ads: 15,
      apiKeys: 1,
      support: 'communauté',
      analytics: 'basiques',
      customReports: false
    },
    limits: {
      impressions: '10K'
    }
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'mois',
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: {
      campaigns: 25,
      ads: 100,
      apiKeys: 3,
      support: 'email',
      analytics: 'avancées',
      customReports: false
    },
    limits: {
      impressions: '100K'
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 79,
    interval: 'mois',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    features: {
      campaigns: 100,
      ads: 500,
      apiKeys: 10,
      support: 'prioritaire',
      analytics: 'premium',
      customReports: true
    },
    limits: {
      impressions: '1M'
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    interval: 'mois',
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: {
      campaigns: 'unlimited',
      ads: 'unlimited',
      apiKeys: 'unlimited',
      support: 'dédié',
      analytics: 'personnalisées',
      customReports: true
    },
    limits: {
      impressions: 'unlimited'
    }
  }
};

// GET /api/subscriptions/plans - Liste des plans disponibles
router.get('/plans', async (req, res, next) => {
  try {
    res.json({
      plans: Object.entries(PLANS).map(([key, planData]) => ({
        id: key,
        ...planData
      }))
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/subscriptions/current - Abonnement actuel de l'utilisateur
router.get('/current', async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      return res.json({
        plan: 'FREE',
        status: 'ACTIVE',
        features: PLANS.free.features,
        usage: await getUserUsage(req.user.id)
      });
    }

    // Récupérer les informations Stripe si abonnement payant
    let stripeSubscription = null;
    let upcomingInvoice = null;
    
    if (subscription.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
        upcomingInvoice = await stripe.invoices.retrieveUpcoming({
          customer: subscription.stripeCustomerId
        });
      } catch (stripeError) {
        console.error('Erreur Stripe:', stripeError);
      }
    }

    res.json({
      ...subscription,
      features: PLANS[subscription.plan.toLowerCase()]?.features || PLANS.free.features,
      usage: await getUserUsage(req.user.id),
      stripeSubscription,
      upcomingInvoice: upcomingInvoice ? {
        amount: upcomingInvoice.amount_due,
        currency: upcomingInvoice.currency,
        periodStart: new Date(upcomingInvoice.period_start * 1000),
        periodEnd: new Date(upcomingInvoice.period_end * 1000)
      } : null
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/create-checkout - Créer une session de paiement Stripe
router.post('/create-checkout', async (req, res, next) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan] || plan === 'free') {
      return res.status(400).json({
        error: 'Plan invalide'
      });
    }

    const planData = PLANS[plan];

    // Créer ou récupérer le customer Stripe
    let customer;
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (existingSubscription?.stripeCustomerId) {
      customer = await stripe.customers.retrieve(existingSubscription.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: req.user.id
        }
      });
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: planData.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard/billing?canceled=true`,
      metadata: {
        userId: req.user.id,
        plan: plan
      },
      subscription_data: {
        metadata: {
          userId: req.user.id,
          plan: plan
        }
      }
    });

    res.json({
      sessionId: session.id,
      checkoutUrl: session.url
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/create-portal - Créer une session de portail client Stripe
router.post('/create-portal', async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription?.stripeCustomerId) {
      return res.status(400).json({
        error: 'Aucun abonnement Stripe trouvé'
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard/billing`,
    });

    res.json({
      portalUrl: session.url
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/cancel - Annuler l'abonnement
router.post('/cancel', async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription?.stripeSubscriptionId) {
      return res.status(400).json({
        error: 'Aucun abonnement actif trouvé'
      });
    }

    // Annuler l'abonnement Stripe à la fin de la période
    const stripeSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    // Mettre à jour en base
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date()
      }
    });

    // Enregistrer l'activité
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'SUBSCRIPTION_CANCELLED',
        title: 'Abonnement annulé',
        description: `Abonnement ${subscription.plan} annulé`,
        metadata: { subscriptionId: subscription.id }
      }
    });

    res.json({
      message: 'Abonnement annulé avec succès',
      periodEnd: new Date(stripeSubscription.current_period_end * 1000)
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/reactivate - Réactiver l'abonnement annulé
router.post('/reactivate', async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription?.stripeSubscriptionId || !subscription.cancelAtPeriodEnd) {
      return res.status(400).json({
        error: 'Aucun abonnement annulé trouvé'
      });
    }

    // Réactiver l'abonnement Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    // Mettre à jour en base
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null
      }
    });

    // Enregistrer l'activité
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'SUBSCRIPTION_REACTIVATED',
        title: 'Abonnement réactivé',
        description: `Abonnement ${subscription.plan} réactivé`,
        metadata: { subscriptionId: subscription.id }
      }
    });

    res.json({
      message: 'Abonnement réactivé avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/subscriptions/invoices - Historique des factures
router.get('/invoices', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      return res.json({
        data: [],
        pagination: { total: 0, page: 1, limit: parseInt(limit), totalPages: 0 }
      });
    }

    // Récupérer les factures depuis la base de données
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: { subscriptionId: subscription.id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.invoice.count({
        where: { subscriptionId: subscription.id }
      })
    ]);

    // Enrichir avec les données Stripe si nécessaire
    const enrichedInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        if (invoice.stripeInvoiceId) {
          try {
            const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoiceId);
            return {
              ...invoice,
              downloadUrl: stripeInvoice.invoice_pdf,
              paymentMethod: stripeInvoice.payment_intent?.payment_method || null
            };
          } catch (stripeError) {
            console.error('Erreur récupération facture Stripe:', stripeError);
            return invoice;
          }
        }
        return invoice;
      })
    );

    res.json({
      data: enrichedInvoices,
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

// GET /api/subscriptions/usage - Utilisation actuelle de l'utilisateur
router.get('/usage', async (req, res, next) => {
  try {
    const usage = await getUserUsage(req.user.id);
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    const plan = subscription?.plan || 'FREE';
    const planKey = plan.toLowerCase();
    const limits = PLANS[planKey]?.features || PLANS.free.features;

    res.json({
      usage,
      limits,
      plan,
      percentages: {
        campaigns: limits.campaigns === 'unlimited' ? 0 : (usage.campaigns / limits.campaigns) * 100,
        monthlyBudget: limits.monthlyBudget === 'unlimited' ? 0 : (usage.monthlySpent / limits.monthlyBudget) * 100
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/webhooks - Webhook Stripe
router.post('/webhooks', express.raw({ type: 'application/json' }), async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Erreur webhook Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      default:
        console.log(`Type d'événement webhook non géré: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erreur traitement webhook:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Fonctions utilitaires

async function getUserUsage(userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [campaignCount, monthlySpent, totalAds] = await Promise.all([
    prisma.campaign.count({
      where: { userId, archived: false }
    }),
    prisma.campaign.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfMonth }
      },
      _sum: { spent: true }
    }),
    prisma.ad.count({
      where: {
        campaign: { userId }
      }
    })
  ]);

  return {
    campaigns: campaignCount,
    monthlySpent: monthlySpent._sum.spent || 0,
    totalAds
  };
}

async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const plan = session.metadata.plan;
  
  // Créer ou mettre à jour l'abonnement
  const subscriptionData = {
    userId,
    plan,
    status: 'active',
    stripeCustomerId: session.customer,
    stripeSubscriptionId: session.subscription,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
  };

  await prisma.subscription.upsert({
    where: { userId },
    update: subscriptionData,
    create: subscriptionData
  });

  // Enregistrer l'activité
  await prisma.activity.create({
    data: {
      userId,
      type: 'SUBSCRIPTION_CREATED',
      title: 'Abonnement activé',
      description: `Nouvel abonnement ${plan} activé`,
      metadata: { sessionId: session.id }
    }
  });
}

async function handleInvoicePaymentSucceeded(invoice) {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: invoice.customer }
  });

  if (!subscription) return;

  // Enregistrer la facture
  await prisma.invoice.create({
    data: {
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid / 100, // Convertir de centimes
      currency: invoice.currency,
      status: 'paid',
      paidAt: new Date(invoice.status_transitions.paid_at * 1000),
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000)
    }
  });

  // Mettre à jour la période de l'abonnement
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'active',
      currentPeriodStart: new Date(invoice.period_start * 1000),
      currentPeriodEnd: new Date(invoice.period_end * 1000)
    }
  });
}

async function handleInvoicePaymentFailed(invoice) {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: invoice.customer }
  });

  if (!subscription) return;

  // Enregistrer la facture échouée
  await prisma.invoice.create({
    data: {
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      status: 'failed',
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000)
    }
  });

  // Marquer l'abonnement comme en retard de paiement
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'past_due' }
  });

  // Enregistrer l'activité
  await prisma.activity.create({
    data: {
      userId: subscription.userId,
      type: 'PAYMENT_FAILED',
      title: 'Échec de paiement',
      description: 'Le paiement de votre abonnement a échoué',
      metadata: { invoiceId: invoice.id }
    }
  });
}

async function handleSubscriptionUpdated(subscription) {
  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (!dbSubscription) return;

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  });
}

async function handleSubscriptionDeleted(subscription) {
  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (!dbSubscription) return;

  // Revenir au plan gratuit
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      plan: 'FREE',
      status: 'cancelled',
      stripeSubscriptionId: null,
      canceledAt: new Date()
    }
  });

  // Enregistrer l'activité
  await prisma.activity.create({
    data: {
      userId: dbSubscription.userId,
      type: 'SUBSCRIPTION_CANCELLED',
      title: 'Abonnement expiré',
      description: 'Votre abonnement a expiré, retour au plan gratuit',
      metadata: { subscriptionId: subscription.id }
    }
  });
}

module.exports = router; 