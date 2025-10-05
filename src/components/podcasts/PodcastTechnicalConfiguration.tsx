import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  ArrowLeft, 
  ArrowRight, 
  Music, 
  Settings, 
  Clock, 
  Headphones,
  TriangleAlert
} from "lucide-react";

interface TechnicalConfig {
  audioFormat: 'MP3' | 'WAV' | 'AAC';
  bitrate: string;
  sampleRate: string;
  duration: number;
  platforms: string[];
  versions: number;
}

export function PodcastTechnicalConfiguration() {
  const [config, setConfig] = useState<TechnicalConfig>({
    audioFormat: 'MP3',
    bitrate: '192 kbps',
    sampleRate: '44.1 kHz',
    duration: 30,
    platforms: ['Spotify'],
    versions: 1
  });

  const audioFormats = [
    { value: 'MP3', label: 'MP3' },
    { value: 'WAV', label: 'WAV' },
    { value: 'AAC', label: 'AAC' }
  ];

  const platforms = [
    { value: 'Spotify', label: 'Spotify', icon: '🎵' },
    { value: 'Apple Podcasts', label: 'Apple Podcasts', icon: '🍎' },
    { value: 'YouTube', label: 'YouTube', icon: '📺' },
    { value: 'RSS propio', label: 'RSS propio', icon: '📡' }
  ];

  const bitrateOptions = ['128 kbps', '192 kbps', '256 kbps', '320 kbps'];
  const sampleRateOptions = ['44.1 kHz', '48 kHz', '96 kHz'];

  const updateConfig = (field: keyof TechnicalConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const togglePlatform = (platform: string) => {
    const isSelected = config.platforms.includes(platform);
    if (isSelected) {
      updateConfig('platforms', config.platforms.filter(p => p !== platform));
    } else {
      updateConfig('platforms', [...config.platforms, platform]);
    }
  };

  const handleDurationChange = (value: number[]) => {
    updateConfig('duration', value[0]);
  };

  const handleVersionsChange = (value: number[]) => {
    updateConfig('versions', value[0]);
  };

  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-medium">Configuración técnica del Podcast</h1>
            <Badge variant="secondary" className="text-xs">Paso 2 de 5</Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <Button className="text-sm">
              Siguiente: Guion de entrevista
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Formato de audio */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Music className="w-4 h-4" />
              Formato de audio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {audioFormats.map((format) => (
                <Button
                  key={format.value}
                  variant={config.audioFormat === format.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateConfig('audioFormat', format.value)}
                  className="rounded-xl px-3 py-1.5"
                >
                  {format.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calidad */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Calidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-2 block">Bitrate</label>
                <Select value={config.bitrate} onValueChange={(value) => updateConfig('bitrate', value)}>
                  <SelectTrigger className="bg-gray-50 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bitrateOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-xs font-medium mb-2 block">Sample rate</label>
                <Select value={config.sampleRate} onValueChange={(value) => updateConfig('sampleRate', value)}>
                  <SelectTrigger className="bg-gray-50 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleRateOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duración */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Duración final estimada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-3 block">
                  Duración (minutos): {config.duration}
                </label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[config.duration]}
                    onValueChange={handleDurationChange}
                    min={10}
                    max={120}
                    step={5}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={config.duration}
                    onChange={(e) => updateConfig('duration', parseInt(e.target.value) || 30)}
                    min={10}
                    max={120}
                    className="w-20 text-center"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>10 min</span>
                  <span>120 min</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plataformas */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              Plataformas de publicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {platforms.map((platform) => {
                const isSelected = config.platforms.includes(platform.value);
                return (
                  <Button
                    key={platform.value}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePlatform(platform.value)}
                    className="rounded-xl px-3 py-1.5 flex items-center gap-2"
                  >
                    <span className="text-sm">{platform.icon}</span>
                    {platform.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Versiones */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm">Cantidad de versiones a generar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-3 block">
                  Variaciones: {config.versions}
                </label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[config.versions]}
                    onValueChange={handleVersionsChange}
                    min={1}
                    max={3}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={config.versions}
                    onChange={(e) => updateConfig('versions', parseInt(e.target.value) || 1)}
                    min={1}
                    max={3}
                    className="w-20 text-center"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>1 versión</span>
                  <span>3 versiones</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validación previa */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <TriangleAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-800">
              <strong>Validación previa:</strong> el logo y branding deben estar presentes en la portada del podcast antes de exportar.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" className="text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <Button className="text-sm">
            Siguiente: Guion de entrevista
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Debug info */}
        <Card className="mt-6 bg-slate-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs text-slate-600">Configuración actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-600 space-y-1">
              <p><strong>Formato:</strong> {config.audioFormat}</p>
              <p><strong>Calidad:</strong> {config.bitrate} / {config.sampleRate}</p>
              <p><strong>Duración:</strong> {config.duration} minutos</p>
              <p><strong>Plataformas:</strong> {config.platforms.join(', ') || 'Ninguna'}</p>
              <p><strong>Versiones:</strong> {config.versions}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}