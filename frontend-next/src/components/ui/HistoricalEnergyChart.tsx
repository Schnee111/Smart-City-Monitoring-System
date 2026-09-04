'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { ChevronLeft, ChevronRight, Activity, RefreshCw } from 'lucide-react';
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
type RangePreset = 'LIVE' | '1D' | '7D' | '30D';

interface HistoricalEnergyChartProps {
  showModeToggle?: boolean;
  height?: number;
}

export default function HistoricalEnergyChart({ 
  showModeToggle: _showModeToggle = true,
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
      // Keep last 25 telemetry points for clean stream
      return updated.slice(-25);
    });
  }, [sensors, viewMode]);

  // Transform hourly history data for chart
  const historyChartData = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) return [];

    return hourlyData.map(d => ({
      time: d.timeLabel || `${String(d.hour).padStart(2, '0')}:00`,
      hour: d.hour,
      totalKwh: Math.round(d.totalKwh * 100) / 100,
      solarKwh: Math.round(d.solarKwh * 100) / 100,
      gridKwh: Math.round(d.gridKwh * 100) / 100,
    }));
  }, [hourlyData]);

  // Determine which data to show
  const chartData = viewMode === 'live' ? realtimeHistory : historyChartData;

  // Calculate current telemetry summary
  const currentStats = useMemo(() => {
    if (chartData.length === 0) {
      return { totalKwh: 0, solarKwh: 0, gridKwh: 0, hoursWithData: 0 };
    }

    if (viewMode === 'live') {
      const latest = chartData[chartData.length - 1];
      return {
        totalKwh: latest?.totalKwh || 0,
        solarKwh: latest?.solarKwh || 0,
        gridKwh: latest?.gridKwh || 0,
        hoursWithData: chartData.length,
      };
    }

    const totalKwh = chartData.reduce((sum, d) => sum + d.totalKwh, 0);
    const solarKwh = chartData.reduce((sum, d) => sum + d.solarKwh, 0);
    const gridKwh = chartData.reduce((sum, d) => sum + d.gridKwh, 0);
    const hoursWithData = chartData.filter(d => d.totalKwh > 0).length;

    return {
      totalKwh: Math.round(totalKwh * 100) / 100,
      solarKwh: Math.round(solarKwh * 100) / 100,
      gridKwh: Math.round(gridKwh * 100) / 100,
      hoursWithData,
    };
  }, [chartData, viewMode]);

  // Range preset selector
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
        d.setDate(d.getDate() - 7);
        setSelectedDate(d);
      } else if (preset === '30D') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        setSelectedDate(d);
      }
    }
  };

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
    setRangePreset('1D');
  };

  const goToNextDay = () => {
    if (isToday) return;
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
    setRangePreset('1D');
  };

  const formatKwh = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} M`;
    }
    return value.toFixed(1);
  };

  return (
    <div className="space-y-4">
      {/* Range & Date Navigation Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-card-dark p-2 rounded-xl">
        {/* Range Buttons (LIVE, 1D, 7D, 30D) */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
          {(['LIVE', '1D', '7D', '30D'] as RangePreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => handleRangeSelect(preset)}
              className={`px-3 py-1 rounded-md text-xs font-semibold tracking-normal transition-all ${
                rangePreset === preset
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-aeter-ink-soft hover:text-white hover:bg-white/5'
              }`}
            >
              {preset === 'LIVE' ? (
                <span className="flex items-center gap-1.5">
                  <span className="emerald-pip" />
                  <span>LIVE</span>
                </span>
              ) : (
                preset
              )}
            </button>
          ))}
        </div>

        {/* Clean Date Picker controls for History mode */}
        {viewMode === 'history' && (
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousDay}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-aeter-ink-soft hover:text-white transition-colors"
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
                className="bg-white/5 border border-white/10 text-xs text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-white/20 font-mono cursor-pointer"
              />
            </div>

            <button
              onClick={goToNextDay}
              disabled={isToday}
              className={`p-1.5 rounded-lg border transition-colors ${
                isToday 
                  ? 'bg-white/5 border-transparent text-aeter-ink-mute/40 cursor-not-allowed' 
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-aeter-ink-soft hover:text-white'
              }`}
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => refetchHourly()}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-aeter-ink-soft hover:text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* High-density Telemetry Metrics Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-aeter-ink-soft uppercase tracking-wide">
              Total Grid Load
            </span>
            <p className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
              {formatKwh(currentStats.totalKwh)} <span className="text-xs font-normal text-aeter-ink-mute">kWh</span>
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-sky-400" />
        </div>

        <div className="glass-card p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wide">
              Solar Yield
            </span>
            <p className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-0.5">
              {formatKwh(currentStats.solarKwh)} <span className="text-xs font-normal text-amber-400/60">kWh</span>
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-amber-400" />
        </div>

        <div className="glass-card p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-aeter-ink-soft uppercase tracking-wide">
              Grid Draw
            </span>
            <p className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
              {formatKwh(currentStats.gridKwh)} <span className="text-xs font-normal text-aeter-ink-mute">kWh</span>
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-white/50" />
        </div>
      </div>

      {/* Stream Status & Legend */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-white/8">
        <div className="flex items-center gap-2 text-aeter-ink-soft">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px]">
            {viewMode === 'live' ? 'Continuous telemetry buffer (25 ticks)' : `Hourly aggregated samples (${currentStats.hoursWithData} recorded)`}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-sky-400"></div>
            <span className="text-aeter-ink-soft">Total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <span className="text-aeter-ink-soft">Solar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/50"></div>
            <span className="text-aeter-ink-soft">Grid</span>
          </div>
        </div>
      </div>

      {/* Clean Area Chart */}
      <div style={{ height }} className="relative">
        {hourlyLoading ? (
          <div className="flex items-center justify-center h-full glass-subtle rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-emerald-400"></div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="aeterColorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aeterColorSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d99a2b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#d99a2b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aeterColorGrid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.20} />
                  <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
              
              <XAxis 
                dataKey="time" 
                stroke="#71717a"
                tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'var(--font-mono), monospace' }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#71717a"
                tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'var(--font-mono), monospace' }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
                tickFormatter={(value) => `${value}`}
              />
              
              {/* Clean Glass Popover Tooltip */}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-card-dark p-3 text-xs shadow-glass border border-white/10 min-w-[140px] font-sans">
                        <div className="text-[11px] text-aeter-ink-mute font-mono mb-2 border-b border-white/8 pb-1">
                          {label}
                        </div>
                        {payload.map((entry, index) => {
                          const isTotal = entry.dataKey === 'totalKwh';
                          const isSolar = entry.dataKey === 'solarKwh';
                          const color = isTotal ? '#38bdf8' : isSolar ? '#d99a2b' : '#a1a1aa';
                          const labelName = isTotal ? 'Total' : isSolar ? 'Solar' : 'Grid';
                          return (
                            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3 my-1">
                              <span className="flex items-center gap-1.5 text-aeter-ink-soft">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
                                {labelName}:
                              </span>
                              <span className="font-bold font-mono tabular-nums text-white">
                                {Number(entry.value).toFixed(2)} <span className="text-[10px] text-aeter-ink-mute font-normal">kWh</span>
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
                stroke="#38bdf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#aeterColorTotal)"
                name="totalKwh"
                dot={false}
                activeDot={{ r: 4, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 1.5 }}
              />
              <Area
                type="monotone"
                dataKey="solarKwh"
                stroke="#d99a2b"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#aeterColorSolar)"
                name="solarKwh"
                dot={false}
                activeDot={{ r: 3.5, fill: '#d99a2b' }}
              />
              <Area
                type="monotone"
                dataKey="gridKwh"
                stroke="#a1a1aa"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#aeterColorGrid)"
                name="gridKwh"
                dot={false}
                activeDot={{ r: 3.5, fill: '#a1a1aa' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full glass-subtle rounded-xl text-aeter-ink-soft">
            <Activity className="w-8 h-8 mb-2 text-aeter-ink-mute" />
            <p className="text-xs">
              {viewMode === 'live' ? 'Connecting to grid telemetry stream...' : 'No telemetry data recorded for this interval'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
