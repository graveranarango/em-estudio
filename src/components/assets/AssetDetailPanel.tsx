import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { 
  X, 
  Download, 
  Edit, 
  Copy, 
  Trash2, 
  Share2,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  User,
  Palette,
  Tag
} from "lucide-react";
import { Asset } from "../../types/assets";
import { AssetVersionHistory } from "./AssetVersionHistory";
import { useBrandKit } from "../../contexts/BrandKitContext";

interface AssetDetailPanelProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (asset: Asset) => void;
  onDuplicate: (asset: Asset) => void;
  onDownload: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onShare: (asset: Asset) => void;
}

export function AssetDetailPanel({ 
  asset, 
  isOpen, 
  onClose, 
  onEdit, 
  onDuplicate, 
  onDownload, 
  onDelete,
  onShare 
}: AssetDetailPanelProps) {
  const { brandKit } = useBrandKit();
  const [activeTab, setActiveTab] = useState("overview");

  if (!asset) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCurrentVersion = () => {
    return asset.versions.find(v => v.version === asset.currentVersion);
  };

  const statusColors = {
    draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
    final: "bg-blue-100 text-blue-800 border-blue-200",
    published: "bg-green-100 text-green-800 border-green-200",
  };

  const statusLabels = {
    draft: "Borrador",
    final: "Finalizado",
    published: "Publicado",
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg lg:max-w-2xl">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-4">
              <SheetTitle className="text-xl">{asset.title}</SheetTitle>
              <SheetDescription>
                {asset.description || `Detalles del ${asset.type} - ${asset.platform}`}
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Vista previa principal */}
        <div className="mb-6">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border">
            {asset.thumbnailUrl ? (
              <img 
                src={asset.thumbnailUrl} 
                alt={asset.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground">Sin vista previa</span>
              </div>
            )}
            
            {/* Indicador de BrandKit */}
            <div className="absolute top-3 right-3">
              {asset.brandCompliance.isCompliant ? (
                <div className="bg-green-500 rounded-full p-2">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="bg-yellow-500 rounded-full p-2">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button onClick={() => onEdit(asset)} className="gap-2">
            <Edit className="w-4 h-4" />
            Editar
          </Button>
          
          <Button variant="outline" onClick={() => onDuplicate(asset)} className="gap-2">
            <Copy className="w-4 h-4" />
            Duplicar
          </Button>
          
          <Button variant="outline" onClick={() => onDownload(asset)} className="gap-2">
            <Download className="w-4 h-4" />
            Descargar
          </Button>
          
          <Button variant="outline" onClick={() => onShare(asset)} className="gap-2">
            <Share2 className="w-4 h-4" />
            Compartir
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => onDelete(asset)} 
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </Button>
        </div>

        {/* Contenido con tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Información</TabsTrigger>
            <TabsTrigger value="versions">Versiones</TabsTrigger>
            <TabsTrigger value="brandkit">BrandKit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            {/* Metadatos básicos */}
            <Card className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Metadatos
              </h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Tipo</label>
                  <p className="capitalize">{asset.type}</p>
                </div>
                
                <div>
                  <label className="font-medium text-muted-foreground">Estado</label>
                  <Badge className={`${statusColors[asset.status]} mt-1`}>
                    {statusLabels[asset.status]}
                  </Badge>
                </div>
                
                <div>
                  <label className="font-medium text-muted-foreground">Plataforma</label>
                  <p className="capitalize">{asset.platform}</p>
                </div>
                
                <div>
                  <label className="font-medium text-muted-foreground">Formato</label>
                  <p>{asset.metadata.format}</p>
                </div>
                
                <div>
                  <label className="font-medium text-muted-foreground">Tamaño</label>
                  <p>{formatFileSize(asset.metadata.fileSize)}</p>
                </div>
                
                {asset.metadata.dimensions && (
                  <div>
                    <label className="font-medium text-muted-foreground">Dimensiones</label>
                    <p>{asset.metadata.dimensions.width} × {asset.metadata.dimensions.height}</p>
                  </div>
                )}
                
                {asset.metadata.duration && (
                  <div>
                    <label className="font-medium text-muted-foreground">Duración</label>
                    <p>{Math.floor(asset.metadata.duration / 60)}:{(asset.metadata.duration % 60).toString().padStart(2, '0')}</p>
                  </div>
                )}
                
                <div>
                  <label className="font-medium text-muted-foreground">Versión actual</label>
                  <p>v{asset.currentVersion}</p>
                </div>
              </div>
            </Card>

            {/* Fechas */}
            <Card className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fechas
              </h4>
              
              <div className="space-y-3 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Creado</label>
                  <p>{formatDate(asset.createdAt)}</p>
                </div>
                
                <div>
                  <label className="font-medium text-muted-foreground">Última modificación</label>
                  <p>{formatDate(asset.updatedAt)}</p>
                </div>
              </div>
            </Card>

            {/* Autor */}
            <Card className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Autor
              </h4>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">
                  {asset.author.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{asset.author.name}</p>
                  <p className="text-xs text-muted-foreground">ID: {asset.author.id}</p>
                </div>
              </div>
            </Card>

            {/* Tags */}
            {asset.tags.length > 0 && (
              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Etiquetas
                </h4>
                
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="versions" className="mt-6">
            <AssetVersionHistory
              versions={asset.versions}
              currentVersion={asset.currentVersion}
              onPreview={(version) => {
                // Implementar preview
                console.log('Preview version:', version);
              }}
              onDownload={(version) => {
                // Implementar descarga de versión específica
                console.log('Download version:', version);
              }}
              onRestore={(version) => {
                // Implementar restaurar versión
                console.log('Restore version:', version);
              }}
            />
          </TabsContent>

          <TabsContent value="brandkit" className="mt-6">
            <Card className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Estado del BrandKit
              </h4>
              
              <div className="space-y-4">
                {/* Score general */}
                <div className="flex items-center justify-between">
                  <span>Puntuación de cumplimiento</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-medium ${
                      asset.brandCompliance.score >= 80 ? 'text-green-600' : 
                      asset.brandCompliance.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {asset.brandCompliance.score}%
                    </span>
                    {asset.brandCompliance.isCompliant ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                </div>

                <Separator />

                {/* Estado de cumplimiento */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {asset.brandCompliance.isCompliant ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className="font-medium">
                      {asset.brandCompliance.isCompliant ? 'Cumple con el BrandKit' : 'Necesita revisión'}
                    </span>
                  </div>
                  
                  {!asset.brandCompliance.isCompliant && (
                    <p className="text-sm text-muted-foreground">
                      Se han detectado elementos que no siguen las directrices del BrandKit.
                    </p>
                  )}
                </div>

                {/* Problemas encontrados */}
                {asset.brandCompliance.issues.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Problemas detectados:</h5>
                    <ul className="space-y-1">
                      {asset.brandCompliance.issues.map((issue, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* BrandKit asociado */}
                <div>
                  <h5 className="font-medium mb-2">BrandKit aplicado:</h5>
                  <div className="bg-muted/50 rounded p-3">
                    <p className="text-sm">ID: {asset.brandkitId}</p>
                    {brandKit && (
                      <p className="text-sm text-muted-foreground">
                        Marca: {brandKit.brandName || 'Sin nombre'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}