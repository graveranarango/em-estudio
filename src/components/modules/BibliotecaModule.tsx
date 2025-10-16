import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layers,
  Image as ImageIcon,
  Video,
  Square,
  Mic,
  File,
  Layout,
  Star,
  Archive,
  Search,
  Upload,
  FolderPlus,
  Grid3X3,
  List,
  Eye,
  ChevronRight,
  ChevronLeft,
  Filter,
  Download,
  Share2,
  MoreHorizontal,
  Calendar,
  Tag,
  User,
  FileText,
  Play,
  Pause,
  Volume2,
  Bot,
  Bookmark,
  X,
  CalendarDays,
  CheckCircle,
  AlertTriangle,
  Clock,
  Trash2,
  Copy,
  FolderOpen,
  RefreshCw,
  Languages,
  Hash,
  Sparkles,
  History,
  Shield,
  FileX,
  TrendingUp,
  Folder,
  FolderPlus,
  Target,
  ChevronDown,
  ChevronUp,
  Plus,
  Heart,
  Zap
} from 'lucide-react';

type ViewType = 'Grid' | 'Lista' | 'Detalle';
type AssetCategory = 'Todos los assets' | 'Imágenes' | 'Videos' | 'Historias' | 'Podcasts' | 'Documentos' | 'Plantillas' | 'Favoritos' | 'Archivados';

interface AssetItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'story' | 'podcast' | 'document' | 'template';
  category: AssetCategory;
  size: string;
  dateCreated: Date;
  lastModified: Date;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  status: 'Borrador' | 'En producción' | 'Programado' | 'Publicado' | 'Archivado';
  author: 'Equipo' | 'IA' | 'Usuario específico';
  brandGuardValidation: 'Pendiente' | 'Validado' | 'Con advertencias';
  metadata: {
    dimensions?: string;
    duration?: string;
    format: string;
    creator: string;
  };
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: {
    module?: string;
    status?: string;
    author?: string;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
    brandGuardValidation?: string;
  };
}

interface AssetVersion {
  id: string;
  version: string;
  date: Date;
  author: string;
  changes: string;
}

interface BrandGuardValidation {
  id: string;
  rule: string;
  status: 'success' | 'warning' | 'error';
  message: string;
}

interface AssetFolder {
  id: string;
  name: string;
  icon: string;
  count: number;
  color?: string;
}

interface SmartCollection {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
  criteria: string;
}

interface AssetTemplate {
  id: string;
  name: string;
  type: string;
  preview: string;
  dateCreated: Date;
  dateUpdated: Date;
  author: string;
  tags: string[];
  isPopular?: boolean;
}

// Mock data
const mockAssets: AssetItem[] = [
  {
    id: '1',
    name: 'Hero Image Producto',
    type: 'image',
    category: 'Imágenes',
    size: '2.4 MB',
    dateCreated: new Date('2024-01-15'),
    lastModified: new Date('2024-01-16'),
    tags: ['producto', 'hero', 'marketing', 'promo'],
    isFavorite: true,
    isArchived: false,
    status: 'Publicado',
    author: 'Usuario específico',
    brandGuardValidation: 'Validado',
    metadata: {
      dimensions: '1920x1080',
      format: 'JPG',
      creator: 'Agente 1'
    }
  },
  {
    id: '2',
    name: 'Video Tutorial Onboarding',
    type: 'video',
    category: 'Videos',
    size: '45.6 MB',
    dateCreated: new Date('2024-01-14'),
    lastModified: new Date('2024-01-15'),
    tags: ['tutorial', 'onboarding', 'educativo'],
    isFavorite: false,
    isArchived: false,
    status: 'En producción',
    author: 'Equipo',
    brandGuardValidation: 'Con advertencias',
    metadata: {
      dimensions: '1920x1080',
      duration: '2:34',
      format: 'MP4',
      creator: 'Equipo'
    }
  },
  {
    id: '3',
    name: 'Historia Behind the Scenes',
    type: 'story',
    category: 'Historias',
    size: '12.3 MB',
    dateCreated: new Date('2024-01-13'),
    lastModified: new Date('2024-01-14'),
    tags: ['behind-scenes', 'instagram', 'stories', 'evento'],
    isFavorite: true,
    isArchived: false,
    status: 'Programado',
    author: 'IA',
    brandGuardValidation: 'Validado',
    metadata: {
      dimensions: '1080x1920',
      duration: '0:15',
      format: 'MP4',
      creator: 'Agente 2'
    }
  },
  {
    id: '4',
    name: 'Episodio Podcast #01',
    type: 'podcast',
    category: 'Podcasts',
    size: '89.1 MB',
    dateCreated: new Date('2024-01-12'),
    lastModified: new Date('2024-01-13'),
    tags: ['podcast', 'episodio-01', 'audio'],
    isFavorite: false,
    isArchived: false,
    status: 'Publicado',
    author: 'Usuario específico',
    brandGuardValidation: 'Validado',
    metadata: {
      duration: '45:23',
      format: 'MP3',
      creator: 'Agente 1'
    }
  },
  {
    id: '5',
    name: 'Manual de Marca v2.1',
    type: 'document',
    category: 'Documentos',
    size: '8.7 MB',
    dateCreated: new Date('2024-01-10'),
    lastModified: new Date('2024-01-11'),
    tags: ['manual', 'marca', 'brandkit'],
    isFavorite: true,
    isArchived: false,
    status: 'Publicado',
    author: 'Equipo',
    brandGuardValidation: 'Validado',
    metadata: {
      format: 'PDF',
      creator: 'Equipo'
    }
  },
  {
    id: '6',
    name: 'Template Post Instagram',
    type: 'template',
    category: 'Plantillas',
    size: '1.2 MB',
    dateCreated: new Date('2024-01-09'),
    lastModified: new Date('2024-01-10'),
    tags: ['template', 'instagram', 'post', 'producto'],
    isFavorite: false,
    isArchived: false,
    status: 'Borrador',
    author: 'IA',
    brandGuardValidation: 'Pendiente',
    metadata: {
      dimensions: '1080x1080',
      format: 'PSD',
      creator: 'Agente 2'
    }
  },
  {
    id: '7',
    name: 'Post promocional evento',
    type: 'image',
    category: 'Imágenes',
    size: '3.1 MB',
    dateCreated: new Date('2024-09-15'),
    lastModified: new Date('2024-09-16'),
    tags: ['promo', 'evento', 'marketing'],
    isFavorite: false,
    isArchived: false,
    status: 'Publicado',
    author: 'Usuario específico',
    brandGuardValidation: 'Validado',
    metadata: {
      dimensions: '1080x1080',
      format: 'PNG',
      creator: 'Agente 1'
    }
  },
  {
    id: '8',
    name: 'Video con CTA validado',
    type: 'video',
    category: 'Videos',
    size: '67.2 MB',
    dateCreated: new Date('2024-09-20'),
    lastModified: new Date('2024-09-21'),
    tags: ['video', 'cta', 'marketing'],
    isFavorite: true,
    isArchived: false,
    status: 'Publicado',
    author: 'IA',
    brandGuardValidation: 'Validado',
    metadata: {
      dimensions: '1920x1080',
      duration: '1:45',
      format: 'MP4',
      creator: 'IA'
    }
  }
];

