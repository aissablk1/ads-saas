const express = require('express');
const app = express();
const PORT = 8000;

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur de test fonctionne',
    timestamp: new Date().toISOString()
  });
});

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test simple réussi',
    port: PORT
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur de test démarré sur le port ${PORT}`);
  console.log(`🏥 Test: http://localhost:${PORT}/health`);
}); 