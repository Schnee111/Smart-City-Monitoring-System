'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Map, ArrowRight, Activity, Cpu } from 'lucide-react';
import DashboardLayout from '@/src/components/layout/DashboardLayout';
import StatsCards from '@/src/components/ui/StatsCards';
import HistoricalEnergyChart from '@/src/components/ui/HistoricalEnergyChart';
import WeatherWidget from '@/src/components/ui/WeatherWidget';
import SolarSavingsCard from '@/src/components/ui/SolarSavingsCard';

// Dynamic import for Leaflet (no SSR)
const MapContainer = dynamic(() => import('@/src/components/map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-void rounded-xl border border-void-border">
      <div className="flex flex-col items-center gap-3 font-mono">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-scada-cyan border-t-transparent"></div>
        <span className="text-slate-400 text-xs tracking-wider uppercase">INITIALIZING CARTOGRAPHIC TELEMETRY...</span>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <DashboardLayout 
      title="Municipal Command & Energy Grid" 
      subtitle="Real-time telemetry and SCADA automation across all district nodes"
    >
      {/* SOLAR SAVINGS */}
      <div className="mb-4">
        <SolarSavingsCard />
      </div>

      {/* Stats Cards Row */}
      <StatsCards />

      {/* Map + Weather Row */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Preview - Takes 2 columns */}
        <div className="lg:col-span-2 bg-void-panel/90 border border-void-border rounded-xl overflow-hidden flex flex-col shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-void-border bg-void/40">
            <div className="flex items-center gap-2 font-mono">
              <Map className="w-4 h-4 text-scada-cyan" />
              <h3 className="text-white font-semibold text-xs tracking-wider uppercase">GEO TELEMETRY MATRIX</h3>
            </div>
            <Link 
              href="/map"
              className="text-scada-cyan hover:text-white font-mono text-xs flex items-center gap-1 transition-colors"
            >
              FULL SCREEN <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex-1 min-h-[360px]">
            <MapContainer showLegend={false} showControls={false} />
          </div>
        </div>

        {/* Weather Widget */}
        <div className="lg:col-span-1">
          <WeatherWidget cityName="Jakarta" latitude={-6.2088} longitude={106.8456} />
        </div>
      </div>

      {/* Energy Chart - Full Width */}
      <div className="mt-4 bg-void-panel/90 border border-void-border rounded-xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-void-border bg-void/40 font-mono">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-scada-cyan" />
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase">INGESTION & HISTORICAL ENERGY TELEMETRY</h3>
          </div>
          <Link 
            href="/analytics"
            className="text-scada-cyan hover:text-white text-xs flex items-center gap-1 transition-colors"
          >
            ANALYTICS CORE <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-4">
          <HistoricalEnergyChart showModeToggle={true} />
        </div>
      </div>
    </DashboardLayout>
  );
}
