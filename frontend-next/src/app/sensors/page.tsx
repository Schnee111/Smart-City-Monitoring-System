'use client';

import DashboardLayout from '@/src/components/layout/DashboardLayout';
import SensorManagement from '@/src/components/sensors/SensorManagement';

export default function SensorsPage() {
  return (
    <DashboardLayout 
      title="Sensor & Grid Nodes" 
      subtitle="Manage hardware sensor nodes, district assignments, and telemetry endpoints"
    >
      <div className="glass rounded-2xl p-1 shadow-glass">
        <SensorManagement />
      </div>
    </DashboardLayout>
  );
}
