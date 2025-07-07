import router from '@adonisjs/core/services/router'

// Routes publiques
router.get('/', async ({ response }) => {
  return response.json({
    message: 'API AdonisJS intégrée parfaitement !',
    timestamp: new Date().toISOString(),
    framework: 'AdonisJS',
    version: '5.x',
    integration: 'perfect',
    features: [
      'Authentification JWT',
      'Gestion des utilisateurs',
      'Gestion des campagnes',
      'Analytics avancées',
      'Système d\'abonnements',
      'Intégrations tierces',
      'Notifications',
      'Administration complète'
    ]
  })
})

router.get('/health', async ({ response }) => {
  return response.json({
    status: 'healthy',
    service: 'adonisjs-backend',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    integration: 'perfect',
    timestamp: new Date().toISOString()
  })
})

// Routes d'authentification
router.group(() => {
  router.post('/login', 'AuthController.login')
  router.post('/register', 'AuthController.register')
  router.post('/logout', 'AuthController.logout')
  router.post('/refresh', 'AuthController.refresh')
  router.post('/2fa/enable', 'AuthController.enableTwoFactor')
  router.post('/2fa/verify', 'AuthController.verifyTwoFactor')
}).prefix('/auth')

// Routes utilisateurs (protégées)
router.group(() => {
  router.get('/me', 'UsersController.me')
  router.put('/me', 'UsersController.update')
  router.post('/change-password', 'UsersController.changePassword')
  router.get('/stats', 'UsersController.stats')
  router.get('/activities', 'UsersController.activities')
}).prefix('/users').use('auth')

// Routes campagnes (protégées)
router.group(() => {
  router.get('/', 'CampaignsController.index')
  router.post('/', 'CampaignsController.store')
  router.get('/:id', 'CampaignsController.show')
  router.put('/:id', 'CampaignsController.update')
  router.delete('/:id', 'CampaignsController.destroy')
  router.post('/:id/activate', 'CampaignsController.activate')
  router.post('/:id/deactivate', 'CampaignsController.deactivate')
  router.get('/:id/stats', 'CampaignsController.stats')
  router.post('/:id/duplicate', 'CampaignsController.duplicate')
}).prefix('/campaigns').use('auth')

// Routes analytics (protégées)
router.group(() => {
  router.get('/dashboard', 'AnalyticsController.dashboard')
  router.get('/campaigns', 'AnalyticsController.campaigns')
  router.get('/audience', 'AnalyticsController.audience')
  router.get('/reports', 'AnalyticsController.reports')
  router.post('/export', 'AnalyticsController.export')
  router.get('/alerts', 'AnalyticsController.alerts')
}).prefix('/analytics').use('auth')

// Routes d'abonnements (protégées)
router.group(() => {
  router.get('/', 'SubscriptionsController.index')
  router.post('/', 'SubscriptionsController.store')
  router.get('/:id', 'SubscriptionsController.show')
  router.put('/:id', 'SubscriptionsController.update')
  router.delete('/:id', 'SubscriptionsController.destroy')
  router.post('/:id/cancel', 'SubscriptionsController.cancel')
  router.post('/:id/reactivate', 'SubscriptionsController.reactivate')
  router.get('/:id/invoices', 'SubscriptionsController.invoices')
}).prefix('/subscriptions').use('auth')

// Routes d'intégrations (protégées)
router.group(() => {
  router.get('/', 'IntegrationsController.index')
  router.post('/', 'IntegrationsController.store')
  router.get('/:id', 'IntegrationsController.show')
  router.put('/:id', 'IntegrationsController.update')
  router.delete('/:id', 'IntegrationsController.destroy')
  router.post('/:id/connect', 'IntegrationsController.connect')
  router.post('/:id/disconnect', 'IntegrationsController.disconnect')
  router.get('/:id/sync', 'IntegrationsController.sync')
}).prefix('/integrations').use('auth')

// Routes de notifications (protégées)
router.group(() => {
  router.get('/', 'NotificationsController.index')
  router.post('/', 'NotificationsController.store')
  router.get('/:id', 'NotificationsController.show')
  router.put('/:id', 'NotificationsController.update')
  router.delete('/:id', 'NotificationsController.destroy')
  router.post('/:id/mark-read', 'NotificationsController.markAsRead')
  router.post('/:id/mark-unread', 'NotificationsController.markAsUnread')
  router.get('/unread/count', 'NotificationsController.unreadCount')
}).prefix('/notifications').use('auth')

// Routes de fichiers (protégées)
router.group(() => {
  router.get('/', 'FilesController.index')
  router.post('/upload', 'FilesController.upload')
  router.get('/:id', 'FilesController.show')
  router.put('/:id', 'FilesController.update')
  router.delete('/:id', 'FilesController.destroy')
  router.get('/:id/download', 'FilesController.download')
  router.post('/:id/share', 'FilesController.share')
}).prefix('/files').use('auth')

// Routes d'administration (admin seulement)
router.group(() => {
  router.get('/dashboard', 'AdminController.dashboard')
  router.get('/users', 'AdminController.users')
  router.get('/users/:id', 'AdminController.user')
  router.put('/users/:id', 'AdminController.updateUser')
  router.delete('/users/:id', 'AdminController.deleteUser')
  router.get('/campaigns', 'AdminController.campaigns')
  router.get('/analytics', 'AdminController.analytics')
  router.get('/subscriptions', 'AdminController.subscriptions')
  router.get('/system', 'AdminController.system')
  router.get('/logs', 'AdminController.logs')
  router.post('/maintenance', 'AdminController.maintenance')
}).prefix('/admin').use('admin')

// Routes de sitemap
router.get('/sitemap.xml', 'SitemapController.xml')
router.get('/sitemap.json', 'SitemapController.json')

// Routes d'environnement (pour le développement)
if (process.env.NODE_ENV === 'development') {
  router.group(() => {
    router.get('/', 'EnvController.index')
    router.get('/config', 'EnvController.config')
    router.get('/health', 'EnvController.health')
  }).prefix('/env')
}

// Routes API avec préfixe /adonis pour compatibilité
router.group(() => {
  router.get('/', async ({ response }) => {
    return response.json({
      message: 'API AdonisJS fonctionnelle !',
      timestamp: new Date().toISOString(),
      integration: 'perfect'
    })
  })
  
  router.get('/health', async ({ response }) => {
    return response.json({
      status: 'healthy',
      service: 'adonisjs-backend',
      integration: 'perfect'
    })
  })

  // Routes d'authentification AdonisJS
  router.group(() => {
    router.post('/login', 'AuthController.login')
    router.post('/register', 'AuthController.register')
    router.post('/logout', 'AuthController.logout')
  }).prefix('/auth')

  // Routes utilisateurs AdonisJS
  router.group(() => {
    router.get('/me', 'UsersController.me')
    router.put('/me', 'UsersController.update')
  }).prefix('/users').use('auth')

}).prefix('/adonis')

// Route de fallback pour les routes non trouvées
router.any('*', async ({ response }) => {
  return response.status(404).json({
    error: 'Route non trouvée',
    message: 'Cette route n\'existe pas dans l\'API AdonisJS',
    availableRoutes: [
      '/auth/login',
      '/auth/register',
      '/users/me',
      '/campaigns',
      '/analytics',
      '/subscriptions',
      '/integrations',
      '/notifications',
      '/files',
      '/admin/*'
    ]
  })
}) 