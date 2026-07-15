import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { ensureSiteDirs, getUploadsDir } from '@/lib/site-settings'

const ALLOWED_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
}

const MAX_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image')
    const kind = String(formData.get('kind') || 'product')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
    }

    const ext = ALLOWED_TYPES[file.type]
    if (!ext) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPG, PNG, or WEBP.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be 5MB or smaller' }, { status: 400 })
    }

    await ensureSiteDirs()
    const uploadsDir = getUploadsDir()
    const productsDir = path.join(uploadsDir, 'products')
    await fs.mkdir(productsDir, { recursive: true })

    const safeKind = kind.replace(/[^a-z0-9_-]/gi, '') || 'product'
    const filename = `${safeKind}-${Date.now()}${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(path.join(productsDir, filename), buffer)

    const url = `/uploads/products/${filename}`
    return NextResponse.json({
      url,
      message: 'Image uploaded successfully',
    })
  } catch (error) {
    console.error('Product image upload error:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
