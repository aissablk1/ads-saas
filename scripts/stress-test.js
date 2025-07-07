const axios = require('axios');
const { performance } = require('perf_hooks');

// Configuration des tests de charge
const TEST_CONFIG = {
  baseURL: process.env.API_URL || 'http://localhost:8000',
  concurrent: parseInt(process.env.CONCURRENT_USERS) || 10,
  duration: parseInt(process.env.TEST_DURATION) || 60, // secondes
  rampUp: parseInt(process.env.RAMP_UP) || 10, // secondes
  endpoints: [
    { path: '/health', method: 'GET', weight: 5 },
    { path: '/api/docs', method: 'GET', weight: 3 },
    { path: '/api/auth/login', method: 'POST', weight: 2, body: { email: 'test@example.com', password: 'password123' } }
  ]
};

// Métriques globales
const metrics = {
  requests: 0,
  responses: 0,
  errors: 0,
  timeouts: 0,
  responseTimes: [],
  startTime: null,
  endTime: null,
  statusCodes: {},
  errorTypes: {}
};

// Fonction utilitaire pour générer des données aléatoires
function generateRandomUser() {
  const randomId = Math.random().toString(36).substring(7);
  return {
    email: `test${randomId}@loadtest.com`,
    password: 'LoadTest123!',
    firstName: `Test${randomId}`,
    lastName: 'User'
  };
}

// Fonction pour effectuer une requête
async function makeRequest(endpoint, userToken = null) {
  const startTime = performance.now();
  
  try {
    const config = {
      method: endpoint.method,
      url: `${TEST_CONFIG.baseURL}${endpoint.path}`,
      timeout: 10000,
      headers: {}
    };

    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    if (endpoint.body) {
      config.data = endpoint.body;
      config.headers['Content-Type'] = 'application/json';
    }

    metrics.requests++;
    const response = await axios(config);
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    metrics.responses++;
    metrics.responseTimes.push(responseTime);
    
    const statusCode = response.status;
    metrics.statusCodes[statusCode] = (metrics.statusCodes[statusCode] || 0) + 1;
    
    return { success: true, responseTime, statusCode };
    
  } catch (error) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    metrics.errors++;
    
    if (error.code === 'ECONNABORTED') {
      metrics.timeouts++;
      metrics.errorTypes['timeout'] = (metrics.errorTypes['timeout'] || 0) + 1;
    } else if (error.response) {
      const statusCode = error.response.status;
      metrics.statusCodes[statusCode] = (metrics.statusCodes[statusCode] || 0) + 1;
      metrics.errorTypes[`http_${statusCode}`] = (metrics.errorTypes[`http_${statusCode}`] || 0) + 1;
    } else {
      metrics.errorTypes['network'] = (metrics.errorTypes['network'] || 0) + 1;
    }
    
    return { success: false, responseTime, error: error.message };
  }
}

