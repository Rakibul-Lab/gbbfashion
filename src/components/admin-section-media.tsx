'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { ImageIcon, Loader2, Upload, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { broadcastSectionMedia } from '@/hooks/use-section-media'
import {
  sectionMediaGroups,
  type SectionMediaMap,
  type SectionMediaSlot,
  type SectionMediaType,
} from '@/lib/section-media'

type Props = {
  media: SectionMediaMap
  onChange: (next: SectionMediaMap) => void
}

export function AdminSectionMediaManager({ media, onChange }: Props) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [draftTypes, setDraftTypes] = useState<Record<string, SectionMediaType>>({})
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const groups = sectionMediaGroups()

  const getType = (key: string, slot: SectionMediaSlot): SectionMediaType =>
    draftTypes[key] || slot.type

  const handleUpload = async (key: string, file: File, type: SectionMediaType) => {
    setUploadingKey(key)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('slot', key)
      formData.append('type', type)
      const res = await fetch('/api/settings/section-media', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      const next = data.sectionMedia as SectionMediaMap
      onChange(next)
      broadcastSectionMedia(next)
      toast.success('Media uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingKey(null)
    }
  }

  const onFileChange = (key: string, type: SectionMediaType, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    void handleUpload(key, file, type)
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Every homepage and shop visual below supports <strong>Image</strong> or{' '}
        <strong>Video</strong>. Choose the type, then upload. Changes appear on the storefront
        immediately. Homepage hero is managed under Settings.
      </div>

      {groups.map(({ group, slots }) => (
        <div key={group} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            {group}
          </h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {slots.map((def) => {
              const slot = media[def.key] || {
                type: 'image' as const,
                url: def.defaultUrl,
              }
              const mediaType = getType(def.key, slot)
              const uploading = uploadingKey === def.key

              return (
                <div
                  key={def.key}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                >
                  <div className="relative aspect-[16/10] bg-slate-100">
                    {slot.url ? (
                      mediaType === 'video' || slot.type === 'video' ? (
                        <video
                          src={slot.url}
                          className="absolute inset-0 h-full w-full object-cover"
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={slot.url}
                          alt={def.label}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <Loader2 className="h-7 w-7 animate-spin text-slate-700" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/70 text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
                        {slot.type === 'video' ? (
                          <Video className="h-3 w-3" />
                        ) : (
                          <ImageIcon className="h-3 w-3" />
                        )}
                        {slot.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{def.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{def.description}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Recommended {def.aspectHint}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-end gap-3">
                      <div className="space-y-1.5 min-w-[140px]">
                        <Label className="text-xs">Media type</Label>
                        <Select
                          value={mediaType}
                          onValueChange={(v) =>
                            setDraftTypes((prev) => ({
                              ...prev,
                              [def.key]: v === 'video' ? 'video' : 'image',
                            }))
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        className="h-9 bg-slate-900 hover:bg-slate-800 text-white"
                        disabled={uploading}
                        onClick={() => inputRefs.current[def.key]?.click()}
                      >
                        <Upload className="h-3.5 w-3.5 mr-1.5" />
                        Upload {mediaType}
                      </Button>
                      <input
                        ref={(el) => {
                          inputRefs.current[def.key] = el
                        }}
                        type="file"
                        className="hidden"
                        accept={
                          mediaType === 'video'
                            ? 'video/mp4,video/webm,video/quicktime'
                            : 'image/png,image/jpeg,image/webp'
                        }
                        onChange={(e) => onFileChange(def.key, mediaType, e)}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
