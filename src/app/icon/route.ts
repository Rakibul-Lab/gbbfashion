import { promises as fs } from 'fs'
import path from 'path'
import { getSiteSettings } from '@/lib/site-settings'
import { mimeFromUrl } from '@/lib/site-settings-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function readPublicAsset(urlPath: string) {
  const clean = urlPath.split('?')[0].replace(/^\//, '')
  if (!clean || clean.includes('..')) return null
  const absolute = path.join(process.cwd(), 'public', clean)
  try {
    const buffer = await fs.readFile(absolute)
    return { buffer, contentType: mimeFromUrl(clean) }
  } catch {
    return null
  }
}

/** Browser requests /icon on refresh — serve the uploaded site logo, not the template mark. */
export async function GET() {
  const settings = await getSiteSettings()
  const candidates = [settings.logoUrl, '/uploads/logo.png']

  for (const candidate of candidates) {
    if (!candidate) continue
    const file = await readPublicAsset(candidate)
    if (file) {
      return new Response(file.buffer, {
        headers: {
          'Content-Type': file.contentType,
          'Cache-Control': 'public, max-age=60, must-revalidate',
        },
      })
    }
  }

  return new Response(null, { status: 404 })
}
