import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, MapPin, Clock } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

function FarmerCard({ farmer, onApprove, onSuspend }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{farmer.stall_name}</CardTitle>
            <CardDescription>{farmer.user?.name} · {farmer.user?.email}</CardDescription>
          </div>
          <Badge variant={
            farmer.approval_status === 'approved' ? 'default' :
            farmer.approval_status === 'suspended' ? 'destructive' : 'secondary'
          } className="capitalize">
            {farmer.approval_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs text-muted-foreground space-y-1">
          {farmer.market && <p className="flex items-center gap-1"><MapPin className="size-3" />{farmer.market.name}</p>}
          {farmer.operating_days && <p className="flex items-center gap-1"><Clock className="size-3" />{farmer.operating_days}</p>}
          {farmer.description && <p className="line-clamp-2">{farmer.description}</p>}
        </div>
        <p className="text-xs text-muted-foreground">
          Joined: {new Date(farmer.created_at).toLocaleDateString()}
        </p>
        <div className="flex gap-2 pt-1">
          {farmer.approval_status !== 'approved' && (
            <Button size="sm" onClick={() => onApprove(farmer.id)}>Approve</Button>
          )}
          {farmer.approval_status !== 'suspended' && (
            <Button size="sm" variant="destructive" onClick={() => onSuspend(farmer.id)}>Suspend</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminFarmers() {
  const [pending, setPending] = useState([])
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/admin/farmers/pending'),
      api.get('/farmers', { params: { all: true } }).catch(() => ({ data: { data: [] } })),
    ]).then(([pendingRes, allRes]) => {
      setPending(pendingRes.data?.data || [])
      setAll(allRes.data?.data?.data || allRes.data?.data || [])
    }).catch(() => toast.error('Failed to load farmers'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const approve = async (id) => {
    try {
      await api.patch(`/admin/farmers/${id}/approve`)
      toast.success('Farmer approved')
      load()
    } catch { toast.error('Failed to approve') }
  }

  const suspend = async (id) => {
    try {
      await api.patch(`/admin/farmers/${id}/suspend`)
      toast.success('Farmer suspended')
      load()
    } catch { toast.error('Failed to suspend') }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Farmer Management</h1>
          <p className="text-muted-foreground">Review and manage farmer registrations</p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending {pending.length > 0 && <span className="ml-1.5 bg-primary text-primary-foreground rounded-full px-1.5 text-xs">{pending.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="all">All Farmers</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}><CardContent className="pt-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : pending.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="size-10 mx-auto mb-2 opacity-30" />
                <p>No pending farmer registrations.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pending.map((f) => (
                  <FarmerCard key={f.id} farmer={f} onApprove={approve} onSuspend={suspend} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}><CardContent className="pt-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : all.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No approved farmers yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {all.map((f) => (
                  <FarmerCard key={f.id} farmer={f} onApprove={approve} onSuspend={suspend} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
