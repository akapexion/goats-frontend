import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

const CART_STORAGE_KEY = 'marketlink_cart'

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {}
  }, [cart])

  const addToCart = (product, quantity = 1) => {
    if (!product || !product.id) return
    const currentQty = cart[product.id]?.quantity || 0
    const maxStock = product.stock_quantity ?? 999
    const newQty = Math.min(maxStock, currentQty + quantity)

    if (currentQty >= maxStock) {
      toast.error(`Only ${maxStock} ${product.unit || 'unit'}(s) available in stock.`)
      return
    }

    setCart((prev) => ({
      ...prev,
      [product.id]: {
        product,
        quantity: newQty,
      },
    }))
    toast.success(`Added ${product.name} to cart`)
  }

  const updateQuantity = (productId, quantity) => {
    setCart((prev) => {
      const current = prev[productId]
      if (!current) return prev

      if (quantity <= 0) {
        const next = { ...prev }
        delete next[productId]
        return next
      }

      const maxStock = current.product?.stock_quantity ?? 999
      const cappedQty = Math.min(maxStock, quantity)

      return {
        ...prev,
        [productId]: {
          ...current,
          quantity: cappedQty,
        },
      }
    })
  }

  const removeFromCart = (productId) => {
    setCart((prev) => {
      if (!prev[productId]) return prev
      const next = { ...prev }
      delete next[productId]
      return next
    })
    toast.success('Removed from cart')
  }

  const clearCart = () => {
    setCart({})
  }

  const cartEntries = Object.values(cart)
  const cartCount = cartEntries.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const cartTotal = cartEntries.reduce((sum, item) => {
    const price = Number(item.product?.price) || 0
    return sum + price * (item.quantity || 0)
  }, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cartEntries,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
