import { useState, useEffect } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Slider } from "../../ui/slider";
import { Label } from "../../ui/label";
import { useBrandKit } from "../../../contexts/BrandKitContext";
import { useVideoProject } from "../../../contexts/VideoProjectContext";
import { 
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Smartphone,
  Clock,
  Palette,
  Copy,
  Lock
} from "lucide-react";

// Plataformas disponibles con sus iconos
const PLATFORMS = [
  { 
    value: 'tiktok', 
    label: 'TikTok',
    icon: '🎵',
    maxDuration: 60,
    recommendedDuration: [15, 30, 60]
  },
  { 
    value: 'instagram', 
    label: 'Instagram Reels',
    icon: '📷',
    maxDuration: 90,
    recommendedDuration: [30, 60, 90]
  },
  { 
    value: 'youtube', 
    label: 'YouTube Shorts',
    icon: '▶️',
    maxDuration: 60,
    recommendedDuration: [15, 30, 60]
  },
  { 
    value: 'facebook', 
    label: 'Facebook Reels',
    icon: '👥',
    maxDuration: 90,
    recommendedDuration: [30, 60, 90]
  }
];

// Estilos visuales disponibles
const VISUAL_STYLES = [
  { value: 'cinematic', label: 'Cinemático' },
  { value: 'dynamic', label: 'Dinámico' },
  { value: 'minimal', label: 'Minimalista' },
  { value: 'corporate', label: 'Corporativo' },
  { value: 'urban', label: 'Urbano' }
];

interface ConfigurationStepShortProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

