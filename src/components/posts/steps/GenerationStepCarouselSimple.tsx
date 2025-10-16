import { useState } from "react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Checkbox } from "../../ui/checkbox";
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface GenerationStepCarouselSimpleProps {
  onBack?: () => void;
  onNext?: () => void;
}

export function GenerationStepCarouselSimple({ onBack, onNext }: GenerationStepCarouselSimpleProps) {
  const [selectedCarousels, setSelectedCarousels] = useState<string[]>([]);
  
  const carousels = [
    {
      id: 'carousel-1',
      title: 'Carousel 1 — 5 slides (Instagram 1:1)',
      platform: 'Instagram',
      slideCount: 5,
      status: 'success' as const,
      statusMessage: '✅ BrandKit'
    },
    {
      id: 'carousel-2', 
      title: 'Carousel 2 — 7 slides (TikTok 9:16)',
      platform: 'TikTok',
      slideCount: 7,
      status: 'warning' as const,
      statusMessage: '⚠️ Revisar contraste'
    },
    {
      id: 'carousel-3',
      title: 'Carousel 3 — 4 slides (LinkedIn 16:9)',
      platform: 'LinkedIn', 
      slideCount: 4,
      status: 'success' as const,
      statusMessage: '✅ BrandKit'
    }
  ];

  const handleCarouselSelect = (carouselId: string, checked: boolean) => {
    if (checked) {
      setSelectedCarousels(prev => [...prev, carouselId]);
    } else {
      setSelectedCarousels(prev => prev.filter(id => id !== carouselId));
    }
  };

  const handleSelectAll = () => {
    if (selectedCarousels.length === carousels.length) {
      setSelectedCarousels([]);
    } else {
      setSelectedCarousels(carousels.map(c => c.id));
    }
  };

  const getStatusBadge = (status: 'success' | 'warning', message: string) => {
    const Icon = status === 'success' ? CheckCircle : AlertTriangle;
    const variant = status === 'success' ? 'default' : 'secondary';
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {message}
      </Badge>
    );
  };

  const hasSelection = selectedCarousels.length > 0;

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
            {selectedCarousels.length} carousel{selectedCarousels.length !== 1 ? 's' : ''} seleccionado{selectedCarousels.length !== 1 ? 's' : ''}
          </span>
          <Button variant="ghost" size="sm" onClick={handleSelectAll}>
            {selectedCarousels.length === carousels.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </Button>
        </div>
      </div>

      {/* Carousels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {carousels.map((carousel) => {
          const isSelected = selectedCarousels.includes(carousel.id);
          
          return (
            <Card key={carousel.id} className={`shadow-sm transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
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
                {/* Simplified Slides Preview */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {Array.from({ length: carousel.slideCount }, (_, index) => (
                    <div key={index} className="relative">
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center text-gray-400 text-sm font-medium flex-shrink-0">
                        <div className="text-xs">Slide {index + 1}</div>
                      </div>
                      <div className="absolute bottom-1 left-1">
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Carousel Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerar carousel
                  </Button>
                  
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
                {selectedCarousels.length} carousel{selectedCarousels.length > 1 ? 's' : ''} con {' '}
                {carousels.filter(c => selectedCarousels.includes(c.id)).reduce((acc, c) => acc + c.slideCount, 0)} slides total
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