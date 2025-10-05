import { useState } from "react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { 
  ArrowLeft, 
  Check,
  Clock,
  Calendar,
  Send,
  Archive,
  CheckCircle,
  Upload,
  Share2,
  Sparkles,
  CalendarDays,
  Timer
} from "lucide-react";

interface PublishingStepCarouselProps {
  onBack?: () => void;
  onFinish?: () => void;
}

interface SlideData {
  id: string;
  label: string;
}

interface CarouselPublishData {
  id: string;
  name: string;
  slideCount: number;
  slides: SlideData[];
  caption: string;
  status: 'pending' | 'scheduled' | 'published' | 'saved' | 'ai-scheduled';
  scheduledDate?: string;
  scheduledTime?: string;
  schedulingMethod?: 'manual' | 'ai';
  aiSuggestion?: {
    date: string;
    time: string;
    reason: string;
  };
}

interface AgendaEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'carousel' | 'post' | 'story';
}

export function PublishingStepCarousel({ onBack, onFinish }: PublishingStepCarouselProps) {
  const [carousels, setCarousels] = useState<CarouselPublishData[]>([
    {
      id: 'carousel-1',
      name: 'Carousel 1',
      slideCount: 5,
      slides: [
        { id: 'slide-1-1', label: 'Slide 1' },
        { id: 'slide-1-2', label: 'Slide 2' },
        { id: 'slide-1-3', label: 'Slide 3' },
        { id: 'slide-1-4', label: 'Slide 4' },
        { id: 'slide-1-5', label: 'Slide 5' }
      ],
      caption: 'Descubre nuestra nueva colección, diseñada para inspirarte. ✨ #Innovación #Estilo',
      status: 'pending',
      aiSuggestion: {
        date: '2025-10-16',
        time: '19:30',
        reason: 'Horario de mayor engagement para tu audiencia (83% más interacción)'
      }
    },
    {
      id: 'carousel-2',
      name: 'Carousel 2',
      slideCount: 7,
      slides: [
        { id: 'slide-2-1', label: 'Slide 1' },
        { id: 'slide-2-2', label: 'Slide 2' },
        { id: 'slide-2-3', label: 'Slide 3' },
        { id: 'slide-2-4', label: 'Slide 4' },
        { id: 'slide-2-5', label: 'Slide 5' },
        { id: 'slide-2-6', label: 'Slide 6' },
        { id: 'slide-2-7', label: 'Slide 7' }
      ],
      caption: 'Un viaje visual que transforma tu experiencia. 🚀 #Creatividad #Impacto',
      status: 'scheduled',
      scheduledDate: '2025-10-15',
      scheduledTime: '18:00',
      schedulingMethod: 'manual'
    },
    {
      id: 'carousel-3',
      name: 'Carousel 3',
      slideCount: 4,
      slides: [
        { id: 'slide-3-1', label: 'Slide 1' },
        { id: 'slide-3-2', label: 'Slide 2' },
        { id: 'slide-3-3', label: 'Slide 3' },
        { id: 'slide-3-4', label: 'Slide 4' }
      ],
      caption: 'Conectamos ideas con resultados excepcionales.',
      status: 'ai-scheduled',
      scheduledDate: '2025-10-17',
      scheduledTime: '12:00',
      schedulingMethod: 'ai',
      aiSuggestion: {
        date: '2025-10-17',
        time: '12:00',
        reason: 'Horario almuerzo optimizado para contenido profesional'
      }
    }
  ]);

  const [agendaEvents] = useState<AgendaEvent[]>([
    { id: 'event-1', date: '2025-10-15', time: '18:00', title: 'Carousel 2', type: 'carousel' },
    { id: 'event-2', date: '2025-10-17', time: '12:00', title: 'Carousel 3', type: 'carousel' },
    { id: 'event-3', date: '2025-10-18', time: '10:30', title: 'Post promocional', type: 'post' },
    { id: 'event-4', date: '2025-10-19', time: '16:00', title: 'Story behind scenes', type: 'story' }
  ]);

  const publishedCount = carousels.filter(c => c.status === 'published').length;
  const scheduledCount = carousels.filter(c => c.status === 'scheduled' || c.status === 'ai-scheduled').length;
  const savedCount = carousels.filter(c => c.status === 'saved').length;
  const readyToFinish = publishedCount > 0 || scheduledCount > 0;

  const handleScheduleManual = (carouselId: string, date: string, time: string) => {
    setCarousels(prev => prev.map(carousel => 
      carousel.id === carouselId 
        ? { 
            ...carousel, 
            status: 'scheduled',
            scheduledDate: date,
            scheduledTime: time,
            schedulingMethod: 'manual'
          }
        : carousel
    ));
  };

  const handleScheduleAI = (carouselId: string) => {
    const carousel = carousels.find(c => c.id === carouselId);
    if (carousel?.aiSuggestion) {
      setCarousels(prev => prev.map(c => 
        c.id === carouselId 
          ? { 
              ...c, 
              status: 'ai-scheduled',
              scheduledDate: carousel.aiSuggestion!.date,
              scheduledTime: carousel.aiSuggestion!.time,
              schedulingMethod: 'ai'
            }
          : c
      ));
    }
  };

  const handlePublishNow = (carouselId: string) => {
    setCarousels(prev => prev.map(carousel => 
      carousel.id === carouselId 
        ? { ...carousel, status: 'published' }
        : carousel
    ));
  };

  const handleSaveToLibrary = (carouselId: string) => {
    setCarousels(prev => prev.map(carousel => 
      carousel.id === carouselId 
        ? { ...carousel, status: 'saved' }
        : carousel
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-600" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'ai-scheduled':
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'saved':
        return <Archive className="w-4 h-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string, scheduledDate?: string) => {
    switch (status) {
      case 'pending':
        return '🕒 Pendiente';
      case 'scheduled':
        return '✅ Programado';
      case 'ai-scheduled':
        return '🤖 Programado con IA';
      case 'published':
        return '📤 Publicado';
      case 'saved':
        return '📁 Guardado';
      default:
        return '';
    }
  };

  const getStatusDescription = (status: string, carousel: CarouselPublishData) => {
    switch (status) {
      case 'pending':
        return 'Esperando programación';
      case 'scheduled':
        return carousel.scheduledDate && carousel.scheduledTime 
          ? `Programado para ${carousel.scheduledDate} a las ${carousel.scheduledTime}`
          : 'Programado manualmente';
      case 'ai-scheduled':
        return carousel.scheduledDate && carousel.scheduledTime 
          ? `Programado con IA para ${carousel.scheduledDate} a las ${carousel.scheduledTime}`
          : 'Programado con IA';
      case 'published':
        return 'Publicado exitosamente';
      case 'saved':
        return 'Guardado en biblioteca';
      default:
        return '';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'scheduled':
        return 'default';
      case 'ai-scheduled':
        return 'default';
      case 'published':
        return 'default';
      case 'saved':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const renderSchedulingOptions = (carousel: CarouselPublishData) => {
    if (carousel.status === 'published' || carousel.status === 'saved') {
      return null;
    }

    const defaultDate = carousel.scheduledDate || '2025-10-15';
    const defaultTime = carousel.scheduledTime || '18:00';

    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-sm">Opciones de programación</h4>
        
        {/* Manual Scheduling */}
        <div className="space-y-3">
          <Label className="text-sm">Programar manualmente</Label>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor={`date-${carousel.id}`} className="text-xs text-muted-foreground">Fecha</Label>
              <Input
                id={`date-${carousel.id}`}
                type="date"
                defaultValue={defaultDate}
                className="text-sm"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor={`time-${carousel.id}`} className="text-xs text-muted-foreground">Hora</Label>
              <Input
                id={`time-${carousel.id}`}
                type="time"
                defaultValue={defaultTime}
                className="text-sm"
              />
            </div>
            <Button 
              variant="default" 
              size="sm" 
              className="self-end"
              onClick={() => handleScheduleManual(carousel.id, defaultDate, defaultTime)}
            >
              Programar
            </Button>
          </div>
        </div>

        {/* AI Scheduling */}
        {carousel.aiSuggestion && (
          <div className="space-y-2">
            <Button 
              variant="secondary" 
              className="w-full gap-2 justify-start"
              onClick={() => handleScheduleAI(carousel.id)}
            >
              <Sparkles className="w-4 h-4" />
              📊 Programar con IA
            </Button>
            <div className="text-xs text-muted-foreground bg-white p-2 rounded border">
              <p><strong>Sugerencia IA:</strong> {carousel.aiSuggestion.date} a las {carousel.aiSuggestion.time}</p>
              <p>{carousel.aiSuggestion.reason}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-8 border-b bg-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Publicación de Carousels</h1>
              <p className="text-sm text-muted-foreground">Programa, publica o guarda tus carousels</p>
            </div>
          </div>

          <Badge variant="secondary" className="text-sm">
            Paso 7 de 7
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <div>📤 {publishedCount} publicados • ✅ {scheduledCount} programados</div>
            <div className="text-xs">📁 {savedCount} guardados en biblioteca</div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <Button 
              onClick={onFinish} 
              disabled={!readyToFinish}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              Finalizar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Carousels List */}
            <div className="lg:col-span-2 space-y-6">
              {carousels.map((carousel) => (
                <Card key={carousel.id} className={`shadow-sm transition-all ${
                  carousel.status === 'published' ? 'ring-2 ring-green-200 bg-green-50/30' : 
                  carousel.status === 'scheduled' ? 'ring-2 ring-blue-200 bg-blue-50/30' :
                  carousel.status === 'ai-scheduled' ? 'ring-2 ring-indigo-200 bg-indigo-50/30' :
                  carousel.status === 'saved' ? 'ring-2 ring-purple-200 bg-purple-50/30' :
                  'hover:shadow-md'
                }`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    {carousel.name} — {carousel.slideCount} slides
                  </h3>
                  
                  <Badge 
                    variant={getStatusVariant(carousel.status)}
                    className="gap-1"
                  >
                    {getStatusIcon(carousel.status)}
                    {getStatusText(carousel.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Slides Preview */}
                <div className="space-y-3">
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

                {/* Caption Preview */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Caption</h4>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-700">{carousel.caption}</p>
                  </div>
                </div>

                {/* Status Row */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Badge 
                    variant={getStatusVariant(carousel.status)}
                    className="gap-1"
                  >
                    {getStatusIcon(carousel.status)}
                    {getStatusText(carousel.status)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {getStatusDescription(carousel.status, carousel)}
                  </span>
                </div>

                {/* Scheduling Options */}
                {carousel.status === 'pending' && renderSchedulingOptions(carousel)}

                {/* AI Suggestion for scheduled items */}
                {carousel.status === 'ai-scheduled' && carousel.aiSuggestion && (
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-900">Programado con IA</span>
                    </div>
                    <p className="text-sm text-indigo-700">{carousel.aiSuggestion.reason}</p>
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handlePublishNow(carousel.id)}
                      disabled={carousel.status === 'published'}
                    >
                      <Send className="w-4 h-4" />
                      {carousel.status === 'published' ? 'Publicado' : 'Publicar ahora'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleSaveToLibrary(carousel.id)}
                    >
                      <Archive className="w-4 h-4" />
                      Guardar en Biblioteca
                    </Button>
                  </div>

                  {carousel.status === 'published' && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Publicado exitosamente</span>
                    </div>
                  )}

                  {(carousel.status === 'scheduled' || carousel.status === 'ai-scheduled') && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Listo para publicar</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
            </div>

            {/* Agenda Preview */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">Vista rápida de agenda</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Week Calendar */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Esta semana</div>
                    {agendaEvents.slice(0, 4).map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                          </div>
                          <div className="font-medium text-sm">
                            {new Date(event.date).getDate()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {event.type === 'carousel' && <Timer className="w-3 h-3 text-blue-600" />}
                            {event.type === 'post' && <Share2 className="w-3 h-3 text-green-600" />}
                            {event.type === 'story' && <Calendar className="w-3 h-3 text-purple-600" />}
                            <span className="text-sm font-medium truncate">{event.title}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{event.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Estadísticas</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <div className="font-semibold text-blue-600">{scheduledCount}</div>
                        <div className="text-xs text-blue-700">Programados</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <div className="font-semibold text-green-600">{publishedCount}</div>
                        <div className="text-xs text-green-700">Publicados</div>
                      </div>
                    </div>
                  </div>

                  {/* Optimal Times */}
                  <div className="pt-4 border-t space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Horarios optimizados IA</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Instagram</span>
                        <span className="font-medium">19:30 - 21:00</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>LinkedIn</span>
                        <span className="font-medium">12:00 - 14:00</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Twitter</span>
                        <span className="font-medium">15:00 - 16:00</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {(publishedCount > 0 || scheduledCount > 0 || savedCount > 0) && (
          <div className="mt-8 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Published Summary */}
              {publishedCount > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Upload className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">
                        {publishedCount} Publicado{publishedCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      Ya están disponibles en tus redes sociales
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Scheduled Summary */}
              {scheduledCount > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        {scheduledCount} Programado{scheduledCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Se publicarán automáticamente
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Saved Summary */}
              {savedCount > 0 && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Archive className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-900">
                        {savedCount} Guardado{savedCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-sm text-purple-700">
                      Disponibles en tu biblioteca
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Getting Started Info */}
        {!readyToFinish && (
          <div className="mt-8 max-w-6xl mx-auto">
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Clock className="w-6 h-6 text-gray-500" />
                  <span className="font-medium text-gray-700">
                    Listo para publicar
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Programa tus carousels para fechas específicas, publícalos ahora o guárdalos en tu biblioteca para usar más tarde.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Programar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Send className="w-4 h-4" />
                    <span>Publicar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Archive className="w-4 h-4" />
                    <span>Guardar</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t p-6">
        <div className="flex items-center justify-end gap-3 max-w-6xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <Button 
            onClick={onFinish} 
            disabled={!readyToFinish}
            className="gap-2"
          >
            <Check className="w-4 h-4" />
            Finalizar
          </Button>
        </div>
      </div>
    </div>
  );
}