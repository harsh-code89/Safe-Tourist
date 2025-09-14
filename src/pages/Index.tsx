import React, { useState } from 'react';
import { Shield, Users, RotateCcw, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import TouristApp from '@/components/TouristApp';
import AdminDashboard from '@/components/AdminDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

const Index = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'tourist' | 'admin'>('welcome');
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

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

        {user ? (
          <Card className="p-8 bg-gradient-glass backdrop-blur-sm border border-white/20">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Welcome back, {profile?.full_name}!</h2>
              <p className="text-sm text-muted-foreground capitalize">{profile?.role} Account</p>
            </div>
            
            <div className="space-y-4">
              {(profile?.role === 'tourist') && (
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
              )}
              
              {(profile?.role === 'admin' || profile?.role === 'police') && (
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
              )}

              <Button 
                variant="outline"
                size="lg" 
                className="w-full"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-8 bg-gradient-glass backdrop-blur-sm border border-white/20">
            <h2 className="text-xl font-semibold mb-6">Get Started</h2>
            <div className="space-y-4">
              <Button 
                variant="default"
                size="lg" 
                className="w-full h-16 text-lg"
                onClick={() => navigate('/auth')}
              >
                <LogIn className="w-6 h-6 mr-3" />
                <div className="text-left">
                  <div>Sign In / Sign Up</div>
                  <div className="text-sm opacity-75">Access your SafeTourist account</div>
                </div>
              </Button>
            </div>
          </Card>
        )}

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
      {currentView === 'tourist' && (
        <ProtectedRoute requiredRole="tourist">
          <TouristApp />
        </ProtectedRoute>
      )}
      {currentView === 'admin' && (
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      )}
    </div>
  );
};

export default Index;
