import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Package, Heart, DollarSign, Clock, Store, Leaf, ArrowRight, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    navigate('/', { replace: true })
  }, [navigate])

  const statusColor = {
    placed: 'secondary', accepted: 'default', declined: 'destructive',
    ready: 'default', completed: 'outline', cancelled: 'destructive',
  }

  const stats = data?.stats
  const recentOrders = data?.recent_orders || []

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
              <Sparkles className="size-3.5" /> Organic Farm Direct
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-white/85 max-w-md mt-1 leading-relaxed">
              Explore local harvests, manage your active pre-orders, and support nearby family farms.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            Activity Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
              ))
            ) : (
              <>
                <Card
                  data-aos="fade-up"
                  onClick={() => navigate('/customer/orders')}
                  className="backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 cursor-pointer transition-all duration-300 active:scale-[0.98]"
                >
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardDescription className="font-medium">Total Orders</CardDescription>
                    <ShoppingCart className="size-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-3xl font-extrabold">{stats?.total_orders ?? 0}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      Click to view history <ArrowRight className="size-3" />
                    </p>
                  </CardContent>
                </Card>

                <Card
                  data-aos="fade-up"
                  onClick={() => navigate('/customer/orders')}
                  className="backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 cursor-pointer transition-all duration-300 active:scale-[0.98]"
                >
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardDescription className="font-medium">Pending Pickup</CardDescription>
                    <Clock className="size-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-3xl font-extrabold">{stats?.pending_orders ?? 0}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      Check pickup dates <ArrowRight className="size-3" />
                    </p>
                  </CardContent>
                </Card>

                <Card
                  data-aos="fade-up"
                  onClick={() => navigate('/customer/orders')}
                  className="backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 cursor-pointer transition-all duration-300 active:scale-[0.98]"
                >
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardDescription className="font-medium">Completed</CardDescription>
                    <Package className="size-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-3xl font-extrabold">{stats?.completed_orders ?? 0}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      Leave reviews <ArrowRight className="size-3" />
                    </p>
                  </CardContent>
                </Card>

                <Card
                  data-aos="fade-up"
                  onClick={() => navigate('/customer/favorites')}
                  className="backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 cursor-pointer transition-all duration-300 active:scale-[0.98]"
                >
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardDescription className="font-medium">Saved Items</CardDescription>
                    <Heart className="size-4 text-rose-500" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-3xl font-extrabold">{stats?.favorites_count ?? 0}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      View saved stalls <ArrowRight className="size-3" />
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        <div data-aos="fade-up">
          <h2 className="text-lg font-bold mb-3">Quick Navigation</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: 'Browse Products', desc: 'Fresh seasonal crops', icon: Package, href: '/customer/products', color: 'text-green-500 bg-green-500/10' },
              { title: 'Find Farmers', desc: 'Local stalls & growers', icon: Leaf, href: '/customer/farmers', color: 'text-amber-500 bg-amber-500/10' },
              { title: 'Markets Directory', desc: 'Operating schedules', icon: Store, href: '/customer/markets', color: 'text-blue-500 bg-blue-500/10' },
              { title: 'Saved Stalls', desc: 'Favorite vendors', icon: Heart, href: '/customer/favorites', color: 'text-rose-500 bg-rose-500/10' },
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2" data-aos="fade-right">
            <Card className="backdrop-blur-md bg-card/80 border shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Recent Orders</CardTitle>
                  <CardDescription className="text-xs">Your latest market pre-orders</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/customer/orders')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <ShoppingCart className="size-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No orders yet.</p>
                    <Button className="mt-3" size="sm" onClick={() => navigate('/customer/products')}>
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {recentOrders.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => navigate('/customer/orders')}
                        className="backdrop-blur-sm bg-accent/40 border shadow-xs hover:-translate-y-0.5 hover:border-primary cursor-pointer flex items-center justify-between p-3.5 rounded-xl transition-all duration-200"
                      >
                        <div>
                          <p className="text-sm font-semibold">Order #{o.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {o.farmer?.stall_name || 'Farmer'} · {new Date(o.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-extrabold">${Number(o.total_amount).toFixed(2)}</span>
                          <Badge variant={statusColor[o.status] || 'secondary'} className="capitalize text-xs">
                            {o.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div data-aos="fade-left">
            <Card
              onClick={() => navigate('/customer/products')}
              className="backdrop-blur-md bg-gradient-to-br from-primary/10 via-accent/30 to-background border border-primary/20 hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 cursor-pointer p-6 text-center relative overflow-hidden transition-all duration-300 active:scale-[0.98]"
            >
              <div className="size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 shadow-md">
                <Leaf className="size-6" />
              </div>
              <h3 className="font-bold text-lg mb-1">Seasonal Harvest Alert</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Local organic strawberries and fresh heirloom tomatoes are now back in season. Pre-order before stocks run out!
              </p>
              <Button size="sm" className="w-full shadow-sm">
                Shop Seasonal Picks <ArrowRight className="size-4 ml-1" />
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
