import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleConnectionChange = (e: any) => {
      setConnectionType(e.detail?.connectionType || 'unknown');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('networkStatusChange', handleConnectionChange as EventListener);

    // Check initial connection type if available
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        setConnectionType(conn.effectiveType || 'unknown');
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('networkStatusChange', handleConnectionChange as EventListener);
    };
  }, []);

  return { isOnline, connectionType };
}
