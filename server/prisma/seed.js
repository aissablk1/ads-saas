const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seeding...')

  // Créer l'utilisateur administrateur
  const adminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ads-saas.com' },
    update: {},
    create: {
      email: 'admin@ads-saas.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'ADS SaaS',
      role: 'ADMIN',
      emailVerified: true,
      twoFactorEnabled: false
    }
  })

  console.log('✅ Utilisateur administrateur créé')

  // Créer l'utilisateur démo
  const demoPassword = await bcrypt.hash('demo123', 10)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@ads-saas.com' },
    update: {},
    create: {
      email: 'demo@ads-saas.com',
      password: demoPassword,
      firstName: 'Utilisateur',
      lastName: 'Démo',
      role: 'USER',
      emailVerified: true,
      twoFactorEnabled: false
    }
  })

  console.log('✅ Utilisateur démo créé')

  // Créer des campagnes de démonstration
  const campaigns = [
    {
      name: 'Campagne Black Friday 2024',
      description: 'Campagne de promotion pour le Black Friday avec des réductions exceptionnelles',
      budget: 5000,
      spent: 4850,
      impressions: 125000,
      clicks: 3750,
      conversions: 187,
      status: 'COMPLETED',
      userId: demoUser.id,
      startDate: new Date('2024-11-20'),
      endDate: new Date('2024-11-30')
    },
    {
      name: 'Lancement Produit Été 2024',
      description: 'Campagne de lancement pour notre nouvelle collection été',
      budget: 3000,
      spent: 2890,
      impressions: 89000,
      clicks: 2140,
      conversions: 96,
      status: 'COMPLETED',
      userId: demoUser.id,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31')
    },
    {
      name: 'Retargeting Q4 2024',
      description: 'Campagne de retargeting pour les visiteurs non convertis',
      budget: 2000,
      spent: 1650,
      impressions: 45000,
      clicks: 1350,
      conversions: 81,
      status: 'ACTIVE',
      userId: demoUser.id,
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-12-31')
    }
  ]

  const createdCampaigns = []
  for (const campaignData of campaigns) {
    const campaign = await prisma.campaign.create({
      data: campaignData
    })
    createdCampaigns.push(campaign)
  }

  // Créer des annonces pour chaque campagne
  const ads = [
    // Campagne Black Friday
    {
      title: 'Black Friday - 50% de réduction',
      description: 'Profitez de notre méga promotion Black Friday avec jusqu\'à 50% de réduction sur tous nos produits',
      imageUrl: '/images/ads/black-friday-1.jpg',
      targetUrl: 'https://example.com/black-friday',
      status: 'ACTIVE',
      impressions: 45000,
      clicks: 1350,
      conversions: 67,
      campaignId: createdCampaigns[0].id
    },
    {
      title: 'Derniers jours Black Friday',
      description: 'Ne manquez pas les dernières heures de notre Black Friday exceptionnel',
      imageUrl: '/images/ads/black-friday-2.jpg',
      targetUrl: 'https://example.com/black-friday-final',
      status: 'ACTIVE',
      impressions: 80000,
      clicks: 2400,
      conversions: 120,
      campaignId: createdCampaigns[0].id
    },
    // Campagne Été
    {
      title: 'Collection Été 2024',
      description: 'Découvrez notre nouvelle collection été avec des pièces tendance et colorées',
      imageUrl: '/images/ads/summer-collection.jpg',
      targetUrl: 'https://example.com/summer-2024',
      status: 'PAUSED',
      impressions: 89000,
      clicks: 2140,
      conversions: 96,
      campaignId: createdCampaigns[1].id
    },
    // Campagne Retargeting
    {
      title: 'Vous avez oublié quelque chose',
      description: 'Retournez finaliser votre commande et bénéficiez de la livraison gratuite',
      imageUrl: '/images/ads/retargeting.jpg',
      targetUrl: 'https://example.com/cart',
      status: 'ACTIVE',
      impressions: 45000,
      clicks: 1350,
      conversions: 81,
      campaignId: createdCampaigns[2].id
    }
  ]

  for (const adData of ads) {
    await prisma.ad.create({
      data: adData
    })
  }

  // Créer des activités de démonstration
  const activities = [
    {
      type: 'LOGIN',
      title: 'Connexion réussie',
      description: 'Connexion depuis 192.168.1.1',
      userId: demoUser.id,
      createdAt: new Date()
    },
    {
      type: 'CAMPAIGN_CREATED',
      title: 'Campagne créée',
      description: 'Nouvelle campagne: Campagne Black Friday 2024',
      userId: demoUser.id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      type: 'SUBSCRIPTION_UPDATED',
      title: 'Abonnement modifié',
      description: 'Changement vers le plan Professionnel',
      userId: demoUser.id,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ]

  for (const activityData of activities) {
    await prisma.activity.create({
      data: activityData
    })
  }

  // Créer un abonnement de démonstration
  await prisma.subscription.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
      userId: demoUser.id
    }
  })

  console.log('✅ Seeding terminé avec succès!')
  console.log('\n📊 Données créées:')
  console.log(`👤 Utilisateurs: 2 (admin@ads-saas.com, demo@ads-saas.com)`)
  console.log(`🏷️  Campagnes: ${createdCampaigns.length}`)
  console.log(`📢 Annonces: ${ads.length}`)
  console.log(`📝 Activités: ${activities.length}`)
  console.log(`💳 Abonnements: 1`)
  console.log('\n🔐 Comptes de test:')
  console.log('Admin: admin@ads-saas.com / admin123')
  console.log('Démo: demo@ads-saas.com / demo123')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 