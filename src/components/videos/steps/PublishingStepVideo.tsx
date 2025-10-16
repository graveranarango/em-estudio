import { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Calendar } from "../../ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Checkbox } from "../../ui/checkbox";
import { useBrandKit } from "../../../contexts/BrandKitContext";
import { useVideoProject } from "../../../contexts/VideoProjectContext";
import { VideoPlatform, VideoPublishingPlatform, VIDEO_PLATFORM_FORMATS } from "../../../types/videos";
import { 
  Send, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle,
  Video, 
  Play, 
  Tv,
  Smartphone,
  Eye,
  Save,
  Zap,
  RefreshCw,
  Upload,
  Image as ImageIcon
} from "lucide-react";

const PLATFORM_ICONS = {
  tiktok: Video,
  instagram: Smartphone,
  youtube: Play,
  linkedin: Tv,
  twitter: Tv
};

const PLATFORM_COLORS = {
  tiktok: 'from-black to-gray-800',
  instagram: 'from-pink-500 to-purple-600',
  youtube: 'from-red-500 to-red-600',
  linkedin: 'from-blue-700 to-blue-800',
  twitter: 'from-sky-400 to-sky-600'
};

const PLATFORM_NAMES = {
  tiktok: 'TikTok',
  instagram: 'Instagram Reels',
  youtube: 'YouTube Shorts',
  linkedin: 'LinkedIn Video',
  twitter: 'X Video'
};

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Público', description: 'Visible para todos' },
  { value: 'unlisted', label: 'No listado', description: 'Solo con enlace' },
  { value: 'private', label: 'Privado', description: 'Solo para ti' }
];

