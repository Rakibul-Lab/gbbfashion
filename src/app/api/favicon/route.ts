import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getSiteSettings } from '@/lib/site-settings'
import { mimeFromUrl } from '@/lib/site-settings-client'

/** Serves the current site logo as the favicon (never falls back to a foreign brand mark first). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const preferred = searchParams.get('v')

    const settings = await getSiteSettings()
    const candidates = [
      preferred || '',
      settings.logoUrl,
      '/uploads/logo.png',
      '/logo.svg',
    ]

    for (const logoPath of candidates) {
      if (!logoPath) continue
      const relative = logoPath.split('?')[0].replace(/^\//, '')
      if (!relative || relative.includes('..')) continue
      const absolute = path.join(process.cwd(), 'public', relative)
      try {
        const buffer = await fs.readFile(absolute)
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': mimeFromUrl(relative),
            'Cache-Control': 'no-cache, must-revalidate',
          },
        })
      } catch {
        // try next candidate
      }
    }

    return new NextResponse('Not found', { status: 404 })
  } catch (error) {
    console.error('Favicon route error:', error)
    return new NextResponse('Not found', { status: 404 })
  }
}
