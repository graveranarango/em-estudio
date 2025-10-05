import { useState } from "react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";
import { Textarea } from "../../ui/textarea";
import { Separator } from "../../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Slider } from "../../ui/slider";
import { Switch } from "../../ui/switch";
import { Label } from "../../ui/label";
import { 
  Edit3, 
  ArrowLeft, 
  ArrowRight,
  MessageCircle,
  Send,
  Type,
  Image,
  Layers,
  Crown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Bold,
  Italic,
  Upload,
  Palette,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Edit,
  GripVertical,
  Sparkles,
  Shield,
  AlertTriangle,
  CheckCircle,
  Zap,
  FileText
} from "lucide-react";

interface EditingStepCarouselProps {
  onBack?: () => void;
  onNext?: () => void;
}

export function EditingStepCarousel({ onBack, onNext }: EditingStepCarouselProps) {
  const [activeCarousel, setActiveCarousel] = useState("carousel-1");
  const [activeSlide, setActiveSlide] = useState(0);
  const [chatMessage, setChatMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  
  // Tool states
  const [fontSize, setFontSize] = useState([32]);
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [logoSize, setLogoSize] = useState([100]);
  const [layers, setLayers] = useState([
    { id: 'bg', name: 'Fondo', type: 'background', visible: true, locked: false },
    { id: 'img1', name: 'Imagen 1', type: 'image', visible: true, locked: false },
    { id: 'logo', name: 'Logo', type: 'logo', visible: true, locked: false },
    { id: 'text1', name: 'Texto 1', type: 'text', visible: true, locked: false }
  ]);

  const carousels = [
    {
      id: "carousel-1",
      name: "Carousel 1",
      slides: [
        { id: "slide-1-1", label: "Slide 1", isActive: true },
        { id: "slide-1-2", label: "Slide 2", isActive: false },
        { id: "slide-1-3", label: "Slide 3", isActive: false },
        { id: "slide-1-4", label: "Slide 4", isActive: false },
        { id: "slide-1-5", label: "Slide 5", isActive: false }
      ]
    },
    {
      id: "carousel-2", 
      name: "Carousel 2",
      slides: [
        { id: "slide-2-1", label: "Slide 1", isActive: false },
        { id: "slide-2-2", label: "Slide 2", isActive: false },
        { id: "slide-2-3", label: "Slide 3", isActive: false },
        { id: "slide-2-4", label: "Slide 4", isActive: false },
        { id: "slide-2-5", label: "Slide 5", isActive: false },
        { id: "slide-2-6", label: "Slide 6", isActive: false },
        { id: "slide-2-7", label: "Slide 7", isActive: false }
      ]
    },
    {
      id: "carousel-3",
      name: "Carousel 3", 
      slides: [
        { id: "slide-3-1", label: "Slide 1", isActive: false },
        { id: "slide-3-2", label: "Slide 2", isActive: false },
        { id: "slide-3-3", label: "Slide 3", isActive: false },
        { id: "slide-3-4", label: "Slide 4", isActive: false }
      ]
    }
  ];

  const currentCarousel = carousels.find(c => c.id === activeCarousel);
  const currentSlides = currentCarousel?.slides || [];

  const chatHistory = [
    "Aumenta el tamaño del título en el Slide 1",
    "Cambia el color del fondo a azul",
    "Añade el logo en la esquina superior derecha"
  ];

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      console.log("Sending message:", chatMessage);
      setChatMessage("");
      setHasChanges(true);
    }
  };

  const handleSlideClick = (slideIndex: number) => {
    setActiveSlide(slideIndex);
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
    setHasChanges(true);
  };

  const toggleLayerLock = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    ));
    setHasChanges(true);
  };

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'background': return Palette;
      case 'image': return Image;
      case 'logo': return Crown;
      case 'text': return Type;
      default: return Layers;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Edición de Carousels</h1>
              <p className="text-sm text-muted-foreground">Editor avanzado con IA</p>
            </div>
          </div>

          <Badge variant="secondary" className="text-sm">
            Paso 4 de 6
          </Badge>
        </div>

        {/* Carousel Tabs */}
        <div className="flex-1 max-w-md mx-8">
          <Tabs value={activeCarousel} onValueChange={setActiveCarousel}>
            <TabsList className="grid w-full grid-cols-3">
              {carousels.map((carousel) => (
                <TabsTrigger key={carousel.id} value={carousel.id} className="text-sm">
                  {carousel.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <Button 
            onClick={onNext} 
            disabled={!hasChanges}
            className="gap-2"
          >
            Siguiente: Selección final
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Panel - Chat IA */}
        <Card className="w-[280px] flex flex-col shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-sm">Chat de Edición (IA)</h3>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col gap-4">
            {/* Chat Input */}
            <div className="space-y-3">
              <Textarea
                placeholder="Ej: 'Haz el texto más grande en el Slide 3'"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className="w-full gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar instrucción
              </Button>
            </div>

            <Separator />

            {/* Chat History */}
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-3">Historial de instrucciones</h4>
              <div className="space-y-2">
                {chatHistory.map((message, index) => (
                  <div key={index} className="p-2 bg-muted rounded-lg text-sm">
                    {message}
                  </div>
                ))}
                {chatHistory.length === 0 && (
                  <div className="text-sm text-muted-foreground italic">
                    No hay instrucciones previas
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Canvas Area */}
          <Card className="flex-1 relative">
            <CardContent className="h-full p-6">
              <div className="h-full border-2 border-dashed border-gray-300 rounded-xl bg-canvas flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                    <Edit3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Canvas (Slide activo)</h3>
                    <p className="text-muted-foreground">
                      {currentCarousel?.name} - {currentSlides[activeSlide]?.label}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    800 × 800 px • 1:1 Ratio
                  </div>
                </div>
              </div>

              {/* Canvas Controls */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Button size="sm" variant="secondary">
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <Play className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              <div className="absolute top-4 right-4">
                <Badge variant="outline">
                  {activeSlide + 1} / {currentSlides.length}
                </Badge>
              </div>

              {/* BrandGuard Overlay */}
              <Card className="absolute bottom-4 right-4 w-80 shadow-lg border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-sm">Validaciones BrandGuard</h4>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Validation List */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700">Paleta de colores válida</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-700">Contraste bajo en subtítulo</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700">Logo respeta tamaño mínimo</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-700">Texto fuera de zona segura</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button size="sm" className="flex-1 gap-2">
                      <Zap className="w-3 h-3" />
                      Autocorregir
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-2">
                      <FileText className="w-3 h-3" />
                      Ver reporte
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Timeline Slides */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-purple-600" />
                <h4 className="font-semibold text-sm">Timeline de Slides</h4>
                <Badge variant="secondary" className="text-xs">
                  {currentSlides.length} slides
                </Badge>
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-2">
                {currentSlides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`relative cursor-pointer transition-all ${
                      index === activeSlide 
                        ? 'ring-2 ring-primary' 
                        : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                    onClick={() => handleSlideClick(index)}
                  >
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center text-gray-400 text-xs font-medium flex-shrink-0">
                      <div>{slide.label}</div>
                    </div>
                    
                    {/* Slide Number */}
                    <div className="absolute -bottom-1 -right-1">
                      <Badge 
                        variant={index === activeSlide ? "default" : "outline"} 
                        className="text-xs w-6 h-6 rounded-full p-0 flex items-center justify-center"
                      >
                        {index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Herramientas Avanzadas */}
        <div className="w-[280px] space-y-4 overflow-y-auto max-h-full">
          {/* Sección Texto */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-sm">Texto</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fuente */}
              <div className="space-y-2">
                <Label className="text-xs">Fuente</Label>
                <Select defaultValue="inter">
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter (BrandKit)</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="montserrat">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tamaño */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Tamaño</Label>
                  <span className="text-xs text-muted-foreground">{fontSize[0]}px</span>
                </div>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  max={96}
                  min={12}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label className="text-xs">Color</Label>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-900 border-2 border-white shadow-sm cursor-pointer"></div>
                  <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-sm cursor-pointer"></div>
                  <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-sm cursor-pointer"></div>
                  <div className="w-6 h-6 rounded-full bg-green-600 border-2 border-white shadow-sm cursor-pointer"></div>
                </div>
              </div>

              {/* Estilos */}
              <div className="space-y-2">
                <Label className="text-xs">Estilos</Label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 px-2">
                    <Bold className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 px-2">
                    <Italic className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 px-2 text-xs">
                    AA
                  </Button>
                </div>
              </div>

              {/* Avanzado */}
              <div className="pt-2 border-t">
                <Label className="text-xs text-muted-foreground">OpenType / Variable Fonts</Label>
                <p className="text-xs text-muted-foreground mt-1">Ejes y features</p>
              </div>
            </CardContent>
          </Card>

          {/* Sección Imagen/Fondo */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-sm">Imagen / Fondo</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Reemplazar */}
              <Button variant="secondary" size="sm" className="w-full h-8 text-xs">
                <Upload className="w-3 h-3 mr-2" />
                Reemplazar imagen
              </Button>

              {/* Brillo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Brillo</Label>
                  <span className="text-xs text-muted-foreground">{brightness[0]}%</span>
                </div>
                <Slider
                  value={brightness}
                  onValueChange={setBrightness}
                  max={200}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Contraste */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Contraste</Label>
                  <span className="text-xs text-muted-foreground">{contrast[0]}%</span>
                </div>
                <Slider
                  value={contrast}
                  onValueChange={setContrast}
                  max={200}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Saturación */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Saturación</Label>
                  <span className="text-xs text-muted-foreground">{saturation[0]}%</span>
                </div>
                <Slider
                  value={saturation}
                  onValueChange={setSaturation}
                  max={200}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* IA Actions */}
              <div className="space-y-2 pt-2 border-t">
                <Button variant="ghost" size="sm" className="w-full h-8 text-xs justify-start">
                  <Sparkles className="w-3 h-3 mr-2" />
                  Borrar fondo (IA)
                </Button>
                <Button variant="ghost" size="sm" className="w-full h-8 text-xs justify-start">
                  <Sparkles className="w-3 h-3 mr-2" />
                  Relleno generativo (IA)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sección Logo */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-sm">Logo</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Variante */}
              <div className="space-y-2">
                <Label className="text-xs">Variante</Label>
                <Select defaultValue="principal">
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="negativo">Negativo</SelectItem>
                    <SelectItem value="alternativo">Alternativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tamaño */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Tamaño</Label>
                  <span className="text-xs text-muted-foreground">{logoSize[0]}%</span>
                </div>
                <Slider
                  value={logoSize}
                  onValueChange={setLogoSize}
                  max={200}
                  min={10}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Posición */}
              <div className="space-y-2">
                <Label className="text-xs">Posición</Label>
                <Select defaultValue="sup-der">
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sup-izq">Superior Izquierda</SelectItem>
                    <SelectItem value="sup-der">Superior Derecha</SelectItem>
                    <SelectItem value="inf-izq">Inferior Izquierda</SelectItem>
                    <SelectItem value="inf-der">Inferior Derecha</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Watermark */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Label className="text-xs">Watermark con transparencia</Label>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Sección Capas */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-600" />
                <h3 className="font-semibold text-sm">Capas</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {layers.map((layer, index) => {
                const LayerIcon = getLayerIcon(layer.type);
                return (
                  <div key={layer.id} className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                    {/* Drag Handle */}
                    <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
                    
                    {/* Layer Icon */}
                    <LayerIcon className="w-3 h-3 text-muted-foreground" />
                    
                    {/* Layer Name */}
                    <span className="text-xs flex-1 truncate">{layer.name}</span>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleLayerVisibility(layer.id)}
                      >
                        {layer.visible ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleLayerLock(layer.id)}
                      >
                        {layer.locked ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          <Unlock className="w-3 h-3" />
                        )}
                      </Button>
                      
                      {layer.type !== 'background' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Arrastra para reordenar capas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Vista previa en plataformas */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <h3 className="font-semibold text-sm">Vista previa en plataformas</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Instagram Feed */}
              <div className="space-y-2">
                <Label className="text-xs">Instagram Feed</Label>
                <div className="w-full aspect-square border border-gray-300 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium shadow-sm">
                  <div className="text-center">
                    <div className="text-sm font-semibold">Instagram</div>
                    <div className="text-xs opacity-75">1080×1080</div>
                  </div>
                </div>
              </div>

              {/* TikTok Story */}
              <div className="space-y-2">
                <Label className="text-xs">TikTok Story</Label>
                <div className="w-[140px] h-[260px] mx-auto border border-gray-300 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white text-xs font-medium shadow-sm">
                  <div className="text-center">
                    <div className="text-sm font-semibold">TikTok</div>
                    <div className="text-xs opacity-75">1080×1920</div>
                  </div>
                </div>
              </div>

              {/* LinkedIn Post */}
              <div className="space-y-2">
                <Label className="text-xs">LinkedIn Post</Label>
                <div className="w-full aspect-video border border-gray-300 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-medium shadow-sm">
                  <div className="text-center">
                    <div className="text-sm font-semibold">LinkedIn</div>
                    <div className="text-xs opacity-75">1200×630</div>
                  </div>
                </div>
              </div>

              {/* Twitter/X */}
              <div className="space-y-2">
                <Label className="text-xs">Twitter/X</Label>
                <div className="w-full aspect-video border border-gray-300 rounded-lg bg-black flex items-center justify-center text-white text-xs font-medium shadow-sm">
                  <div className="text-center">
                    <div className="text-sm font-semibold">Twitter/X</div>
                    <div className="text-xs opacity-75">1200×675</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BrandKit Status */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Estado BrandKit</h4>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Aplicado correctamente</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}