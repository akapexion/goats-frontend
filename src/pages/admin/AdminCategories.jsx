import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react'

function CategoryForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || { name: '', description: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">{initial ? 'Edit Category' : 'Add Category'}</CardTitle>
        <button onClick={onCancel}><X className="size-4" /></button>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={set('name')} required placeholder="e.g. Vegetables" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={form.description} onChange={set('description')} placeholder="Short description..." />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = (silent = false) => {
    if (!silent && categories.length === 0) setLoading(true)
    api.get('/categories')
      .then(({ data }) => setCategories(data.data?.data || data.data || []))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(false) }, [])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing.id}`, form)
        toast.success('Category updated')
      } else {
        await api.post('/admin/categories', form)
        toast.success('Category created')
      }
      setShowForm(false)
      setEditing(null)
      load(true)
    } catch (err) {
      const msgs = err.response?.data?.errors
      if (msgs) {
        Object.values(msgs).flat().forEach((m) => toast.error(m))
      } else {
        toast.error('Failed to save category')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await api.delete(`/admin/categories/${id}`)
      toast.success('Category deleted successfully')
      load(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category')
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Manage product categories</p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditing(null) }}>
            <Plus className="size-4 mr-2" /> Add Category
          </Button>
        </div>

        {showForm && !editing && (
          <CategoryForm onSave={handleSave} onCancel={() => setShowForm(false)} loading={saving} />
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Tag className="size-12 mx-auto mb-3 opacity-30" />
            <p>No categories yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <Card key={c.id}>
                {editing?.id === c.id ? (
                  <CategoryForm
                    initial={editing}
                    onSave={handleSave}
                    onCancel={() => setEditing(null)}
                    loading={saving}
                  />
                ) : (
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                      </div>
                      <Tag className="size-4 text-muted-foreground shrink-0" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                        <Pencil className="size-3 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="size-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
