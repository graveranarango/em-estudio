import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Slider } from "../../ui/slider";
import { useBrandKit, useBrandColors } from "../../../contexts/BrandKitContext";
import { usePostProject } from "../../../contexts/PostProjectContext";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Video,
  Square,
  Layers,
  AlertTriangle
} from "lucide-react";

const PLATFORM_DATA = [
  {
    id: "Instagram",
    name: "Instagram",
    icon: Instagram,
    gradient: "from-pink-500 to-purple-600",
    ratios: ["1:1", "9:16"]
  },
  {
    id: "Facebook", 
    name: "Facebook",
    icon: Facebook,
    gradient: "from-blue-600 to-blue-700",
    ratios: ["1:1"]
  },
  {
    id: "TikTok",
    name: "TikTok", 
    icon: Video,
    gradient: "from-black to-gray-800",
    ratios: ["9:16"]
  },
  {
    id: "LinkedIn",
    name: "LinkedIn",
    icon: Linkedin,
    gradient: "from-blue-700 to-blue-800", 
    ratios: ["16:9", "1:1"]
  },
  {
    id: "X",
    name: "X (Twitter)",
    icon: Twitter,
    gradient: "from-black to-gray-800",
    ratios: ["16:9"]
  }
];

export function ConfigurationStep() {
  const { hasBrandKit } = useBrandKit();
  const { primaryColors, secondaryColors } = useBrandColors();
  const { 
    currentProject, 
    updateConfiguration, 
    goToNextStep, 
    goToPreviousStep 
  } = usePostProject();

  // Estado local sincronizado con el proyecto
  const [contentType, setContentType] = useState("post");
  const [quantity, setQuantity] = useState(3);
  const [socialPlatform, setSocialPlatform] = useState("Instagram");
  const [selectedRatio, setSelectedRatio] = useState("1:1");

  // Inicializar con datos del proyecto si existen
  useEffect(() => {
    if (currentProject?.configuration) {
      const config = currentProject.configuration;
      setQuantity(config.generationCount || 3);
      setSocialPlatform(config.primaryPlatform || "Instagram");
      setSelectedRatio(config.format?.ratio || "1:1");
    }
  }, [currentProject]);

  // Sincronizar cambios con el contexto
  useEffect(() => {
    if (!currentProject) return;

    const selectedPlatformData = PLATFORM_DATA.find(p => p.id === socialPlatform);
    const formatData = getFormatData(selectedRatio);

    updateConfiguration({
      socialPlatforms: [socialPlatform.toLowerCase()],
      primaryPlatform: socialPlatform.toLowerCase(),
      generationCount: quantity,
      format: {
        ratio: selectedRatio,
        name: formatData.name,
        width: formatData.width,
        height: formatData.height
      },
      dimensions: {
        width: formatData.width,
        height: formatData.height
      }
    });
  }, [contentType, quantity, socialPlatform, selectedRatio, currentProject, updateConfiguration]);

  const selectedPlatform = PLATFORM_DATA.find(p => p.id === socialPlatform);
  const primaryColor = primaryColors[0]?.hex || "#2563eb";
  const secondaryColor = secondaryColors[0]?.hex || "#6366f1"; 
  const alternativeColor = secondaryColors[1]?.hex || "#8b5cf6";

  // Función helper para obtener datos del formato
  const getFormatData = (ratio: string) => {
    switch (ratio) {
      case "1:1":
        return { name: "Cuadrado", width: 1080, height: 1080 };
      case "9:16":
        return { name: "Vertical", width: 1080, height: 1920 };
      case "16:9":
        return { name: "Horizontal", width: 1920, height: 1080 };
      default:
        return { name: "Cuadrado", width: 1080, height: 1080 };
    }
  };

  // Validar si se puede continuar
  const canContinue = contentType && quantity >= 1 && quantity <= 10 && socialPlatform && selectedRatio;

  const handleBack = () => {
    goToPreviousStep();
  };

  const handleNext = () => {
    if (canContinue) {
      goToNextStep();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl">Configuración del Contenido</h1>
        <Badge variant="secondary" className="self-start sm:self-center">Paso 2 de 7</Badge>
      </div>

      {/* Tipo de Contenido */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Tipo de Contenido</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={contentType} onValueChange={setContentType} className="gap-6">
            {/* Post simple */}
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="post" id="post" />
              <Label htmlFor="post" className="cursor-pointer flex-1">
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <p>Post simple</p>
                  </div>
                  <div className="ml-auto">
                    <div 
                      className="rounded-lg shadow-sm border flex items-center justify-center transition-transform hover:scale-105"
                      style={{ 
                        width: 60, 
                        height: 60,
                        backgroundColor: contentType === "post" ? primaryColor : "#f3f4f6"
                      }}
                    >
                      <Square className={`w-6 h-6 ${contentType === "post" ? "text-white" : "text-gray-500"}`} />
                    </div>
                  </div>
                </div>
              </Label>
            </div>

            {/* Carrousel */}
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="carrousel" id="carrousel" />
              <Label htmlFor="carrousel" className="cursor-pointer flex-1">

              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Cantidad de ejemplos */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Cantidad de ejemplos a generar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full">
              <Slider
                value={[quantity]}
                onValueChange={(value) => setQuantity(value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
                style={{
                  // Aplicar color del BrandKit al slider
                  "--primary": primaryColor,
                } as React.CSSProperties}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1</span>
                <span>10</span>
              </div>
            </div>
            <div className="w-full sm:w-20">
              <Input 
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(10, Number(e.target.value))))}
                className="w-full sm:w-20 text-center"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Ejemplos a generar: <span style={{ color: primaryColor }}>{quantity}</span>
          </p>
        </CardContent>
      </Card>

      {/* Red social objetivo */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Red social objetivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chips de plataformas */}
          <div className="space-y-3">
            <Label>Selecciona la plataforma</Label>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4">
              {PLATFORM_DATA.map((platform) => {
                const Icon = platform.icon;
                const isSelected = socialPlatform === platform.id;
                
                return (
                  <button
                    key={platform.id}
                    onClick={() => {
                      setSocialPlatform(platform.id);
                      // Auto-select first available ratio for the platform
                      if (platform.ratios.length > 0 && !platform.ratios.includes(selectedRatio)) {
                        setSelectedRatio(platform.ratios[0]);
                      }
                    }}
                    className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-3 sm:py-2 rounded-2xl border transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isSelected 
                        ? 'border-transparent text-white shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                    style={{
                      background: isSelected ? `linear-gradient(135deg, ${platform.gradient.replace('from-', '').replace('to-', '').split(' ').map(c => {
                        const colorMap: {[key: string]: string} = {
                          'pink-500': '#ec4899',
                          'purple-600': '#9333ea',
                          'blue-600': '#2563eb',
                          'blue-700': '#1d4ed8',
                          'blue-800': '#1e40af',
                          'black': '#000000',
                          'gray-800': '#1f2937'
                        };
                        return colorMap[c] || c;
                      }).join(', ')})` : undefined
                    }}
                    aria-label={`${platform.name} - formatos disponibles: ${platform.ratios.join(', ')}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-semibold text-center sm:text-left">{platform.name}</span>
                    <Badge variant="secondary" className="text-xs px-1 py-0 hidden lg:inline-flex">
                      {platform.ratios.join(' / ')}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

              {/* Preview de formatos con colores del BrandKit */}
          <div className="space-y-3">
            <Label>Selecciona el formato para {selectedPlatform?.name}</Label>
            <div className="flex flex-wrap sm:flex-nowrap gap-4 sm:gap-6 justify-center sm:justify-start">
              {/* Formato 1:1 */}
              {selectedPlatform?.ratios.includes("1:1") && (
                <div className="flex flex-col items-center space-y-2">
                  <div 
                    className={`rounded-lg shadow-md border flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer ${
                      selectedRatio === "1:1" ? "ring-2 ring-offset-2" : ""
                    }`}
                    style={{ 
                      width: 100, 
                      height: 100,
                      backgroundColor: selectedRatio === "1:1" ? primaryColor : "#e5e7eb",
                      color: selectedRatio === "1:1" ? "white" : "#6b7280",
                      ringColor: primaryColor
                    }}
                    onClick={() => setSelectedRatio("1:1")}
                    title="Formato cuadrado"
                    role="button"
                    tabIndex={0}
                    aria-label="Formato cuadrado 1:1"
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedRatio("1:1")}
                  >
                    <span className="text-sm font-semibold">1:1</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-center">Formato cuadrado</span>
                </div>
              )}

              {/* Formato 9:16 */}
              {selectedPlatform?.ratios.includes("9:16") && (
                <div className="flex flex-col items-center space-y-2">
                  <div 
                    className={`rounded-lg shadow-md border flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer ${
                      selectedRatio === "9:16" ? "ring-2 ring-offset-2" : ""
                    }`}
                    style={{ 
                      width: 70, 
                      height: 120,
                      backgroundColor: selectedRatio === "9:16" ? secondaryColor : "#e5e7eb",
                      color: selectedRatio === "9:16" ? "white" : "#6b7280",
                      ringColor: secondaryColor
                    }}
                    onClick={() => setSelectedRatio("9:16")}
                    title="Formato vertical"
                    role="button"
                    tabIndex={0}
                    aria-label="Formato vertical 9:16"
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedRatio("9:16")}
                  >
                    <span className="text-sm font-semibold">9:16</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-center">Formato vertical</span>
                </div>
              )}

              {/* Formato 16:9 */}
              {selectedPlatform?.ratios.includes("16:9") && (
                <div className="flex flex-col items-center space-y-2">
                  <div 
                    className={`rounded-lg shadow-md border flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer ${
                      selectedRatio === "16:9" ? "ring-2 ring-offset-2" : ""
                    }`}
                    style={{ 
                      width: 140, 
                      height: 80,
                      backgroundColor: selectedRatio === "16:9" ? alternativeColor : "#e5e7eb",
                      color: selectedRatio === "16:9" ? "white" : "#6b7280",
                      ringColor: alternativeColor
                    }}
                    onClick={() => setSelectedRatio("16:9")}
                    title="Formato horizontal"
                    role="button"
                    tabIndex={0}
                    aria-label="Formato horizontal 16:9"
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedRatio("16:9")}
                  >
                    <span className="text-sm font-semibold">16:9</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-center">Formato horizontal</span>
                </div>
              )}
            </div>
            
            {/* Info del formato seleccionado */}
            {selectedRatio && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Formato seleccionado:</span>
                  <span style={{ color: primaryColor }}>
                    {getFormatData(selectedRatio).name} ({selectedRatio}) - {getFormatData(selectedRatio).width}x{getFormatData(selectedRatio).height}px
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer con validación BrandKit */}
      <div className="space-y-4">
        {/* Aviso de BrandGuard */}
        <div className={`flex items-center gap-2 p-3 rounded-lg border ${
          hasBrandKit 
            ? 'bg-amber-50 border-amber-200' 
            : 'bg-blue-50 border-blue-200'
          }`}>
          <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
            hasBrandKit ? 'text-amber-600' : 'text-blue-600'
          }`} />
          <p className={`text-sm ${
            hasBrandKit ? 'text-amber-700' : 'text-blue-700'
          }`}>
            {hasBrandKit 
              ? '⚠️ El contenido será validado contra el BrandKit (colores, tipografías, accesibilidad)'
              : 'ℹ️ Se aplicarán colores y estilos predeterminados. Configura tu BrandKit para personalizar automáticamente.'
            }
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-4">
          <Button variant="ghost" onClick={handleBack} className="sm:w-auto">
            ← Volver
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!canContinue}
            className="sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: canContinue ? primaryColor : "#e5e7eb",
              color: canContinue ? "white" : "#9ca3af"
            }}
          >
            Siguiente: Generación
          </Button>
        </div>
      </div>
    </div>
  );
}