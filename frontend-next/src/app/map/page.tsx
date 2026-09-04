'use client';

import dynamic from 'next/dynamic';
import DashboardLayout from '@/src/components/layout/DashboardLayout';
import DistrictPanelCompact from '@/src/components/ui/DistrictPanelCompact';
import SensorDetailCompact from '@/src/components/ui/SensorDetailCompact';

// Dynamic import for Leaflet (no SSR)
const MapContainer = dynamic(() => import('@/src/components/map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center glass rounded-2xl">
      <div className="flex flex-col items-center gap-2.5">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-emerald-400"></div>
        <span className="text-aeter-ink-soft text-xs">Loading map vector layer...</span>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <DashboardLayout 
      title="Geographic Telemetry Map" 
      subtitle="Spatial distribution and load metrics of grid and solar sensors across municipal districts"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map - Takes 3 columns */}
        <div className="lg:col-span-3 h-[calc(100vh-190px)] min-h-[500px]">
          <div className="h-full rounded-2xl overflow-hidden glass shadow-glass">
            <MapContainer />
          </div>
        </div>

        {/* Right Panel - District & Sensor Detail */}
        <div className="lg:col-span-1 space-y-4">
          <DistrictPanelCompact />
          <SensorDetailCompact />
        </div>
      </div>
    </DashboardLayout>
  );
}
