import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ width: string; height: string }> }
) {
  try {
    const { width: widthParam, height: heightParam } = await params;
    const width = parseInt(widthParam) || 100;
    const height = parseInt(heightParam) || 100;
    
    // Créer une image SVG placeholder simple
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="12" 
              fill="#9ca3af" text-anchor="middle" dy=".3em">
          ${width}x${height}
        </text>
      </svg>
    `;
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Erreur génération placeholder:', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
} 