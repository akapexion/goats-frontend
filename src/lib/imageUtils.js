const BASE_URL = 'http://localhost:8000/storage'

// Per-category Unsplash fallback images for demo products
const CATEGORY_FALLBACKS = {
  'Vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  'Fresh Fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80',
  'Fresh Herbs': 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&q=80',
  'Dairy & Eggs': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
  'Honey & Preserves': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80',
  'Grains & Flour': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
  'Organic': 'https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=400&q=80',
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1506484381205-f7945653044d?w=400&q=80'

/**
 * Builds the full image URL for a product.
 * Handles: null, bare filename (missing products/ prefix), and correct path.
 */
export function getProductImageUrl(imagePath) {
  if (!imagePath) return null

  // Already has the subfolder prefix (e.g. "products/filename.jpg")
  if (imagePath.includes('/')) {
    return `${BASE_URL}/${imagePath}`
  }

  // Bare filename — prepend the products/ subfolder
  return `${BASE_URL}/products/${imagePath}`
}

/**
 * Returns a category-appropriate fallback image URL.
 */
export function getCategoryFallback(categoryName) {
  return CATEGORY_FALLBACKS[categoryName] || DEFAULT_FALLBACK
}
