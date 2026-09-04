'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute top-3 left-3 z-[1000]">
      <div className="glass-card-dark overflow-hidden min-w-[170px] shadow-glass border border-white/10 text-xs">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-aeter-ink-soft" />
            <span className="text-xs font-semibold text-white">Map Legend</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-aeter-ink-mute" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-aeter-ink-mute" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="border-t border-white/8"
            >
              <div className="p-3 space-y-3 text-[11px]">
                {/* Generation Type */}
                <div>
                  <div className="text-aeter-ink-mute text-[10px] uppercase tracking-wider font-semibold mb-1.5">
                    Energy Source
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-aeter-ink-soft">Solar</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      <span className="text-aeter-ink-soft">Grid</span>
                    </div>
                  </div>
                </div>

                {/* Node Status */}
                <div>
                  <div className="text-aeter-ink-mute text-[10px] uppercase tracking-wider font-semibold mb-1.5">
                    Sensor Status
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-aeter-ink-soft">Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-aeter-ink-soft">Maintenance</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-rose-400" />
                      <span className="text-aeter-ink-soft">Offline</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
