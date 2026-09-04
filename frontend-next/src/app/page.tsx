'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Map, ArrowRight, Activity } from 'lucide-react';
import DashboardLayout from '@/src/components/layout/DashboardLayout';
import StatsCards from '@/src/components/ui/StatsCards';
import HistoricalEnergyChart from '@/src/components/ui/HistoricalEnergyChart';
import WeatherWidget from '@/src/components/ui/WeatherWidget';
import SolarSavingsCard from '@/src/components/ui/SolarSavingsCard';

// Dynamic import for Leaflet (no SSR)
const MapContainer = dynamic(() => import('@/src/components/map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] flex items-center justify-center glass rounded-2xl">
      <div className="flex flex-col items-center gap-2.5">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-emerald-400"></div>
        <span className="text-aeter-ink-soft text-xs">Loading geographic map...</span>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <DashboardLayout 
      title="Municipal Energy Overview" 
      subtitle="Aggregated energy ingestion and clean solar telemetry across city districts"
    >
      {/* Solar Savings Banner Card */}
      <div className="mb-4">
        <SolarSavingsCard />
      </div>

      {/* Bento Grid Stats Cards Row */}
      <StatsCards />

      {/* Map + Weather Row */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Preview - Takes 2 columns */}
        <div className="lg:col-span-2 glass rounded-2xl overflow-hidden flex flex-col shadow-glass">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-aeter-ink-soft" />
              <h3 className="text-white font-semibold text-xs tracking-tight">Geographic Grid Distribution</h3>
            </div>
            <Link 
              href="/map"
              className="text-xs font-medium text-aeter-ink-soft hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Full Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex-1 min-h-[360px]">
            <MapContainer showLegend={false} showControls={false} />
          </div>
        </div>

        {/* Weather Widget */}
        <div className="lg:col-span-1">
          <WeatherWidget cityName="Bandarlampung" latitude={-5.4500} longitude={105.2667} />
        </div>
      </div>

      {/* Energy Chart - Full Width */}
      <div className="mt-4 glass rounded-2xl overflow-hidden shadow-glass">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-aeter-ink-soft" />
            <h3 className="text-white font-semibold text-xs tracking-tight">Real-time & Historical Energy Telemetry</h3>
          </div>
          <Link 
            href="/analytics"
            className="text-xs font-medium text-aeter-ink-soft hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Detailed Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="p-4">
          <HistoricalEnergyChart showModeToggle={true} />
        </div>
      </div>
    </DashboardLayout>
  );
}
