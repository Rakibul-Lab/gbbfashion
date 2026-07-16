import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { filenameFromOriginal, slugify } from '@/lib/product-slug'
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

    const fromOriginal = filenameFromOriginal(file.name || 'product', ext)
    let filename = fromOriginal
    let attempt = 2
    while (true) {
      try {
        await fs.access(path.join(productsDir, filename))
        const base = slugify(fromOriginal.replace(/\.[^.]+$/, ''))
        filename = `${base}-${attempt}${ext}`
        attempt += 1
      } catch {
        break
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(path.join(productsDir, filename), buffer)

    // Cache-bust so browsers / CDNs don't keep a stale 404 after a fresh upload
    const url = `/uploads/products/${filename}?v=${Date.now()}`
    return NextResponse.json({
      url,
      message: 'Image uploaded successfully',
    })
  } catch (error) {
    console.error('Product image upload error:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
