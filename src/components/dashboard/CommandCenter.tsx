import React, { useState, useEffect } from 'react';
import { 
  RefreshCw,
  Users,
  Shield,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Tourist {
  id: string;
  full_name: string;
  location: { lat: number; lng: number };
  status: 'safe' | 'alert' | 'emergency';
  lastSeen: Date;
  riskLevel: 'low' | 'medium' | 'high';
  role: string;
  session_id?: string;
}

interface Alert {
  id: string;
  user_id: string;
  alert_type: string;
  message: string;
  created_at: string;
  location_lat?: number;
  location_lng?: number;
  status: string;
  tourist_name?: string;
}

const CommandCenter = () => {
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);

      // Load tourist sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('tourist_sessions')
        .select('*')
        .eq('is_active', true);

      if (sessionsError) throw sessionsError;

      // Load profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Create a map of user_id to profile for easy lookup
      const profilesMap = new Map();
      (profilesData || []).forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      // Transform sessions data into tourists format
      const touristsData: Tourist[] = (sessionsData || []).map(session => {
        const profile = profilesMap.get(session.user_id);
        return {
          id: profile?.id || session.user_id,
          full_name: profile?.full_name || 'Unknown',
          location: {
            lat: parseFloat(session.current_location_lat?.toString() || '40.7128'),
            lng: parseFloat(session.current_location_lng?.toString() || '-74.0060')
          },
          status: session.safety_status === 'emergency' ? 'emergency' as const :
                  session.safety_status === 'alert' ? 'alert' as const : 'safe' as const,
          lastSeen: new Date(session.last_ping || session.updated_at),
          riskLevel: session.safety_status === 'emergency' ? 'high' as const :
                     session.safety_status === 'alert' ? 'medium' as const : 'low' as const,
          role: profile?.role || 'tourist',
          session_id: session.id
        };
      });

      setTourists(touristsData);

      // Load active alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('emergency_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (alertsError) throw alertsError;

      const alertsFormatted: Alert[] = (alertsData || []).map(alert => {
        const profile = profilesMap.get(alert.user_id);
        return {
          ...alert,
          tourist_name: profile?.full_name || 'Unknown'
        };
      });

      setAlerts(alertsFormatted);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (profile?.role === 'admin' || profile?.role === 'police')) {
      loadData();
    }
  }, [user, profile]);

  const stats = {
    totalTourists: tourists.length,
    activeNow: tourists.filter(t => t.status !== 'emergency').length,
    criticalAlerts: tourists.filter(t => t.status === 'emergency').length,
    avgSafetyScore: tourists.length > 0 ? Math.round((tourists.filter(t => t.status === 'safe').length / tourists.length) * 100) : 0
  };

  const safetyDistribution = {
    high: tourists.filter(t => t.riskLevel === 'low').length,
    medium: tourists.filter(t => t.riskLevel === 'medium').length,
    low: tourists.filter(t => t.riskLevel === 'high').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Command Center</h1>
          <p className="text-muted-foreground mt-1">Real-time tourist safety monitoring and emergency response</p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Tourists</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalTourists}</p>
              <p className="text-xs text-green-600 mt-1">↗ 12% today</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active Now</p>
              <p className="text-3xl font-bold text-green-900">{stats.activeNow}</p>
              <p className="text-xs text-green-600 mt-1">↗ Real-time</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-900">{stats.criticalAlerts}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Avg Safety Score</p>
              <p className="text-3xl font-bold text-purple-900">{stats.avgSafetyScore}%</p>
              <p className="text-xs text-green-600 mt-1">↗ 3% from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold">Active Alerts</h2>
            </div>
            <Button variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{alerts.length} Active</p>
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">All clear! No active alerts.</p>
              </div>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm text-red-800">{alert.alert_type.toUpperCase()}</p>
                      <p className="text-xs text-red-600">{alert.tourist_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Tourist Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Tourist Status</h2>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{tourists.length} Total</p>
            {tourists.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No tourists registered yet.</p>
              </div>
            ) : (
              tourists.slice(0, 5).map((tourist) => (
                <div key={tourist.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      tourist.status === 'safe' ? 'bg-green-500' :
                      tourist.status === 'alert' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{tourist.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last seen {Math.floor((Date.now() - tourist.lastSeen.getTime()) / 60000)}m ago
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Safety Metrics */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold">Safety Metrics</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Safety Score Distribution</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">High Safety (80-100%)</span>
                  </div>
                  <span className="text-sm font-medium">{safetyDistribution.high}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-sm">Medium Safety (60-79%)</span>
                  </div>
                  <span className="text-sm font-medium">{safetyDistribution.medium}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm">Low Safety (&lt;60%)</span>
                  </div>
                  <span className="text-sm font-medium">{safetyDistribution.low}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3">Zone Distribution</h3>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-xs text-muted-foreground">Active Zones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-xs text-muted-foreground">Verified IDs</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CommandCenter;