import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { ensureSiteDirs, getUploadsDir } from '@/lib/site-settings'

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

const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_BYTES = 80 * 1024 * 1024 // 80MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const kind = String(formData.get('kind') || 'media')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    const isVideo = kind === 'video' || file.type.startsWith('video/')
    const ext = isVideo ? VIDEO_TYPES[file.type] : IMAGE_TYPES[file.type]

    if (!ext) {
      return NextResponse.json(
        {
          error: isVideo
            ? 'Invalid video type. Use MP4, WEBM, or MOV.'
            : 'Invalid image type. Use JPG, PNG, or WEBP.',
        },
        { status: 400 }
      )
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: isVideo
            ? 'Video must be 80MB or smaller'
            : 'Image must be 5MB or smaller',
        },
        { status: 400 }
      )
    }

    await ensureSiteDirs()
    const uploadsDir = getUploadsDir()
    const reelsDir = path.join(uploadsDir, 'reels')
    await fs.mkdir(reelsDir, { recursive: true })

    const safeKind = kind.replace(/[^a-z0-9_-]/gi, '') || (isVideo ? 'video' : 'image')
    const filename = `${safeKind}-${Date.now()}${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(path.join(reelsDir, filename), buffer)

    const url = `/uploads/reels/${filename}`
    return NextResponse.json({
      url,
      message: 'Upload successful',
    })
  } catch (error) {
    console.error('Reel upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
