import { useState, memo } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  MoreVertical, 
  Download, 
  Edit, 
  Copy, 
  Trash2,
  CheckCircle,
  AlertTriangle,
  Play,
  FileText,
  Image,
  Video,
  Music,
  Palette,
  Type as TypeIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Asset, AssetType } from "../../types/assets";
import { useBrandKit } from "../../contexts/BrandKitContext";

interface AssetCardProps {
  asset: Asset;
  onSelect: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDuplicate: (asset: Asset) => void;
  onDownload: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  isSelected?: boolean;
}

const assetTypeIcons: Record<AssetType, React.ElementType> = {
  post: Image,
  carrousel: Image,
  story: Image,
  video: Video,
  podcast: Music,
  clip: Play,
  logo: Palette,
  font: TypeIcon,
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

const AssetCard = memo(function AssetCard({ 
  asset, 
  onSelect, 
  onEdit, 
  onDuplicate, 
  onDownload, 
  onDelete,
  isSelected = false 
}: AssetCardProps) {
  const { brandKit } = useBrandKit();
  const [isHovered, setIsHovered] = useState(false);
  
  const IconComponent = assetTypeIcons[asset.type];
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(asset)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
        {asset.thumbnailUrl ? (
          <img 
            src={asset.thumbnailUrl} 
            alt={asset.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <IconComponent className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        
        {/* Overlay con acciones */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(asset);
              }}
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
          </div>
        )}

        {/* Badge de tipo */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-white/90 text-xs">
            <IconComponent className="w-3 h-3 mr-1" />
            {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
          </Badge>
        </div>

        {/* Indicador de BrandKit */}
        <div className="absolute top-2 right-2">
          {asset.brandCompliance.isCompliant ? (
            <div className="bg-green-500 rounded-full p-1">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          ) : (
            <div className="bg-yellow-500 rounded-full p-1">
              <AlertTriangle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Duración para videos/audio */}
        {asset.metadata.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {Math.floor(asset.metadata.duration / 60)}:{(asset.metadata.duration % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium truncate flex-1 mr-2">{asset.title}</h3>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(asset)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(asset)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload(asset)}>
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(asset)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Estado */}
        <div className="flex items-center gap-2 mb-2">
          <Badge 
            variant="outline" 
            className={`text-xs ${statusColors[asset.status]}`}
          >
            {statusLabels[asset.status]}
          </Badge>
          
          {asset.platform !== 'generic' && (
            <Badge variant="outline" className="text-xs capitalize">
              {asset.platform}
            </Badge>
          )}
        </div>

        {/* Metadatos */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Creado</span>
            <span>{formatDate(asset.createdAt)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Tamaño</span>
            <span>{formatFileSize(asset.metadata.fileSize)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Versión</span>
            <span>v{asset.currentVersion}</span>
          </div>

          {/* Compliance Score */}
          <div className="flex justify-between">
            <span>BrandKit</span>
            <span className={asset.brandCompliance.isCompliant ? 'text-green-600' : 'text-yellow-600'}>
              {asset.brandCompliance.score}%
            </span>
          </div>
        </div>

        {/* Tags */}
        {asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {asset.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                {tag}
              </Badge>
            ))}
            {asset.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                +{asset.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
});

export { AssetCard };