export function PublishingStepVideo() {
  const { hasBrandKit } = useBrandKit();
  const { currentProject, updateProject, saveProject } = useVideoProject();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [publishingNotes, setPublishingNotes] = useState('');
  const [customThumbnail, setCustomThumbnail] = useState('');
  const [publishingPlatforms, setPublishingPlatforms] = useState<VideoPublishingPlatform[]>([
    {
      platform: currentProject?.briefing.platform || 'instagram',
      status: 'pending',
      customCaption: currentProject?.copywriting.caption || '',
      customHashtags: currentProject?.copywriting.hashtags || [],
      customTitle: currentProject?.copywriting.title || '',
      visibility: 'public'
    }
  ]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [publishingMode, setPublishingMode] = useState<'now' | 'schedule' | 'draft'>('schedule');

  const briefing = currentProject?.briefing;
  const selectedScenes = currentProject?.scenes.filter(s => currentProject.selectedSceneIds.includes(s.id)) || [];
  const totalDuration = selectedScenes.reduce((total, scene) => total + scene.duration, 0);
  const projectCaption = currentProject?.copywriting.caption || '';
  const projectHashtags = currentProject?.copywriting.hashtags || [];
  const projectTitle = currentProject?.copywriting.title || '';
  const projectCTA = currentProject?.copywriting.callToAction || '';

  const availablePlatforms: VideoPlatform[] = ['tiktok', 'instagram', 'youtube', 'linkedin', 'twitter'];

  const handlePlatformToggle = (platform: VideoPlatform) => {
    const exists = publishingPlatforms.find(p => p.platform === platform);
    
    if (exists) {
      setPublishingPlatforms(publishingPlatforms.filter(p => p.platform !== platform));
    } else {
      setPublishingPlatforms([
        ...publishingPlatforms,
        {
          platform,
          status: 'pending',
          customCaption: projectCaption,
          customHashtags: [...projectHashtags],
          customTitle: projectTitle,
          visibility: 'public'
        }
      ]);
    }
  };

  const updatePlatformProperty = (platform: VideoPlatform, property: string, value: any) => {
    setPublishingPlatforms(platforms =>
      platforms.map(p =>
        p.platform === platform
          ? { ...p, [property]: value }
          : p
      )
    );
  };

  const handleScheduleVideo = async () => {
    if (!currentProject) return;

    setIsScheduling(true);

    try {
      const scheduledDate = publishingMode === 'schedule' 
        ? new Date(`${selectedDate.toDateString()} ${selectedTime}`)
        : publishingMode === 'now'
          ? new Date()
          : undefined;

      // Actualizar proyecto con información de publicación
      updateProject({
        publishing: {
          scheduledDate,
          platforms: publishingPlatforms,
          status: publishingMode === 'draft' ? 'draft' : 'scheduled',
          publishingNotes,
          thumbnailCustom: customThumbnail
        },
        status: publishingMode === 'draft' ? 'finalizing' : 'scheduled'
      });

      // Guardar proyecto
      await saveProject();

      // Simular proceso de programación
      setTimeout(() => {
        setIsScheduling(false);
        
        // Actualizar estado de las plataformas
        setPublishingPlatforms(platforms =>
          platforms.map(p => ({
            ...p,
            status: publishingMode === 'now' ? 'published' : 'scheduled',
            postTime: scheduledDate
          }))
        );

      }, 3000);

    } catch (error) {
      console.error('Error scheduling video:', error);
      setIsScheduling(false);
    }
  };

  const getFullVideoDescription = (platform: VideoPublishingPlatform) => {
    const title = platform.customTitle || projectTitle;
    const caption = platform.customCaption || projectCaption;
    const hashtags = platform.customHashtags || projectHashtags;
    const cta = projectCTA;
    
    return `${title ? `${title}\n\n` : ''}${caption}\n\n${cta}\n\n${hashtags.join(' ')}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const canPublish = publishingPlatforms.length > 0 && 
    (publishingMode !== 'schedule' || (selectedDate && selectedTime));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 text-white">
            <Send className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Publicación del Video</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Programa tu video para publicarse automáticamente en las plataformas seleccionadas
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Scheduling Settings */}
        <Card className="xl:col-span-2 p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Programación
            </h3>

            {/* Publishing Mode */}
            <div className="space-y-3">
              <label className="text-sm font-medium">¿Cuándo quieres publicar?</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card 
                  className={`p-4 cursor-pointer transition-all ${
                    publishingMode === 'now' 
                      ? 'ring-2 ring-green-500 bg-green-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setPublishingMode('now')}
                >
                  <div className="text-center space-y-2">
                    <Zap className="w-6 h-6 mx-auto text-green-600" />
                    <h4 className="font-medium">Ahora</h4>
                    <p className="text-xs text-muted-foreground">Publicar inmediatamente</p>
                  </div>
                </Card>

                <Card 
                  className={`p-4 cursor-pointer transition-all ${
                    publishingMode === 'schedule' 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setPublishingMode('schedule')}
                >
                  <div className="text-center space-y-2">
                    <Clock className="w-6 h-6 mx-auto text-blue-600" />
                    <h4 className="font-medium">Programar</h4>
                    <p className="text-xs text-muted-foreground">Elegir fecha y hora</p>
                  </div>
                </Card>

                <Card 
                  className={`p-4 cursor-pointer transition-all ${
                    publishingMode === 'draft' 
                      ? 'ring-2 ring-gray-500 bg-gray-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setPublishingMode('draft')}
                >
                  <div className="text-center space-y-2">
                    <Save className="w-6 h-6 mx-auto text-gray-600" />
                    <h4 className="font-medium">Borrador</h4>
                    <p className="text-xs text-muted-foreground">Guardar para después</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Date & Time Selection */}
            {publishingMode === 'schedule' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha</label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hora</label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                              {`${hour}:00`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Resumen de programación</h4>
                    <p className="text-sm text-blue-700">
                      Se publicará el{' '}
                      <strong>
                        {selectedDate.toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </strong>
                      {' '}a las <strong>{selectedTime}</strong>
                    </p>
                  </div>

                  {/* Optimal time suggestions */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Horarios recomendados</label>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>🎵 TikTok: 09:00 - 12:00, 19:00 - 22:00</p>
                      <p>📱 Instagram: 11:00 - 13:00, 19:00 - 21:00</p>
                      <p>📺 YouTube: 14:00 - 16:00, 20:00 - 22:00</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Platform Selection & Customization */}
            <div className="space-y-4">
              <h4 className="font-medium">Plataformas de publicación</h4>
              
              <div className="space-y-4">
                {availablePlatforms.map(platform => {
                  const Icon = PLATFORM_ICONS[platform];
                  const isSelected = publishingPlatforms.some(p => p.platform === platform);
                  const platformData = publishingPlatforms.find(p => p.platform === platform);
                  const format = VIDEO_PLATFORM_FORMATS[platform];
                  
                  return (
                    <Card 
                      key={platform} 
                      className={`p-4 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                    >
                      <div className="space-y-4">
                        {/* Platform Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handlePlatformToggle(platform)}
                            />
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${PLATFORM_COLORS[platform]} text-white`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="font-medium">{PLATFORM_NAMES[platform]}</h5>
                              <p className="text-xs text-muted-foreground">
                                {format.ratio} • Max {formatDuration(format.maxDuration)}
                              </p>
                            </div>
                          </div>
                          
                          {platformData?.status && (
                            <Badge 
                              className={
                                platformData.status === 'published' ? 'bg-green-100 text-green-800' :
                                platformData.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {platformData.status === 'published' ? 'Publicado' :
                               platformData.status === 'scheduled' ? 'Programado' :
                               'Pendiente'}
                            </Badge>
                          )}
                        </div>

                        {/* Platform Customization */}
                        {isSelected && platformData && (
                          <div className="space-y-3 pl-10">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Título (opcional)</label>
                              <Input
                                placeholder={`Título específico para ${PLATFORM_NAMES[platform]}...`}
                                value={platformData.customTitle}
                                onChange={(e) => updatePlatformProperty(platform, 'customTitle', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Descripción personalizada</label>
                              <Textarea
                                placeholder={`Descripción específica para ${PLATFORM_NAMES[platform]}...`}
                                value={platformData.customCaption}
                                onChange={(e) => updatePlatformProperty(platform, 'customCaption', e.target.value)}
                                className="min-h-[80px]"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Hashtags personalizados</label>
                              <Input
                                placeholder="Hashtags separados por espacios..."
                                value={platformData.customHashtags?.join(' ') || ''}
                                onChange={(e) => updatePlatformProperty(
                                  platform, 
                                  'customHashtags', 
                                  e.target.value.split(' ').filter(h => h.trim())
                                )}
                              />
                            </div>

                            {/* Visibility for platforms that support it */}
                            {(platform === 'youtube' || platform === 'linkedin') && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Visibilidad</label>
                                <Select 
                                  value={platformData.visibility || 'public'} 
                                  onValueChange={(value) => updatePlatformProperty(platform, 'visibility', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {VISIBILITY_OPTIONS.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        <div>
                                          <p className="font-medium">{option.label}</p>
                                          <p className="text-xs text-muted-foreground">{option.description}</p>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Preview */}
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Eye className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium">Preview para {PLATFORM_NAMES[platform]}</span>
                              </div>
                              <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                                {getFullVideoDescription(platformData)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Custom Thumbnail */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Thumbnail personalizado (opcional)</label>
              <div className="flex gap-2">
                <Input
                  placeholder="URL de imagen para thumbnail..."
                  value={customThumbnail}
                  onChange={(e) => setCustomThumbnail(e.target.value)}
                />
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir
                </Button>
              </div>
            </div>

            {/* Publishing Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas adicionales (opcional)</label>
              <Textarea
                placeholder="Notas internas sobre esta publicación..."
                value={publishingNotes}
                onChange={(e) => setPublishingNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </Card>

        {/* Preview & Summary */}
        <Card className="p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Resumen Final</h3>

            {/* Video Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Video</label>
              <div className="relative">
                <div className="w-full aspect-[9/16] bg-gray-900 rounded-lg flex items-center justify-center border">
                  {selectedScenes.length > 0 ? (
                    <div className="text-center text-white">
                      <Video className="w-12 h-12 mx-auto mb-4 opacity-70" />
                      <p className="text-sm font-medium">{briefing?.videoType} - {formatDuration(totalDuration)}</p>
                      <p className="text-xs opacity-70">{selectedScenes.length} escenas</p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Sin escenas seleccionadas</p>
                    </div>
                  )}
                </div>
                
                {hasBrandKit && (
                  <Badge className="absolute top-2 right-2 bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    BrandKit aplicado
                  </Badge>
                )}
              </div>
            </div>

            {/* Content Summary */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Contenido</label>
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                {projectTitle && (
                  <div>
                    <p className="text-xs text-gray-600">Título:</p>
                    <p className="text-sm font-medium">{projectTitle}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-600">Descripción:</p>
                  <p className="text-sm">{projectCaption.substring(0, 100)}...</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Hashtags:</p>
                  <p className="text-sm text-blue-600">{projectHashtags.slice(0, 5).join(' ')}</p>
                </div>
                {projectCTA && (
                  <div>
                    <p className="text-xs text-gray-600">CTA:</p>
                    <p className="text-sm">{projectCTA}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Publishing Info */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Publicación</label>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Modo:</span>
                  <Badge variant="outline">
                    {publishingMode === 'now' ? 'Inmediato' : 
                     publishingMode === 'schedule' ? 'Programado' : 'Borrador'}
                  </Badge>
                </div>
                
                {publishingMode === 'schedule' && (
                  <div className="flex justify-between text-sm">
                    <span>Fecha:</span>
                    <span>{selectedDate.toLocaleDateString()} {selectedTime}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span>Plataformas:</span>
                  <span>{publishingPlatforms.length}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Duración:</span>
                  <span>{formatDuration(totalDuration)}</span>
                </div>
              </div>
            </div>

            {/* Selected Platforms */}
            {publishingPlatforms.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Plataformas seleccionadas</label>
                <div className="space-y-1">
                  {publishingPlatforms.map(platform => {
                    const Icon = PLATFORM_ICONS[platform.platform];
                    return (
                      <div key={platform.platform} className="flex items-center gap-2 text-sm">
                        <Icon className="w-4 h-4" />
                        <span>{PLATFORM_NAMES[platform.platform]}</span>
                        <Badge variant="outline" className="ml-auto">
                          {platform.status === 'published' ? 'Publicado' :
                           platform.status === 'scheduled' ? 'Programado' : 'Pendiente'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          ← Volver a Copywriting
        </Button>
        
        <Button 
          onClick={handleScheduleVideo}
          disabled={!canPublish || isScheduling}
          className="bg-red-500 hover:bg-red-600"
        >
          {isScheduling ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {publishingMode === 'now' ? 'Publicar Ahora' :
               publishingMode === 'schedule' ? 'Programar Video' :
               'Guardar como Borrador'}
            </>
          )}
        </Button>
      </div>

      {!canPublish && (
        <p className="text-xs text-muted-foreground text-center">
          Selecciona al menos una plataforma y completa la configuración para continuar
        </p>
      )}

      {/* Success State */}
      {isScheduling && (
        <Card className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <Video className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold">
              {publishingMode === 'now' ? 'Publicando video...' :
               publishingMode === 'schedule' ? 'Programando video...' :
               'Guardando borrador...'}
            </h3>
            <p className="text-muted-foreground">
              Tu video se está procesando con el BrandKit aplicado
            </p>
            <div className="flex justify-center gap-2 text-sm text-gray-600">
              <span>📱 {publishingPlatforms.length} plataformas</span>
              <span>•</span>
              <span>⏱️ {formatDuration(totalDuration)}</span>
              <span>•</span>
              <span>🎬 {selectedScenes.length} escenas</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}