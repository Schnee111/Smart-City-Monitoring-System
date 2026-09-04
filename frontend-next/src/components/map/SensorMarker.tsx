'use client';

import { useEffect, useState, useRef } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
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

  // Clean Utilitarian Craft Palette
  // Solar: Warm Amber (#d99a2b), Grid: Sky/Cobalt (#0284c7)
  const coreColor = isSolar ? '#d99a2b' : '#0284c7';
  
  // Status indicator dot: Active = Emerald, Maintenance = Amber, Offline = Rose
  const statusPip = isActive ? '#00d68f' : isMaintenance ? '#d99a2b' : '#d4553f';

  const pinSize = isSelected ? 22 : 16;
  const dotSize = isSelected ? 7 : 5;

  return L.divIcon({
    className: 'clean-aeter-sensor-pin',
    html: `
      <div class="aeter-sensor-pin relative flex items-center justify-center cursor-pointer" style="width: ${pinSize}px; height: ${pinSize}px;">
        <div style="
          width: ${pinSize}px;
          height: ${pinSize}px;
          border-radius: 50%;
          background: rgba(23, 26, 35, 0.90);
          border: 1.5px solid ${isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.25)'};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: ${dotSize}px;
            height: ${dotSize}px;
            border-radius: 50%;
            background: ${coreColor};
          "></div>
        </div>

        <!-- Status indicator mini-pip -->
        <div style="
          position: absolute;
          top: -1px;
          right: -1px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: ${statusPip};
          border: 1px solid #0f1117;
        "></div>
      </div>
    `,
    iconSize: [pinSize, pinSize],
    iconAnchor: [pinSize / 2, pinSize / 2],
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
    <Marker
      ref={markerRef}
      position={[sensor.latitude, sensor.longitude]}
      icon={icon}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Tooltip
        direction="top"
        offset={[0, -10]}
        opacity={1}
        className="sensor-tooltip-clean"
      >
        <div className="glass-card-dark px-3 py-2 text-xs shadow-2xl min-w-[140px] pointer-events-none">
          <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-white/8">
            <span className="font-semibold text-white font-mono text-[11px]">{sensor.sensorId}</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{
                background: isActive ? '#00d68f' : isMaintenance ? '#d99a2b' : '#d4553f'
              }} />
              <span className="text-[10px] text-aeter-ink-soft">{sensor.status}</span>
            </div>
          </div>
          
          <div className="space-y-0.5 text-[11px]">
            <div className="flex items-center justify-between text-aeter-ink-soft">
              <span>District:</span>
              <span className="text-white font-medium">{sensor.districtName}</span>
            </div>
            <div className="flex items-center justify-between text-aeter-ink-soft">
              <span>Source:</span>
              <span className={isSolar ? 'text-amber-400 font-medium' : 'text-sky-400 font-medium'}>
                {sensor.energySource}
              </span>
            </div>
            {sensor.latestReading && (
              <div className="mt-1 flex items-center justify-between pt-1 border-t border-white/8 font-mono tabular-nums">
                <span className="text-aeter-ink-mute text-[10.5px]">Load</span>
                <span className="text-white font-semibold">{sensor.latestReading.kwhUsage} kWh</span>
              </div>
            )}
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
}
