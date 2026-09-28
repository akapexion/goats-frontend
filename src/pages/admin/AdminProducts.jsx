import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Package, Search } from 'lucide-react'

const statusColor = {
  available: 'default',
  sold_out: 'secondary',
  hidden: 'outline',
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = (q = '') => {
    setLoading(true)
    const params = q ? { search: q } : {}
    api.get('/admin/products/all', { params })
      .then(({ data }) => setProducts(data.data?.data || data.data || []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    load(search)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product permanently?')) return
    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Product deleted')
      load(search)
    } catch {
      toast.error('Failed to delete product')
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">All Platform Products</h1>
          <p className="text-muted-foreground">View and moderate products, assigned categories, and target markets</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="size-4" />
          </Button>
        </form>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Farmer Stall</TableHead>
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
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <Package className="size-10 mx-auto mb-2 opacity-30" />
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {p.farmer?.stall_name || p.farmer?.user?.name || '—'}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{p.category?.name || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.market?.name || p.farmer?.market?.name || '—'}</TableCell>
                    <TableCell>${Number(p.price).toFixed(2)} / {p.unit}</TableCell>
                    <TableCell>{p.stock_quantity}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor[p.status] || 'secondary'}>
                        {p.status?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(p.id)}
                      >
                        Remove
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
