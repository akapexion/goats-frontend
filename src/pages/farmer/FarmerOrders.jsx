import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'

const statusColor = {
  placed: 'secondary',
  accepted: 'default',
  declined: 'destructive',
  ready: 'default',
  completed: 'outline',
  cancelled: 'destructive',
}

function OrderCard({ order, onAccept, onDecline, onReady, onComplete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Order #{order.id}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {order.customer?.name || 'Customer'} · {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusColor[order.status] || 'secondary'} className="capitalize">
              {order.status}
            </Badge>
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3">
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Pickup:</span> {order.pickup_date} at {order.pickup_time}</p>
            <p><span className="text-muted-foreground">Total:</span> ${Number(order.total_amount).toFixed(2)}</p>
            {order.note && <p><span className="text-muted-foreground">Note:</span> {order.note}</p>}
          </div>

          {order.items?.length > 0 && (
            <div className="border rounded-md divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span>{item.product?.name || 'Product'} × {item.quantity}</span>
                  <span className="text-muted-foreground">${Number(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {order.status === 'placed' && (
              <>
                <Button size="sm" onClick={() => onAccept(order.id)}>Accept</Button>
                <Button size="sm" variant="destructive" onClick={() => onDecline(order.id)}>Decline</Button>
              </>
            )}
            {order.status === 'accepted' && (
              <Button size="sm" onClick={() => onReady(order.id)}>Mark Ready</Button>
            )}
            {order.status === 'ready' && (
              <Button size="sm" onClick={() => onComplete(order.id)}>Mark Completed</Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default function FarmerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [noProfile, setNoProfile] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/farmer/orders')
      .then(({ data }) => {
        setNoProfile(false)
        setOrders(data.data?.data || data.data || [])
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setNoProfile(true)
        } else {
          toast.error('Failed to load orders')
        }
        setOrders([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const action = (url, successMsg) => async (id) => {
    try {
      await api.patch(`/farmer/orders/${id}/${url}`)
      toast.success(successMsg)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  if (!loading && noProfile) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Incoming Orders</h1>
          </div>
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="pt-6 text-center space-y-3">
              <ShoppingCart className="size-12 mx-auto text-amber-500 opacity-60" />
              <p className="font-medium text-amber-800 dark:text-amber-200">
                You need a farmer profile before you can receive orders.
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
        <div>
          <h1 className="text-2xl font-bold">Incoming Orders</h1>
          <p className="text-muted-foreground">Orders placed by customers for your products</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingCart className="size-12 mx-auto mb-3 opacity-30" />
            <p>No orders yet. Once customers place orders, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={action('accept', 'Order accepted')}
                onDecline={action('decline', 'Order declined')}
                onReady={action('ready', 'Order marked ready')}
                onComplete={action('complete', 'Order completed')}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
