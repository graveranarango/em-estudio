import React, { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Separator } from "../../ui/separator";
import { useBrandKit } from "../../../contexts/BrandKitContext";
import { useVideoProject } from "../../../contexts/VideoProjectContext";
// Note: Using basic date formatting instead of date-fns to keep dependencies minimal
const formatDate = (date: Date) => {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
};

const formatDateLong = (date: Date) => {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

import { 
  ArrowLeft,
  ArrowRight,
  Smartphone,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Save,
  Sparkles,
  Library
} from "lucide-react";

interface PublishingStepShortProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

type VideoStatus = 'pending' | 'scheduled' | 'published' | 'saved';

// Mock data para los videos a publicar
const MOCK_VIDEOS = [
  {
    id: 'video-1',
    title: 'Reel 1',
    duration: 30,
    caption: 'Descubre nuestra nueva promo 🚀. Ahorra y envía hoy mismo. #Envíos #Promo',
    status: 'pending' as VideoStatus,
    scheduledDate: null as Date | null,
    scheduledTime: '18:00'
  },
  {
    id: 'video-2', 
    title: 'Short 2',
    duration: 20,
    caption: 'Un vistazo rápido a nuestra oferta ✨ #Descuento #Short',
    status: 'scheduled' as VideoStatus,
    scheduledDate: new Date('2025-10-12'),
    scheduledTime: '15:00'
  }
];

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: 'Pendiente',
    description: 'Esperando programación',
    badgeClass: 'bg-gray-100 text-gray-700'
  },
  scheduled: {
    icon: CalendarIcon,
    label: 'Programado',
    description: 'Listo para publicar',
    badgeClass: 'bg-blue-100 text-blue-700'
  },
  published: {
    icon: CheckCircle,
    label: 'Publicado',
    description: 'Ya está en vivo',
    badgeClass: 'bg-green-100 text-green-700'
  },
  saved: {
    icon: Library,
    label: 'En Biblioteca',
    description: 'Guardado para después',
    badgeClass: 'bg-purple-100 text-purple-700'
  }
};

