'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute top-12 left-3 z-[1000]">
      <div className="bg-void-panel/95 border border-void-border rounded-lg overflow-hidden backdrop-blur-md min-w-[170px] shadow-2xl font-mono">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-void-surface transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-scada-cyan" />
            <span className="text-[11px] font-semibold tracking-wider text-white uppercase">LEGEND SPEC</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="border-t border-void-border"
            >
              <div className="p-2.5 space-y-2.5 text-[10px]">
                {/* Generation Type */}
                <div>
                  <div className="text-slate-500 uppercase tracking-widest text-[9px] mb-1">Energy Vector</div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-scada-amber shadow-[0_0_6px_#F59E0B]" />
                      <span className="text-slate-300">Solar</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-scada-cobalt shadow-[0_0_6px_#3B82F6]" />
                      <span className="text-slate-300">Grid</span>
                    </div>
                  </div>
                </div>

                {/* Node Status */}
                <div>
                  <div className="text-slate-500 uppercase tracking-widest text-[9px] mb-1">Node Telemetry</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-slate-300">Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-slate-300">Maint</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-slate-300">Offline</span>
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
