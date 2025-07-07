// Configuration SSL pour ADS SaaS
const fs = require('fs');
const path = require('path');

const sslConfig = {
  key: fs.readFileSync(path.join(__dirname, 'private/localhost.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs/localhost.crt')),
  ca: fs.readFileSync(path.join(__dirname, 'certs/localhost.crt')) // Auto-signé
};

module.exports = sslConfig;