// Mock asset versions
const mockAssetVersions: AssetVersion[] = [
  {
    id: '1',
    version: 'v3',
    date: new Date('2024-10-09'),
    author: 'Usuario',
    changes: 'Validado y programado'
  },
  {
    id: '2',
    version: 'v2',
    date: new Date('2024-10-07'),
    author: 'Usuario',
    changes: 'Editado por Usuario'
  },
  {
    id: '3',
    version: 'v1',
    date: new Date('2024-10-05'),
    author: 'IA',
    changes: 'Creado por IA'
  }
];

// Mock BrandGuard validations
const mockBrandGuardValidations: BrandGuardValidation[] = [
  {
    id: '1',
    rule: 'Logo correcto en portada',
    status: 'success',
    message: 'El logo está presente y bien posicionado'
  },
  {
    id: '2',
    rule: 'CTA detectado en subtítulos',
    status: 'warning',
    message: 'CTA no detectado en subtítulos'
  },
  {
    id: '3',
    rule: 'Colores cumplen paleta BrandKit',
    status: 'success',
    message: 'Los colores utilizados están dentro de la paleta aprobada'
  },
  {
    id: '4',
    rule: 'Longitud de texto para Instagram',
    status: 'warning',
    message: 'Texto excede 150 caracteres recomendados para Instagram'
  },
  {
    id: '5',
    rule: 'Tipografía BrandKit',
    status: 'success',
    message: 'Se está utilizando la tipografía corporativa correcta'
  }
];

// Mock folders
const mockFolders: AssetFolder[] = [
  {
    id: '1',
    name: 'Campañas Octubre',
    icon: 'folder',
    count: 24,
    color: 'bg-blue-500'
  },
  {
    id: '2', 
    name: 'Historias Cuba',
    icon: 'folder',
    count: 12,
    color: 'bg-green-500'
  },
  {
    id: '3',
    name: 'Posts Educativos', 
    icon: 'folder',
    count: 18,
    color: 'bg-purple-500'
  }
];

// Mock smart collections
const mockSmartCollections: SmartCollection[] = [
  {
    id: '1',
    name: 'Publicaciones con alta interacción',
    description: 'Assets con >100 likes',
    icon: 'target',
    count: 8,
    criteria: 'engagement > 100'
  },
  {
    id: '2',
    name: 'Contenido programado para esta semana',
    description: 'Assets programados próximos 7 días',
    icon: 'calendar',
    count: 15,
    criteria: 'scheduled_date <= +7days'
  },
  {
    id: '3',
    name: 'Assets con validación pendiente',
    description: 'Requieren revisión BrandGuard',
    icon: 'shield',
    count: 6,
    criteria: 'brand_guard_status = pending'
  }
];

// Mock templates
const mockTemplates: AssetTemplate[] = [
  {
    id: '1',
    name: 'Plantilla — Post Promocional',
    type: 'post',
    preview: 'gradient-blue',
    dateCreated: new Date('2024-10-05'),
    dateUpdated: new Date('2024-10-10'),
    author: 'IA',
    tags: ['promocional', 'ventas', 'cta'],
    isPopular: true
  },
  {
    id: '2',
    name: 'Plantilla — Historia Educativa',
    type: 'story',
    preview: 'gradient-green',
    dateCreated: new Date('2024-10-03'),
    dateUpdated: new Date('2024-10-05'),
    author: 'Equipo',
    tags: ['educativo', 'tips', 'informativo']
  },
  {
    id: '3',
    name: 'Plantilla — Video Tutorial',
    type: 'video',
    preview: 'gradient-purple',
    dateCreated: new Date('2024-09-28'),
    dateUpdated: new Date('2024-10-02'),
    author: 'IA',
    tags: ['tutorial', 'howto', 'educativo'],
    isPopular: true
  },
  {
    id: '4',
    name: 'Plantilla — Podcast Intro',
    type: 'podcast',
    preview: 'gradient-orange',
    dateCreated: new Date('2024-09-25'),
    dateUpdated: new Date('2024-09-30'),
    author: 'Equipo',
    tags: ['intro', 'presentacion', 'audio']
  }
];

