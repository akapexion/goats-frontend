import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, X, Package } from 'lucide-react'
import { Link } from 'react-router-dom'

const statusColor = { available: 'default', sold_out: 'secondary', hidden: 'outline' }

function ProductForm({ initial, categories, markets, onSave, onCancel, loading }) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          category_id: initial.category_id || '',
          market_id: initial.market_id || '',
          description: initial.description || '',
          price: initial.price,
          unit: initial.unit,
          stock_quantity: initial.stock_quantity,
          status: initial.status,
        }
      : { name: '', category_id: '', market_id: '', description: '', price: '', unit: 'kg', stock_quantity: '', status: 'available' }
  )
  const [image, setImage] = useState(null)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
    if (image) fd.append('image', image)
    onSave(fd, Boolean(initial))
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-base font-bold">{initial ? 'Edit Product' : 'Add New Product'}</CardTitle>
        <button onClick={onCancel}><X className="size-4" /></button>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold">Product Name *</Label>
            <Input value={form.name} onChange={set('name')} required placeholder="e.g. Organic Fresh Tomatoes" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Product Category *</Label>
            <select
              value={form.category_id}
              onChange={set('category_id')}
              required
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select Category (e.g. Vegetables, Fruits, Dairy)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-[11px] text-amber-600">No categories added yet.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Target Farmers Market *</Label>
            <select
              value={form.market_id}
              onChange={set('market_id')}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select Market Location (Added by Admin)</option>
              {markets.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.city || 'Local'})</option>
              ))}
            </select>
            {markets.length === 0 && (
              <p className="text-[11px] text-muted-foreground">No admin markets listed yet.</p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold">Description</Label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              placeholder="Detailed product description..."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Price ($) *</Label>
            <Input type="number" step="0.01" min="0" value={form.price} onChange={set('price')} required placeholder="0.00" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Unit Type *</Label>
            <Input value={form.unit} onChange={set('unit')} required placeholder="e.g. KG, Dozen, Bunch, Lb" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Stock Quantity *</Label>
            <Input type="number" min="0" value={form.stock_quantity} onChange={set('stock_quantity')} required placeholder="0" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Status</Label>
            <select
              value={form.status}
              onChange={set('status')}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="available">Available</option>
              <option value="sold_out">Sold Out</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold">Product Image</Label>
            <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          </div>

          <div className="sm:col-span-2 flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={loading} className="font-bold shadow-md">
              {loading ? 'Saving...' : initial ? 'Update Product' : 'Save Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function FarmerProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [noProfile, setNoProfile] = useState(false)

  const load = (silent = false) => {
    if (!silent && products.length === 0) setLoading(true)
    Promise.all([
      api.get('/farmer/products'),
      api.get('/categories').catch(() => ({ data: { data: [] } })),
      api.get('/markets').catch(() => ({ data: { data: [] } })),
    ])
      .then(([prod, cats, mkts]) => {
        const prodData = prod.data
        if (prodData.data === null || (Array.isArray(prodData.data) && prodData.message?.includes('profile'))) {
          setNoProfile(true)
          setProducts([])
        } else {
          setNoProfile(false)
          setProducts(prodData.data?.data || prodData.data || [])
        }
        setCategories(cats.data?.data?.data || cats.data?.data || [])
        setMarkets(mkts.data?.data?.data || mkts.data?.data || [])
      })
      .catch((err) => {
        if (err.response?.status === 404 || err.response?.data?.message?.includes('profile')) {
          setNoProfile(true)
        } else {
          toast.error('Failed to load products')
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(false) }, [])

  const handleSave = async (formData, isEdit) => {
    setSaving(true)
    try {
      if (isEdit) {
        formData.append('_method', 'PUT')
        await api.post(`/farmer/products/${editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Product updated')
      } else {
        await api.post('/farmer/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Product added')
      }
      setShowForm(false)
      setEditing(null)
      load(true)
    } catch (err) {
      const msgs = err.response?.data?.errors
      if (msgs) {
        Object.values(msgs).flat().forEach((m) => toast.error(m))
      } else {
        toast.error(err.response?.data?.message || 'Failed to save product')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await api.delete(`/farmer/products/${id}`)
      toast.success('Product deleted')
      load(true)
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const handleStatusChange = async (product, status) => {
    try {
      await api.patch(`/farmer/products/${product.id}/status`, { status })
      toast.success('Status updated')
      load(true)
    } catch {
      toast.error('Failed to update status')
    }
  }

  if (noProfile) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">My Products</h1>
          </div>
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="pt-6 text-center space-y-3">
              <Package className="size-12 mx-auto text-amber-500 opacity-60" />
              <p className="font-medium text-amber-800 dark:text-amber-200">
                You need to set up your farmer profile first.
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Once your profile is approved by an admin, you can start listing products.
              </p>
              <Link to="/farmer/profile">
                <Button className="mt-2">Set Up Profile</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Products</h1>
            <p className="text-muted-foreground">Manage your product listings, categories, and market availability</p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditing(null) }}>
            <Plus className="size-4 mr-2" /> Add Product
          </Button>
        </div>

        {showForm && !editing && (
          <ProductForm
            categories={categories}
            markets={markets}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
            loading={saving}
          />
        )}

        {editing && (
          <ProductForm
            initial={editing}
            categories={categories}
            markets={markets}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
            loading={saving}
          />
        )}

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Package className="size-10 mx-auto mb-2 opacity-30" />
                    No products yet. Click "Add Product" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <div>{p.name}</div>
                      {p.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-48">{p.description}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{p.category?.name || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.market?.name || '—'}</TableCell>
                    <TableCell>${Number(p.price).toFixed(2)} / {p.unit}</TableCell>
                    <TableCell>{p.stock_quantity}</TableCell>
                    <TableCell>
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p, e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-background"
                      >
                        <option value="available">Available</option>
                        <option value="sold_out">Sold Out</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                        <Pencil className="size-3 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="size-3 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  )
}
