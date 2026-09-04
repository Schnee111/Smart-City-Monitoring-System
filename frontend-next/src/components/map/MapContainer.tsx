'use client';

import { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import useSWR from 'swr';
import { RefreshCw, Maximize2, Minus, Plus, Radio, Layers } from 'lucide-react';
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

// Custom SCADA HUD controls
function CustomControls() {
  const map = useMap();

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
      <button
        onClick={() => map.zoomIn()}
        className="w-8 h-8 bg-void-panel/90 hover:bg-void-surface border border-void-border hover:border-scada-cyan/50 rounded-lg flex items-center justify-center text-slate-300 hover:text-scada-cyan transition-colors shadow-lg"
        title="Zoom In"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-8 h-8 bg-void-panel/90 hover:bg-void-surface border border-void-border hover:border-scada-cyan/50 rounded-lg flex items-center justify-center text-slate-300 hover:text-scada-cyan transition-colors shadow-lg"
        title="Zoom Out"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => map.setView(JAKARTA_CENTER, DEFAULT_ZOOM)}
        className="w-8 h-8 bg-void-panel/90 hover:bg-void-surface border border-void-border hover:border-scada-cyan/50 rounded-lg flex items-center justify-center text-slate-300 hover:text-scada-cyan transition-colors shadow-lg"
        title="Reset to Jakarta Center"
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
  const [activeFilter, setActiveFilter] = useState<'all'|'active'|'inactive'|'solar'|'grid'>('all');
  const [focusedSensorId, setFocusedSensorId] = useState<string | null>(null);
  const { selectedDistrict } = useDashboardStore();

  // Fetch sensors with polling every 5 seconds
  const { data: sensors, error, isLoading, mutate } = useSWR<Sensor[]>(
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
    switch (activeFilter) {
      case 'active': return (s.status || '').toLowerCase() === 'active';
      case 'inactive': return (s.status || '').toLowerCase() !== 'active';
      case 'solar': return s.energySource === 'Solar';
      case 'grid': return s.energySource === 'Grid';
      case 'all':
      default: return true;
    }
  });

  const stats = {
    total: filteredSensors?.length || 0,
    active: filteredSensors?.filter(s => (s.status || '').toLowerCase() === 'active').length || 0,
    inactive: filteredSensors?.filter(s => (s.status || '').toLowerCase() !== 'active').length || 0,
    solar: filteredSensors?.filter(s => s.energySource === 'Solar').length || 0,
    grid: filteredSensors?.filter(s => s.energySource === 'Grid').length || 0,
  };

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-void rounded-xl border border-void-border">
        <div className="flex flex-col items-center gap-3 font-mono">
          <div className="animate-spin w-8 h-8 border-2 border-scada-cyan border-t-transparent rounded-full"></div>
          <span className="text-slate-400 text-xs tracking-wider uppercase">INITIALIZING CARTOGRAPHIC TELEMETRY...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-void rounded-xl border border-void-border">
        <div className="text-center font-mono">
          <div className="text-scada-rose text-sm mb-2 uppercase">TELEMETRY LINK FAILURE</div>
          <button
            onClick={() => mutate()}
            className="text-xs text-scada-cyan hover:underline flex items-center gap-1.5 mx-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            RE-ENGAGE FEED
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" style={{ height }}>
      <LeafletMap
        center={JAKARTA_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full rounded-xl"
        style={{ background: '#070A11' }}
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
        <div className="bg-void-panel/90 backdrop-blur-md border border-void-border rounded-lg p-1 flex gap-1 shadow-xl">
          {(Object.keys(MAP_STYLES) as Array<keyof typeof MAP_STYLES>).map((style) => (
            <button
              key={style}
              onClick={() => setMapStyle(style)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors ${
                mapStyle === style
                  ? 'bg-scada-cyan/20 border border-scada-cyan/40 text-scada-cyan'
                  : 'text-slate-400 hover:text-white hover:bg-void-surface'
              }`}
            >
              {style === 'dark' ? 'CARTO DARK' : style === 'satellite' ? 'SAT' : 'LIGHT'}
            </button>
          ))}
        </div>
      </div>

      {/* Telemetry feed status beacon */}
      {isLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-void-panel/90 backdrop-blur-md border border-scada-cyan/40 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
          <RefreshCw className="w-3 h-3 text-scada-cyan animate-spin" />
          <span className="text-[10px] font-mono text-scada-cyan tracking-wider uppercase">SYNCING MUNICIPAL BUS...</span>
        </div>
      )}

      {/* High-density Telemetry Node Bar at bottom */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000]">
        <div className="bg-void-panel/95 backdrop-blur-md border border-void-border rounded-lg px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-2xl">
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors ${
                activeFilter === 'all' ? 'bg-void-surface border-scada-cyan/40 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
              <span>NODES:</span>
              <span className="text-white font-bold">{stats.total}</span>
            </button>

            <button
              onClick={() => setActiveFilter(prev => prev === 'active' ? 'all' : 'active')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors ${
                activeFilter === 'active' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' : 'border-transparent text-slate-400 hover:text-emerald-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ACTIVE:</span>
              <span className="text-emerald-400 font-bold">{stats.active}</span>
            </button>

            <button
              onClick={() => setActiveFilter(prev => prev === 'inactive' ? 'all' : 'inactive')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors ${
                activeFilter === 'inactive' ? 'bg-rose-500/15 border-rose-500/40 text-rose-400' : 'border-transparent text-slate-400 hover:text-rose-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              <span>OFFLINE:</span>
              <span className="text-rose-400 font-bold">{stats.inactive}</span>
            </button>

            <button
              onClick={() => setActiveFilter(prev => prev === 'solar' ? 'all' : 'solar')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors ${
                activeFilter === 'solar' ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : 'border-transparent text-slate-400 hover:text-amber-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>SOLAR:</span>
              <span className="text-amber-400 font-bold">{stats.solar}</span>
            </button>

            <button
              onClick={() => setActiveFilter(prev => prev === 'grid' ? 'all' : 'grid')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors ${
                activeFilter === 'grid' ? 'bg-blue-500/15 border-blue-500/40 text-blue-400' : 'border-transparent text-slate-400 hover:text-blue-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>GRID:</span>
              <span className="text-blue-400 font-bold">{stats.grid}</span>
            </button>
          </div>

          <button
            onClick={() => mutate()}
            className="text-slate-400 hover:text-scada-cyan p-1 rounded transition-colors ml-auto"
            title="Poll Now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {showLegend && <MapLegend />}
    </div>
  );
}
