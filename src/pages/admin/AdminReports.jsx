import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, ShoppingCart, TrendingUp, Filter } from 'lucide-react'

const statusColor = {
  placed: 'secondary', accepted: 'default', declined: 'destructive',
  ready: 'default', completed: 'outline', cancelled: 'destructive',
}

export default function AdminReports() {
  const [data, setData] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', from: '', to: '' })

  const load = (params = {}) => {
    setLoading(true)
    api.get('/admin/reports/orders', { params })
      .then(({ data }) => {
        setData(data.summary)
        setOrders(data.data?.data || data.data || [])
      })
      .catch(() => toast.error('Failed to load report'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleFilter = (e) => {
    e.preventDefault()
    const params = {}
    if (filters.status) params.status = filters.status
    if (filters.from) params.from = filters.from
    if (filters.to) params.to = filters.to
    load(params)
  }

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value })

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Platform-wide order statistics and revenue</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardDescription>Total Orders</CardDescription>
                  <ShoppingCart className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><CardTitle className="text-3xl">{data?.total_orders ?? 0}</CardTitle></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardDescription>Total Revenue</CardDescription>
                  <DollarSign className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-3xl">${Number(data?.total_revenue ?? 0).toFixed(2)}</CardTitle>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>By Status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  {data?.status_counts && Object.entries(data.status_counts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <Badge variant={statusColor[status] || 'secondary'} className="capitalize">{status}</Badge>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filter Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <select value={filters.status} onChange={set('status')} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">All</option>
                  {['placed', 'accepted', 'declined', 'ready', 'completed', 'cancelled'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input type="date" value={filters.from} onChange={set('from')} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Input type="date" value={filters.to} onChange={set('to')} className="h-9" />
              </div>
              <Button type="submit" size="sm">
                <Filter className="size-3 mr-1" /> Apply
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => { setFilters({ status: '', from: '', to: '' }); load() }}>
                Reset
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Pickup Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No orders found</TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">#{o.id}</TableCell>
                    <TableCell className="text-sm">{o.customer?.name || '—'}</TableCell>
                    <TableCell className="text-sm">{o.farmer?.stall_name || o.farmer?.user?.name || '—'}</TableCell>
                    <TableCell className="text-sm">{o.pickup_date}</TableCell>
                    <TableCell className="font-semibold">${Number(o.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor[o.status] || 'secondary'} className="capitalize">{o.status}</Badge>
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
