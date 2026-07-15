import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getSiteSettings } from '@/lib/site-settings'
import { mimeFromUrl } from '@/lib/site-settings-client'

/** Serves the current site logo as the favicon (cache-busted). */
export async function GET() {
  try {
    const settings = await getSiteSettings()
    const candidates = [
      settings.logoUrl.split('?')[0],
      '/logo.svg',
    ]

    for (const logoPath of candidates) {
      const absolute = path.join(process.cwd(), 'public', logoPath.replace(/^\//, ''))
      try {
        const buffer = await fs.readFile(absolute)
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': mimeFromUrl(logoPath),
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
