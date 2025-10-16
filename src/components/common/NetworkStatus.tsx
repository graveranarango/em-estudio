import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { getNetworkState, forceOnlineMode, forceOfflineMode } from "../../utils/firebase/config";
import { isFirebaseCompletelyOffline } from "../../utils/firebase/firestore-offline-manager";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Settings 
} from "lucide-react";

interface NetworkStatusProps {
  className?: string;
  showControls?: boolean;
}

export function NetworkStatus({ className, showControls = false }: NetworkStatusProps) {
  const [networkState, setNetworkState] = useState(getNetworkState());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isFirebaseOffline, setIsFirebaseOffline] = useState(isFirebaseCompletelyOffline());

  useEffect(() => {
    // Update network state periodically
    const interval = setInterval(() => {
      setNetworkState(getNetworkState());
      setIsFirebaseOffline(isFirebaseCompletelyOffline());
    }, 5000);

    // Listen for online/offline events
    const handleOnline = () => setNetworkState(getNetworkState());
    const handleOffline = () => setNetworkState(getNetworkState());

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const handleForceOnline = async () => {
    setIsRefreshing(true);
    try {
      await forceOnlineMode();
      setNetworkState(getNetworkState());
    } catch (error) {
      console.error('Failed to force online mode:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleForceOffline = async () => {
    setIsRefreshing(true);
    try {
      await forceOfflineMode();
      setNetworkState(getNetworkState());
    } catch (error) {
      console.error('Failed to force offline mode:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isOnline = networkState.isOnline && !networkState.isOffline && !isFirebaseOffline;

  if (!showControls && isOnline) {
    // Don't show anything when online and not showing controls
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge 
          variant={isOnline ? "default" : "destructive"}
          className={`flex items-center gap-1 ${
            isOnline 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              Offline
            </>
          )}
        </Badge>

        {showControls && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Settings className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Offline Alert */}
      {!isOnline && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="flex items-center justify-between">
              <span>Modo offline activo - Funcionalidad limitada</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceOnline}
                disabled={isRefreshing}
                className="ml-4"
              >
                {isRefreshing ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Wifi className="w-3 h-3" />
                )}
                Reconectar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Controls */}
      {showDetails && showControls && (
        <Alert className="border-blue-200 bg-blue-50">
          <Settings className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Control de Red</span>
                <div className="flex items-center gap-1">
                  {isOnline ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  )}
                  <span className="text-xs">
                    {isOnline ? 'Conectado a Firebase' : 'Desconectado de Firebase'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleForceOnline}
                  disabled={isRefreshing || isOnline}
                >
                  <Wifi className="w-3 h-3 mr-1" />
                  Conectar
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleForceOffline}
                  disabled={isRefreshing || networkState.isOffline}
                >
                  <WifiOff className="w-3 h-3 mr-1" />
                  Desconectar
                </Button>
              </div>

              <div className="text-xs text-blue-600">
                <p>• Online: Todas las funciones disponibles</p>
                <p>• Offline: Usando datos en caché del BrandKit</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}