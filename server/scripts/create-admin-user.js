const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 Création de l\'utilisateur administrateur...');

    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (existingAdmin) {
      console.log('⚠️  Un administrateur existe déjà:', existingAdmin.email);
      console.log('Pour créer un nouvel admin, supprimez d\'abord l\'existant ou modifiez le script.');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('ADS2024Secure!', 12);

    // Créer l'utilisateur admin
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@ads-saas.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        twoFactorEnabled: false
      }
    });

    console.log('✅ Administrateur créé avec succès!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Mot de passe: ADS2024Secure!');
    console.log('🆔 ID:', adminUser.id);
    console.log('');
    console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion!');
    console.log('🌐 Accédez à: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
createAdminUser(); 