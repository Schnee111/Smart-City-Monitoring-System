'use client';

import { useMemo, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Sun, 
  Building2,
  ArrowUpRight,
  Layers,
  Radio,
  CloudFog,
  Banknote
} from 'lucide-react';
import useSWR from 'swr';
import DashboardLayout from '@/src/components/layout/DashboardLayout';
import HistoricalEnergyChart from '@/src/components/ui/HistoricalEnergyChart';
import EnergyChart from '@/src/components/ui/EnergyChart';
import { fetcher } from '@/src/lib/fetcher';
import { Select } from '@/src/components/ui/Select';
import { useDashboardStore } from '@/src/lib/store';

// --- DEFINISI FETCHER KHUSUS ANALYTICS (COST & EMISSIONS) ---
type AnalyticsApiResponse<T> = { success: boolean; message?: string; data: T | null };
const analyticsFetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<AnalyticsApiResponse<number>>);

interface Sensor {
  sensorId: string;
  districtName: string;
  energySource: string;
  status: string;
  latestReading?: {
    kwhUsage: number;
    voltage: number;
  };
}

interface DistrictStats {
  districtName: string;
  totalSensors: number;
  avgConsumption: number;
  totalConsumption: number;
  solarPercentage: number;
}

export default function AnalyticsPage() {
  const [viewMode, setViewMode] = useState<'total' | 'sensor'>('total');
  const [selectedSensorId, setSelectedSensorId] = useState<string>('');
  const { setSelectedSensor } = useDashboardStore();
  
  // 1. DATA SENSORS
  const { data: sensors = [], isLoading: loading } = useSWR<Sensor[]>(
    '/sensors',
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 5000 }
  );

  // 2. DATA COST REALTIME
  const { 
    data: costData, 
    error: costError, 
    isLoading: costLoading 
  } = useSWR<AnalyticsApiResponse<number>>(
    '/api/v1/analytics/cost-realtime', 
    analyticsFetcher, 
    { refreshInterval: 30 * 1000 }
  );

  // 3. DATA EMISSIONS REALTIME (Logic Card dipindah ke sini)
  const { 
    data: emissionsData, 
    error: emissionsError, 
    isLoading: emissionsLoading 
  } = useSWR<AnalyticsApiResponse<number>>(
    '/api/v1/analytics/emissions-realtime', 
    analyticsFetcher, 
    { refreshInterval: 30 * 1000 }
  );

  // Handle sensor selection
  const handleSensorSelect = (sensorId: string) => {
    setSelectedSensorId(sensorId);
    const sensor = sensors.find(s => s.sensorId === sensorId);
    if (sensor) {
      setSelectedSensor(sensor as any);
    }
  };

  // Calculate district stats logic...
  const districtStats = useMemo(() => {
    const districtMap = new Map<string, { sensors: Sensor[]; solar: number; total: number }>();
    
    sensors.forEach(sensor => {
      const district = sensor.districtName;
      if (!districtMap.has(district)) {
        districtMap.set(district, { sensors: [], solar: 0, total: 0 });
      }
      const data = districtMap.get(district)!;
      data.sensors.push(sensor);
      data.total += sensor.latestReading?.kwhUsage || 0;
      if (sensor.energySource === 'Solar') {
        data.solar++;
      }
    });

    const stats: DistrictStats[] = [];
    districtMap.forEach((data, districtName) => {
      stats.push({
        districtName,
        totalSensors: data.sensors.length,
        avgConsumption: data.total / data.sensors.length,
        totalConsumption: data.total,
        solarPercentage: (data.solar / data.sensors.length) * 100
      });
    });

    return stats.sort((a, b) => b.totalConsumption - a.totalConsumption);
  }, [sensors]);

  const totalConsumption = districtStats.reduce((acc, d) => acc + d.totalConsumption, 0);
  const avgSolarPercentage = districtStats.length > 0 
    ? districtStats.reduce((acc, d) => acc + d.solarPercentage, 0) / districtStats.length 
    : 0;
  const totalSensors = districtStats.reduce((acc, d) => acc + d.totalSensors, 0);

  const rankedDistricts = [...districtStats].sort((a, b) => b.totalConsumption - a.totalConsumption);

  return (
    <DashboardLayout 
      title="Analytics & Grid Insights" 
      subtitle="Comprehensive statistics, emissions offset, and district energy allocation"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center">
              <Zap className="w-4 h-4 text-sky-400" />
            </div>
            <span className="flex items-center text-emerald-400 text-xs font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> 12%
            </span>
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-white mt-3">
            {totalConsumption.toFixed(1)} <span className="text-xs text-aeter-ink-mute font-normal">kWh</span>
          </p>
          <p className="text-aeter-ink-soft text-xs mt-0.5">Total Consumption</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <span className="flex items-center text-emerald-400 text-xs font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> 5%
            </span>
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-white mt-3">
            {avgSolarPercentage.toFixed(1)} <span className="text-xs text-aeter-ink-mute font-normal">%</span>
          </p>
          <p className="text-aeter-ink-soft text-xs mt-0.5">Solar Share Ratio</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-white mt-3">
            {districtStats.length} <span className="text-xs text-aeter-ink-mute font-normal">Districts</span>
          </p>
          <p className="text-aeter-ink-soft text-xs mt-0.5">Monitored Districts</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-white mt-3">
            {totalSensors} <span className="text-xs text-aeter-ink-mute font-normal">Nodes</span>
          </p>
          <p className="text-aeter-ink-soft text-xs mt-0.5">Active Sensors</p>
        </div>
      </div>
      
      <div className="gap-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* --- ENERGY COST REALTIME --- */}
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-aeter-ink-soft text-xs mb-0.5">Electricity Cost (Grid Ingest)</p>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                <span className="text-xs text-aeter-ink-mute font-normal">Rp </span>
                {costLoading ? (
                  <span className="text-sm text-aeter-ink-mute">Loading...</span>
                ) : (costError || !costData || !costData.success) ? (
                  <span className="text-sm text-aeter-ink-mute">N/A</span>
                ) : (
                  <span>
                    {Number(costData.data ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* --- EMISSIONS CARD --- */}
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
              <CloudFog className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-aeter-ink-soft text-xs mb-0.5">Carbon Footprint (CO2 Offset)</p>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                {emissionsLoading ? (
                  <span className="text-sm text-aeter-ink-mute">Loading...</span>
                ) : (emissionsError || !emissionsData || !emissionsData.success) ? (
                  <span className="text-sm text-aeter-ink-mute">N/A</span>
                ) : (
                  <span>
                    {Number(emissionsData.data ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                  </span>
                )}<span className="text-xs text-aeter-ink-mute font-normal"> kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="mb-6">
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/8">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-white font-semibold text-xs tracking-tight">Real-time Energy Telemetry</h3>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex bg-white/5 border border-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('total')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                    viewMode === 'total' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Total
                </button>
                <button
                  onClick={() => setViewMode('sensor')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                    viewMode === 'sensor' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  Per Sensor
                </button>
              </div>
              
              {/* Sensor Selector */}
              {viewMode === 'sensor' && (
                <Select
                  value={selectedSensorId}
                  onChange={(e) => handleSensorSelect(e.target.value)}
                  options={[
                    { value: '', label: 'Pilih Sensor...' },
                    ...sensors.map(s => ({
                      value: s.sensorId,
                      label: `${s.sensorId.slice(0, 8)}... (${s.districtName})`
                    }))
                  ]}
                  className="w-56"
                />
              )}
            </div>
          </div>
          
          <div className="p-4">
            {viewMode === 'total' ? (
              <HistoricalEnergyChart showModeToggle={true} height={320} />
            ) : (
              <div>
                {selectedSensorId ? (
                  <EnergyChart />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
                    <Radio className="w-12 h-12 mb-3 opacity-50" />
                    <p className="font-medium">Pilih sensor untuk melihat data</p>
                    <p className="text-sm text-slate-500">Gunakan dropdown di atas untuk memilih sensor</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* District Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* District Consumption Comparison */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-white/8">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-white font-semibold text-xs tracking-tight">Consumption per District</h3>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-emerald-400"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {rankedDistricts.slice(0, 6).map((district, index) => {
                  const maxConsumption = rankedDistricts[0]?.totalConsumption || 1;
                  const percentage = (district.totalConsumption / maxConsumption) * 100;
                  
                  return (
                    <div key={district.districtName} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300 flex items-center gap-2">
                          <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-amber-500/20 text-amber-400' :
                            index === 1 ? 'bg-white/10 text-slate-300' :
                            index === 2 ? 'bg-orange-500/20 text-orange-400' :
                            'bg-white/5 text-slate-400'
                          }`}>
                            {index + 1}
                          </span>
                          {district.districtName}
                        </span>
                        <span className="text-white font-medium font-mono tabular-nums">
                          {district.totalConsumption.toFixed(1)} kWh
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Energy Source Distribution - Pie Chart */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-white/8">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h3 className="text-white font-semibold text-xs tracking-tight">Energy Source Share</h3>
          </div>
          <div className="p-4">
            <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
              {/* SVG Donut Chart */}
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.10)"
                    strokeWidth="3"
                    strokeDasharray="100 0"
                  />

                  {/* Solar (Amber) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#d99a2b"
                    strokeWidth="3"
                    strokeDasharray={`${avgSolarPercentage} ${100 - avgSolarPercentage}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>

                {/* Center Label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold font-mono tabular-nums text-white">
                      {avgSolarPercentage.toFixed(0)}%
                    </p>
                    <p className="text-xs text-aeter-ink-mute">Solar</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <span className="text-xs text-aeter-ink-soft">Solar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
                  <span className="text-xs text-aeter-ink-soft">Grid</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solar Percentage by District Table */}
      <div className="grid grid-cols-1 gap-6">
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-white/8">
            <Sun className="w-4 h-4 text-amber-400" />
            <h3 className="text-white font-semibold text-xs tracking-tight">Solar Energy Ratio per District</h3>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-emerald-400"></div>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/8 text-aeter-ink-mute">
                      <th className="text-left py-2.5 px-2 font-medium">District</th>
                      <th className="text-center py-2.5 px-2 font-medium">Sensors</th>
                      <th className="text-center py-2.5 px-2 font-medium">Solar Share</th>
                      <th className="text-right py-2.5 px-2 font-medium">Load Ingestion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {districtStats.map((district) => (
                      <tr key={district.districtName} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-2 text-white font-medium">{district.districtName}</td>
                        <td className="py-2.5 px-2 text-center text-aeter-ink-soft font-mono">{district.totalSensors}</td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-400 rounded-full"
                                style={{ width: `${district.solarPercentage}%` }}
                              />
                            </div>
                            <span className="text-amber-400 font-mono tabular-nums text-xs w-10 text-right">
                              {district.solarPercentage.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right text-emerald-400 font-mono tabular-nums font-semibold">
                          {district.totalConsumption.toFixed(1)} kWh
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
