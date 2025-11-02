import { useEffect, useState } from 'react';
import { Wifi, WifiOff, CloudOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { offlineManager } from '@/lib/offlineManager';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setQueueLength(0);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const updateQueueLength = () => {
      setQueueLength(offlineManager.getQueueLength());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check queue length periodically
    const interval = setInterval(updateQueueLength, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && queueLength === 0) {
    return null; // Don't show anything when online and no pending changes
  }

  return (
    <Badge 
      variant={isOnline ? "secondary" : "destructive"} 
      className="flex items-center gap-1 text-xs h-6"
    >
      {isOnline ? (
        <>
          <CloudOff className="h-3 w-3" />
          <span>{queueLength} pending</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </>
      )}
    </Badge>
  );
}
