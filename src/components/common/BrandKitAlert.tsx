import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  Palette,
  RefreshCw
} from "lucide-react";

interface BrandKitAlertProps {
  showOnlyWarning?: boolean;
  moduleType?: 'post' | 'video' | 'story' | 'chat';
  className?: string;
}

export function BrandKitAlert({ showOnlyWarning = false, moduleType = 'post', className }: BrandKitAlertProps) {
  const { hasBrandKit, isLoading, error, lastUpdated, refreshBrandKit } = useBrandKit();

  // Si solo queremos mostrar advertencias y hay BrandKit, no mostrar nada
  if (showOnlyWarning && hasBrandKit) {
    return null;
  }

  // Estado de carga
  if (isLoading) {
    return (
      <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
        <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
        <AlertDescription className="text-blue-800 flex items-center gap-2">
          <span>Cargando BrandKit...</span>
        </AlertDescription>
      </Alert>
    );
  }

  // Error
  if (error) {
    const isOfflineError = error.includes('offline') || error.includes('Modo offline');
    
    return (
      <Alert className={`${isOfflineError ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'} ${className}`}>
        {isOfflineError ? (
          <Clock className="h-4 w-4 text-yellow-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-red-600" />
        )}
        <AlertDescription className={`${isOfflineError ? 'text-yellow-800' : 'text-red-800'} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            {isOfflineError ? (
              <>
                <span>🔄 Modo offline -</span>
                <span className="text-sm">Usando datos en caché del BrandKit</span>
              </>
            ) : (
              <span>Error conectando con BrandKit: {error}</span>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshBrandKit}
            className="ml-4"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            {isOfflineError ? 'Reintentar conexión' : 'Reintentar'}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Sin BrandKit
  if (!hasBrandKit) {
    return (
      <Alert className={`border-amber-200 bg-amber-50 ${className}`}>
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️ No hay BrandKit definido.</span>
            <span className="text-sm">Sube tu manual de marca para continuar.</span>
          </div>
          <Badge variant="outline" className="ml-4 border-amber-300 text-amber-700">
            <Palette className="w-3 h-3 mr-1" />
            Ir a BrandKit
          </Badge>
        </AlertDescription>
      </Alert>
    );
  }

  // BrandKit activo (solo si no es showOnlyWarning)
  if (!showOnlyWarning) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>Aplicando BrandKit:</span>
            {lastUpdated && (
              <div className="flex items-center gap-1 text-sm">
                <Clock className="w-3 h-3" />
                <span>actualizado el {lastUpdated}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Activo</span>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}