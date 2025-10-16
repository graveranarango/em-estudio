import React, { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Slider } from "../../ui/slider";
import { useBrandKit } from "../../../contexts/BrandKitContext";
import { useVideoProject } from "../../../contexts/VideoProjectContext";

import { 
  ArrowLeft,
  ArrowRight,
  Youtube,
  Instagram,
  Linkedin,
  Video,
  AlertTriangle,
  Monitor,
  Smartphone,
  Square
} from "lucide-react";

interface ConfigurationStepVideoFlowProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

interface Platform {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  aspectRatio: string;
  dimensions: { width: number; height: number };
}

interface VisualStyle {
  id: string;
  label: string;
  description: string;
}

const PLATFORMS: Platform[] = [
  {
    id: 'youtube',
    label: 'YouTube',
    icon: Youtube,
    aspectRatio: '16:9',
    dimensions: { width: 200, height: 112 }
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: Video,
    aspectRatio: '9:16',
    dimensions: { width: 112, height: 200 }
  },
  {
    id: 'instagram',
    label: 'Instagram Reels',
    icon: Instagram,
    aspectRatio: '9:16',
    dimensions: { width: 112, height: 200 }
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    aspectRatio: '16:9',
    dimensions: { width: 200, height: 112 }
  }
];

const VISUAL_STYLES: VisualStyle[] = [
  {
    id: 'cinematic',
    label: 'Cinemático',
    description: 'Transiciones suaves, colores ricos, composición cuidada'
  },
  {
    id: 'educational',
    label: 'Educativo',
    description: 'Elementos gráficos claros, tipografía legible, estructura ordenada'
  },
  {
    id: 'inspirational',
    label: 'Inspirador',
    description: 'Imágenes motivacionales, música emotiva, mensajes positivos'
  },
  {
    id: 'corporate',
    label: 'Corporativo',
    description: 'Estilo profesional, colores de marca, presentación formal'
  },
  {
    id: 'humorous',
    label: 'Humorístico',
    description: 'Elementos divertidos, timing cómico, tono relajado'
  }
];

export function ConfigurationStepVideoFlow({ onNext, onPrevious }: ConfigurationStepVideoFlowProps) {
  const { brandKit } = useBrandKit();
  const { currentProject, updateBriefing } = useVideoProject();
  
  const [selectedPlatform, setSelectedPlatform] = useState<string>('youtube');
  const [duration, setDuration] = useState<number[]>([3]);
  const [selectedStyle, setSelectedStyle] = useState<string>('educational');
  const [versionsCount, setVersionsCount] = useState<number[]>([1]);

  const currentPlatform = PLATFORMS.find(p => p.id === selectedPlatform) || PLATFORMS[0];
  const currentStyle = VISUAL_STYLES.find(s => s.id === selectedStyle) || VISUAL_STYLES[0];

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const handleNext = () => {
    // Update project context with configuration
    updateBriefing({
      platform: selectedPlatform as any,
      duration: {
        target: duration[0] * 60, // Convert to seconds
        min: Math.max(1, duration[0] - 1) * 60,
        max: (duration[0] + 1) * 60,
        label: `${duration[0]} min`
      },
      style: selectedStyle as any
    });
    
    onNext?.();
  };

  const canProceed = selectedPlatform && selectedStyle && duration[0] > 0;

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="h-full overflow-auto">
        <div className="max-w-4xl mx-auto p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Configuración de Video con Flow</h1>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Paso 2 de 7
            </Badge>
          </div>

          {/* Platform & Format */}
          <Card className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Plataforma & Formato
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Plataforma</Label>
                  <div className="flex flex-wrap gap-3">
                    {PLATFORMS.map((platform) => {
                      const Icon = platform.icon;
                      const isSelected = selectedPlatform === platform.id;
                      
                      return (
                        <button
                          key={platform.id}
                          onClick={() => handlePlatformSelect(platform.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{platform.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Relación de aspecto</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600">
                      {currentPlatform.aspectRatio} - Dependiente de la plataforma elegida
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Preview {currentPlatform.aspectRatio}</Label>
                  <div className="flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
                    <div 
                      className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-400 shadow-sm"
                      style={{
                        width: currentPlatform.dimensions.width,
                        height: currentPlatform.dimensions.height
                      }}
                    >
                      <div className="text-center text-gray-500 text-sm">
                        <Video className="w-6 h-6 mx-auto mb-1" />
                        <div className="font-medium">{currentPlatform.aspectRatio}</div>
                        <div className="text-xs text-gray-400">
                          {currentPlatform.dimensions.width}×{currentPlatform.dimensions.height}px
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Duration */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Video className="w-5 h-5" />
                Duración
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Duración exacta (minutos): {duration[0]} min
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={duration}
                        onValueChange={setDuration}
                        min={1}
                        max={10}
                        step={0.5}
                        className="w-full"
                      />
                    </div>
                    <Input
                      type="number"
                      value={duration[0]}
                      onChange={(e) => setDuration([Math.max(1, Math.min(10, parseFloat(e.target.value) || 1))])}
                      min={1}
                      max={10}
                      step={0.5}
                      className="w-20 text-center"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    💡 La IA puede sugerir cortes para ajustarse a la duración elegida.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Visual Style */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Estilo visual
              </h3>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {VISUAL_STYLES.map((style) => {
                    const isSelected = selectedStyle === style.id;
                    
                    return (
                      <button
                        key={style.id}
                        onClick={() => handleStyleSelect(style.id)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {style.label}
                      </button>
                    );
                  })}
                </div>

                {currentStyle && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800">
                      <strong>{currentStyle.label}:</strong> {currentStyle.description}
                    </p>
                  </div>
                )}

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    ✨ Cada estilo aplicará colores, fuentes y ritmos visuales basados en BrandKit.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Versions Count */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Cantidad de versiones</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Número de variaciones narrativas: {versionsCount[0]}
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={versionsCount}
                        onValueChange={setVersionsCount}
                        min={1}
                        max={3}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <Input
                      type="number"
                      value={versionsCount[0]}
                      onChange={(e) => setVersionsCount([Math.max(1, Math.min(3, parseInt(e.target.value) || 1))])}
                      min={1}
                      max={3}
                      className="w-20 text-center"
                    />
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {versionsCount[0] === 1 && "Una versión única optimizada para la plataforma seleccionada."}
                    {versionsCount[0] === 2 && "Dos variaciones con enfoques narrativos diferentes."}
                    {versionsCount[0] === 3 && "Tres versiones con estructuras y tonos diversos para máxima flexibilidad."}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* BrandKit Validation Notice */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>Validación BrandKit:</strong> Todo el contenido se validará contra BrandKit antes de exportar.
                </p>
                {brandKit && (
                  <p className="text-xs text-yellow-700 mt-1">
                    Se aplicarán automáticamente: colores primarios, tipografías, logos y tono de voz de "{brandKit.meta.brandName}".
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button 
              variant="ghost" 
              onClick={onPrevious}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
            >
              Siguiente: Storyboard / Flow narrativo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Configuration Summary (Hidden but available for debugging) */}
          <div className="hidden">
            <Card className="p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Configuración actual:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Plataforma: {currentPlatform.label} ({currentPlatform.aspectRatio})</p>
                <p>Duración: {duration[0]} minutos</p>
                <p>Estilo: {currentStyle.label}</p>
                <p>Versiones: {versionsCount[0]}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}