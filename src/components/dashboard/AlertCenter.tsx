import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  resolved_at?: string;
  resolved_by?: string;
}

const AlertCenter = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'resolved' | 'all'>('active');
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const loadAlerts = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('emergency_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data: alertsData, error: alertsError } = await query;

      if (alertsError) throw alertsError;

      // Load profiles for user names
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const profilesMap = new Map();
      (profilesData || []).forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      const alertsFormatted: Alert[] = (alertsData || []).map(alert => {
        const profile = profilesMap.get(alert.user_id);
        return {
          ...alert,
          tourist_name: profile?.full_name || 'Unknown'
        };
      });

      setAlerts(alertsFormatted);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load alerts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (profile?.role === 'admin' || profile?.role === 'police')) {
      loadAlerts();
    }
  }, [user, profile, selectedStatus]);

  const handleResolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alert Resolved",
        description: "Emergency alert has been successfully resolved.",
      });

      loadAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (alertType: string) => {
    switch (alertType) {
      case 'panic': return 'destructive';
      case 'geofence': return 'secondary';
      case 'anomaly': return 'outline';
      default: return 'outline';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'panic': return <AlertTriangle className="w-4 h-4" />;
      case 'geofence': return <MapPin className="w-4 h-4" />;
      case 'anomaly': return <Clock className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-primary" />
            Alert Center
          </h1>
          <p className="text-muted-foreground mt-1">Monitor and respond to emergency alerts</p>
        </div>
        <Button variant="outline" onClick={loadAlerts} disabled={loading}>
          <AlertTriangle className="w-4 h-4 mr-2" />
          Refresh Alerts
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        <Button
          variant={selectedStatus === 'active' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('active')}
        >
          Active Alerts
        </Button>
        <Button
          variant={selectedStatus === 'resolved' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('resolved')}
        >
          Resolved
        </Button>
        <Button
          variant={selectedStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('all')}
        >
          All Alerts
        </Button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant={getPriorityColor(alert.alert_type)} className="flex items-center gap-1">
                    {getAlertIcon(alert.alert_type)}
                    {alert.alert_type.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                  {alert.status === 'resolved' && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Resolved
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Tourist:</span>
                    <span className="ml-2">{alert.tourist_name}</span>
                  </div>
                  
                  {alert.message && (
                    <div>
                      <span className="font-medium">Message:</span>
                      <p className="ml-2 text-muted-foreground">{alert.message}</p>
                    </div>
                  )}

                  {alert.location_lat && alert.location_lng && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {alert.location_lat.toFixed(4)}, {alert.location_lng.toFixed(4)}
                      </span>
                    </div>
                  )}

                  {alert.resolved_at && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Resolved:</span>
                      <span className="ml-2">{new Date(alert.resolved_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {alert.status === 'active' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveAlert(alert.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Resolve
                  </Button>
                  <Button
                    variant="emergency"
                    size="sm"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Contact
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {alerts.length === 0 && !loading && (
          <Card className="p-12">
            <div className="text-center">
              {selectedStatus === 'active' ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                  <p className="text-muted-foreground">No active alerts at this time.</p>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Alerts Found</h3>
                  <p className="text-muted-foreground">No {selectedStatus} alerts to display.</p>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AlertCenter;