import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { 
  ArrowLeft, 
  ArrowRight,
  Mic,
  Settings,
  Clock,
  Share2,
  Copy,
  Music,
  Youtube,
  Rss,
  Apple,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

interface FormatChip {
  id: string;
  label: string;
  selected: boolean;
}

interface PlatformChip {
  id: string;
  label: string;
  icon: 'spotify' | 'apple' | 'youtube' | 'rss';
  selected: boolean;
}

export function PodcastMonologueConfiguration() {
  const [audioFormats, setAudioFormats] = useState<FormatChip[]>([
    { id: 'mp3', label: 'MP3 (192 kbps)', selected: true },
    { id: 'wav', label: 'WAV (sin compresión)', selected: false },
    { id: 'aac', label: 'AAC (alta calidad)', selected: false }
  ]);

  const [platforms, setPlatforms] = useState<PlatformChip[]>([
    { id: 'spotify', label: 'Spotify', icon: 'spotify', selected: true },
    { id: 'apple', label: 'Apple Podcasts', icon: 'apple', selected: true },
    { id: 'youtube', label: 'YouTube', icon: 'youtube', selected: false },
    { id: 'rss', label: 'RSS propio', icon: 'rss', selected: true }
  ]);

  const [bitrate, setBitrate] = useState('192 kbps');
  const [sampleRate, setSampleRate] = useState('44.1 kHz');
  const [duration, setDuration] = useState([20]);
  const [versions, setVersions] = useState([1]);

  const toggleFormat = (formatId: string) => {
    setAudioFormats(prev => 
      prev.map(format => 
        format.id === formatId 
          ? { ...format, selected: !format.selected }
          : format
      )
    );
  };

  const togglePlatform = (platformId: string) => {
    setPlatforms(prev => 
      prev.map(platform => 
        platform.id === platformId 
          ? { ...platform, selected: !platform.selected }
          : platform
      )
    );
  };

  const getPlatformIcon = (iconType: string) => {
    switch (iconType) {
      case 'spotify':
        return <Music className="w-4 h-4" />;
      case 'apple':
        return <Apple className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'rss':
        return <Rss className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  const hasValidConfiguration = () => {
    const hasFormat = audioFormats.some(f => f.selected);
    const hasPlatform = platforms.some(p => p.selected);
    const hasValidDuration = duration[0] >= 5 && duration[0] <= 90;
    return hasFormat && hasPlatform && hasValidDuration;
  };

  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-medium">Configuración técnica del Podcast (Monólogo)</h1>
              <p className="text-muted-foreground">Paso 2 de 5 - Parámetros de calidad y distribución</p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              Paso 2 de 5
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <Button 
              variant="default"
              disabled={!hasValidConfiguration()}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90"
            >
              Siguiente: Guión del monólogo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Audio Format */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Formato de audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {audioFormats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => toggleFormat(format.id)}
                      className={`px-4 py-3 rounded-xl text-sm transition-all ${
                        format.selected
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quality Settings */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Calidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bitrate</label>
                  <Select value={bitrate} onValueChange={setBitrate}>
                    <SelectTrigger className="bg-gray-50 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="128 kbps">128 kbps</SelectItem>
                      <SelectItem value="192 kbps">192 kbps</SelectItem>
                      <SelectItem value="256 kbps">256 kbps</SelectItem>
                      <SelectItem value="320 kbps">320 kbps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sample rate</label>
                  <Select value={sampleRate} onValueChange={setSampleRate}>
                    <SelectTrigger className="bg-gray-50 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="44.1 kHz">44.1 kHz</SelectItem>
                      <SelectItem value="48 kHz">48 kHz</SelectItem>
                      <SelectItem value="96 kHz">96 kHz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Duration */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Duración final estimada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Duración (minutos)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={duration[0]}
                        onChange={(e) => setDuration([parseInt(e.target.value) || 0])}
                        className="w-20 h-8 text-center"
                        min={5}
                        max={90}
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                  </div>
                  
                  <Slider
                    value={duration}
                    onValueChange={setDuration}
                    min={5}
                    max={90}
                    step={1}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5 min</span>
                    <span>45 min</span>
                    <span>90 min</span>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs text-orange-800">
                    <strong>Recomendación:</strong> Para monólogos, 15-25 minutos suele ser la duración óptima para mantener el engagement.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Platforms */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Plataformas de publicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 text-sm ${
                        platform.selected
                          ? 'border-orange-300 bg-orange-50 text-orange-800'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {getPlatformIcon(platform.icon)}
                      <span className="flex-1 text-left">{platform.label}</span>
                      {platform.selected && (
                        <CheckCircle2 className="w-4 h-4 text-orange-600" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Versions */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Copy className="w-5 h-5" />
                  Cantidad de versiones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Número de variaciones a generar</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={versions[0]}
                        onChange={(e) => setVersions([parseInt(e.target.value) || 1])}
                        className="w-16 h-8 text-center"
                        min={1}
                        max={3}
                      />
                      <span className="text-sm text-muted-foreground">versión{versions[0] > 1 ? 'es' : ''}</span>
                    </div>
                  </div>
                  
                  <Slider
                    value={versions}
                    onValueChange={setVersions}
                    min={1}
                    max={3}
                    step={1}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 versión</span>
                    <span>2 versiones</span>
                    <span>3 versiones</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Tip:</strong> Generar múltiples versiones te permitirá elegir diferentes tonos o enfoques para tu monólogo.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Summary */}
            <Card className="rounded-xl shadow-sm bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Resumen de configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-orange-800">Formato:</p>
                    <p className="text-orange-700">
                      {audioFormats.filter(f => f.selected).map(f => f.label.split(' ')[0]).join(', ') || 'No seleccionado'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-orange-800">Calidad:</p>
                    <p className="text-orange-700">{bitrate} • {sampleRate}</p>
                  </div>
                  <div>
                    <p className="font-medium text-orange-800">Duración:</p>
                    <p className="text-orange-700">{duration[0]} minutos</p>
                  </div>
                  <div>
                    <p className="font-medium text-orange-800">Versiones:</p>
                    <p className="text-orange-700">{versions[0]} variación{versions[0] > 1 ? 'es' : ''}</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-orange-800 mb-1">Plataformas:</p>
                  <p className="text-orange-700 text-sm">
                    {platforms.filter(p => p.selected).map(p => p.label).join(', ') || 'Ninguna seleccionada'}
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Footer Validation */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-800">
                <strong>Validación previa:</strong> la portada debe incluir logo y el CTA debe estar presente antes de exportar.
              </p>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <Button 
              variant="default"
              disabled={!hasValidConfiguration()}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90"
            >
              Siguiente: Guión del monólogo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}