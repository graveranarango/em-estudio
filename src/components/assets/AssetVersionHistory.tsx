import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { 
  Download, 
  Eye, 
  RotateCcw, 
  Clock, 
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { AssetVersion } from "../../types/assets";

interface AssetVersionHistoryProps {
  versions: AssetVersion[];
  currentVersion: number;
  onPreview: (version: AssetVersion) => void;
  onDownload: (version: AssetVersion) => void;
  onRestore: (version: AssetVersion) => void;
}

export function AssetVersionHistory({ 
  versions, 
  currentVersion, 
  onPreview, 
  onDownload, 
  onRestore 
}: AssetVersionHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);
  const displayVersions = isExpanded ? sortedVersions : sortedVersions.slice(0, 3);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDimensionsText = (dimensions?: { width: number; height: number }) => {
    if (!dimensions) return 'N/A';
    return `${dimensions.width} × ${dimensions.height}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h4 className="font-medium">Historial de Versiones</h4>
        <Badge variant="outline" className="text-xs">
          {versions.length} versión{versions.length !== 1 ? 'es' : ''}
        </Badge>
      </div>

      <div className="space-y-3">
        {displayVersions.map((version, index) => (
          <Card key={version.version} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h5 className="font-medium">
                    Versión {version.version}
                  </h5>
                  
                  {version.version === currentVersion && (
                    <Badge variant="default" className="text-xs">
                      Actual
                    </Badge>
                  )}
                  
                  <span className="text-xs text-muted-foreground">
                    {formatDate(version.date)}
                  </span>
                </div>

                {version.notes && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {version.notes}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Tamaño: </span>
                    {formatFileSize(version.fileSize)}
                  </div>
                  
                  {version.dimensions && (
                    <div>
                      <span className="font-medium">Dimensiones: </span>
                      {getDimensionsText(version.dimensions)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreview(version)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownload(version)}
                  className="h-8 w-8 p-0"
                >
                  <Download className="w-4 h-4" />
                </Button>
                
                {version.version !== currentVersion && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRestore(version)}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {version.thumbnailUrl && (
              <div className="mt-3 pt-3 border-t">
                <img
                  src={version.thumbnailUrl}
                  alt={`Vista previa versión ${version.version}`}
                  className="w-full h-20 object-cover rounded border"
                />
              </div>
            )}
          </Card>
        ))}
      </div>

      {versions.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full gap-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Ver todas las versiones ({versions.length - 3} más)
            </>
          )}
        </Button>
      )}

      {versions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No hay versiones disponibles</p>
        </div>
      )}
    </div>
  );
}