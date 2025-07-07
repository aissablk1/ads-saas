import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, userId } = body

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Données de session manquantes' },
        { status: 400 }
      )
    }

    // Récupérer les cookies de session
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('adminToken')?.value
    const adminUser = cookieStore.get('adminUser')?.value

    if (!adminToken || !adminUser) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 401 }
      )
    }

    try {
      // Vérifier la validité du token
      const tokenData = JSON.parse(Buffer.from(adminToken, 'base64').toString())
      
      if (tokenData.expiresAt < Date.now()) {
        return NextResponse.json(
          { error: 'Session expirée' },
          { status: 401 }
        )
      }

      // Vérifier la cohérence de la session
      const user = JSON.parse(decodeURIComponent(adminUser))
      
      if (user.id !== userId || user.sessionId !== sessionId) {
        return NextResponse.json(
          { error: 'Session invalide' },
          { status: 401 }
        )
      }

      // Vérifier le rôle utilisateur
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Permissions insuffisantes' },
          { status: 403 }
        )
      }

      // Session valide
      return NextResponse.json({
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        },
        sessionExpiresAt: tokenData.expiresAt
      })

    } catch (parseError) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Erreur de vérification de session:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
} 