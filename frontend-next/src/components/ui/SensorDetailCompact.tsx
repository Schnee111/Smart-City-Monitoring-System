'use client';

import { motion } from 'framer-motion';
import { Radio, Zap, Battery, AlertCircle, X, MapPin } from 'lucide-react';
import { useDashboardStore } from '@/src/lib/store';
import { formatKwh, formatNumber } from '@/src/lib/formatters';

export default function SensorDetailCompact() {
  const { selectedSensor, setSelectedSensor } = useDashboardStore();

  if (!selectedSensor) {
    return (
      <div className="glass-card p-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0 text-aeter-ink-mute">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">No Sensor Selected</p>
            <p className="text-[11px] text-aeter-ink-soft">Click any node marker on the map to inspect live metrics</p>
          </div>
        </div>
      </div>
    );
  }

  const isSolar = selectedSensor.energySource.toLowerCase() === 'solar';
  const isActive = selectedSensor.status.toLowerCase() === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/8 bg-white/5">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          <span className="font-mono text-xs font-semibold text-white">{selectedSensor.sensorId}</span>
        </div>
        <button
          onClick={() => setSelectedSensor(null)}
          className="text-aeter-ink-soft hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2.5 text-xs">
        {/* District & Location */}
        <div className="flex items-center justify-between text-aeter-ink-soft">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-aeter-ink-mute" />
            <span>District:</span>
          </span>
          <span className="text-white font-medium">{selectedSensor.districtName}</span>
        </div>

        {/* Source */}
        <div className="flex items-center justify-between text-aeter-ink-soft">
          <span className="flex items-center gap-1.5">
            {isSolar ? <Battery className="w-3.5 h-3.5 text-amber-400" /> : <Zap className="w-3.5 h-3.5 text-sky-400" />}
            <span>Source:</span>
          </span>
          <span className={`font-medium ${isSolar ? 'text-amber-400' : 'text-sky-400'}`}>
            {selectedSensor.energySource}
          </span>
        </div>

        {/* Coordinates */}
        <div className="flex items-center justify-between text-aeter-ink-soft">
          <span>Coords:</span>
          <span className="font-mono text-[11px] text-aeter-ink-mute tabular-nums">
            {selectedSensor.latitude.toFixed(4)}, {selectedSensor.longitude.toFixed(4)}
          </span>
        </div>

        {/* Reading data if available */}
        {selectedSensor.latestReading ? (
          <div className="pt-2 border-t border-white/8 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-aeter-ink-soft">Latest Load:</span>
              <span className="font-bold font-mono text-white tabular-nums">
                {formatKwh(selectedSensor.latestReading.kwhUsage)} kWh
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-aeter-ink-soft">Bus Potential:</span>
              <span className="font-mono text-aeter-ink-soft tabular-nums">
                {formatNumber(selectedSensor.latestReading.voltage)} V
              </span>
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-white/8 flex items-center gap-1.5 text-aeter-ink-mute text-[11px]">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>No telemetry recorded this cycle</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
