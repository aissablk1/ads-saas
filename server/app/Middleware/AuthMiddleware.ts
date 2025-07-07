import { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'

export default class AuthMiddleware {
  /**
   * Middleware d'authentification JWT
   */
  public async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    try {
      const token = request.header('Authorization')?.replace('Bearer ', '')
      
      if (!token) {
        return response.status(401).json({
          error: 'Token d\'authentification requis'
        })
      }

      // Vérifier le token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as any
      
      // Ajouter les informations utilisateur à la requête
      request.updateBody({
        ...request.body(),
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role
        }
      })

      await next()
    } catch (error) {
      console.error('Erreur authentification:', error)
      return response.status(401).json({
        error: 'Token invalide'
      })
    }
  }
}

/**
 * Middleware pour vérifier les rôles
 */
export class RoleMiddleware {
  public async handle({ request, response }: HttpContext, next: () => Promise<void>, guards: string[]) {
    try {
      const user = request.body().user
      
      if (!user) {
        return response.status(401).json({
          error: 'Utilisateur non authentifié'
        })
      }

      // Vérifier si l'utilisateur a le rôle requis
      if (guards.length > 0 && !guards.includes(user.role)) {
        return response.status(403).json({
          error: 'Accès refusé'
        })
      }

      await next()
    } catch (error) {
      console.error('Erreur vérification rôle:', error)
      return response.status(500).json({
        error: 'Erreur serveur'
      })
    }
  }
}

/**
 * Middleware pour vérifier les permissions admin
 */
export class AdminMiddleware {
  public async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    try {
      const user = request.body().user
      
      if (!user) {
        return response.status(401).json({
          error: 'Utilisateur non authentifié'
        })
      }

      // Vérifier si l'utilisateur est admin
      if (user.role !== 'ADMIN') {
        return response.status(403).json({
          error: 'Accès administrateur requis'
        })
      }

      await next()
    } catch (error) {
      console.error('Erreur vérification admin:', error)
      return response.status(500).json({
        error: 'Erreur serveur'
      })
    }
  }
} 