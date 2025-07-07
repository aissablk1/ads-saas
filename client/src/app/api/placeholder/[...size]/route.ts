import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { size: string[] } }
) {
  try {
    // Gérer le format "40/40" ou "300/200"
    const sizeParam = params.size.join('/')
    const [width, height] = sizeParam.split('/').map(Number)
    
    if (!width || !height || width > 1000 || height > 1000) {
      return new NextResponse('Invalid size', { status: 400 })
    }

    // Générer une image SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 8}" 
              fill="white" text-anchor="middle" dy=".3em">
          ${width}×${height}
        </text>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Erreur génération placeholder:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 