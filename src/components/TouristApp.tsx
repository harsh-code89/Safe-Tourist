import React, { useState, useEffect } from 'react';
import { Shield, MapPin, AlertTriangle, Phone, QrCode, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TouristSession {
  id: string;
  user_id: string;
  is_active: boolean;
  current_location_lat?: number;
  current_location_lng?: number;
  safety_status: string;
  last_ping: string;
}

const TouristApp = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [safetyStatus, setSafetyStatus] = useState<'safe' | 'warning' | 'danger'>('safe');
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [session, setSession] = useState<TouristSession | null>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const handlePanicButton = async () => {
    if (!user) return;
    
    setSafetyStatus('danger');
    
    try {
      // Create emergency alert in database
      const { error } = await supabase
        .from('emergency_alerts')
        .insert({
          user_id: user.id,
          alert_type: 'panic',
          message: 'Emergency panic button activated',
          location_lat: location.lat,
          location_lng: location.lng,
          status: 'active'
        });

      if (error) throw error;

      // Update session status
      if (session) {
        await supabase
          .from('tourist_sessions')
          .update({ 
            safety_status: 'emergency',
            current_location_lat: location.lat,
            current_location_lng: location.lng,
            last_ping: new Date().toISOString()
          })
          .eq('id', session.id);
      }

      toast({
        title: "🚨 Emergency Alert Sent",
        description: "Your location has been shared with emergency services and your emergency contacts.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast({
        title: "Error",
        description: "Failed to send emergency alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startTracking = async () => {
    if (!user) return;
    
    try {
      // Create or update tourist session
      const { data, error } = await supabase
        .from('tourist_sessions')
        .upsert({
          user_id: user.id,
          is_active: true,
          start_time: new Date().toISOString(),
          current_location_lat: location.lat,
          current_location_lng: location.lng,
          safety_status: 'safe',
          last_ping: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      
      setSession(data);
      setIsTracking(true);
      toast({
        title: "📍 Location Tracking Started",
        description: "You're now being monitored for safety. Stay safe!",
      });
    } catch (error) {
      console.error('Error starting tracking:', error);
      toast({
        title: "Error",
        description: "Failed to start tracking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopTracking = async () => {
    if (!user || !session) return;
    
    try {
      const { error } = await supabase
        .from('tourist_sessions')
        .update({
          is_active: false,
          end_time: new Date().toISOString(),
          safety_status: 'safe'
        })
        .eq('id', session.id);

      if (error) throw error;
      
      setIsTracking(false);
      setSafetyStatus('safe');
      setSession(null);
      
      toast({
        title: "🛑 Tracking Stopped",
        description: "Location monitoring has been disabled.",
      });
    } catch (error) {
      console.error('Error stopping tracking:', error);
      toast({
        title: "Error",
        description: "Failed to stop tracking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = () => {
    switch (safetyStatus) {
      case 'safe': return 'success';
      case 'warning': return 'warning';
      case 'danger': return 'emergency';
      default: return 'primary';
    }
  };

  const getStatusText = () => {
    switch (safetyStatus) {
      case 'safe': return 'You are in a safe zone';
      case 'warning': return 'Caution: Moderate risk area';
      case 'danger': return 'Emergency alert active';
      default: return 'Status unknown';
    }
  };

  // Load existing session on component mount
  useEffect(() => {
    const loadSession = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('tourist_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setSession(data);
          setIsTracking(true);
          setSafetyStatus(data.safety_status === 'emergency' ? 'danger' : 
                         data.safety_status === 'alert' ? 'warning' : 'safe');
          if (data.current_location_lat && data.current_location_lng) {
            setLocation({
              lat: parseFloat(data.current_location_lat.toString()),
              lng: parseFloat(data.current_location_lng.toString())
            });
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
      }
    };

    loadSession();
  }, [user]);

  // Simulate location updates and periodic pings
  useEffect(() => {
    if (isTracking && session) {
      const interval = setInterval(async () => {
        try {
          // Update last ping
          await supabase
            .from('tourist_sessions')
            .update({ 
              last_ping: new Date().toISOString(),
              current_location_lat: location.lat,
              current_location_lng: location.lng
            })
            .eq('id', session.id);
          
          // Simulate entering different zones
          const scenarios = ['safe', 'warning', 'safe'];
          const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)] as 'safe' | 'warning';
          if (safetyStatus !== 'danger') {
            setSafetyStatus(randomScenario);
            if (randomScenario === 'warning') {
              toast({
                title: "⚠️ Area Alert",
                description: "You've entered a moderate risk zone. Stay alert and consider moving to a safer area.",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error('Error updating location:', error);
        }
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [isTracking, session, safetyStatus, location, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold text-foreground mb-2">SafeTourist</h1>
          <p className="text-muted-foreground">Stay safe, travel smart</p>
        </div>

        {/* Tourist ID Card */}
        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-primary">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Digital Tourist ID</h2>
              <p className="text-sm opacity-90">{profile?.id || 'Loading...'}</p>
            </div>
            <QrCode className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <p className="font-medium">{profile?.full_name || 'Tourist'}</p>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <MapPin className="w-4 h-4" />
              <span>{profile?.country || 'Location'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Activity className="w-4 h-4" />
              <span>Active since: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        {/* Safety Status */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-4 h-4 rounded-full ${
              safetyStatus === 'safe' ? 'bg-success' :
              safetyStatus === 'warning' ? 'bg-warning' : 'bg-emergency'
            } ${safetyStatus === 'danger' ? 'animate-emergency' : ''}`} />
            <span className="font-medium">{getStatusText()}</span>
          </div>
          
          {isTracking && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
            </div>
          )}
        </Card>

        {/* Emergency Button */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 text-center">Emergency Controls</h3>
          <Button 
            variant="emergency" 
            size="lg" 
            className="w-full mb-4" 
            onClick={handlePanicButton}
            disabled={safetyStatus === 'danger'}
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            {safetyStatus === 'danger' ? 'Emergency Alert Active' : 'Emergency Panic Button'}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="flex-1">
              <Phone className="w-4 h-4 mr-2" />
              Call Help
            </Button>
            <Button variant="outline" className="flex-1">
              <MapPin className="w-4 h-4 mr-2" />
              Share Location
            </Button>
          </div>
        </Card>

        {/* Tracking Controls */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Safety Tracking</h4>
              <p className="text-sm text-muted-foreground">
                {isTracking ? 'Location monitoring active' : 'Start monitoring for safety alerts'}
              </p>
            </div>
            <Button 
              variant={isTracking ? "secondary" : "default"}
              onClick={isTracking ? stopTracking : startTracking}
            >
              {isTracking ? 'Stop' : 'Start'}
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <MapPin className="w-6 h-6" />
            <span className="text-sm">Find Safe Zones</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Shield className="w-6 h-6" />
            <span className="text-sm">Safety Tips</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TouristApp;