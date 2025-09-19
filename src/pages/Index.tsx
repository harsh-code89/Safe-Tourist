import React from 'react';
import { Shield, Users, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect based on user role
  React.useEffect(() => {
    if (user && profile) {
      if (profile.role === 'tourist') {
        navigate('/app');
      } else if (['admin', 'police'].includes(profile.role)) {
        // Stay on dashboard (this will be handled by ProtectedRoute)
      }
    }
  }, [user, profile, navigate]);

  if (user && profile) {
    // This will be redirected by useEffect, but show loading state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-primary animate-pulse mb-4" />
          <p className="text-lg text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
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

        <div className="text-sm text-muted-foreground space-y-2">
          <p>🔗 Blockchain-powered digital tourist IDs</p>
          <p>🤖 AI anomaly detection and geo-fencing</p>
          <p>🚨 Real-time emergency response system</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
