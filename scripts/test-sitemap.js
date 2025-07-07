#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { promisify } = require('util');

// Configuration
const config = {
  baseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:8000',
  timeout: 5000
};

// Fonction utilitaire pour faire des requêtes HTTP
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    
    const req = client.get(url, {
      timeout: config.timeout,
      headers: {
        'User-Agent': 'ADS-SaaS Sitemap Tester/1.0'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout dépassé'));
    });
  });
}

// Test du sitemap XML
async function testSitemapXml() {
  console.log('\n📄 Test du sitemap XML...');
  
  try {
    const response = await makeRequest(`${config.baseUrl}/sitemap.xml`);
    
    if (response.statusCode !== 200) {
      throw new Error(`Code de statut inattendu: ${response.statusCode}`);
    }
    
    // Vérifier que c'est du XML valide
    if (!response.headers['content-type']?.includes('xml')) {
      console.warn('⚠️  Le sitemap ne retourne pas un content-type XML');
    }
    
    // Vérifier la structure XML basique
    if (!response.data.includes('<urlset') || !response.data.includes('<url>')) {
      throw new Error('Structure XML du sitemap invalide');
    }
    
    // Compter les URLs
    const urlCount = (response.data.match(/<url>/g) || []).length;
    
    console.log('✅ Sitemap XML valide');
    console.log(`   - Taille: ${Math.round(response.data.length / 1024)} KB`);
    console.log(`   - Nombre d'URLs: ${urlCount}`);
    
    return { success: true, urlCount };
    
  } catch (error) {
    console.error('❌ Erreur sitemap XML:', error.message);
    return { success: false, error: error.message };
  }
}