// Mock saved searches
const mockSavedSearches: SavedSearch[] = [
  {
    id: '1',
    name: 'Posts publicados en Instagram en septiembre',
    query: 'instagram septiembre',
    filters: {
      module: 'Posts',
      status: 'Publicado',
      dateRange: {
        start: new Date('2024-09-01'),
        end: new Date('2024-09-30')
      }
    }
  },
  {
    id: '2',
    name: 'Videos validados por BrandGuard con CTA',
    query: 'videos CTA',
    filters: {
      module: 'Videos',
      brandGuardValidation: 'Validado',
      tags: ['cta']
    }
  },
  {
    id: '3',
    name: 'Historias de productos programadas para este mes',
    query: 'historias productos',
    filters: {
      module: 'Historias',
      status: 'Programado',
      tags: ['producto']
    }
  }
];

// Navigation items
const navigationItems = [
  { key: 'Todos los assets', label: 'Todos los assets', icon: Layers, selected: true },
  { key: 'Imágenes', label: 'Imágenes', icon: ImageIcon, selected: false },
  { key: 'Videos', label: 'Videos', icon: Video, selected: false },
  { key: 'Historias', label: 'Historias', icon: Square, selected: false },
  { key: 'Podcasts', label: 'Podcasts', icon: Mic, selected: false },
  { key: 'Documentos', label: 'Documentos', icon: File, selected: false },
  { key: 'Plantillas', label: 'Plantillas', icon: Layout, selected: false },
  { key: 'Favoritos', label: 'Favoritos', icon: Star, selected: false },
  { key: 'Archivados', label: 'Archivados', icon: Archive, selected: false }
];

