const https = require('https');
const fs = require('fs');
const path = require('path');

const options = {
  key: fs.readFileSync(path.join(__dirname, 'private/localhost.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs/localhost.crt'))
};

const server = https.createServer(options, (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>ADS SaaS - HTTPS Test</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .success { color: #27ae60; font-weight: bold; }
            .info { background: #3498db; color: white; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔒 ADS SaaS - Test HTTPS</h1>
            <div class="success">✅ Connexion HTTPS sécurisée réussie !</div>
            <div class="info">
                <strong>Informations SSL :</strong><br>
                Certificat : Auto-signé<br>
                Validité : 365 jours<br>
                Domaine : localhost<br>
                Port : 8443
            </div>
            <p>Cette page confirme que votre configuration SSL fonctionne correctement.</p>
            <p><strong>Prochaine étape :</strong> Configurez votre application pour utiliser HTTPS.</p>
        </div>
    </body>
    </html>
  `);
});

const PORT = 8443;
server.listen(PORT, () => {
  console.log(`🔒 Serveur HTTPS démarré sur https://localhost:${PORT}`);
  console.log(`📋 Certificat: ${path.join(__dirname, 'certs/localhost.crt')}`);
  console.log(`🔑 Clé privée: ${path.join(__dirname, 'private/localhost.key')}`);
});
