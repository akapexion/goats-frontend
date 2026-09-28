import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Store, Users, Clock, Navigation, ExternalLink, ChevronRight, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Helper to determine coordinates (real coordinates or city-based fallback)
export function getMarketCoordinates(market) {
  const lat = parseFloat(market.latitude)
  const lng = parseFloat(market.longitude)
  if (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    (lat !== 0 || lng !== 0)
  ) {
    return [lat, lng]
  }

  // Fallback coordinates based on Pakistani cities with distinct offsets per market ID
  const city = (market.city || '').toLowerCase()
  const id = Number(market.id) || 1
  const offsetLat = (((id * 3) % 9) - 4) * 0.012
  const offsetLng = (((id * 7) % 9) - 4) * 0.012

  if (city.includes('lahore')) return [31.5204 + offsetLat, 74.3587 + offsetLng]
  if (city.includes('islamabad')) return [33.6844 + offsetLat, 73.0479 + offsetLng]
  if (city.includes('rawalpindi')) return [33.5651 + offsetLat, 73.0169 + offsetLng]
  if (city.includes('faisalabad')) return [31.4504 + offsetLat, 73.1350 + offsetLng]
  if (city.includes('peshawar')) return [34.0151 + offsetLat, 71.5249 + offsetLng]
  if (city.includes('quetta')) return [30.1798 + offsetLat, 66.9750 + offsetLng]
  if (city.includes('multan')) return [30.1575 + offsetLat, 71.5249 + offsetLng]

  // Default Karachi
  return [24.8607 + offsetLat, 67.0011 + offsetLng]
}

// Haversine formula to compute great-circle distance between two GPS coordinates in kilometers
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// User Location Pin Icon
function createUserPinIcon() {
  return L.divIcon({
    className: 'custom-user-location-pin',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.25);
          border: 2px solid rgba(37, 99, 235, 0.5);
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: relative;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #2563eb;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

// Custom Marker Generator
function createMarketPinIcon(isSelected = false) {
  const color = isSelected ? '#059669' : '#0d9488'
  const ring = isSelected ? '#34d399' : '#ffffff'
  const scale = isSelected ? '1.15' : '1'

  return L.divIcon({
    className: 'custom-market-pin',
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));
        transform: translate(-50%, -100%) scale(${scale});
        transition: transform 0.2s ease;
        cursor: pointer;
      ">
        <svg width="38" height="38" viewBox="0 0 24 24" fill="${color}" stroke="${ring}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -38],
  })
}

export default function MarketsDiscoveryMap({
  markets = [],
  selectedMarketId = null,
  onMarketSelect,
  userLocation = null,
  className = '',
}) {
  const navigate = useNavigate()
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  const [activeMarket, setActiveMarket] = useState(null)

  // Initialize and update Map with markers
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Avoid double initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      markersRef.current = {}
    }

    const map = L.map(mapContainerRef.current, {
      center: userLocation ? [userLocation.lat, userLocation.lng] : [24.8607, 67.0011],
      zoom: 11,
      scrollWheelZoom: true,
      zoomControl: true,
    })

    // OpenStreetMap Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    // Delegated click handler on map container to navigate when popup buttons are clicked
    const container = mapContainerRef.current
    const handlePopupClick = (e) => {
      const btn = e.target.closest('[data-market-action]')
      if (!btn) return
      e.preventDefault()
      e.stopPropagation()

      const action = btn.getAttribute('data-market-action')
      const marketId = btn.getAttribute('data-market-id')

      if (action === 'farmers') {
        navigate(`/farmers?market_id=${marketId}`)
      } else if (action === 'detail') {
        navigate(`/markets/${marketId}`)
      }
    }

    container.addEventListener('click', handlePopupClick)

    // Render Markers for Markets
    const markerGroup = []
    markersRef.current = {}

    // Add User Current Location Marker if available
    if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
      const userCoords = [userLocation.lat, userLocation.lng]
      const userMarker = L.marker(userCoords, {
        icon: createUserPinIcon(),
        zIndexOffset: 1000,
      }).addTo(map)

      const userPopup = `
        <div style="font-family: inherit; min-width: 180px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: #1d4ed8; font-size: 13px;">
            <span>Your Location</span>
          </div>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">
            Market distances are calculated from here
          </p>
        </div>
      `
      userMarker.bindPopup(userPopup)
      userMarker.bindTooltip('<b>Your Current Location</b>', { direction: 'top', offset: [0, -16] })
      markerGroup.push(userCoords)
    }

    markets.forEach((m) => {
      const coords = getMarketCoordinates(m)
      const farmersCount = m.farmers_count ?? (m.farmers?.length || 1)
      const isSelected = selectedMarketId === m.id

      const marker = L.marker(coords, {
        icon: createMarketPinIcon(isSelected),
      }).addTo(map)

      // Rich HTML Popup Content
      const popupHtml = `
        <div style="font-family: inherit; min-width: 240px; padding: 4px 2px;" class="market-map-popup">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <strong style="font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.25;">
              ${m.name}
            </strong>
            <span style="font-size: 10px; background: #ecfdf5; color: #047857; font-weight: 700; padding: 2px 7px; border-radius: 9999px; white-space: nowrap; border: 1px solid #a7f3d0;">
              ${m.city || 'Verified'}
            </span>
          </div>

          <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0; display: flex; align-items: flex-start; gap: 4px;">
            <span>${m.address || 'Central Community Ground'}</span>
          </p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; margin-bottom: 10px; font-size: 11px; color: #334155;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span><b>Days:</b> ${m.open_days || 'Saturday, Sunday'}</span>
            </div>
            <div style="color: #64748b;">
               <b>Hours:</b> ${m.open_time && m.close_time ? `${m.open_time} - ${m.close_time}` : '08:00 AM - 02:00 PM'}
            </div>
            <div style="margin-top: 5px; color: #047857; font-weight: 600;">
               ${farmersCount} Participating Farmers
            </div>
            ${
              m.distance !== undefined
                ? `<div style="margin-top: 4px; color: #2563eb; font-weight: 600;">
                     ${m.distance < 1 ? Math.round(m.distance * 1000) + ' m away' : m.distance.toFixed(1) + ' km away'}
                  </div>`
                : ''
            }
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px;">
            <button
              type="button"
              data-market-action="farmers"
              data-market-id="${m.id}"
              style="width: 100%; background: #059669; color: #ffffff; border: none; font-weight: 600; font-size: 12px; padding: 7px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"
            >
              <span>Meet Participating Farmers</span>
            </button>
            <div style="display: flex; gap: 6px;">
              <button
                type="button"
                data-market-action="detail"
                data-market-id="${m.id}"
                style="flex: 1; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; font-weight: 600; font-size: 11px; padding: 6px 10px; border-radius: 6px; cursor: pointer; text-align: center;"
              >
                Market Details
              </button>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}"
                target="_blank"
                rel="noopener noreferrer"
                style="flex: 1; background: #ffffff; color: #2563eb; border: 1px solid #93c5fd; font-weight: 600; font-size: 11px; padding: 6px 10px; border-radius: 6px; text-decoration: none; text-align: center; display: inline-block;"
              >
                Directions 
              </a>
            </div>
          </div>
        </div>
      `

      marker.bindPopup(popupHtml, { maxWidth: 300, minWidth: 240 })

      marker.on('click', () => {
        setActiveMarket(m)
        if (onMarketSelect) onMarketSelect(m)
      })

      // Tooltip on hover
      marker.bindTooltip(`<b>${m.name}</b><br/>${m.city || ''}`, { direction: 'top', offset: [0, -36] })

      markersRef.current[m.id] = { marker, coords, market: m }
      markerGroup.push(coords)
    })

    // Fit map bounds to encompass all visible markers
    if (markerGroup.length > 1) {
      const bounds = L.latLngBounds(markerGroup)
      map.fitBounds(bounds.pad(0.18))
    } else if (markerGroup.length === 1) {
      map.setView(markerGroup[0], 13)
    }

    // Delayed size invalidation
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }, 250)

    return () => {
      clearTimeout(timer)
      container.removeEventListener('click', handlePopupClick)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      markersRef.current = {}
    }
  }, [markets, navigate, onMarketSelect, userLocation?.lat, userLocation?.lng])

  // Handle external selection change
  useEffect(() => {
    if (!selectedMarketId || !mapInstanceRef.current) return
    const target = markersRef.current[selectedMarketId]
    if (target) {
      mapInstanceRef.current.flyTo(target.coords, 14, { duration: 1.0 })
      target.marker.openPopup()
      setActiveMarket(target.market)
    }
  }, [selectedMarketId])

  const handleResetBounds = () => {
    const coordsList = Object.values(markersRef.current).map((item) => item.coords)
    if (coordsList.length > 1 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(coordsList).pad(0.18))
    } else if (coordsList.length === 1 && mapInstanceRef.current) {
      mapInstanceRef.current.setView(coordsList[0], 13)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Display Box */}
      <div className="relative rounded-2xl overflow-hidden border shadow-md bg-accent/30 h-80 md:h-96">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Quick Action Overlay */}
        <div className="absolute top-3 right-3 z-[400] flex gap-2">
          {userLocation && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                if (mapInstanceRef.current && userLocation) {
                  mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1.0 })
                }
              }}
              className="h-8 text-xs bg-background/90 backdrop-blur-sm border shadow-sm font-semibold hover:bg-background text-blue-600 dark:text-blue-400"
            >
              <Navigation className="size-3 mr-1" />
              My Location
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleResetBounds}
            className="h-8 text-xs bg-background/90 backdrop-blur-sm border shadow-sm font-semibold hover:bg-background"
          >
            <Navigation className="size-3 mr-1 text-emerald-600" />
            Fit All Markets
          </Button>
        </div>

        {/* Floating Banner Tip */}
        <div className="absolute top-3 left-3 z-[400] pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-background/90 text-foreground border shadow-md backdrop-blur-sm">
            <Sparkles className="size-3.5 text-emerald-600 animate-pulse" />
            Click any pin to inspect market & farmers
          </span>
        </div>
      </div>

      {/* Selected Market Spotlight Bar */}
      {activeMarket && (
        <div className="p-4 rounded-2xl border bg-card/90 shadow-sm backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Store className="size-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-foreground text-sm md:text-base">{activeMarket.name}</h4>
                {activeMarket.city && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                    {activeMarket.city}
                  </Badge>
                )}
                {activeMarket.distance !== undefined && (
                  <Badge variant="outline" className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300">
                    📍 {activeMarket.distance < 1 ? `${Math.round(activeMarket.distance * 1000)} m` : `${activeMarket.distance.toFixed(1)} km`} away
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3 text-emerald-600 shrink-0" />
                {activeMarket.address || 'Central Community Ground'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="size-3 text-amber-500" />
                  {activeMarket.open_days || 'Sat, Sun'} {activeMarket.open_time && `(${activeMarket.open_time}-${activeMarket.close_time})`}
                </span>
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <Users className="size-3" />
                  {activeMarket.farmers_count ?? (activeMarket.farmers?.length || 1)} Farmers
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => navigate(`/farmers?market_id=${activeMarket.id}`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-sm"
            >
              <Users className="size-3.5" />
              Meet Participating Farmers
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/markets/${activeMarket.id}`)}
              className="text-xs h-9 px-3 rounded-xl gap-1"
            >
              Details
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setActiveMarket(null)}
              className="size-8 rounded-full text-muted-foreground hover:text-foreground"
              title="Close spotlight"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
