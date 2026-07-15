'use client'

import { useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Users } from 'lucide-react'

export type AdminUserRow = {
  id: string
  name: string
  email: string
  role: string
  source?: string
  phone: string | null
  createdAt: string
}

type Props = {
  users: AdminUserRow[]
  onRefresh: () => Promise<void>
}

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'customer' as 'admin' | 'customer',
}

export function AdminUsersPage({ users, onRefresh }: Props) {
  const currentUser = useStore((s) => s.user)
  const [tab, setTab] = useState<'team' | 'customers'>('team')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')

  const teamUsers = useMemo(
    () =>
      users.filter(
        (u) => u.source === 'admin' || u.role === 'admin'
      ),
    [users]
  )

  const customerUsers = useMemo(
    () =>
      users.filter(
        (u) => u.role === 'customer' && u.source !== 'admin'
      ),
    [users]
  )

  const filtered = useMemo(() => {
    const list = tab === 'team' ? teamUsers : customerUsers
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q)
    )
  }, [tab, teamUsers, customerUsers, search])

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error('Name, email, and password are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          password: form.password,
          role: form.role,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not create user')
        return
      }
      toast.success('User created')
      setCreateOpen(false)
      setForm(emptyForm)
      setTab('team')
      await onRefresh()
    } catch {
      toast.error('Could not create user')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/users/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not delete user')
        return
      }
      toast.success('User deleted')
      setDeleteId(null)
      await onRefresh()
    } catch {
      toast.error('Could not delete user')
    } finally {
      setDeleting(false)
    }
  }

  const renderTable = (emptyLabel: string) => (
    <Card className="rounded-xl border-slate-200">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                    {emptyLabel}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => {
                  const isSelf = currentUser?.id === u.id
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium text-slate-900">
                        {u.name}
                        {isSelf && (
                          <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-600">
                            You
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">{u.email}</TableCell>
                      <TableCell className="text-slate-600">{u.phone || '—'}</TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                          disabled={isSelf}
                          title={isSelf ? 'Cannot delete your own account' : 'Delete user'}
                          onClick={() => setDeleteId(u.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Users</h2>
          <p className="text-slate-500 text-sm mt-1">
            {teamUsers.length} admin-created · {customerUsers.length} customer signups ·{' '}
            {users.length} total
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm)
            setCreateOpen(true)
          }}
          className="bg-slate-900 hover:bg-slate-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add user
        </Button>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as 'team' | 'customers')
          setSearch('')
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <TabsList className="bg-slate-100">
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-3.5 w-3.5" />
              Created by admin
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {teamUsers.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2">
              Customer signups
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {customerUsers.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <Input
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
        </div>

        <TabsContent value="team" className="mt-4">
          {renderTable(
            'No admin-created users yet. Use “Add user” to create staff or accounts.'
          )}
        </TabsContent>
        <TabsContent value="customers" className="mt-4">
          {renderTable('No customer signups yet. Customers appear here after they register.')}
        </TabsContent>
      </Tabs>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="user-name">Full name</Label>
              <Input
                id="user-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-phone">Phone (optional)</Label>
              <Input
                id="user-phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">Password</Label>
              <Input
                id="user-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min. 6 characters"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, role: v as 'admin' | 'customer' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Admin users can access this panel. Customer accounts can shop and log in on
                the storefront.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving} className="bg-slate-900">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            This permanently removes the account. Order history is kept but unlinked from the
            user. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
