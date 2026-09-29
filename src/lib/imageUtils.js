const BASE_URL = 'https://sfc-goats.oespk.com/storage/app/public'

export const PLACEHOLDER_PRODUCT_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='none'%3E%3Crect width='400' height='300' fill='%2310b98115'/%3E%3Cpath d='M200 110c-35 0-60 25-60 60 0 30 25 55 60 55s60-25 60-55c0-35-25-60-60-60z' fill='%2310b98130'/%3E%3Cpath d='M200 95c0-15 10-25 20-25' stroke='%23059669' stroke-width='4' stroke-linecap='round'/%3E%3Ctext x='200' y='250' font-family='sans-serif' font-size='14' font-weight='600' fill='%23059669' text-anchor='middle'%3EFarm Fresh Produce%3C/text%3E%3C/svg%3E"

export function getProductImageUrl(imagePath) {
  if (!imagePath) return null

  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:')
  ) {
    return imagePath
  }

  if (imagePath.startsWith('/storage/')) {
    return `https://sfc-goats.oespk.com${imagePath}`
  }
  if (imagePath.startsWith('storage/')) {
    return `https://sfc-goats.oespk.com/${imagePath}`
  }

  const cleanPath = imagePath.replace(/^\/+/, '')
  return `${BASE_URL}/${cleanPath}`
}

export function getCategoryFallback() {
  return PLACEHOLDER_PRODUCT_IMAGE
}

