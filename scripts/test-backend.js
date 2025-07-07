const axios = require('axios');

const BASE_URL = 'http://localhost:8000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'test123456';

async function testBackend() {
  console.log('🧪 Test du backend ADS SaaS...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Test du health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check réussi:', healthResponse.data);
    console.log('');

    // Test 2: API docs
    console.log('2️⃣ Test de la documentation API...');
    const docsResponse = await axios.get(`${BASE_URL}/api/docs`);
    console.log('✅ Documentation API accessible');
    console.log('');

    // Test 3: Route de test d'authentification
    console.log('3️⃣ Test de la route de test d\'authentification...');
    const authTestResponse = await axios.get(`${BASE_URL}/api/auth/test`);
    console.log('✅ Route de test d\'authentification:', authTestResponse.data);
    console.log('');

    // Test 4: Inscription d'un utilisateur de test
    console.log('4️⃣ Test d\'inscription d\'utilisateur...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      firstName: 'Test',
      lastName: 'User'
    });
    console.log('✅ Inscription réussie:', {
      userId: registerResponse.data.user.id,
      email: registerResponse.data.user.email,
      hasToken: !!registerResponse.data.accessToken
    });
    console.log('');

    // Test 5: Connexion avec l'utilisateur créé
    console.log('5️⃣ Test de connexion...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    console.log('✅ Connexion réussie:', {
      userId: loginResponse.data.user.id,
      email: loginResponse.data.user.email,
      hasToken: !!loginResponse.data.accessToken
    });
    console.log('');

    // Test 6: Vérification du token
    console.log('6️⃣ Test de vérification du token...');
    const token = loginResponse.data.accessToken;
    const verifyResponse = await axios.get(`${BASE_URL}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Vérification du token réussie:', {
      valid: verifyResponse.data.valid,
      userId: verifyResponse.data.user.id
    });
    console.log('');

    // Test 7: Test d'une route protégée
    console.log('7️⃣ Test d\'une route protégée...');
    const userResponse = await axios.get(`${BASE_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Route protégée accessible:', {
      userId: userResponse.data.id,
      email: userResponse.data.email
    });
    console.log('');

    console.log('🎉 Tous les tests sont passés avec succès !');
    console.log('');
    console.log('📋 Résumé:');
    console.log('   ✅ Health check fonctionnel');
    console.log('   ✅ Documentation API accessible');
    console.log('   ✅ Authentification fonctionnelle');
    console.log('   ✅ Inscription/Connexion opérationnelles');
    console.log('   ✅ Tokens JWT valides');
    console.log('   ✅ Routes protégées accessibles');
    console.log('');
    console.log('🌐 URLs d\'accès:');
    console.log(`   🏥 Health: ${BASE_URL}/health`);
    console.log(`   📖 API Docs: ${BASE_URL}/api/docs`);
    console.log(`   🔐 Auth Test: ${BASE_URL}/api/auth/test`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    
    if (error.response) {
      console.error('📊 Détails de l\'erreur:');
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
      console.error('   URL:', error.response.config.url);
    }
    
    console.log('');
    console.log('🔧 Suggestions de dépannage:');
    console.log('   1. Vérifiez que le serveur est démarré sur le port 8000');
    console.log('   2. Vérifiez les logs du serveur avec: ./run.sh logs-server');
    console.log('   3. Vérifiez la base de données avec: ./run.sh init-database');
    console.log('   4. Redémarrez le serveur avec: ./run.sh restart-server');
    
    process.exit(1);
  }
}

// Exécuter le test
testBackend(); 