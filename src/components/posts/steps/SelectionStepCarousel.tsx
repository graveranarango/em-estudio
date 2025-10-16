import { useState } from "react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Checkbox } from "../../ui/checkbox";
import { 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Eye,
  Copy,
  Trash2,
  FileCheck
} from "lucide-react";

interface SelectionStepCarouselProps {
  onBack?: () => void;
  onNext?: () => void;
}

interface CarouselData {
  id: string;
  name: string;
  slideCount: number;
  status: 'complete' | 'pending' | 'warning';
  selected: boolean;
  slides: { id: string; label: string }[];
}

export function SelectionStepCarousel({ onBack, onNext }: SelectionStepCarouselProps) {
  const [carousels, setCarousels] = useState<CarouselData[]>([
    {
      id: 'carousel-1',
      name: 'Carousel 1',
      slideCount: 5,
      status: 'complete',
      selected: false,
      slides: [
        { id: 'slide-1-1', label: 'Slide 1' },
        { id: 'slide-1-2', label: 'Slide 2' },
        { id: 'slide-1-3', label: 'Slide 3' },
        { id: 'slide-1-4', label: 'Slide 4' },
        { id: 'slide-1-5', label: 'Slide 5' }
      ]
    },
    {
      id: 'carousel-2',
      name: 'Carousel 2',
      slideCount: 7,
      status: 'pending',
      selected: false,
      slides: [
        { id: 'slide-2-1', label: 'Slide 1' },
        { id: 'slide-2-2', label: 'Slide 2' },
        { id: 'slide-2-3', label: 'Slide 3' },
        { id: 'slide-2-4', label: 'Slide 4' },
        { id: 'slide-2-5', label: 'Slide 5' },
        { id: 'slide-2-6', label: 'Slide 6' },
        { id: 'slide-2-7', label: 'Slide 7' }
      ]
    },
    {
      id: 'carousel-3',
      name: 'Carousel 3',
      slideCount: 4,
      status: 'complete',
      selected: false,
      slides: [
        { id: 'slide-3-1', label: 'Slide 1' },
        { id: 'slide-3-2', label: 'Slide 2' },
        { id: 'slide-3-3', label: 'Slide 3' },
        { id: 'slide-3-4', label: 'Slide 4' }
      ]
    },
    {
      id: 'carousel-4',
      name: 'Carousel 4',
      slideCount: 6,
      status: 'warning',
      selected: false,
      slides: [
        { id: 'slide-4-1', label: 'Slide 1' },
        { id: 'slide-4-2', label: 'Slide 2' },
        { id: 'slide-4-3', label: 'Slide 3' },
        { id: 'slide-4-4', label: 'Slide 4' },
        { id: 'slide-4-5', label: 'Slide 5' },
        { id: 'slide-4-6', label: 'Slide 6' }
      ]
    }
  ]);

  const selectedCount = carousels.filter(c => c.selected).length;
  const hasSelections = selectedCount > 0;

  const handleCarouselSelection = (carouselId: string, checked: boolean) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return '✅ Completo';
      case 'pending':
        return '⏳ Pendiente';
      case 'warning':
        return '⚠️ Requiere atención';
      default:
        return '';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'complete':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'warning':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-8 border-b bg-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Selección final de Carousels</h1>
              <p className="text-sm text-muted-foreground">Elige los carousels para continuar</p>
            </div>
          </div>

          <Badge variant="secondary" className="text-sm">
            Paso 5 de 7
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {selectedCount} carousels seleccionados
          </span>
          
          <Button variant="ghost" onClick={handleSelectAll} className="text-sm">
            {carousels.every(c => c.selected) ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <Button 
              onClick={onNext} 
              disabled={!hasSelections}
              className="gap-2"
            >
              Siguiente: Captions & Hashtags
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="grid grid-cols-2 gap-6 max-w-7xl mx-auto">
          {carousels.map((carousel) => (
            <Card key={carousel.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={carousel.selected}
                      onCheckedChange={(checked) => 
                        handleCarouselSelection(carousel.id, checked as boolean)
                      }
                      className="scale-110"
                    />
                    <div>
                      <h3 className="font-semibold">
                        {carousel.name} — {carousel.slideCount} slides
                      </h3>
                    </div>
                  </div>
                  
                  <Badge 
                    variant={getStatusVariant(carousel.status)}
                    className="gap-1"
                  >
                    {getStatusIcon(carousel.status)}
                    {getStatusText(carousel.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Slides Preview */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Vista previa de slides
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {carousel.slides.map((slide, index) => (
                      <div
                        key={slide.id}
                        className="relative flex-shrink-0"
                      >
                        <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center text-gray-400 text-xs font-medium">
                          <div>{slide.label}</div>
                        </div>
                        
                        {/* Slide Number */}
                        <div className="absolute -bottom-1 -right-1">
                          <Badge 
                            variant="outline" 
                            className="text-xs w-6 h-6 rounded-full p-0 flex items-center justify-center bg-white"
                          >
                            {index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="gap-2 text-xs">
                      <Eye className="w-3 h-3" />
                      Vista previa
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-xs">
                      <Copy className="w-3 h-3" />
                      Duplicar
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-xs text-destructive hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                      Eliminar
                    </Button>
                  </div>

                  {carousel.status === 'warning' && (
                    <Button variant="outline" size="sm" className="text-xs">
                      Revisar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        {hasSelections && (
          <div className="mt-8 max-w-7xl mx-auto">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {selectedCount} carousel{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''} para captions & hashtags
                  </span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  En el siguiente paso podrás generar captions personalizados y hashtags optimizados para cada carousel.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t p-6">
        <div className="flex items-center justify-end gap-3 max-w-7xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <Button 
            onClick={onNext} 
            disabled={!hasSelections}
            className="gap-2"
          >
            Siguiente: Captions & Hashtags
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}