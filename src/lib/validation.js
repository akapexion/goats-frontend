export const REGEX = {
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
  PHONE: /^(\+?[1-9]\d{1,14}|(\+92|0)?3[0-9]{9})$/,
  NAME: /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s'-]{2,100}$/,
  PRICE: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
  INTEGER: /^(0|[1-9]\d*)$/,
  TIME: /^([01]\d|2[0-3]):[0-5]\d$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
}

export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email address is required.'
  const trimmed = email.trim()
  if (trimmed.length > 100) return 'Email cannot exceed 100 characters.'
  if (!REGEX.EMAIL.test(trimmed)) return 'Please enter a valid email address (e.g. name@example.com).'
  return null
}

export function validatePassword(password, minLength = 8) {
  if (!password) return 'Password is required.'
  if (password.length < minLength) return `Password must be at least ${minLength} characters.`
  return null
}

export function validateName(name, fieldLabel = 'Name') {
  if (!name || !name.trim()) return `${fieldLabel} is required.`
  const trimmed = name.trim()
  if (trimmed.length < 2) return `${fieldLabel} must be at least 2 characters.`
  if (trimmed.length > 100) return `${fieldLabel} cannot exceed 100 characters.`
  if (!REGEX.NAME.test(trimmed)) return `${fieldLabel} can only contain letters, spaces, hyphens, and apostrophes.`
  return null
}

export function validatePhone(phone) {
  if (!phone || !phone.trim()) return null 
  const cleaned = phone.replace(/[\s-]/g, '')
  if (!REGEX.PHONE.test(cleaned)) {
    return 'Please enter a valid phone number (e.g. 03001234567 or +923001234567).'
  }
  return null
}

export function validateRequired(value, fieldLabel = 'This field') {
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
    return `${fieldLabel} is required.`
  }
  return null
}

export function validatePrice(price) {
  if (price === undefined || price === null || price === '') return 'Price is required.'
  const str = String(price).trim()
  if (!REGEX.PRICE.test(str)) return 'Please enter a valid price (e.g. 150 or 99.50).'
  const num = parseFloat(str)
  if (num <= 0) return 'Price must be greater than 0.'
  if (num > 999999.99) return 'Price cannot exceed 999,999.99.'
  return null
}

export function validateQuantity(quantity, maxStock = null) {
  if (quantity === undefined || quantity === null || quantity === '') return 'Quantity is required.'
  const str = String(quantity).trim()
  if (!REGEX.INTEGER.test(str)) return 'Quantity must be a valid whole number.'
  const num = parseInt(str, 10)
  if (num <= 0) return 'Quantity must be at least 1.'
  if (maxStock !== null && num > maxStock) return `Quantity cannot exceed available stock (${maxStock}).`
  return null
}

export function validateStock(stock) {
  if (stock === undefined || stock === null || stock === '') return 'Stock quantity is required.'
  const str = String(stock).trim()
  if (!REGEX.INTEGER.test(str)) return 'Stock must be a valid whole number (0 or more).'
  const num = parseInt(str, 10)
  if (num < 0) return 'Stock cannot be negative.'
  if (num > 1000000) return 'Stock cannot exceed 1,000,000.'
  return null
}

export function validateCoordinates(latitude, longitude) {
  const errors = {}
  if (latitude !== '' && latitude !== null && latitude !== undefined) {
    const lat = Number(latitude)
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = 'Latitude must be a valid number between -90 and 90.'
    }
  }
  if (longitude !== '' && longitude !== null && longitude !== undefined) {
    const lng = Number(longitude)
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = 'Longitude must be a valid number between -180 and 180.'
    }
  }
  return errors
}

export function validateFutureDate(dateStr, fieldLabel = 'Date') {
  if (!dateStr) return `${fieldLabel} is required.`
  const today = new Date().toISOString().split('T')[0]
  if (dateStr < today) return `${fieldLabel} cannot be in the past.`
  return null
}

export function validateRating(rating) {
  if (!rating || rating < 1 || rating > 5) return 'Please select a star rating between 1 and 5.'
  return null
}
