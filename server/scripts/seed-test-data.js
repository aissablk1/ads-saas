const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Données de test réalistes
const testUsers = [
  { email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe', role: 'USER' },
  { email: 'jane.smith@example.com', firstName: 'Jane', lastName: 'Smith', role: 'USER' },
  { email: 'mike.wilson@example.com', firstName: 'Mike', lastName: 'Wilson', role: 'USER' },
  { email: 'sarah.johnson@example.com', firstName: 'Sarah', lastName: 'Johnson', role: 'USER' },
  { email: 'david.brown@example.com', firstName: 'David', lastName: 'Brown', role: 'USER' },
  { email: 'emma.davis@example.com', firstName: 'Emma', lastName: 'Davis', role: 'USER' },
  { email: 'alex.taylor@example.com', firstName: 'Alex', lastName: 'Taylor', role: 'USER' },
  { email: 'lisa.anderson@example.com', firstName: 'Lisa', lastName: 'Anderson', role: 'USER' },
  { email: 'tom.martinez@example.com', firstName: 'Tom', lastName: 'Martinez', role: 'USER' },
  { email: 'anna.garcia@example.com', firstName: 'Anna', lastName: 'Garcia', role: 'USER' }
];

const testCampaigns = [
  { name: 'Campagne Printemps 2024', description: 'Promotion saisonnière', budget: 5000, status: 'ACTIVE' },
  { name: 'Black Friday', description: 'Offres spéciales', budget: 10000, status: 'ACTIVE' },
  { name: 'Nouveau Produit', description: 'Lancement produit', budget: 7500, status: 'ACTIVE' },
  { name: 'Fidélisation Client', description: 'Programme de fidélité', budget: 3000, status: 'PAUSED' },
  { name: 'Test A/B', description: 'Optimisation conversion', budget: 2000, status: 'DRAFT' },
  { name: 'Campagne Été', description: 'Promotions estivales', budget: 6000, status: 'ACTIVE' },
  { name: 'Back to School', description: 'Rentrée scolaire', budget: 4000, status: 'COMPLETED' },
  { name: 'Holiday Special', description: 'Offres de fin d\'année', budget: 8000, status: 'ACTIVE' }
];

const activityTypes = [
  'USER_LOGIN',
  'CAMPAIGN_CREATED',
  'CAMPAIGN_UPDATED',
  'PAYMENT_SUCCESS',
  'PAYMENT_FAILED',
  'USER_REGISTERED',
  'CAMPAIGN_PAUSED',
  'CAMPAIGN_ACTIVATED',
  'BUDGET_ALERT',
  'PERFORMANCE_ALERT'
];

async function seedTestData() {
  try {
    console.log('🌱 Génération des données de test...');

    // Créer des utilisateurs de test
    console.log('👥 Création des utilisateurs...');
    const createdUsers = [];
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const userData of testUsers) {
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          status: 'ACTIVE',
          emailVerified: true,
          twoFactorEnabled: false
        }
      });
      createdUsers.push(user);
      console.log(`✅ Utilisateur créé: ${user.email}`);
    }

    // Créer des campagnes de test
    console.log('📊 Création des campagnes...');
    const createdCampaigns = [];

    for (const campaignData of testCampaigns) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      const campaign = await prisma.campaign.create({
        data: {
          ...campaignData,
          userId: randomUser.id,
          spent: Math.random() * campaignData.budget * 0.8,
          impressions: Math.floor(Math.random() * 100000) + 10000,
          clicks: Math.floor(Math.random() * 5000) + 500,
          conversions: Math.floor(Math.random() * 200) + 50,
          startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
        }
      });
      createdCampaigns.push(campaign);
      console.log(`✅ Campagne créée: ${campaign.name}`);
    }

    // Créer des activités de test
    console.log('📝 Création des activités...');
    const activities = [];

    for (let i = 0; i < 50; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const randomCampaign = createdCampaigns[Math.floor(Math.random() * createdCampaigns.length)];

      let title = '';
      let description = '';

      switch (randomType) {
        case 'USER_LOGIN':
          title = 'Connexion utilisateur';
          description = `L'utilisateur ${randomUser.email} s'est connecté`;
          break;
        case 'CAMPAIGN_CREATED':
          title = 'Nouvelle campagne créée';
          description = `Campagne "${randomCampaign.name}" créée par ${randomUser.email}`;
          break;
        case 'CAMPAIGN_UPDATED':
          title = 'Campagne mise à jour';
          description = `Campagne "${randomCampaign.name}" modifiée`;
          break;
        case 'PAYMENT_SUCCESS':
          title = 'Paiement réussi';
          description = `Paiement traité pour ${randomUser.email}`;
          break;
        case 'USER_REGISTERED':
          title = 'Nouvel utilisateur inscrit';
          description = `Inscription de ${randomUser.email}`;
          break;
        default:
          title = 'Activité système';
          description = 'Action système effectuée';
      }

      const activity = await prisma.activity.create({
        data: {
          type: randomType,
          title,
          description,
          metadata: JSON.stringify({
            userId: randomUser.id,
            campaignId: randomCampaign?.id,
            timestamp: new Date().toISOString()
          }),
          userId: randomUser.id,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Activités des 7 derniers jours
        }
      });
      activities.push(activity);
    }

    console.log(`✅ ${activities.length} activités créées`);

    // Créer des abonnements de test
    console.log('💳 Création des abonnements...');
    const subscriptionPlans = ['BASIC', 'PRO', 'ENTERPRISE'];
    
    for (let i = 0; i < 5; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomPlan = subscriptionPlans[Math.floor(Math.random() * subscriptionPlans.length)];
      
      await prisma.subscription.create({
        data: {
          plan: randomPlan,
          status: 'ACTIVE',
          startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          userId: randomUser.id
        }
      });
    }

    console.log('✅ Abonnements créés');

    console.log('');
    console.log('🎉 Données de test générées avec succès!');
    console.log(`📊 ${createdUsers.length} utilisateurs créés`);
    console.log(`📈 ${createdCampaigns.length} campagnes créées`);
    console.log(`📝 ${activities.length} activités créées`);
    console.log('');
    console.log('🔑 Identifiants de test:');
    console.log('   Email: john.doe@example.com');
    console.log('   Mot de passe: password123');
    console.log('');
    console.log('🌐 Accédez à: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Erreur lors de la génération des données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
seedTestData(); 