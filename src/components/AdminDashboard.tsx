import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  MapPin, 
  Users, 
  Activity, 
  RefreshCw,
  Search,
  Phone,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Tourist {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  status: 'safe' | 'alert' | 'emergency';
  lastSeen: Date;
  riskLevel: 'low' | 'medium' | 'high';
}

interface Alert {
  id: string;
  touristId: string;
  type: 'panic' | 'geofence' | 'anomaly';
  message: string;
  timestamp: Date;
  location: { lat: number; lng: number };
  priority: 'low' | 'medium' | 'high';
}

const AdminDashboard = () => {
  const [tourists, setTourists] = useState<Tourist[]>([
    {
      id: 'TST-2024-001',
      name: 'Alex Johnson',
      location: { lat: 40.7128, lng: -74.0060 },
      status: 'safe',
      lastSeen: new Date(),
      riskLevel: 'low'
    },
    {
      id: 'TST-2024-002',
      name: 'Maria Garcia',
      location: { lat: 40.7589, lng: -73.9851 },
      status: 'alert',
      lastSeen: new Date(Date.now() - 300000),
      riskLevel: 'medium'
    },
    {
      id: 'TST-2024-003',
      name: 'John Smith',
      location: { lat: 40.6892, lng: -74.0445 },
      status: 'emergency',
      lastSeen: new Date(Date.now() - 120000),
      riskLevel: 'high'
    }
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'ALT-001',
      touristId: 'TST-2024-003',
      type: 'panic',
      message: 'Emergency panic button activated',
      timestamp: new Date(Date.now() - 120000),
      location: { lat: 40.6892, lng: -74.0445 },
      priority: 'high'
    },
    {
      id: 'ALT-002',
      touristId: 'TST-2024-002',
      type: 'geofence',
      message: 'Tourist entered high-risk zone',
      timestamp: new Date(Date.now() - 300000),
      location: { lat: 40.7589, lng: -73.9851 },
      priority: 'medium'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const stats = {
    totalTourists: tourists.length,
    activeTourists: tourists.filter(t => t.status !== 'emergency').length,
    emergencyAlerts: tourists.filter(t => t.status === 'emergency').length,
    totalAlerts: alerts.length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-success';
      case 'alert': return 'text-warning';
      case 'emergency': return 'text-emergency';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-emergency/10 border-emergency/20';
      case 'medium': return 'bg-warning/10 border-warning/20';
      case 'low': return 'bg-success/10 border-success/20';
      default: return 'bg-muted/10 border-muted/20';
    }
  };

  const filteredTourists = tourists.filter(tourist =>
    tourist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmergencyResponse = (touristId: string) => {
    setTourists(prev => prev.map(t => 
      t.id === touristId ? { ...t, status: 'safe' as const } : t
    ));
    setAlerts(prev => prev.filter(a => a.touristId !== touristId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              SafeTourist Admin
            </h1>
            <p className="text-muted-foreground mt-1">Emergency Response & Tourist Monitoring Dashboard</p>
          </div>
          <Button variant="glass">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Tourists</p>
                <p className="text-2xl font-bold">{stats.totalTourists}</p>
              </div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-success text-success-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Active & Safe</p>
                <p className="text-2xl font-bold">{stats.activeTourists}</p>
              </div>
              <Activity className="w-8 h-8 opacity-80" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-emergency text-emergency-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Emergency Alerts</p>
                <p className="text-2xl font-bold">{stats.emergencyAlerts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 opacity-80" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{stats.totalAlerts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Alerts */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-emergency" />
                Active Alerts
              </h2>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${getPriorityColor(alert.priority)} hover:bg-opacity-20`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-sm">{alert.type.toUpperCase()}</span>
                      <span className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>{alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Tourist List */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Tourist Monitoring
                </h2>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tourists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredTourists.map((tourist) => (
                  <div key={tourist.id} className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          tourist.status === 'safe' ? 'bg-success' :
                          tourist.status === 'alert' ? 'bg-warning' : 'bg-emergency'
                        } ${tourist.status === 'emergency' ? 'animate-emergency' : ''}`} />
                        <div>
                          <h3 className="font-medium">{tourist.name}</h3>
                          <p className="text-sm text-muted-foreground">{tourist.id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-sm font-medium ${getStatusColor(tourist.status)}`}>
                            {tourist.status.charAt(0).toUpperCase() + tourist.status.slice(1)}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{Math.floor((Date.now() - tourist.lastSeen.getTime()) / 60000)}m ago</span>
                          </div>
                        </div>
                        
                        {tourist.status === 'emergency' && (
                          <Button 
                            variant="emergency" 
                            size="sm"
                            onClick={() => handleEmergencyResponse(tourist.id)}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Respond
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{tourist.location.lat.toFixed(4)}, {tourist.location.lng.toFixed(4)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        tourist.riskLevel === 'high' ? 'bg-emergency/10 text-emergency' :
                        tourist.riskLevel === 'medium' ? 'bg-warning/10 text-warning' :
                        'bg-success/10 text-success'
                      }`}>
                        {tourist.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Emergency Response Banner */}
        {stats.emergencyAlerts > 0 && (
          <Card className="p-4 bg-gradient-emergency text-emergency-foreground animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold">Emergency Response Required</h3>
                  <p className="text-sm opacity-90">
                    {stats.emergencyAlerts} tourist(s) require immediate assistance
                  </p>
                </div>
              </div>
              <Button variant="ghost" className="text-emergency-foreground border-emergency-foreground">
                <Phone className="w-4 h-4 mr-2" />
                Contact Emergency Services
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;