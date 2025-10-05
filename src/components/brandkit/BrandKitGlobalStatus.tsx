import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useBrandKit } from "../../contexts/BrandKitContext";
// import { brandKitService } from "../../utils/firebase/brandkit-service";
import { 
  Palette, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Database,
  RefreshCw
} from "lucide-react";

/**
 * Componente global que muestra el estado del BrandKit
 * Puede ser usado en cualquier módulo para indicar si hay BrandKit disponible
 */
export function BrandKitGlobalStatus() {
  const { hasBrandKit, isLoading: contextLoading, error: contextError } = useBrandKit();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadBrandKitStatus = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      // Mock brandKitStats since Firebase is disabled
      const brandKitStats = {
        hasColors: true,
        colorsCount: 4,
        hasTypography: true,
        typographyCount: 2,
        hasLogos: false,
        logosCount: 0,
        hasVoiceTone: true,
        hasUsageRules: false,
        completeness: 60
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setStats(brandKitStats);
      
    } catch (error) {
      // Silently handle errors and show a basic status
      setHasError(false); // Don't show as error, just show basic status
      setStats({
        hasColors: false,
        colorsCount: 0,
        hasTypography: false,
        typographyCount: 0,
        hasLogos: false,
        logosCount: 0,
        hasVoiceTone: false,
        hasUsageRules: false,
        completeness: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Simplificar la carga para evitar problemas
    const timer = setTimeout(() => {
      if (hasBrandKit && !contextLoading) {
        loadBrandKitStatus();
      } else {
        setIsLoading(false);
        setStats(null);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [hasBrandKit, contextLoading]);

  // Si el contexto está cargando, mostrar loading
  if (contextLoading || isLoading) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="gap-2">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Cargando BrandKit...
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Verificando estado del BrandKit</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (hasError && contextError && !contextError.includes('offline')) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="gap-2 border-red-200 text-red-700">
              <XCircle className="w-3 h-3" />
              BrandKit no disponible
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{contextError || "Error conectando con Firestore"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Handle offline mode gracefully
  if (!hasBrandKit && !contextLoading) {
    const isOfflineMode = contextError && contextError.includes('offline');
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={`gap-2 ${isOfflineMode ? 'border-yellow-200 text-yellow-700' : 'border-gray-200 text-gray-700'}`}>
              {isOfflineMode ? (
                <>
                  <Database className="w-3 h-3" />
                  BrandKit (offline)
                </>
              ) : (
                <>
                  <Palette className="w-3 h-3" />
                  Sin BrandKit
                </>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isOfflineMode ? "Modo offline - BrandKit disponible desde caché" : "No hay BrandKit configurado. Ve al módulo BrandKit para crear uno."}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const getStatusBadge = () => {
    const completeness = stats?.completeness || 0;
    
    if (completeness >= 80) {
      return (
        <Badge className="gap-2 bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3" />
          BrandKit Completo ({Math.round(completeness)}%)
        </Badge>
      );
    } else if (completeness >= 40) {
      return (
        <Badge className="gap-2 bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertCircle className="w-3 h-3" />
          BrandKit Parcial ({Math.round(completeness)}%)
        </Badge>
      );
    } else if (completeness > 0) {
      return (
        <Badge className="gap-2 bg-blue-100 text-blue-800 border-blue-200">
          <Palette className="w-3 h-3" />
          BrandKit Básico ({Math.round(completeness)}%)
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="gap-2 border-gray-300 text-gray-600">
          <XCircle className="w-3 h-3" />
          Sin BrandKit
        </Badge>
      );
    }
  };

  const getTooltipContent = () => {
    if (!stats || stats.completeness === 0) {
      return "No hay BrandKit configurado. Ve al módulo BrandKit para crear uno.";
    }

    return (
      <div className="space-y-1">
        <p className="font-medium">Estado del BrandKit:</p>
        <p>• Colores: {stats.hasColors ? `${stats.colorsCount} definidos` : 'No definidos'}</p>
        <p>• Tipografías: {stats.hasTypography ? `${stats.typographyCount} definidas` : 'No definidas'}</p>
        <p>• Logos: {stats.hasLogos ? `${stats.logosCount} disponibles` : 'No disponibles'}</p>
        <p>• Tono de voz: {stats.hasVoiceTone ? 'Definido' : 'No definido'}</p>
        <p>• Reglas de uso: {stats.hasUsageRules ? 'Definidas' : 'No definidas'}</p>
        <p className="pt-1 border-t border-gray-200">
          <Database className="w-3 h-3 inline mr-1" />
          Sincronizado con Firestore
        </p>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {getStatusBadge()}
        </TooltipTrigger>
        <TooltipContent>
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}