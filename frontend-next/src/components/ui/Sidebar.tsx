'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Map, 
  BarChart3, 
  Settings, 
  Zap,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Clock,
  Menu,
  X,
  Radio,
  Activity,
  Database
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

// Real-time UTC & WIB telemetry clock component
function TelemetryClock({ isOpen }: { isOpen: boolean }) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  return (
    <div className="px-3 py-2">
      <div className={`flex items-center gap-2 px-2.5 py-2 rounded-lg bg-void-panel/90 border border-void-border ${isOpen ? '' : 'justify-center'}`}>
        <Clock className="w-3.5 h-3.5 text-scada-cyan flex-shrink-0 animate-pulse" />
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-xs font-semibold tracking-wider">{formatTime(time)}</span>
              <span className="text-[10px] font-mono text-scada-cyan px-1 rounded bg-scada-cyan/10 border border-scada-cyan/20">WIB</span>
            </div>
            <span className="text-slate-400 font-mono text-[10px] tracking-wider">{formatDate(time)}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onToggle, isMobile, mobileMenuOpen, onMobileMenuToggle }: SidebarProps) {
  const pathname = usePathname();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Command Deck', code: 'CMD-01', href: '/' },
    { icon: Map, label: 'Geo Telemetry', code: 'GEO-02', href: '/map' },
    { icon: Cpu, label: 'Node Hardware', code: 'IOT-03', href: '/sensors' },
    { icon: BarChart3, label: 'Analytics Core', code: 'ANL-04', href: '/analytics' },
    { icon: Settings, label: 'System Config', code: 'SYS-05', href: '/settings' },
  ];

  // Mobile Header Bar
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-[9999] h-14 bg-void-panel/95 backdrop-blur-xl border-b border-void-border flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-scada-cyan/10 border border-scada-cyan/40 flex items-center justify-center shadow-lg shadow-scada-cyan/10">
              <Zap className="w-4 h-4 text-scada-cyan" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold font-mono tracking-wider text-white">SCADA DECK</h1>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <p className="text-[10px] font-mono text-scada-cyan/80 uppercase tracking-widest">Smart Municipal Grid</p>
            </div>
          </div>

          <button
            onClick={onMobileMenuToggle}
            className="w-8 h-8 rounded-lg bg-void/80 border border-void-border flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onMobileMenuToggle}
                className="fixed inset-0 z-[9998] bg-black/75 backdrop-blur-sm"
                style={{ top: '56px' }}
              />

              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.15 }}
                className="fixed left-0 right-0 z-[9999] bg-void-panel/98 backdrop-blur-xl border-b border-void-border shadow-2xl p-4 space-y-3"
                style={{ top: '56px' }}
              >
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={onMobileMenuToggle}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
                          isActive
                            ? 'bg-scada-cyan/10 border-scada-cyan/40 text-scada-cyan'
                            : 'border-transparent text-slate-400 hover:border-void-border hover:bg-void/40 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-scada-cyan' : ''}`} />
                          <span className="font-mono text-sm">{item.label}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">{item.code}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="pt-2 border-t border-void-border flex items-center justify-between text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-scada-cyan animate-pulse" />
                    <span>SCADA ONLINE</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CASSANDRA SYNC</span>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <motion.aside
      initial={{ width: isOpen ? 240 : 72 }}
      animate={{ width: isOpen ? 240 : 72 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="hidden lg:flex h-screen bg-void-panel/95 backdrop-blur-xl border-r border-void-border flex-col relative z-20 select-none"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-void-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-void border border-scada-cyan/40 flex items-center justify-center shadow-lg shadow-scada-cyan/10 flex-shrink-0 relative">
            <Zap className="w-4 h-4 text-scada-cyan" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-scada-cyan animate-ping"></span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-scada-cyan"></span>
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="flex flex-col min-w-0"
            >
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold font-mono tracking-wider text-white truncate">SCADA-DECK</h1>
              </div>
              <p className="text-[10px] font-mono text-scada-cyan/80 tracking-widest uppercase truncate">Telemetry v2.4</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Subsystem status pills */}
      {isOpen && (
        <div className="px-4 py-2 border-b border-void-border bg-void/40">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-scada-cyan animate-pulse"></span>
              CORE: ACTIVE
            </span>
            <span className="text-slate-500">v14.2</span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative ${
                isActive
                  ? 'bg-scada-cyan/10 text-scada-cyan border border-scada-cyan/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 border border-transparent hover:border-void-border hover:bg-void-surface/50 hover:text-slate-200'
              }`}
            >
              {/* Active neon strip indicator */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-scada-cyan shadow-[0_0_8px_#06B6D4]"></div>
              )}
              
              <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-scada-cyan' : 'group-hover:text-scada-cyan'}`} />
              
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 }}
                  className="flex items-center justify-between flex-1 min-w-0"
                >
                  <span className="font-mono text-xs font-medium tracking-wide truncate">
                    {item.label}
                  </span>
                  <span className={`text-[9px] font-mono px-1 py-0.2 rounded border ${
                    isActive 
                      ? 'border-scada-cyan/30 text-scada-cyan bg-scada-cyan/10' 
                      : 'border-void-border text-slate-600 group-hover:text-slate-400'
                  }`}>
                    {item.code}
                  </span>
                </motion.div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Realtime Telemetry Clock */}
      <TelemetryClock isOpen={isOpen} />

      {/* Sidebar Fold Toggle */}
      <div className="p-2.5 border-t border-void-border bg-void/30">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg bg-void-surface/60 border border-void-border hover:border-scada-cyan/30 text-slate-400 hover:text-scada-cyan transition-all duration-150"
          title={isOpen ? 'Collapse Deck' : 'Expand Deck'}
        >
          {isOpen ? (
            <>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="font-mono text-xs">MINIMIZE DECK</span>
            </>
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}