export function ConfigurationStepShort({ onNext, onPrevious }: ConfigurationStepShortProps) {
  const { hasBrandKit } = useBrandKit();
  const { 
    currentProject, 
    updateBriefing, 
    goToNextStep, 
    goToPreviousStep 
  } = useVideoProject();
  
  // Form state
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [duration, setDuration] = useState([30]);
  const [visualStyle, setVisualStyle] = useState('dynamic');
  const [versions, setVersions] = useState([2]);

  // Load existing data if available
  useEffect(() => {
    if (currentProject?.briefing) {
      const briefing = currentProject.briefing;
      if (briefing.platform) {
        setSelectedPlatforms([briefing.platform]);
      }
      if (briefing.duration?.target) {
        setDuration([briefing.duration.target]);
      }
      if (briefing.style) {
        setVisualStyle(briefing.style);
      }
    }
  }, [currentProject]);

  // Calculate constraints based on selected platforms
  const getConstraints = () => {
    if (selectedPlatforms.length === 0) {
      return { minDuration: 5, maxDuration: 90 };
    }
    
    const selectedPlatformConfigs = PLATFORMS.filter(p => 
      selectedPlatforms.includes(p.value)
    );
    
    const minDuration = 5;
    const maxDuration = Math.min(...selectedPlatformConfigs.map(p => p.maxDuration));
    
    return { minDuration, maxDuration };
  };

  const { minDuration, maxDuration } = getConstraints();

  // Adjust duration if it exceeds new constraints
  useEffect(() => {
    if (duration[0] > maxDuration) {
      setDuration([maxDuration]);
    } else if (duration[0] < minDuration) {
      setDuration([minDuration]);
    }
  }, [maxDuration, minDuration, duration]);

  const handlePlatformToggle = (platformValue: string) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platformValue)) {
        return prev.filter(p => p !== platformValue);
      } else {
        return [...prev, platformValue];
      }
    });
  };

  const handleStyleSelect = (styleValue: string) => {
    setVisualStyle(styleValue);
  };

  const canContinue = selectedPlatforms.length > 0 && duration[0] && visualStyle && versions[0];

  const handleContinue = () => {
    if (!canContinue) return;

    updateBriefing({
      platform: selectedPlatforms[0] as any,
      duration: {
        target: duration[0],
        min: Math.max(minDuration, duration[0] - 10),
        max: Math.min(maxDuration, duration[0] + 15),
        label: `${duration[0]}s`
      },
      style: visualStyle as any,
      // Store additional configuration data
      platforms: selectedPlatforms,
      versions: versions[0]
    });

    onNext ? onNext() : goToNextStep();
  };

  const handleGoBack = () => {
    onPrevious ? onPrevious() : goToPreviousStep();
  };

  const formatDuration = (seconds: number) => {
    return `${seconds}s`;
  };

  return (
    <div className="h-full bg-canvas">
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Short / Reel</h1>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Paso 2 de 5
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Plataforma & Formato */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-pink-600" />
                <h3 className="text-lg font-medium">Plataforma & Formato</h3>
              </div>

              {/* Platform Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Plataforma</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PLATFORMS.map((platform) => (
                    <Button
                      key={platform.value}
                      variant={selectedPlatforms.includes(platform.value) ? 'default' : 'outline'}
                      onClick={() => handlePlatformToggle(platform.value)}
                      className="h-auto p-3 flex flex-col items-center gap-2 transition-all"
                    >
                      <span className="text-lg">{platform.icon}</span>
                      <span className="text-xs text-center leading-tight">
                        {platform.label}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Relación de aspecto</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span>9:16 (vertical)</span>
                </div>
              </div>

              {/* Preview Box */}
              <div className="flex justify-center">
                <div className="relative">
                  <Label className="text-sm font-medium mb-2 block text-center">Preview 9:16</Label>
                  <div 
                    className="bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                    style={{ width: '120px', height: '220px' }}
                  >
                    <div className="text-center text-xs text-gray-500">
                      <Smartphone className="w-6 h-6 mx-auto mb-1" />
                      <div>Preview</div>
                      <div>9:16</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Duración */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-pink-600" />
                <h3 className="text-lg font-medium">Duración</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Duración (segundos)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={duration[0]}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || minDuration;
                        const clampedValue = Math.max(minDuration, Math.min(maxDuration, value));
                        setDuration([clampedValue]);
                      }}
                      min={minDuration}
                      max={maxDuration}
                      className="w-20 h-8 text-center"
                    />
                    <span className="text-sm text-muted-foreground">seg</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Slider
                    value={duration}
                    onValueChange={setDuration}
                    min={minDuration}
                    max={maxDuration}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatDuration(minDuration)}</span>
                    <span>{formatDuration(maxDuration)}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Shorts: 15–60s · Reels: 30–90s
                </p>
              </div>
            </div>
          </Card>

          {/* Estilo Visual */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-pink-600" />
                <h3 className="text-lg font-medium">Estilo Visual</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {VISUAL_STYLES.map((style) => (
                  <Button
                    key={style.value}
                    variant={visualStyle === style.value ? 'default' : 'outline'}
                    onClick={() => handleStyleSelect(style.value)}
                    className="h-auto p-3 text-center transition-all"
                  >
                    <span className="text-sm">{style.label}</span>
                  </Button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Se aplicarán colores y tipografías del BrandKit.
              </p>
            </div>
          </Card>

          {/* Cantidad de Versiones */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Copy className="w-5 h-5 text-pink-600" />
                <h3 className="text-lg font-medium">Cantidad de Versiones</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Número de variaciones a generar</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={versions[0]}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        const clampedValue = Math.max(1, Math.min(5, value));
                        setVersions([clampedValue]);
                      }}
                      min={1}
                      max={5}
                      className="w-16 h-8 text-center"
                    />
                    <span className="text-sm text-muted-foreground">versiones</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Slider
                    value={versions}
                    onValueChange={setVersions}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 versión</span>
                    <span>5 versiones</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Validación BrandKit */}
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-amber-800">
              Todo el contenido será validado contra el BrandKit antes de exportar.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          
          <Button 
            onClick={handleContinue}
            disabled={!canContinue}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center gap-2"
          >
            Siguiente: Generación
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {!canContinue && (
          <p className="text-sm text-gray-500 text-center mt-2">
            Selecciona al menos una plataforma y configura todos los parámetros para continuar
          </p>
        )}
      </div>
    </div>
  );
}