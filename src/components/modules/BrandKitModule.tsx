import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  Home,
  BadgeCheck,
  Palette,
  Type,
  Shapes,
  Image,
  Grid3X3,
  Activity,
  Megaphone,
  Layout,
  Code,
  Shield,
  Upload,
  CheckCircle,
  Eye,
  Download,
  FileText,
  Zap,
  Users,
  History,
  Search,
  Star,
  MoreHorizontal,
  ChevronRight,
  Settings,
  Sparkles,
  Loader2
} from 'lucide-react';
import { cn } from '../ui/utils';

// Types
interface BrandKitSection {
  id: string;
  label: string;
  icon: any;
  selected?: boolean;
}

interface ColorSwatch {
  hex: string;
  label: string;
  semantic?: string;
}

interface TypographyEntry {
  name: string;
  family: string;
  weights: string[];
  usage: string;
}

// Mock Data
const brandKitSections: BrandKitSection[] = [
  { id: 'resumen', label: 'Resumen', icon: Home, selected: true },
  { id: 'logos', label: 'Logos', icon: BadgeCheck },
  { id: 'paleta', label: 'Paleta', icon: Palette },
  { id: 'tipografia', label: 'Tipografía', icon: Type },
  { id: 'iconografia', label: 'Iconografía', icon: Shapes },
  { id: 'ilustracion', label: 'Ilustración & Foto', icon: Image },
  { id: 'layout', label: 'Layout & Grid', icon: Grid3X3 },
  { id: 'movimiento', label: 'Movimiento', icon: Activity },
  { id: 'voz', label: 'Voz & Mensajería', icon: Megaphone },
  { id: 'componentes', label: 'Componentes & Plantillas', icon: Layout },
  { id: 'tokens', label: 'Tokens & Export', icon: Code },
  { id: 'governance', label: 'Governance & Versiones', icon: Shield }
];

const mockColors: ColorSwatch[] = [
  { hex: '#002B5B', label: 'Primario', semantic: 'primary' },
  { hex: '#FF7A00', label: 'Secundario', semantic: 'secondary' },
  { hex: '#111827', label: 'Texto', semantic: 'text' },
  { hex: '#F3F4F6', label: 'Fondo', semantic: 'background' },
  { hex: '#10B981', label: 'Éxito', semantic: 'success' },
  { hex: '#F59E0B', label: 'Advertencia', semantic: 'warning' },
  { hex: '#EF4444', label: 'Error', semantic: 'danger' }
];

const mockTypography: TypographyEntry[] = [
  { name: 'Títulos', family: 'Montserrat', weights: ['400', '500', '600', '700'], usage: 'H1, H2, H3, títulos principales' },
  { name: 'Cuerpo', family: 'Inter', weights: ['400', '500'], usage: 'Párrafos, texto general, UI' },
  { name: 'Acentos', family: 'Playfair Display', weights: ['400', '600'], usage: 'Citas, destacados, elementos decorativos' }
];

/* ===== PASO 1: UPLOAD COMPONENTS ===== */

