
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const NotificationSystem = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      toast({
        title: `Welcome ${user.username}!`,
        description: "You have successfully logged in to Cogniflow ERP",
      });
    }
  }, [user]);

  return null;
};
