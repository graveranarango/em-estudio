import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { BrandKitAlert } from "../common/BrandKitAlert";
import { useBrandKit, useBrandColors, useBrandTypography, useBrandVoice } from "../../contexts/BrandKitContext";
import { 
  Smartphone, 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Download, 
  Eye,
  Sparkles,
  Play,
  Square
} from "lucide-react";

export function StoriesModule() {
  const { hasBrandKit, getBrandInstructions } = useBrandKit();
  const { primaryColors, secondaryColors, hasColors } = useBrandColors();
  const { primaryFont, secondaryFont, hasFonts } = useBrandTypography();
  const { instructions: voiceInstructions, hasVoiceTone } = useBrandVoice();

  const [storyContent, setStoryContent] = useState('');
  const [storyType, setStoryType] = useState('announcement');
  const [backgroundStyle, setBackgroundStyle] = useState('gradient');
  const [textPosition, setTextPosition] = useState('center');
  const [logoVisible, setLogoVisible] = useState(true);
  const [brandInstructions, setBrandInstructions] = useState('');

  // Cargar instrucciones de marca para stories
  useEffect(() => {
    if (hasBrandKit) {
      getBrandInstructions('story').then(instructions => {
        setBrandInstructions(instructions);
      });
    }
  }, [hasBrandKit, getBrandInstructions]);

  const generateStory = async () => {
    if (!storyContent.trim()) return;
    
    let prompt = `Crea una historia vertical (9:16) sobre: ${storyContent}`;
    
    if (hasBrandKit && brandInstructions) {
      prompt += `\n\nAPLICAR BRANDKIT:\n${brandInstructions}`;
    }
    
    console.log('Generando story with prompt:', prompt);
    // Aquí se conectaría con la IA para generar la historia
  };

  const getPrimaryColor = () => {
    return primaryColors.length > 0 ? primaryColors[0].hex : '#3B82F6';
  };

  const getSecondaryColor = () => {
    return primaryColors.length > 1 ? primaryColors[1].hex : secondaryColors.length > 0 ? secondaryColors[0].hex : '#8B5CF6';
  };

  const getBackgroundStyle = () => {
    if (!hasColors) {
      return 'linear-gradient(135deg, #3B82F6, #8B5CF6)';
    }

    switch (backgroundStyle) {
      case 'gradient':
        return `linear-gradient(135deg, ${getPrimaryColor()}, ${getSecondaryColor()})`;
      case 'solid':
        return getPrimaryColor();
      case 'pattern':
        return `linear-gradient(45deg, ${getPrimaryColor()} 25%, transparent 25%), linear-gradient(-45deg, ${getPrimaryColor()} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${getSecondaryColor()} 75%), linear-gradient(-45deg, transparent 75%, ${getSecondaryColor()} 75%)`;
      default:
        return `linear-gradient(135deg, ${getPrimaryColor()}, ${getSecondaryColor()})`;
    }
  };

  const getTextStyles = () => {
    const styles: any = {
      color: 'white',
      textAlign: textPosition,
      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    };
    
    if (hasFonts && primaryFont) {
      styles.fontFamily = primaryFont.font;
      styles.fontWeight = primaryFont.weight;
    }
    
    return styles;
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white">
              <Smartphone className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">Historias</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Diseña contenido vertical para stories con tu identidad de marca
          </p>
        </div>

        {/* BrandKit Status */}
        <BrandKitAlert moduleType="story" />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Panel de Configuración */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-pink-600" />
                <h3 className="text-xl font-semibold">Crear Historia</h3>
              </div>

              {/* Tipo de Historia */}
              <div className="space-y-2">
                <label className="font-medium">Tipo de Historia</label>
                <Select value={storyType} onValueChange={setStoryType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Anuncio</SelectItem>
                    <SelectItem value="product">Producto</SelectItem>
                    <SelectItem value="behind-scenes">Behind the Scenes</SelectItem>
                    <SelectItem value="testimonial">Testimonio</SelectItem>
                    <SelectItem value="quote">Cita/Frase</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contenido */}
              <div className="space-y-2">
                <label className="font-medium">Contenido</label>
                <Textarea 
                  placeholder="Escribe el contenido de tu historia..."
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Fondo */}
              <div className="space-y-2">
                <label className="font-medium">Estilo de Fondo</label>
                <Select value={backgroundStyle} onValueChange={setBackgroundStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gradient">Gradiente</SelectItem>
                    <SelectItem value="solid">Color Sólido</SelectItem>
                    <SelectItem value="pattern">Patrón</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Posición del Texto */}
              <div className="space-y-2">
                <label className="font-medium">Posición del Texto</label>
                <Select value={textPosition} onValueChange={setTextPosition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="left">Izquierda</SelectItem>
                    <SelectItem value="right">Derecha</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Logo Visible */}
              {hasBrandKit && (
                <div className="flex items-center justify-between">
                  <label className="font-medium">Mostrar Logo</label>
                  <Button
                    variant={logoVisible ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLogoVisible(!logoVisible)}
                  >
                    {logoVisible ? "Visible" : "Oculto"}
                  </Button>
                </div>
              )}

              <Button 
                onClick={generateStory} 
                className="w-full"
                style={{ backgroundColor: getPrimaryColor() }}
                disabled={!storyContent.trim()}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generar Historia
              </Button>
            </div>
          </Card>

          {/* Preview Mobile */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-5 h-5 text-green-600" />
                <h3 className="text-xl font-semibold">Preview</h3>
                {hasBrandKit && (
                  <Badge className="bg-green-100 text-green-800">
                    BrandKit Aplicado
                  </Badge>
                )}
              </div>

              {/* Mockup del móvil */}
              <div className="relative mx-auto" style={{ width: '200px' }}>
                {/* Frame del móvil */}
                <div className="bg-black rounded-[20px] p-2">
                  <div className="relative bg-white rounded-[16px] overflow-hidden" style={{ height: '355px' }}>
                    {/* Contenido de la historia */}
                    <div 
                      className="w-full h-full relative flex items-center justify-center p-6"
                      style={{ background: getBackgroundStyle(), backgroundSize: '20px 20px' }}
                    >
                      {/* Logo */}
                      {hasBrandKit && logoVisible && (
                        <div className="absolute top-4 left-4">
                          <div className="w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                            <span className="text-white text-xs font-bold">LOGO</span>
                          </div>
                        </div>
                      )}

                      {/* Indicador de historia */}
                      <div className="absolute top-2 left-2 right-2 h-1 bg-white/30 rounded-full">
                        <div className="h-full bg-white rounded-full" style={{ width: '60%' }}></div>
                      </div>

                      {/* Contenido principal */}
                      <div className="flex-1 flex items-center justify-center px-4">
                        {storyContent ? (
                          <div className="text-center">
                            <h2 
                              className="text-lg leading-tight mb-2"
                              style={getTextStyles()}
                            >
                              {storyContent}
                            </h2>
                            {storyType === 'quote' && (
                              <div className="text-white/80 text-sm mt-4">
                                "
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-white/60">
                            <Smartphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Escribe contenido para ver el preview</p>
                          </div>
                        )}
                      </div>

                      {/* Controles de historia */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex gap-2">
                          <div className="w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="text-white/60 text-xs">
                          {storyType}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                {storyContent && (
                  <div className="mt-4 space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="w-3 h-3 mr-2" />
                      Descargar
                    </Button>
                    <Button size="sm" className="w-full" style={{ backgroundColor: getPrimaryColor() }}>
                      Publicar Historia
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Panel de Elementos de Marca */}
          {hasBrandKit && (
            <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-pink-600" />
                Elementos de Marca
              </h4>
              
              <div className="space-y-6">
                {/* Paleta de Colores */}
                {hasColors && (
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm">Colores Aplicados</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border border-white shadow-sm"
                          style={{ backgroundColor: getPrimaryColor() }}
                        />
                        <span className="text-sm">Principal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border border-white shadow-sm"
                          style={{ backgroundColor: getSecondaryColor() }}
                        />
                        <span className="text-sm">Secundario</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tipografías */}
                {hasFonts && (
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm">Tipografía</h5>
                    <div className="space-y-2">
                      {primaryFont && (
                        <div 
                          className="p-3 bg-white/50 rounded text-sm"
                          style={{ 
                            fontFamily: primaryFont.font, 
                            fontWeight: primaryFont.weight 
                          }}
                        >
                          {primaryFont.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Configuración Visual */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Configuración</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="capitalize">{storyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fondo:</span>
                      <span className="capitalize">{backgroundStyle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Texto:</span>
                      <span className="capitalize">{textPosition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Logo:</span>
                      <span>{logoVisible ? 'Visible' : 'Oculto'}</span>
                    </div>
                  </div>
                </div>

                {/* Templates Predefinidos */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Templates con Marca</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {['announcement', 'product', 'quote'].map((template, index) => (
                      <button
                        key={template}
                        onClick={() => setStoryType(template)}
                        className={`aspect-[9/16] rounded border-2 text-xs p-1 transition-all ${
                          storyType === template 
                            ? 'border-pink-400 bg-pink-100' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          background: index === 0 ? getBackgroundStyle() : index === 1 ? getPrimaryColor() : getSecondaryColor()
                        }}
                      >
                        <div className="text-white/80 text-[8px] capitalize font-medium">
                          {template}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}