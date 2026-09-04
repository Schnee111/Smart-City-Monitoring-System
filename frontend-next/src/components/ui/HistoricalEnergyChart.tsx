'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { ChevronLeft, ChevronRight, Activity, Calendar, RefreshCw, Radio, Zap } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetcher } from '@/src/lib/fetcher';

interface Sensor {
  sensorId: string;
  districtName: string;
  energySource: string;
  latestReading?: {
    kwhUsage: number;
    voltage: number;
    recordedAt: string;
  };
}

interface HourlyData {
  hour: number;
  timeLabel: string;
  totalKwh: number;
  solarKwh: number;
  gridKwh: number;
  readingCount: number;
}

interface ChartDataPoint {
  time: string;
  hour?: number;
  totalKwh: number;
  solarKwh: number;
  gridKwh: number;
}

type ViewMode = 'live' | 'history';
type RangePreset = '1D' | '7D' | '30D' | 'LIVE';

interface HistoricalEnergyChartProps {
  showModeToggle?: boolean;
  height?: number;
}

export default function HistoricalEnergyChart({ 
  showModeToggle = true,
  height = 280 
}: HistoricalEnergyChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  const [rangePreset, setRangePreset] = useState<RangePreset>('LIVE');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [realtimeHistory, setRealtimeHistory] = useState<ChartDataPoint[]>([]);

  // Format date for API (YYYY-MM-DD)
  const dateStr = selectedDate.toISOString().split('T')[0];
  const isToday = dateStr === new Date().toISOString().split('T')[0];

  // Fetch hourly data from backend for history view
  const { data: hourlyData, isLoading: hourlyLoading, mutate: refetchHourly } = useSWR<HourlyData[]>(
    viewMode === 'history' ? `/stats/hourly?date=${dateStr}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Fetch all sensors for live data
  const { data: sensors = [] } = useSWR<Sensor[]>(
    viewMode === 'live' ? '/sensors' : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  // Build real-time telemetry history when sensors stream changes
  useEffect(() => {
    if (viewMode !== 'live' || sensors.length === 0) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    let totalKwh = 0;
    let solarKwh = 0;
    let gridKwh = 0;

    sensors.forEach(sensor => {
      if (sensor.latestReading) {
        const kwh = sensor.latestReading.kwhUsage || 0;
        totalKwh += kwh;
        if (sensor.energySource === 'Solar') {
          solarKwh += kwh;
        } else {
          gridKwh += kwh;
        }
      }
    });

    setRealtimeHistory(prev => {
      const newPoint: ChartDataPoint = {
        time: timeStr,
        totalKwh: Math.round(totalKwh * 100) / 100,
        solarKwh: Math.round(solarKwh * 100) / 100,
        gridKwh: Math.round(gridKwh * 100) / 100,
      };

      if (prev.length > 0) {
        const lastTime = prev[prev.length - 1].time;
        if (lastTime === timeStr) return prev;
      }

      const updated = [...prev, newPoint];
      return updated.slice(-60); // Retain last 60 telemetry points
    });
  }, [sensors, viewMode]);

  // Sync mode with range presets
  const handleRangeSelect = (preset: RangePreset) => {
    setRangePreset(preset);
    if (preset === 'LIVE') {
      setViewMode('live');
    } else {
      setViewMode('history');
      if (preset === '1D') {
        setSelectedDate(new Date());
      } else if (preset === '7D') {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        setSelectedDate(d);
      } else if (preset === '30D') {
        const d = new Date();
        d.setDate(d.getDate() - 29);
        setSelectedDate(d);
      }
    }
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    setRangePreset('1D');
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    const today = new Date();
    if (newDate <= today) {
      setSelectedDate(newDate);
      setRangePreset('1D');
    }
  };

  // Current stats calculation
  const currentStats = useMemo(() => {
    if (viewMode === 'history' && hourlyData && hourlyData.length > 0) {
      const totalKwh = hourlyData.reduce((acc, h) => acc + h.totalKwh, 0);
      const solarKwh = hourlyData.reduce((acc, h) => acc + h.solarKwh, 0);
      const gridKwh = hourlyData.reduce((acc, h) => acc + h.gridKwh, 0);
      const hoursWithData = hourlyData.filter(h => h.readingCount > 0).length;
      return { totalKwh, solarKwh, gridKwh, hoursWithData };
    }

    let totalKwh = 0;
    let solarKwh = 0;
    let gridKwh = 0;
    let activeCount = 0;

    sensors.forEach(sensor => {
      if (sensor.latestReading) {
        const kwh = sensor.latestReading.kwhUsage || 0;
        totalKwh += kwh;
        if (sensor.energySource === 'Solar') {
          solarKwh += kwh;
        } else {
          gridKwh += kwh;
        }
        activeCount++;
      }
    });

    return { totalKwh, solarKwh, gridKwh, hoursWithData: activeCount };
  }, [sensors, viewMode, hourlyData]);

  // Chart data calculation
  const chartData = useMemo(() => {
    if (viewMode === 'history' && hourlyData && hourlyData.length > 0) {
      const currentHour = new Date().getHours();
      return hourlyData
        .filter(h => {
          if (isToday) {
            return h.hour <= currentHour;
          }
          return h.readingCount > 0;
        })
        .map(h => ({
          time: h.timeLabel,
          hour: h.hour,
          totalKwh: h.totalKwh,
          solarKwh: h.solarKwh,
          gridKwh: h.gridKwh,
        }));
    }
    return realtimeHistory;
  }, [viewMode, hourlyData, realtimeHistory, isToday]);

  const formatKwh = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(1);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* SCADA Range & Date Navigation Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-void/70 border border-void-border p-2.5 rounded-lg">
        {/* Range Buttons (1D, 7D, 30D, LIVE) */}
        <div className="flex items-center gap-1 bg-void-panel p-1 rounded-md border border-void-border">
          {(['LIVE', '1D', '7D', '30D'] as RangePreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => handleRangeSelect(preset)}
              className={`px-3 py-1 rounded text-xs tracking-wider transition-all font-semibold ${
                rangePreset === preset
                  ? 'bg-scada-cyan/20 text-scada-cyan border border-scada-cyan/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-void-surface'
              }`}
            >
              {preset === 'LIVE' ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-scada-cyan animate-pulse"></span>
                  LIVE
                </span>
              ) : (
                preset
              )}
            </button>
          ))}
        </div>

        {/* Clean native Dark Date Picker controls for History mode */}
        {viewMode === 'history' && (
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousDay}
              className="p-1.5 rounded bg-void-panel hover:bg-void-surface border border-void-border text-slate-400 hover:text-white transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="relative flex items-center">
              <input
                type="date"
                value={dateStr}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(new Date(e.target.value));
                    setRangePreset('1D');
                  }
                }}
                className="bg-void-panel border border-void-border text-xs text-scada-cyan px-2.5 py-1.5 rounded focus:outline-none focus:border-scada-cyan/50 tracking-wider font-mono cursor-pointer"
              />
            </div>

            <button
              onClick={goToNextDay}
              disabled={isToday}
              className={`p-1.5 rounded border transition-colors ${
                isToday 
                  ? 'bg-void/40 border-void-border/50 text-slate-600 cursor-not-allowed' 
                  : 'bg-void-panel hover:bg-void-surface border-void-border text-slate-400 hover:text-white'
              }`}
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => refetchHourly()}
              className="p-1.5 rounded bg-void-panel hover:bg-void-surface border border-void-border text-slate-400 hover:text-scada-cyan transition-colors"
              title="Refresh Stream"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* High-density Telemetry Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-void-panel/90 border border-void-border rounded-lg p-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-0.5 bg-scada-cyan/40"></div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">TOTAL LOAD</p>
            <span className="w-1.5 h-1.5 rounded-full bg-scada-cyan"></span>
          </div>
          <p className="text-lg lg:text-xl font-bold text-white mt-1">
            {formatKwh(currentStats.totalKwh)} <span className="text-xs font-normal text-slate-400">kWh</span>
          </p>
        </div>

        <div className="bg-void-panel/90 border border-void-border rounded-lg p-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-0.5 bg-scada-amber/40"></div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-scada-amber uppercase tracking-wider">SOLAR GEN</p>
            <span className="w-1.5 h-1.5 rounded-full bg-scada-amber"></span>
          </div>
          <p className="text-lg lg:text-xl font-bold text-scada-amber mt-1">
            {formatKwh(currentStats.solarKwh)} <span className="text-xs font-normal text-slate-400">kWh</span>
          </p>
        </div>

        <div className="bg-void-panel/90 border border-void-border rounded-lg p-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-0.5 bg-scada-cobalt/40"></div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-scada-cobalt uppercase tracking-wider">GRID DRAW</p>
            <span className="w-1.5 h-1.5 rounded-full bg-scada-cobalt"></span>
          </div>
          <p className="text-lg lg:text-xl font-bold text-scada-cobalt mt-1">
            {formatKwh(currentStats.gridKwh)} <span className="text-xs font-normal text-slate-400">kWh</span>
          </p>
        </div>
      </div>

      {/* Telemetry Stream Status & Legend */}
      <div className="flex items-center justify-between text-xs border-b border-void-border pb-2">
        <div className="flex items-center gap-2 text-slate-400">
          <Activity className="w-3.5 h-3.5 text-scada-cyan animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider">
            {viewMode === 'live' ? 'BUFFER: 60 SECONDS TELEMETRY' : `HOURLY SAMPLES (${currentStats.hoursWithData} ACTIVE)`}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-scada-cyan shadow-[0_0_6px_#06B6D4]"></div>
            <span className="text-slate-300">Total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-scada-amber shadow-[0_0_6px_#F59E0B]"></div>
            <span className="text-slate-300">Solar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-scada-cobalt shadow-[0_0_6px_#3B82F6]"></div>
            <span className="text-slate-300">Grid</span>
          </div>
        </div>
      </div>

      {/* Cyber Telemetry Recharts Area */}
      <div style={{ height }} className="relative">
        {hourlyLoading ? (
          <div className="flex items-center justify-center h-full bg-void-panel/40 rounded-lg border border-void-border">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-scada-cyan border-t-transparent"></div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                {/* Total Cyan Telemetry Gradient */}
                <linearGradient id="scadaColorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
                {/* Solar Amber Gradient */}
                <linearGradient id="scadaColorSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.30} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                {/* Grid Cobalt Gradient */}
                <linearGradient id="scadaColorGrid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="2 2" stroke="#1A253C" vertical={false} />
              
              <XAxis 
                dataKey="time" 
                stroke="#64748B"
                tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'ui-monospace, monospace' }}
                axisLine={{ stroke: '#1A253C' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#64748B"
                tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'ui-monospace, monospace' }}
                axisLine={{ stroke: '#1A253C' }}
                tickFormatter={(value) => `${value}`}
              />
              
              {/* Cyber SCADA Telemetry Tooltip */}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-void-panel/95 border border-scada-cyan/40 rounded-lg p-3 font-mono text-xs shadow-2xl backdrop-blur-md min-w-[140px]">
                        <div className="text-[10px] text-scada-cyan font-bold tracking-wider mb-2 border-b border-void-border pb-1">
                          TIMESTAMP: {label}
                        </div>
                        {payload.map((entry, index) => {
                          const isTotal = entry.dataKey === 'totalKwh';
                          const isSolar = entry.dataKey === 'solarKwh';
                          const color = isTotal ? '#06B6D4' : isSolar ? '#F59E0B' : '#3B82F6';
                          const labelName = isTotal ? 'TOTAL' : isSolar ? 'SOLAR' : 'GRID';
                          return (
                            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3 my-0.5">
                              <span className="flex items-center gap-1.5 text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
                                {labelName}:
                              </span>
                              <span className="font-bold text-white">
                                {Number(entry.value).toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">kWh</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              <Area
                type="monotone"
                dataKey="totalKwh"
                stroke="#06B6D4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#scadaColorTotal)"
                name="totalKwh"
                dot={false}
                activeDot={{ r: 4, fill: '#06B6D4', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              />
              <Area
                type="monotone"
                dataKey="solarKwh"
                stroke="#F59E0B"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#scadaColorSolar)"
                name="solarKwh"
                dot={false}
                activeDot={{ r: 3.5, fill: '#F59E0B' }}
              />
              <Area
                type="monotone"
                dataKey="gridKwh"
                stroke="#3B82F6"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#scadaColorGrid)"
                name="gridKwh"
                dot={false}
                activeDot={{ r: 3.5, fill: '#3B82F6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-void-panel/30 border border-void-border rounded-lg text-slate-400">
            <Activity className="w-8 h-8 mb-2 text-scada-cyan/40 animate-pulse" />
            <p className="text-xs uppercase tracking-wider">
              {viewMode === 'live' ? 'INGESTING TELEMETRY PACKETS...' : 'NO TELEMETRY RECORD FOR GIVEN INTERVAL'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
