'use client';

import { useEffect, useState, useRef } from 'react';
import { Marker, Tooltip, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useDashboardStore } from '@/src/lib/store';
import { Sensor } from '@/src/types';

function createSensorIcon(
  energySource: string,
  status: string,
  isSelected: boolean
): L.DivIcon {
  const isSolar = energySource.toLowerCase() === 'solar';
  const isActive = status.toLowerCase() === 'active';
  const isMaintenance = status.toLowerCase() === 'maintenance';

  // SCADA Palette
  // Solar: Amber (#F59E0B), Grid: Electric Cobalt (#3B82F6)
  const coreColor = isSolar ? '#F59E0B' : '#3B82F6';
  
  // Status Colors: Active = Emerald, Maintenance = Amber, Offline/Inactive = Rose
  const statusColor = isActive ? '#10B981' : isMaintenance ? '#F59E0B' : '#F43F5E';
  const pulseClass = isActive ? 'scada-radar-pulse' : isMaintenance ? 'scada-radar-pulse-amber' : 'scada-radar-pulse-rose';
  
  const size = isSelected ? 16 : 12;

  return L.divIcon({
    className: 'custom-scada-marker-wrapper',
    html: `
      <div class="relative flex items-center justify-center" style="width: 32px; height: 32px;">
        <!-- Glowing Radar Ring Pulse -->
        <div class="${pulseClass} absolute" style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${statusColor};
          opacity: 0.45;
          pointer-events: none;
        "></div>

        <!-- Static Halo -->
        <div class="absolute" style="
          width: ${size + 8}px;
          height: ${size + 8}px;
          border-radius: 50%;
          border: 1px solid ${statusColor};
          opacity: 0.6;
          pointer-events: none;
        "></div>

        <!-- Node Center Dot -->
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${coreColor};
          border: 2px solid ${isSelected ? '#FFFFFF' : '#070A11'};
          box-shadow: 0 0 10px ${coreColor}, 0 0 4px ${statusColor};
          position: relative;
          z-index: 2;
          transition: transform 0.2s ease;
          ${isSelected ? 'transform: scale(1.35);' : ''}
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

type SensorMarkerProps = {
  sensor: Sensor;
  onClick?: () => void;
};

export default function SensorMarker({ sensor, onClick }: SensorMarkerProps) {
  const map = useMap();
  const { selectedSensor, setSelectedSensor } = useDashboardStore();
  const [icon, setIcon] = useState<L.DivIcon | null>(null);
  const markerRef = useRef<L.Marker>(null);

  const isSelected = selectedSensor?.sensorId === sensor.sensorId;
  const isSolar = sensor.energySource.toLowerCase() === 'solar';
  const isActive = sensor.status.toLowerCase() === 'active';
  const isMaintenance = sensor.status.toLowerCase() === 'maintenance';

  useEffect(() => {
    setIcon(createSensorIcon(sensor.energySource, sensor.status, isSelected));
  }, [sensor.energySource, sensor.status, isSelected]);

  const handleClick = () => {
    if (isSelected) {
      setSelectedSensor(null);
      onClick?.();
      return;
    }

    setSelectedSensor(sensor);

    const mapSize = map.getSize();
    const targetPoint = map.project(
      [sensor.latitude, sensor.longitude],
      14
    );
    const offsetPoint = L.point(
      targetPoint.x,
      targetPoint.y - mapSize.y * 0.15
    );
    const targetLatLng = map.unproject(offsetPoint, 14);

    map.flyTo(targetLatLng, 14, {
      duration: 0.8,
      easeLinearity: 0.5,
    });

    onClick?.();
  };

  if (!icon) return null;

  return (
    <>
      {isSelected && (
        <CircleMarker
          center={[sensor.latitude, sensor.longitude]}
          radius={28}
          pathOptions={{
            color: isSolar ? '#F59E0B' : '#06B6D4',
            fillColor: isSolar ? '#F59E0B' : '#06B6D4',
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: '3, 3',
            opacity: 0.8,
          }}
        />
      )}

      <Marker
        ref={markerRef}
        position={[sensor.latitude, sensor.longitude]}
        icon={icon}
        eventHandlers={{ click: handleClick }}
      >
        <Tooltip direction="top" offset={[0, -14]} opacity={1}>
          <div className="bg-void-panel/95 border border-void-border backdrop-blur-md rounded-lg px-3 py-2.5 shadow-2xl font-mono min-w-[150px]">
            <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-void-border">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: isSolar ? '#F59E0B' : '#3B82F6',
                    boxShadow: `0 0 6px ${isSolar ? '#F59E0B' : '#3B82F6'}`
                  }}
                />
                <span className="text-white text-xs font-semibold tracking-wide">
                  {sensor.sensorId}
                </span>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-semibold ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : isMaintenance
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {sensor.status}
              </span>
            </div>

            <div className="text-[11px] text-slate-300">
              <div className="text-slate-400 text-[10px]">{sensor.districtName}</div>
              {sensor.latestReading ? (
                <div className="mt-1 flex items-center justify-between gap-2 pt-1 border-t border-void-border/50">
                  <span className="text-scada-cyan font-semibold">
                    {sensor.latestReading.kwhUsage.toFixed(2)} kWh
                  </span>
                  <span className="text-slate-400">
                    {sensor.latestReading.voltage.toFixed(1)} V
                  </span>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 mt-1">NO TELEMETRY STREAM</div>
              )}
            </div>
          </div>
        </Tooltip>
      </Marker>
    </>
  );
}
