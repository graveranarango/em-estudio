import { useState, useMemo, useEffect, memo } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Plus, 
  FolderOpen,
  Archive,
  Upload,
  MoreVertical,
  Grid3X3,
  Lightbulb
} from "lucide-react";
import { AssetCard } from "./AssetCard";
import { AssetFilters } from "./AssetFilters";
import { AssetDetailPanel } from "./AssetDetailPanel";
import { Asset, AssetFilters as Filters } from "../../types/assets";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { assetsService } from "../../utils/assets-service";

function AssetsLibrary() {
  const { brandKit } = useBrandKit();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<Filters>({});
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar assets al inicializar
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const assets = await assetsService.getAllAssets();
        setAllAssets(assets);
      } catch (error) {
        console.error('Error loading assets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  // Aplicar filtros
  const filteredAssets = useMemo(() => {
    let filtered = [...allAssets];

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.title.toLowerCase().includes(searchLower) ||
        asset.description?.toLowerCase().includes(searchLower) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por tipo
    if (filters.type?.length) {
      filtered = filtered.filter(asset => filters.type!.includes(asset.type));
    }

    // Filtro por estado
    if (filters.status?.length) {
      filtered = filtered.filter(asset => filters.status!.includes(asset.status));
    }

    // Filtro por plataforma
    if (filters.platform?.length) {
      filtered = filtered.filter(asset => filters.platform!.includes(asset.platform));
    }

    // Filtro por BrandKit compliance
    if (filters.brandCompliance) {
      if (filters.brandCompliance === 'compliant') {
        filtered = filtered.filter(asset => asset.brandCompliance.isCompliant);
      } else if (filters.brandCompliance === 'issues') {
        filtered = filtered.filter(asset => !asset.brandCompliance.isCompliant);
      }
    }

    return filtered;
  }, [allAssets, filters]);

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDetailPanelOpen(true);
  };

  const handleEdit = async (asset: Asset) => {
    console.log('Editar asset:', asset);
    // Aquí se abriría el módulo correspondiente con el asset cargado
  };

  const handleDuplicate = async (asset: Asset) => {
    try {
      const duplicated = await assetsService.duplicateAsset(asset.id);
      if (duplicated) {
        // Recargar assets
        const assets = await assetsService.getAllAssets();
        setAllAssets(assets);
      }
    } catch (error) {
      console.error('Error duplicating asset:', error);
    }
  };

  const handleDownload = (asset: Asset) => {
    console.log('Descargar asset:', asset);
    // Implementar lógica de descarga
  };

  const handleDelete = async (asset: Asset) => {
    try {
      const success = await assetsService.deleteAsset(asset.id);
      if (success) {
        // Recargar assets
        const assets = await assetsService.getAllAssets();
        setAllAssets(assets);
        // Cerrar panel si el asset eliminado estaba seleccionado
        if (selectedAsset?.id === asset.id) {
          setSelectedAsset(null);
          setIsDetailPanelOpen(false);
        }
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const handleShare = (asset: Asset) => {
    console.log('Compartir asset:', asset);
    // Implementar lógica de compartir
  };

  const getStatsCards = () => {
    const totalAssets = allAssets.length;
    const compliantAssets = allAssets.filter(a => a.brandCompliance.isCompliant).length;
    const draftAssets = allAssets.filter(a => a.status === 'draft').length;
    const publishedAssets = allAssets.filter(a => a.status === 'published').length;

    return [
      { title: "Total Assets", value: totalAssets, icon: Archive },
      { title: "BrandKit OK", value: compliantAssets, icon: Grid3X3 },
      { title: "Borradores", value: draftAssets, icon: FolderOpen },
      { title: "Publicados", value: publishedAssets, icon: Upload }
    ];
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando biblioteca...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-semibold mb-2">
                Biblioteca de Assets
              </h1>
              <p className="text-muted-foreground">
                Gestiona todos tus recursos creativos con integración completa del BrandKit
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Importar
              </Button>
              
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Asset
              </Button>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {getStatsCards().map((stat) => (
              <Card key={stat.title} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <AssetFilters
              filters={filters}
              onFiltersChange={setFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalAssets={allAssets.length}
              filteredAssets={filteredAssets.length}
            />
          </div>

          {/* Grid de assets */}
          {filteredAssets.length > 0 ? (
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
            }`}>
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onSelect={handleAssetSelect}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  isSelected={selectedAsset?.id === asset.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="p-6 bg-muted/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Archive className="w-12 h-12 text-muted-foreground" />
                </div>
                
                <h3 className="text-lg font-medium mb-2">No se encontraron assets</h3>
                
                <p className="text-muted-foreground mb-6">
                  {Object.keys(filters).length > 0 
                    ? "Intenta ajustar los filtros para ver más resultados."
                    : "Comienza creando tu primer asset o importa archivos existentes."
                  }
                </p>

                {Object.keys(filters).length === 0 && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Crear Asset
                    </Button>
                    
                    <Button variant="outline" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Importar Archivos
                    </Button>
                  </div>
                )}

                {/* Sugerencias */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-left">
                      <h4 className="font-medium text-blue-900 mb-1">💡 Tip</h4>
                      <p className="text-sm text-blue-700">
                        Los assets creados en otros módulos aparecerán aquí automáticamente. 
                        El sistema verifica el cumplimiento del BrandKit en tiempo real.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel de detalles */}
      <AssetDetailPanel
        asset={selectedAsset}
        isOpen={isDetailPanelOpen}
        onClose={() => {
          setIsDetailPanelOpen(false);
          setSelectedAsset(null);
        }}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onShare={handleShare}
      />
    </div>
  );
}

export default memo(AssetsLibrary);