// File Upload Component for Step 1
function FileUploader({ onFileUpload, isUploading }: {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-16 text-center transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400",
          isUploading && "pointer-events-none opacity-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,.docx,.zip,.ai,.psd"
          onChange={handleChange}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-gray-500" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isUploading ? 'Subiendo archivo...' : 'Arrastra o selecciona tu archivo'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Formatos permitidos: PDF, DOCX, ZIP, AI, PSD
            </p>
          </div>
          
          {!isUploading && (
            <Button variant="outline" className="mt-4">
              Seleccionar archivo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 1: Upload Manual
function UploadStep({ onFileUpload, isUploading, isAnalyzing }: {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  isAnalyzing: boolean;
}) {
  return (
    <div className="h-full bg-canvas flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-gray-900">Sube tu Manual de Marca</h1>
          <p className="text-gray-600 text-lg">
            Formatos permitidos: PDF, DOCX, ZIP, AI, PSD
          </p>
        </div>

        <FileUploader onFileUpload={onFileUpload} isUploading={isUploading} />

        {isAnalyzing && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">
                    Analizando documento y extrayendo información con IA…
                  </p>
                  <Progress value={75} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Mobile Upload Step
function MobileUploadStep({ onFileUpload, isUploading, isAnalyzing }: {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  isAnalyzing: boolean;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="h-full bg-canvas p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">Sube tu Manual de Marca</h1>
          <p className="text-sm text-gray-600">
            Formatos: PDF, DOCX, ZIP, AI, PSD
          </p>
        </div>

        <div className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-colors",
          "border-gray-300 hover:border-gray-400",
          isUploading && "pointer-events-none opacity-50"
        )}>
          <input
            type="file"
            accept=".pdf,.docx,.zip,.ai,.psd"
            onChange={handleChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-gray-500" />
              )}
            </div>
            
            <div>
              <p className="font-medium text-gray-900">
                {isUploading ? 'Subiendo...' : 'Selecciona tu archivo'}
              </p>
            </div>
            
            {!isUploading && (
              <Button variant="outline" size="sm" className="mt-3">
                Seleccionar
              </Button>
            )}
          </div>
        </div>

        {isAnalyzing && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">
                    Analizando con IA…
                  </p>
                  <Progress value={75} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ===== PASO 2: BRANDKIT ULTRA PRO (MANTENER INTACTO) ===== */

// AI Extracted Badge Component
function AIExtractedBadge() {
  return (
    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
      <CheckCircle className="w-3 h-3 mr-1" />
      IA extraído
    </Badge>
  );
}

// Color Swatch Component
function ColorSwatchComponent({ color }: { color: ColorSwatch }) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div 
        className="w-8 h-8 rounded-lg border-2 border-gray-200 shadow-sm flex-shrink-0"
        style={{ backgroundColor: color.hex }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{color.label}</p>
        <p className="text-xs text-gray-500 font-mono">{color.hex}</p>
      </div>
      {color.semantic && (
        <Badge variant="outline" className="text-xs">
          {color.semantic}
        </Badge>
      )}
    </div>
  );
}

// Typography Sample Component
function TypographySample({ typography }: { typography: TypographyEntry }) {
  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">{typography.name}</h4>
        <AIExtractedBadge />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Familia: {typography.family}</p>
        <p className="text-sm text-gray-600">Pesos: {typography.weights.join(', ')}</p>
        <p className="text-xs text-gray-500">{typography.usage}</p>
      </div>
      <div className="pt-2 border-t border-gray-200">
        <p className="text-lg" style={{ fontFamily: typography.family }}>
          Ejemplo de texto en {typography.family}
        </p>
      </div>
    </div>
  );
}

// Sidebar Navigation Component
function BrandKitSidebar({ 
  activeSection, 
  onSectionChange 
}: { 
  activeSection: string; 
  onSectionChange: (section: string) => void; 
}) {
  return (
    <div className="w-70 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg">BrandKit — Manual vivo</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-1">
          {brandKitSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                  activeSection === section.id 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-gray-100"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{section.label}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}

// Top Bar Component
function BrandKitTopBar() {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-3">
        <AIExtractedBadge />
        <Separator orientation="vertical" className="h-6" />
        <Badge variant="outline" className="text-xs">
          Última actualización: hace 2 horas
        </Badge>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="secondary" size="sm" className="gap-2">
          <Shield className="w-4 h-4" />
          Validar BrandKit (BrandGuard)
        </Button>
        <Button size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar todo
        </Button>
      </div>
    </div>
  );
}

// Section Content Components
function ResumenSection() {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Resumen de identidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Logo Preview */}
            <div className="space-y-3">
              <Label>Logo principal</Label>
              <div className="aspect-video bg-gradient-to-br from-blue-300 to-blue-500 rounded-lg flex items-center justify-center text-white">
                <BadgeCheck className="w-12 h-12" />
              </div>
              <AIExtractedBadge />
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Colores clave</Label>
                <AIExtractedBadge />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {mockColors.slice(0, 4).map((color, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-200"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs text-gray-600">{color.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tipografías</Label>
                <AIExtractedBadge />
              </div>
              <div className="space-y-2">
                {mockTypography.map((typo, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{typo.name}:</span>{' '}
                    <span className="text-gray-600">{typo.family}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LogosSection() {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Logos (variantes & reglas)</CardTitle>
            <AIExtractedBadge />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Uploads */}
            <div className="space-y-4">
              <div>
                <Label>Logo principal (SVG/PNG)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">SVG, PNG hasta 5MB</p>
                  <AIExtractedBadge />
                </div>
              </div>
              <div>
                <Label>Logo negativo / alternativo</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">SVG, PNG hasta 5MB</p>
                  <AIExtractedBadge />
                </div>
              </div>
            </div>

            {/* Usage Rules */}
            <div className="space-y-4">
              <h4 className="font-medium">Reglas de uso</h4>
              
              <div className="space-y-4">
                <div>
                  <Label>Clear space (x)</Label>
                  <Slider defaultValue={[1]} max={4} min={0.5} step={0.1} className="mt-2" />
                  <p className="text-xs text-gray-500 mt-1">Espacio mínimo alrededor del logo</p>
                </div>

                <div>
                  <Label>Tamaño mínimo (px)</Label>
                  <Slider defaultValue={[48]} max={256} min={16} step={4} className="mt-2" />
                  <p className="text-xs text-gray-500 mt-1">Tamaño mínimo legible</p>
                </div>

                <div>
                  <Label>Fondos permitidos</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Claro', 'Oscuro', 'Foto desenfocada'].map((option) => (
                      <Badge key={option} variant="secondary" className="cursor-pointer">
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Tester */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tester de logo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="aspect-video bg-white border rounded-lg flex items-center justify-center">
                      <BadgeCheck className="w-8 h-8 text-gray-800" />
                      <p className="text-xs text-gray-500 mt-2">Fondo claro</p>
                    </div>
                    <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                      <BadgeCheck className="w-8 h-8 text-white" />
                      <p className="text-xs text-gray-300 mt-2">Fondo oscuro</p>
                    </div>
                    <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <BadgeCheck className="w-8 h-8 text-white" />
                      <p className="text-xs text-white mt-2">Fondo colorido</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Comprueba legibilidad en diferentes contextos
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PaletaSection() {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Paleta de color & Accesibilidad</CardTitle>
            <AIExtractedBadge />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Color Matrix */}
            <div className="space-y-4">
              <h4 className="font-medium">Matriz de contraste (WCAG)</h4>
              <div className="space-y-2">
                {mockColors.slice(0, 4).map((color, index) => (
                  <ColorSwatchComponent key={index} color={color} />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Evalúa AA/AAA entre texto y fondo
              </p>
            </div>

            {/* Semantic Controls */}
            <div className="space-y-4">
              <h4 className="font-medium">Escalas y semántica</h4>
              
              <div>
                <Label>Semántica</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['primary', 'secondary', 'success', 'warning', 'danger'].map((semantic) => (
                    <Badge key={semantic} variant="outline" className="cursor-pointer">
                      {semantic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Modo</Label>
                <Select defaultValue="auto">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Accessibility Report */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Accesibilidad AA cumplida
                  </span>
                </div>
                <p className="text-xs text-green-700">
                  Todos los contrastes superan el ratio 4.5:1 requerido
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TipografiaSection() {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tipografía (sistema tipográfico)</CardTitle>
            <AIExtractedBadge />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Typography Samples */}
            {mockTypography.map((typo, index) => (
              <TypographySample key={index} typography={typo} />
            ))}
          </div>

          <Separator className="my-6" />

          {/* Typography Rules */}
          <div className="space-y-4">
            <h4 className="font-medium">Reglas de lectura</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Tracking titular</Label>
                <Slider defaultValue={[0]} max={10} min={-5} step={1} className="mt-2" />
              </div>
              <div>
                <Label>Line-height</Label>
                <Slider defaultValue={[1.5]} max={2} min={1} step={0.1} className="mt-2" />
              </div>
              <div>
                <Label>Escala modular</Label>
                <Select defaultValue="perfect-fourth">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="major-third">Major Third</SelectItem>
                    <SelectItem value="perfect-fourth">Perfect Fourth</SelectItem>
                    <SelectItem value="golden">Golden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IconografiaSection() {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Iconografía</CardTitle>
            <AIExtractedBadge />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Estilo</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Lineal', 'Filled', 'Duotono'].map((style) => (
                  <Badge key={style} variant="secondary" className="cursor-pointer">
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Trazos, esquinas, grid de 24px, área viva y línea base
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IlustracionSection() {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ilustración & Fotografía</CardTitle>
            <AIExtractedBadge />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="illustration-guide">Guía de estilo de ilustración</Label>
              <Textarea
                id="illustration-guide"
                defaultValue="Minimal, flat, 2-3 colores dominantes"
                className="mt-2"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="photography-guide">Guía de fotografía</Label>
              <Textarea
                id="photography-guide"
                defaultValue="Luz natural, composiciones limpias, tonos cálidos"
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LayoutSection() {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Layout & Grid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Grid base</Label>
              <Select defaultValue="8pt">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4pt">4pt</SelectItem>
                  <SelectItem value="8pt">8pt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Columns (web)</Label>
              <Slider defaultValue={[12]} max={16} min={4} step={1} className="mt-2" />
            </div>
            <div>
              <Label>Gutters (px)</Label>
              <Slider defaultValue={[24]} max={48} min={8} step={4} className="mt-2" />
            </div>
            <div>
              <Label>Radius (tokens)</Label>
              <Slider defaultValue={[12]} max={32} min={0} step={2} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MovimientoSection() {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Movimiento (motion system)</CardTitle>
            <AIExtractedBadge />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Curvas</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Standard', 'Entrance', 'Exit'].map((curve) => (
                  <Badge key={curve} variant="secondary" className="cursor-pointer">
                    {curve}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Duración (ms)</Label>
              <Slider defaultValue={[180]} max={600} min={80} step={20} className="mt-2" />
            </div>
            <p className="text-sm text-gray-600">
              Microinteracciones coherentes con la marca
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VozSection() {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Voz & Mensajería</CardTitle>
            <AIExtractedBadge />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tone-voice">Tono de voz</Label>
              <Textarea
                id="tone-voice"
                defaultValue="Cercano, optimista, directo"
                className="mt-2"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="key-messages">Mensajes clave</Label>
              <Textarea
                id="key-messages"
                defaultValue="Confianza, rapidez, cuidado"
                className="mt-2"
                rows={3}
              />
            </div>
            <div>
              <Label>Do/Don't</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Promesas medibles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4 text-red-600">❌</span>
                  <span className="text-sm">Jerga técnica innecesaria</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ComponentesSection() {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Componentes & Plantillas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <div className="aspect-video bg-gradient-to-br from-orange-300 to-orange-500 rounded-lg flex items-center justify-center text-white">
                <Image className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium">Post IG plantilla</p>
            </div>
            <div className="space-y-2">
              <div className="aspect-video bg-gradient-to-br from-purple-300 to-purple-500 rounded-lg flex items-center justify-center text-white">
                <Layout className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium">Historia 9:16 plantilla</p>
            </div>
            <div className="space-y-2">
              <div className="aspect-video bg-gradient-to-br from-gray-300 to-gray-500 rounded-lg flex items-center justify-center text-white">
                <Activity className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium">Miniatura Video</p>
            </div>
          </div>
          <Button variant="secondary" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Generar ejemplos con IA
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function TokensSection() {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Design Tokens & Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Options */}
            <div className="space-y-3">
              <h4 className="font-medium">Exportar a</h4>
              <div className="space-y-2">
                {[
                  'Style Dictionary (JSON)',
                  'CSS variables (tokens.css)',
                  'Tailwind config (tailwind.config.js)',
                  'Figma Variables (JSON)',
                  'Adobe ASE / .sketchpalette',
                  'Pack de documentos (.docx/.pptx/.slides)',
                  'ZIP de marca (logos + guías + tokens)'
                ].map((option) => (
                  <div key={option} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm">{option}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Semantic Mapping */}
            <div className="space-y-3">
              <h4 className="font-medium">Mapeo semántico</h4>
              <div className="space-y-3">
                <div>
                  <Label>primary →</Label>
                  <Select defaultValue="#002B5B">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#002B5B">#002B5B</SelectItem>
                      <SelectItem value="#005C99">#005C99</SelectItem>
                      <SelectItem value="#0EA5E9">#0EA5E9</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>secondary →</Label>
                  <Select defaultValue="#FF7A00">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#FF7A00">#FF7A00</SelectItem>
                      <SelectItem value="#F59E0B">#F59E0B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>text →</Label>
                  <Select defaultValue="#111827">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#111827">#111827</SelectItem>
                      <SelectItem value="#0B0C0E">#0B0C0E</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GovernanceSection() {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Governance, Versiones y Auditoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Roles */}
            <div className="space-y-3">
              <h4 className="font-medium">Roles & permisos</h4>
              <div className="space-y-2">
                {['Admin Brand', 'Editor', 'Viewer'].map((role) => (
                  <div key={role} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm">{role}</span>
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Versions */}
            <div className="space-y-3">
              <h4 className="font-medium">Versiones</h4>
              <div className="space-y-2">
                {[
                  'v1 - importado',
                  'v2 - ajustes color',
                  'v3 - modo dark'
                ].map((version) => (
                  <div key={version} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm">{version}</span>
                    <History className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Audit */}
            <div className="space-y-3">
              <h4 className="font-medium">Auditoría</h4>
              <div className="space-y-2">
                {[
                  '10/10 — Logo actualizado',
                  '11/10 — Tokens exportados',
                  '12/10 — Validación AA completada'
                ].map((entry) => (
                  <div key={entry} className="p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-600">{entry}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button variant="ghost" className="gap-2">
              <History className="w-4 h-4" />
              Comparar v2 vs v3
            </Button>
            <Button className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Solicitar aprobación
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Content Component
function BrandKitMainContent({ activeSection }: { activeSection: string }) {
  const renderSection = () => {
    switch (activeSection) {
      case 'resumen': return <ResumenSection />;
      case 'logos': return <LogosSection />;
      case 'paleta': return <PaletaSection />;
      case 'tipografia': return <TipografiaSection />;
      case 'iconografia': return <IconografiaSection />;
      case 'ilustracion': return <IlustracionSection />;
      case 'layout': return <LayoutSection />;
      case 'movimiento': return <MovimientoSection />;
      case 'voz': return <VozSection />;
      case 'componentes': return <ComponentesSection />;
      case 'tokens': return <TokensSection />;
      case 'governance': return <GovernanceSection />;
      default: return <ResumenSection />;
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <BrandKitTopBar />
      <div className="flex-1 overflow-auto p-6">
        {renderSection()}
      </div>
    </div>
  );
}

// Mobile Navigation Component
function MobileBrandKitNav({ 
  activeSection, 
  onSectionChange 
}: { 
  activeSection: string; 
  onSectionChange: (section: string) => void; 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const activeItem = brandKitSections.find(s => s.id === activeSection);
  const ActiveIcon = activeItem?.icon || Home;

  return (
    <div className="bg-white border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <ActiveIcon className="w-5 h-5" />
          <span className="font-medium">{activeItem?.label}</span>
        </div>
        <ChevronRight className={cn("w-4 h-4 transition-transform", isOpen && "rotate-90")} />
      </button>

      {isOpen && (
        <div className="border-t border-gray-100">
          <ScrollArea className="max-h-80">
            <div className="p-2 space-y-1">
              {brandKitSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      onSectionChange(section.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                      activeSection === section.id 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// Mobile Top Bar Component
function MobileBrandKitTopBar() {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-semibold text-lg">BrandKit — Manual vivo</h1>
        <AIExtractedBadge />
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="secondary" size="sm" className="gap-2 flex-1">
          <Shield className="w-4 h-4" />
          Validar
        </Button>
        <Button size="sm" className="gap-2 flex-1">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>
    </div>
  );
}

// Mobile-optimized section components with collapsed cards
function MobileLogosSection() {
  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Logos</CardTitle>
            <AIExtractedBadge />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Logo principal</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">SVG, PNG</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm">Logo alternativo</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">SVG, PNG</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <h5 className="font-medium text-sm">Reglas de uso</h5>
            <div>
              <Label className="text-sm">Clear space</Label>
              <Slider defaultValue={[1]} max={4} min={0.5} step={0.1} className="mt-2" />
            </div>
            <div>
              <Label className="text-sm">Tamaño mínimo</Label>
              <Slider defaultValue={[48]} max={256} min={16} step={4} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 2: BrandKit Ultra Pro Component (MANTENER INTACTO)
function BrandKitUltraProStep() {
  const [activeSection, setActiveSection] = useState('resumen');
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-full bg-canvas">
        <MobileBrandKitTopBar />
        <MobileBrandKitNav 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <div className="overflow-auto p-4">
          {activeSection === 'logos' ? (
            <MobileLogosSection />
          ) : (
            // For other sections, use the desktop components but with mobile-optimized spacing
            <div className="space-y-4">
              {(() => {
                switch (activeSection) {
                  case 'resumen': return <ResumenSection />;
                  case 'paleta': return <PaletaSection />;
                  case 'tipografia': return <TipografiaSection />;
                  case 'iconografia': return <IconografiaSection />;
                  case 'ilustracion': return <IlustracionSection />;
                  case 'layout': return <LayoutSection />;
                  case 'movimiento': return <MovimientoSection />;
                  case 'voz': return <VozSection />;
                  case 'componentes': return <ComponentesSection />;
                  case 'tokens': return <TokensSection />;
                  case 'governance': return <GovernanceSection />;
                  default: return <ResumenSection />;
                }
              })()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-full flex bg-canvas">
      <BrandKitSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <BrandKitMainContent activeSection={activeSection} />
    </div>
  );
}

// Main BrandKit Module Component with Steps
export function BrandKitModule() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'brandkit'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUploading(false);
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsAnalyzing(false);
    
    // Automatically move to Step 2 (BrandKit Ultra Pro)
    setCurrentStep('brandkit');
  };

  // Show upload step first
  if (currentStep === 'upload') {
    if (isMobile) {
      return (
        <MobileUploadStep
          onFileUpload={handleFileUpload}
          isUploading={isUploading}
          isAnalyzing={isAnalyzing}
        />
      );
    }

    return (
      <UploadStep
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
        isAnalyzing={isAnalyzing}
      />
    );
  }

  // Show BrandKit Ultra Pro (Step 2) - MANTENER INTACTO
  return <BrandKitUltraProStep />;
}

export default BrandKitModule;