import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Slider } from "../../ui/slider";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { 
  Instagram, 
  Facebook, 
  ArrowLeft, 
  ArrowRight,
  Settings,
  Smartphone,
  Monitor,
  Square
} from "lucide-react";

interface ConfigurationStepCarouselProps {
  onBack?: () => void;
  onNext?: () => void;
}

export function ConfigurationStepCarousel({ onBack, onNext }: ConfigurationStepCarouselProps) {
  const [carouselCount, setCarouselCount] = useState([1]);
  const [postsPerCarousel, setPostsPerCarousel] = useState([5]);
  const [versionCount, setVersionCount] = useState([2]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("Instagram");

  const platforms = [
    {
      name: "Instagram",
      label: "1:1 / 9:16",
      icon: Instagram,
      color: "bg-gradient-to-r from-pink-500 to-orange-500"
    },
    {
      name: "Facebook", 
      label: "1:1",
      icon: Facebook,
      color: "bg-blue-600"
    },
    {
      name: "TikTok",
      label: "9:16", 
      icon: Smartphone,
      color: "bg-black"
    },
    {
      name: "LinkedIn",
      label: "1:1 / 16:9",
      icon: Monitor, 
      color: "bg-blue-700"
    }
  ];

  const formatPreviews = [
    { name: "1:1", width: 120, height: 120, label: "Cuadrado" },
    { name: "9:16", width: 80, height: 140, label: "Vertical" },
    { name: "16:9", width: 160, height: 90, label: "Horizontal" }
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Configuración de Carousels</h1>
            <p className="text-muted-foreground">Define los parámetros para generar tus carousels</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          Paso 2 de 6
        </Badge>
      </div>

      {/* Cantidad de Carousels */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Square className="w-5 h-5 text-blue-600" />
            Cantidad de Carousels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Número de carousels a generar
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={carouselCount}
                onValueChange={setCarouselCount}
                max={10}
                min={1}
                step={1}
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={carouselCount[0]}
                  onChange={(e) => setCarouselCount([parseInt(e.target.value) || 1])}
                  min={1}
                  max={10}
                  className="w-16 h-9 text-center"
                />
                <span className="text-sm text-muted-foreground">carousels</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Cada carousel será una publicación independiente con múltiples imágenes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cantidad de Posts por Carousel */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="flex">
              <Square className="w-4 h-4 text-green-600" />
              <Square className="w-4 h-4 text-green-600 -ml-1" />
              <Square className="w-4 h-4 text-green-600 -ml-1" />
            </div>
            Cantidad de Posts por Carousel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Número de imágenes/slides por carousel
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={postsPerCarousel}
                onValueChange={setPostsPerCarousel}
                max={12}
                min={2}
                step={1}
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={postsPerCarousel[0]}
                  onChange={(e) => setPostsPerCarousel([parseInt(e.target.value) || 2])}
                  min={2}
                  max={12}
                  className="w-16 h-9 text-center"
                />
                <span className="text-sm text-muted-foreground">slides</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Instagram permite hasta 10 slides, pero recomendamos 5-8 para mejor engagement
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tamaño y Red Social */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Tamaño y Red Social</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Chips */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Selecciona la plataforma principal</Label>
            <div className="flex flex-wrap gap-3">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatform === platform.name;
                
                return (
                  <Button
                    key={platform.name}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-12 px-4 font-semibold ${
                      isSelected 
                        ? `${platform.color} text-white hover:opacity-90` 
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedPlatform(platform.name)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div className="text-sm">{platform.name}</div>
                      <div className="text-xs opacity-80">{platform.label}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Format Previews */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Vista previa de formatos disponibles</Label>
            <div className="flex items-end gap-6">
              {formatPreviews.map((format) => (
                <div key={format.name} className="flex flex-col items-center gap-2">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 text-sm font-medium"
                    style={{ width: format.width, height: format.height }}
                  >
                    {format.name}
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    <div className="font-medium">{format.label}</div>
                    <div>{format.name}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              El formato se ajustará automáticamente según la plataforma seleccionada
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cantidad de Versiones */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="flex">
              <div className="w-4 h-4 bg-purple-600 rounded mr-1"></div>
              <div className="w-4 h-4 bg-purple-400 rounded mr-1"></div>
              <div className="w-4 h-4 bg-purple-200 rounded"></div>
            </div>
            Cantidad de Versiones por Carousel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Número de versiones alternativas a generar
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={versionCount}
                onValueChange={setVersionCount}
                max={5}
                min={1}
                step={1}
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={versionCount[0]}
                  onChange={(e) => setVersionCount([parseInt(e.target.value) || 1])}
                  min={1}
                  max={5}
                  className="w-16 h-9 text-center"
                />
                <span className="text-sm text-muted-foreground">versiones</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Cada versión tendrá diferentes variaciones de diseño, colores y composición
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground text-right">
            <div>Total a generar:</div>
            <div className="font-medium">
              {carouselCount[0]} carousel{carouselCount[0] > 1 ? 's' : ''} × {postsPerCarousel[0]} slides × {versionCount[0]} versiones
            </div>
          </div>
          <Button onClick={onNext} className="gap-2">
            Siguiente: Generación
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}