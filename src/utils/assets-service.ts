import { Asset, AssetFilters, AssetProject, AssetCampaign } from "../types/assets";

// Mock service para gestión de assets
// En el futuro esto se conectará con Firebase/Supabase

export class AssetsService {
  private static instance: AssetsService;
  private assets: Asset[] = [];

  private constructor() {
    // Inicializar con datos mock
    this.initializeMockData();
  }

  public static getInstance(): AssetsService {
    if (!AssetsService.instance) {
      AssetsService.instance = new AssetsService();
    }
    return AssetsService.instance;
  }

  private initializeMockData() {
    this.assets = [
      {
        id: "1",
        type: "post",
        title: "Post de lanzamiento de producto",
        description: "Publicación principal para el lanzamiento del nuevo producto",
        brandkitId: "brandkit-1",
        projectId: "project-1",
        campaignId: "campaign-1",
        platform: "instagram",
        createdAt: "2024-03-20T10:00:00Z",
        updatedAt: "2024-03-20T15:30:00Z",
        status: "published",
        thumbnailUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTkyMTE3ODJ8MA&ixlib=rb-4.1.0&q=80&w=400&h=300",
        tags: ["lanzamiento", "producto", "social"],
        versions: [
          {
            version: 1,
            url: "/assets/post-v1.jpg",
            thumbnailUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTkyMTE3ODJ8MA&ixlib=rb-4.1.0&q=80&w=400&h=300",
            date: "2024-03-20T10:00:00Z",
            notes: "Versión inicial con colores primarios",
            fileSize: 1024000,
            dimensions: { width: 1080, height: 1080 }
          },
          {
            version: 2,
            url: "/assets/post-v2.jpg",
            thumbnailUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTkyMTE3ODJ8MA&ixlib=rb-4.1.0&q=80&w=400&h=300",
            date: "2024-03-20T15:30:00Z",
            notes: "Ajustes de tipografía según BrandKit",
            fileSize: 1156000,
            dimensions: { width: 1080, height: 1080 }
          }
        ],
        currentVersion: 2,
        brandCompliance: {
          isCompliant: true,
          issues: [],
          score: 95
        },
        metadata: {
          dimensions: { width: 1080, height: 1080 },
          fileSize: 1156000,
          format: "JPG"
        },
        author: {
          id: "user-1",
          name: "Ana García"
        }
      },
      {
        id: "2",
        type: "story",
        title: "Story promocional verano",
        description: "Historia para promoción de temporada de verano",
        brandkitId: "brandkit-1",
        projectId: "project-1",
        campaignId: "campaign-2",
        platform: "instagram",
        createdAt: "2024-03-19T14:20:00Z",
        updatedAt: "2024-03-19T16:45:00Z",
        status: "final",
        thumbnailUrl: "https://images.unsplash.com/photo-1682072155213-856c2ab9d629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTkyNjMyMzN8MA&ixlib=rb-4.1.0&q=80&w=300&h=500",
        tags: ["verano", "promoción", "temporada"],
        versions: [
          {
            version: 1,
            url: "/assets/story-v1.jpg",
            thumbnailUrl: "https://images.unsplash.com/photo-1682072155213-856c2ab9d629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTkyNjMyMzN8MA&ixlib=rb-4.1.0&q=80&w=300&h=500",
            date: "2024-03-19T14:20:00Z",
            notes: "Primera versión con diseño base",
            fileSize: 890000,
            dimensions: { width: 1080, height: 1920 }
          }
        ],
        currentVersion: 1,
        brandCompliance: {
          isCompliant: false,
          issues: ["Color de fondo no está en la paleta principal", "Tipografía secundaria no coincide"],
          score: 72
        },
        metadata: {
          dimensions: { width: 1080, height: 1920 },
          fileSize: 890000,
          format: "JPG"
        },
        author: {
          id: "user-2",
          name: "Carlos Mendez"
        }
      },
      {
        id: "3",
        type: "video",
        title: "Video tutorial producto",
        description: "Tutorial paso a paso del uso del producto",
        brandkitId: "brandkit-1",
        projectId: "project-2",
        platform: "youtube",
        createdAt: "2024-03-18T09:15:00Z",
        updatedAt: "2024-03-18T17:20:00Z",
        status: "draft",
        thumbnailUrl: "https://images.unsplash.com/photo-1673767297196-ce9739933932?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTkxNzk3NjB8MA&ixlib=rb-4.1.0&q=80&w=640&h=360",
        tags: ["tutorial", "educativo", "producto"],
        versions: [
          {
            version: 1,
            url: "/assets/video-v1.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1673767297196-ce9739933932?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTkxNzk3NjB8MA&ixlib=rb-4.1.0&q=80&w=640&h=360",
            date: "2024-03-18T09:15:00Z",
            notes: "Primer corte del video",
            fileSize: 45600000,
            dimensions: { width: 1920, height: 1080 }
          }
        ],
        currentVersion: 1,
        brandCompliance: {
          isCompliant: true,
          issues: [],
          score: 88
        },
        metadata: {
          duration: 180,
          dimensions: { width: 1920, height: 1080 },
          fileSize: 45600000,
          format: "MP4"
        },
        author: {
          id: "user-1",
          name: "Ana García"
        }
      },
      {
        id: "4",
        type: "podcast",
        title: "Episodio 12: Tendencias de diseño",
        description: "Análisis de las tendencias actuales en diseño digital",
        brandkitId: "brandkit-1",
        projectId: "project-3",
        platform: "spotify",
        createdAt: "2024-03-17T11:30:00Z",
        updatedAt: "2024-03-17T19:45:00Z",
        status: "published",
        thumbnailUrl: "https://images.unsplash.com/photo-1658824245703-fe074cba6d59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTkyNjMyNDB8MA&ixlib=rb-4.1.0&q=80&w=400&h=400",
        tags: ["podcast", "diseño", "tendencias"],
        versions: [
          {
            version: 1,
            url: "/assets/podcast-ep12.mp3",
            date: "2024-03-17T11:30:00Z",
            notes: "Grabación y edición final",
            fileSize: 67200000
          }
        ],
        currentVersion: 1,
        brandCompliance: {
          isCompliant: true,
          issues: [],
          score: 92
        },
        metadata: {
          duration: 2800,
          fileSize: 67200000,
          format: "MP3"
        },
        author: {
          id: "user-3",
          name: "María López"
        }
      },
      {
        id: "5",
        type: "carrousel",
        title: "Carrousel nuevas funcionalidades",
        description: "Serie de imágenes mostrando las nuevas features",
        brandkitId: "brandkit-1",
        projectId: "project-1",
        platform: "instagram",
        createdAt: "2024-03-21T08:00:00Z",
        updatedAt: "2024-03-21T12:30:00Z",
        status: "final",
        thumbnailUrl: "https://images.unsplash.com/photo-1634624184609-d4ae98a114d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTkyNjMyNDh8MA&ixlib=rb-4.1.0&q=80&w=400&h=300",
        tags: ["carrousel", "features", "instagram"],
        versions: [
          {
            version: 1,
            url: "/assets/carrousel-v1.zip",
            thumbnailUrl: "https://images.unsplash.com/photo-1634624184609-d4ae98a114d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTkyNjMyNDh8MA&ixlib=rb-4.1.0&q=80&w=400&h=300",
            date: "2024-03-21T08:00:00Z",
            notes: "5 slides con nuevas funcionalidades",
            fileSize: 2400000,
            dimensions: { width: 1080, height: 1080 }
          }
        ],
        currentVersion: 1,
        brandCompliance: {
          isCompliant: true,
          issues: [],
          score: 94
        },
        metadata: {
          dimensions: { width: 1080, height: 1080 },
          fileSize: 2400000,
          format: "ZIP"
        },
        author: {
          id: "user-1",
          name: "Ana García"
        }
      },
      {
        id: "6",
        type: "logo",
        title: "Logo principal marca 2024",
        description: "Logo actualizado con nueva identidad visual",
        brandkitId: "brandkit-1",
        projectId: "project-4",
        platform: "generic",
        createdAt: "2024-03-15T16:00:00Z",
        updatedAt: "2024-03-16T10:15:00Z",
        status: "final",
        thumbnailUrl: "https://images.unsplash.com/photo-1758813531001-3af022b8f449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTkyMjU4NDB8MA&ixlib=rb-4.1.0&q=80&w=400&h=300",
        tags: ["logo", "identidad", "branding"],
        versions: [
          {
            version: 1,
            url: "/assets/logo-v1.svg",
            thumbnailUrl: "https://images.unsplash.com/photo-1758813531001-3af022b8f449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTkyMjU4NDB8MA&ixlib=rb-4.1.0&q=80&w=400&h=300",
            date: "2024-03-15T16:00:00Z",
            notes: "Primera versión del logo",
            fileSize: 25600,
            dimensions: { width: 512, height: 512 }
          },
          {
            version: 2,
            url: "/assets/logo-v2.svg",
            thumbnailUrl: "https://images.unsplash.com/photo-1758813531001-3af022b8f449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTkyMjU4NDB8MA&ixlib=rb-4.1.0&q=80&w=400&h=300",
            date: "2024-03-16T10:15:00Z",
            notes: "Versión optimizada y vectorizada",
            fileSize: 18400,
            dimensions: { width: 512, height: 512 }
          }
        ],
        currentVersion: 2,
        brandCompliance: {
          isCompliant: true,
          issues: [],
          score: 100
        },
        metadata: {
          dimensions: { width: 512, height: 512 },
          fileSize: 18400,
          format: "SVG"
        },
        author: {
          id: "user-4",
          name: "David Ruiz"
        }
      }
    ];
  }

