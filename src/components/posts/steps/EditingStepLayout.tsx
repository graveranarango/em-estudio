import { useState, useEffect } from 'react';
import { ArrowLeft, Send, MessageSquare, Search, Edit, Paintbrush, Type, Crop, Wand2, CheckCircle, AlertTriangle, Download, Menu, Settings, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { ScrollArea } from '../../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Checkbox } from '../../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../ui/dropdown-menu';
import { usePostProject } from '../../../contexts/PostProjectContext';

interface ChatBubbleProps {
  type: 'system' | 'user' | 'assistant';
  content: string;
  meta?: string;
}

const ChatBubble = ({ type, content, meta }: ChatBubbleProps) => {
  const bubbleStyles = {
    system: 'bg-bubble-system text-yellow-800 mx-2 sm:mx-4',
    user: 'bg-bubble-user text-white ml-auto mr-2 sm:mr-4 max-w-[85%] sm:max-w-[80%]',
    assistant: 'bg-bubble-assistant text-gray-700 mr-auto ml-2 sm:ml-4 max-w-[85%] sm:max-w-[80%]'
  };

  return (
    <div className={`rounded-xl px-3 py-2 text-sm ${bubbleStyles[type]}`}>
      <p>{content}</p>
      {meta && (
        <div className="text-xs opacity-70 mt-1">
          {meta}
        </div>
      )}
    </div>
  );
};

interface MenuBarProps {
  onCommand: (command: string) => void;
}

const MenuBar = ({ onCommand }: MenuBarProps) => {
  const menuItems = [
    {
      label: 'Archivo',
      items: ['Nuevo post', 'Duplicar', 'Guardar snapshot', 'Exportar…']
    },
    {
      label: 'Edición',
      items: ['Deshacer', 'Rehacer', 'Copiar estilo', 'Pegar estilo']
    },
    {
      label: 'Capas',
      items: ['Agrupar', 'Máscara IA', 'Mostrar/ocultar', 'Bloquear']
    },
    {
      label: 'Tipografía',
      items: ['Fuente BrandKit', 'Variable Fonts', 'Estilos H1/H2']
    },
    {
      label: 'Color & Estilos',
      items: ['Paleta BrandKit', 'Degradados', 'Gradient Map']
    },
    {
      label: 'Imagen & IA',
      items: ['Relleno generativo', 'Reemplazar', 'Curvas', 'LUTs']
    },
    {
      label: 'Transformar',
      items: ['Escalar', 'Rotar', 'Warp mesh', 'Perspective']
    },
    {
      label: 'BrandGuard',
      items: ['Checklist', 'Auto-fix', 'Reporte']
    },
    {
      label: 'Accesibilidad',
      items: ['Contraste', 'ALT sugerido', 'Tamaño mínimo texto']
    },
    {
      label: 'Previsualizar',
      items: ['Instagram feed', 'LinkedIn', 'X Post', 'Modo oscuro']
    }
  ];

  return (
    <div className="h-8 sm:h-9 bg-surface border-b border-border flex items-center px-1 sm:px-3 shadow-sm overflow-x-auto">
      <div className="flex items-center gap-1 sm:gap-4 min-w-max">
        {menuItems.map((menu, index) => (
          <div key={menu.label} className={index >= 3 ? "hidden sm:block" : ""}>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 sm:h-7 px-1 sm:px-2 text-[10px] sm:text-xs hover:bg-surface-elev-1 whitespace-nowrap">
                {menu.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
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
          </div>
        ))}
      </div>
    </div>
  );
};

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette = ({ isOpen, onClose }: CommandPaletteProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const commandExamples = [
    {
      icon: Edit,
      label: 'Haz el logo 150% y muévelo a la esquina inferior derecha',
      category: 'edit'
    },
    {
      icon: Paintbrush,
      label: 'Aplica color secundario al fondo y verifica contraste',
      category: 'style'
    },
    {
      icon: Type,
      label: 'Convierte este título a H1 del BrandKit',
      category: 'typography'
    },
    {
      icon: Crop,
      label: 'Recorta el diseño a 9:16 y recompón',
      category: 'transform'
    },
    {
      icon: Wand2,
      label: 'Aplica filtro LUT \'cinemático\'',
      category: 'effects'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-4 rounded-lg shadow-lg">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-sm font-medium">
            Paleta de comandos (⌘/Ctrl+K)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Busca y ejecuta comandos rápidamente
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2">
          {/* Command Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Escribe un comando…"
              className="pl-9 h-9 text-xs rounded-lg"
              autoFocus
            />
          </div>

          {/* Command List */}
          <ScrollArea className="max-h-60">
            <div className="space-y-1.5">
              {commandExamples.map((command, index) => {
                const Icon = command.icon;
                return (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 p-2.5 text-left rounded-lg hover:bg-surface-elev-1 border border-transparent hover:border-border transition-colors h-10"
                    onClick={onClose}
                  >
                    <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-foreground truncate">
                      {command.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface BrandGuardOverlayProps {
  onAutoFix: () => void;
  onShowReport: () => void;
}

const BrandGuardOverlay = ({ onAutoFix, onShowReport }: BrandGuardOverlayProps) => {
  const validations = [
    {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Colores dentro del BrandKit'
    },
    {
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      label: 'Contraste bajo en subtítulo (AA-)'
    },
    {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Logo ≥ tamaño mínimo (96px)'
    },
    {
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      label: 'Texto contiene palabra a evitar: \'gratis\''
    }
  ];

  return (
    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-[260px] sm:w-[280px] bg-surface-elev-1 rounded-xl p-2 sm:p-3 shadow-lg border border-border">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-foreground">BrandGuard — Validaciones</h3>
      </div>
      
      <div className="space-y-1.5 mb-3">
        {validations.map((validation, index) => {
          const Icon = validation.icon;
          return (
            <div key={index} className={`flex items-center gap-2 p-2 rounded-lg border ${validation.bgColor} ${validation.color} h-8`}>
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs truncate">{validation.label}</span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onShowReport}
          className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs"
        >
          Ver reporte
        </Button>
        <Button 
          size="sm" 
          onClick={onAutoFix}
          className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs bg-purple-500 hover:bg-purple-600"
        >
          Autocorregir
        </Button>
      </div>
    </div>
  );
};

interface PreflightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueExport: () => void;
}

const PreflightModal = ({ isOpen, onClose, onContinueExport }: PreflightModalProps) => {
  const checklistItems = [
    { status: 'success', label: '✔ Logo en zona segura' },
    { status: 'success', label: '✔ Paleta de colores válida' },
    { status: 'warning', label: '⚠️ Contraste mínimo WCAG AA no cumplido' },
    { status: 'success', label: '✔ Tipografía aprobada (Montserrat)' },
    { status: 'success', label: '✔ Resolución adecuada (1080×1080)' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md p-3 sm:p-4 rounded-xl shadow-xl mx-2">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-sm font-medium">
            Preflight antes de exportar
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Revisa estos puntos antes de continuar con la exportación
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {/* Checklist */}
          <div className="space-y-1.5">
            {checklistItems.map((item, index) => (
              <div 
                key={index} 
                className={`p-2.5 rounded-lg text-xs h-8 flex items-center ${
                  item.status === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-amber-50 border border-amber-200 text-amber-800'
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-xs flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button 
              onClick={onContinueExport}
              className="text-xs bg-purple-500 hover:bg-purple-600 flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">Continuar exportación</span>
              <span className="sm:hidden">Continuar</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface PlatformPreviewsProps {}

const PlatformPreviews = ({}: PlatformPreviewsProps) => {
  const previews = [
    {
      label: 'Instagram Feed',
      size: { width: 240, height: 240 },
      bgColor: 'bg-purple-500'
    },
    {
      label: 'LinkedIn Timeline', 
      size: { width: 320, height: 180 },
      bgColor: 'bg-blue-500'
    },
    {
      label: 'Twitter/X Post',
      size: { width: 320, height: 180 },
      bgColor: 'bg-slate-600'
    }
  ];

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Vista previa en plataformas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {previews.map((preview, index) => (
          <div key={index} className="space-y-2">
            <label className="text-xs text-muted-foreground">{preview.label}</label>
            <div 
              className={`${preview.bgColor} rounded-xl border border-black/10 shadow-xs p-1.5 flex items-center justify-center w-full`}
              style={{ 
                maxWidth: `${Math.min(preview.size.width, 280)}px`, 
                height: `${Math.min(preview.size.height, 120)}px`,
                aspectRatio: `${preview.size.width} / ${preview.size.height}`
              }}
            >
              <div className="text-white text-xs opacity-75 text-center">
                <div className="mb-1">Post Preview</div>
                <div className="text-[10px]">{preview.size.width}×{preview.size.height}</div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

interface ExportMultipostProps {
  onExport: () => void;
  onCancel: () => void;
}

const ExportMultipost = ({ onExport, onCancel }: ExportMultipostProps) => {
  const [selectedFormats, setSelectedFormats] = useState(['square']);
  const [selectedFiles, setSelectedFiles] = useState(['png']);
  const [selectedPosts, setSelectedPosts] = useState(['p1']);

  const formats = [
    { label: '1:1 (Instagram, LinkedIn)', value: 'square' },
    { label: '9:16 (Stories, TikTok)', value: 'vertical' },
    { label: '16:9 (LinkedIn, X)', value: 'horizontal' }
  ];

  const fileTypes = [
    { label: 'PNG', value: 'png' },
    { label: 'JPG', value: 'jpg' },
    { label: 'SVG', value: 'svg' },
    { label: 'PDF', value: 'pdf' }
  ];

  const posts = [
    { label: 'Post 1', value: 'p1' },
    { label: 'Post 2', value: 'p2' },
    { label: 'Post 3', value: 'p3' }
  ];

  const handleFormatChange = (value: string, checked: boolean) => {
    if (checked) {
      setSelectedFormats([...selectedFormats, value]);
    } else {
      setSelectedFormats(selectedFormats.filter(f => f !== value));
    }
  };

  const handleFileChange = (value: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles([...selectedFiles, value]);
    } else {
      setSelectedFiles(selectedFiles.filter(f => f !== value));
    }
  };

  const handlePostChange = (value: string, checked: boolean) => {
    if (checked) {
      setSelectedPosts([...selectedPosts, value]);
    } else {
      setSelectedPosts(selectedPosts.filter(p => p !== value));
    }
  };

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Exportación multipost</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formatos */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground block">Formatos</label>
          <div className="space-y-1.5">
            {formats.map((format) => (
              <div key={format.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`format-${format.value}`}
                  checked={selectedFormats.includes(format.value)}
                  onCheckedChange={(checked) => handleFormatChange(format.value, checked as boolean)}
                  className="w-3 h-3"
                />
                <label htmlFor={`format-${format.value}`} className="text-xs leading-none">
                  {format.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Archivos */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground block">Archivos</label>
          <div className="space-y-1.5">
            {fileTypes.map((fileType) => (
              <div key={fileType.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`file-${fileType.value}`}
                  checked={selectedFiles.includes(fileType.value)}
                  onCheckedChange={(checked) => handleFileChange(fileType.value, checked as boolean)}
                  className="w-3 h-3"
                />
                <label htmlFor={`file-${fileType.value}`} className="text-xs leading-none">
                  {fileType.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground block">Aplicar a</label>
          <div className="space-y-1.5">
            {posts.map((post) => (
              <div key={post.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`post-${post.value}`}
                  checked={selectedPosts.includes(post.value)}
                  onCheckedChange={(checked) => handlePostChange(post.value, checked as boolean)}
                  className="w-3 h-3"
                />
                <label htmlFor={`post-${post.value}`} className="text-xs leading-none">
                  {post.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="text-xs"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onExport}
            className="text-xs bg-purple-500 hover:bg-purple-600"
          >
            <Download className="w-3 h-3 mr-1" />
            Exportar seleccionados
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EditingStepLayout() {
  const { goToPreviousStep, goToNextStep } = usePostProject();
  const [chatInput, setChatInput] = useState('');
  const [activePosts] = useState(['Post 1', 'Post 2', 'Post 3']);
  const [currentPost, setCurrentPost] = useState('Post 1');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isPreflightOpen, setIsPreflightOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  
  const [chatMessages] = useState([
    { type: 'system' as const, content: 'IA lista para edición.' },
    { type: 'user' as const, content: 'Haz el logo más grande.', meta: '10:24' }
  ]);

  // Command palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    // Logic to send message would go here
    setChatInput('');
  };

  const handleMenuCommand = (command: string) => {
    console.log('Menu command:', command);
    // Menu command logic would go here
  };

  const handleBrandGuardAutoFix = () => {
    console.log('BrandGuard auto-fix triggered');
    // Auto-fix logic would go here
  };

  const handleShowBrandGuardReport = () => {
    console.log('Show BrandGuard report');
    // Show report logic would go here
  };

  const handleContinueExport = () => {
    console.log('Continue with export');
    setIsPreflightOpen(false);
    // Export logic would go here
  };

  const handleExportMultipost = () => {
    console.log('Export multipost triggered');
    // Export multipost logic would go here
  };

  const handleCancelExport = () => {
    console.log('Cancel export');
    // Cancel export logic would go here
  };

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Header */}
      <header className="h-12 sm:h-14 flex items-center justify-between px-2 sm:px-3 bg-surface-elev-1 shadow-sm border-b border-border">
        <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">Edición de Posts</h1>
        
        <div className="flex-1" />
        
        {/* Multi-post tabs - Only show if multiple posts and screen is large enough */}
        {activePosts.length > 1 && (
          <div className="hidden sm:block">
            <Tabs value={currentPost} onValueChange={setCurrentPost}>
              <TabsList className="bg-surface border border-border">
                {activePosts.map((post) => (
                  <TabsTrigger 
                    key={post} 
                    value={post}
                    className="text-xs px-2 sm:px-3 py-1.5"
                  >
                    {post}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}
      </header>

      {/* Menu Bar */}
      <MenuBar onCommand={handleMenuCommand} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Column - Hidden on mobile, sidebar on tablet, fixed on desktop */}
        <div className="hidden md:flex md:w-[280px] lg:w-[300px] bg-surface border-r border-border flex-col">
          {/* Chat Header */}
          <div className="h-11 flex items-center px-3 border-b border-border">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-semibold">Chat IA</span>
          </div>

          {/* Chat Timeline */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-2">
              {chatMessages.map((message, index) => (
                <ChatBubble
                  key={index}
                  type={message.type}
                  content={message.content}
                  meta={message.meta}
                />
              ))}
            </div>
          </ScrollArea>

          {/* Chat Composer */}
          <div className="h-25 p-2 bg-surface border-t border-border shadow-sm">
            <div className="space-y-2">
              <Textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Escribe instrucción…"
                className="min-h-[60px] text-sm resize-none bg-surface border border-border rounded-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                size="sm"
                className="w-full text-xs h-8"
              >
                <Send className="w-3 h-3 mr-1" />
                Enviar
              </Button>
            </div>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-canvas flex items-center justify-center p-2 sm:p-4 lg:p-8 relative">
          <div className="w-full h-full max-w-[400px] max-h-[400px] sm:max-w-[600px] sm:max-h-[600px] lg:max-w-[800px] lg:max-h-[800px] bg-white rounded-lg shadow-lg border-2 border-dashed border-border flex items-center justify-center aspect-square">
            <div className="text-center text-muted-foreground px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-surface-elev-1 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-medium mb-2">Lienzo del Post</h3>
              <p className="text-xs sm:text-sm opacity-75">Canvas de edición por capas</p>
            </div>
          </div>

          {/* BrandGuard Overlay */}
          <BrandGuardOverlay 
            onAutoFix={handleBrandGuardAutoFix}
            onShowReport={handleShowBrandGuardReport}
          />

          {/* Mobile Floating Action Buttons */}
          <div className="md:hidden absolute bottom-4 left-4 flex flex-col gap-2">
            <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg">
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <div className="h-full flex flex-col">
                  <div className="h-11 flex items-center px-3 border-b border-border">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-semibold">Chat IA</span>
                  </div>
                  
                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-2">
                      {chatMessages.map((message, index) => (
                        <ChatBubble
                          key={index}
                          type={message.type}
                          content={message.content}
                          meta={message.meta}
                        />
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="h-25 p-2 bg-surface border-t border-border shadow-sm">
                    <div className="space-y-2">
                      <Textarea
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Escribe instrucción…"
                        className="min-h-[60px] text-sm resize-none bg-surface border border-border rounded-lg"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim()}
                        size="sm"
                        className="w-full text-xs h-8"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile Inspector Button */}
          <div className="lg:hidden absolute bottom-4 right-16 sm:right-20">
            <Sheet open={isInspectorOpen} onOpenChange={setIsInspectorOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-600 shadow-lg">
                  <Settings className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[320px] p-0">
                <div className="h-full flex flex-col">
                  <Tabs defaultValue="capas" className="flex flex-col h-full">
                    <div className="border-b border-border bg-surface px-3 py-2">
                      <TabsList className="grid w-full grid-cols-3 bg-surface-elev-1">
                        <TabsTrigger value="capas" className="text-xs">Capas</TabsTrigger>
                        <TabsTrigger value="texto" className="text-xs">Texto</TabsTrigger>
                        <TabsTrigger value="imagen" className="text-xs">Imagen/Fondo</TabsTrigger>
                      </TabsList>
                      <TabsList className="grid w-full grid-cols-3 bg-surface-elev-1 mt-1">
                        <TabsTrigger value="logo" className="text-xs">Logo</TabsTrigger>
                        <TabsTrigger value="efectos" className="text-xs">Efectos</TabsTrigger>
                        <TabsTrigger value="a11y" className="text-xs">Accesibilidad</TabsTrigger>
                      </TabsList>
                    </div>

                    <ScrollArea className="flex-1">
                      {/* Same content as desktop inspector */}
                      <div className="p-3">
                        <TabsContent value="capas" className="space-y-2 mt-0">
                          <div className="space-y-1.5">
                            {[
                              { label: 'Fondo', actions: ['👁️', '🔒'] },
                              { label: 'Imagen principal', actions: ['👁️', '🔒', '📄'] },
                              { label: 'Texto título', actions: ['👁️', '🔒', '✎'] },
                              { label: 'Logo', actions: ['👁️', '🔒'] }
                            ].map((layer, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-surface rounded-lg border border-border h-10">
                                <span className="text-xs text-foreground">{layer.label}</span>
                                <div className="flex gap-1">
                                  {layer.actions.map((action, actionIndex) => (
                                    <button 
                                      key={actionIndex} 
                                      className="w-6 h-6 text-xs hover:bg-surface-elev-1 rounded flex items-center justify-center"
                                    >
                                      {action}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </div>
                    </ScrollArea>

                    <div className="p-3 border-t border-border">
                      <PlatformPreviews />
                    </div>

                    <div className="p-3 border-t border-border">
                      <ExportMultipost 
                        onExport={handleExportMultipost}
                        onCancel={handleCancelExport}
                      />
                    </div>
                  </Tabs>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Inspector Panel - Hidden on mobile, drawer on tablet, fixed on desktop */}
        <div className="hidden lg:flex lg:w-[300px] xl:w-[320px] bg-surface-elev-1 border-l border-border flex-col">
          {/* Inspector Tabs */}
          <Tabs defaultValue="capas" className="flex flex-col h-full">
            <div className="border-b border-border bg-surface px-3 py-2">
              <TabsList className="grid w-full grid-cols-3 bg-surface-elev-1">
                <TabsTrigger value="capas" className="text-xs">Capas</TabsTrigger>
                <TabsTrigger value="texto" className="text-xs">Texto</TabsTrigger>
                <TabsTrigger value="imagen" className="text-xs">Imagen/Fondo</TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-3 bg-surface-elev-1 mt-1">
                <TabsTrigger value="logo" className="text-xs">Logo</TabsTrigger>
                <TabsTrigger value="efectos" className="text-xs">Efectos</TabsTrigger>
                <TabsTrigger value="a11y" className="text-xs">Accesibilidad</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3">
                {/* Tab: Capas */}
                <TabsContent value="capas" className="space-y-2 mt-0">
                  <div className="space-y-1.5">
                    {[
                      { label: 'Fondo', actions: ['👁️', '🔒'] },
                      { label: 'Imagen principal', actions: ['👁️', '🔒', '📄'] },
                      { label: 'Texto título', actions: ['👁️', '🔒', '✎'] },
                      { label: 'Logo', actions: ['👁️', '🔒'] }
                    ].map((layer, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-surface rounded-lg border border-border h-10">
                        <span className="text-xs text-foreground">{layer.label}</span>
                        <div className="flex gap-1">
                          {layer.actions.map((action, i) => (
                            <button key={i} className="text-xs p-1 hover:bg-surface-elev-1 rounded">
                              {action}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Tab: Texto */}
                <TabsContent value="texto" className="space-y-3 mt-0">
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Fuente</label>
                      <select className="w-full text-xs p-2 bg-surface border border-border rounded-lg">
                        <option>Montserrat</option>
                        <option>Inter</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Tamaño</label>
                      <input type="range" min="12" max="72" defaultValue="24" className="w-full" />
                      <div className="text-xs text-muted-foreground mt-1">24px</div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Color</label>
                      <div className="flex gap-1 flex-wrap">
                        {['#6366f1', '#f97316', '#0891b2', '#059669', '#dc2626', '#6b7280'].map((color, i) => (
                          <div key={i} className="w-5 h-5 rounded-full border border-border cursor-pointer" style={{ backgroundColor: color }}></div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <label className="flex items-center gap-1 text-xs">
                        <input type="checkbox" className="w-3 h-3" />
                        Negrita
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input type="checkbox" className="w-3 h-3" />
                        Cursiva
                      </label>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Imagen/Fondo */}
                <TabsContent value="imagen" className="space-y-3 mt-0">
                  <div className="space-y-2.5">
                    <button className="w-full text-xs p-2 bg-surface border border-border rounded-lg hover:bg-surface-elev-1">
                      Reemplazar imagen
                    </button>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Brillo</label>
                      <input type="range" min="0" max="200" defaultValue="100" className="w-full" />
                      <div className="text-xs text-muted-foreground mt-1">100%</div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Contraste</label>
                      <input type="range" min="0" max="200" defaultValue="100" className="w-full" />
                      <div className="text-xs text-muted-foreground mt-1">100%</div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Saturación</label>
                      <input type="range" min="0" max="200" defaultValue="100" className="w-full" />
                      <div className="text-xs text-muted-foreground mt-1">100%</div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Logo */}
                <TabsContent value="logo" className="space-y-3 mt-0">
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Variante</label>
                      <select className="w-full text-xs p-2 bg-surface border border-border rounded-lg">
                        <option>Principal</option>
                        <option>Negativo</option>
                        <option>Alternativo</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Tamaño</label>
                      <input type="range" min="10" max="200" defaultValue="100" className="w-full" />
                      <div className="text-xs text-muted-foreground mt-1">100%</div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Posición</label>
                      <select className="w-full text-xs p-2 bg-surface border border-border rounded-lg">
                        <option>Sup. Izq.</option>
                        <option>Sup. Der.</option>
                        <option>Inf. Izq.</option>
                        <option>Inf. Der.</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" className="w-3 h-3" />
                      Watermark con transparencia
                    </label>
                  </div>
                </TabsContent>

                {/* Tab: Efectos */}
                <TabsContent value="efectos" className="space-y-3 mt-0">
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Sombras</label>
                      <button className="w-full text-xs p-2 bg-surface border border-border rounded-lg hover:bg-surface-elev-1">
                        Configurar sombras múltiples
                      </button>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Borde</label>
                      <button className="w-full text-xs p-2 bg-surface border border-border rounded-lg hover:bg-surface-elev-1">
                        Añadir borde
                      </button>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Resplandor</label>
                      <button className="w-full text-xs p-2 bg-surface border border-border rounded-lg hover:bg-surface-elev-1">
                        Configurar glow
                      </button>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Degradado</label>
                      <button className="w-full text-xs p-2 bg-surface border border-border rounded-lg hover:bg-surface-elev-1">
                        Editor de degradados
                      </button>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Accesibilidad */}
                <TabsContent value="a11y" className="space-y-2 mt-0">
                  <div className="space-y-1.5">
                    {[
                      { label: 'Contraste AA: ✅/⚠️', status: 'success' },
                      { label: 'Tamaño mínimo texto', status: 'neutral' },
                      { label: 'Simulación daltonismo', status: 'warning' }
                    ].map((item, index) => (
                      <div key={index} className={`p-2 rounded-lg border text-xs h-10 flex items-center ${
                        item.status === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                        item.status === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                        'bg-surface border-border text-foreground'
                      }`}>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>

          {/* Platform Previews Section */}
          <div className="p-3 border-t border-border">
            <PlatformPreviews />
          </div>

          {/* Export Multipost Section */}
          <div className="p-3 border-t border-border">
            <ExportMultipost 
              onExport={handleExportMultipost}
              onCancel={handleCancelExport}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t bg-surface p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
        <Button variant="ghost" onClick={goToPreviousStep} className="text-xs order-2 sm:order-1">
          <ArrowLeft className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Volver</span>
          <span className="sm:hidden">←</span>
        </Button>
        
        <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
          <Button variant="secondary" className="text-xs flex-1 sm:flex-none">
            <span className="hidden sm:inline">Guardar snapshot</span>
            <span className="sm:hidden">Guardar</span>
          </Button>
          <Button 
            onClick={() => setIsPreflightOpen(true)} 
            className="text-xs bg-purple-500 hover:bg-purple-600 flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">Siguiente: Caption & Hashtags</span>
            <span className="sm:hidden">Siguiente</span>
          </Button>
        </div>
      </div>

      {/* Command Palette Overlay */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />

      {/* Preflight Modal */}
      <PreflightModal
        isOpen={isPreflightOpen}
        onClose={() => setIsPreflightOpen(false)}
        onContinueExport={handleContinueExport}
      />
    </div>
  );
}