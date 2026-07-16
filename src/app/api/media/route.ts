import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { db } from '@/lib/db'
import { filenameFromOriginal, slugify } from '@/lib/product-slug'
import { ensureSiteDirs, getSiteSettings, getUploadsDir } from '@/lib/site-settings'

export type MediaKind = 'image' | 'video' | 'file'

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif', '.bmp', '.ico'])
const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov', '.m4v', '.ogg'])
const FILE_EXT = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.csv',
  '.zip',
  '.txt',
  '.rtf',
  '.json',
])

const IMAGE_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
}

const VIDEO_TYPES: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'video/x-m4v': '.m4v',
}

const FILE_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/csv': '.csv',
  'application/zip': '.zip',
  'application/x-zip-compressed': '.zip',
  'text/plain': '.txt',
}

const MAX_IMAGE = 5 * 1024 * 1024
const MAX_VIDEO = 80 * 1024 * 1024
const MAX_FILE = 15 * 1024 * 1024

/** Upload destinations for new files */
const UPLOAD_FOLDERS = ['products', 'reels', 'sections', 'branding', 'files'] as const
type UploadFolder = (typeof UPLOAD_FOLDERS)[number]

type MediaRow = {
  url: string
  name: string
  size: number
  modifiedAt: string
  folder: string
  kind: MediaKind
  mime: string
  source: 'disk' | 'database'
}

function kindFromExt(ext: string): MediaKind {
  if (IMAGE_EXT.has(ext)) return 'image'
  if (VIDEO_EXT.has(ext)) return 'video'
  return 'file'
}

function isMediaExt(ext: string) {
  return IMAGE_EXT.has(ext) || VIDEO_EXT.has(ext) || FILE_EXT.has(ext)
}

function safeUploadFolder(raw: string): UploadFolder | 'all' {
  const folder = String(raw || 'all').trim().toLowerCase()
  if (folder === 'all') return 'all'
  if ((UPLOAD_FOLDERS as readonly string[]).includes(folder)) return folder as UploadFolder
  return 'all'
}

function parseAccept(raw: string): 'image' | 'video' | 'file' | 'media' | 'all' {
  const v = String(raw || 'all').trim().toLowerCase()
  if (v === 'image' || v === 'video' || v === 'file' || v === 'media' || v === 'all') return v
  return 'all'
}

function matchesAccept(
  kind: MediaKind,
  accept: 'image' | 'video' | 'file' | 'media' | 'all'
) {
  if (accept === 'all') return true
  if (accept === 'media') return kind === 'image' || kind === 'video'
  return kind === accept
}

function cleanUrl(raw: string) {
  return String(raw || '')
    .trim()
    .split('?')[0]
    .replace(/\\/g, '/')
}

function folderLabelFromUrl(url: string) {
  const parts = cleanUrl(url).replace(/^\//, '').split('/')
  if (parts[0] === 'uploads' && parts[1]) return parts[1]
  if (parts[0] === 'products') return parts[1] === 'featured' ? 'products/featured' : 'products'
  if (parts[0] === 'reels') return 'reels'
  if (parts[0] === 'uploads') return 'uploads'
  return parts[0] || 'public'
}

function mimeFor(ext: string, kind: MediaKind) {
  if (kind === 'image') {
    return `image/${ext.replace('.', '').replace('jpg', 'jpeg')}`
  }
  if (kind === 'video') {
    return `video/${ext.replace('.', '').replace('mov', 'quicktime')}`
  }
  return 'application/octet-stream'
}

function isSafePublicMediaPath(rel: string) {
  const clean = rel.replace(/\\/g, '/').replace(/^\/+/, '')
  if (clean.includes('..')) return false
  if (
    clean.startsWith('uploads/') ||
    clean.startsWith('products/') ||
    clean.startsWith('reels/')
  ) {
    return true
  }
  // Allow top-level public media files only (no nested unknown dirs)
  if (!clean.includes('/') && isMediaExt(path.extname(clean).toLowerCase())) {
    return true
  }
  return false
}

async function walkMediaDir(
  absDir: string,
  urlPrefix: string,
  out: Map<string, MediaRow>
) {
  const entries = await fs.readdir(absDir, { withFileTypes: true }).catch(() => [])
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const abs = path.join(absDir, entry.name)
    const url = `${urlPrefix}/${entry.name}`.replace(/\/+/g, '/')
    if (entry.isDirectory()) {
      await walkMediaDir(abs, url, out)
      continue
    }
    if (!entry.isFile()) continue
    const ext = path.extname(entry.name).toLowerCase()
    if (!isMediaExt(ext)) continue
    const stat = await fs.stat(abs).catch(() => null)
    if (!stat) continue
    const kind = kindFromExt(ext)
    const key = cleanUrl(url)
    out.set(key, {
      url: key,
      name: entry.name,
      size: stat.size,
      modifiedAt: stat.mtime.toISOString(),
      folder: folderLabelFromUrl(key),
      kind,
      mime: mimeFor(ext, kind),
      source: 'disk',
    })
  }
}

