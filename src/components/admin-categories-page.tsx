'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  FolderTree,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Save,
  Sparkles,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type AdminSubCategory = {
  id?: string
  slug: string
  label: string
  sortOrder: number
  isActive?: boolean
}

export type AdminCategory = {
  id: string
  slug: string
  label: string
  highlight: boolean
  showInNav: boolean
  sortOrder: number
  specialType: string | null
  heroTitle: string | null
  heroSubtitle: string | null
  heroDescription: string | null
  isActive: boolean
  productCount?: number
  subcategories: AdminSubCategory[]
}

const emptyForm = {
  slug: '',
  label: '',
  highlight: false,
  showInNav: true,
  sortOrder: 0,
  specialType: '' as string,
  heroTitle: '',
  heroSubtitle: '',
  heroDescription: '',
  isActive: true,
  subcategories: [] as AdminSubCategory[],
}

const CATEGORIES_UPDATED_EVENT = 'gbb:categories-updated'

function notifyCategoriesUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CATEGORIES_UPDATED_EVENT))
  }
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCategory | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [seeding, setSeeding] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories?all=1', { cache: 'no-store' })
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...emptyForm,
      sortOrder: categories.length,
    })
    setDialogOpen(true)
  }

  const openEdit = (cat: AdminCategory) => {
    setEditing(cat)
    setForm({
      slug: cat.slug,
      label: cat.label,
      highlight: cat.highlight,
      showInNav: cat.showInNav,
      sortOrder: cat.sortOrder,
      specialType: cat.specialType || '',
      heroTitle: cat.heroTitle || '',
      heroSubtitle: cat.heroSubtitle || '',
      heroDescription: cat.heroDescription || '',
      isActive: cat.isActive,
      subcategories: cat.subcategories.map((s) => ({
        slug: s.slug,
        label: s.label,
        sortOrder: s.sortOrder,
        isActive: s.isActive !== false,
      })),
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.label.trim() || !form.slug.trim()) {
      toast.error('Label and slug are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        specialType: form.specialType || null,
        heroTitle: form.heroTitle || null,
        heroSubtitle: form.heroSubtitle || null,
        heroDescription: form.heroDescription || null,
      }
      const res = await fetch(
        editing ? `/api/categories/${editing.id}` : '/api/categories',
        {
          method: editing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      toast.success(editing ? 'Category updated' : 'Category created')
      setDialogOpen(false)
      await load()
      notifyCategoriesUpdated()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat: AdminCategory) => {
    if (!confirm(`Delete category “${cat.label}”? Subcategories will be removed.`)) return
    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Category deleted')
      await load()
      notifyCategoriesUpdated()
    } catch {
      toast.error('Delete failed')
    }
  }

  const seedDefaults = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/categories/seed', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Seed failed')
      toast.success(data.message || 'Categories seeded')
      await load()
      notifyCategoriesUpdated()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Seed failed')
    } finally {
      setSeeding(false)
    }
  }

  const addSub = () => {
    setForm((prev) => ({
      ...prev,
      subcategories: [
        ...prev.subcategories,
        { slug: '', label: '', sortOrder: prev.subcategories.length },
      ],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage navigation, New Arrivals, Prime Drop, and subcategories. Changes appear on the storefront.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.length === 0 && (
            <Button
              variant="outline"
              className="rounded-lg"
              disabled={seeding}
              onClick={() => void seedDefaults()}
            >
              {seeding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Seed defaults
            </Button>
          )}
          <Button
            className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add category
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : categories.length === 0 ? (
        <Card className="rounded-xl border-dashed border-2 border-slate-200">
          <CardContent className="py-16 text-center">
            <FolderTree className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-900">No categories yet</p>
            <p className="text-sm text-slate-500 mt-1 mb-5">
              Seed the current storefront structure, or create categories manually.
            </p>
            <Button
              className="rounded-lg bg-slate-900 text-white"
              disabled={seeding}
              onClick={() => void seedDefaults()}
            >
              {seeding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Seed storefront categories
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="rounded-xl border-slate-200 overflow-hidden p-0 gap-0">
              <CardHeader className="px-5 py-4 border-b border-slate-100 flex-row items-center justify-between space-y-0">
                <div className="min-w-0">
                  <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900">{cat.label}</span>
                    <span className="font-mono text-xs font-normal text-slate-400">
                      /{cat.slug}
                    </span>
                    {cat.specialType === 'new-arrivals' && (
                      <Badge className="bg-amber-100 text-amber-800 border-0 text-[10px]">
                        New Arrivals
                      </Badge>
                    )}
                    {cat.specialType === 'prime-drop' && (
                      <Badge className="bg-rose-100 text-rose-800 border-0 text-[10px]">
                        <Star className="h-3 w-3 mr-1" />
                        Prime Drop
                      </Badge>
                    )}
                    {cat.highlight && (
                      <Badge className="bg-slate-900 text-white border-0 text-[10px]">
                        Highlight
                      </Badge>
                    )}
                    {!cat.isActive && (
                      <Badge className="bg-slate-100 text-slate-500 border-0 text-[10px]">
                        Inactive
                      </Badge>
                    )}
                    {!cat.showInNav && (
                      <Badge className="bg-slate-100 text-slate-500 border-0 text-[10px]">
                        Hidden from nav
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-1">
                    Order {cat.sortOrder}
                    {' · '}
                    <span className="font-medium text-slate-600">
                      {cat.productCount ?? 0} product
                      {(cat.productCount ?? 0) === 1 ? '' : 's'}
                    </span>
                    {cat.subcategories.length > 0
                      ? ` · ${cat.subcategories.length} subcategories`
                      : ''}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => openEdit(cat)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-rose-600 hover:text-rose-700"
                    onClick={() => void handleDelete(cat)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              {cat.subcategories.length > 0 && (
                <CardContent className="px-5 py-3">
                  <div className="flex flex-wrap gap-2">
                    {cat.subcategories.map((sub) => (
                      <span
                        key={`${cat.id}-${sub.slug}`}
                        className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                      >
                        {sub.label}
                        <span className="ml-1.5 font-mono text-[10px] text-slate-400">
                          {sub.slug}
                        </span>
                      </span>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit category' : 'New category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Label *</Label>
                <Input
                  value={form.label}
                  onChange={(e) => {
                    const label = e.target.value
                    setForm((prev) => ({
                      ...prev,
                      label,
                      slug:
                        editing || prev.slug
                          ? prev.slug
                          : label
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-|-$/g, ''),
                    }))
                  }}
                  placeholder="WOMEN"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="women"
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Shop mode</Label>
                <Select
                  value={form.specialType || 'none'}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      specialType: v === 'none' ? '' : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Normal category</SelectItem>
                    <SelectItem value="new-arrivals">New Arrivals</SelectItem>
                    <SelectItem value="prime-drop">Prime Drop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      sortOrder: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.showInNav}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, showInNav: v }))}
                />
                Show in navigation
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.highlight}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, highlight: v }))}
                />
                Highlight (e.g. rose)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
                />
                Active
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hero title</Label>
                <Input
                  value={form.heroTitle}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, heroTitle: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Hero subtitle</Label>
                <Input
                  value={form.heroSubtitle}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, heroSubtitle: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Hero description</Label>
              <Textarea
                value={form.heroDescription}
                onChange={(e) =>
                  setForm((p) => ({ ...p, heroDescription: e.target.value }))
                }
                rows={2}
              />
            </div>

            {!form.specialType && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <Label>Subcategories</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addSub}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
                {form.subcategories.map((sub, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <Input
                      placeholder="Label"
                      value={sub.label}
                      onChange={(e) => {
                        const label = e.target.value
                        setForm((prev) => {
                          const next = [...prev.subcategories]
                          next[index] = {
                            ...next[index],
                            label,
                            slug:
                              next[index].slug ||
                              label
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/^-|-$/g, ''),
                          }
                          return { ...prev, subcategories: next }
                        })
                      }}
                    />
                    <Input
                      placeholder="slug"
                      className="font-mono text-sm"
                      value={sub.slug}
                      onChange={(e) => {
                        setForm((prev) => {
                          const next = [...prev.subcategories]
                          next[index] = { ...next[index], slug: e.target.value }
                          return { ...prev, subcategories: next }
                        })
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-rose-600"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          subcategories: prev.subcategories.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-slate-900 text-white"
              disabled={saving}
              onClick={() => void handleSave()}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
