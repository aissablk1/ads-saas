import { Router } from '@adonisjs/core/http'

const router = Router.create()

// Routes d'authentification
router.group(() => {
  router.post('/register', '#controllers/auth_controller.register')
  router.post('/login', '#controllers/auth_controller.login')
  router.post('/logout', '#controllers/auth_controller.logout')
  router.post('/refresh', '#controllers/auth_controller.refresh')
  router.post('/forgot-password', '#controllers/auth_controller.forgotPassword')
  router.post('/reset-password', '#controllers/auth_controller.resetPassword')
  router.post('/verify-email', '#controllers/auth_controller.verifyEmail')
  
  // Routes 2FA
  router.group(() => {
    router.post('/setup', '#controllers/auth_controller.setup2FA')
    router.post('/verify', '#controllers/auth_controller.verify2FA')
    router.post('/disable', '#controllers/auth_controller.disable2FA')
    router.get('/status', '#controllers/auth_controller.get2FAStatus')
  }).prefix('/2fa')
}).prefix('/api/auth')

// Routes utilisateurs
router.group(() => {
  router.get('/', '#controllers/users_controller.index')
  router.get('/:id', '#controllers/users_controller.show')
  router.put('/:id', '#controllers/users_controller.update')
  router.delete('/:id', '#controllers/users_controller.destroy')
  router.post('/invite', '#controllers/users_controller.invite')
  router.post('/:id/role', '#controllers/users_controller.updateRole')
}).prefix('/api/users').middleware('auth')

// Routes campagnes
router.group(() => {
  router.get('/', '#controllers/campaigns_controller.index')
  router.post('/', '#controllers/campaigns_controller.store')
  router.get('/:id', '#controllers/campaigns_controller.show')
  router.put('/:id', '#controllers/campaigns_controller.update')
  router.delete('/:id', '#controllers/campaigns_controller.destroy')
  router.post('/:id/activate', '#controllers/campaigns_controller.activate')
  router.post('/:id/pause', '#controllers/campaigns_controller.pause')
}).prefix('/api/campaigns').middleware('auth')

// Routes analytics
router.group(() => {
  router.get('/dashboard', '#controllers/analytics_controller.dashboard')
  router.get('/campaigns/:id', '#controllers/analytics_controller.campaignAnalytics')
  router.get('/reports', '#controllers/analytics_controller.reports')
  router.post('/export', '#controllers/analytics_controller.export')
}).prefix('/api/analytics').middleware('auth')

// Routes admin
router.group(() => {
  router.post('/login', '#controllers/admin_controller.login')
  router.get('/verify-session', '#controllers/admin_controller.verifySession')
  router.get('/users', '#controllers/admin_controller.users')
  router.post('/users', '#controllers/admin_controller.createUser')
  router.put('/users/:id', '#controllers/admin_controller.updateUser')
  router.delete('/users/:id', '#controllers/admin_controller.deleteUser')
  router.get('/system/status', '#controllers/admin_controller.systemStatus')
  router.get('/audit-log', '#controllers/admin_controller.auditLog')
}).prefix('/api/admin')

// Routes intégrations
router.group(() => {
  router.get('/', '#controllers/integrations_controller.index')
  router.post('/', '#controllers/integrations_controller.store')
  router.get('/:id', '#controllers/integrations_controller.show')
  router.put('/:id', '#controllers/integrations_controller.update')
  router.delete('/:id', '#controllers/integrations_controller.destroy')
  router.post('/:id/test', '#controllers/integrations_controller.test')
}).prefix('/api/integrations').middleware('auth')

// Routes notifications
router.group(() => {
  router.get('/', '#controllers/notifications_controller.index')
  router.post('/mark-read', '#controllers/notifications_controller.markAsRead')
  router.delete('/:id', '#controllers/notifications_controller.destroy')
}).prefix('/api/notifications').middleware('auth')

// Routes fichiers
router.group(() => {
  router.post('/upload', '#controllers/files_controller.upload')
  router.get('/:id', '#controllers/files_controller.show')
  router.delete('/:id', '#controllers/files_controller.destroy')
}).prefix('/api/files').middleware('auth')

// Routes publiques
router.get('/health', '#controllers/health_controller.index')
router.get('/api/env', '#controllers/env_controller.index')

export default router 