'use client';

import useSWR from 'swr';
import { SunMedium, ArrowUpRight, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

type ApiResponse<T> = { success: boolean; message?: string; data: T | null };
const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<ApiResponse<number>>);

function formatIDR(value: number) {
  return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
}

export default function SolarSavingsCard() {
  const { data, error, isLoading } = useSWR<ApiResponse<number>>('/api/v1/analytics/solar-savings', fetcher, {
    refreshInterval: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="bg-void-panel/80 border border-void-border rounded-xl p-3.5 text-slate-400 font-mono text-xs flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-scada-amber animate-ping"></span>
        <span>CALCULATING SOLAR OFF-GRID OFFSET TELEMETRY...</span>
      </div>
    );
  }

  const savings = Number(data?.data ?? 0);

  return (
    <div className="bg-void-panel/90 border border-void-border hover:border-scada-amber/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono relative overflow-hidden transition-all shadow-lg">
      {/* Top amber hairline glow */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-scada-amber to-transparent opacity-60"></div>

      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-scada-amber/10 border border-scada-amber/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
          <SunMedium className="w-5 h-5 text-scada-amber animate-pulse-slow" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              SCADA EFFICIENCY TELEMETRY // SOLAR OFFSET
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-0.5">
            <p className="text-xl font-bold text-white tracking-tight">
              {formatIDR(savings)}
            </p>
            <span className="text-[11px] text-scada-amber font-medium">Saved Today</span>
          </div>

          <div className="text-[11px] text-slate-400 mt-0.5">
            Decentralized photovoltaic generation offset from PLN Municipal tariff
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        <Link 
          href="/analytics" 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-void border border-void-border hover:border-scada-cyan/40 text-xs text-scada-cyan hover:text-white transition-all"
        >
          <span>ANALYTICS CORE</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
