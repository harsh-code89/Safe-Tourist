import React, { useState } from 'react';
import { Shield, Users, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import TouristApp from '@/components/TouristApp';
import AdminDashboard from '@/components/AdminDashboard';

const Index = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'tourist' | 'admin'>('welcome');

  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center space-y-8">
        <div className="space-y-4">
          <Shield className="w-16 h-16 mx-auto text-primary animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            SafeTourist
          </h1>
          <p className="text-lg text-muted-foreground">
            Advanced AI-powered tourist safety platform with blockchain identity and real-time monitoring
          </p>
        </div>

        <Card className="p-8 bg-gradient-glass backdrop-blur-sm border border-white/20">
          <h2 className="text-xl font-semibold mb-6">Choose Your Interface</h2>
          <div className="space-y-4">
            <Button 
              variant="default"
              size="lg" 
              className="w-full h-16 text-lg"
              onClick={() => setCurrentView('tourist')}
            >
              <Shield className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div>Tourist App</div>
                <div className="text-sm opacity-75">Emergency alerts, location tracking, digital ID</div>
              </div>
            </Button>
            
            <Button 
              variant="glass"
              size="lg" 
              className="w-full h-16 text-lg"
              onClick={() => setCurrentView('admin')}
            >
              <Users className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div>Admin Dashboard</div>
                <div className="text-sm opacity-75">Monitor tourists, respond to emergencies</div>
              </div>
            </Button>
          </div>
        </Card>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>🔗 Blockchain-powered digital tourist IDs</p>
          <p>🤖 AI anomaly detection and geo-fencing</p>
          <p>🚨 Real-time emergency response system</p>
        </div>
      </div>
    </div>
  );

  if (currentView === 'welcome') {
    return <WelcomeScreen />;
  }

  return (
    <div className="relative">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button 
          variant="glass" 
          size="sm"
          onClick={() => setCurrentView('welcome')}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Current View */}
      {currentView === 'tourist' && <TouristApp />}
      {currentView === 'admin' && <AdminDashboard />}
    </div>
  );
};

export default Index;
