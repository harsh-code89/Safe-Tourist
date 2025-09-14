import React, { useState, useEffect } from 'react';
import { Shield, MapPin, AlertTriangle, Phone, QrCode, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface TouristData {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  status: 'safe' | 'alert' | 'emergency';
  lastSeen: Date;
}

const TouristApp = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [safetyStatus, setSafetyStatus] = useState<'safe' | 'warning' | 'danger'>('safe');
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const { toast } = useToast();

  const touristData: TouristData = {
    id: 'TST-2024-001',
    name: 'Alex Johnson',
    location: location,
    status: safetyStatus === 'danger' ? 'emergency' : safetyStatus === 'warning' ? 'alert' : 'safe',
    lastSeen: new Date()
  };

  const handlePanicButton = () => {
    setSafetyStatus('danger');
    toast({
      title: "🚨 Emergency Alert Sent",
      description: "Your location has been shared with emergency services and your emergency contacts.",
      variant: "destructive",
    });
  };

  const startTracking = () => {
    setIsTracking(true);
    toast({
      title: "📍 Location Tracking Started",
      description: "You're now being monitored for safety. Stay safe!",
    });
  };

  const stopTracking = () => {
    setIsTracking(false);
    setSafetyStatus('safe');
    toast({
      title: "🛑 Tracking Stopped",
      description: "Location monitoring has been disabled.",
    });
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

  // Simulate location updates
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
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
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [isTracking, safetyStatus, toast]);

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
              <p className="text-sm opacity-90">{touristData.id}</p>
            </div>
            <QrCode className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <p className="font-medium">{touristData.name}</p>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <MapPin className="w-4 h-4" />
              <span>New York, NY</span>
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