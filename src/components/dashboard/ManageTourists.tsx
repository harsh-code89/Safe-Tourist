import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, MapPin, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Tourist {
  id: string;
  full_name: string;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  country?: string;
  role: string;
  created_at: string;
  current_session?: {
    id: string;
    is_active: boolean;
    safety_status: string;
    current_location_lat?: number;
    current_location_lng?: number;
    last_ping?: string;
  };
}

const ManageTourists = () => {
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const loadTourists = async () => {
    try {
      setLoading(true);

      // Load all profiles with tourist role
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'tourist')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Load active sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('tourist_sessions')
        .select('*')
        .eq('is_active', true);

      if (sessionsError) throw sessionsError;

      // Create sessions map
      const sessionsMap = new Map();
      (sessionsData || []).forEach(session => {
        sessionsMap.set(session.user_id, session);
      });

      // Combine profiles with session data
      const touristsData: Tourist[] = (profilesData || []).map(profile => ({
        ...profile,
        current_session: sessionsMap.get(profile.user_id)
      }));

      setTourists(touristsData);
    } catch (error) {
      console.error('Error loading tourists:', error);
      toast({
        title: "Error",
        description: "Failed to load tourists. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (profile?.role === 'admin' || profile?.role === 'police')) {
      loadTourists();
    }
  }, [user, profile]);

  const filteredTourists = tourists.filter(tourist =>
    tourist.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (session: any) => {
    if (!session || !session.is_active) return 'outline';
    switch (session.safety_status) {
      case 'safe': return 'default';
      case 'alert': return 'secondary';
      case 'emergency': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (session: any) => {
    if (!session || !session.is_active) return 'Offline';
    return session.safety_status?.charAt(0).toUpperCase() + session.safety_status?.slice(1) || 'Unknown';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Manage Tourists
          </h1>
          <p className="text-muted-foreground mt-1">Monitor and manage registered tourists</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTourists} disabled={loading}>
            <Shield className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Tourist
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tourists by name or country..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Tourists</p>
              <p className="text-2xl font-bold">{tourists.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active Now</p>
              <p className="text-2xl font-bold">
                {tourists.filter(t => t.current_session?.is_active).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">On Alert</p>
              <p className="text-2xl font-bold">
                {tourists.filter(t => t.current_session?.safety_status === 'alert').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Emergency</p>
              <p className="text-2xl font-bold">
                {tourists.filter(t => t.current_session?.safety_status === 'emergency').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tourists List */}
      <div className="space-y-4">
        {filteredTourists.map((tourist) => (
          <Card key={tourist.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold">{tourist.full_name}</h3>
                  <Badge variant={getStatusColor(tourist.current_session)}>
                    {getStatusText(tourist.current_session)}
                  </Badge>
                  {tourist.country && (
                    <span className="text-sm text-muted-foreground">from {tourist.country}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Contact:</span>
                      <p className="text-sm text-muted-foreground">
                        {tourist.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Emergency Contact:</span>
                      <p className="text-sm text-muted-foreground">
                        {tourist.emergency_contact_name && tourist.emergency_contact_phone 
                          ? `${tourist.emergency_contact_name} (${tourist.emergency_contact_phone})`
                          : 'Not provided'
                        }
                      </p>
                    </div>
                  </div>

                  {tourist.current_session && (
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Current Location:</span>
                        <p className="text-sm text-muted-foreground">
                          {tourist.current_session.current_location_lat && tourist.current_session.current_location_lng
                            ? `${tourist.current_session.current_location_lat.toFixed(4)}, ${tourist.current_session.current_location_lng.toFixed(4)}`
                            : 'Location not available'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Last Update:</span>
                        <p className="text-sm text-muted-foreground">
                          {tourist.current_session.last_ping 
                            ? new Date(tourist.current_session.last_ping).toLocaleString()
                            : 'No recent activity'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                {tourist.current_session?.is_active && (
                  <Button variant="outline" size="sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    Track
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filteredTourists.length === 0 && !loading && (
          <Card className="p-12">
            <div className="text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tourists Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No tourists match your search criteria.' : 'No tourists registered yet.'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManageTourists;