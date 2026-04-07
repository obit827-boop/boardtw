'use client'

import { useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Billboard } from '@/types/database'
import { MAPBOX_DEFAULT_CENTER, MAPBOX_DEFAULT_ZOOM } from '@/lib/constants'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

interface MapViewProps {
  billboards: Billboard[]
  onBoundsChange?: (bounds: MapBounds) => void
  selectedId?: string | null
}

function formatPrice(price: number | null): string {
  if (price == null) return '洽詢'
  return `NT$${price.toLocaleString()}/月`
}

export default function MapView({ billboards, onBoundsChange, selectedId }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const popupRef = useRef<mapboxgl.Popup | null>(null)

  const emitBounds = useCallback(() => {
    if (!mapRef.current || !onBoundsChange) return
    const bounds = mapRef.current.getBounds()
    if (!bounds) return
    onBoundsChange({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    })
  }, [onBoundsChange])

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: MAPBOX_DEFAULT_CENTER,
      zoom: MAPBOX_DEFAULT_ZOOM,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('moveend', emitBounds)
    map.on('load', emitBounds)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [emitBounds])

  // Sync markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const currentIds = new Set(billboards.map((b) => b.id))

    // Remove stale markers
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    })

    // Add or update markers
    billboards.forEach((b) => {
      if (b.lat == null || b.lng == null) return

      let marker = markersRef.current.get(b.id)

      if (!marker) {
        const el = document.createElement('div')
        el.className = 'boardtw-marker'
        el.style.width = '28px'
        el.style.height = '28px'
        el.style.borderRadius = '50%'
        el.style.border = '3px solid white'
        el.style.cursor = 'pointer'
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)'
        el.style.transition = 'transform 0.15s, background 0.15s'

        marker = new mapboxgl.Marker({ element: el })
          .setLngLat([b.lng, b.lat])
          .addTo(map)

        el.addEventListener('click', () => {
          if (popupRef.current) popupRef.current.remove()

          const popup = new mapboxgl.Popup({ offset: 20, closeButton: true })
            .setLngLat([b.lng!, b.lat!])
            .setHTML(
              `<div style="font-family:system-ui;padding:4px 0;">
                <a href="/billboards/${b.id}" style="font-weight:600;font-size:14px;color:#2563EB;text-decoration:none;">${b.title}</a>
                <div style="margin-top:4px;font-size:13px;font-weight:700;color:#111;">${formatPrice(b.price_monthly)}</div>
              </div>`,
            )
            .addTo(map)

          popupRef.current = popup
        })

        markersRef.current.set(b.id, marker)
      } else {
        marker.setLngLat([b.lng, b.lat])
      }

      // Highlight selected
      const el = marker.getElement()
      const isSelected = b.id === selectedId
      el.style.background = isSelected ? '#F59E0B' : '#2563EB'
      el.style.transform = isSelected ? 'scale(1.3)' : 'scale(1)'
      el.style.zIndex = isSelected ? '10' : '1'
    })
  }, [billboards, selectedId])

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-[300px] rounded-xl overflow-hidden"
    />
  )
}
