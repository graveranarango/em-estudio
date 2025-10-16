import React, { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Switch } from "../../ui/switch";
import { Separator } from "../../ui/separator";
import { useBrandKit } from "../../../contexts/BrandKitContext";
import { useVideoProject } from "../../../contexts/VideoProjectContext";

import { 
  ArrowLeft,
  ArrowRight,
  Smartphone,
  RefreshCw,
  Hash,
  CheckCircle,
  AlertTriangle,
  X,
  Plus
} from "lucide-react";

interface CaptionsStepShortProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

// Mock data para los videos generados
const MOCK_VIDEOS = [
  {
    id: 'video-1',
    title: 'Reel 1',
    duration: 30,
    caption: 'Descubre nuestra nueva promo 🚀. Ahorra y envía hoy mismo. #Envíos #Promo',
    hashtags: ['#Envíos', '#Promo', '#TuMarca'],
    validation: {
      status: 'success' as const,
      message: 'Cumple BrandGuard',
      details: 'Caption breve y válido.'
    },
    allowEmojis: true,
    confirmed: false
  },
  {
    id: 'video-2', 
    title: 'Short 2',
    duration: 20,
    caption: 'Un vistazo rápido a nuestra oferta ✨ #Descuento #Short',
    hashtags: ['#Descuento', '#Short'],
    validation: {
      status: 'warning' as const,
      message: 'Ajustar',
      details: 'Texto demasiado largo para TikTok.'
    },
    allowEmojis: true,
    confirmed: false
  }
];

export function CaptionsStepShort({ onNext, onPrevious }: CaptionsStepShortProps) {
  const { brandKit } = useBrandKit();
  const { currentProject } = useVideoProject();
  
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const [newHashtag, setNewHashtag] = useState<{ [key: string]: string }>({});

  // Determinar si se puede continuar (al menos un video confirmado)
  const canContinue = videos.some(video => video.confirmed);

  const updateVideoCaption = (videoId: string, caption: string) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, caption, confirmed: false }
        : video
    ));
  };

  const removeHashtag = (videoId: string, hashtag: string) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { 
            ...video, 
            hashtags: video.hashtags.filter(h => h !== hashtag),
            confirmed: false
          }
        : video
    ));
  };

  const addHashtag = (videoId: string) => {
    const hashtag = newHashtag[videoId]?.trim();
    if (!hashtag) return;

    const formattedHashtag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { 
            ...video, 
            hashtags: [...video.hashtags, formattedHashtag],
            confirmed: false
          }
        : video
    ));
    
    setNewHashtag(prev => ({ ...prev, [videoId]: '' }));
  };

  const toggleEmojis = (videoId: string, allowEmojis: boolean) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, allowEmojis, confirmed: false }
        : video
    ));
  };

  const regenerateCaption = (videoId: string) => {
    // Simular regeneración de caption con IA
    const mockCaptions = [
      'Nueva propuesta de contenido 🎯 Perfecto para tu marca. #Contenido #Marketing',
      '¡Descubre lo que tenemos para ti! ✨ No te lo pierdas. #Novedad #Especial',
      'Contenido que marca la diferencia 🚀 Únete a nosotros. #Diferencia #Marca'
    ];
    
    const newCaption = mockCaptions[Math.floor(Math.random() * mockCaptions.length)];
    updateVideoCaption(videoId, newCaption);
  };

  const suggestHashtags = (videoId: string) => {
    // Simular sugerencia de hashtags con IA
    const mockHashtags = ['#Trending', '#Viral', '#Engagement', '#Social', '#Content'];
    const randomHashtags = mockHashtags
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { 
            ...video, 
            hashtags: [...video.hashtags, ...randomHashtags.filter(h => !video.hashtags.includes(h))],
            confirmed: false
          }
        : video
    ));
  };

  const confirmVideo = (videoId: string) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, confirmed: true }
        : video
    ));
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

  return (
    <div className="h-full bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="h-full p-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Captions & Hashtags</h2>
              <Badge variant="secondary" className="text-sm">
                Paso 5 de 6
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {videos.filter(v => v.confirmed).length} de {videos.length} videos confirmados
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {videos.map((video, index) => (
            <Card key={video.id} className="p-4 space-y-4 shadow-sm relative">
              {/* Video Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg">
                  {video.title} — {video.duration}s
                </h3>
                {video.confirmed && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Confirmado
                  </Badge>
                )}
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

              {/* Caption Area */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Caption generado por IA</Label>
                <Textarea
                  value={video.caption}
                  onChange={(e) => updateVideoCaption(video.id, e.target.value)}
                  placeholder="Escribe el caption para este video..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Hashtags */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Hashtags</Label>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-lg bg-gray-50">
                  {video.hashtags.map((hashtag, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                    >
                      <span>{hashtag}</span>
                      <button
                        onClick={() => removeHashtag(video.id, hashtag)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Add hashtag input */}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newHashtag[video.id] || ''}
                      onChange={(e) => setNewHashtag(prev => ({ ...prev, [video.id]: e.target.value }))}
                      placeholder="#nuevo"
                      className="bg-transparent text-xs border-none outline-none w-16 min-w-16"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addHashtag(video.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => addHashtag(video.id)}
                      className="hover:bg-gray-200 rounded-full p-0.5"
                      disabled={!newHashtag[video.id]?.trim()}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Validation Row */}
              <div className="flex items-center gap-3">
                <Badge 
                  variant={video.validation.status === 'success' ? 'default' : 'destructive'}
                  className={
                    video.validation.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }
                >
                  {video.validation.status === 'success' ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 mr-1" />
                  )}
                  {video.validation.message}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {video.validation.details}
                </span>
              </div>

              {/* Actions Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => regenerateCaption(video.id)}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Regenerar caption
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => suggestHashtags(video.id)}
                    className="text-xs"
                  >
                    <Hash className="w-3 h-3 mr-1" />
                    Sugerir más hashtags
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Permitir emojis</Label>
                    <Switch 
                      checked={video.allowEmojis}
                      onCheckedChange={(checked) => toggleEmojis(video.id, checked)}
                    />
                  </div>
                  
                  {!video.confirmed && (
                    <Button 
                      size="sm"
                      onClick={() => confirmVideo(video.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Confirmar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
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
            {!canContinue && (
              <span className="text-sm text-muted-foreground">
                Confirma al menos un video para continuar
              </span>
            )}
            <Button 
              onClick={onNext}
              disabled={!canContinue}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
            >
              Siguiente: Publicación
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}