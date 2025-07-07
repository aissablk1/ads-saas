// Tests de charge pour ADS SaaS avec k6
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Métriques personnalisées
export let errorRate = new Rate('errors');
export let responseTime = new Trend('response_time');
export let successfulRequests = new Counter('successful_requests');

// Configuration des tests
export let options = {
  // Test de montée en charge progressif
  stages: [
    { duration: '2m', target: 10 },    // Montée à 10 utilisateurs
    { duration: '5m', target: 10 },    // Maintien à 10 utilisateurs
    { duration: '2m', target: 50 },    // Montée à 50 utilisateurs
    { duration: '5m', target: 50 },    // Maintien à 50 utilisateurs
    { duration: '2m', target: 100 },   // Montée à 100 utilisateurs
    { duration: '5m', target: 100 },   // Maintien à 100 utilisateurs
    { duration: '2m', target: 0 },     // Redescente à 0
  ],
  
  // Seuils de performance
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% des requêtes sous 2s
    'http_req_failed': ['rate<0.05'],    // Moins de 5% d'erreurs
    'errors': ['rate<0.05'],             // Moins de 5% d'erreurs custom
  },
};

// URLs à tester
const BASE_URL = __ENV.BASE_URL || 'https://ads-saas.com';
const API_URL = __ENV.API_URL || 'https://ads-saas.com/api';

// Données de test
const TEST_USERS = [
  { email: 'test1@example.com', password: 'TestPassword123!' },
  { email: 'test2@example.com', password: 'TestPassword123!' },
  { email: 'test3@example.com', password: 'TestPassword123!' },
];

// Headers communs
const headers = {
  'Content-Type': 'application/json',
  'User-Agent': 'k6-load-test/1.0',
};

// Fonction principale du test
export default function() {
  let user = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
  let authToken = null;

  // 1. Test de la page d'accueil
  testHomePage();
  
  // 2. Test d'authentification
  authToken = testAuthentication(user);
  
  // 3. Test des pages dashboard (si authentifié)
  if (authToken) {
    testDashboard(authToken);
    testCampaigns(authToken);
    testAnalytics(authToken);
  }
  
  // 4. Test des APIs publiques
  testPublicAPIs();
  
  // Pause entre les itérations
  sleep(Math.random() * 2 + 1); // 1-3 secondes
}

function testHomePage() {
  let response = http.get(`${BASE_URL}/`, { headers });
  
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in < 2s': (r) => r.timings.duration < 2000,
    'homepage contains title': (r) => r.body.includes('ADS SaaS'),
  });
  
  recordMetrics(response, 'homepage');
}

function testAuthentication(user) {
  // Test de la page de connexion
  let loginPageResponse = http.get(`${BASE_URL}/login`, { headers });
  
  check(loginPageResponse, {
    'login page status is 200': (r) => r.status === 200,
    'login page loads quickly': (r) => r.timings.duration < 1500,
  });
  
  // Test de l'API de connexion
  let loginData = {
    email: user.email,
    password: user.password,
  };
  
  let loginResponse = http.post(
    `${API_URL}/auth/login`,
    JSON.stringify(loginData),
    { headers }
  );
  
  let success = check(loginResponse, {
    'login API status is 200': (r) => r.status === 200,
    'login API responds quickly': (r) => r.timings.duration < 1000,
    'login API returns token': (r) => {
      try {
        let data = JSON.parse(r.body);
        return data.accessToken !== undefined;
      } catch (e) {
        return false;
      }
    },
  });
  
  recordMetrics(loginResponse, 'login_api');
  
  if (success && loginResponse.status === 200) {
    try {
      let data = JSON.parse(loginResponse.body);
      return data.accessToken;
    } catch (e) {
      return null;
    }
  }
  
  return null;
}

function testDashboard(authToken) {
  let authHeaders = {
    ...headers,
    'Authorization': `Bearer ${authToken}`,
  };
  
  // Test du dashboard principal
  let dashboardResponse = http.get(`${BASE_URL}/dashboard`, {
    headers: authHeaders
  });
  
  check(dashboardResponse, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard loads quickly': (r) => r.timings.duration < 2000,
    'dashboard shows user data': (r) => r.body.includes('Tableau de bord'),
  });
  
  recordMetrics(dashboardResponse, 'dashboard');
}

