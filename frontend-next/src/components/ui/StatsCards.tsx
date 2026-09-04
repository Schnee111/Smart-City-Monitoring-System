'use client';

import { motion } from 'framer-motion';
import useSWR from 'swr';
import { Zap, Sun, Radio, Gauge, LucideIcon } from 'lucide-react';
import { fetcher } from '@/src/lib/fetcher';
import { formatKwh, formatNumber } from '@/src/lib/formatters';
import { DistrictStats, Sensor } from '@/src/types';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subValue?: string;
  metricTheme: 'light' | 'dark';
  pct?: number;
  arcColor?: 'emerald' | 'amber' | 'sky';
  points?: number[];
}

// Minimalist Sparkline with endpoint dot
function Sparkline({ points = [], stroke }: { points: number[]; stroke: string }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 84;
  const height = 28;
  const padX = 4;
  const usableW = width - padX * 2;

  const coords = points.map((val, idx) => {
    const x = padX + (idx / (points.length - 1)) * usableW;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return { x, y };
  });

  const pathD = coords.reduce((acc, curr, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`;
  }, '');

  const lastCoord = coords[coords.length - 1];

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastCoord.x} cy={lastCoord.y} r="2.5" fill={stroke} />
    </svg>
  );
}

// Arc Gauge following AETER Monitor archetype
function ArcMeter({ pct = 0, color = 'emerald' }: { pct: number; color?: 'emerald' | 'amber' | 'sky' }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const strokeDashoffset = circ - (Math.min(100, Math.max(0, pct)) / 100) * circ;

  const colorClass = color === 'amber' ? 'amber' : color === 'sky' ? 'sky' : 'emerald';

  return (
    <div className="arc">
      <svg viewBox="0 0 80 80">
        <circle className="track" cx="40" cy="40" r={r} />
        <circle
          className={`val ${colorClass}`}
          cx="40"
          cy="40"
          r={r}
          strokeDasharray={circ}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="arc-num">
        <b className="font-mono tabular-nums">{Math.round(pct)}%</b>
        <span>Share</span>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
  metricTheme,
  pct,
  arcColor = 'emerald',
  points,
}: MetricCardProps) {
  const isDark = metricTheme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden transition-all ${
        isDark ? 'glass-card-dark' : 'glass-card'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            isDark ? 'bg-white/10 text-white' : 'bg-white/10 text-aeter-ink'
          }`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-aeter-ink tracking-tight">{label}</span>
        </div>

        {subValue && (
          <span className="text-[10.5px] font-mono tabular-nums text-aeter-ink-mute">
            {subValue}
          </span>
        )}
      </div>

      {/* Center Display: Arc Gauge OR Big Number + Sparkline */}
      <div className="my-3 flex items-center justify-between">
        {pct !== undefined ? (
          <div className="w-full flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
                {value}
              </p>
              <p className="text-[11px] text-aeter-ink-soft mt-0.5">Municipal clean generation</p>
            </div>
            <ArcMeter pct={pct} color={arcColor} />
          </div>
        ) : (
          <div className="w-full flex items-end justify-between">
            <div>
              <motion.p
                key={String(value)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight"
              >
                {value}
              </motion.p>
              <p className="text-[11px] text-aeter-ink-soft mt-0.5">Continuous telemetry</p>
            </div>
            {points && (
              <div className="opacity-80 hover:opacity-100 transition-opacity">
                <Sparkline points={points} stroke={isDark ? '#f4f4f5' : '#38bdf8'} />
              </div>
            )}
          </div>
        )}
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

  // Fetch all sensors for genuine counts
  const { data: sensors } = useSWR<Sensor[]>(
    '/api/v1/sensors',
    fetcher,
    { refreshInterval: 10000 }
  );

  const activeSensors = sensors?.filter(s => s.status === 'Active').length || 0;
  const totalSensors = sensors?.length || 0;
  const solarSensors = sensors?.filter(s => s.energySource === 'Solar').length || 0;
  const gridSensors = totalSensors - solarSensors;

  const solarRatio = stats?.solarRatio || (totalSensors > 0 ? (solarSensors / totalSensors) * 100 : 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Total Consumption (Light Glass Card) */}
      <MetricCard
        icon={Zap}
        label="Total Grid Consumption"
        value={stats ? formatKwh(stats.totalKwh) : '0 kWh'}
        subValue="Aggregated Load"
        metricTheme="light"
        points={[28, 34, 38, 36, 44, 48, 45, 52]}
      />
      
      {/* 2. Solar Share Arc Gauge (Dark Glass Card for Bento Contrast) */}
      <MetricCard
        icon={Sun}
        label="Solar Clean Share"
        value={`${formatNumber(solarRatio)}%`}
        subValue={`${solarSensors} PV Nodes`}
        metricTheme="dark"
        pct={solarRatio}
        arcColor="amber"
      />

      {/* 3. Voltage Telemetry (Light Glass Card) */}
      <MetricCard
        icon={Gauge}
        label="Average Grid Potential"
        value={stats ? `${formatNumber(stats.avgVoltage)} V` : '220.0 V'}
        subValue="Nominal 220V"
        metricTheme="light"
        points={[220, 221, 219, 220, 222, 220, 221, 220]}
      />

      {/* 4. Active Sensor Nodes (Dark Glass Card for Bento Contrast) */}
      <MetricCard
        icon={Radio}
        label="Active Grid Sensors"
        value={`${activeSensors}/${totalSensors}`}
        subValue={`${gridSensors} Grid · ${solarSensors} Solar`}
        metricTheme="dark"
        points={[totalSensors > 0 ? (activeSensors / totalSensors) * 100 : 100, 100, 98, 100, 100, 100]}
      />
    </div>
  );
}
