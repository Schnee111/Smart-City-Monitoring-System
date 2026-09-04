'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  MapPin,
  Sun,
  Zap,
  Activity,
  AlertTriangle,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { fetcher } from '@/src/lib/fetcher';
import { Sensor } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Badge } from '@/src/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/src/components/ui/Table';
import { Select } from '@/src/components/ui/Select';
import { SensorFormModal } from './SensorFormModal';
import { DeleteSensorModal } from './DeleteSensorModal';
import { useToast } from '@/src/components/ui/Toast';
import { formatRelativeTime } from '@/src/lib/formatters';

export default function SensorManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [deletingSensor, setDeletingSensor] = useState<Sensor | null>(null);

  const { data: sensors, isLoading, mutate } = useSWR<Sensor[]>(
    '/api/v1/sensors',
    fetcher,
    { refreshInterval: 10000 }
  );

  const { showToast } = useToast();

  // Filter sensors
  const filteredSensors = sensors?.filter((sensor) => {
    const matchesSearch = 
      sensor.sensorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sensor.districtName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || sensor.status === filterStatus;
    const matchesSource = filterSource === 'all' || sensor.energySource === filterSource;

    return matchesSearch && matchesStatus && matchesSource;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <Activity className="w-3.5 h-3.5" />;
      case 'Maintenance':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'Offline':
        return <WifiOff className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Maintenance':
        return 'warning';
      case 'Offline':
        return 'danger';
      default:
        return 'success';
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    mutate();
    showToast('success', 'Sensor Created', 'New sensor has been added successfully');
  };

  const handleEditSuccess = () => {
    setEditingSensor(null);
    mutate();
    showToast('success', 'Sensor Updated', 'Sensor has been updated successfully');
  };

  const handleDeleteSuccess = () => {
    setDeletingSensor(null);
    mutate();
    showToast('success', 'Sensor Deleted', 'Sensor has been removed successfully');
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle>Sensor Management</CardTitle>
              <p className="text-sm text-slate-400 mt-0.5">
                {sensors?.length || 0} sensors registered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => mutate()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Sensor
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by ID or district..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Maintenance', label: 'Maintenance' },
                  { value: 'Offline', label: 'Offline' }
                ]}
                className="w-36"
              />
              <Select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                options={[
                  { value: 'all', label: 'All Sources' },
                  { value: 'Solar', label: 'Solar' },
                  { value: 'Grid', label: 'Grid' }
                ]}
                className="w-32"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          ) : filteredSensors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <MapPin className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-medium">No sensors found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sensor ID</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Reading</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSensors.map((sensor, index) => (
                  <motion.tr
                    key={sensor.sensorId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-700/50 hover:bg-slate-800/50"
                  >
                    <TableCell>
                      <code className="text-xs bg-slate-700/50 px-2 py-1 rounded text-emerald-400">
                        {sensor.sensorId.slice(0, 8)}...
                      </code>
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {sensor.districtName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sensor.energySource === 'Solar' ? 'solar' : 'grid'}>
                        {sensor.energySource === 'Solar' ? (
                          <Sun className="w-3 h-3" />
                        ) : (
                          <Zap className="w-3 h-3" />
                        )}
                        {sensor.energySource}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(sensor.status)}>
                        {getStatusIcon(sensor.status)}
                        {sensor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {sensor.latitude.toFixed(4)}, {sensor.longitude.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {sensor.latestReading ? (
                        <div>
                          <span className="text-white">{sensor.latestReading.kwhUsage.toFixed(2)} kWh</span>
                          <span className="text-slate-500 ml-2">
                            {formatRelativeTime(sensor.latestReading.recordedAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">No data</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingSensor(sensor)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => setDeletingSensor(sensor)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <SensorFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Modal */}
      <SensorFormModal
        isOpen={!!editingSensor}
        onClose={() => setEditingSensor(null)}
        onSuccess={handleEditSuccess}
        sensor={editingSensor}
      />

      {/* Delete Modal */}
      <DeleteSensorModal
        isOpen={!!deletingSensor}
        onClose={() => setDeletingSensor(null)}
        onSuccess={handleDeleteSuccess}
        sensor={deletingSensor}
      />
    </>
  );
}
