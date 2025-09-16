import React, { useState, useEffect } from 'react';
import { Map as MapIcon, MapPin, Users, Navigation, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Tourist {
  id: string;
  full_name: string;
  location: { lat: number; lng: number };
  status: 'safe' | 'alert' | 'emergency';
  lastSeen: Date;
  session_id?: string;
}

const LiveMap = () => {
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [selectedTourist, setSelectedTourist] = useState<Tourist | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  const loadTourists = async () => {
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
          lastSeen: new Date(session.last_ping || session.updated_at || Date.now()),
          session_id: session.id
        };
      });

      setTourists(touristsData);
    } catch (error) {
      console.error('Error loading tourists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (profile?.role === 'admin' || profile?.role === 'police')) {
      loadTourists();
    }
  }, [user, profile]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-500';
      case 'alert': return 'bg-yellow-500';
      case 'emergency': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <MapIcon className="w-8 h-8 text-primary" />
            Live Map
          </h1>
          <p className="text-muted-foreground mt-1">Real-time tourist location tracking</p>
        </div>
        <Button variant="outline" onClick={loadTourists} disabled={loading}>
          <Zap className="w-4 h-4 mr-2" />
          Update Location
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-96">
            <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg">
              <div className="text-center">
                <MapIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                <p className="text-muted-foreground">
                  Map integration will be available soon.<br />
                  Tourist locations are displayed in the sidebar.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tourist List */}
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Active Tourists ({tourists.length})
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {tourists.map((tourist) => (
                <div 
                  key={tourist.id} 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTourist?.id === tourist.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTourist(tourist)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(tourist.status)}`} />
                      <span className="font-medium text-sm">{tourist.full_name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{tourist.status}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{tourist.location.lat.toFixed(4)}, {tourist.location.lng.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Navigation className="w-3 h-3" />
                    <span>Last seen {Math.floor((Date.now() - tourist.lastSeen.getTime()) / 60000)}m ago</span>
                  </div>
                </div>
              ))}
              {tourists.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No active tourists found</p>
                </div>
              )}
            </div>
          </Card>

          {/* Selected Tourist Details */}
          {selectedTourist && (
            <Card className="p-6 mt-4">
              <h3 className="font-semibold mb-3">Tourist Details</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <p className="font-medium">{selectedTourist.full_name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <p className={`font-medium capitalize ${
                    selectedTourist.status === 'safe' ? 'text-green-600' :
                    selectedTourist.status === 'alert' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {selectedTourist.status}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <p className="font-medium">{selectedTourist.location.lat.toFixed(6)}, {selectedTourist.location.lng.toFixed(6)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Last Seen:</span>
                  <p className="font-medium">{selectedTourist.lastSeen.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMap;