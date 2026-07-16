import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { ensureSiteDirs, getUploadsDir, getSiteSettings, saveSiteSettings } from '@/lib/site-settings'
import {
  SECTION_MEDIA_SLOTS,
  mergeSectionMedia,
  type SectionMediaType,
} from '@/lib/section-media'

const IMAGE_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
}

const VIDEO_TYPES: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_VIDEO_BYTES = 80 * 1024 * 1024

const VALID_KEYS = new Set(SECTION_MEDIA_SLOTS.map((s) => s.key))

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const slotKey = String(formData.get('slot') || '').trim()
    const requestedType = String(formData.get('type') || '').toLowerCase()

    if (!VALID_KEYS.has(slotKey)) {
      return NextResponse.json({ error: 'Invalid media slot' }, { status: 400 })
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Media file is required' }, { status: 400 })
    }

    const isVideo =
      requestedType === 'video' || file.type.startsWith('video/')
    const mediaType: SectionMediaType = isVideo ? 'video' : 'image'
    const allowed = isVideo ? VIDEO_TYPES : IMAGE_TYPES
    const ext = allowed[file.type]

    if (!ext) {
      return NextResponse.json(
        {
          error: isVideo
            ? 'Invalid video. Use MP4, WEBM, or MOV.'
            : 'Invalid image. Use JPG, PNG, or WEBP.',
        },
        { status: 400 }
      )
    }

    if (!isVideo && file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Image must be 5MB or smaller' }, { status: 400 })
    }
    if (isVideo && file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: 'Video must be 80MB or smaller' }, { status: 400 })
    }

    await ensureSiteDirs()
    const uploadsDir = getUploadsDir()
    const sectionsDir = path.join(uploadsDir, 'sections')
    await fs.mkdir(sectionsDir, { recursive: true })

    const existing = await fs.readdir(sectionsDir).catch(() => [] as string[])
    await Promise.all(
      existing
        .filter((name) => name.startsWith(`${slotKey}.`) || name.startsWith(`${slotKey}-`))
        .map((name) => fs.unlink(path.join(sectionsDir, name)).catch(() => undefined))
    )

    const filename = `${slotKey}-${Date.now()}${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(path.join(sectionsDir, filename), buffer)

    const url = `/uploads/sections/${filename}`
    const current = await getSiteSettings()
    const sectionMedia = mergeSectionMedia(current.sectionMedia)
    sectionMedia[slotKey] = { type: mediaType, url }

    const settings = await saveSiteSettings({ sectionMedia })

    return NextResponse.json({
      ...settings,
      uploaded: { slot: slotKey, type: mediaType, url },
      message: `${slotKey} ${mediaType} uploaded`,
    })
  } catch (error) {
    console.error('Section media upload error:', error)
    return NextResponse.json({ error: 'Failed to upload section media' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slotKey = String(searchParams.get('slot') || '').trim()

    if (!VALID_KEYS.has(slotKey)) {
      return NextResponse.json({ error: 'Invalid media slot' }, { status: 400 })
    }

    await ensureSiteDirs()
    const uploadsDir = getUploadsDir()
    const sectionsDir = path.join(uploadsDir, 'sections')
    const existing = await fs.readdir(sectionsDir).catch(() => [] as string[])
    await Promise.all(
      existing
        .filter((name) => name.startsWith(`${slotKey}.`) || name.startsWith(`${slotKey}-`))
        .map((name) => fs.unlink(path.join(sectionsDir, name)).catch(() => undefined))
    )

    const current = await getSiteSettings()
    const sectionMedia = mergeSectionMedia(current.sectionMedia)
    sectionMedia[slotKey] = { type: 'image', url: '' }

    const settings = await saveSiteSettings({ sectionMedia })

    return NextResponse.json({
      ...settings,
      cleared: { slot: slotKey },
      message: `${slotKey} media cleared`,
    })
  } catch (error) {
    console.error('Section media clear error:', error)
    return NextResponse.json({ error: 'Failed to clear section media' }, { status: 500 })
  }
}
