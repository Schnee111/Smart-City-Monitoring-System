'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Sun, Zap, Map } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Select } from '@/src/components/ui/Select';
import { fetchWithBody } from '@/src/lib/fetcher';
import { Sensor, CreateSensorRequest } from '@/src/types';
import { useToast } from '@/src/components/ui/Toast';

// Dynamic import MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(
  () => import('./MapPicker').then((mod) => mod.MapPicker),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
        <p className="text-slate-400">Loading map...</p>
      </div>
    )
  }
);

interface SensorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sensor?: Sensor | null;
}

const DISTRICTS = [
  { value: 'Jakarta Pusat', label: 'Jakarta Pusat' },
  { value: 'Jakarta Selatan', label: 'Jakarta Selatan' },
  { value: 'Jakarta Utara', label: 'Jakarta Utara' },
  { value: 'Jakarta Barat', label: 'Jakarta Barat' },
  { value: 'Jakarta Timur', label: 'Jakarta Timur' },
];

const ENERGY_SOURCES = [
  { value: 'Solar', label: 'Solar' },
  { value: 'Grid', label: 'Grid' },
];

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Offline', label: 'Offline' },
];

export function SensorFormModal({ isOpen, onClose, onSuccess, sensor }: SensorFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    districtName: 'Jakarta Pusat',
    latitude: '-6.1751',
    longitude: '106.8650',
    energySource: 'Solar' as 'Solar' | 'Grid',
    status: 'Active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const isEditMode = !!sensor;

  useEffect(() => {
    if (sensor) {
      setFormData({
        districtName: sensor.districtName,
        latitude: sensor.latitude.toString(),
        longitude: sensor.longitude.toString(),
        energySource: sensor.energySource,
        status: sensor.status,
      });
    } else {
      setFormData({
        districtName: 'Jakarta Pusat',
        latitude: '-6.1751',
        longitude: '106.8650',
        energySource: 'Solar',
        status: 'Active',
      });
    }
    setErrors({});
    setShowMap(false);
  }, [sensor, isOpen]);

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.latitude = 'Invalid latitude (-90 to 90)';
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      newErrors.longitude = 'Invalid longitude (-180 to 180)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = {
        districtName: formData.districtName,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        energySource: formData.energySource,
        status: formData.status,
      };

      if (isEditMode && sensor) {
        // Full update sensor
        await fetchWithBody(`/api/v1/sensors/${sensor.sensorId}`, 'PUT', payload);
        showToast('success', 'Success', 'Sensor updated successfully');
      } else {
        // Create new sensor
        await fetchWithBody('/api/v1/sensors', 'POST', payload);
        showToast('success', 'Success', 'Sensor created successfully');
      }
      onSuccess();
    } catch (error) {
      showToast('error', 'Error', 'Failed to save sensor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Sensor' : 'Add New Sensor'}
      description={isEditMode ? 'Update sensor information' : 'Register a new energy sensor'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[70vh]">
        <div className="space-y-4 overflow-y-auto overflow-x-visible pr-2 -mr-2 pb-40">
          <Select
            label="District"
            value={formData.districtName}
            onChange={(e) => setFormData({ ...formData, districtName: e.target.value })}
            options={DISTRICTS}
          />

        {/* Map Picker Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-300">Location</label>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-all"
            >
              <Map className="w-3.5 h-3.5" />
              {showMap ? 'Hide Map' : 'Pick from Map'}
            </button>
          </div>

          {showMap && (
            <MapPicker
              latitude={parseFloat(formData.latitude) || -6.1751}
              longitude={parseFloat(formData.longitude) || 106.8650}
              onLocationChange={handleLocationChange}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Latitude"
            type="text"
            value={formData.latitude}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, latitude: e.target.value })}
            placeholder="-6.1751"
            error={errors.latitude}
            icon={<MapPin className="w-4 h-4" />}
          />
          <Input
            label="Longitude"
            type="text"
            value={formData.longitude}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, longitude: e.target.value })}
            placeholder="106.8650"
            error={errors.longitude}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Energy Source</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, energySource: 'Solar' })}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                formData.energySource === 'Solar'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="font-medium">Solar</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, energySource: 'Grid' })}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                formData.energySource === 'Grid'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Zap className="w-5 h-5" />
              <span className="font-medium">Grid</span>
            </button>
          </div>
        </div>

        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          options={STATUS_OPTIONS}
        />
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-700 flex-shrink-0">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditMode ? 'Update Sensor' : 'Create Sensor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
