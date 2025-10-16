import { useState } from "react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Hash,
  X,
  Plus,
  Sparkles,
  MessageSquare
} from "lucide-react";

interface CaptionHashtagsStepCarouselProps {
  onBack?: () => void;
  onNext?: () => void;
}

interface HashtagChip {
  id: string;
  label: string;
  removable: boolean;
}

interface CarouselCaptionData {
  id: string;
  name: string;
  slideCount: number;
  caption: string;
  hashtags: HashtagChip[];
  validation: {
    status: 'success' | 'warning' | 'error';
    message: string;
  };
  allowEmojis: boolean;
  confirmed: boolean;
}

export function CaptionHashtagsStepCarousel({ onBack, onNext }: CaptionHashtagsStepCarouselProps) {
  const [carousels, setCarousels] = useState<CarouselCaptionData[]>([
    {
      id: 'carousel-1',
      name: 'Carousel 1',
      slideCount: 5,
      caption: 'Descubre nuestra nueva colección, diseñada para inspirarte. ✨ Cada pieza cuenta una historia única y refleja nuestro compromiso con la innovación y el estilo.',
      hashtags: [
        { id: 'h1', label: '#Innovación', removable: true },
        { id: 'h2', label: '#Estilo', removable: true },
        { id: 'h3', label: '#TuMarca', removable: true }
      ],
      validation: {
        status: 'success',
        message: 'Cumple BrandGuard: Longitud aceptable, tono correcto.'
      },
      allowEmojis: true,
      confirmed: false
    },
    {
      id: 'carousel-2',
      name: 'Carousel 2',
      slideCount: 7,
      caption: 'Un viaje visual que transforma tu experiencia. 🚀 Sumérgete en un mundo donde la creatividad se encuentra con la funcionalidad, creando momentos únicos que conectan con tu audiencia de manera auténtica y memorable.',
      hashtags: [
        { id: 'h4', label: '#Creatividad', removable: true },
        { id: 'h5', label: '#Impacto', removable: true }
      ],
      validation: {
        status: 'warning',
        message: 'Texto demasiado largo para LinkedIn (máx. 125 caracteres).'
      },
      allowEmojis: true,
      confirmed: false
    },
    {
      id: 'carousel-3',
      name: 'Carousel 3',
      slideCount: 4,
      caption: 'Conectamos ideas con resultados excepcionales.',
      hashtags: [
        { id: 'h6', label: '#Resultados', removable: true },
        { id: 'h7', label: '#Excelencia', removable: true },
        { id: 'h8', label: '#Conexión', removable: true }
      ],
      validation: {
        status: 'success',
        message: 'Perfecto: Conciso, profesional y alineado con el brand voice.'
      },
      allowEmojis: false,
      confirmed: true
    }
  ]);

  const confirmedCount = carousels.filter(c => c.confirmed).length;
  const hasConfirmed = confirmedCount > 0;

  const handleCaptionChange = (carouselId: string, newCaption: string) => {
    setCarousels(prev => prev.map(carousel => 
      carousel.id === carouselId 
        ? { 
            ...carousel, 
            caption: newCaption,
            confirmed: false,
            validation: validateCaption(newCaption)
          }
        : carousel
    ));
  };

  const handleHashtagRemove = (carouselId: string, hashtagId: string) => {
    setCarousels(prev => prev.map(carousel => 
      carousel.id === carouselId 
        ? { 
            ...carousel, 
            hashtags: carousel.hashtags.filter(h => h.id !== hashtagId)
          }
        : carousel
    ));
  };

  const handleEmojiToggle = (carouselId: string, allowEmojis: boolean) => {
    setCarousels(prev => prev.map(carousel => 
      carousel.id === carouselId 
        ? { ...carousel, allowEmojis }
        : carousel
    ));
  };

  const handleConfirmCaption = (carouselId: string) => {
    setCarousels(prev => prev.map(carousel => 
      carousel.id === carouselId 
        ? { ...carousel, confirmed: !carousel.confirmed }
        : carousel
    ));
  };

  const validateCaption = (caption: string) => {
    if (caption.length > 200) {
      return {
        status: 'warning' as const,
        message: 'Texto demasiado largo para algunas plataformas.'
      };
    }
    if (caption.length < 20) {
      return {
        status: 'error' as const,
        message: 'Caption muy corto, necesita más contexto.'
      };
    }
    return {
      status: 'success' as const,
      message: 'Cumple BrandGuard: Longitud y tono apropiados.'
    };
  };

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getValidationVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
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
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Captions & Hashtags</h1>
              <p className="text-sm text-muted-foreground">Genera contenido optimizado para cada carousel</p>
            </div>
          </div>

          <Badge variant="secondary" className="text-sm">
            Paso 6 de 7
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {confirmedCount} de {carousels.length} confirmados
          </span>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <Button 
              onClick={onNext} 
              disabled={!hasConfirmed}
              className="gap-2"
            >
              Siguiente: Publicación
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {carousels.map((carousel) => (
            <Card key={carousel.id} className={`shadow-sm transition-all ${carousel.confirmed ? 'ring-2 ring-green-200 bg-green-50/30' : 'hover:shadow-md'}`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">
                      {carousel.name} — {carousel.slideCount} slides
                    </h3>
                    {carousel.confirmed && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Confirmado
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    variant={carousel.confirmed ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleConfirmCaption(carousel.id)}
                    className="gap-2"
                  >
                    {carousel.confirmed ? "Editar" : "Confirmar"}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Caption Area */}
                <div className="space-y-2">
                  <Label htmlFor={`caption-${carousel.id}`} className="text-sm font-medium">
                    Caption generado por IA
                  </Label>
                  <Textarea
                    id={`caption-${carousel.id}`}
                    value={carousel.caption}
                    onChange={(e) => handleCaptionChange(carousel.id, e.target.value)}
                    className="min-h-[100px] resize-none"
                    placeholder="Escribe tu caption aquí..."
                    disabled={carousel.confirmed}
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{carousel.caption.length} caracteres</span>
                    <span>Recomendado: 50-150 caracteres</span>
                  </div>
                </div>

                {/* Hashtags */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Hashtags sugeridos</Label>
                  <div className="flex flex-wrap gap-2">
                    {carousel.hashtags.map((hashtag) => (
                      <div
                        key={hashtag.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        <Hash className="w-3 h-3" />
                        {hashtag.label.replace('#', '')}
                        {hashtag.removable && !carousel.confirmed && (
                          <button
                            onClick={() => handleHashtagRemove(carousel.id, hashtag.id)}
                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    {!carousel.confirmed && (
                      <button className="inline-flex items-center gap-1 px-3 py-1 border-2 border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                        <Plus className="w-3 h-3" />
                        Agregar
                      </button>
                    )}
                  </div>
                </div>

                {/* Validation Row */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Badge 
                    variant={getValidationVariant(carousel.validation.status)}
                    className="gap-1"
                  >
                    {getValidationIcon(carousel.validation.status)}
                    {carousel.validation.status === 'success' ? '✅ Cumple BrandGuard' : 
                     carousel.validation.status === 'warning' ? '⚠️ Ajustar' : 
                     '❌ Revisar'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {carousel.validation.message}
                  </span>
                </div>

                {/* Actions Row */}
                {!carousel.confirmed && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Regenerar caption
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Hash className="w-4 h-4" />
                        Sugerir más hashtags
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Sparkles className="w-4 h-4" />
                        Optimizar con IA
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label htmlFor={`emojis-${carousel.id}`} className="text-sm">
                        Permitir emojis
                      </Label>
                      <Switch
                        id={`emojis-${carousel.id}`}
                        checked={carousel.allowEmojis}
                        onCheckedChange={(checked) => handleEmojiToggle(carousel.id, checked)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        {hasConfirmed && (
          <div className="mt-8 max-w-4xl mx-auto">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    {confirmedCount} carousel{confirmedCount !== 1 ? 's' : ''} con captions confirmados
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Los captions están optimizados para múltiples plataformas y cumplen con las guías de marca.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Platform Guidelines */}
        <div className="mt-6 max-w-4xl mx-auto">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <h4 className="font-medium text-blue-900">💡 Guías por plataforma</h4>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-blue-800">Instagram Feed:</p>
                  <p className="text-blue-700">125-150 caracteres, 3-5 hashtags</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-blue-800">LinkedIn:</p>
                  <p className="text-blue-700">50-100 caracteres, 1-3 hashtags</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-blue-800">Twitter/X:</p>
                  <p className="text-blue-700">50-100 caracteres, 1-2 hashtags</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-blue-800">TikTok:</p>
                  <p className="text-blue-700">100-150 caracteres, 3-5 hashtags</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t p-6">
        <div className="flex items-center justify-end gap-3 max-w-4xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <Button 
            onClick={onNext} 
            disabled={!hasConfirmed}
            className="gap-2"
          >
            Siguiente: Publicación
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}