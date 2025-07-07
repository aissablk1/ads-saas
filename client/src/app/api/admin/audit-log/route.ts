import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface AuditLogEntry {
  id: string
  userId: string
  sessionId: string
  action: string
  details: any
  ipAddress?: string
  userAgent?: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// Stockage temporaire en mémoire (en production, utiliser une base de données)
let auditLogs: AuditLogEntry[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, details, severity = 'medium' } = body

    // Vérifier l'authentification
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('adminToken')?.value
    const adminUser = cookieStore.get('adminUser')?.value

    if (!adminToken || !adminUser) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    try {
      const tokenData = JSON.parse(Buffer.from(adminToken, 'base64').toString())
      const user = JSON.parse(decodeURIComponent(adminUser))

      if (tokenData.expiresAt < Date.now()) {
        return NextResponse.json(
          { error: 'Session expirée' },
          { status: 401 }
        )
      }

      // Créer l'entrée d'audit
      const auditEntry: AuditLogEntry = {
        id: crypto.randomUUID(),
        userId: user.id,
        sessionId: tokenData.sessionId,
        action,
        details,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        severity
      }

      // Ajouter au log
      auditLogs.push(auditEntry)

      // Limiter la taille du log (garder les 1000 dernières entrées)
      if (auditLogs.length > 1000) {
        auditLogs = auditLogs.slice(-1000)
      }

      console.log('🔍 Audit Log:', {
        action,
        userId: user.id,
        sessionId: tokenData.sessionId,
        timestamp: auditEntry.timestamp
      })

      return NextResponse.json({
        success: true,
        auditId: auditEntry.id
      })

    } catch (parseError) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Erreur audit log:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('adminToken')?.value
    const adminUser = cookieStore.get('adminUser')?.value

    if (!adminToken || !adminUser) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    try {
      const tokenData = JSON.parse(Buffer.from(adminToken, 'base64').toString())
      const user = JSON.parse(decodeURIComponent(adminUser))

      if (tokenData.expiresAt < Date.now()) {
        return NextResponse.json(
          { error: 'Session expirée' },
          { status: 401 }
        )
      }

      // Récupérer les paramètres de filtrage
      const { searchParams } = new URL(request.url)
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')
      const severity = searchParams.get('severity')
      const action = searchParams.get('action')

      // Filtrer les logs
      let filteredLogs = auditLogs

      if (severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === severity)
      }

      if (action) {
        filteredLogs = filteredLogs.filter(log => log.action.includes(action))
      }

      // Paginer les résultats
      const paginatedLogs = filteredLogs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(offset, offset + limit)

      return NextResponse.json({
        logs: paginatedLogs,
        total: filteredLogs.length,
        limit,
        offset
      })

    } catch (parseError) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Erreur récupération audit log:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 