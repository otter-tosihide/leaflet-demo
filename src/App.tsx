import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Map, Satellite, Cloud } from 'lucide-react'

function App() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [mapType, setMapType] = useState<'normal' | 'satellite'>('normal')
  const [showRainRadar, setShowRainRadar] = useState(false)
  const rainRadarLayerRef = useRef<L.TileLayer | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView([35.6762, 139.6503], 6)

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    })

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    })

    if (mapType === 'normal') {
      osmLayer.addTo(map)
    } else {
      satelliteLayer.addTo(map)
    }

    mapInstanceRef.current = map

    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current!.removeLayer(layer)
      }
    })

    if (mapType === 'normal') {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current)
    } else {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }).addTo(mapInstanceRef.current)
    }

    if (showRainRadar && rainRadarLayerRef.current) {
      rainRadarLayerRef.current.addTo(mapInstanceRef.current)
    }
  }, [mapType])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    if (showRainRadar) {
      rainRadarLayerRef.current = L.tileLayer('https://www.jma.go.jp/bosai/forecast/data/forecast/{z}/{x}/{y}.png', {
        attribution: '© Japan Meteorological Agency',
        opacity: 0.6,
        maxZoom: 10
      })
      rainRadarLayerRef.current.addTo(mapInstanceRef.current)
    } else {
      if (rainRadarLayerRef.current) {
        mapInstanceRef.current.removeLayer(rainRadarLayerRef.current)
        rainRadarLayerRef.current = null
      }
    }
  }, [showRainRadar])

  return (
    <div className="h-screen w-full flex flex-col">
      <Card className="m-4 mb-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-6 w-6" />
            日本地図アプリ - Leaflet Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={mapType === 'normal' ? 'default' : 'outline'}
              onClick={() => setMapType('normal')}
              className="flex items-center gap-2"
            >
              <Map className="h-4 w-4" />
              通常の地図
            </Button>
            <Button
              variant={mapType === 'satellite' ? 'default' : 'outline'}
              onClick={() => setMapType('satellite')}
              className="flex items-center gap-2"
            >
              <Satellite className="h-4 w-4" />
              航空写真
            </Button>
            <Button
              variant={showRainRadar ? 'default' : 'outline'}
              onClick={() => setShowRainRadar(!showRainRadar)}
              className="flex items-center gap-2"
            >
              <Cloud className="h-4 w-4" />
              雨雲レーダー
            </Button>
          </div>
        </CardContent>
      </Card>
      <div ref={mapRef} className="flex-1 mx-4 mb-4 rounded-lg overflow-hidden border" />
    </div>
  )
}

export default App
