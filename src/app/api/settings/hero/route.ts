import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import {
  ensureSiteDirs,
  getUploadsDir,
  saveSiteSettings,
  type HeroMediaType,
} from '@/lib/site-settings'

const IMAGE_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
}

const VIDEO_TYPES: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('hero')
    const requestedType = String(formData.get('type') || '').toLowerCase()

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Hero media file is required' }, { status: 400 })
    }

    const isVideo =
      requestedType === 'video' || file.type.startsWith('video/')
    const mediaType: HeroMediaType = isVideo ? 'video' : 'image'
    const allowed = isVideo ? VIDEO_TYPES : IMAGE_TYPES
    const ext = allowed[file.type]

    if (!ext) {
      return NextResponse.json(
        {
          error: isVideo
            ? 'Invalid video. Use MP4 or WEBM.'
            : 'Invalid image. Use JPG, PNG, or WEBP.',
        },
        { status: 400 }
      )
    }

    // Images keep a soft size guard; hero videos have no app-level size limit
    if (!isVideo && file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: 'Image must be 5MB or smaller' },
        { status: 400 }
      )
    }

    await ensureSiteDirs()
    const uploadsDir = getUploadsDir()

    const existing = await fs.readdir(uploadsDir).catch(() => [] as string[])
    await Promise.all(
      existing
        .filter((name) => name.startsWith('hero.'))
        .map((name) => fs.unlink(path.join(uploadsDir, name)).catch(() => undefined))
    )

    const filename = `hero${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(path.join(uploadsDir, filename), buffer)

    const heroMediaUrl = `/uploads/${filename}?v=${Date.now()}`
    const settings = await saveSiteSettings({ heroMediaType: mediaType, heroMediaUrl })

    return NextResponse.json({
      ...settings,
      message: `Hero ${mediaType} uploaded successfully`,
    })
  } catch (error) {
    console.error('Hero upload error:', error)
    return NextResponse.json({ error: 'Failed to upload hero media' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await ensureSiteDirs()
    const uploadsDir = getUploadsDir()
    const existing = await fs.readdir(uploadsDir).catch(() => [] as string[])
    await Promise.all(
      existing
        .filter((name) => name.startsWith('hero.'))
        .map((name) => fs.unlink(path.join(uploadsDir, name)).catch(() => undefined))
    )

    const settings = await saveSiteSettings({
      heroMediaType: 'image',
      heroMediaUrl: '',
    })

    return NextResponse.json({ ...settings, message: 'Hero media cleared' })
  } catch (error) {
    console.error('Hero reset error:', error)
    return NextResponse.json({ error: 'Failed to clear hero media' }, { status: 500 })
  }
}
