import React, { useState } from 'react';
import { AlertTriangle, Phone, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmergencyModalProps {
  alert: {
    id: string;
    user_id: string;
    alert_type: string;
    message: string;
    created_at: string;
    location_lat?: number;
    location_lng?: number;
    tourist_name?: string;
  };
  onResolve: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ alert, onResolve }) => {
  const [responding, setResponding] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleEmergencyResponse = async () => {
    try {
      setResponding(true);

      // Update tourist session status to safe
      await supabase
        .from('tourist_sessions')
        .update({ safety_status: 'safe' })
        .eq('user_id', alert.user_id)
        .eq('is_active', true);

      // Resolve the alert
      await supabase
        .from('emergency_alerts')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id
        })
        .eq('id', alert.id);

      toast({
        title: "Emergency Response Completed",
        description: `Successfully responded to emergency for ${alert.tourist_name}`,
      });

      onResolve();
    } catch (error) {
      console.error('Error responding to emergency:', error);
      toast({
        title: "Error",
        description: "Failed to respond to emergency. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResponding(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="emergency" size="sm">
          <Phone className="w-4 h-4 mr-1" />
          Respond
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Emergency Response Required
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-3 mt-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800">{alert.tourist_name}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                    <span>Alert Type: <strong>{alert.alert_type.toUpperCase()}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-red-600" />
                    <span>Time: {new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                  {alert.location_lat && alert.location_lng && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-600" />
                      <span>Location: {alert.location_lat.toFixed(4)}, {alert.location_lng.toFixed(4)}</span>
                    </div>
                  )}
                  {alert.message && (
                    <div className="mt-2">
                      <strong>Message:</strong> {alert.message}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Confirming this action will:
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Mark the tourist's status as safe</li>
                <li>Resolve this emergency alert</li>
                <li>Log your response in the system</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleEmergencyResponse} 
            disabled={responding}
            className="bg-green-600 hover:bg-green-700"
          >
            {responding ? 'Responding...' : 'Confirm Response'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};