function testCampaigns(authToken) {
  let authHeaders = {
    ...headers,
    'Authorization': `Bearer ${authToken}`,
  };
  
  // Test de la liste des campagnes
  let campaignsResponse = http.get(`${API_URL}/campaigns`, {
    headers: authHeaders
  });
  
  check(campaignsResponse, {
    'campaigns API status is 200': (r) => r.status === 200,
    'campaigns API responds quickly': (r) => r.timings.duration < 1500,
  });
  
  recordMetrics(campaignsResponse, 'campaigns_api');
  
  // Test de création d'une campagne (simulation)
  let newCampaign = {
    name: `Test Campaign ${Date.now()}`,
    budget: 1000,
    status: 'draft',
  };
  
  let createResponse = http.post(
    `${API_URL}/campaigns`,
    JSON.stringify(newCampaign),
    { headers: authHeaders }
  );
  
  check(createResponse, {
    'campaign creation status is 201': (r) => r.status === 201 || r.status === 200,
    'campaign creation responds quickly': (r) => r.timings.duration < 2000,
  });
  
  recordMetrics(createResponse, 'campaign_creation');
}

function testAnalytics(authToken) {
  let authHeaders = {
    ...headers,
    'Authorization': `Bearer ${authToken}`,
  };
  
  // Test des analytics
  let analyticsResponse = http.get(`${API_URL}/analytics/dashboard`, {
    headers: authHeaders
  });
  
  check(analyticsResponse, {
    'analytics API status is 200': (r) => r.status === 200,
    'analytics API responds quickly': (r) => r.timings.duration < 2000,
  });
  
  recordMetrics(analyticsResponse, 'analytics_api');
}

function testPublicAPIs() {
  // Test de l'API de santé
  let healthResponse = http.get(`${API_URL}/health`, { headers });
  
  check(healthResponse, {
    'health API status is 200': (r) => r.status === 200,
    'health API responds very quickly': (r) => r.timings.duration < 500,
    'health API returns OK': (r) => r.body.includes('OK') || r.body.includes('healthy'),
  });
  
  recordMetrics(healthResponse, 'health_api');
  
  // Test des pages légales
  let privacyResponse = http.get(`${BASE_URL}/privacy`, { headers });
  
  check(privacyResponse, {
    'privacy page status is 200': (r) => r.status === 200,
    'privacy page loads quickly': (r) => r.timings.duration < 1500,
  });
  
  recordMetrics(privacyResponse, 'privacy_page');
}

function recordMetrics(response, endpoint) {
  // Enregistrer le temps de réponse
  responseTime.add(response.timings.duration, { endpoint: endpoint });
  
  // Enregistrer les erreurs
  let isError = response.status >= 400;
  errorRate.add(isError, { endpoint: endpoint });
  
  // Enregistrer les succès
  if (!isError) {
    successfulRequests.add(1, { endpoint: endpoint });
  }
}

// Fonction exécutée à la fin du test
export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = '\n' + indent + '📊 RÉSULTATS DES TESTS DE CHARGE\n';
  summary += indent + '=====================================\n\n';
  
  // Statistiques générales
  summary += indent + '📈 Statistiques générales:\n';
  summary += indent + `  • Requêtes totales: ${data.metrics.http_reqs.values.count}\n`;
  summary += indent + `  • Requêtes/sec: ${data.metrics.http_reqs.values.rate.toFixed(2)}\n`;
  summary += indent + `  • Durée du test: ${(data.state.testRunDurationMs / 1000).toFixed(1)}s\n\n`;
  
  // Temps de réponse
  summary += indent + '⏱️ Temps de réponse:\n';
  summary += indent + `  • Moyen: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += indent + `  • 95e percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += indent + `  • Maximum: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n\n`;
  
  // Taux d'erreur
  summary += indent + '❌ Taux d\'erreur:\n';
  summary += indent + `  • Requêtes échouées: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
  summary += indent + `  • Erreurs custom: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%\n\n`;
  
  // Verdict
  let verdict = '✅ SUCCÈS';
  if (data.metrics.http_req_failed.values.rate > 0.05 || 
      data.metrics['http_req_duration'].values['p(95)'] > 2000) {
    verdict = '❌ ÉCHEC';
  }
  
  summary += indent + `🎯 Verdict: ${verdict}\n`;
  
  return summary;
} 