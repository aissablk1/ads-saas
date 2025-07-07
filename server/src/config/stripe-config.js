const stripe = require('stripe');

// Configuration Stripe sécurisée
const stripeConfig = {
  // Plans de tarification (ID Stripe réels)
  plans: {
    starter: {
      id: process.env.STRIPE_PLAN_STARTER_ID || 'price_starter_monthly',
      name: 'Starter',
      price: 29,
      currency: 'eur',
      interval: 'month',
      features: [
        '5 campagnes actives',
        '50 000 impressions/mois',
        '3 intégrations',
        'Support email',
        '1 utilisateur'
      ],
      limits: {
        campaigns: 5,
        impressions: 50000,
        integrations: 3,
        users: 1,
        storage: '2GB'
      }
    },
    pro: {
      id: process.env.STRIPE_PLAN_PRO_ID || 'price_pro_monthly',
      name: 'Pro',
      price: 79,
      currency: 'eur',
      interval: 'month',
      features: [
        '25 campagnes actives',
        '250 000 impressions/mois',
        '10 intégrations',
        'Support prioritaire',
        '5 utilisateurs',
        'Analytics avancées'
      ],
      limits: {
        campaigns: 25,
        impressions: 250000,
        integrations: 10,
        users: 5,
        storage: '10GB'
      }
    },
    business: {
      id: process.env.STRIPE_PLAN_BUSINESS_ID || 'price_business_monthly',
      name: 'Business',
      price: 199,
      currency: 'eur',
      interval: 'month',
      features: [
        '100 campagnes actives',
        '1 000 000 impressions/mois',
        'Intégrations illimitées',
        'Support téléphone',
        '15 utilisateurs',
        'API personnalisée',
        'White-label'
      ],
      limits: {
        campaigns: 100,
        impressions: 1000000,
        integrations: -1, // illimité
        users: 15,
        storage: '50GB'
      }
    },
    enterprise: {
      id: process.env.STRIPE_PLAN_ENTERPRISE_ID || 'price_enterprise_monthly',
      name: 'Enterprise',
      price: 499,
      currency: 'eur',
      interval: 'month',
      features: [
        'Campagnes illimitées',
        'Impressions illimitées',
        'Intégrations illimitées',
        'Support dédié',
        'Utilisateurs illimités',
        'Infrastructure dédiée',
        'SLA 99.9%'
      ],
      limits: {
        campaigns: -1,
        impressions: -1,
        integrations: -1,
        users: -1,
        storage: '500GB'
      }
    }
  },

  // Configuration webhooks
  webhookEndpoints: {
    development: 'http://localhost:8000/api/subscriptions/webhook',
    production: process.env.STRIPE_WEBHOOK_URL || 'https://api.votre-domaine.com/api/subscriptions/webhook'
  },

  // Événements Stripe à surveiller
  webhookEvents: [
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'customer.subscription.trial_will_end',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'customer.created',
    'customer.updated'
  ]
};

// Instance Stripe configurée
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// Fonctions utilitaires
const stripeUtils = {
  /**
   * Créer un client Stripe
   */
  async createCustomer(email, name, metadata = {}) {
    return await stripeInstance.customers.create({
      email,
      name,
      metadata: {
        source: 'ads_saas',
        ...metadata
      }
    });
  },

  /**
   * Créer une session de checkout
   */
  async createCheckoutSession(customerId, planId, successUrl, cancelUrl) {
    const plan = Object.values(stripeConfig.plans).find(p => p.id === planId);
    if (!plan) {
      throw new Error('Plan non trouvé');
    }

    return await stripeInstance.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: planId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true
      }
    });
  },

  /**
   * Créer un portail client
   */
  async createCustomerPortal(customerId, returnUrl) {
    return await stripeInstance.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  },

  /**
   * Annuler un abonnement
   */
  async cancelSubscription(subscriptionId, immediately = false) {
    if (immediately) {
      return await stripeInstance.subscriptions.del(subscriptionId);
    } else {
      return await stripeInstance.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    }
  },

  /**
   * Valider un webhook Stripe
   */
  validateWebhook(payload, signature) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET non configuré');
    }

    try {
      return stripeInstance.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('❌ Erreur validation webhook Stripe:', err.message);
      throw err;
    }
  },

  /**
   * Obtenir les détails d'un abonnement
   */
  async getSubscription(subscriptionId) {
    return await stripeInstance.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'items.data.price']
    });
  },

  /**
   * Mettre à jour un abonnement
   */
  async updateSubscription(subscriptionId, newPlanId) {
    const subscription = await stripeInstance.subscriptions.retrieve(subscriptionId);
    
    return await stripeInstance.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPlanId,
      }],
      proration_behavior: 'create_prorations',
    });
  }
};

module.exports = {
  stripe: stripeInstance,
  stripeConfig,
  stripeUtils
}; 