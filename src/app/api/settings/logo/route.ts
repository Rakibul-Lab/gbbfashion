import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import {
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

export async function GET() {
  const settings = await getSiteSettings()
  return NextResponse.json(settings)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('logo')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Logo file is required' }, { status: 400 })
    }

    const ext = ALLOWED_TYPES[file.type]
    if (!ext) {
      return NextResponse.json(
        { error: 'Invalid file type. Use PNG, JPG, WEBP, or SVG.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Logo must be 2MB or smaller' }, { status: 400 })
    }

    await ensureSiteDirs()
    const uploadsDir = getUploadsDir()

    const existing = await fs.readdir(uploadsDir).catch(() => [] as string[])
    await Promise.all(
      existing
        .filter((name) => name.startsWith('logo.'))
        .map((name) => fs.unlink(path.join(uploadsDir, name)).catch(() => undefined))
    )

    const filename = `logo${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(path.join(uploadsDir, filename), buffer)

    const logoUrl = `/uploads/${filename}?v=${Date.now()}`
    const settings = await saveSiteSettings({ logoUrl })

    return NextResponse.json({ ...settings, message: 'Logo uploaded successfully' })
  } catch (error) {
    console.error('Logo upload error:', error)
    return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await ensureSiteDirs()
    const uploadsDir = getUploadsDir()
    const existing = await fs.readdir(uploadsDir).catch(() => [] as string[])
    await Promise.all(
      existing
        .filter((name) => name.startsWith('logo.'))
        .map((name) => fs.unlink(path.join(uploadsDir, name)).catch(() => undefined))
    )

    const settings = await saveSiteSettings({ logoUrl: '' })
    return NextResponse.json({ ...settings, message: 'Logo cleared' })
  } catch (error) {
    console.error('Logo reset error:', error)
    return NextResponse.json({ error: 'Failed to clear logo' }, { status: 500 })
  }
}
