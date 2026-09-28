import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import ProductCard from '@/components/ProductCard'
import LoginRequiredModal from '@/components/LoginRequiredModal'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, ArrowLeft, Tag, Layers, ChevronRight } from 'lucide-react'

export default function CategoryDetail() {
  const { categoryId } = useParams()
  const navigate = useNavigate()

  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalMessage, setLoginModalMessage] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setNotFound(false)

    const fetchCategoryAndProducts = async () => {
      try {
        // Fetch category details
        let categoryData = null
        try {
          const catRes = await api.get(`/categories/${categoryId}`)
          categoryData = catRes.data?.data || null
        } catch {
          // If specific category endpoint fails, fallback to categories list
          const listRes = await api.get('/categories')
          const list = listRes.data?.data || []
          categoryData = list.find(
            (c) =>
              String(c.id) === String(categoryId) ||
              c.name.toLowerCase() === categoryId.toLowerCase().replace(/-/g, ' ') ||
              c.name.toLowerCase().replace(/\s+/g, '-') === categoryId.toLowerCase()
          )
        }

        if (!categoryData) {
          if (isMounted) {
            setNotFound(true)
            setLoading(false)
          }
          return
        }

        if (isMounted) setCategory(categoryData)

        // Fetch products strictly belonging to this category
        const params = {
          category_id: categoryData.id,
        }

        const prodRes = await api.get('/products', { params })
        const fetchedProducts = prodRes.data?.data?.data || prodRes.data?.data || []

        // Filter client-side as safeguard to ensure ONLY products belonging to this category are displayed
        const filtered = fetchedProducts.filter(
          (p) =>
            Number(p.category_id) === Number(categoryData.id) ||
            p.category?.id === categoryData.id ||
            p.category?.name?.toLowerCase() === categoryData.name?.toLowerCase()
        )

        if (isMounted) {
          setProducts(filtered)
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          toast.error('Failed to load category products')
          setLoading(false)
        }
      }
    }

    fetchCategoryAndProducts()

    return () => {
      isMounted = false
    }
  }, [categoryId])

  if (notFound && !loading) {
    return (
      <PageContainer>
        <div className="text-center py-20 bg-card rounded-2xl border shadow-sm space-y-4 max-w-xl mx-auto my-12 p-8">
          <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <Tag className="size-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Category Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The category &ldquo;{categoryId}&rdquo; does not exist or has been removed.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button onClick={() => navigate('/products')} variant="default" className="font-semibold gap-1.5">
              <ArrowLeft className="size-4" /> Browse All Products
            </Button>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <Link to="/products" className="hover:text-foreground transition-colors">
            Produce
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-bold">
            {category?.name || categoryId}
          </span>
        </div>

        {/* Category Hero Banner */}
        <div
          className="relative rounded-2xl overflow-hidden border shadow-lg h-52 bg-cover bg-center"
          style={{ backgroundImage: "url('/banner.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35 p-6 sm:p-10 flex flex-col justify-center text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <Layers className="size-3.5" /> Category Harvest
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {category?.name || 'Category'}
            </h1>
            <p className="text-xs sm:text-sm text-white/85 max-w-xl mt-1.5 leading-relaxed">
              {category?.description ||
                `Browse all verified farm-fresh ${category?.name || ''} harvested and listed directly by local farm stalls.`}
            </p>
          </div>
        </div>

        {/* Products Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                <Package className="size-5 text-emerald-600" />
                Category Listings
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Showing exclusively products categorized under &ldquo;{category?.name || categoryId}&rdquo;
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/products')}
              className="text-xs rounded-xl font-semibold gap-1.5"
            >
              <ArrowLeft className="size-3.5" /> All Categories
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border rounded-2xl p-4 space-y-3">
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border shadow-sm text-muted-foreground space-y-3">
              <Package className="size-12 mx-auto opacity-30 text-emerald-600" />
              <h3 className="font-bold text-base text-foreground">
                No Products Available in this Category
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Local farmers have not listed any available items under {category?.name || 'this category'} for this week&apos;s harvest.
              </p>
              <div className="pt-2">
                <Button onClick={() => navigate('/products')} size="sm" className="font-semibold">
                  Browse All Farm Produce
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onRequireLogin={(msg) => {
                    setLoginModalMessage(msg)
                    setShowLoginModal(true)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showLoginModal && (
        <LoginRequiredModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          message={loginModalMessage}
        />
      )}
    </PageContainer>
  )
}