// Fonction pour simuler un utilisateur
async function simulateUser(userId) {
  console.log(`👤 Utilisateur ${userId} démarré`);
  
  // Optionnel: Créer un compte et se connecter
  let userToken = null;
  try {
    const userData = generateRandomUser();
    await makeRequest({
      path: '/api/auth/register',
      method: 'POST',
      body: userData
    });
    
    const loginResponse = await makeRequest({
      path: '/api/auth/login',
      method: 'POST',
      body: { email: userData.email, password: userData.password }
    });
    
    if (loginResponse.success) {
      // userToken serait extrait de la réponse dans un vrai test
      console.log(`✅ Utilisateur ${userId} connecté`);
    }
  } catch (error) {
    console.log(`⚠️ Utilisateur ${userId} - Erreur connexion: ${error.message}`);
  }
  
  // Boucle principale de test
  const endTime = Date.now() + (TEST_CONFIG.duration * 1000);
  
  while (Date.now() < endTime) {
    // Sélectionner un endpoint aléatoire selon le poids
    const totalWeight = TEST_CONFIG.endpoints.reduce((sum, ep) => sum + ep.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedEndpoint = TEST_CONFIG.endpoints[0];
    
    for (const endpoint of TEST_CONFIG.endpoints) {
      random -= endpoint.weight;
      if (random <= 0) {
        selectedEndpoint = endpoint;
        break;
      }
    }
    
    await makeRequest(selectedEndpoint, userToken);
    
    // Délai aléatoire entre les requêtes (1-3 secondes)
    const delay = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  console.log(`👤 Utilisateur ${userId} terminé`);
}

// Fonction pour calculer les statistiques
function calculateStats() {
  const duration = (metrics.endTime - metrics.startTime) / 1000;
  const rps = metrics.responses / duration;
  
  metrics.responseTimes.sort((a, b) => a - b);
  const count = metrics.responseTimes.length;
  
  return {
    duration: duration.toFixed(2),
    totalRequests: metrics.requests,
    totalResponses: metrics.responses,
    totalErrors: metrics.errors,
    errorRate: ((metrics.errors / metrics.requests) * 100).toFixed(2),
    requestsPerSecond: rps.toFixed(2),
    averageResponseTime: count > 0 ? (metrics.responseTimes.reduce((a, b) => a + b, 0) / count).toFixed(2) : 0,
    minResponseTime: count > 0 ? metrics.responseTimes[0].toFixed(2) : 0,
    maxResponseTime: count > 0 ? metrics.responseTimes[count - 1].toFixed(2) : 0,
    p50: count > 0 ? metrics.responseTimes[Math.floor(count * 0.5)].toFixed(2) : 0,
    p95: count > 0 ? metrics.responseTimes[Math.floor(count * 0.95)].toFixed(2) : 0,
    p99: count > 0 ? metrics.responseTimes[Math.floor(count * 0.99)].toFixed(2) : 0,
    statusCodes: metrics.statusCodes,
    errorTypes: metrics.errorTypes
  };
}

// Fonction principale de test
async function runLoadTest() {
  console.log('🚀 Démarrage du test de charge...');
  console.log(`📊 Configuration:`);
  console.log(`   - URL: ${TEST_CONFIG.baseURL}`);
  console.log(`   - Utilisateurs simultanés: ${TEST_CONFIG.concurrent}`);
  console.log(`   - Durée: ${TEST_CONFIG.duration}s`);
  console.log(`   - Montée en charge: ${TEST_CONFIG.rampUp}s`);
  console.log('');
  
  metrics.startTime = performance.now();
  
  // Démarrage progressif des utilisateurs
  const users = [];
  for (let i = 0; i < TEST_CONFIG.concurrent; i++) {
    const delay = (i * TEST_CONFIG.rampUp * 1000) / TEST_CONFIG.concurrent;
    
    setTimeout(() => {
      const userPromise = simulateUser(i + 1);
      users.push(userPromise);
    }, delay);
  }
  
  // Attente que tous les utilisateurs terminent
  setTimeout(async () => {
    await Promise.all(users);
    
    metrics.endTime = performance.now();
    
    // Affichage des résultats
    console.log('\n📊 RÉSULTATS DU TEST DE CHARGE');
    console.log('=====================================');
    
    const stats = calculateStats();
    
    console.log(`⏱️  Durée totale: ${stats.duration}s`);
    console.log(`📨 Requêtes totales: ${stats.totalRequests}`);
    console.log(`✅ Réponses reçues: ${stats.totalResponses}`);
    console.log(`❌ Erreurs: ${stats.totalErrors} (${stats.errorRate}%)`);
    console.log(`🔄 Requêtes/seconde: ${stats.requestsPerSecond}`);
    console.log('');
    
    console.log('⏱️  TEMPS DE RÉPONSE:');
    console.log(`   - Moyenne: ${stats.averageResponseTime}ms`);
    console.log(`   - Min: ${stats.minResponseTime}ms`);
    console.log(`   - Max: ${stats.maxResponseTime}ms`);
    console.log(`   - P50: ${stats.p50}ms`);
    console.log(`   - P95: ${stats.p95}ms`);
    console.log(`   - P99: ${stats.p99}ms`);
    console.log('');
    
    console.log('📊 CODES DE STATUT:');
    Object.entries(stats.statusCodes).forEach(([code, count]) => {
      console.log(`   - ${code}: ${count}`);
    });
    
    if (Object.keys(stats.errorTypes).length > 0) {
      console.log('');
      console.log('❌ TYPES D\'ERREURS:');
      Object.entries(stats.errorTypes).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count}`);
      });
    }
    
    // Évaluation des performances
    console.log('\n🎯 ÉVALUATION:');
    if (parseFloat(stats.errorRate) < 1) {
      console.log('✅ Taux d\'erreur acceptable (< 1%)');
    } else {
      console.log('⚠️ Taux d\'erreur élevé (> 1%)');
    }
    
    if (parseFloat(stats.p95) < 1000) {
      console.log('✅ Performance acceptable (P95 < 1s)');
    } else {
      console.log('⚠️ Performance dégradée (P95 > 1s)');
    }
    
    if (parseFloat(stats.requestsPerSecond) > 50) {
      console.log('✅ Débit satisfaisant (> 50 req/s)');
    } else {
      console.log('⚠️ Débit faible (< 50 req/s)');
    }
    
    process.exit(0);
  }, (TEST_CONFIG.duration + TEST_CONFIG.rampUp + 5) * 1000);
}

// Gestion des signaux
process.on('SIGINT', () => {
  console.log('\n⏹️ Test interrompu par l\'utilisateur');
  if (metrics.startTime) {
    metrics.endTime = performance.now();
    const stats = calculateStats();
    console.log(`📊 Statistiques partielles: ${stats.totalRequests} requêtes, ${stats.errorRate}% erreurs`);
  }
  process.exit(0);
});

// Démarrage du test
if (require.main === module) {
  runLoadTest().catch(console.error);
}

module.exports = { runLoadTest, calculateStats }; 