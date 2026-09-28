import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Search, Locate, RotateCcw, Loader2, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Custom SVG Pin Icon for Leaflet
const createPinIcon = () => {
  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));
        transform: translate(-50%, -100%);
      ">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="#059669" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -36],
  })
}

// Default fallback coordinates: Karachi, Pakistan
const DEFAULT_CENTER = [24.8607, 67.0011]
const DEFAULT_ZOOM = 12

export default function LocationPickerMap({
  latitude,
  longitude,
  onLocationSelect,
  addressHint = '',
  className = '',
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [detectedAddress, setDetectedAddress] = useState('')

  const hasCoords =
    latitude !== '' &&
    latitude !== null &&
    latitude !== undefined &&
    longitude !== '' &&
    longitude !== null &&
    longitude !== undefined &&
    !isNaN(Number(latitude)) &&
    !isNaN(Number(longitude))

  const currentLat = hasCoords ? Number(Number(latitude).toFixed(6)) : null
  const currentLng = hasCoords ? Number(Number(longitude).toFixed(6)) : null

  // Reverse geocode to get human-readable location address
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'en' } }
      )
      if (!res.ok) return
      const data = await res.json()
      if (data && data.display_name) {
        setDetectedAddress(data.display_name)
      }
    } catch {
      // Silently ignore reverse geocode network issues
    }
  }, [])

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Avoid double initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const initialCenter = hasCoords ? [currentLat, currentLng] : DEFAULT_CENTER
    const initialZoom = hasCoords ? 14 : DEFAULT_ZOOM

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      scrollWheelZoom: true,
      zoomControl: true,
    })

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    // If initial coordinates exist, place the pin
    if (hasCoords) {
      const pinIcon = createPinIcon()
      const marker = L.marker([currentLat, currentLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map)

      marker.bindPopup(`<b>Selected Market Location</b><br/>Lat: ${currentLat}<br/>Lng: ${currentLng}`).openPopup()

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        const newLat = Number(pos.lat.toFixed(6))
        const newLng = Number(pos.lng.toFixed(6))
        marker.setPopupContent(`<b>Selected Market Location</b><br/>Lat: ${newLat}<br/>Lng: ${newLng}`).openPopup()
        onLocationSelect(newLat, newLng)
        reverseGeocode(newLat, newLng)
      })

      markerRef.current = marker
      reverseGeocode(currentLat, currentLng)
    }

    // Map Click Listener -> Moves or places the pin
    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      const newLat = Number(lat.toFixed(6))
      const newLng = Number(lng.toFixed(6))

      const pinIcon = createPinIcon()

      if (markerRef.current) {
        markerRef.current.setLatLng([newLat, newLng])
        markerRef.current.setPopupContent(`<b>Selected Market Location</b><br/>Lat: ${newLat}<br/>Lng: ${newLng}`).openPopup()
      } else {
        const marker = L.marker([newLat, newLng], {
          icon: pinIcon,
          draggable: true,
        }).addTo(map)

        marker.bindPopup(`<b>Selected Market Location</b><br/>Lat: ${newLat}<br/>Lng: ${newLng}`).openPopup()

        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          const dLat = Number(pos.lat.toFixed(6))
          const dLng = Number(pos.lng.toFixed(6))
          marker.setPopupContent(`<b>Selected Market Location</b><br/>Lat: ${dLat}<br/>Lng: ${dLng}`).openPopup()
          onLocationSelect(dLat, dLng)
          reverseGeocode(dLat, dLng)
        })

        markerRef.current = marker
      }

      onLocationSelect(newLat, newLng)
      reverseGeocode(newLat, newLng)
    })

    // Invalidate size to ensure full tile rendering in flex/grid containers
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }, 250)

    return () => {
      clearTimeout(timer)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      markerRef.current = null
    }
  }, []) // Mount once

  // Synchronize marker when external coordinates change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (hasCoords) {
      const pinIcon = createPinIcon()
      if (markerRef.current) {
        const pos = markerRef.current.getLatLng()
        if (pos.lat !== currentLat || pos.lng !== currentLng) {
          markerRef.current.setLatLng([currentLat, currentLng])
          markerRef.current.setPopupContent(`<b>Selected Market Location</b><br/>Lat: ${currentLat}<br/>Lng: ${currentLng}`)
        }
      } else {
        const marker = L.marker([currentLat, currentLng], {
          icon: pinIcon,
          draggable: true,
        }).addTo(map)

        marker.bindPopup(`<b>Selected Market Location</b><br/>Lat: ${currentLat}<br/>Lng: ${currentLng}`).openPopup()

        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          const newLat = Number(pos.lat.toFixed(6))
          const newLng = Number(pos.lng.toFixed(6))
          marker.setPopupContent(`<b>Selected Market Location</b><br/>Lat: ${newLat}<br/>Lng: ${newLng}`).openPopup()
          onLocationSelect(newLat, newLng)
          reverseGeocode(newLat, newLng)
        })

        markerRef.current = marker
      }
    } else {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      setDetectedAddress('')
    }
  }, [currentLat, currentLng, hasCoords, onLocationSelect, reverseGeocode])

  // Handle Search on Map
  const handleSearch = async (e) => {
    e?.preventDefault()
    const query = searchQuery.trim() || addressHint.trim()
    if (!query) return

    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const results = await res.json()
      if (results && results.length > 0) {
        const item = results[0]
        const lat = Number(Number(item.lat).toFixed(6))
        const lng = Number(Number(item.lon).toFixed(6))

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 })
        }

        onLocationSelect(lat, lng)
        setDetectedAddress(item.display_name || query)
      } else {
        alert('Location not found. Please try a different search or click on the map.')
      }
    } catch {
      alert('Unable to search location. Please click directly on the map.')
    } finally {
      setSearching(false)
    }
  }

  // Handle Get User Location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        const lat = Number(pos.coords.latitude.toFixed(6))
        const lng = Number(pos.coords.longitude.toFixed(6))

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 })
        }

        onLocationSelect(lat, lng)
        reverseGeocode(lat, lng)
      },
      () => {
        setLocating(false)
        alert('Unable to retrieve your current location. Please grant permission or click on the map.')
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  // Clear pin
  const handleClearPin = () => {
    onLocationSelect('', '')
    setDetectedAddress('')
  }

  return (
    <div className={`flex flex-col h-full space-y-2.5 ${className}`}>
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            placeholder={addressHint ? `Search "${addressHint}" or place...` : 'Search city, area or street...'}
            className="text-xs h-9 pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleSearch}
            disabled={searching || (!searchQuery.trim() && !addressHint.trim())}
            className="h-9 text-xs px-3 gap-1"
          >
            {searching ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
            <span>Search</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleLocateMe}
            disabled={locating}
            className="h-9 text-xs px-2.5 gap-1"
            title="Use my current location"
          >
            {locating ? <Loader2 className="size-3.5 animate-spin text-emerald-600" /> : <Locate className="size-3.5 text-emerald-600" />}
            <span className="hidden sm:inline">My Location</span>
          </Button>
          {hasCoords && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleClearPin}
              className="h-9 text-xs px-2 text-muted-foreground hover:text-destructive"
              title="Clear marker"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Interactive Map Box */}
      <div className="relative flex-1 min-h-[340px] sm:min-h-[380px] rounded-xl overflow-hidden border shadow-inner bg-accent/20">
        <div ref={mapContainerRef} className="w-full h-full z-0" style={{ minHeight: '340px' }} />

        {/* Tip Badge */}
        <div className="absolute top-2 left-2 z-[400] pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-background/90 text-foreground border shadow-sm backdrop-blur-sm">
            <MapPin className="size-3 text-emerald-600" />
            Click map or drag pin to place
          </span>
        </div>

        {/* Selected Coords Overlay */}
        {hasCoords && (
          <div className="absolute bottom-2 left-2 right-2 sm:right-auto z-[400] pointer-events-none">
            <div className="p-2 rounded-lg bg-background/95 border shadow-md backdrop-blur-sm text-xs space-y-0.5 max-w-sm">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                <Check className="size-3.5" />
                <span>Location Selected:</span>
                <span className="font-mono text-[11px] text-foreground font-normal">
                  {currentLat}, {currentLng}
                </span>
              </div>
              {detectedAddress && (
                <p className="text-[10px] text-muted-foreground line-clamp-1">
                  {detectedAddress}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper Footer */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
        <span>Click anywhere on the map to set market pin</span>
        {hasCoords ? (
          <Badge variant="outline" className="font-mono text-[10px] text-emerald-600 border-emerald-200">
            {currentLat}, {currentLng}
          </Badge>
        ) : (
          <span className="text-amber-600 dark:text-amber-400 font-medium">Pin not placed</span>
        )}
      </div>
    </div>
  )
}
