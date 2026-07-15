import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import {
  DEFAULT_WHATSAPP_ICON_ID,
  DEFAULT_WHATSAPP_ICON_URL,
  ensureSiteDirs,
  getSiteSettings,
  getUploadsDir,
  saveSiteSettings,
} from '@/lib/site-settings'

const ALLOWED_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
}

const MAX_BYTES = 2 * 1024 * 1024 // 2MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('icon')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Icon file is required' }, { status: 400 })
    }

    const ext = ALLOWED_TYPES[file.type]
    if (!ext) {
      return NextResponse.json(
        { error: 'Invalid file type. Use PNG, JPG, WEBP, or SVG.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Icon must be 2MB or smaller' }, { status: 400 })
    }

    await ensureSiteDirs()
    const uploadsDir = getUploadsDir()

    const existing = await fs.readdir(uploadsDir).catch(() => [] as string[])
    await Promise.all(
      existing
        .filter((name) => name.startsWith('whatsapp-icon.'))
        .map((name) => fs.unlink(path.join(uploadsDir, name)).catch(() => undefined))
    )

    const filename = `whatsapp-icon${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(path.join(uploadsDir, filename), buffer)

    const whatsappIconUrl = `/uploads/${filename}?v=${Date.now()}`
    const settings = await saveSiteSettings({
      whatsappIconId: 'custom',
      whatsappIconUrl,
    })

    return NextResponse.json({ ...settings, message: 'WhatsApp icon uploaded' })
  } catch (error) {
    console.error('WhatsApp icon upload error:', error)
    return NextResponse.json({ error: 'Failed to upload WhatsApp icon' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await ensureSiteDirs()
    const uploadsDir = getUploadsDir()
    const existing = await fs.readdir(uploadsDir).catch(() => [] as string[])
    await Promise.all(
      existing
        .filter((name) => name.startsWith('whatsapp-icon.'))
        .map((name) => fs.unlink(path.join(uploadsDir, name)).catch(() => undefined))
    )

    const settings = await saveSiteSettings({
      whatsappIconId: DEFAULT_WHATSAPP_ICON_ID,
      whatsappIconUrl: DEFAULT_WHATSAPP_ICON_URL,
    })
    return NextResponse.json({ ...settings, message: 'WhatsApp icon reset' })
  } catch (error) {
    console.error('WhatsApp icon reset error:', error)
    return NextResponse.json({ error: 'Failed to reset WhatsApp icon' }, { status: 500 })
  }
}

export async function GET() {
  const settings = await getSiteSettings()
  return NextResponse.json({
    whatsappIconId: settings.whatsappIconId,
    whatsappIconUrl: settings.whatsappIconUrl,
  })
}
