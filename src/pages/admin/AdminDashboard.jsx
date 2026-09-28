import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Store, ShoppingCart, Package, Leaf, Tag, Star, BarChart2, ArrowRight, ShieldCheck, Bell, Clock, Check } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false))

    api.get('/notifications')
      .then(({ data }) => setNotifications(data.data?.data || data.data || []))
      .catch(() => {})
      .finally(() => setNotificationsLoading(false))
  }, [])

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation()
    try {
      await api.post(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      )
    } catch {
      toast.error('Failed to mark notification as read')
    }
  }

  const s = stats || { total_users: 0, total_farmers: 0, total_customers: 0, total_markets: 0, total_orders: 0 }
  const cards = [
    { label: 'Total Users', value: s.total_users, icon: Users, color: 'text-blue-500 bg-blue-500/10', target: '/admin/users' },
    { label: 'Farmers', value: s.total_farmers, icon: Leaf, color: 'text-green-500 bg-green-500/10', target: '/admin/farmers' },
    { label: 'Customers', value: s.total_customers, icon: Users, color: 'text-purple-500 bg-purple-500/10', target: '/admin/users' },
    { label: 'Markets', value: s.total_markets, icon: Store, color: 'text-orange-500 bg-orange-500/10', target: '/admin/markets' },
    { label: 'Total Orders', value: s.total_orders, icon: ShoppingCart, color: 'text-red-500 bg-red-500/10', target: '/admin/reports' },
  ]

  const shortcuts = [
    { title: 'User Management', desc: 'Manage role access & status', icon: Users, href: '/admin/users', color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Farmer Approvals', desc: 'Review & approve farm stalls', icon: Leaf, href: '/admin/farmers', color: 'text-green-500 bg-green-500/10' },
    { title: 'Markets Directory', desc: 'Manage market locations', icon: Store, href: '/admin/markets', color: 'text-orange-500 bg-orange-500/10' },
    { title: 'Product Categories', desc: 'Organize produce categories', icon: Tag, href: '/admin/categories', color: 'text-pink-500 bg-pink-500/10' },
    { title: 'Product Moderation', desc: 'Inspect platform listings', icon: Package, href: '/admin/products', color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Reviews Moderation', desc: 'Moderate customer feedback', icon: Star, href: '/admin/reviews', color: 'text-purple-500 bg-purple-500/10' },
    { title: 'Reports & Revenue', desc: 'Platform order analytics', icon: BarChart2, href: '/admin/reports', color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'System Security', desc: 'Role enforcement & audit', icon: ShieldCheck, href: '/admin/users', color: 'text-indigo-500 bg-indigo-500/10' },
  ]

  return (
    <AppLayout>
      <div className="space-y-8">
        <div
          data-aos="fade-down"
          className="relative rounded-2xl overflow-hidden border shadow-lg h-48 bg-cover bg-center"
          style={{ backgroundImage: "url('/banner.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30 p-6 sm:p-8 flex flex-col justify-center text-white">
            <span className="text-xs font-bold uppercase tracking-widest text-green-400 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="size-3.5" /> Administrator Control Center
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Platform System Overview
            </h1>
            <p className="text-xs sm:text-sm text-white/85 max-w-md mt-1 leading-relaxed">
              Monitor user accounts, verify farmer stall applications, manage markets, and inspect platform analytics.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3">System Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))
              : cards.map(({ label, value, icon: Icon, color, target }) => (
                  <Card
                    key={label}
                    data-aos="fade-up"
                    onClick={() => navigate(target)}
                    className="backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 cursor-pointer transition-all duration-300 active:scale-[0.98]"
                  >
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardDescription className="font-medium">{label}</CardDescription>
                      <div className={`size-8 rounded-lg ${color} flex items-center justify-center`}>
                        <Icon className="size-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-3xl font-extrabold">{value ?? '—'}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        View details <ArrowRight className="size-3" />
                      </p>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>

        {/* Recent Order Notifications Module */}
        <div data-aos="fade-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Recent Order Notifications</h2>
              {notifications.filter((n) => !n.read_at).length > 0 && (
                <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 text-xs font-bold px-2 py-0.5 rounded-full">
                  {notifications.filter((n) => !n.read_at).length} unread
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/reports')}
              className="text-xs text-primary font-semibold hover:bg-primary/10 gap-1 h-8"
            >
              View All Orders <ArrowRight className="size-3" />
            </Button>
          </div>

          <Card className="backdrop-blur-md bg-card/80 border shadow-md overflow-hidden">
            {notificationsLoading ? (
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </CardContent>
            ) : notifications.length === 0 ? (
              <CardContent className="py-10 text-center text-muted-foreground space-y-2">
                <Bell className="size-8 mx-auto opacity-30" />
                <p className="text-xs font-medium">No order notifications received yet. System alerts will appear here when customers place orders.</p>
              </CardContent>
            ) : (
              <div className="divide-y divide-border/60">
                {notifications.slice(0, 5).map((n) => {
                  const data = n.data || {}
                  const isUnread = !n.read_at
                  const timeFormatted = data.placed_at
                    ? new Date(data.placed_at).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''

                  return (
                    <div
                      key={n.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isUnread ? 'bg-primary/5' : 'hover:bg-accent/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isUnread
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <ShoppingCart className="size-5" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground">
                              Order #{data.order_id || '—'}
                            </span>
                            {isUnread ? (
                              <Badge className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0 rounded-full">
                                New
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                Read
                              </Badge>
                            )}
                            {data.total_amount !== undefined && (
                              <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                                ${Number(data.total_amount).toFixed(2)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-foreground/80">
                            Customer: <span className="font-semibold">{data.customer_name || 'Customer'}</span>
                            {data.customer_email && ` (${data.customer_email})`}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                            {timeFormatted && <span>Placed: {timeFormatted}</span>}
                            {data.pickup_date && (
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                Pickup: {data.pickup_date} {data.pickup_time ? `(${data.pickup_time})` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center pl-13 sm:pl-0">
                        {isUnread && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleMarkAsRead(n.id, e)}
                            className="h-8 text-xs rounded-xl gap-1"
                          >
                            <Check className="size-3 text-emerald-600" />
                            Mark Read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => navigate('/admin/reports')}
                          className="h-8 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Inspect Order
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        <div data-aos="fade-up">
          <h2 className="text-lg font-bold mb-3">Management Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {shortcuts.map(({ title, desc, icon: Icon, href, color }) => (
              <Card
                key={title}
                onClick={() => navigate(href)}
                className="backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 cursor-pointer p-5 transition-all duration-300 active:scale-[0.98]"
              >
                <div className={`size-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                  <Icon className="size-5" />
                </div>
                <h3 className="font-bold text-sm leading-tight mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