// Test du robots.txt
async function testRobotsTxt() {
  console.log('\n🤖 Test du robots.txt...');
  
  try {
    const response = await makeRequest(`${config.baseUrl}/robots.txt`);
    
    if (response.statusCode !== 200) {
      throw new Error(`Code de statut inattendu: ${response.statusCode}`);
    }
    
    // Vérifier que le sitemap est mentionné
    if (!response.data.includes('sitemap.xml')) {
      console.warn('⚠️  Le robots.txt ne mentionne pas le sitemap');
    }
    
    // Vérifier les règles de base
    if (!response.data.includes('User-agent:')) {
      throw new Error('Robots.txt ne contient pas de règles User-agent');
    }
    
    console.log('✅ Robots.txt valide');
    console.log(`   - Taille: ${response.data.length} bytes`);
    
    const sitemapLines = response.data.split('\n').filter(line => 
      line.toLowerCase().includes('sitemap:')
    );
    
    if (sitemapLines.length > 0) {
      console.log(`   - Sitemaps déclarés: ${sitemapLines.length}`);
      sitemapLines.forEach(line => {
        console.log(`     ${line.trim()}`);
      });
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Erreur robots.txt:', error.message);
    return { success: false, error: error.message };
  }
}

// Test de l'API sitemap
async function testSitemapApi() {
  console.log('\n🔗 Test de l\'API sitemap...');
  
  try {
    // Test de l'endpoint /urls
    console.log('   Test de /api/sitemap/urls...');
    const urlsResponse = await makeRequest(`${config.apiUrl}/api/sitemap/urls`);
    
    if (urlsResponse.statusCode !== 200) {
      throw new Error(`Erreur API urls: ${urlsResponse.statusCode}`);
    }
    
    const urlsData = JSON.parse(urlsResponse.data);
    
    if (!urlsData.urls || !Array.isArray(urlsData.urls)) {
      throw new Error('Format de réponse invalide pour /urls');
    }
    
    console.log(`   ✅ API urls OK (${urlsData.urls.length} URLs)`);
    
    // Test de l'endpoint /status
    console.log('   Test de /api/sitemap/status...');
    const statusResponse = await makeRequest(`${config.apiUrl}/api/sitemap/status`);
    
    if (statusResponse.statusCode !== 200) {
      throw new Error(`Erreur API status: ${statusResponse.statusCode}`);
    }
    
    const statusData = JSON.parse(statusResponse.data);
    
    if (!statusData.totalUrls || !statusData.status) {
      throw new Error('Format de réponse invalide pour /status');
    }
    
    console.log(`   ✅ API status OK (${statusData.totalUrls} URLs, statut: ${statusData.status})`);
    
    return { 
      success: true, 
      urlsCount: urlsData.urls.length,
      totalUrls: statusData.totalUrls,
      status: statusData.status
    };
    
  } catch (error) {
    console.error('❌ Erreur API sitemap:', error.message);
    return { success: false, error: error.message };
  }
}

// Validation des URLs du sitemap
async function validateSitemapUrls(sampleSize = 5) {
  console.log('\n🔍 Validation des URLs du sitemap...');
  
  try {
    const response = await makeRequest(`${config.apiUrl}/api/sitemap/urls`);
    
    if (response.statusCode !== 200) {
      throw new Error('Impossible de récupérer les URLs');
    }
    
    const data = JSON.parse(response.data);
    const urls = data.urls || [];
    
    if (urls.length === 0) {
      console.warn('⚠️  Aucune URL à valider');
      return { success: true, tested: 0 };
    }
    
    // Prendre un échantillon d'URLs à tester
    const samplesToTest = urls.slice(0, Math.min(sampleSize, urls.length));
    let validUrls = 0;
    let invalidUrls = 0;
    
    console.log(`   Test de ${samplesToTest.length} URLs (échantillon)...`);
    
    for (const urlObj of samplesToTest) {
      try {
        // Vérifier que l'URL est valide
        new URL(urlObj.url);
        
        // Tester l'accessibilité (uniquement pour les URLs locales)
        if (urlObj.url.includes('localhost') || urlObj.url.includes(config.baseUrl)) {
          const testResponse = await makeRequest(urlObj.url);
          
          if (testResponse.statusCode >= 200 && testResponse.statusCode < 400) {
            validUrls++;
            console.log(`   ✅ ${urlObj.url} (${testResponse.statusCode})`);
          } else {
            invalidUrls++;
            console.log(`   ❌ ${urlObj.url} (${testResponse.statusCode})`);
          }
        } else {
          validUrls++;
          console.log(`   ✅ ${urlObj.url} (externe, non testé)`);
        }
      } catch (error) {
        invalidUrls++;
        console.log(`   ❌ ${urlObj.url} (erreur: ${error.message})`);
      }
    }
    
    console.log(`   Résultat: ${validUrls} valides, ${invalidUrls} invalides`);
    
    return { 
      success: true, 
      tested: samplesToTest.length,
      valid: validUrls,
      invalid: invalidUrls,
      totalUrls: urls.length
    };
    
  } catch (error) {
    console.error('❌ Erreur validation URLs:', error.message);
    return { success: false, error: error.message };
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Test du sitemap automatique ADS SaaS');
  console.log('=====================================');
  console.log(`Frontend: ${config.baseUrl}`);
  console.log(`Backend: ${config.apiUrl}`);
  
  const results = {
    sitemapXml: await testSitemapXml(),
    robotsTxt: await testRobotsTxt(),
    sitemapApi: await testSitemapApi(),
    urlValidation: await validateSitemapUrls(3)
  };
  
  // Résumé des résultats
  console.log('\n📊 Résumé des tests');
  console.log('==================');
  
  const tests = [
    { name: 'Sitemap XML', result: results.sitemapXml },
    { name: 'Robots.txt', result: results.robotsTxt },
    { name: 'API Sitemap', result: results.sitemapApi },
    { name: 'Validation URLs', result: results.urlValidation }
  ];
  
  let passedTests = 0;
  
  tests.forEach(test => {
    const status = test.result.success ? '✅' : '❌';
    console.log(`${status} ${test.name}`);
    if (test.result.success) passedTests++;
  });
  
  console.log(`\nRésultat global: ${passedTests}/${tests.length} tests réussis`);
  
  if (passedTests === tests.length) {
    console.log('🎉 Tous les tests sont réussis! Le sitemap fonctionne correctement.');
    process.exit(0);
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez la configuration.');
    process.exit(1);
  }
}

// Gestion des arguments de ligne de commande
if (process.argv.includes('--help')) {
  console.log(`
Usage: node test-sitemap.js [options]

Options:
  --help          Affiche cette aide
  --base-url      URL de base du frontend (défaut: http://localhost:3000)
  --api-url       URL de l'API backend (défaut: http://localhost:8000)

Variables d'environnement:
  FRONTEND_URL    URL du frontend
  API_URL         URL de l'API

Exemples:
  node test-sitemap.js
  node test-sitemap.js --base-url https://ads-saas.com --api-url https://api.ads-saas.com
  FRONTEND_URL=https://ads-saas.com API_URL=https://api.ads-saas.com node test-sitemap.js
`);
  process.exit(0);
}

// Traitement des arguments
const baseUrlIndex = process.argv.indexOf('--base-url');
if (baseUrlIndex !== -1 && process.argv[baseUrlIndex + 1]) {
  config.baseUrl = process.argv[baseUrlIndex + 1];
}

const apiUrlIndex = process.argv.indexOf('--api-url');
if (apiUrlIndex !== -1 && process.argv[apiUrlIndex + 1]) {
  config.apiUrl = process.argv[apiUrlIndex + 1];
}

// Exécution
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
} 