  // Obtener todos los assets
  async getAllAssets(): Promise<Asset[]> {
    return [...this.assets];
  }

  // Obtener assets con filtros
  async getFilteredAssets(filters: AssetFilters): Promise<Asset[]> {
    let filtered = [...this.assets];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.title.toLowerCase().includes(searchLower) ||
        asset.description?.toLowerCase().includes(searchLower) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.type?.length) {
      filtered = filtered.filter(asset => filters.type!.includes(asset.type));
    }

    if (filters.status?.length) {
      filtered = filtered.filter(asset => filters.status!.includes(asset.status));
    }

    if (filters.platform?.length) {
      filtered = filtered.filter(asset => filters.platform!.includes(asset.platform));
    }

    if (filters.brandCompliance) {
      if (filters.brandCompliance === 'compliant') {
        filtered = filtered.filter(asset => asset.brandCompliance.isCompliant);
      } else if (filters.brandCompliance === 'issues') {
        filtered = filtered.filter(asset => !asset.brandCompliance.isCompliant);
      }
    }

    if (filters.projectId) {
      filtered = filtered.filter(asset => asset.projectId === filters.projectId);
    }

    if (filters.campaignId) {
      filtered = filtered.filter(asset => asset.campaignId === filters.campaignId);
    }

    return filtered;
  }

  // Obtener asset por ID
  async getAssetById(id: string): Promise<Asset | null> {
    return this.assets.find(asset => asset.id === id) || null;
  }

  // Crear nuevo asset
  async createAsset(assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
    const newAsset: Asset = {
      ...assetData,
      id: `asset-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.assets.push(newAsset);
    return newAsset;
  }

  // Actualizar asset
  async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset | null> {
    const index = this.assets.findIndex(asset => asset.id === id);
    if (index === -1) return null;

    this.assets[index] = {
      ...this.assets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return this.assets[index];
  }

  // Eliminar asset
  async deleteAsset(id: string): Promise<boolean> {
    const index = this.assets.findIndex(asset => asset.id === id);
    if (index === -1) return false;

    this.assets.splice(index, 1);
    return true;
  }

  // Duplicar asset
  async duplicateAsset(id: string): Promise<Asset | null> {
    const original = await this.getAssetById(id);
    if (!original) return null;

    const duplicate: Asset = {
      ...original,
      id: `asset-${Date.now()}`,
      title: `${original.title} (Copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    };

    this.assets.push(duplicate);
    return duplicate;
  }

  // Agregar nueva versión a un asset
  async addAssetVersion(id: string, versionData: Omit<typeof Asset.prototype.versions[0], 'version'>): Promise<Asset | null> {
    const asset = await this.getAssetById(id);
    if (!asset) return null;

    const newVersion = {
      ...versionData,
      version: Math.max(...asset.versions.map(v => v.version)) + 1,
    };

    const updatedAsset = {
      ...asset,
      versions: [...asset.versions, newVersion],
      currentVersion: newVersion.version,
      updatedAt: new Date().toISOString(),
    };

    return this.updateAsset(id, updatedAsset);
  }

  // Restaurar versión anterior
  async restoreAssetVersion(id: string, version: number): Promise<Asset | null> {
    const asset = await this.getAssetById(id);
    if (!asset) return null;

    const versionExists = asset.versions.some(v => v.version === version);
    if (!versionExists) return null;

    return this.updateAsset(id, {
      currentVersion: version,
      updatedAt: new Date().toISOString(),
    });
  }

  // Obtener estadísticas
  async getAssetStats(): Promise<{
    total: number;
    compliant: number;
    drafts: number;
    published: number;
    byType: Record<string, number>;
    byPlatform: Record<string, number>;
  }> {
    const assets = await this.getAllAssets();
    
    const stats = {
      total: assets.length,
      compliant: assets.filter(a => a.brandCompliance.isCompliant).length,
      drafts: assets.filter(a => a.status === 'draft').length,
      published: assets.filter(a => a.status === 'published').length,
      byType: {} as Record<string, number>,
      byPlatform: {} as Record<string, number>,
    };

    assets.forEach(asset => {
      stats.byType[asset.type] = (stats.byType[asset.type] || 0) + 1;
      stats.byPlatform[asset.platform] = (stats.byPlatform[asset.platform] || 0) + 1;
    });

    return stats;
  }
}

// Instancia singleton
export const assetsService = AssetsService.getInstance();