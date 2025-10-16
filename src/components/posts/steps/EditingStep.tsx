import { useState } from 'react';
import { ArrowLeft, Bot, Send, Eye, EyeOff, Lock, Unlock, Copy, Edit3, Image, Layers, Type, Palette, Wand2, ShieldCheck, Command, Search, Sparkles } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { ScrollArea } from '../../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Slider } from '../../ui/slider';
import { Switch } from '../../ui/switch';
import { Separator } from '../../ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '../../ui/dropdown-menu';
import { useBrandKit, useBrandColors, useBrandTypography } from '../../../contexts/BrandKitContext';
import { usePostProject } from '../../../contexts/PostProjectContext';

interface MenuBarProps {
  onCommand: (command: string) => void;
}

const MenuBar = ({ onCommand }: MenuBarProps) => {
  const menuItems = [
    {
      name: 'Archivo',
      items: [
        'Nuevo post',
        'Duplicar',
        'Guardar snapshot',
        'Revertir snapshot',
        'Importar JSON de capas',
        'Exportar…',
        'Preflight (QA)'
      ]
    },
    {
      name: 'Edición',
      items: [
        'Deshacer',
        'Rehacer',
        'Copiar estilo',
        'Pegar estilo',
        'Buscar/Sustituir texto',
        'Nudge preciso'
      ]
    },
    {
      name: 'Capas',
      items: [
        'Árbol',
        'Grupo',
        'Máscara (vector/píxel/IA)',
        'Clipping',
        'Etiquetas',
        'Bloquear'
      ]
    },
    {
      name: 'Tipografía',
      items: [
        'Fuente (BrandKit)',
        'Variable font axes',
        'Jerarquías H1/H2/body',
        'OpenType',
        'Verificador de jerarquía'
      ]
    },
    {
      name: 'Color & Estilos',
      items: [
        'Paleta BrandKit',
        'Degradados avanzados',
        'Gradient Map',
        'Sombras múltiples',
        'Contraste WCAG'
      ]
    },
    {
      name: 'Imagen & Máscaras IA',
      items: [
        'Reemplazar',
        'Curvas',
        'LUT',
        'Borrar fondo (IA)',
        'Relleno generativo',
        'Segmentación',
        'Depth/Relight'
      ]
    },
    {
      name: 'Vectores & Formas',
      items: [
        'Pluma Bézier',
        'Booleanas',
        'Expandir/Contornear',
        'Esquinas por-nodo',
        'Mesh gradient',
        'Auto-traza IA'
      ]
    },
    {
      name: 'Transformar',
      items: [
        'Escala/Rotar/Sesgar',
        'Perspective warp',
        'Warp mesh',
        'Alinear a clave',
        'Distribuir',
        'Constraints'
      ]
    },
    {
      name: 'Composición & Guías',
      items: [
        'Rejillas',
        'Guías inteligentes',
        'Zonas seguras',
        'Plantillas por plataforma'
      ]
    },
    {
      name: 'BrandGuard',
      items: [
        'Checklist',
        'Autocorrección 1-click',
        'Report'
      ]
    },
    {
      name: 'Accesibilidad',
      items: [
        'Simulación daltonismo',
        'Mínimos por plataforma',
        'ALT auto'
      ]
    },
    {
      name: 'Activos & Librerías',
      items: [
        'Logos',
        'Iconos',
        'Patrones',
        'Componentes'
      ]
    },
    {
      name: 'Historia & Versiones',
      items: [
        'Timeline',
        'Snapshots',
        'Comparar A/B'
      ]
    },
    {
      name: 'Previsualizar',
      items: [
        'Instagram Feed',
        'LinkedIn Timeline',
        'X Post',
        'Modo oscuro/claro',
        'Escalas 1×/2×/3×'
      ]
    },
    {
      name: 'Automatizar',
      items: [
        'Macros',
        'Aplicar estilo en lote',
        'Find&Replace',
        'Multiformato'
      ]
    },
    {
      name: 'Comandos IA',
      items: [
        'Abrir Paleta ⌘K',
        'Sugerencias de edición'
      ]
    }
  ];

  return (
    <div className="h-10 bg-white border-b border-gray-200 flex items-center px-3 shadow-sm">
      <div className="flex items-center gap-1">
        {menuItems.map((menu) => (
          <DropdownMenu key={menu.name}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
                {menu.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {menu.items.map((item, index) => (
                <DropdownMenuItem 
                  key={index}
                  onClick={() => onCommand(item)}
                  className="text-xs"
                >
                  {item}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
      
      <div className="flex-1" />
      
      <Badge variant="secondary" className="text-xs">
        Paso 4 de 6
      </Badge>
    </div>
  );
};

// Layout base component for Figma design reference
import EditingStepLayout from './EditingStepLayout';

// Toggle between layouts
const USE_LAYOUT_BASE = process.env.NODE_ENV === 'development';

export default function EditingStep() {
  // Show simplified layout base for Figma design matching
  if (USE_LAYOUT_BASE) {
    return <EditingStepLayout />;
  }
  
  // Full advanced editor (existing implementation)
  const { hasBrandKit } = useBrandKit();
  const { primaryColors, allColors } = useBrandColors();
  const { primaryFont, allFonts } = useBrandTypography();
  const { goToPreviousStep, goToNextStep } = usePostProject();

  // Ensure arrays exist with fallbacks
  const availableFonts = Array.isArray(allFonts) && allFonts.length > 0 
    ? allFonts 
    : [
        { font: 'Montserrat', name: 'Montserrat' },
        { font: 'Inter', name: 'Inter' }
      ];

  const availableColors = Array.isArray(allColors) && allColors.length > 0 
    ? allColors 
    : [
        { hex: '#6366f1', name: 'Primary' },
        { hex: '#f97316', name: 'Secondary' },
        { hex: '#0891b2', name: 'Accent' },
        { hex: '#059669', name: 'Success' },
        { hex: '#dc2626', name: 'Error' },
        { hex: '#6b7280', name: 'Neutral' }
      ];

  // Estados para el chat IA y comandos
  const [commandInput, setCommandInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      role: 'user' as const,
      content: 'Haz el logo 150% y muévelo a inf. derecha',
      timestamp: new Date(Date.now() - 120000)
    },
    {
      id: 2,
      role: 'assistant' as const,
      content: '✅ Tamaño 150%, posición Inf. Der., clear space ok.',
      timestamp: new Date(Date.now() - 115000)
    }
  ]);

  // Estados para las capas
  const [layers, setLayers] = useState([
    { id: 'bg', name: 'Fondo', type: 'background', visible: true, locked: false },
    { id: 'img', name: 'Imagen 01', type: 'image', visible: true, locked: false },
    { id: 'logo', name: 'Logo', type: 'logo', visible: true, locked: false },
    { id: 'title', name: 'Título', type: 'text', visible: true, locked: false }
  ]);

  // Estados para herramientas
  const [selectedFont, setSelectedFont] = useState(primaryFont?.font || 'Montserrat');
  const [fontSize, setFontSize] = useState([32]);
  const [textColor, setTextColor] = useState(primaryColors?.[0]?.hex || '#000000');
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [logoVariant, setLogoVariant] = useState('Principal');
  const [logoSize, setLogoSize] = useState([100]);
  const [logoPosition, setLogoPosition] = useState('SI');

  // Estados para validaciones BrandGuard
  const [brandGuardValidations] = useState([
    { type: 'success', label: '✅ Paleta válida' },
    { type: 'warning', label: '⚠️ Contraste bajo en subtítulo (AA-)' },
    { type: 'success', label: '✅ Logo ≥ tamaño mínimo' }
  ]);

  const handleMenuCommand = (command: string) => {
    console.log('Command:', command);
    // Aquí se implementaría la lógica para cada comando
  };

  const handleCommandSubmit = () => {
    if (!commandInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user' as const,
      content: commandInput,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setCommandInput('');

    // Simular respuesta IA
    setTimeout(() => {
      const responses = [
        '✅ Comando ejecutado según BrandKit.',
        '⚠️ Ajuste aplicado con validación automática.',
        '✅ Cambio completado respetando guías.',
        '🔍 Análisis de impacto en marcha...'
      ];

      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const toggleLayerLock = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    ));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Menu Bar */}
      <MenuBar onCommand={handleMenuCommand} />

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Panel - Chat IA / Comandos */}
        <Card className="w-80 flex flex-col bg-white shadow-sm rounded-lg">
          <div className="p-3 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Command className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-medium">Comandos IA (⌘K)</h3>
            </div>
            <div className="relative">
              <Search className="w-3 h-3 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Escribe un comando… (p.ej. 'logo 150%')"
                className="pl-9 text-xs h-8"
                onKeyDown={(e) => e.key === 'Enter' && handleCommandSubmit()}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3">
              <div className="space-y-3">
                {chatHistory.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex gap-2 max-w-[85%]">
                      {message.role === 'assistant' && (
                        <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="w-2.5 h-2.5 text-purple-600" />
                        </div>
                      )}
                      <div className={`rounded-lg p-2 text-xs ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <p>{message.content}</p>
                        <div className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            <p className="text-xs text-gray-500 mb-2">Los cambios se aplican al post activo.</p>
            <Button 
              onClick={handleCommandSubmit}
              disabled={!commandInput.trim()}
              className="w-full text-xs h-8"
              size="sm"
            >
              <Send className="w-3 h-3 mr-1" />
              Ejecutar
            </Button>
          </div>
        </Card>

        {/* Center Canvas */}
        <div className="flex-1 bg-canvas rounded-lg border border-dashed border-gray-300 flex items-center justify-center relative">
          {/* Canvas Content */}
          <div className="w-96 h-96 bg-white rounded-lg shadow-lg border-2 border-gray-200 flex items-center justify-center relative">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium">Canvas por capas</h3>
              <p className="text-xs">Post activo</p>
            </div>
          </div>

          {/* BrandGuard Overlay */}
          <Card className="absolute bottom-4 right-4 p-3 bg-white shadow-sm border w-64">
            <div className="space-y-2">
              <h4 className="text-xs font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-green-600" />
                BrandGuard
              </h4>
              <div className="space-y-1">
                {brandGuardValidations.map((validation, index) => (
                  <div key={index} className="text-xs p-1.5 rounded-md bg-gray-50">
                    {validation.label}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel - Tools */}
        <Card className="w-80 bg-white shadow-sm rounded-lg">
          <Tabs defaultValue="layers" className="flex flex-col h-full">
            <div className="border-b p-3">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="layers" className="text-xs">Capas</TabsTrigger>
                <TabsTrigger value="text" className="text-xs">Texto</TabsTrigger>
                <TabsTrigger value="image" className="text-xs">Imagen</TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-3 mt-2">
                <TabsTrigger value="logo" className="text-xs">Logo</TabsTrigger>
                <TabsTrigger value="effects" className="text-xs">Efectos</TabsTrigger>
                <TabsTrigger value="a11y" className="text-xs">A11y</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3">
                {/* Tab: Capas */}
                <TabsContent value="layers" className="space-y-3 mt-0">
                  <div className="space-y-2">
                    {layers.map((layer) => (
                      <div key={layer.id} className="flex items-center gap-2 p-2 rounded-md border border-gray-200 bg-gray-50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-6 w-6"
                          onClick={() => toggleLayerVisibility(layer.id)}
                        >
                          {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-6 w-6"
                          onClick={() => toggleLayerLock(layer.id)}
                        >
                          {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </Button>
                        <span className="flex-1 text-xs">{layer.name}</span>
                        <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Tab: Texto */}
                <TabsContent value="text" className="space-y-4 mt-0">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Fuente</Label>
                      <Select value={selectedFont} onValueChange={setSelectedFont}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFonts.map((font) => (
                            <SelectItem key={font.font} value={font.font} className="text-xs">
                              {font.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Tamaño: {fontSize[0]}px</Label>
                      <Slider
                        value={fontSize}
                        onValueChange={setFontSize}
                        min={12}
                        max={96}
                        step={1}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Color</Label>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {availableColors.slice(0, 8).map((color) => (
                          <button
                            key={color.hex}
                            className={`w-5 h-5 rounded border-2 ${
                              textColor === color.hex ? 'border-gray-900' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            onClick={() => setTextColor(color.hex)}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs flex-1">
                        <Type className="w-3 h-3 mr-1" />
                        Bold
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs flex-1">
                        <Type className="w-3 h-3 mr-1" />
                        Italic
                      </Button>
                    </div>

                    <div>
                      <Label className="text-xs">OpenType / Variable</Label>
                      <p className="text-xs text-gray-500 mt-1">ejes y features</p>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Imagen */}
                <TabsContent value="image" className="space-y-4 mt-0">
                  <div className="space-y-3">
                    <Button className="w-full text-xs h-8">
                      <Image className="w-3 h-3 mr-1" />
                      Reemplazar
                    </Button>

                    <div>
                      <Label className="text-xs">Brillo: {brightness[0]}%</Label>
                      <Slider
                        value={brightness}
                        onValueChange={setBrightness}
                        min={0}
                        max={200}
                        step={1}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Contraste: {contrast[0]}%</Label>
                      <Slider
                        value={contrast}
                        onValueChange={setContrast}
                        min={0}
                        max={200}
                        step={1}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Saturación: {saturation[0]}%</Label>
                      <Slider
                        value={saturation}
                        onValueChange={setSaturation}
                        min={0}
                        max={200}
                        step={1}
                        className="mt-1"
                      />
                    </div>

                    <Button variant="ghost" className="w-full text-xs h-8">
                      <Wand2 className="w-3 h-3 mr-1" />
                      Borrar fondo (IA)
                    </Button>
                  </div>
                </TabsContent>

                {/* Tab: Logo */}
                <TabsContent value="logo" className="space-y-4 mt-0">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Variante</Label>
                      <Select value={logoVariant} onValueChange={setLogoVariant}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Principal" className="text-xs">Principal</SelectItem>
                          <SelectItem value="Negativo" className="text-xs">Negativo</SelectItem>
                          <SelectItem value="Alternativo" className="text-xs">Alternativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Tamaño: {logoSize[0]}%</Label>
                      <Slider
                        value={logoSize}
                        onValueChange={setLogoSize}
                        min={10}
                        max={200}
                        step={1}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Posición</Label>
                      <Select value={logoPosition} onValueChange={setLogoPosition}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SI" className="text-xs">Superior Izquierda</SelectItem>
                          <SelectItem value="SD" className="text-xs">Superior Derecha</SelectItem>
                          <SelectItem value="II" className="text-xs">Inferior Izquierda</SelectItem>
                          <SelectItem value="ID" className="text-xs">Inferior Derecha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Watermark</Label>
                      <Switch />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Efectos */}
                <TabsContent value="effects" className="space-y-4 mt-0">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Sombras</Label>
                      <Button variant="outline" className="w-full text-xs h-8 mt-1">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Configurar sombras
                      </Button>
                    </div>

                    <div>
                      <Label className="text-xs">Borde</Label>
                      <Button variant="outline" className="w-full text-xs h-8 mt-1">
                        Añadir borde
                      </Button>
                    </div>

                    <div>
                      <Label className="text-xs">Resplandor</Label>
                      <Button variant="outline" className="w-full text-xs h-8 mt-1">
                        Configurar glow
                      </Button>
                    </div>

                    <div>
                      <Label className="text-xs">Degradado</Label>
                      <Button variant="outline" className="w-full text-xs h-8 mt-1">
                        <Palette className="w-3 h-3 mr-1" />
                        Editor degradado
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Accesibilidad */}
                <TabsContent value="a11y" className="space-y-4 mt-0">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="text-xs p-2 rounded-md bg-green-50 border border-green-200">
                        Contraste AA: ✅
                      </div>
                      <div className="text-xs p-2 rounded-md bg-yellow-50 border border-yellow-200">
                        ⚠️ Simulación daltonismo
                      </div>
                      <div className="text-xs p-2 rounded-md bg-blue-50 border border-blue-200">
                        Tamaño mínimo texto: ✅
                      </div>
                    </div>

                    <Button variant="outline" className="w-full text-xs h-8">
                      <Eye className="w-3 h-3 mr-1" />
                      Simular daltonismo
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="border-t bg-white p-4 flex justify-between items-center">
        <Button variant="ghost" onClick={goToPreviousStep} className="text-xs">
          <ArrowLeft className="w-3 h-3 mr-1" />
          Volver
        </Button>
        
        <div className="flex gap-2">
          <Button variant="secondary" className="text-xs">
            Guardar snapshot
          </Button>
          <Button onClick={goToNextStep} className="text-xs bg-purple-500 hover:bg-purple-600">
            Siguiente: Caption & Hashtags
          </Button>
        </div>
      </div>
    </div>
  );
}