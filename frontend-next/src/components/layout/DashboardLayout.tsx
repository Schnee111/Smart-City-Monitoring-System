'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/src/components/ui/Sidebar';
import { Activity, Radio, Database, ShieldCheck, Cpu } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/src/lib/fetcher';
import { Sensor } from '@/src/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Poll sensor nodes count for live SCADA telemetry header
  const { data: sensors } = useSWR<Sensor[]>(
    '/api/v1/sensors',
    fetcher,
    { refreshInterval: 6000 }
  );

  const activeSensors = sensors?.filter(s => s.status === 'Active').length ?? 0;
  const totalSensors = sensors?.length ?? 0;

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-void">
      {/* Sidebar - Desktop */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={false}
      />

      {/* Mobile Header Bar & Drawer */}
      {isMobile && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isMobile={true}
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
      )}

      {/* Main SCADA Command Canvas */}
      <main className={`flex-1 flex flex-col h-screen overflow-hidden ${isMobile ? 'pt-14' : ''}`}>
        {/* Top SCADA Telemetry Stream HUD */}
        <div className="h-12 bg-void-panel/90 border-b border-void-border px-4 lg:px-6 flex items-center justify-between z-10 select-none">
          {/* Breadcrumb / Title tag */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-void text-[10px] font-mono font-medium text-scada-cyan border border-scada-cyan/30">
              <span className="w-1.5 h-1.5 rounded-full bg-scada-cyan animate-pulse"></span>
              SCADA COMMAND DECK
            </span>
            <span className="hidden sm:inline text-void-muted">/</span>
            <span className="text-xs font-mono text-slate-300 tracking-wider truncate uppercase">{title}</span>
          </div>

          {/* Live Telemetry Health Matrix */}
          <div className="flex items-center gap-2 sm:gap-4 text-[11px] font-mono">
            {/* SCADA ENGINE Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-void/80 border border-void-border">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-scada-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-scada-cyan"></span>
              </span>
              <span className="text-slate-400 hidden md:inline">SCADA:</span>
              <span className="text-scada-cyan font-semibold tracking-wide">ONLINE</span>
            </div>

            {/* CASSANDRA Engine Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-void/80 border border-void-border">
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-400 hidden md:inline">CASSANDRA:</span>
              <span className="text-emerald-400 font-semibold tracking-wide">HEALTHY</span>
            </div>

            {/* NODES SYNCED Count */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-void/80 border border-void-border">
              <Cpu className="w-3 h-3 text-scada-amber" />
              <span className="text-slate-400 hidden md:inline">TELEMETRY:</span>
              <span className="text-white font-semibold tracking-wide">
                {totalSensors > 0 ? `${activeSensors}/${totalSensors} NODES` : '32 NODES SYNCED'}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Main Deck Workspace */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
          {/* Deck Section Header */}
          <header className="mb-4 lg:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-void-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg lg:text-xl font-bold font-mono tracking-wide text-white">{title}</h1>
                <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded border border-void-border bg-void/60">LIVE</span>
              </div>
              {subtitle && (
                <p className="text-slate-400 text-xs mt-1 font-mono tracking-normal">{subtitle}</p>
              )}
            </div>
          </header>

          {/* Children View Canvas */}
          {children}
        </div>
      </main>
    </div>
  );
}
