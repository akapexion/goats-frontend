import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { Package, ShoppingCart, DollarSign, Clock, Star, TrendingUp, Plus, UserCircle, MessageSquare, ArrowRight } from 'lucide-react'

export default function FarmerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/farmer/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = data?.stats
  const recentOrders = data?.recent_orders || []
  const topProducts = data?.top_products || []

  const statusColor = {
    placed: 'secondary', accepted: 'default', declined: 'destructive',
    ready: 'default', completed: 'outline', cancelled: 'destructive',
  }

  const noProfile = !loading && data === null

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
              <TrendingUp className="size-3.5" /> Stall Management Hub
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-white/85 max-w-md mt-1 leading-relaxed">
              Track farm inventory, process customer pre-orders, and monitor your total stall revenue.
            </p>
          </div>
        </div>

        {noProfile && (
          <Card data-aos="fade-up" className="border-amber-400 bg-amber-50 dark:bg-amber-950/30 glass-card">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-3">
                Your farmer profile is not set up yet. Complete your profile details to start listing farm products.
              </p>
              <Button size="sm" onClick={() => navigate('/farmer/profile')}>Set Up Profile Now</Button>
            </CardContent>
          </Card>
        )}

        {data?.approval_status === 'pending' && (
          <Card data-aos="fade-up" className="border-blue-400 bg-blue-50 dark:bg-blue-950/30 glass-card">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Your profile is pending admin verification. Products will become visible to customers once approved.
              </p>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-lg font-bold mb-3">Performance Metrics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
              ))
            ) : (
              <>
                <Card
                  data-aos="fade-up"
                  onClick={() => navigate('/farmer/products')}
                  className="backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 cursor-pointer transition-all duration-300 active:scale-[0.98]"
                >
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardDescription className="font-medium">Active Products</CardDescription>
                    <Package className="size-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-3xl font-extrabold">{stats?.total_products ?? 0}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      Manage catalog <ArrowRight className="size-3" />
                    </p>
                  </CardContent>
                </Card>

                <Card
                  data-aos="fade-up"
                  onClick={() => navigate('/farmer/orders')}
                  className="backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 cursor-pointer transition-all duration-300 active:scale-[0.98]"
                >
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardDescription className="font-medium">Pending Orders</CardDescription>
                    <Clock className="size-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-3xl font-extrabold">{stats?.pending_orders ?? 0}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      Process orders <ArrowRight className="size-3" />
                    </p>
                  </CardContent>
                </Card>

                <Card
                  data-aos="fade-up"
                  onClick={() => navigate('/farmer/orders')}
                  className="backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 cursor-pointer transition-all duration-300 active:scale-[0.98]"
                >
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardDescription className="font-medium">Total Orders</CardDescription>
                    <ShoppingCart className="size-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-3xl font-extrabold">{stats?.total_orders ?? 0}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      View all orders <ArrowRight className="size-3" />
                    </p>
                  </CardContent>
                </Card>

                <Card
                  data-aos="fade-up"
                  onClick={() => navigate('/farmer/orders')}
                  className="backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 cursor-pointer transition-all duration-300 active:scale-[0.98]"
                >
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardDescription className="font-medium">Total Earnings</CardDescription>
                    <DollarSign className="size-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-3xl font-extrabold">
                      ${Number(stats?.total_revenue ?? 0).toFixed(2)}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      Completed earnings <ArrowRight className="size-3" />
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        <div data-aos="fade-up">
          <h2 className="text-lg font-bold mb-3">Quick Management Shortcuts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: 'Add Product', desc: 'List new harvest items', icon: Plus, href: '/farmer/products', color: 'text-green-500 bg-green-500/10' },
              { title: 'Manage Orders', desc: 'Process customer pickups', icon: ShoppingCart, href: '/farmer/orders', color: 'text-amber-500 bg-amber-500/10' },
              { title: 'Customer Reviews', desc: 'View & reply to feedback', icon: MessageSquare, href: '/farmer/reviews', color: 'text-purple-500 bg-purple-500/10' },
              { title: 'Stall Profile', desc: 'Edit stall hours & address', icon: UserCircle, href: '/farmer/profile', color: 'text-blue-500 bg-blue-500/10' },
            ].map(({ title, desc, icon: Icon, href, color }) => (
              <Card
                key={title}
                onClick={() => navigate(href)}
                className="backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 cursor-pointer p-4 transition-all duration-300 active:scale-[0.98]"
              >
                <div className={`size-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                  <Icon className="size-5" />
                </div>
                <h3 className="font-bold text-sm leading-tight">{title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card data-aos="fade-right" className="backdrop-blur-md bg-card/80 border shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Recent Incoming Orders</CardTitle>
                <CardDescription className="text-xs">Latest customer pickup requests</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/farmer/orders')}>View All</Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : recentOrders.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-8">No incoming orders yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {recentOrders.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => navigate('/farmer/orders')}
                      className="backdrop-blur-sm bg-accent/40 border shadow-xs hover:-translate-y-0.5 hover:border-primary cursor-pointer flex items-center justify-between p-3 rounded-xl transition-all duration-200"
                    >
                      <div>
                        <p className="text-sm font-semibold">Order #{o.id}</p>
                        <p className="text-xs text-muted-foreground">{o.customer?.name || 'Customer'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold">${Number(o.total_amount).toFixed(2)}</span>
                        <Badge variant={statusColor[o.status] || 'secondary'} className="capitalize text-xs">{o.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-aos="fade-left" className="backdrop-blur-md bg-card/80 border shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-bold">Top Selling Products</CardTitle>
              <CardDescription className="text-xs">By total customer order volume</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : topProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No sales data yet.</p>
                  <Button className="mt-3" size="sm" onClick={() => navigate('/farmer/products')}>Add Products</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {topProducts.map((p, i) => (
                    <div
                      key={p.id}
                      onClick={() => navigate('/farmer/products')}
                      className="backdrop-blur-sm bg-accent/40 border shadow-xs hover:-translate-y-0.5 hover:border-primary cursor-pointer flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                    >
                      <span className="text-sm font-extrabold text-muted-foreground size-6 rounded-full bg-accent flex items-center justify-center shrink-0">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.order_items_count} orders placed</p>
                      </div>
                      <span className="text-sm font-extrabold">${Number(p.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
