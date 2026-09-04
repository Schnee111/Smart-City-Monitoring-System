'use client';

import useSWR from 'swr';
import { SunMedium, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type ApiResponse<T> = { success: boolean; message?: string; data: T | null };
const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<ApiResponse<number>>);

function formatIDR(value: number) {
  return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
}

export default function SolarSavingsCard() {
  const { data, isLoading } = useSWR<ApiResponse<number>>('/api/v1/analytics/solar-savings', fetcher, {
    refreshInterval: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="glass-subtle p-3.5 text-aeter-ink-soft text-xs flex items-center gap-2">
        <span className="emerald-pip" />
        <span>Calculating municipal solar savings...</span>
      </div>
    );
  }

  const savings = Number(data?.data ?? 0);

  return (
    <div className="glass p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden transition-all">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400">
          <SunMedium className="w-5 h-5" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-aeter-ink-soft uppercase tracking-wider">
              Renewable Solar Offset
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              <span>Grid Verified</span>
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-0.5">
            <p className="text-xl lg:text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
              {formatIDR(savings)}
            </p>
            <span className="text-xs font-medium text-amber-400/90">Municipal Savings Today</span>
          </div>

          <p className="text-xs text-aeter-ink-soft mt-0.5">
            Photovoltaic generation offset calculated from standard municipal tariff
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        <Link 
          href="/analytics" 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-all"
        >
          <span>View Analytics</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-aeter-ink-soft" />
        </Link>
      </div>
    </div>
  );
}
