'use client';

import { useState } from 'react';
import { 
  Server, 
  Map, 
  Bell, 
  Info, 
  ExternalLink,
  Check,
  Globe
} from 'lucide-react';
import DashboardLayout from '@/src/components/layout/DashboardLayout';
import { Select } from '@/src/components/ui/Select';
import { API_BASE_URL } from '@/src/lib/api';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(API_BASE_URL);
  const [refreshInterval, setRefreshInterval] = useState('5000');
  const [mapStyle, setMapStyle] = useState('dark');
  const [showNotifications, setShowNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout 
      title="System Preferences" 
      subtitle="Configure API endpoints, ingestion interval, and telemetry map styles"
    >
      <div className="max-w-4xl space-y-5">
        {/* API Configuration */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-white/8">
            <Server className="w-4 h-4 text-emerald-400" />
            <h3 className="text-white font-semibold text-sm">API & Ingestion Service</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-aeter-ink-soft mb-2">Backend Ingestion API URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-white/25"
                  placeholder="http://localhost:8080/api/v1"
                />
                <button className="px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-white hover:bg-white/10 transition-colors">
                  Test Connection
                </button>
              </div>
              <p className="text-[11px] text-aeter-ink-mute mt-1">Direct endpoint connecting to Spring Boot telemetry ingestion daemon</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-aeter-ink-soft mb-2">Telemetry Refresh Interval</label>
              <Select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                options={[
                  { value: '1000', label: '1.0s (High Precision)' },
                  { value: '3000', label: '3.0s (Standard Telemetry)' },
                  { value: '5000', label: '5.0s (Recommended)' },
                  { value: '10000', label: '10.0s (Bandwidth Saver)' },
                  { value: '30000', label: '30.0s' }
                ]}
              />
              <p className="text-[11px] text-aeter-ink-mute mt-1">Polling cadence for continuous SWR data revalidation</p>
            </div>
          </div>
        </div>

        {/* Map Settings */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-white/8">
            <Map className="w-4 h-4 text-sky-400" />
            <h3 className="text-white font-semibold text-sm">Map Cartography & Vector Tiles</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-aeter-ink-soft mb-2">Default Vector Style</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dark', label: 'CartoDB Dark', icon: '🌙' },
                  { id: 'satellite', label: 'ESRI Satellite', icon: '🛰️' },
                  { id: 'light', label: 'CartoDB Positron', icon: '☀️' },
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setMapStyle(style.id)}
                    className={`p-3 rounded-xl border transition-all text-left flex items-center gap-2.5 ${
                      mapStyle === style.id
                        ? 'border-white/30 bg-white/10 text-white shadow-sm'
                        : 'border-white/5 bg-white/5 text-aeter-ink-soft hover:border-white/15'
                    }`}
                  >
                    <span>{style.icon}</span>
                    <span className="text-xs font-medium">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="text-xs font-semibold text-white">Default Telemetry Center</p>
                <p className="text-[11px] text-aeter-ink-mute font-mono">Bandarlampung (-5.4500, 105.2667)</p>
              </div>
              <Globe className="w-4 h-4 text-aeter-ink-soft" />
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-white/8">
            <Info className="w-4 h-4 text-amber-400" />
            <h3 className="text-white font-semibold text-sm">System & Stack Architecture</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] text-aeter-ink-mute uppercase font-mono">Archetype</span>
                <p className="text-white font-semibold mt-1">AETER Monitor</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] text-aeter-ink-mute uppercase font-mono">Frontend</span>
                <p className="text-white font-semibold mt-1">Next.js 14</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] text-aeter-ink-mute uppercase font-mono">Backend</span>
                <p className="text-white font-semibold mt-1">Spring Boot 3</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] text-aeter-ink-mute uppercase font-mono">Telemetry DB</span>
                <p className="text-white font-semibold mt-1">Apache Cassandra</p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Preferences Saved</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