async function listPublicRootMedia(out: Map<string, MediaRow>) {
  const publicDir = path.join(process.cwd(), 'public')
  const entries = await fs.readdir(publicDir, { withFileTypes: true }).catch(() => [])
  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith('.')) continue
    const ext = path.extname(entry.name).toLowerCase()
    if (!isMediaExt(ext)) continue
    // Skip robots.txt etc already filtered by FILE_EXT — txt is allowed
    if (entry.name.toLowerCase() === 'robots.txt') continue
    const abs = path.join(publicDir, entry.name)
    const stat = await fs.stat(abs).catch(() => null)
    if (!stat) continue
    const kind = kindFromExt(ext)
    const key = `/${entry.name}`
    out.set(key, {
      url: key,
      name: entry.name,
      size: stat.size,
      modifiedAt: stat.mtime.toISOString(),
      folder: 'public',
      kind,
      mime: mimeFor(ext, kind),
      source: 'disk',
    })
  }
}

function pushDbUrl(out: Map<string, MediaRow>, raw: unknown) {
  if (typeof raw !== 'string') return
  const key = cleanUrl(raw)
  if (!key.startsWith('/')) return
  if (out.has(key)) return
  const name = key.split('/').pop() || key
  const ext = path.extname(name).toLowerCase()
  const kind = isMediaExt(ext) ? kindFromExt(ext) : 'file'
  out.set(key, {
    url: key,
    name,
    size: 0,
    modifiedAt: new Date(0).toISOString(),
    folder: folderLabelFromUrl(key),
    kind,
    mime: mimeFor(ext || '.bin', kind),
    source: 'database',
  })
}

function pushGalleryJson(out: Map<string, MediaRow>, raw: string | null | undefined) {
  if (!raw) return
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return
    for (const row of parsed) {
      if (row && typeof row === 'object' && 'image' in row) {
        pushDbUrl(out, (row as { image?: string }).image)
      }
    }
  } catch {
    // ignore invalid JSON
  }
}

async function collectDbMedia(out: Map<string, MediaRow>) {
  try {
    const products = await db.product.findMany({
      select: {
        image: true,
        secondaryImage: true,
        galleryImages: true,
      },
    })
    for (const p of products) {
      pushDbUrl(out, p.image)
      pushDbUrl(out, p.secondaryImage)
      pushGalleryJson(out, p.galleryImages)
    }
  } catch (error) {
    console.error('Media DB products scan error:', error)
  }

  try {
    const reels = await db.reel.findMany({
      select: {
        videoSrc: true,
        videoThumbnail: true,
        thumbnail: true,
        colors: true,
      },
    })
    for (const r of reels) {
      pushDbUrl(out, r.videoSrc)
      pushDbUrl(out, r.videoThumbnail)
      pushDbUrl(out, r.thumbnail)
      pushGalleryJson(out, r.colors)
    }
  } catch (error) {
    console.error('Media DB reels scan error:', error)
  }

  try {
    const settings = await getSiteSettings()
    pushDbUrl(out, settings.logoUrl)
    pushDbUrl(out, settings.heroMediaUrl)
    pushDbUrl(out, settings.whatsappIconUrl)
    if (settings.promoBanners) {
      for (const b of settings.promoBanners) {
        pushDbUrl(out, b.mediaUrl)
      }
    }
    if (settings.sectionMedia) {
      for (const slot of Object.values(settings.sectionMedia)) {
        if (slot && typeof slot === 'object') {
          pushDbUrl(out, (slot as { url?: string }).url)
        }
      }
    }
  } catch (error) {
    console.error('Media settings scan error:', error)
  }
}

