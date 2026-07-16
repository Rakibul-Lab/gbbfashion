'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { toast } from 'sonner'
import {
  Check,
  FileText,
  ImageIcon,
  Images,
  Loader2,
  Search,
  Trash2,
  Upload,
  Video,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export type MediaKind = 'image' | 'video' | 'file'

export type MediaAccept = 'image' | 'video' | 'file' | 'media' | 'all'

export type MediaItem = {
  url: string
  name: string
  size: number
  modifiedAt: string
  folder: string
  kind: MediaKind
  mime?: string
  source?: 'disk' | 'database'
}

export type MediaFolder =
  | 'products'
  | 'reels'
  | 'sections'
  | 'branding'
  | 'files'
  | 'all'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string, item?: MediaItem) => void
  currentUrl?: string
  title?: string
  /** Which folder to browse/upload into. `all` lists everything. */
  folder?: MediaFolder
  /** Filter + upload constraints */
  accept?: MediaAccept
}

type Tab = 'library' | 'upload'

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function acceptAttr(accept: MediaAccept) {
  if (accept === 'image') return 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'
  if (accept === 'video') return 'video/mp4,video/webm,video/quicktime'
  if (accept === 'file')
    return '.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.txt,application/pdf,text/csv,application/zip'
  if (accept === 'media')
    return 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime'
  return 'image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.txt'
}

function acceptHint(accept: MediaAccept) {
  if (accept === 'image') return 'JPG, PNG, WEBP, GIF, SVG · Max 5MB'
  if (accept === 'video') return 'MP4, WEBM, MOV · Max 80MB'
  if (accept === 'file') return 'PDF, DOC, XLS, CSV, ZIP, TXT · Max 15MB'
  if (accept === 'media') return 'Images or videos · Images 5MB / Videos 80MB'
  return 'Images, videos, or documents'
}

function fileMatchesAccept(file: File, accept: MediaAccept) {
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')
  if (accept === 'image') return isImage
  if (accept === 'video') return isVideo
  if (accept === 'file') return !isImage && !isVideo
  if (accept === 'media') return isImage || isVideo
  return true
}

/**
 * WordPress-style media library for images, videos, and files.
 */
