'use client';

import { motion } from 'framer-motion';
import useSWR from 'swr';
import { Zap, Sun, Radio, Gauge, TrendingUp, TrendingDown, Minus, LucideIcon, Activity } from 'lucide-react';
import { fetcher } from '@/src/lib/fetcher';
import { formatKwh, formatNumber } from '@/src/lib/formatters';
import { DistrictStats, Sensor } from '@/src/types';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  code: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  accentColor: 'cyan' | 'amber' | 'cobalt' | 'emerald';
  sparklinePoints?: number[];
}

function MiniSparkline({ points, color }: { points: number[]; color: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  
  const pathD = points
    .map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  code, 
  value, 
  subValue, 
  trend, 
  accentColor,
  sparklinePoints = [20, 28, 25, 35, 30, 42, 38, 50]
}: StatCardProps) {
  const colorMap = {
    cyan: {
      border: 'border-scada-cyan/30',
      glow: 'shadow-[0_0_12px_rgba(6,182,212,0.1)]',
      text: 'text-scada-cyan',
      bg: 'bg-scada-cyan/10',
      stroke: '#06B6D4',
      badge: 'bg-scada-cyan/10 text-scada-cyan border-scada-cyan/30',
    },
    amber: {
      border: 'border-scada-amber/30',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.1)]',
      text: 'text-scada-amber',
      bg: 'bg-scada-amber/10',
      stroke: '#F59E0B',
      badge: 'bg-scada-amber/10 text-scada-amber border-scada-amber/30',
    },
    cobalt: {
      border: 'border-scada-cobalt/30',
      glow: 'shadow-[0_0_12px_rgba(59,130,246,0.1)]',
      text: 'text-scada-cobalt',
      bg: 'bg-scada-cobalt/10',
      stroke: '#3B82F6',
      badge: 'bg-scada-cobalt/10 text-scada-cobalt border-scada-cobalt/30',
    },
    emerald: {
      border: 'border-emerald-500/30',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.1)]',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      stroke: '#10B981',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
  };

  const style = colorMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-void-panel/90 backdrop-blur-md border ${style.border} ${style.glow} rounded-xl p-3.5 relative overflow-hidden font-mono group`}
    >
      {/* Top Hairline accent */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${style.bg}`}></div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${style.bg} border ${style.border} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${style.text}`} />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">{code}</div>
            <p className="text-slate-300 text-xs font-medium tracking-wide">{label}</p>
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-void-border bg-void/60">
            {trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : 
             trend === 'down' ? <TrendingDown className="w-3 h-3 text-rose-400" /> : 
             <Minus className="w-3 h-3 text-slate-400" />}
            <span className={trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'}>
              {trend === 'up' ? '+4.2%' : trend === 'down' ? '-1.8%' : 'STABLE'}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <motion.p
            key={String(value)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl lg:text-2xl font-bold text-white tracking-tight"
          >
            {value}
          </motion.p>
          {subValue && (
            <p className="text-slate-400 text-[11px] mt-0.5 tracking-wide">{subValue}</p>
          )}
        </div>

        {/* Sparkline Graphic */}
        <div className="opacity-75 group-hover:opacity-100 transition-opacity">
          <MiniSparkline points={sparklinePoints} color={style.stroke} />
        </div>
      </div>
    </motion.div>
  );
}

export default function StatsCards() {
  // Fetch city-wide stats with polling every 5 seconds
  const { data: stats } = useSWR<DistrictStats>(
    '/api/v1/stats',
    fetcher,
    { refreshInterval: 5000 }
  );

  // Fetch all sensors for count
  const { data: sensors } = useSWR<Sensor[]>(
    '/api/v1/sensors',
    fetcher,
    { refreshInterval: 10000 }
  );

  const activeSensors = sensors?.filter(s => s.status === 'Active').length || 0;
  const totalSensors = sensors?.length || 0;
  const solarSensors = sensors?.filter(s => s.energySource === 'Solar').length || 0;
  const gridSensors = totalSensors - solarSensors;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Total Consumption */}
      <StatCard
        icon={Zap}
        code="TELEMETRY-01"
        label="Total Grid Ingestion"
        value={stats ? formatKwh(stats.totalKwh) : '0 kWh'}
        subValue="Aggregated municipal load"
        trend="up"
        accentColor="cyan"
        sparklinePoints={[28, 32, 40, 38, 45, 52, 48, 56]}
      />
      
      {/* 2. Active Sensor Nodes */}
      <StatCard
        icon={Radio}
        code="TELEMETRY-02"
        label="Hardware Nodes Online"
        value={`${activeSensors}/${totalSensors}`}
        subValue={`${solarSensors} Solar • ${gridSensors} Grid`}
        trend="neutral"
        accentColor="emerald"
        sparklinePoints={[30, 31, 32, 32, 32, 32, 32, 32]}
      />
      
      {/* 3. Voltage Telemetry */}
      <StatCard
        icon={Gauge}
        code="TELEMETRY-03"
        label="Bus Line Potential"
        value={stats ? `${formatNumber(stats.avgVoltage)} V` : '0 V'}
        subValue="Nominal Base: 220V ±5%"
        trend="neutral"
        accentColor="cobalt"
        sparklinePoints={[220, 221, 219, 220, 222, 220, 221, 220]}
      />

      {/* 4. Solar Ratio */}
      <StatCard
        icon={Sun}
        code="TELEMETRY-04"
        label="Renewable Solar Share"
        value={stats ? `${formatNumber(stats.solarRatio)}%` : '0%'}
        subValue="Clean municipal offset"
        trend="up"
        accentColor="amber"
        sparklinePoints={[12, 15, 18, 22, 28, 35, 32, 39]}
      />
    </div>
  );
}