async function listAllMedia(): Promise<MediaRow[]> {
  const publicDir = path.join(process.cwd(), 'public')
  const out = new Map<string, MediaRow>()

  await ensureSiteDirs()
  for (const folder of UPLOAD_FOLDERS) {
    await fs.mkdir(path.join(getUploadsDir(), folder), { recursive: true })
  }

  await walkMediaDir(path.join(publicDir, 'uploads'), '/uploads', out)
  await walkMediaDir(path.join(publicDir, 'products'), '/products', out)
  await walkMediaDir(path.join(publicDir, 'reels'), '/reels', out)
  await listPublicRootMedia(out)
  await collectDbMedia(out)

  return [...out.values()]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = safeUploadFolder(searchParams.get('folder') || 'all')
    const accept = parseAccept(searchParams.get('accept') || 'all')
    const q = String(searchParams.get('q') || '')
      .trim()
      .toLowerCase()
    // Browse everything unless explicitly narrowed with scope=folder
    const scope = String(searchParams.get('scope') || 'all').trim().toLowerCase()

    let items = await listAllMedia()
    items = items.filter((item) => matchesAccept(item.kind, accept))

    if (scope === 'folder' && folder !== 'all') {
      items = items.filter((item) => {
        const f = item.folder.toLowerCase()
        if (folder === 'products') {
          return f === 'products' || f.startsWith('products/') || f === 'uploads'
        }
        if (folder === 'reels') return f === 'reels'
        if (folder === 'branding') {
          return f === 'branding' || f === 'public' || f === 'uploads'
        }
        return f === folder || item.url.includes(`/uploads/${folder}/`)
      })
    }

    if (q) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.folder.toLowerCase().includes(q) ||
          item.url.toLowerCase().includes(q) ||
          item.kind.includes(q) ||
          item.source.includes(q)
      )
    }

    items.sort((a, b) => (a.modifiedAt < b.modifiedAt ? 1 : -1))

    return NextResponse.json(
      {
        items,
        folder,
        accept,
        total: items.length,
        folders: UPLOAD_FOLDERS,
        sources: {
          disk: items.filter((i) => i.source === 'disk').length,
          database: items.filter((i) => i.source === 'database').length,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Media GET error:', error)
    return NextResponse.json({ error: 'Failed to load media library' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') ?? formData.get('image') ?? formData.get('hero')
    const folderRaw = safeUploadFolder(String(formData.get('folder') || 'products'))
    const folder: UploadFolder = folderRaw === 'all' ? 'products' : folderRaw
    const kindHint = String(formData.get('kind') || '').toLowerCase()
    const accept = parseAccept(String(formData.get('accept') || 'all'))

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    const isVideo =
      kindHint === 'video' ||
      file.type.startsWith('video/') ||
      Boolean(VIDEO_TYPES[file.type])
    const isImage =
      kindHint === 'image' ||
      file.type.startsWith('image/') ||
      Boolean(IMAGE_TYPES[file.type])

    let ext = ''
    let mediaKind: MediaKind = 'file'
    let maxBytes = MAX_FILE

    if (isVideo) {
      ext = VIDEO_TYPES[file.type]
      mediaKind = 'video'
      maxBytes = MAX_VIDEO
      if (accept === 'image' || accept === 'file') {
        return NextResponse.json({ error: 'This picker only accepts images/files' }, { status: 400 })
      }
    } else if (isImage) {
      ext = IMAGE_TYPES[file.type]
      mediaKind = 'image'
      maxBytes = MAX_IMAGE
      if (accept === 'video' || accept === 'file') {
        return NextResponse.json(
          {
            error:
              accept === 'video' ? 'This picker only accepts videos' : 'This picker only accepts files',
          },
          { status: 400 }
        )
      }
    } else {
      ext = FILE_TYPES[file.type]
      mediaKind = 'file'
      maxBytes = MAX_FILE
      if (accept === 'image' || accept === 'video' || accept === 'media') {
        return NextResponse.json({ error: 'This picker does not accept that file type' }, { status: 400 })
      }
    }

    if (!ext) {
      return NextResponse.json(
        {
          error: isVideo
            ? 'Invalid video. Use MP4, WEBM, or MOV.'
            : isImage
              ? 'Invalid image. Use JPG, PNG, WEBP, GIF, or SVG.'
              : 'Invalid file. Use PDF, DOC, XLS, CSV, ZIP, or TXT.',
        },
        { status: 400 }
      )
    }

    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error:
            mediaKind === 'video'
              ? 'Video must be 80MB or smaller'
              : mediaKind === 'image'
                ? 'Image must be 5MB or smaller'
                : 'File must be 15MB or smaller',
        },
        { status: 400 }
      )
    }

    await ensureSiteDirs()
    const uploadsDir = getUploadsDir()
    const targetDir = path.join(uploadsDir, folder)
    await fs.mkdir(targetDir, { recursive: true })

    const fromOriginal = filenameFromOriginal(file.name || 'file', ext)
    let filename = fromOriginal
    let attempt = 2
    while (true) {
      try {
        await fs.access(path.join(targetDir, filename))
        const base = slugify(fromOriginal.replace(/\.[^.]+$/, ''))
        filename = `${base}-${attempt}${ext}`
        attempt += 1
      } catch {
        break
      }
    }
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(path.join(targetDir, filename), buffer)

    const baseUrl = `/uploads/${folder}/${filename}`
    const url = `${baseUrl}?v=${Date.now()}`

    return NextResponse.json({
      url,
      kind: mediaKind,
      item: {
        url: baseUrl,
        name: filename,
        size: buffer.length,
        modifiedAt: new Date().toISOString(),
        folder,
        kind: mediaKind,
        mime: file.type || 'application/octet-stream',
        source: 'disk',
      },
      message: 'Uploaded to media library',
    })
  } catch (error) {
    console.error('Media POST error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawUrl = cleanUrl(String(searchParams.get('url') || ''))
    if (!rawUrl.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid media path' }, { status: 400 })
    }
    const rel = rawUrl.replace(/^\//, '')
    if (!isSafePublicMediaPath(rel)) {
      return NextResponse.json({ error: 'Invalid media path' }, { status: 400 })
    }
    const abs = path.join(process.cwd(), 'public', rel)
    await fs.unlink(abs)
    return NextResponse.json({ success: true, message: 'Media deleted' })
  } catch (error) {
    console.error('Media DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
  }
}
