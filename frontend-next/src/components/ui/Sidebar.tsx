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
  SlidersHorizontal,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

function LiveClock({ isOpen }: { isOpen: boolean }) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  const formatWib = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { 
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
    });
  };

  return (
    <div className="px-3 py-2">
      <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl bg-black/20 border border-white/5 ${isOpen ? '' : 'justify-center'}`}>
        <Clock className="w-3.5 h-3.5 text-aeter-ink-soft flex-shrink-0" />
        {isOpen && (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-mono tabular-nums text-xs font-semibold text-aeter-ink">
              <span>{formatWib(time)}</span>
              <span className="text-[10px] font-medium text-aeter-ink-soft px-1 rounded bg-white/5">WIB</span>
            </div>
            <span className="text-[10.5px] text-aeter-ink-mute font-mono">{formatDate(time)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onToggle, isMobile, mobileMenuOpen, onMobileMenuToggle }: SidebarProps) {
  const pathname = usePathname();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/' },
    { icon: Map, label: 'Map Telemetry', href: '/map' },
    { icon: Cpu, label: 'Sensors & Grid', href: '/sensors' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  // Mobile Header Bar & Drawer
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-[9999] h-14 bg-aeter-panel/90 backdrop-blur-xl border-b border-white/8 flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-aeter-ink shadow-sm">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-white">Smart City</span>
                <span className="emerald-pip" />
              </div>
              <span className="text-[10.5px] text-aeter-ink-soft">Bandarlampung Grid</span>
            </div>
          </div>

          <button
            onClick={onMobileMenuToggle}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-aeter-ink-soft hover:text-white transition-colors"
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
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                onClick={onMobileMenuToggle}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-14 left-0 bottom-0 w-72 bg-aeter-panel/95 backdrop-blur-2xl border-r border-white/8 z-[9999] p-4 flex flex-col justify-between"
              >
                <nav className="space-y-1.5">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={onMobileMenuToggle}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                            : 'text-aeter-ink-soft hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : ''}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="pt-3 border-t border-white/8 flex items-center justify-between text-xs text-aeter-ink-soft">
                  <span className="flex items-center gap-1.5">
                    <span className="emerald-pip" />
                    <span>Grid Stream 1.0s</span>
                  </span>
                  <span className="font-mono text-[11px] text-aeter-ink-mute">WIB</span>
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
      initial={{ width: isOpen ? 230 : 68 }}
      animate={{ width: isOpen ? 230 : 68 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="hidden lg:flex h-screen bg-aeter-panel backdrop-blur-2xl border-r border-white/8 flex-col relative z-20 select-none shadow-glass"
    >
      {/* Brand Monogram & Header */}
      <div className="p-3.5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-aeter-ink flex-shrink-0 shadow-sm">
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="flex flex-col min-w-0"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-white truncate">Smart City</span>
                <span className="emerald-pip" />
              </div>
              <span className="text-[11px] text-aeter-ink-soft truncate">Bandarlampung Grid</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 group relative ${
                isActive
                  ? 'bg-white/10 text-white border border-white/15 shadow-sm font-medium'
                  : 'text-aeter-ink-soft border border-transparent hover:text-white hover:bg-white/5'
              }`}
              title={!isOpen ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-emerald-400" />
              )}
              
              <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-emerald-400' : 'group-hover:text-white'}`} />
              
              {isOpen && (
                <span className="text-xs font-medium tracking-normal truncate">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Real-time Clock */}
      <LiveClock isOpen={isOpen} />

      {/* Sidebar Fold Toggle */}
      <div className="p-2.5 border-t border-white/8">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 text-aeter-ink-soft hover:text-white transition-all text-xs"
          title={isOpen ? 'Collapse Navigation' : 'Expand Navigation'}
        >
          {isOpen ? (
            <>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Collapse</span>
            </>
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}
