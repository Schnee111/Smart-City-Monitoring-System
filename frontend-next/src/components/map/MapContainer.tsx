'use client';

import { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import useSWR from 'swr';
import { RefreshCw, Maximize2, Minus, Plus } from 'lucide-react';
import { fetcher } from '@/src/lib/fetcher';
import { useDashboardStore } from '@/src/lib/store';
import { Sensor } from '@/src/types';
import SensorMarker from './SensorMarker';
import MapLegend from './MapLegend';
import 'leaflet/dist/leaflet.css';

// Jakarta center coordinates
const JAKARTA_CENTER: [number, number] = [-6.2088, 106.8456];
const DEFAULT_ZOOM = 11;

// District center coordinates for auto-zoom
const DISTRICT_CENTERS: Record<string, { coords: [number, number], zoom: number }> = {
  'Jakarta Pusat': { coords: [-6.1862, 106.8063], zoom: 13 },
  'Jakarta Selatan': { coords: [-6.2615, 106.8106], zoom: 12 },
  'Jakarta Utara': { coords: [-6.1380, 106.8827], zoom: 12 },
  'Jakarta Barat': { coords: [-6.1670, 106.7390], zoom: 12 },
  'Jakarta Timur': { coords: [-6.2250, 106.9004], zoom: 12 },
  'Kepulauan Seribu': { coords: [-5.6108, 106.5260], zoom: 11 }
};

// Map vector tile styles: Primary is Dark Carto tiles
const MAP_STYLES = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
};

// Component to handle map flyTo with offset for better UX
function MapController() {
  const map = useMap();
  const { selectedSensor, selectedDistrict } = useDashboardStore();

  useEffect(() => {
    if (selectedSensor) {
      const mapSize = map.getSize();
      const targetPoint = map.project([selectedSensor.latitude, selectedSensor.longitude], 14);
      const offsetPoint = L.point(targetPoint.x, targetPoint.y - mapSize.y * 0.15);
      const targetLatLng = map.unproject(offsetPoint, 14);
      map.flyTo(targetLatLng, 14, { duration: 0.8, easeLinearity: 0.5 });
      return;
    }

    if (!selectedDistrict) {
      map.flyTo(JAKARTA_CENTER, DEFAULT_ZOOM, { duration: 0.8, easeLinearity: 0.5 });
    }
  }, [selectedSensor, selectedDistrict, map]);

  useEffect(() => {
    if (selectedDistrict) {
      const districtInfo = DISTRICT_CENTERS[selectedDistrict];
      if (districtInfo) {
        map.flyTo(districtInfo.coords, districtInfo.zoom, {
          duration: 1.0,
          easeLinearity: 0.5
        });
      }
    } else {
      map.flyTo(JAKARTA_CENTER, DEFAULT_ZOOM, {
        duration: 1.0,
        easeLinearity: 0.5
      });
    }
  }, [selectedDistrict, map]);

  return null;
}

// Clean Minimalist Map controls
function CustomControls() {
  const map = useMap();

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
      <button
        onClick={() => map.zoomIn()}
        className="w-8 h-8 glass-card-dark hover:bg-white/10 flex items-center justify-center text-aeter-ink-soft hover:text-white transition-colors shadow-glass rounded-xl"
        title="Zoom In"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-8 h-8 glass-card-dark hover:bg-white/10 flex items-center justify-center text-aeter-ink-soft hover:text-white transition-colors shadow-glass rounded-xl"
        title="Zoom Out"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => map.setView(JAKARTA_CENTER, DEFAULT_ZOOM)}
        className="w-8 h-8 glass-card-dark hover:bg-white/10 flex items-center justify-center text-aeter-ink-soft hover:text-white transition-colors shadow-glass rounded-xl"
        title="Reset View"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

interface MapContainerProps {
  height?: string;
  showLegend?: boolean;
  showControls?: boolean;
}

export default function MapContainer({ 
  height = '100%', 
  showLegend = true, 
  showControls = true 
}: MapContainerProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>('dark');
  const [focusedSensorId, setFocusedSensorId] = useState<string | null>(null);
  const { selectedDistrict } = useDashboardStore();

  // Fetch sensors with polling every 5 seconds
  const { data: sensors, error, mutate } = useSWR<Sensor[]>(
    '/api/v1/sensors',
    fetcher,
    { refreshInterval: 5000 }
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredSensors = selectedDistrict
    ? sensors?.filter(s => s.districtName === selectedDistrict)
    : sensors;

  const displayedSensors = (filteredSensors || []).filter(s => {
    if (focusedSensorId) return s.sensorId === focusedSensorId;
    return true;
  });

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center glass rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-emerald-400 rounded-full"></div>
          <span className="text-aeter-ink-soft text-xs">Loading map vector layer...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center glass rounded-2xl">
        <div className="text-center">
          <div className="text-rose-400 text-sm mb-2 font-medium">Unable to load telemetry points</div>
          <button
            onClick={() => mutate()}
            className="text-xs text-sky-400 hover:underline flex items-center gap-1.5 mx-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden" style={{ height }}>
      <LeafletMap
        center={JAKARTA_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full rounded-2xl"
        style={{ background: '#0f1117' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url={MAP_STYLES[mapStyle]}
          maxZoom={19}
        />
        
        <MapController />
        {showControls && <CustomControls />}

        {displayedSensors?.map((sensor) => (
          <SensorMarker
            key={sensor.sensorId}
            sensor={sensor}
            onClick={() => {
              setFocusedSensorId(prev => prev === sensor.sensorId ? null : sensor.sensorId);
            }}
          />
        ))}
      </LeafletMap>

      {/* Layer selector */}
      <div className="absolute top-3 left-3 z-[1000]">
        <div className="glass-card-dark p-1 flex gap-1 shadow-glass rounded-xl">
          {(Object.keys(MAP_STYLES) as Array<keyof typeof MAP_STYLES>).map((style) => (
            <button
              key={style}
              onClick={() => setMapStyle(style)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
                mapStyle === style
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-aeter-ink-soft hover:text-white hover:bg-white/5'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {showLegend && <MapLegend />}
    </div>
  );
}
