import { ApplicationService } from '@adonisjs/core/types'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    // Register your own bindings
  }

  async boot() {
    // IoC container is ready
  }

  async start() {
    // App is ready
  }

  async shutdown() {
    // Cleanup, since app is going down
  }
} 