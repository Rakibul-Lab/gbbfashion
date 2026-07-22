'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ImageIcon, Loader2, Trash2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MediaPickerButton } from '@/components/media-picker-button'
import { broadcastSectionMedia } from '@/hooks/use-section-media'
import { Input } from '@/components/ui/input'
import {
  mergeSectionMedia,
  sectionMediaGroups,
  type SectionMediaMap,
  type SectionMediaSlot,
  type SectionMediaType,
} from '@/lib/section-media'
import type { BagTheVibeContent } from '@/lib/site-settings-client'

type Props = {
  media: SectionMediaMap
  onChange: (next: SectionMediaMap) => void
  bagTheVibe: BagTheVibeContent
  onBagTheVibeChange: (next: BagTheVibeContent) => void
}

export function AdminSectionMediaManager({
  media,
  onChange,
  bagTheVibe,
  onBagTheVibeChange,
}: Props) {
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [clearingKey, setClearingKey] = useState<string | null>(null)
  const [draftTypes, setDraftTypes] = useState<Record<string, SectionMediaType>>({})

  const groups = sectionMediaGroups()

  const getType = (key: string, slot: SectionMediaSlot): SectionMediaType =>
    draftTypes[key] || slot.type

  const assignSlot = async (key: string, url: string, type: SectionMediaType) => {
    setSavingKey(key)
    try {
      const nextLocal: SectionMediaMap = {
        ...media,
        [key]: { type, url },
      }
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionMedia: mergeSectionMedia(nextLocal) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save media')
      const next = mergeSectionMedia(data.sectionMedia)
      onChange(next)
      broadcastSectionMedia(next)
      toast.success('Media selected')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save media')
    } finally {
      setSavingKey(null)
    }
  }

  const handleClear = async (key: string) => {
    setClearingKey(key)
    try {
      const res = await fetch(`/api/settings/section-media?slot=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Clear failed')
      const next = data.sectionMedia as SectionMediaMap
      onChange(next)
      broadcastSectionMedia(next)
      toast.success('Media cleared')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Clear failed')
    } finally {
      setClearingKey(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Every homepage and shop visual below supports <strong>Image</strong> or{' '}
        <strong>Video</strong>. Use the media library to pick existing files or upload new ones.
        Leave a slot empty for a blank area — no stock images are filled in. Homepage hero is under
        Settings.
      </div>

      {groups.map(({ group, slots }) => (
        <div key={group} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            {group}
          </h3>

          {group === 'Bag The Vibe' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Product card details
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update title, prices, badge, and product link shown on the homepage Bag The
                  Vibe section. Click Save content at the top when done.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">Product title</Label>
                  <Input
                    value={bagTheVibe.title}
                    onChange={(e) =>
                      onBagTheVibeChange({ ...bagTheVibe, title: e.target.value })
                    }
                    placeholder="Butterfly Design Shoulder Bag"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Badge</Label>
                  <Input
                    value={bagTheVibe.badge}
                    onChange={(e) =>
                      onBagTheVibeChange({ ...bagTheVibe, badge: e.target.value })
                    }
                    placeholder="TRENDING"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Product slug / ID</Label>
                  <Input
                    value={bagTheVibe.productSlug}
                    onChange={(e) =>
                      onBagTheVibeChange({
                        ...bagTheVibe,
                        productSlug: e.target.value,
                      })
                    }
                    placeholder="butterfly-design-shoulder-bag"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Price</Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={bagTheVibe.price}
                    onChange={(e) =>
                      onBagTheVibeChange({
                        ...bagTheVibe,
                        price: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Compare-at price (optional)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={bagTheVibe.originalPrice ?? ''}
                    onChange={(e) =>
                      onBagTheVibeChange({
                        ...bagTheVibe,
                        originalPrice: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    placeholder="Leave empty for no strike-through"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">Lifestyle tagline</Label>
                  <Input
                    value={bagTheVibe.lifestyleTagline}
                    onChange={(e) =>
                      onBagTheVibeChange({
                        ...bagTheVibe,
                        lifestyleTagline: e.target.value,
                      })
                    }
                    placeholder="Style that speaks before you do"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {slots.map((def) => {
              const slot = media[def.key] || {
                type: 'image' as const,
                url: '',
              }
              const mediaType = getType(def.key, slot)
              const busy = savingKey === def.key || clearingKey === def.key

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
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-slate-300">
                        <ImageIcon className="h-10 w-10" />
                        <span className="text-xs text-slate-400">No media</span>
                      </div>
                    )}
                    {busy && (
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
                        {slot.url ? slot.type : 'empty'}
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

                      <MediaPickerButton
                        label={`Select / Upload ${mediaType}`}
                        title={`${def.label} — media library`}
                        folder="sections"
                        accept={mediaType === 'video' ? 'video' : 'image'}
                        currentUrl={slot.url}
                        disabled={busy}
                        className="h-9 bg-slate-900 hover:bg-slate-800 text-white"
                        onSelect={(url, item) => {
                          const type: SectionMediaType =
                            item?.kind === 'video' || mediaType === 'video' ? 'video' : 'image'
                          void assignSlot(def.key, url, type)
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-9"
                        disabled={busy || !slot.url}
                        onClick={() => void handleClear(def.key)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Clear
                      </Button>
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
