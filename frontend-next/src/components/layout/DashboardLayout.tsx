'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/src/components/ui/Sidebar';
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
  const [currentTime, setCurrentTime] = useState<string>('');

  // Clock in WIB / UTC
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll sensor nodes count for genuine telemetry
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
    <div className="flex h-screen overflow-hidden bg-aeter-bg">
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

      {/* Main Glassmorphic Viewport */}
      <main className={`flex-1 flex flex-col h-screen overflow-hidden ${isMobile ? 'pt-14' : ''}`}>
        {/* Top Minimalist Linear Breadcrumb Strip (AETER Monitor Archetype) */}
        <div className="px-4 lg:px-6 pt-3.5 pb-2">
          <header className="breadcrumb-strip">
            {/* Linear Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold tracking-tight text-white">SMART CITY</span>
              <span className="text-white/25">/</span>
              <span className="text-aeter-ink font-medium">Energy Telemetry</span>
              <span className="text-white/25 hidden sm:inline">·</span>
              <span className="text-aeter-ink-soft hidden sm:inline">Municipal Grid</span>
              <span className="text-white/25 hidden md:inline">·</span>
              <span className="text-aeter-ink-soft hidden md:inline">Bandarlampung</span>
            </div>

            {/* Live Indicator Chip & Clock */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="aeter-chip">
                <span className="emerald-pip" />
                <span className="font-medium text-white">Live 1.0s</span>
              </div>

              {totalSensors > 0 && (
                <div className="hidden sm:inline-flex items-center gap-1.5 aeter-chip font-mono text-[11px] tabular-nums">
                  <span className="text-aeter-ink-soft">Grid Nodes</span>
                  <span className="font-semibold text-white">{activeSensors}/{totalSensors}</span>
                </div>
              )}

              {currentTime && (
                <div className="font-mono tabular-nums text-xs font-semibold text-aeter-ink-soft px-2 py-1 rounded-lg bg-black/20 border border-white/5">
                  <span>{currentTime}</span>
                  <span className="text-[10px] ml-1 text-aeter-ink-mute">WIB</span>
                </div>
              )}
            </div>
          </header>
        </div>

        {/* Scrollable Main Deck Workspace */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-6 pt-2 custom-scrollbar">
          {/* Deck Section Header */}
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-1">
            <div>
              <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white">{title}</h1>
              {subtitle && (
                <p className="text-aeter-ink-soft text-xs mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Children View Canvas */}
          {children}
        </div>
      </main>
    </div>
  );
}