export function MediaLibraryModal({
  open,
  onOpenChange,
  onSelect,
  currentUrl = '',
  title = 'Media library',
  folder = 'all',
  accept = 'all',
}: Props) {
  const [tab, setTab] = useState<Tab>('library')
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState('')
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [filterKind, setFilterKind] = useState<'all' | MediaKind>('all')
  const fileRef = useRef<HTMLInputElement | null>(null)

  const uploadFolder = folder === 'all' ? (accept === 'file' ? 'files' : 'branding') : folder

  const load = useCallback(
    async (query = search) => {
      setLoading(true)
      try {
        // Always load the full library (disk + DB). Accept only limits what can be selected.
        const params = new URLSearchParams({
          folder: 'all',
          scope: 'all',
          accept: 'all',
        })
        if (query.trim()) params.set('q', query.trim())
        const res = await fetch(`/api/media?${params}`, { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load media')
        setItems(Array.isArray(data.items) ? data.items : [])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load media')
        setItems([])
      } finally {
        setLoading(false)
      }
    },
    [search]
  )

  useEffect(() => {
    if (!open) return
    setTab('library')
    setSearch('')
    setFilterKind('all')
    const cleanCurrent = currentUrl.split('?')[0]
    setSelected(cleanCurrent || '')
    setSelectedItem(null)
    void load('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentUrl, folder, accept])

  useEffect(() => {
    if (!open || tab !== 'library') return
    const t = setTimeout(() => void load(search), 250)
    return () => clearTimeout(t)
  }, [search, open, tab, load])

  const visibleItems = items.filter((item) =>
    filterKind === 'all' ? true : item.kind === filterKind
  )

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => fileMatchesAccept(f, accept))
    if (!list.length) {
      toast.error('No matching files for this picker')
      return
    }

    setUploading(true)
    try {
      let lastUrl = ''
      let lastItem: MediaItem | null = null
      for (const file of list) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', uploadFolder)
        formData.append('accept', accept)
        formData.append(
          'kind',
          file.type.startsWith('video/')
            ? 'video'
            : file.type.startsWith('image/')
              ? 'image'
              : 'file'
        )
        const res = await fetch('/api/media', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        lastUrl = (data.url as string) || data.item?.url || ''
        lastItem = data.item || null
      }
      toast.success(list.length > 1 ? `${list.length} files uploaded` : 'Uploaded to media library')
      setTab('library')
      await load('')
      if (lastUrl) {
        setSelected(lastUrl.split('?')[0])
        setSelectedItem(lastItem)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    e.target.value = ''
    if (files?.length) void uploadFiles(files)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files)
  }

  const handleDelete = async (url: string) => {
    if (!confirm('Delete this file from the media library?')) return
    setDeletingUrl(url)
    try {
      const res = await fetch(`/api/media?url=${encodeURIComponent(url.split('?')[0])}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      if (selected.split('?')[0] === url.split('?')[0]) {
        setSelected('')
        setSelectedItem(null)
      }
      toast.success('Deleted from library')
      await load('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeletingUrl(null)
    }
  }

  const itemAllowed = (item: MediaItem) => {
    if (accept === 'all') return true
    if (accept === 'media') return item.kind === 'image' || item.kind === 'video'
    return item.kind === accept
  }

  const confirmSelect = () => {
    if (!selected) {
      toast.error('Select a file first')
      return
    }
    const item = selectedItem || items.find((i) => i.url.split('?')[0] === selected.split('?')[0])
    if (item && !itemAllowed(item)) {
      toast.error(
        accept === 'image'
          ? 'Please select an image'
          : accept === 'video'
            ? 'Please select a video'
            : accept === 'file'
              ? 'Please select a document file'
              : 'That file type is not allowed here'
      )
      return
    }
    onSelect(selected, item || undefined)
    onOpenChange(false)
  }

  const selectAndClose = (item: MediaItem) => {
    if (!itemAllowed(item)) {
      toast.error(
        accept === 'image'
          ? 'Please select an image'
          : accept === 'video'
            ? 'Please select a video'
            : accept === 'file'
              ? 'Please select a document file'
              : 'That file type is not allowed here'
      )
      return
    }
    onSelect(item.url, item)
    onOpenChange(false)
  }

  const showKindFilters = true

  const kindCounts = {
    all: items.length,
    image: items.filter((i) => i.kind === 'image').length,
    video: items.filter((i) => i.kind === 'video').length,
    file: items.filter((i) => i.kind === 'file').length,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-[calc(100%-1.5rem)] sm:max-w-5xl lg:max-w-6xl max-h-[90vh] overflow-hidden p-0 gap-0 flex flex-col">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
          <DialogTitle className="text-lg flex items-center gap-2">
            <Images className="h-5 w-5 text-sky-600" />
            {title}
          </DialogTitle>
          <p className="text-sm text-slate-500 font-normal">
            All images, videos, and files from uploads, product folders, reels, and database
            references.
          </p>
        </DialogHeader>

        <div className="flex gap-1 px-5 pt-3 border-b border-slate-100 shrink-0">
          <button
            type="button"
            onClick={() => setTab('library')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition',
              tab === 'library'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            Media library
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition',
              tab === 'upload'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            Upload files
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4">
          {tab === 'library' ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search media…"
                    className="pl-9"
                  />
                </div>
                {showKindFilters && (
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'image', 'video', 'file'] as const).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setFilterKind(k)}
                        className={cn(
                          'h-8 px-3 rounded-full text-xs font-medium border transition',
                          filterKind === k
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        )}
                      >
                        {k === 'all'
                          ? `All (${kindCounts.all})`
                          : k === 'image'
                            ? `Images (${kindCounts.image})`
                            : k === 'video'
                              ? `Videos (${kindCounts.video})`
                              : `Files (${kindCounts.file})`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : visibleItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
                  <ImageIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-700">No media yet</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Upload files to build your media library.
                  </p>
                  <Button type="button" size="sm" onClick={() => setTab('upload')}>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Upload files
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {visibleItems.map((item) => {
                    const clean = item.url.split('?')[0]
                    const isSelected = selected.split('?')[0] === clean
                    return (
                      <div
                        key={clean}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelected(clean)
                          setSelectedItem(item)
                        }}
                        onDoubleClick={() => selectAndClose(item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setSelected(clean)
                            setSelectedItem(item)
                          }
                        }}
                        className={cn(
                          'group relative aspect-square rounded-lg border-2 overflow-hidden bg-slate-100 cursor-pointer transition',
                          isSelected
                            ? 'border-sky-600 ring-2 ring-sky-200'
                            : 'border-slate-200 hover:border-slate-400',
                          !itemAllowed(item) && 'opacity-45'
                        )}
                      >
                        {item.kind === 'image' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.url}
                            alt={item.name}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : item.kind === 'video' ? (
                          <div className="absolute inset-0 bg-slate-900">
                            <video
                              src={item.url}
                              className="absolute inset-0 h-full w-full object-cover opacity-90"
                              muted
                              playsInline
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="rounded-full bg-black/55 p-2 text-white">
                                <Video className="h-5 w-5" />
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 text-slate-500 p-3">
                            <FileText className="h-8 w-8" />
                            <span className="text-[10px] font-medium uppercase tracking-wide">
                              {item.name.split('.').pop()}
                            </span>
                          </div>
                        )}

                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className="rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white w-fit">
                            {item.kind}
                          </span>
                          {item.source === 'database' ? (
                            <span className="rounded bg-amber-600/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white w-fit">
                              DB
                            </span>
                          ) : null}
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-8 h-6 w-6 rounded-full bg-sky-600 text-white flex items-center justify-center shadow">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <button
                          type="button"
                          title="Delete from library"
                          className="absolute top-2 right-2 h-7 w-7 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center hover:bg-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            void handleDelete(clean)
                          }}
                          disabled={deletingUrl === clean || item.source === 'database'}
                        >
                          {deletingUrl === clean ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition">
                          <p className="text-[10px] text-white truncate">{item.name}</p>
                          <p className="text-[9px] text-white/70">
                            {item.size > 0 ? `${formatBytes(item.size)} · ` : ''}
                            {item.folder}
                            {item.source === 'database' ? ' · from DB' : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <p className="text-[11px] text-slate-400">
                Showing files from /uploads, /products, /reels, public root, and database.
                Double-click to select
                {accept !== 'all' ? ` (${accept === 'media' ? 'image or video' : accept} only)` : ''}.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-xl mx-auto py-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={cn(
                  'rounded-2xl border-2 border-dashed px-6 py-14 text-center transition',
                  dragOver
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                )}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3 text-slate-600">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm font-medium">Uploading…</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-800">
                      Drop files here to upload
                    </p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">{acceptHint(accept)}</p>
                    <Label
                      htmlFor="media-library-upload"
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium cursor-pointer hover:bg-slate-800"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Select files
                    </Label>
                    <Input
                      id="media-library-upload"
                      ref={fileRef}
                      type="file"
                      accept={acceptAttr(accept)}
                      multiple
                      className="hidden"
                      onChange={onFileInput}
                      disabled={uploading}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-5 py-4 border-t border-slate-100 shrink-0 bg-slate-50/80">
          <div className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500 truncate max-w-md">
              {selected ? `Selected: ${selected.split('/').pop()}` : 'No file selected'}
            </p>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-slate-900 hover:bg-slate-800 text-white"
                disabled={!selected}
                onClick={confirmSelect}
              >
                Use selected
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
