import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '@/lib/axios'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

const WishlistContext = createContext(null)

const WISHLIST_STORAGE_KEY = 'marketlink_wishlist'

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [loading, setLoading] = useState(false)

  const fetchWishlist = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const { data } = await api.get('/customer/favorites')
      const items = data.data || []
      setWishlist(items)
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore background fetch error
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      setWishlist([])
      try {
        localStorage.removeItem(WISHLIST_STORAGE_KEY)
      } catch {}
    }
  }, [user, fetchWishlist])

  const isWishlisted = (productId) => {
    return wishlist.some(
      (item) =>
        item.favoritable_id === Number(productId) ||
        item.favoritable?.id === Number(productId)
    )
  }

  const getFavoriteId = (productId) => {
    const found = wishlist.find(
      (item) =>
        item.favoritable_id === Number(productId) ||
        item.favoritable?.id === Number(productId)
    )
    return found ? found.id : null
  }

  const toggleWishlist = async (product) => {
    if (!user) {
      return { requiresLogin: true }
    }

    const productId = Number(product.id)
    const existingFavId = getFavoriteId(productId)

    if (existingFavId) {
      try {
        await api.delete(`/customer/favorites/${existingFavId}`)
        setWishlist((prev) => {
          const next = prev.filter((item) => item.id !== existingFavId)
          localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next))
          return next
        })
        toast.success(`Removed ${product.name} from wishlist`)
        return { success: true, wishlisted: false }
      } catch {
        toast.error('Failed to remove from wishlist')
        return { success: false }
      }
    } else {
      try {
        const { data } = await api.post('/customer/favorites', {
          favoritable_type: 'product',
          favoritable_id: productId,
        })
        const newFav = data.data || {
          id: data.favorite_id || Date.now(),
          favoritable_id: productId,
          favoritable_type: 'App\\Models\\Product',
          favoritable: product,
        }
        setWishlist((prev) => {
          const next = [newFav, ...prev]
          localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next))
          return next
        })
        toast.success(`Added ${product.name} to wishlist`)
        return { success: true, wishlisted: true }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add to wishlist')
        return { success: false }
      }
    }
  }

  const removeFromWishlist = async (favoriteId) => {
    try {
      await api.delete(`/customer/favorites/${favoriteId}`)
      setWishlist((prev) => {
        const next = prev.filter((item) => item.id !== favoriteId)
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next))
        return next
      })
      toast.success('Removed from wishlist')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
