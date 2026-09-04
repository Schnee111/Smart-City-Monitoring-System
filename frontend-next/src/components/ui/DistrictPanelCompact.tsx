'use client';

import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Home, Factory, MapPin, Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { fetcher } from '@/src/lib/fetcher';
import { useDashboardStore } from '@/src/lib/store';
import { DistrictProfile } from '@/src/types';

export default function DistrictPanelCompact() {
  const { selectedDistrict, setSelectedDistrict } = useDashboardStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: districts, isLoading } = useSWR<DistrictProfile[]>(
    '/api/v1/stats/districts',
    fetcher
  );

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'industrial':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
      case 'residential':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/20';
      case 'commercial':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/20';
      default:
        return 'bg-white/10 text-white border-white/10';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'industrial':
        return <Factory className="w-3.5 h-3.5" />;
      case 'residential':
        return <Home className="w-3.5 h-3.5" />;
      case 'commercial':
        return <Building2 className="w-3.5 h-3.5" />;
      default:
        return <MapPin className="w-3.5 h-3.5" />;
    }
  };

  const selectedDistrictData = districts?.find(d => d.districtName === selectedDistrict);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header with current selection */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-aeter-ink">
            {selectedDistrict ? getCategoryIcon(selectedDistrictData?.category || '') : <Globe className="w-4 h-4 text-emerald-400" />}
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-xs tracking-tight">
              {selectedDistrict || 'All Municipal Districts'}
            </p>
            <p className="text-aeter-ink-mute text-[10.5px]">
              {selectedDistrict 
                ? selectedDistrictData?.category 
                : `${districts?.length || 0} districts registered`}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-aeter-ink-soft transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expandable District List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/8"
          >
            <div className="p-2 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
              {/* All Districts Option */}
              <button
                onClick={() => {
                  setSelectedDistrict(null);
                  setIsExpanded(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                  selectedDistrict === null
                    ? 'bg-white/10 text-white font-medium shadow-sm'
                    : 'text-aeter-ink-soft hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>All Districts</span>
                </div>
                <span className="text-[10px] text-aeter-ink-mute font-mono">{districts?.length || 0}</span>
              </button>

              {/* District List */}
              {isLoading ? (
                <div className="p-2 space-y-1">
                  <div className="h-7 bg-white/5 rounded-lg animate-pulse" />
                  <div className="h-7 bg-white/5 rounded-lg animate-pulse" />
                </div>
              ) : (
                districts?.map((district) => {
                  const isSelected = selectedDistrict === district.districtName;
                  return (
                    <button
                      key={district.districtName}
                      onClick={() => {
                        setSelectedDistrict(district.districtName);
                        setIsExpanded(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                        isSelected
                          ? 'bg-white/10 text-white font-medium shadow-sm'
                          : 'text-aeter-ink-soft hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(district.category)}
                        <span className="truncate">{district.districtName}</span>
                      </div>
                      <span className={`text-[9.5px] px-1.5 py-0.5 rounded-full border ${getCategoryColor(district.category)}`}>
                        {district.category.slice(0, 3)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
