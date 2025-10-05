import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { 
  Search, 
  Filter, 
  X, 
  CalendarIcon,
  CheckCircle,
  AlertTriangle,
  Grid3X3,
  List
} from "lucide-react";
import { AssetFilters as Filters, AssetType, AssetStatus, AssetPlatform } from "../../types/assets";

interface AssetFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalAssets: number;
  filteredAssets: number;
}

const assetTypes: { value: AssetType; label: string }[] = [
  { value: "post", label: "Posts" },
  { value: "carrousel", label: "Carrousels" },
  { value: "story", label: "Stories" },
  { value: "video", label: "Videos" },
  { value: "podcast", label: "Podcasts" },
  { value: "clip", label: "Clips" },
  { value: "logo", label: "Logos" },
  { value: "font", label: "Tipografías" },
];

const assetStatuses: { value: AssetStatus; label: string }[] = [
  { value: "draft", label: "Borrador" },
  { value: "final", label: "Finalizado" },
  { value: "published", label: "Publicado" },
];

const platforms: { value: AssetPlatform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter" },
  { value: "spotify", label: "Spotify" },
  { value: "generic", label: "Genérico" },
];

export function AssetFilters({ 
  filters, 
  onFiltersChange, 
  viewMode, 
  onViewModeChange,
  totalAssets,
  filteredAssets 
}: AssetFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined });
  };

  const handleTypeToggle = (type: AssetType) => {
    const currentTypes = filters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    onFiltersChange({ 
      ...filters, 
      type: newTypes.length > 0 ? newTypes : undefined 
    });
  };

  const handleStatusToggle = (status: AssetStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({ 
      ...filters, 
      status: newStatuses.length > 0 ? newStatuses : undefined 
    });
  };

  const handlePlatformToggle = (platform: AssetPlatform) => {
    const currentPlatforms = filters.platform || [];
    const newPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter(p => p !== platform)
      : [...currentPlatforms, platform];
    
    onFiltersChange({ 
      ...filters, 
      platform: newPlatforms.length > 0 ? newPlatforms : undefined 
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof Filters];
    if (key === 'search') return value && value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined;
  });

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type?.length) count++;
    if (filters.status?.length) count++;
    if (filters.platform?.length) count++;
    if (filters.brandCompliance && filters.brandCompliance !== 'all') count++;
    if (filters.dateRange) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Barra principal */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Búsqueda */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar assets..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={showAdvanced ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-2 text-muted-foreground"
              >
                <X className="w-4 h-4" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {/* Controles de vista y estadísticas */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {filteredAssets} de {totalAssets} assets
          </div>
          
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="bg-muted/30 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo de Asset */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Asset</label>
              <div className="flex flex-wrap gap-1">
                {assetTypes.map((type) => (
                  <Badge
                    key={type.value}
                    variant={filters.type?.includes(type.value) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => handleTypeToggle(type.value)}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <div className="flex flex-wrap gap-1">
                {assetStatuses.map((status) => (
                  <Badge
                    key={status.value}
                    variant={filters.status?.includes(status.value) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => handleStatusToggle(status.value)}
                  >
                    {status.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Plataforma */}
            <div>
              <label className="text-sm font-medium mb-2 block">Plataforma</label>
              <div className="flex flex-wrap gap-1">
                {platforms.slice(0, 4).map((platform) => (
                  <Badge
                    key={platform.value}
                    variant={filters.platform?.includes(platform.value) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => handlePlatformToggle(platform.value)}
                  >
                    {platform.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* BrandKit Compliance */}
            <div>
              <label className="text-sm font-medium mb-2 block">BrandKit</label>
              <Select
                value={filters.brandCompliance || 'all'}
                onValueChange={(value) => 
                  onFiltersChange({ 
                    ...filters, 
                    brandCompliance: value === 'all' ? undefined : value as any 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="compliant">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Cumple normas
                    </div>
                  </SelectItem>
                  <SelectItem value="issues">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      Necesita revisión
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Búsqueda: "{filters.search}"
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleSearchChange('')}
              />
            </Badge>
          )}
          
          {filters.type?.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {assetTypes.find(t => t.value === type)?.label}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleTypeToggle(type)}
              />
            </Badge>
          ))}
          
          {filters.status?.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              {assetStatuses.find(s => s.value === status)?.label}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleStatusToggle(status)}
              />
            </Badge>
          ))}

          {filters.brandCompliance && filters.brandCompliance !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.brandCompliance === 'compliant' ? 'Cumple BrandKit' : 'Necesita revisión'}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, brandCompliance: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}