// Segmented Control Component
function SegmentedControl({ value, onChange, options }: {
  value: ViewType;
  onChange: (value: ViewType) => void;
  options: ViewType[];
}) {
  return (
    <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            value === option
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

// Sidebar Component
function LibrarySidebar({ activeCategory, onCategoryChange }: {
  activeCategory: AssetCategory;
  onCategoryChange: (category: AssetCategory) => void;
}) {
  return (
    <div className="w-60 bg-gray-50 border-r border-gray-200 h-full flex flex-col">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Biblioteca</h2>
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.key;
            
            return (
              <button
                key={item.key}
                onClick={() => onCategoryChange(item.key as AssetCategory)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}

// Advanced Search Bar Component
function AdvancedSearchBar({ 
  value, 
  onChange, 
  onSemanticSearch 
}: {
  value: string;
  onChange: (value: string) => void;
  onSemanticSearch: (query: string) => void;
}) {
  const [isSemanticMode, setIsSemanticMode] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSemanticSearch = () => {
    if (value.trim()) {
      setIsSemanticMode(true);
      onSemanticSearch(value);
      setTimeout(() => setIsSemanticMode(false), 2000);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
        <Input
          type="text"
          placeholder="Buscar por palabra clave o instrucción en lenguaje natural…"
          value={value}
          onChange={handleSearch}
          className="pl-10 pr-20 bg-white border-gray-300 rounded-lg shadow-sm"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSemanticSearch}
          disabled={!value.trim() || isSemanticMode}
          className="absolute right-2 h-7 px-2 text-xs"
        >
          {isSemanticMode ? (
            <>
              <Bot className="w-3 h-3 mr-1 animate-pulse" />
              IA...
            </>
          ) : (
            <>
              <Bot className="w-3 h-3 mr-1" />
              IA
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Filters Panel Component
function FiltersPanel({
  filters,
  onFiltersChange,
  onClearFilters
}: {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = filters.selectedTags?.filter((tag: string) => tag !== tagToRemove) || [];
    updateFilter('selectedTags', updatedTags);
  };

  const addTag = (tag: string) => {
    const currentTags = filters.selectedTags || [];
    if (!currentTags.includes(tag)) {
      updateFilter('selectedTags', [...currentTags, tag]);
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value && (Array.isArray(value) ? value.length > 0 : value !== 'Todos')
  );

  return (
    <Card className="p-4 bg-white shadow-sm">
      <div className="space-y-4">
        {/* Filter Controls Row */}
        <div className="flex items-center gap-4 flex-wrap">
          <Select value={filters.module || 'Todos'} onValueChange={(value) => updateFilter('module', value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Posts">Posts</SelectItem>
              <SelectItem value="Videos">Videos</SelectItem>
              <SelectItem value="Historias">Historias</SelectItem>
              <SelectItem value="Podcast">Podcast</SelectItem>
              <SelectItem value="Documentos">Documentos</SelectItem>
              <SelectItem value="Plantillas">Plantillas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status || 'Todos'} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Borrador">Borrador</SelectItem>
              <SelectItem value="En producción">En producción</SelectItem>
              <SelectItem value="Programado">Programado</SelectItem>
              <SelectItem value="Publicado">Publicado</SelectItem>
              <SelectItem value="Archivado">Archivado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.author || 'Todos'} onValueChange={(value) => updateFilter('author', value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Autor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Equipo">Equipo</SelectItem>
              <SelectItem value="IA">IA</SelectItem>
              <SelectItem value="Usuario específico">Usuario específico</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.brandGuardValidation || 'Todos'} onValueChange={(value) => updateFilter('brandGuardValidation', value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Validación BrandGuard" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="Validado">Validado</SelectItem>
              <SelectItem value="Con advertencias">Con advertencias</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <CalendarDays className="w-4 h-4 mr-2" />
            Rango de fechas
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="w-4 h-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Tags Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Tags populares:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['promo', 'educativo', 'evento', 'producto'].map((tag) => (
              <Button
                key={tag}
                variant={filters.selectedTags?.includes(tag) ? 'default' : 'secondary'}
                size="sm"
                onClick={() => {
                  if (filters.selectedTags?.includes(tag)) {
                    removeTag(tag);
                  } else {
                    addTag(tag);
                  }
                }}
                className="h-8 px-3 rounded-full text-xs"
              >
                #{tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Selected Tags */}
        {filters.selectedTags && filters.selectedTags.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">Tags seleccionados:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {filters.selectedTags.map((tag: string) => (
                <Badge key={tag} variant="default" className="pl-2 pr-1 py-1">
                  #{tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(tag)}
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Saved Searches Component
function SavedSearches({
  searches,
  onLoadSearch,
  onDeleteSearch
}: {
  searches: SavedSearch[];
  onLoadSearch: (search: SavedSearch) => void;
  onDeleteSearch: (searchId: string) => void;
}) {
  return (
    <Card className="p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Búsquedas guardadas</h3>
        <Bookmark className="w-4 h-4 text-gray-400" />
      </div>
      
      <div className="space-y-2">
        {searches.map((search) => (
          <div key={search.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group">
            <button
              onClick={() => onLoadSearch(search)}
              className="flex-1 text-left text-sm text-gray-700 hover:text-gray-900"
            >
              {search.name}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteSearch(search.id)}
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
        
        {searches.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No hay búsquedas guardadas
          </p>
        )}
      </div>
    </Card>
  );
}

// Topbar Component (Updated)
function LibraryTopbar() {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Subir
        </Button>
        <Button variant="secondary" size="sm">
          <FolderPlus className="w-4 h-4 mr-2" />
          Nueva carpeta
        </Button>
      </div>
    </div>
  );
}

// Grid View Component
function GridView({ assets, onAssetSelect }: { assets: AssetItem[]; onAssetSelect?: (asset: AssetItem) => void }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      case 'story': return <Square className="w-6 h-6" />;
      case 'podcast': return <Mic className="w-6 h-6" />;
      case 'document': return <FileText className="w-6 h-6" />;
      case 'template': return <Layout className="w-6 h-6" />;
      default: return <File className="w-6 h-6" />;
    }
  };

  const getPreviewBackground = (type: string) => {
    switch (type) {
      case 'image': return 'bg-gradient-to-br from-blue-200 to-blue-400';
      case 'video': return 'bg-gradient-to-br from-purple-200 to-purple-400';
      case 'story': return 'bg-gradient-to-br from-pink-200 to-pink-400';
      case 'podcast': return 'bg-gradient-to-br from-green-200 to-green-400';
      case 'document': return 'bg-gradient-to-br from-orange-200 to-orange-400';
      case 'template': return 'bg-gradient-to-br from-indigo-200 to-indigo-400';
      default: return 'bg-gradient-to-br from-gray-200 to-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
      {assets.map((asset) => (
        <Card 
          key={asset.id} 
          className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          onClick={() => onAssetSelect?.(asset)}
        >
          <div className="aspect-[4/3] rounded-t-lg flex items-center justify-center relative overflow-hidden">
            {/* Enhanced Preview Background */}
            <div className={`w-full h-full ${getPreviewBackground(asset.type)} flex items-center justify-center text-white`}>
              {getTypeIcon(asset.type)}
            </div>
            
            {/* Type indicator overlay */}
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs bg-white/90 text-gray-700">
                {asset.metadata.format}
              </Badge>
            </div>

            {/* Duration indicator for media */}
            {asset.metadata.duration && (
              <div className="absolute bottom-2 right-2">
                <Badge variant="default" className="text-xs bg-black/70 text-white">
                  {asset.metadata.duration}
                </Badge>
              </div>
            )}

            {/* Play button for media */}
            {(asset.type === 'video' || asset.type === 'story' || asset.type === 'podcast') && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-black/70 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </div>
            )}

            {/* Quick actions overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                  <Eye className="w-4 h-4 text-gray-700" />
                </Button>
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                  <Download className="w-4 h-4 text-gray-700" />
                </Button>
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                  <Share2 className="w-4 h-4 text-gray-700" />
                </Button>
              </div>
            </div>

            {/* Favorite indicator */}
            {asset.isFavorite && (
              <div className="absolute top-2 right-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current drop-shadow-sm" />
              </div>
            )}
          </div>

          <div className="p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-sm truncate">{asset.name}</h4>
              <p className="text-xs text-gray-500 mt-1">
                📅 {asset.lastModified.toLocaleDateString('es-ES')} · 🧑 {asset.author} · {asset.status}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {asset.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-2 py-1">
                    #{tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-1">
                {asset.brandGuardValidation === 'Validado' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {asset.brandGuardValidation === 'Con advertencias' && (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
                {asset.brandGuardValidation === 'Pendiente' && (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// List View Component
function ListView({ assets, onAssetSelect }: { assets: AssetItem[]; onAssetSelect?: (asset: AssetItem) => void }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'story': return <Square className="w-4 h-4" />;
      case 'podcast': return <Mic className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'template': return <Layout className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const getPreviewBackground = (type: string) => {
    switch (type) {
      case 'image': return 'bg-gradient-to-br from-blue-200 to-blue-400';
      case 'video': return 'bg-gradient-to-br from-purple-200 to-purple-400';
      case 'story': return 'bg-gradient-to-br from-pink-200 to-pink-400';
      case 'podcast': return 'bg-gradient-to-br from-green-200 to-green-400';
      case 'document': return 'bg-gradient-to-br from-orange-200 to-orange-400';
      case 'template': return 'bg-gradient-to-br from-indigo-200 to-indigo-400';
      default: return 'bg-gradient-to-br from-gray-200 to-gray-400';
    }
  };

  const getModuleName = (type: string) => {
    switch (type) {
      case 'image': return 'Posts';
      case 'video': return 'Videos';
      case 'story': return 'Historias';
      case 'podcast': return 'Podcast';
      case 'document': return 'Documentos';
      case 'template': return 'Plantillas';
      default: return 'Archivo';
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-gray-700">
          <div className="col-span-1">Preview</div>
          <div className="col-span-3">Título</div>
          <div className="col-span-1">Módulo</div>
          <div className="col-span-1">Estado</div>
          <div className="col-span-1">Autor</div>
          <div className="col-span-2">Fecha</div>
          <div className="col-span-2">Tags</div>
          <div className="col-span-1">Acciones</div>
        </div>

        {/* Rows */}
        {assets.map((asset, index) => (
          <div
            key={asset.id}
            className={`grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
              index !== assets.length - 1 ? 'border-b' : ''
            }`}
            onClick={() => onAssetSelect?.(asset)}
          >
            {/* Preview */}
            <div className="col-span-1 flex items-center">
              <div className={`w-12 h-12 rounded-lg ${getPreviewBackground(asset.type)} flex items-center justify-center text-white relative`}>
                {getTypeIcon(asset.type)}
                {asset.metadata.duration && (
                  <div className="absolute -bottom-1 -right-1">
                    <Badge variant="default" className="text-xs bg-black/70 text-white px-1 py-0 min-h-0 h-4">
                      {asset.metadata.duration}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            {/* Title */}
            <div className="col-span-3 flex items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{asset.name}</span>
                  {asset.isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {asset.metadata.format} · {asset.size}
                  {asset.metadata.dimensions && ` · ${asset.metadata.dimensions}`}
                </div>
              </div>
            </div>
            
            {/* Module */}
            <div className="col-span-1 flex items-center">
              <Badge variant="outline" className="text-xs">
                {getModuleName(asset.type)}
              </Badge>
            </div>
            
            {/* Status */}
            <div className="col-span-1 flex items-center">
              <Badge 
                variant={asset.status === 'Publicado' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {asset.status}
              </Badge>
            </div>
            
            {/* Author */}
            <div className="col-span-1 flex items-center">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600 truncate">{asset.author}</span>
              </div>
            </div>
            
            {/* Date */}
            <div className="col-span-2 flex items-center">
              <div className="text-sm text-gray-600">
                <div>{asset.lastModified.toLocaleDateString('es-ES')}</div>
                <div className="text-xs text-gray-400">
                  {asset.lastModified.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            
            {/* Tags */}
            <div className="col-span-2 flex items-center">
              <div className="flex gap-1 flex-wrap">
                {asset.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-2 py-0 h-5">
                    #{tag}
                  </Badge>
                ))}
                {asset.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                    +{asset.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="col-span-1 flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Duplicar">
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Más opciones">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Detail View Component  
function DetailView({ assets, onAssetSelect }: { assets: AssetItem[]; onAssetSelect?: (asset: AssetItem) => void }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-8 h-8" />;
      case 'video': return <Video className="w-8 h-8" />;
      case 'story': return <Square className="w-8 h-8" />;
      case 'podcast': return <Mic className="w-8 h-8" />;
      case 'document': return <FileText className="w-8 h-8" />;
      case 'template': return <Layout className="w-8 h-8" />;
      default: return <File className="w-8 h-8" />;
    }
  };

  const getPreviewBackground = (type: string) => {
    switch (type) {
      case 'image': return 'bg-gradient-to-br from-blue-300 to-blue-500';
      case 'video': return 'bg-gradient-to-br from-purple-300 to-purple-500';
      case 'story': return 'bg-gradient-to-br from-pink-300 to-pink-500';
      case 'podcast': return 'bg-gradient-to-br from-green-300 to-green-500';
      case 'document': return 'bg-gradient-to-br from-orange-300 to-orange-500';
      case 'template': return 'bg-gradient-to-br from-indigo-300 to-indigo-500';
      default: return 'bg-gradient-to-br from-gray-300 to-gray-500';
    }
  };

  const getModuleName = (type: string) => {
    switch (type) {
      case 'image': return 'Posts';
      case 'video': return 'Videos';
      case 'story': return 'Historias';
      case 'podcast': return 'Podcast';
      case 'document': return 'Documentos';
      case 'template': return 'Plantillas';
      default: return 'Archivo';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {assets.map((asset) => (
        <Card 
          key={asset.id} 
          className="group cursor-pointer hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
          onClick={() => onAssetSelect?.(asset)}
        >
          <div className="aspect-video rounded-t-lg flex items-center justify-center relative overflow-hidden">
            {/* Enhanced preview background */}
            <div className={`w-full h-full ${getPreviewBackground(asset.type)} flex items-center justify-center text-white relative`}>
              {getTypeIcon(asset.type)}
            </div>
            
            {/* Format and size overlay */}
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-700">
                {asset.metadata.format}
              </Badge>
            </div>

            {/* Duration overlay for media */}
            {asset.metadata.duration && (
              <div className="absolute top-3 right-3">
                <Badge variant="default" className="bg-black/70 text-white">
                  {asset.metadata.duration}
                </Badge>
              </div>
            )}

            {/* Favorite indicator */}
            {asset.isFavorite && (
              <div className="absolute bottom-3 right-3">
                <Star className="w-5 h-5 text-yellow-400 fill-current drop-shadow-sm" />
              </div>
            )}

            {/* Play button for media */}
            {(asset.type === 'video' || asset.type === 'story' || asset.type === 'podcast') && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-black/70 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg leading-tight">{asset.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {getModuleName(asset.type)}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                📅 Creado el {asset.dateCreated.toLocaleDateString('es-ES')} por {asset.metadata.creator} · Estado: {asset.status}
              </p>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{asset.size}</span>
              </div>
              
              {asset.metadata.dimensions && (
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{asset.metadata.dimensions}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{asset.author}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {asset.brandGuardValidation === 'Validado' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">BrandGuard ✓</span>
                  </>
                )}
                {asset.brandGuardValidation === 'Con advertencias' && (
                  <>
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-yellow-600">Con advertencias</span>
                  </>
                )}
                {asset.brandGuardValidation === 'Pendiente' && (
                  <>
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Pendiente</span>
                  </>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {asset.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-2 py-1">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Quick actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 px-3">
                  <Eye className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-3">
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicar
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-3">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Mover
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-3">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
              </div>
              
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Organizational Sidebar Component
function OrganizationalSidebar({ 
  activeSection, 
  onSectionSelect, 
  expandedFolders, 
  setExpandedFolders, 
  expandedTemplates, 
  setExpandedTemplates 
}: {
  activeSection: string;
  onSectionSelect: (section: string) => void;
  expandedFolders: boolean;
  setExpandedFolders: (expanded: boolean) => void;
  expandedTemplates: boolean;
  setExpandedTemplates: (expanded: boolean) => void;
}) {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg">Biblioteca</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-1">
          {/* Todos los assets */}
          <button
            onClick={() => onSectionSelect('todos')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'todos' ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-sm">Todos los assets</span>
          </button>

          {/* Favoritos */}
          <button
            onClick={() => onSectionSelect('favoritos')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'favoritos' ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
            }`}
          >
            <Star className="w-4 h-4" />
            <span className="text-sm">Favoritos ⭐</span>
          </button>

          {/* Colecciones inteligentes */}
          <div className="mt-4">
            <button
              onClick={() => onSectionSelect('colecciones')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === 'colecciones' ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">Colecciones inteligentes</span>
            </button>

            {/* Smart collections list */}
            {activeSection === 'colecciones' && (
              <div className="ml-6 mt-2 space-y-1">
                {mockSmartCollections.map((collection) => (
                  <button
                    key={collection.id}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-700">{collection.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {collection.count}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Carpetas */}
          <div className="mt-4">
            <button
              onClick={() => setExpandedFolders(!expandedFolders)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 transition-colors"
            >
              <Folder className="w-4 h-4" />
              <span className="text-sm">Carpetas</span>
              {expandedFolders ? (
                <ChevronUp className="w-3 h-3 ml-auto" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-auto" />
              )}
            </button>

            {expandedFolders && (
              <div className="ml-6 mt-2 space-y-1">
                <div className="text-xs text-gray-500 px-3 py-1">Mis carpetas</div>
                {mockFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => onSectionSelect(`folder-${folder.id}`)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-100 transition-colors ${
                      activeSection === `folder-${folder.id}` ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-700">{folder.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {folder.count}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Plantillas */}
          <div className="mt-4">
            <button
              onClick={() => setExpandedTemplates(!expandedTemplates)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 transition-colors"
            >
              <Layout className="w-4 h-4" />
              <span className="text-sm">Plantillas</span>
              {expandedTemplates ? (
                <ChevronUp className="w-3 h-3 ml-auto" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-auto" />
              )}
            </button>

            {expandedTemplates && (
              <div className="ml-6 mt-2 space-y-1">
                <div className="text-xs text-gray-500 px-3 py-1">Tipos de plantillas</div>
                <button
                  onClick={() => onSectionSelect('templates-posts')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-gray-100 transition-colors ${
                    activeSection === 'templates-posts' ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <ImageIcon className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-700">Posts</span>
                </button>
                <button
                  onClick={() => onSectionSelect('templates-stories')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-gray-100 transition-colors ${
                    activeSection === 'templates-stories' ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <Square className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-700">Historias</span>
                </button>
                <button
                  onClick={() => onSectionSelect('templates-videos')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-gray-100 transition-colors ${
                    activeSection === 'templates-videos' ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <Video className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-700">Videos</span>
                </button>
                <button
                  onClick={() => onSectionSelect('templates-podcast')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-gray-100 transition-colors ${
                    activeSection === 'templates-podcast' ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <Mic className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-700">Podcast</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
}

// Content Management Section Component
function ContentManagementSection() {
  return (
    <div className="mb-6">
      <Card className="p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium">Gestión de contenido</h3>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <Button variant="secondary" size="sm" className="gap-2">
            <FolderPlus className="w-4 h-4" />
            Nueva carpeta
          </Button>
          <Button variant="secondary" size="sm" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Nueva colección inteligente
          </Button>
          <Button variant="secondary" size="sm" className="gap-2">
            <FileText className="w-4 h-4" />
            Crear plantilla
          </Button>
        </div>

        <div>
          <h4 className="font-medium text-sm mb-3">Colecciones inteligentes</h4>
          <div className="space-y-2">
            {mockSmartCollections.map((collection) => (
              <div key={collection.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <Target className="w-4 h-4 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{collection.name}</p>
                  <p className="text-xs text-gray-600">({collection.description})</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {collection.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Templates Section Component
function TemplatesSection() {
  const getTemplatePreview = (preview: string) => {
    switch (preview) {
      case 'gradient-blue': return 'bg-gradient-to-br from-blue-300 to-blue-500';
      case 'gradient-green': return 'bg-gradient-to-br from-green-300 to-green-500';
      case 'gradient-purple': return 'bg-gradient-to-br from-purple-300 to-purple-500';
      case 'gradient-orange': return 'bg-gradient-to-br from-orange-300 to-orange-500';
      default: return 'bg-gradient-to-br from-gray-300 to-gray-500';
    }
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'post': return <ImageIcon className="w-6 h-6" />;
      case 'story': return <Square className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      case 'podcast': return <Mic className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  return (
    <div className="mb-6">
      <Card className="p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Layout className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium">Plantillas reutilizables</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTemplates.map((template) => (
            <Card key={template.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
              <div className={`aspect-video rounded-lg ${getTemplatePreview(template.preview)} flex items-center justify-center text-white mb-3 relative`}>
                {getTemplateIcon(template.type)}
                {template.isPopular && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="bg-yellow-500 text-white text-xs">
                      Popular
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{template.name}</h4>
                <p className="text-xs text-gray-600">
                  📅 Actualizada {template.dateUpdated.toLocaleDateString('es-ES')} · 🧑 Autor: {template.author}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      Usar
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      Duplicar
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Enhanced Right Panel Component with Tabs
function RightPanel({ isCollapsed, onToggle, selectedAsset }: {
  isCollapsed: boolean;
  onToggle: () => void;
  selectedAsset?: AssetItem | null;
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-8 h-8" />;
      case 'video': return <Video className="w-8 h-8" />;
      case 'story': return <Square className="w-8 h-8" />;
      case 'podcast': return <Mic className="w-8 h-8" />;
      case 'document': return <FileText className="w-8 h-8" />;
      case 'template': return <Layout className="w-8 h-8" />;
      default: return <File className="w-8 h-8" />;
    }
  };

  const getPreviewBackground = (type: string) => {
    switch (type) {
      case 'image': return 'bg-gradient-to-br from-blue-300 to-blue-500';
      case 'video': return 'bg-gradient-to-br from-purple-300 to-purple-500';
      case 'story': return 'bg-gradient-to-br from-pink-300 to-pink-500';
      case 'podcast': return 'bg-gradient-to-br from-green-300 to-green-500';
      case 'document': return 'bg-gradient-to-br from-orange-300 to-orange-500';
      case 'template': return 'bg-gradient-to-br from-indigo-300 to-indigo-500';
      default: return 'bg-gradient-to-br from-gray-300 to-gray-500';
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-0 overflow-hidden transition-all duration-300">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md border"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col transition-all duration-300">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold">Detalles del asset</h3>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {selectedAsset ? (
        <Tabs defaultValue="informacion" className="flex-1 flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-4 bg-gray-50">
              <TabsTrigger value="informacion" className="text-xs">Info</TabsTrigger>
              <TabsTrigger value="historial" className="text-xs">Historial</TabsTrigger>
              <TabsTrigger value="validaciones" className="text-xs">Validación</TabsTrigger>
              <TabsTrigger value="ia" className="text-xs">IA</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            {/* Información Tab */}
            <TabsContent value="informacion" className="p-4 space-y-4 mt-0">
              <Card className="p-4 shadow-sm">
                {/* Preview */}
                <div className={`aspect-video rounded-lg ${getPreviewBackground(selectedAsset.type)} flex items-center justify-center text-white relative mb-4`}>
                  {getTypeIcon(selectedAsset.type)}
                  {selectedAsset.metadata.duration && (
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="default" className="bg-black/70 text-white text-xs">
                        {selectedAsset.metadata.duration}
                      </Badge>
                    </div>
                  )}
                  {selectedAsset.isFavorite && (
                    <div className="absolute top-2 right-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                  )}
                </div>

                {/* Title and basic info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">{selectedAsset.name}</h4>
                  <p className="text-sm text-gray-600">
                    📅 Creado: {selectedAsset.dateCreated.toLocaleDateString('es-ES')} · 🧑 Autor: {selectedAsset.metadata.creator}
                  </p>
                  <p className="text-sm text-gray-600">
                    Módulo: {selectedAsset.type === 'image' ? 'Posts' : selectedAsset.type === 'video' ? 'Videos' : selectedAsset.type === 'story' ? 'Historias' : selectedAsset.type === 'podcast' ? 'Podcast' : selectedAsset.type === 'document' ? 'Documentos' : 'Plantillas'} · Estado: {selectedAsset.status}
                  </p>

                  {/* Tags */}
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-2">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedAsset.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-2 py-1">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Historial Tab */}
            <TabsContent value="historial" className="p-4 space-y-4 mt-0">
              <Card className="p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-gray-600" />
                  <h5 className="font-medium">Historial de versiones</h5>
                </div>
                
                <div className="space-y-3">
                  {mockAssetVersions.map((version, index) => (
                    <div key={version.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium">{version.version}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{version.version}</span>
                          <span className="text-xs text-gray-500">
                            {version.date.toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{version.changes}</p>
                        <p className="text-xs text-gray-500 mt-1">por {version.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Validaciones Tab */}
            <TabsContent value="validaciones" className="p-4 space-y-4 mt-0">
              <Card className="p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <h5 className="font-medium">Validaciones BrandGuard</h5>
                </div>
                
                <div className="space-y-3 mb-4">
                  {mockBrandGuardValidations.map((validation) => (
                    <div key={validation.id} className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {validation.status === 'success' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {validation.status === 'warning' && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                        {validation.status === 'error' && (
                          <FileX className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{validation.rule}</p>
                        <p className="text-xs text-gray-600 mt-1">{validation.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="secondary" size="sm" className="w-full">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Ver reporte completo
                </Button>
              </Card>
            </TabsContent>

            {/* Acciones IA Tab */}
            <TabsContent value="ia" className="p-4 space-y-4 mt-0">
              <Card className="p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-gray-600" />
                  <h5 className="font-medium">Acciones con IA</h5>
                </div>
                
                <div className="space-y-3">
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerar copy
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    <Languages className="w-4 h-4 mr-2" />
                    Traducir caption
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    <Hash className="w-4 h-4 mr-2" />
                    Extraer hashtags
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generar variaciones visuales
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Selecciona un asset para ver sus detalles</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function BibliotecaModule() {
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('Todos los assets');
  const [activeView, setActiveView] = useState<ViewType>('Grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(mockSavedSearches);
  const [activeSection, setActiveSection] = useState('todos');
  const [expandedFolders, setExpandedFolders] = useState(true);
  const [expandedTemplates, setExpandedTemplates] = useState(true);
  const [filters, setFilters] = useState({
    module: 'Todos',
    status: 'Todos',
    author: 'Todos',
    brandGuardValidation: 'Todos',
    selectedTags: [] as string[]
  });

  const views: ViewType[] = ['Grid', 'Lista', 'Detalle'];

  // Advanced filtering logic
  const filteredAssets = mockAssets.filter((asset) => {
    // Category filter
    const matchesCategory = activeCategory === 'Todos los assets' || 
                          activeCategory === 'Favoritos' && asset.isFavorite ||
                          activeCategory === 'Archivados' && asset.isArchived ||
                          asset.category === activeCategory;
    
    // Search filter
    const matchesSearch = searchQuery === '' || 
                         asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Module filter
    const matchesModule = filters.module === 'Todos' || 
                         (filters.module === 'Posts' && asset.type === 'image') ||
                         (filters.module === 'Videos' && asset.type === 'video') ||
                         (filters.module === 'Historias' && asset.type === 'story') ||
                         (filters.module === 'Podcast' && asset.type === 'podcast') ||
                         (filters.module === 'Documentos' && asset.type === 'document') ||
                         (filters.module === 'Plantillas' && asset.type === 'template');
    
    // Status filter
    const matchesStatus = filters.status === 'Todos' || asset.status === filters.status;
    
    // Author filter
    const matchesAuthor = filters.author === 'Todos' || asset.author === filters.author;
    
    // BrandGuard validation filter
    const matchesBrandGuard = filters.brandGuardValidation === 'Todos' || 
                             asset.brandGuardValidation === filters.brandGuardValidation;
    
    // Tags filter
    const matchesTags = filters.selectedTags.length === 0 || 
                       filters.selectedTags.some(tag => asset.tags.includes(tag));
    
    return matchesCategory && matchesSearch && matchesModule && 
           matchesStatus && matchesAuthor && matchesBrandGuard && matchesTags;
  });

  const handleSemanticSearch = (query: string) => {
    // Simulate AI semantic search
    setSearchQuery(query);
    // In a real implementation, this would call an AI service
    console.log('Búsqueda semántica:', query);
  };

  const handleLoadSavedSearch = (search: SavedSearch) => {
    setSearchQuery(search.query);
    setFilters({
      module: search.filters.module || 'Todos',
      status: search.filters.status || 'Todos',
      author: search.filters.author || 'Todos',
      brandGuardValidation: search.filters.brandGuardValidation || 'Todos',
      selectedTags: search.filters.tags || []
    });
  };

  const handleDeleteSavedSearch = (searchId: string) => {
    setSavedSearches(searches => searches.filter(s => s.id !== searchId));
  };

  const handleClearFilters = () => {
    setFilters({
      module: 'Todos',
      status: 'Todos',
      author: 'Todos',
      brandGuardValidation: 'Todos',
      selectedTags: []
    });
    setSearchQuery('');
  };

  const handleAssetSelect = (asset: AssetItem) => {
    setSelectedAsset(asset);
    if (isRightPanelCollapsed) {
      setIsRightPanelCollapsed(false);
    }
  };

  const handleSectionSelect = (section: string) => {
    setActiveSection(section);
    // Aquí iría la lógica para filtrar assets según la sección
  };

  const renderView = () => {
    return (
      <div className="space-y-6">
        {/* Sección de gestión de contenido */}
        <ContentManagementSection />
        
        {/* Sección de plantillas */}
        <TemplatesSection />
        
        {/* Vista actual de assets */}
        <div>
          {(() => {
            switch (activeView) {
              case 'Grid':
                return <GridView assets={filteredAssets} onAssetSelect={handleAssetSelect} />;
              case 'Lista':
                return <ListView assets={filteredAssets} onAssetSelect={handleAssetSelect} />;
              case 'Detalle':
                return <DetailView assets={filteredAssets} onAssetSelect={handleAssetSelect} />;
              default:
                return <GridView assets={filteredAssets} onAssetSelect={handleAssetSelect} />;
            }
          })()}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex bg-canvas">
      {/* Organizational Sidebar */}
      <OrganizationalSidebar 
        activeSection={activeSection}
        onSectionSelect={handleSectionSelect}
        expandedFolders={expandedFolders}
        setExpandedFolders={setExpandedFolders}
        expandedTemplates={expandedTemplates}
        setExpandedTemplates={setExpandedTemplates}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <LibraryTopbar />

        {/* Advanced Search Section */}
        <div className="bg-white border-b border-gray-200 p-6 space-y-4">
          {/* Search Bar */}
          <AdvancedSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSemanticSearch={handleSemanticSearch}
          />

          {/* Filters Panel */}
          <FiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
          />

          {/* Saved Searches */}
          <SavedSearches
            searches={savedSearches}
            onLoadSearch={handleLoadSavedSearch}
            onDeleteSearch={handleDeleteSavedSearch}
          />
        </div>

        {/* View Switcher */}
        <div className="flex items-center justify-center py-4 bg-white border-b border-gray-200">
          <SegmentedControl
            value={activeView}
            onChange={setActiveView}
            options={views}
          />
        </div>

        {/* Dynamic View Area */}
        <div className="flex-1 overflow-auto">
          {filteredAssets.length > 0 ? (
            renderView()
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No se encontraron assets</h3>
                <p className="text-sm">
                  {searchQuery || Object.values(filters).some(f => f !== 'Todos' && (Array.isArray(f) ? f.length > 0 : true)) ? 
                    'No hay resultados que coincidan con los filtros aplicados' : 
                    `No hay assets en ${activeCategory}`
                  }
                </p>
                {(searchQuery || Object.values(filters).some(f => f !== 'Todos' && (Array.isArray(f) ? f.length > 0 : true))) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearFilters}
                    className="mt-3"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <RightPanel 
        isCollapsed={isRightPanelCollapsed}
        onToggle={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
        selectedAsset={selectedAsset}
      />
    </div>
  );
}