export function PublishingStepShort({ onNext, onPrevious }: PublishingStepShortProps) {
  const { brandKit } = useBrandKit();
  const { currentProject } = useVideoProject();
  
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const [selectedDate, setSelectedDate] = useState<{ [key: string]: Date | undefined }>({});
  const [selectedTime, setSelectedTime] = useState<{ [key: string]: string }>({
    'video-1': '18:00',
    'video-2': '15:00'
  });

  // Determinar si se puede finalizar (al menos un video programado/publicado/guardado)
  const canFinish = videos.some(video => 
    video.status === 'scheduled' || video.status === 'published' || video.status === 'saved'
  );

  const updateVideoStatus = (videoId: string, status: VideoStatus, date?: Date) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { 
            ...video, 
            status, 
            scheduledDate: date || video.scheduledDate,
            scheduledTime: selectedTime[videoId] || video.scheduledTime
          }
        : video
    ));
  };

  const scheduleVideo = (videoId: string) => {
    const date = selectedDate[videoId];
    if (date) {
      updateVideoStatus(videoId, 'scheduled', date);
    }
  };

  const scheduleWithAI = (videoId: string) => {
    // Simular programación con IA - sugiere una fecha/hora óptima
    const optimalDates = [
      new Date('2025-10-11'),
      new Date('2025-10-13'),
      new Date('2025-10-14')
    ];
    const optimalTimes = ['10:00', '14:00', '18:00', '20:00'];
    
    const randomDate = optimalDates[Math.floor(Math.random() * optimalDates.length)];
    const randomTime = optimalTimes[Math.floor(Math.random() * optimalTimes.length)];
    
    setSelectedDate(prev => ({ ...prev, [videoId]: randomDate }));
    setSelectedTime(prev => ({ ...prev, [videoId]: randomTime }));
    updateVideoStatus(videoId, 'scheduled', randomDate);
  };

  const publishNow = (videoId: string) => {
    updateVideoStatus(videoId, 'published');
  };

  const saveToLibrary = (videoId: string) => {
    updateVideoStatus(videoId, 'saved');
  };

  const getStatusText = (video: any) => {
    if (video.status === 'scheduled' && video.scheduledDate) {
      return `Programado para ${formatDate(video.scheduledDate)} ${video.scheduledTime}`;
    }
    return STATUS_CONFIG[video.status].description;
  };

  // Obtener colores del BrandKit para los previews
  const brandColors = React.useMemo(() => {
    if (brandKit?.colors) {
      const colors = [];
      if (brandKit.colors.primary) {
        brandKit.colors.primary.forEach((hex, index) => {
          colors.push({ name: `Primario ${index + 1}`, hex });
        });
      }
      if (brandKit.colors.secondary) {
        brandKit.colors.secondary.forEach((hex, index) => {
          colors.push({ name: `Secundario ${index + 1}`, hex });
        });
      }
      return colors.length > 0 ? colors : [
        { name: 'Primario', hex: '#E91E63' },
        { name: 'Secundario', hex: '#9C27B0' }
      ];
    }
    return [
      { name: 'Primario', hex: '#E91E63' },
      { name: 'Secundario', hex: '#9C27B0' }
    ];
  }, [brandKit?.colors]);

  // Obtener eventos para el mini calendario
  const calendarEvents = videos.filter(v => v.status === 'scheduled' && v.scheduledDate)
    .map(v => ({
      date: v.scheduledDate!,
      time: v.scheduledTime,
      title: v.title
    }));

  return (
    <div className="h-full bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="h-full p-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Publicación de Shorts/Reels</h2>
              <Badge variant="secondary" className="text-sm">
                Paso 6 de 6
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {videos.filter(v => v.status !== 'pending').length} de {videos.length} videos procesados
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Videos Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {videos.map((video, index) => {
              const StatusIcon = STATUS_CONFIG[video.status].icon;
              
              return (
                <Card key={video.id} className="p-4 space-y-4 shadow-sm">
                  {/* Video Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-lg">
                      {video.title} — {video.duration}s
                    </h3>
                    <Badge className={STATUS_CONFIG[video.status].badgeClass}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {STATUS_CONFIG[video.status].label}
                    </Badge>
                  </div>

                  {/* Video Preview */}
                  <div className="flex justify-center">
                    <div 
                      className="border border-gray-300 rounded-lg p-6 flex items-center justify-center shadow-sm"
                      style={{ 
                        width: '200px', 
                        height: '360px',
                        backgroundImage: `linear-gradient(135deg, ${brandColors[index]?.hex || '#E91E63'}, ${brandColors[index + 1]?.hex || '#9C27B0'})`
                      }}
                    >
                      <div className="text-center text-white">
                        <Smartphone className="w-12 h-12 mx-auto mb-2" />
                        <div className="text-sm font-medium">Preview 9:16</div>
                        <div className="text-xs opacity-75">{video.duration}s</div>
                      </div>
                    </div>
                  </div>

                  {/* Caption Final */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Caption final</Label>
                    <div className="p-3 bg-gray-50 rounded-lg border text-sm">
                      {video.caption}
                    </div>
                  </div>

                  {/* Schedule Options */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Opciones de publicación</Label>
                    
                    {/* Manual Schedule */}
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-40 justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate[video.id] ? (
                              formatDate(selectedDate[video.id]!)
                            ) : (
                              "Seleccionar fecha"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate[video.id]}
                            onSelect={(date) => setSelectedDate(prev => ({ ...prev, [video.id]: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Input
                        type="time"
                        value={selectedTime[video.id] || '18:00'}
                        onChange={(e) => setSelectedTime(prev => ({ ...prev, [video.id]: e.target.value }))}
                        className="w-32"
                      />
                      
                      <Button 
                        size="sm"
                        onClick={() => scheduleVideo(video.id)}
                        disabled={!selectedDate[video.id]}
                      >
                        Programar
                      </Button>
                    </div>

                    {/* AI Schedule */}
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => scheduleWithAI(video.id)}
                      className="w-full"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      📊 Programar con IA
                      <span className="ml-2 text-xs opacity-70">IA sugiere fecha/hora óptima</span>
                    </Button>
                  </div>

                  {/* Status Row */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {getStatusText(video)}
                    </span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm"
                      onClick={() => publishNow(video.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Publicar ahora
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => saveToLibrary(video.id)}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Guardar en Biblioteca
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Vista rápida de agenda */}
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Vista rápida de agenda
              </h3>
              
              {calendarEvents.length > 0 ? (
                <div className="space-y-2">
                  {calendarEvents.map((event, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateLong(event.date)} a las {event.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay videos programados aún</p>
                  <p className="text-xs">Programa tus videos para verlos aquí</p>
                </div>
              )}
              
              {calendarEvents.length > 0 && (
                <div className="pt-2 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Ver calendario completo
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={onPrevious}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          
          <div className="flex items-center gap-4">
            {!canFinish && (
              <span className="text-sm text-muted-foreground">
                Programa, publica o guarda al menos un video para finalizar
              </span>
            )}
            <Button 
              onClick={onNext}
              disabled={!canFinish}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}