import { useState } from "react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Checkbox } from "../../ui/checkbox";
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  Maximize2,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Zap
} from "lucide-react";

interface GenerationStepCarouselProps {
  onBack?: () => void;
  onNext?: () => void;
}

interface SlideData {
  id: string;
  label: string;
  format: '1:1' | '9:16' | '16:9';
  hasActions?: boolean;
}

interface CarouselData {
  id: string;
  title: string;
  platform: string;
  format: string;
  slideCount: number;
  slides: SlideData[];
  status: 'success' | 'warning' | 'error';
  statusMessage: string;
  selected: boolean;
}

export function GenerationStepCarousel({ onBack, onNext }: GenerationStepCarouselProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [carousels, setCarousels] = useState<CarouselData[]>([
    {
      id: 'carousel-1',
      title: 'Carousel 1 — 5 slides (Instagram 1:1)',
      platform: 'Instagram',
      format: '1:1',
      slideCount: 5,
      slides: [
        { id: 'slide-1-1', label: 'Slide 1', format: '1:1', hasActions: true },
        { id: 'slide-1-2', label: 'Slide 2', format: '1:1' },
        { id: 'slide-1-3', label: 'Slide 3', format: '1:1' },
        { id: 'slide-1-4', label: 'Slide 4', format: '1:1' },
        { id: 'slide-1-5', label: 'Slide 5', format: '1:1' }
      ],
      status: 'success',
      statusMessage: '✅ BrandKit',
      selected: false
    },
    {
      id: 'carousel-2',
      title: 'Carousel 2 — 7 slides (TikTok 9:16)',
      platform: 'TikTok',
      format: '9:16',
      slideCount: 7,
      slides: [
        { id: 'slide-2-1', label: 'Slide 1', format: '9:16' },
        { id: 'slide-2-2', label: 'Slide 2', format: '9:16' },
        { id: 'slide-2-3', label: 'Slide 3', format: '9:16' },
        { id: 'slide-2-4', label: 'Slide 4', format: '9:16' },
        { id: 'slide-2-5', label: 'Slide 5', format: '9:16' },
        { id: 'slide-2-6', label: 'Slide 6', format: '9:16' },
        { id: 'slide-2-7', label: 'Slide 7', format: '9:16' }
      ],
      status: 'warning',
      statusMessage: '⚠️ Revisar contraste',
      selected: false
    },
    {
      id: 'carousel-3',
      title: 'Carousel 3 — 4 slides (LinkedIn 16:9)',
      platform: 'LinkedIn',
      format: '16:9',
      slideCount: 4,
      slides: [
        { id: 'slide-3-1', label: 'Slide 1', format: '16:9' },
        { id: 'slide-3-2', label: 'Slide 2', format: '16:9' },
        { id: 'slide-3-3', label: 'Slide 3', format: '16:9' },
        { id: 'slide-3-4', label: 'Slide 4', format: '16:9' }
      ],
      status: 'success',
      statusMessage: '✅ BrandKit',
      selected: false
    }
  ]);

  const selectedCount = carousels.filter(c => c.selected).length;
  const hasSelection = selectedCount > 0;

  const handleCarouselSelect = (carouselId: string, checked: boolean) => {
    setCarousels(prev => prev.map(carousel => 
      carousel.id === carouselId 
        ? { ...carousel, selected: checked }
        : carousel
    ));
  };

  const handleSelectAll = () => {
    const allSelected = carousels.every(c => c.selected);
    setCarousels(prev => prev.map(carousel => ({
      ...carousel,
      selected: !allSelected
    })));
  };

  const getSlideSize = (format: string) => {
    switch (format) {
      case '9:16':
        return { width: 80, height: 140 };
      case '16:9':
        return { width: 160, height: 90 };
      default: // 1:1
        return { width: 120, height: 120 };
    }
  };

  const getStatusBadge = (status: 'success' | 'warning' | 'error', message: string) => {
    const variants = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive'
    } as const;

    const icons = {
      success: CheckCircle,
      warning: AlertTriangle,
      error: AlertTriangle
    };

    const Icon = icons[status];

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {message}
      </Badge>
    );
  };

  const triggerGeneration = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8 space-y-6">
        {/* Header Loading */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Generación de Carousels</h1>
              <p className="text-muted-foreground">La IA está creando tus carousels...</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            Paso 3 de 6
          </Badge>
        </div>

        {/* Loading State */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-y-4 flex-col">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-lg font-medium">Generando tus carousels con IA…</span>
              </div>
              <p className="text-muted-foreground text-center max-w-md">
                Estamos aplicando tu BrandKit y creando diseños únicos para cada slide. 
                Esto puede tomar unos momentos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Loading Placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 overflow-x-auto">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 animate-pulse"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Generación de Carousels</h1>
            <p className="text-muted-foreground">Selecciona los carousels que quieres continuar editando</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            Paso 3 de 6
          </Badge>
          <span className="text-sm text-muted-foreground">
            {selectedCount} carousel{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
          </span>
          <Button variant="ghost" size="sm" onClick={handleSelectAll}>
            {carousels.every(c => c.selected) ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </Button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Generación completada</span>
          <span className="text-sm text-muted-foreground">
            {carousels.length} carousels generados con un total de {carousels.reduce((acc, c) => acc + c.slideCount, 0)} slides
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={triggerGeneration}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerar todos
        </Button>
      </div>

      {/* Carousels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {carousels.map((carousel) => {
          const slideSize = getSlideSize(carousel.format);
          
          return (
            <Card key={carousel.id} className={`shadow-sm transition-all ${carousel.selected ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={carousel.selected}
                      onCheckedChange={(checked) => handleCarouselSelect(carousel.id, !!checked)}
                      aria-label={`Seleccionar ${carousel.title}`}
                    />
                    <div>
                      <h3 className="font-semibold">{carousel.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {carousel.slideCount} slides • {carousel.platform}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(carousel.status, carousel.statusMessage)}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <div className="flex gap-3 pb-2" style={{ minWidth: 'max-content' }}>
                    {carousel.slides.map((slide, index) => (
                      <div key={slide.id} className="relative group">
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center text-gray-400 text-sm font-medium hover:border-gray-400 transition-colors cursor-pointer"
                          style={{ width: slideSize.width, height: slideSize.height }}
                        >
                          <div className="text-xs mb-1">{slide.label}</div>
                          <div className="text-xs opacity-60">{slide.format}</div>
                        </div>
                        
                        {/* Slide Actions */}
                        {slide.hasActions && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                              <Maximize2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="destructive" className="w-8 h-8 p-0">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        
                        {/* Slide Number Badge */}
                        <div className="absolute bottom-2 left-2">
                          <Badge variant="outline" className="text-xs">
                            {index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Carousel Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerar carousel
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Generado hace 2 min
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        
        <div className="flex items-center gap-3">
          {hasSelection && (
            <div className="text-sm text-muted-foreground text-right">
              <div>Seleccionados:</div>
              <div className="font-medium">
                {selectedCount} carousel{selectedCount > 1 ? 's' : ''} con {' '}
                {carousels.filter(c => c.selected).reduce((acc, c) => acc + c.slideCount, 0)} slides total
              </div>
            </div>
          )}
          <Button 
            onClick={onNext} 
            disabled={!hasSelection}
            className="gap-2"
          >
            Siguiente: Edición
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}