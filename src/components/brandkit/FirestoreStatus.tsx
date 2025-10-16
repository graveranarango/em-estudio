import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { brandKitExists, loadBrandKit, formatLastUpdated } from "../../utils/firebase/brandkit";
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Wifi,
  WifiOff
} from "lucide-react";

interface FirestoreStatusProps {
  onBrandKitLoad?: (data: any) => void;
}

export function FirestoreStatus({ onBrandKitLoad }: FirestoreStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const checkFirestoreStatus = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Verificar conexión y datos
      const exists = await brandKitExists();
      setIsConnected(true);
      setHasData(exists);
      
      if (exists) {
        const data = await loadBrandKit();
        if (data?.metadata?.updatedAt) {
          setLastUpdated(formatLastUpdated(data.metadata.updatedAt));
        }
        onBrandKitLoad?.(data);
      }
      
    } catch (err) {
      console.error("Error verificando Firestore:", err);
      setIsConnected(false);
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkFirestoreStatus();
  }, []);

  const getStatusColor = () => {
    if (isConnected === null) return "gray";
    if (!isConnected) return "red";
    if (hasData) return "green";
    return "yellow";
  };

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (isConnected === null) return <Database className="w-4 h-4" />;
    if (!isConnected) return <WifiOff className="w-4 h-4" />;
    if (hasData) return <CheckCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isLoading) return "Verificando conexión...";
    if (isConnected === null) return "Estado desconocido";
    if (!isConnected) return "Sin conexión a Firestore";
    if (hasData) return "BrandKit encontrado";
    return "Sin datos guardados";
  };

  const statusColor = getStatusColor();

  return (
    <Card className="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            statusColor === 'green' ? 'bg-green-100 text-green-600' :
            statusColor === 'red' ? 'bg-red-100 text-red-600' :
            statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {getStatusIcon()}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Estado de Firestore</h4>
              <Badge 
                variant="secondary" 
                className={`${
                  statusColor === 'green' ? 'bg-green-100 text-green-800' :
                  statusColor === 'red' ? 'bg-red-100 text-red-800' :
                  statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {getStatusText()}
              </Badge>
            </div>
            
            {lastUpdated && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Última actualización: {lastUpdated}</span>
              </div>
            )}
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkFirestoreStatus}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Verificar
        </Button>
      </div>

      {error && (
        <Alert className="mt-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {isConnected && !hasData && (
        <Alert className="mt-4 border-blue-200 bg-blue-50">
          <Database className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Conexión exitosa. Sube tu primer manual de marca para crear tu BrandKit.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}