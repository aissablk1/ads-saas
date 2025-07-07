import { Kernel } from '@adonisjs/core/build/standalone'

export default class AppKernel extends Kernel {
  protected middleware = [
    () => import('@adonisjs/core/bodyparser_middleware'),
    () => import('@adonisjs/session/session_middleware'),
    () => import('@adonisjs/auth/initialize_auth_middleware'),
    () => import('@adonisjs/shield/shield_middleware'),
    () => import('@adonisjs/cors/cors_middleware'),
    () => import('@adonisjs/limiter/limiter_middleware'),
  ]

  protected middlewareGroups = {
    web: [
      () => import('@adonisjs/core/bodyparser_middleware'),
      () => import('@adonisjs/session/session_middleware'),
      () => import('@adonisjs/auth/initialize_auth_middleware'),
      () => import('@adonisjs/shield/shield_middleware'),
      () => import('@adonisjs/cors/cors_middleware'),
    ],
    api: [
      () => import('@adonisjs/core/bodyparser_middleware'),
      () => import('@adonisjs/auth/initialize_auth_middleware'),
      () => import('@adonisjs/shield/shield_middleware'),
      () => import('@adonisjs/cors/cors_middleware'),
      () => import('@adonisjs/limiter/limiter_middleware'),
    ],
  }
} 