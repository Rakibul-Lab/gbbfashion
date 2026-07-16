'use client'

import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { Loader2, Save, Megaphone, LayoutGrid, Images, Upload, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminSectionMediaManager } from '@/components/admin-section-media'
import { broadcastSectionMedia } from '@/hooks/use-section-media'
import {
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_PROMO_BANNERS,
  mergeHomepageSections,
  normalizePromoBanners,
  type HomepageSectionConfig,
  type PromoBannerConfig,
} from '@/lib/site-settings-client'
import {
  defaultSectionMedia,
  mergeSectionMedia,
  type SectionMediaMap,
} from '@/lib/section-media'

export function AdminContentPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [announcementsText, setAnnouncementsText] = useState(
    DEFAULT_ANNOUNCEMENTS.join('\n')
  )
  const [promoBanners, setPromoBanners] =
    useState<PromoBannerConfig[]>(DEFAULT_PROMO_BANNERS)
  const [homepageSections, setHomepageSections] = useState<HomepageSectionConfig[]>(
    DEFAULT_HOMEPAGE_SECTIONS
  )
  const [sectionMedia, setSectionMedia] = useState<SectionMediaMap>(() =>
    defaultSectionMedia()
  )
  const [uploadingPromoIndex, setUploadingPromoIndex] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' })
      const data = await res.json()
      if (Array.isArray(data.announcements)) {
        setAnnouncementsText(data.announcements.join('\n'))
      }
      setPromoBanners(normalizePromoBanners(data.promoBanners))
      if (Array.isArray(data.homepageSections)) {
        setHomepageSections(mergeHomepageSections(data.homepageSections))
      } else {
        setHomepageSections(mergeHomepageSections(null))
      }
      setSectionMedia(mergeSectionMedia(data.sectionMedia))
    } catch {
      toast.error('Failed to load content settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      const announcements = announcementsText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcements,
          promoBanners,
          homepageSections,
          sectionMedia,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSectionMedia(mergeSectionMedia(data.sectionMedia))
      broadcastSectionMedia(mergeSectionMedia(data.sectionMedia))
      window.dispatchEvent(new CustomEvent('site-settings-updated', { detail: data }))
      toast.success('Storefront content saved')
      await load()
    } catch {
      toast.error('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const uploadPromoMedia = async (index: number, file: File, type: 'image' | 'video') => {
    const slotKey = index === 0 ? 'promo_prime' : 'promo_second'
    setUploadingPromoIndex(index)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('slot', slotKey)
      formData.append('type', type)
      const res = await fetch('/api/settings/section-media', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      const url = data.uploaded?.url as string
      const mediaType = (data.uploaded?.type as 'image' | 'video') || type
      setPromoBanners((prev) =>
        prev.map((b, i) =>
          i === index
            ? { ...b, mediaType, mediaUrl: url, image: url }
            : b
        )
      )
      if (data.sectionMedia) {
        setSectionMedia(mergeSectionMedia(data.sectionMedia))
        broadcastSectionMedia(mergeSectionMedia(data.sectionMedia))
      }
      toast.success('Promo media uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingPromoIndex(null)
    }
  }

  const onPromoFile = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const type = promoBanners[index]?.mediaType === 'video' ? 'video' : 'image'
    void uploadPromoMedia(index, file, type)
  }

  const clearPromoMedia = async (index: number) => {
    const slotKey = index === 0 ? 'promo_prime' : 'promo_second'
    setUploadingPromoIndex(index)
    try {
      const res = await fetch(
        `/api/settings/section-media?slot=${encodeURIComponent(slotKey)}`,
        { method: 'DELETE' }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Clear failed')

      const nextBanners = promoBanners.map((b, i) =>
        i === index ? { ...b, mediaUrl: '', image: '' } : b
      )
      setPromoBanners(nextBanners)

      if (data.sectionMedia) {
        setSectionMedia(mergeSectionMedia(data.sectionMedia))
        broadcastSectionMedia(mergeSectionMedia(data.sectionMedia))
      }

      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoBanners: nextBanners }),
      })

      toast.success('Promo media cleared')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Clear failed')
    } finally {
      setUploadingPromoIndex(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Website content</h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage announcements, promo copy, section visibility, and all homepage & shop media
            (image or video).
          </p>
        </div>
        <Button
          className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save content
        </Button>
      </div>

      <Card className="rounded-xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-amber-600" />
            Announcement bar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Messages (one per line — rotates in the header)</Label>
          <Textarea
            value={announcementsText}
            onChange={(e) => setAnnouncementsText(e.target.value)}
            rows={4}
            className="font-medium"
          />
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Promo banners</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {promoBanners.map((banner, index) => (
            <div
              key={banner.id}
              className="rounded-xl border border-slate-200 p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  Banner {index + 1}
                </p>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={banner.enabled}
                    onCheckedChange={(v) =>
                      setPromoBanners((prev) =>
                        prev.map((b, i) =>
                          i === index ? { ...b, enabled: v } : b
                        )
                      )
                    }
                  />
                  Enabled
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4">
                <div className="relative aspect-[4/3] rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                  {banner.mediaUrl ? (
                    banner.mediaType === 'video' ? (
                      <video
                        src={banner.mediaUrl}
                        className="absolute inset-0 h-full w-full object-cover"
                        muted
                        loop
                        autoPlay
                        playsInline
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={banner.mediaUrl}
                        alt={banner.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )
                  ) : null}
                  {uploadingPromoIndex === index && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input
                      value={banner.title}
                      onChange={(e) =>
                        setPromoBanners((prev) =>
                          prev.map((b, i) =>
                            i === index ? { ...b, title: e.target.value } : b
                          )
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Subtitle</Label>
                    <Input
                      value={banner.subtitle}
                      onChange={(e) =>
                        setPromoBanners((prev) =>
                          prev.map((b, i) =>
                            i === index ? { ...b, subtitle: e.target.value } : b
                          )
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Media type</Label>
                    <Select
                      value={banner.mediaType}
                      onValueChange={(v) =>
                        setPromoBanners((prev) =>
                          prev.map((b, i) =>
                            i === index
                              ? { ...b, mediaType: v === 'video' ? 'video' : 'image' }
                              : b
                          )
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Upload media</Label>
                    <div className="flex flex-wrap gap-2">
                      <Label
                        htmlFor={`promo-upload-${index}`}
                        className="inline-flex items-center gap-2 h-10 px-3 rounded-lg bg-slate-900 text-white text-sm font-medium cursor-pointer hover:bg-slate-800 w-fit"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Choose file
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10"
                        disabled={uploadingPromoIndex === index || !banner.mediaUrl}
                        onClick={() => void clearPromoMedia(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Clear
                      </Button>
                    </div>
                    <Input
                      id={`promo-upload-${index}`}
                      type="file"
                      className="hidden"
                      accept={
                        banner.mediaType === 'video'
                          ? 'video/mp4,video/webm,video/quicktime'
                          : 'image/png,image/jpeg,image/webp'
                      }
                      onChange={(e) => onPromoFile(index, e)}
                      disabled={uploadingPromoIndex === index}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Link category slug</Label>
                    <Input
                      value={banner.linkCategory}
                      onChange={(e) =>
                        setPromoBanners((prev) =>
                          prev.map((b, i) =>
                            i === index ? { ...b, linkCategory: e.target.value } : b
                          )
                        )
                      }
                      placeholder="prime-drop"
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CTA label</Label>
                    <Input
                      value={banner.ctaLabel}
                      onChange={(e) =>
                        setPromoBanners((prev) =>
                          prev.map((b, i) =>
                            i === index ? { ...b, ctaLabel: e.target.value } : b
                          )
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Images className="h-5 w-5 text-sky-600" />
            Section & shop media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminSectionMediaManager media={sectionMedia} onChange={setSectionMedia} />
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-amber-600" />
            Homepage sections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-500 mb-2">
            Toggle every homepage block. Stories / Reels pull from the Reels admin. Tote /
            Backpack pulls products by subcategory (tote-bag / bag-pack). New Arrivals / Prime
            Drop products come from product flags.
          </p>
          {homepageSections.map((section, index) => (
            <div
              key={section.key}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{section.label}</p>
                <p className="text-[11px] font-mono text-slate-400">{section.key}</p>
              </div>
              <Switch
                checked={section.enabled}
                onCheckedChange={(v) =>
                  setHomepageSections((prev) =>
                    prev.map((s, i) => (i === index ? { ...s, enabled: v } : s))
                  )
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
