import { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  X, 
  Search, 
  Paperclip, 
  Rocket, 
  Sparkles, 
  ChevronDown,
  Plus,
  Star,
  Trash2,
  Clock,
  Inbox,
  Mic,
  Send,
  ListChecks,
  BadgeCheck,
  Image,
  Globe,
  FileText,
  XCircle,
  AlertTriangle,
  RotateCw,
  XOctagon,
  Copy,
  GitBranch,
  MessageSquare,
  CornerDownRight,
  Edit2,
  ArrowRight,
  ArrowLeftRight,
  Download,
  Eye,
  Play,
  ExternalLink,
  SquarePlus,
  Share,
  Link,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown as ChevronDownIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

function ChatModule() {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedModel, setSelectedModel] = useState('GPT-5');
  const [selectedPreset, setSelectedPreset] = useState('Mentor creativo');
  const [temperature, setTemperature] = useState(0.30);
  const [isMobile, setIsMobile] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [messageText, setMessageText] = useState('');
  
  // Mock counters and states
  const [tokenCount, setTokenCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [brandGuardStatus] = useState('listo');
  const [piiStatus] = useState('Sin PII detectada');
  
  // Export & Share modals state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('md');
  const [exportRange, setExportRange] = useState('thread');
  const [shareMode, setShareMode] = useState('readonly');
  const [shareScope, setShareScope] = useState('thread');
  
  // Mobile & QA state
  const [showQAOverlay, setShowQAOverlay] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(true); // Show loading by default for demo
  const [showJumpControls, setShowJumpControls] = useState(false);

  // Update counters when message text changes
  useEffect(() => {
    setCharCount(messageText.length);
    // Mock token counting (roughly 4 chars per token)
    setTokenCount(Math.ceil(messageText.length / 4));
  }, [messageText]);

  // Simulate loading completion for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingMore(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Close slash menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showSlashMenu) {
        setShowSlashMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSlashMenu]);

  // Detectar si es mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // En mobile, cerrar panel derecho por defecto
      if (window.innerWidth < 768) {
        setIsRightPanelOpen(false);
      } else {
        setIsRightPanelOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="min-h-14 lg:min-h-14 border-b bg-card px-2 sm:px-4 flex flex-col lg:flex-row lg:items-center lg:justify-between shadow-sm">
          {/* Mobile: Centered title with controls on sides */}
          <div className="lg:hidden flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              {/* Status Dot */}
              <div 
                className="w-4 h-4 rounded-full bg-green-500" 
                title="idle"
                aria-label="Estado del sistema: activo"
              />
            </div>
            
            {/* Title - Centered */}
            <h1 className="text-base font-medium flex-1 text-center">Chat Maestro</h1>
            
            {/* Right controls */}
            <div className="flex items-center gap-1">
              {/* Export & Share - Mobile (icons only) */}
              <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogTrigger asChild>
                  <button 
                    className="p-2 hover:bg-accent rounded-md transition-colors"
                    aria-label="Exportar conversación"
                    style={{ minWidth: '32px', minHeight: '32px' }}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </DialogTrigger>
              </Dialog>

              <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogTrigger asChild>
                  <button 
                    className="p-2 hover:bg-accent rounded-md transition-colors"
                    aria-label="Compartir conversación"
                    style={{ minWidth: '32px', minHeight: '32px' }}
                  >
                    <Share className="w-4 h-4" />
                  </button>
                </DialogTrigger>
              </Dialog>

              {/* Toggle Right Panel */}
              <button
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                aria-label="Abrir biblioteca"
                style={{ minWidth: '32px', minHeight: '32px' }}
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${isRightPanelOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Desktop: Original layout */}
          <div className="hidden lg:flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              {/* Status Dot */}
              <div 
                className="w-4 h-4 rounded-full bg-green-500" 
                title="idle"
                aria-label="Estado del sistema: activo"
              />
              
              {/* Title */}
              <h1 className="text-base font-medium">Chat Maestro</h1>
              
              {/* Thread Badge */}
              <div className="inline-flex items-center gap-1.5 px-2 py-1 border border-border rounded text-xs bg-card">
                <GitBranch className="w-3 h-3" />
                <span>Hilo: Launch-2025 / main</span>
              </div>

              {/* Export & Share Buttons - Desktop */}
              <div className="flex items-center gap-1 ml-2">
                <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                  <DialogTrigger asChild>
                    <button 
                      className="inline-flex items-center gap-1.5 px-2 py-1 border border-border rounded text-xs bg-card hover:bg-accent transition-colors"
                      style={{ minHeight: '32px' }}
                    >
                      <Download className="w-3 h-3" />
                      <span>Exportar</span>
                    </button>
                  </DialogTrigger>
                </Dialog>

                <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                  <DialogTrigger asChild>
                    <button 
                      className="inline-flex items-center gap-1.5 px-2 py-1 border border-border rounded text-xs bg-card hover:bg-accent transition-colors"
                      style={{ minHeight: '32px' }}
                    >
                      <Share className="w-3 h-3" />
                      <span>Compartir</span>
                    </button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>

            {/* Toggle Right Panel Button */}
            <button
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              className="p-1.5 hover:bg-accent rounded-md transition-colors"
              aria-label="Abrir biblioteca"
              style={{ minWidth: '32px', minHeight: '32px' }}
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${isRightPanelOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Mobile: Compact controls below title */}
          <div className="lg:hidden px-2 pb-2">
            <div className="flex items-center justify-center gap-2">
              {/* Model Dropdown - Icon only */}
              <button
                className="p-2 bg-black/[0.04] border border-black/[0.08] rounded-lg hover:bg-black/[0.06] transition-colors"
                aria-label="Seleccionar modelo: GPT-5"
                title="Modelo: GPT-5"
                style={{ minWidth: '32px', minHeight: '32px' }}
              >
                <Rocket className="w-4 h-4 opacity-90" />
              </button>

              {/* Preset Dropdown - Icon only */}
              <button
                className="p-2 bg-black/[0.04] border border-black/[0.08] rounded-lg hover:bg-black/[0.06] transition-colors"
                aria-label="Seleccionar preset del sistema: Mentor creativo"
                title="Preset: Mentor creativo"
                style={{ minWidth: '32px', minHeight: '32px' }}
              >
                <Sparkles className="w-4 h-4 opacity-90" />
              </button>

              {/* Temperature Chip */}
              <div className="inline-flex items-center px-2 py-1 bg-secondary rounded-lg text-xs font-mono" style={{ borderRadius: '8px' }}>
                0.30
              </div>

              {/* QA Toggle Button */}
              <button
                onClick={() => setShowQAOverlay(!showQAOverlay)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                aria-label="Mostrar guía de QA y accesibilidad"
                title="QA & Accesibilidad"
                style={{ minWidth: '32px', minHeight: '32px' }}
              >
                <BadgeCheck className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controls Row - Desktop Layout */}
          <div className="hidden lg:block pb-2 lg:pb-0">
            {/* Desktop: All controls in one row */}
            <div className="flex items-center gap-2">
              {/* Model Dropdown */}
              <div className="relative">
                <button
                  className="h-8 px-2.5 bg-black/[0.04] border border-black/[0.08] rounded-lg text-xs flex items-center gap-2 hover:bg-black/[0.06] transition-colors w-48 xl:w-50"
                >
                  <Rocket className="w-3.5 h-3.5 opacity-90" />
                  <span className="flex-1 text-left truncate">{selectedModel}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-90" />
                </button>
              </div>

              {/* Preset Dropdown */}
              <div className="relative">
                <button
                  className="h-8 px-2.5 bg-black/[0.04] border border-black/[0.08] rounded-lg text-xs flex items-center gap-2 hover:bg-black/[0.06] transition-colors w-52 xl:w-55"
                >
                  <Sparkles className="w-3.5 h-3.5 opacity-90" />
                  <span className="flex-1 text-left truncate">{selectedPreset}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-90" />
                </button>
              </div>

              {/* Temperature Group */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Temp</span>
                <div className="relative w-24 xl:w-30">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-1 bg-black/[0.1] rounded-full appearance-none cursor-pointer"
                  />
                  <div className="absolute top-0 left-0 h-1 bg-primary rounded-full pointer-events-none" 
                       style={{ width: `${temperature * 100}%` }} />
                  <div className="absolute top-0 left-0 w-3 h-3 bg-primary rounded-full transform -translate-y-1 -translate-x-1.5 pointer-events-none"
                       style={{ left: `${temperature * 100}%` }} />
                  {/* Tick marks - hidden on smaller desktop */}
                  <div className="hidden xl:block absolute -bottom-3 left-0 text-xs text-muted-foreground">0.00</div>
                  <div className="hidden xl:block absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">0.50</div>
                  <div className="hidden xl:block absolute -bottom-3 right-0 text-xs text-muted-foreground">1.00</div>
                </div>
                <div className="h-8 px-2 bg-black/[0.06] rounded-lg flex items-center justify-center text-xs font-mono w-12">
                  {temperature.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Mobile/Tablet: Controls in grid */}
            <div className="lg:hidden space-y-2">
              {/* First row: Model + Preset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <button
                    className="h-8 px-2.5 bg-black/[0.04] border border-black/[0.08] rounded-lg text-xs flex items-center gap-2 hover:bg-black/[0.06] transition-colors w-full"
                  >
                    <Rocket className="w-3.5 h-3.5 opacity-90" />
                    <span className="flex-1 text-left truncate">{selectedModel}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-90" />
                  </button>
                </div>

                <div className="relative">
                  <button
                    className="h-8 px-2.5 bg-black/[0.04] border border-black/[0.08] rounded-lg text-xs flex items-center gap-2 hover:bg-black/[0.06] transition-colors w-full"
                  >
                    <Sparkles className="w-3.5 h-3.5 opacity-90" />
                    <span className="flex-1 text-left truncate">{selectedPreset}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-90" />
                  </button>
                </div>
              </div>

              {/* Second row: Temperature */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Temp</span>
                <div className="relative flex-1 max-w-32">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-1 bg-black/[0.1] rounded-full appearance-none cursor-pointer"
                  />
                  <div className="absolute top-0 left-0 h-1 bg-primary rounded-full pointer-events-none" 
                       style={{ width: `${temperature * 100}%` }} />
                  <div className="absolute top-0 left-0 w-3 h-3 bg-primary rounded-full transform -translate-y-1 -translate-x-1.5 pointer-events-none"
                       style={{ left: `${temperature * 100}%` }} />
                </div>
                <div className="h-8 px-2 bg-black/[0.06] rounded-lg flex items-center justify-center text-xs font-mono w-12">
                  {temperature.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Timeline */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 relative">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              
              {/* === VIRTUAL LIST PERFORMANCE ELEMENTS === */}
              
              {/* Virtual Top Spacer */}
              <div className="flex justify-center">
                <div className="bg-muted/50 border border-dashed border-muted-foreground/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground opacity-75 font-mono">
                    Virtual spacer: 80px height
                  </div>
                  <div className="text-xs text-muted-foreground opacity-60 mt-1">
                    (diseño) ~150 mensajes anteriores
                  </div>
                </div>
              </div>

              {/* Loading Skeletons */}
              {isLoadingMore && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={`skeleton-${i}`} className="flex gap-2 sm:gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse flex-shrink-0"></div>
                      <div className="flex-1 max-w-[85%] sm:max-w-[80%] space-y-2">
                        <div className="bg-muted animate-pulse rounded-xl h-4 w-3/4" style={{ borderRadius: '12px' }}></div>
                        <div className="bg-muted animate-pulse rounded-xl h-4 w-1/2" style={{ borderRadius: '12px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* === MOCK MESSAGES === */}
              
              {/* Assistant Message */}
              <div className="flex gap-2 sm:gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
                  AI
                </div>
                <div className="flex-1 max-w-[85%] sm:max-w-[80%]">
                  <div 
                    className="bg-gray-50 rounded-xl p-3 text-sm"
                    style={{ borderRadius: '12px' }}
                  >
                    Ejemplo de respuesta del assistant.
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    10:24
                  </div>
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-2 sm:gap-3 justify-end">
                <div className="flex-1 max-w-[85%] sm:max-w-[80%] flex flex-col items-end">
                  <div 
                    className="bg-blue-600 text-white rounded-xl p-3 text-sm"
                    style={{ borderRadius: '12px' }}
                  >
                    Ejemplo de mensaje del usuario.
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    10:25
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                  U
                </div>
              </div>

              {/* === STREAMING & ESTADOS PHASE 6 === */}

              {/* State/Streaming-Assistant */}
              <div className="flex gap-2 sm:gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
                  AI
                </div>
                <div className="flex-1 max-w-[85%] sm:max-w-[80%]">
                  <div 
                    className="bg-gray-50 rounded-xl p-3 text-sm"
                    style={{ borderRadius: '12px' }}
                  >
                    {/* Stream Block */}
                    <div className="bg-black/[0.04] rounded-lg p-2.5 font-mono text-xs mb-3" style={{ borderRadius: '8px' }}>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span>Procesando tu solicitud</span>
                          <div className="ml-1 w-2 h-3 bg-gray-800 animate-pulse"></div>
                        </div>
                        <div>Generando ideas…</div>
                        <div>Armando respuesta…</div>
                      </div>
                    </div>
                    
                    {/* Meta Row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span>estado: streaming</span>
                      <span>latencia: 0.8 s</span>
                    </div>
                    
                    {/* Actions Row */}
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-2 py-1 hover:bg-accent rounded-md text-xs transition-colors">
                        <XCircle className="w-3 h-3" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* State/Stages */}
              <div className="flex justify-center">
                <div className="bg-card border border-black/[0.06] rounded-xl p-3 max-w-md" style={{ borderRadius: '12px' }}>
                  <h4 className="text-sm font-medium mb-3">Progreso</h4>
                  
                  {/* Stages */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      <span className="text-sm">Buscar fuentes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <span className="text-sm font-medium">Analizar documentos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
                      <span className="text-sm text-muted-foreground">Redactar respuesta</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-black/[0.08] rounded-full h-1.5 mb-3" style={{ borderRadius: '6px' }}>
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '45%', borderRadius: '6px' }}></div>
                  </div>
                  
                  {/* Micro Logs */}
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-muted-foreground opacity-85">web.run: 2 resultados relevantes</div>
                    <div className="text-xs font-mono text-muted-foreground opacity-85">pdf.read: 14 páginas indexadas</div>
                    <div className="text-xs font-mono text-muted-foreground opacity-85">brand-guard: tono verificado</div>
                  </div>
                </div>
              </div>

              {/* Msg/Assistant-Streaming-Blocks */}
              <div className="flex gap-2 sm:gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
                  AI
                </div>
                <div className="flex-1 max-w-[85%] sm:max-w-[80%]">
                  <div 
                    className="bg-gray-50 rounded-xl p-3 text-sm"
                    style={{ borderRadius: '12px' }}
                  >
                    {/* Streaming List Block */}
                    <div className="mb-4">
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Idea 1: [transmitiendo…]</li>
                        <li>Idea 2: [transmitiendo…]</li>
                        <li>Idea 3: [transmitiendo…]</li>
                      </ol>
                    </div>
                    
                    {/* Streaming Code Block */}
                    <div className="bg-muted rounded-lg p-2.5 mb-3 font-mono text-xs" style={{ borderRadius: '8px' }}>
                      <pre>{`{
  "brief": "[streaming]",
  "concepts": ["…"],
  "cta": "…"
}`}</pre>
                    </div>
                    
                    {/* Meta Row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>estado: streaming</span>
                      <span>tokens: ≈ 120</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* State/Retry-Row */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm">La generación se interrumpió. ¿Reintentar?</span>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
                      <RotateCw className="w-3 h-3" />
                      Reintentar
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 hover:bg-accent rounded-lg text-xs transition-colors">
                      <Sparkles className="w-3 h-3" />
                      Regenerar
                    </button>
                  </div>
                </div>
              </div>

              {/* State/Cancelled */}
              <div className="flex justify-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
                  <XOctagon className="w-5 h-5 text-red-600" />
                  <span className="text-sm">Generación cancelada por el usuario.</span>
                  <span className="text-xs text-muted-foreground">t=3.1 s</span>
                </div>
              </div>

              {/* Msg/Assistant-Final */}
              <div className="flex gap-2 sm:gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
                  AI
                </div>
                <div className="flex-1 max-w-[85%] sm:max-w-[80%]">
                  <div 
                    className="bg-gray-50 rounded-xl p-3 text-sm"
                    style={{ borderRadius: '12px' }}
                  >
                    {/* Rich Text Content */}
                    <div className="mb-3">
                      <p>Respuesta final consolidada con viñetas y un CTA claro. (Fin del streaming)</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Punto clave 1 del análisis</li>
                        <li>Punto clave 2 con recomendaciones</li>
                        <li>Llamada a la acción específica</li>
                      </ul>
                    </div>
                    
                    {/* Chips Row */}
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 bg-secondary rounded text-xs" style={{ borderRadius: '8px' }}>
                        web.run
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 bg-secondary rounded text-xs" style={{ borderRadius: '8px' }}>
                        pdf.read
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 bg-secondary rounded text-xs" style={{ borderRadius: '8px' }}>
                        brand-guard
                      </span>
                    </div>
                    
                    {/* Meta Row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span>estado: listo</span>
                      <span>tokens: 248</span>
                      <span>hora: 09:21</span>
                    </div>
                    
                    {/* Actions Row */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <button className="flex items-center gap-1 px-2 py-1 hover:bg-accent rounded-md text-xs transition-colors">
                        <Copy className="w-3 h-3" />
                        Copiar bloque
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 hover:bg-accent rounded-md text-xs transition-colors">
                        <Sparkles className="w-3 h-3" />
                        Regenerar
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 hover:bg-accent rounded-md text-xs transition-colors">
                        <GitBranch className="w-3 h-3" />
                        Branch
                      </button>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    09:21
                  </div>
                </div>
              </div>

              {/* === HISTORIAL & RAMAS PHASE 7 === */}

              {/* Branch/From-Message */}
              <div className="flex justify-start">
                <div className="bg-card border border-black/[0.06] rounded-lg p-2 flex items-center gap-3" style={{ borderRadius: '10px' }}>
                  <GitBranch className="w-4 h-4 text-primary" />
                  <span className="text-sm">Crear rama desde este punto</span>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-2.5 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors">
                      <Plus className="w-3 h-3" />
                      Nueva rama
                    </button>
                    <button className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-accent rounded text-xs transition-colors">
                      <ArrowRight className="w-3 h-3" />
                      Mover a…
                    </button>
                  </div>
                </div>
              </div>

              {/* Branch/Viewer */}
              <div className="flex justify-center">
                <div className="bg-card border border-black/[0.06] rounded-xl p-3 max-w-lg w-full" style={{ borderRadius: '12px' }}>
                  <h4 className="text-sm font-medium mb-4">Ramas de 'Launch-2025'</h4>
                  
                  {/* Tree Structure */}
                  <div className="space-y-2 mb-4">
                    {/* Main Branch */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="font-mono text-sm text-blue-600 font-medium">main</span>
                        <span className="text-xs text-muted-foreground">(activa)</span>
                      </div>
                    </div>
                    
                    {/* Child Branches */}
                    <div className="ml-4 space-y-2">
                      <div className="flex items-center gap-2 relative">
                        <div className="absolute -left-4 top-2 w-3 h-px bg-black/[0.12]"></div>
                        <div className="absolute -left-4 top-2 w-px h-3 bg-black/[0.12]"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        <span className="font-mono text-sm text-muted-foreground">concept-A</span>
                      </div>
                      
                      <div className="flex items-center gap-2 relative">
                        <div className="absolute -left-4 top-2 w-3 h-px bg-black/[0.12]"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        <span className="font-mono text-sm text-muted-foreground">concept-B</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-accent rounded text-xs transition-colors">
                      <ArrowLeftRight className="w-3 h-3" />
                      Cambiar a main
                    </button>
                    <button className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-accent rounded text-xs transition-colors">
                      <CornerDownRight className="w-3 h-3" />
                      Abrir concept-A
                    </button>
                  </div>
                </div>
              </div>

              {/* === ADJUNTOS & PREVISUALIZACIONES PHASE 8 === */}

              {/* Msg/User-Con-Adjunto-PDF */}
              <div className="flex gap-2 sm:gap-3 justify-end">
                <div className="flex-1 max-w-[85%] sm:max-w-[80%] flex flex-col items-end">
                  <div 
                    className="bg-blue-600 text-white rounded-xl p-3 text-sm"
                    style={{ borderRadius: '12px' }}
                  >
                    {/* Attachment Card - PDF */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-2.5 mb-3" style={{ borderRadius: '12px' }}>
                      <div className="flex items-start gap-3">
                        {/* PDF Thumbnail */}
                        <div className="w-12 h-16 bg-white/20 rounded-lg flex flex-col items-center justify-center text-xs" style={{ borderRadius: '10px' }}>
                          <FileText className="w-4 h-4 mb-1" />
                          <span className="text-[10px] font-medium">PDF</span>
                          <span className="text-[9px] opacity-75">14p</span>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="text-sm font-medium truncate">Contrato-Venta-2025.pdf</div>
                              <div className="text-xs opacity-75">1.2 MB</div>
                            </div>
                          </div>
                          
                          {/* Status Chip */}
                          <div className="flex items-center gap-1 mb-2">
                            <span className="inline-flex items-center px-2 py-0.5 bg-white/20 rounded text-xs" style={{ borderRadius: '8px' }}>
                              pendiente
                            </span>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button className="flex items-center gap-1 px-2 py-1 hover:bg-white/10 rounded text-xs transition-colors">
                              <Download className="w-3 h-3" />
                              Descargar
                            </button>
                            <button className="flex items-center gap-1 px-2 py-1 hover:bg-white/10 rounded text-xs transition-colors">
                              <X className="w-3 h-3" />
                              Quitar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    10:03
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                  U
                </div>
              </div>

              {/* State/Analizando-PDF */}
              <div className="flex justify-center">
                <div className="bg-card border border-black/[0.06] rounded-xl p-3 max-w-md" style={{ borderRadius: '12px' }}>
                  <h4 className="text-sm font-medium mb-3">Analizando adjunto</h4>
                  
                  {/* Stages */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      <span className="text-sm">Subiendo archivo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <span className="text-sm font-medium">Extrayendo texto</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
                      <span className="text-sm text-muted-foreground">Indexando secciones</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-black/[0.08] rounded-full h-1.5 mb-3" style={{ borderRadius: '6px' }}>
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '62%', borderRadius: '6px' }}></div>
                  </div>
                  
                  {/* Micro Logs */}
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-muted-foreground opacity-85">pdf.read: 14 páginas</div>
                    <div className="text-xs font-mono text-muted-foreground opacity-85">ocr: no requerido</div>
                    <div className="text-xs font-mono text-muted-foreground opacity-85">detección de tablas: 3</div>
                  </div>
                </div>
              </div>

              {/* Msg/Assistant-Resumen-PDF */}
              <div className="flex gap-2 sm:gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
                  AI
                </div>
                <div className="flex-1 max-w-[85%] sm:max-w-[80%]">
                  <div 
                    className="bg-gray-50 rounded-xl p-3 text-sm"
                    style={{ borderRadius: '12px' }}
                  >
                    {/* List Content */}
                    <ul className="list-disc list-inside space-y-1 mb-3">
                      <li>Resumen ejecutivo (3 viñetas)</li>
                      <li>Riesgos clave (2 ítems)</li>
                      <li>Cláusulas a revisar (4 ítems)</li>
                    </ul>
                    
                    {/* Chips Row */}
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 bg-secondary rounded text-xs" style={{ borderRadius: '8px' }}>
                        pdf.read
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 bg-secondary rounded text-xs" style={{ borderRadius: '8px' }}>
                        brand-guard
                      </span>
                    </div>
                    
                    {/* Meta Row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>hora: 10:05</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Msg/User-Con-Adjunto-Imagen */}
              <div className="flex gap-2 sm:gap-3 justify-end">
                <div className="flex-1 max-w-[85%] sm:max-w-[80%] flex flex-col items-end">
                  <div 
                    className="bg-blue-600 text-white rounded-xl p-3 text-sm"
                    style={{ borderRadius: '12px' }}
                  >
                    {/* Attachment Card - Image */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-2.5 mb-3" style={{ borderRadius: '12px' }}>
                      <div className="flex items-start gap-3">
                        {/* Image Thumbnail */}
                        <div className="w-16 h-12 bg-white/20 rounded-lg flex items-center justify-center" style={{ borderRadius: '10px' }}>
                          <div className="text-center">
                            <Image className="w-4 h-4 mx-auto mb-1" />
                            <span className="text-[10px] font-medium">IMG</span>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="text-sm font-medium truncate">packshot-v1.png</div>
                              <div className="text-xs opacity-75">640 KB</div>
                            </div>
                          </div>
                          
                          {/* Status Chip */}
                          <div className="flex items-center gap-1 mb-2">
                            <span className="inline-flex items-center px-2 py-0.5 bg-white/20 rounded text-xs" style={{ borderRadius: '8px' }}>
                              para análisis
                            </span>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button className="flex items-center gap-1 px-2 py-1 hover:bg-white/10 rounded text-xs transition-colors">
                              <Eye className="w-3 h-3" />
                              Vista rápida
                            </button>
                            <button className="flex items-center gap-1 px-2 py-1 hover:bg-white/10 rounded text-xs transition-colors">
                              <X className="w-3 h-3" />
                              Quitar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    10:06
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                  U
                </div>
              </div>

              {/* InlineViewer/Imagen */}
              <div className="flex justify-center">
                <div className="bg-card border rounded-xl p-3 max-w-2xl w-full shadow-xs" style={{ borderRadius: '12px' }}>
                  {/* Image Preview */}
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-gray-100 rounded-lg mb-3 flex items-center justify-center" style={{ borderRadius: '10px' }}>
                    <div className="text-center text-muted-foreground">
                      <Image className="w-12 h-12 mx-auto mb-2" />
                      <span className="text-sm">Vista previa de imagen</span>
                      <div className="text-xs mt-1">packshot-v1.png</div>
                    </div>
                  </div>
                  
                  {/* Caption Row */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span>Dimensiones: 1920×1080</span>
                    <span>Dominantes: #2563EB, #111827</span>
                  </div>
                  
                  {/* Actions Row */}
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-2.5 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors">
                      <SquarePlus className="w-3 h-3" />
                      Usar en Post
                    </button>
                    <button className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-accent rounded text-xs transition-colors">
                      <Sparkles className="w-3 h-3" />
                      Describir
                    </button>
                  </div>
                </div>
              </div>

              {/* Msg/User-Con-Adjunto-Audio */}
              <div className="flex gap-2 sm:gap-3 justify-end">
                <div className="flex-1 max-w-[85%] sm:max-w-[80%] flex flex-col items-end">
                  <div 
                    className="bg-blue-600 text-white rounded-xl p-3 text-sm"
                    style={{ borderRadius: '12px' }}
                  >
                    {/* Attachment Card - Audio */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-2.5 mb-3" style={{ borderRadius: '12px' }}>
                      <div className="flex items-start gap-3">
                        {/* Audio Waveform */}
                        <div className="w-16 h-12 bg-white/20 rounded-lg flex flex-col items-center justify-center" style={{ borderRadius: '10px' }}>
                          <div className="flex items-end gap-0.5 h-4 mb-1">
                            <div className="w-1 bg-white/60 rounded-full" style={{ height: '6px' }}></div>
                            <div className="w-1 bg-white/60 rounded-full" style={{ height: '12px' }}></div>
                            <div className="w-1 bg-white/60 rounded-full" style={{ height: '8px' }}></div>
                            <div className="w-1 bg-white rounded-full" style={{ height: '16px' }}></div>
                            <div className="w-1 bg-white/60 rounded-full" style={{ height: '10px' }}></div>
                            <div className="w-1 bg-white/60 rounded-full" style={{ height: '4px' }}></div>
                          </div>
                          <span className="text-[10px] font-medium">AUDIO</span>
                          <span className="text-[9px] opacity-75">00:46</span>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="text-sm font-medium truncate">nota-voz-brief.m4a</div>
                              <div className="text-xs opacity-75">310 KB</div>
                            </div>
                          </div>
                          
                          {/* Status Chip */}
                          <div className="flex items-center gap-1 mb-2">
                            <span className="inline-flex items-center px-2 py-0.5 bg-white/20 rounded text-xs" style={{ borderRadius: '8px' }}>
                              transcribir
                            </span>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button className="flex items-center gap-1 px-2 py-1 hover:bg-white/10 rounded text-xs transition-colors">
                              <Play className="w-3 h-3" />
                              Reproducir
                            </button>
                            <button className="flex items-center gap-1 px-2 py-1 hover:bg-white/10 rounded text-xs transition-colors">
                              <X className="w-3 h-3" />
                              Quitar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    10:07
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                  U
                </div>
              </div>

              {/* Msg/Assistant-Transcripcion-Audio */}
              <div className="flex gap-2 sm:gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
                  AI
                </div>
                <div className="flex-1 max-w-[85%] sm:max-w-[80%]">
                  <div 
                    className="bg-gray-50 rounded-xl p-3 text-sm"
                    style={{ borderRadius: '12px' }}
                  >
                    {/* Quote Block */}
                    <blockquote className="border-l-4 border-gray-300 pl-3 italic mb-3">
                      Transcripción (fragmento): necesitamos foco en jóvenes 18–24 y CTA directo a prueba gratuita.
                    </blockquote>
                    
                    {/* Chips Row */}
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 bg-secondary rounded text-xs" style={{ borderRadius: '8px' }}>
                        asr
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 bg-secondary rounded text-xs" style={{ borderRadius: '8px' }}>
                        summary
                      </span>
                    </div>
                    
                    {/* Meta Row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>hora: 10:08</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Msg/User-Con-Link */}
              <div className="flex gap-2 sm:gap-3 justify-end">
                <div className="flex-1 max-w-[85%] sm:max-w-[80%] flex flex-col items-end">
                  <div 
                    className="bg-blue-600 text-white rounded-xl p-3 text-sm"
                    style={{ borderRadius: '12px' }}
                  >
                    {/* Attachment Card - Link */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-2.5 mb-3" style={{ borderRadius: '12px' }}>
                      <div className="flex items-start gap-3">
                        {/* Link Preview */}
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center" style={{ borderRadius: '10px' }}>
                          <div className="text-center">
                            <Globe className="w-4 h-4 mx-auto mb-1" />
                            <span className="text-[10px] font-medium">LINK</span>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="text-sm font-medium">Artículo: Tendencias social 2025</div>
                              <div className="text-xs opacity-75">example.com</div>
                              <div className="text-xs opacity-60 mt-1">Para resumir y citar</div>
                            </div>
                          </div>
                          
                          {/* Status Chip */}
                          <div className="flex items-center gap-1 mb-2">
                            <span className="inline-flex items-center px-2 py-0.5 bg-white/20 rounded text-xs" style={{ borderRadius: '8px' }}>
                              para citar
                            </span>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button className="flex items-center gap-1 px-2 py-1 hover:bg-white/10 rounded text-xs transition-colors">
                              <ExternalLink className="w-3 h-3" />
                              Abrir
                            </button>
                            <button className="flex items-center gap-1 px-2 py-1 hover:bg-white/10 rounded text-xs transition-colors">
                              <X className="w-3 h-3" />
                              Quitar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    10:09
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                  U
                </div>
              </div>

              {/* Virtual Bottom Spacer */}
              <div className="flex justify-center">
                <div className="bg-muted/50 border border-dashed border-muted-foreground/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground opacity-75 font-mono">
                    Virtual spacer: 120px height
                  </div>
                  <div className="text-xs text-muted-foreground opacity-60 mt-1">
                    (diseño) ventana visible: ~20–30 mensajes
                  </div>
                </div>
              </div>
            </div>

            {/* Jump Controls - Performance Navigation */}
            <div className="absolute right-4 top-4 flex flex-col gap-2">
              <button
                onClick={() => setShowJumpControls(!showJumpControls)}
                className="p-2 bg-card border border-border rounded-full shadow-lg hover:bg-accent transition-colors"
                aria-label="Subir"
                title="Ir arriba"
                style={{ minWidth: '40px', minHeight: '40px' }}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute right-4 bottom-4 flex flex-col gap-2">
              <button
                onClick={() => setIsAtBottom(!isAtBottom)}
                className="p-2 bg-card border border-border rounded-full shadow-lg hover:bg-accent transition-colors"
                aria-label="Ir al final"
                title="Ir al final de la conversación"
                style={{ minWidth: '40px', minHeight: '40px' }}
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Composer Pro - Sticky */}
          <div className="sticky bottom-0 border-t bg-card shadow-sm">
            <div className="max-w-4xl mx-auto p-2 sm:p-3 space-y-2">
              {/* Mobile Toolbar - Two rows if needed */}
              <div className="lg:hidden">
                {/* First row: Main actions */}
                <div className="flex items-center gap-1 mb-2">
                  <button 
                    className="p-2 hover:bg-accent rounded-md transition-colors"
                    aria-label="Adjuntar"
                    title="Adjuntar archivo"
                    style={{ minWidth: '32px', minHeight: '32px' }}
                  >
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                  </button>
                  
                  <button 
                    className="p-2 hover:bg-accent rounded-md transition-colors"
                    aria-label="Voz"
                    title="Grabar nota de voz"
                    style={{ minWidth: '32px', minHeight: '32px' }}
                  >
                    <Mic className="w-4 h-4 text-muted-foreground" />
                  </button>
                  
                  <button 
                    className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-accent rounded-md transition-colors text-sm"
                    onClick={() => setShowSlashMenu(!showSlashMenu)}
                    style={{ minHeight: '32px' }}
                  >
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                    <span className="hidden xs:inline">Comandos</span>
                  </button>
                </div>

                {/* Second row: Quick commands */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="inline-flex items-center px-2 py-1 bg-secondary rounded text-xs hover:bg-secondary/80 cursor-pointer transition-colors" style={{ borderRadius: '8px' }}>
                    /brief
                  </span>
                  <span className="inline-flex items-center px-2 py-1 bg-secondary rounded text-xs hover:bg-secondary/80 cursor-pointer transition-colors" style={{ borderRadius: '8px' }}>
                    /tone
                  </span>
                  <span className="inline-flex items-center px-2 py-1 bg-secondary rounded text-xs hover:bg-secondary/80 cursor-pointer transition-colors" style={{ borderRadius: '8px' }}>
                    /imgjson
                  </span>
                </div>
              </div>

              {/* Desktop Toolbar */}
              <div className="hidden lg:flex items-center gap-2 flex-wrap">
                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  <button 
                    className="p-2 hover:bg-accent rounded-md transition-colors"
                    aria-label="Adjuntar"
                    title="Adjuntar archivo"
                    style={{ minWidth: '32px', minHeight: '32px' }}
                  >
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                  </button>
                  
                  <button 
                    className="p-2 hover:bg-accent rounded-md transition-colors"
                    aria-label="Voz"
                    title="Grabar nota de voz"
                    style={{ minWidth: '32px', minHeight: '32px' }}
                  >
                    <Mic className="w-4 h-4 text-muted-foreground" />
                  </button>
                  
                  <button 
                    className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-accent rounded-md transition-colors text-sm"
                    onClick={() => setShowSlashMenu(!showSlashMenu)}
                    style={{ minHeight: '32px' }}
                  >
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                    Comandos
                  </button>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-border" />

                {/* Quick Commands */}
                <div className="flex items-center gap-1 flex-wrap">
                  <button className="inline-flex items-center px-2 py-1 bg-secondary rounded-lg text-xs hover:bg-secondary/80 transition-colors" style={{ borderRadius: '8px' }}>
                    /brief
                  </button>
                  <button className="inline-flex items-center px-2 py-1 bg-secondary rounded-lg text-xs hover:bg-secondary/80 transition-colors" style={{ borderRadius: '8px' }}>
                    /tone
                  </button>
                  <button className="inline-flex items-center px-2 py-1 bg-secondary rounded-lg text-xs hover:bg-secondary/80 transition-colors" style={{ borderRadius: '8px' }}>
                    /imgjson
                  </button>
                </div>
              </div>

              {/* Input Area */}
              <div className="relative">
                <textarea
                  value={messageText}
                  onChange={(e) => {
                    setMessageText(e.target.value);
                    // Simulate slash menu trigger (show when typing "/" at start of line or after space)
                    const value = e.target.value;
                    const cursorPos = e.target.selectionStart;
                    const textBeforeCursor = value.substring(0, cursorPos);
                    const lastChar = textBeforeCursor.slice(-1);
                    const charBeforeLast = textBeforeCursor.slice(-2, -1);
                    
                    setShowSlashMenu(lastChar === '/' && (textBeforeCursor.length === 1 || charBeforeLast === ' ' || charBeforeLast === '\n'));
                  }}
                  onKeyDown={(e) => {
                    // Close slash menu on Escape
                    if (e.key === 'Escape') {
                      setShowSlashMenu(false);
                    }
                    // Send message on Ctrl/Cmd + Enter
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      // Mock send logic
                      console.log('Sending message:', messageText);
                    }
                  }}
                  placeholder="Escribe tu mensaje… Usa / para abrir el menú de comandos"
                  className="w-full resize-none p-3 bg-input-background border border-black/[0.08] rounded-xl text-sm min-h-[80px] max-h-[200px] focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{ borderRadius: '12px' }}
                  rows={3}
                />
                
                {/* Help Text */}
                <p className="mt-1 text-xs text-muted-foreground">
                  Mantén el tono de marca. Evita PII.
                </p>

                {/* Slash Menu Popover (Diseño) */}
                {showSlashMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-96 bg-popover border border-border rounded-xl shadow-md z-50" style={{ borderRadius: '12px' }}>
                    <div className="p-2">
                      {/* Menu Items */}
                      <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 p-2.5 hover:bg-accent rounded-lg transition-colors text-left">
                          <ListChecks className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">/brief — Brief creativo (rápido)</div>
                            <div className="text-xs text-muted-foreground opacity-75">Objetivo, audiencia, SMP, 3 conceptos, 5 ganchos</div>
                          </div>
                        </button>
                        
                        <button className="w-full flex items-center gap-3 p-2.5 hover:bg-accent rounded-lg transition-colors text-left">
                          <BadgeCheck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">/tone — Tone Check (BrandKit)</div>
                            <div className="text-xs text-muted-foreground opacity-75">Léxico, registro, ritmo, claims; sugerencias</div>
                          </div>
                        </button>
                        
                        <button className="w-full flex items-center gap-3 p-2.5 hover:bg-accent rounded-lg transition-colors text-left">
                          <Image className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">/imgjson — Prompt JSON (Vertex)</div>
                            <div className="text-xs text-muted-foreground opacity-75">Plantilla JSON para generación de imagen</div>
                          </div>
                        </button>
                        
                        <button className="w-full flex items-center gap-3 p-2.5 hover:bg-accent rounded-lg transition-colors text-left">
                          <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">/web — Buscar y citar</div>
                            <div className="text-xs text-muted-foreground opacity-75">Activa búsqueda con citas (UI futura)</div>
                          </div>
                        </button>
                        
                        <button className="w-full flex items-center gap-3 p-2.5 hover:bg-accent rounded-lg transition-colors text-left">
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">/sum — Resumen de documento</div>
                            <div className="text-xs text-muted-foreground opacity-75">Resumir PDF/imagen adjunta (UI futura)</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Bar */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Validation Group */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center px-2 py-1 border border-border rounded-lg text-xs" style={{ borderRadius: '8px' }}>
                    Guardia de Marca: {brandGuardStatus}
                  </div>
                  <span className="text-xs text-muted-foreground">{piiStatus}</span>
                </div>

                {/* Counters and Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Counters */}
                  <div className="flex items-center gap-1">
                    <div className="inline-flex items-center px-2 py-1 bg-secondary rounded-lg text-xs font-mono" style={{ borderRadius: '8px' }}>
                      {tokenCount} tok
                    </div>
                    <div className="inline-flex items-center px-2 py-1 bg-secondary rounded-lg text-xs font-mono" style={{ borderRadius: '8px' }}>
                      {charCount} car
                    </div>
                  </div>

                  {/* Transform Buttons - Hidden on mobile */}
                  <div className="hidden sm:flex items-center gap-1">
                    <button className="px-2.5 py-1.5 hover:bg-accent rounded-lg text-xs transition-colors" style={{ borderRadius: '10px' }}>
                      Hacer lista
                    </button>
                    <button className="px-2.5 py-1.5 hover:bg-accent rounded-lg text-xs transition-colors" style={{ borderRadius: '10px' }}>
                      Hacer tabla
                    </button>
                    <button className="px-2.5 py-1.5 hover:bg-accent rounded-lg text-xs transition-colors" style={{ borderRadius: '10px' }}>
                      Simplificar
                    </button>
                    <button className="px-2.5 py-1.5 hover:bg-accent rounded-lg text-xs transition-colors" style={{ borderRadius: '10px' }}>
                      Traducir
                    </button>
                  </div>

                  {/* Send Button */}
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    style={{ borderRadius: '10px' }}
                    title="Ctrl/⌘+Enter"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Enviar</span>
                    <span className="hidden lg:inline text-xs opacity-75">(Ctrl/⌘+Enter)</span>
                  </button>
                </div>
              </div>

              {/* Mobile Transform Buttons */}
              {isMobile && (
                <div className="flex items-center gap-1 overflow-x-auto">
                  <button className="px-2.5 py-1.5 hover:bg-accent rounded-lg text-xs transition-colors whitespace-nowrap" style={{ borderRadius: '10px' }}>
                    Hacer lista
                  </button>
                  <button className="px-2.5 py-1.5 hover:bg-accent rounded-lg text-xs transition-colors whitespace-nowrap" style={{ borderRadius: '10px' }}>
                    Hacer tabla
                  </button>
                  <button className="px-2.5 py-1.5 hover:bg-accent rounded-lg text-xs transition-colors whitespace-nowrap" style={{ borderRadius: '10px' }}>
                    Simplificar
                  </button>
                  <button className="px-2.5 py-1.5 hover:bg-accent rounded-lg text-xs transition-colors whitespace-nowrap" style={{ borderRadius: '10px' }}>
                    Traducir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      {isRightPanelOpen && (
        <>
          {/* Mobile: Modal Overlay */}
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsRightPanelOpen(false)}
              aria-label="Cerrar biblioteca"
            />
          )}
          
          {/* Panel Content */}
          <div className={`
            ${isMobile 
              ? 'fixed top-0 right-0 bottom-0 z-50 bg-card transform transition-transform duration-300 ease-in-out shadow-2xl' 
              : 'relative border-l bg-card'
            } 
            ${isMobile ? 'w-80 max-w-[90vw]' : 'w-80 lg:w-84'} 
            flex flex-col
          `} style={!isMobile ? { width: '336px' } : undefined}>
          {/* Right Panel Header */}
          <div className="h-12 border-b px-3 flex items-center justify-between">
            <h2 className="text-sm font-medium">Chat Library</h2>
            <div className="flex items-center gap-2">
              {isMobile && (
                <div className="text-xs text-muted-foreground opacity-75">
                  Swipe → cerrar
                </div>
              )}
              <button
                onClick={() => setIsRightPanelOpen(false)}
                className="p-1 hover:bg-accent rounded-md transition-colors"
                aria-label="Cerrar biblioteca"
                style={{ minWidth: '32px', minHeight: '32px' }}
              >
                {isMobile ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-70" />
              <input
                type="text"
                placeholder="Buscar templates o hilos…"
                className="w-full pl-9 pr-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring h-9"
                style={{ borderRadius: '8px' }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Filtra por título, contenido o tag (diseño)</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 px-3 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'templates'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Templates
              {activeTab === 'templates' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-3 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'history'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              History
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'templates' && (
              <div className="p-3 space-y-3">
                {/* Templates Header */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center px-2 py-1 bg-secondary rounded-md text-xs">
                    3 items
                  </div>
                  <button className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs hover:bg-primary/90 transition-colors">
                    <Plus className="w-3 h-3" />
                    Nuevo
                  </button>
                </div>

                {/* Template Cards */}
                <div className="space-y-2">
                  {/* Template 1 */}
                  <div className="bg-card border rounded-xl p-2.5 shadow-sm" style={{ borderRadius: '12px' }}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm flex-1 pr-2">Brief creativo (rápido)</h4>
                      <div className="flex gap-1 flex-shrink-0">
                        <button className="p-1 hover:bg-accent rounded transition-colors min-w-[24px] min-h-[24px]">
                          <Star className="w-3 h-3 text-muted-foreground" />
                        </button>
                        <button className="p-1 hover:bg-accent rounded transition-colors min-w-[24px] min-h-[24px]">
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                      Eres un planner creativo. Devuélveme: objetivo, audiencia, single-minded proposition, 3 conceptos, 5 ganchos.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex gap-1 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 bg-accent rounded text-xs" style={{ borderRadius: '8px' }}>
                          brief
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 bg-accent rounded text-xs" style={{ borderRadius: '8px' }}>
                          creatividad
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">Actualizado: hoy</span>
                    </div>
                  </div>

                  {/* Template 2 - Pinned */}
                  <div className="bg-card border rounded-xl p-2.5 shadow-sm" style={{ borderRadius: '12px' }}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm flex-1 pr-2">Tone Check (BrandKit)</h4>
                      <div className="flex gap-1 flex-shrink-0">
                        <button className="p-1 hover:bg-accent rounded transition-colors min-w-[24px] min-h-[24px]">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        </button>
                        <button className="p-1 hover:bg-accent rounded transition-colors min-w-[24px] min-h-[24px]">
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                      Evalúa si el texto respeta la voz de marca: léxico, registro, ritmo, jerga, claims. Sugiere cambios.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex gap-1 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 bg-accent rounded text-xs" style={{ borderRadius: '8px' }}>
                          brand
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 bg-accent rounded text-xs" style={{ borderRadius: '8px' }}>
                          tone
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">Actualizado: ayer</span>
                    </div>
                  </div>

                  {/* Template 3 - JSON Code */}
                  <div className="bg-card border rounded-xl p-2.5 shadow-sm" style={{ borderRadius: '12px' }}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm flex-1 pr-2">Imagen: Prompt JSON (Vertex)</h4>
                      <div className="flex gap-1 flex-shrink-0">
                        <button className="p-1 hover:bg-accent rounded transition-colors min-w-[24px] min-h-[24px]">
                          <Star className="w-3 h-3 text-muted-foreground" />
                        </button>
                        <button className="p-1 hover:bg-accent rounded transition-colors min-w-[24px] min-h-[24px]">
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-muted rounded p-2 mb-2 text-xs font-mono overflow-x-auto">
                      <pre className="text-xs whitespace-pre-wrap break-words">
{`{
  "subject": "[producto/escena]",
  "style": {
    "lighting": "soft",
    "mood": "trustworthy",
    "palette": "BrandKit.secondary"
  },
  "framing": "4:5",
  "brand": {
    "logo": true,
    "font": "BrandKit.fonts.headline"
  }
}`}
                      </pre>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex gap-1 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 bg-accent rounded text-xs" style={{ borderRadius: '8px' }}>
                          imagen
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 bg-accent rounded text-xs" style={{ borderRadius: '8px' }}>
                          json
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">Actualizado: esta semana</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-3">
                {/* History Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center px-2 py-1 bg-secondary rounded-md text-xs">
                    2 hilos
                  </div>
                </div>

                {/* History List */}
                <div className="space-y-3">
                  {/* Thread Item 1 */}
                  <div className="bg-card border rounded-xl p-2.5 hover:shadow-xs transition-shadow" style={{ borderRadius: '12px' }}>
                    {/* Header Row */}
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm flex-1">Launch-2025</span>
                      <span className="text-xs text-muted-foreground opacity-70">12 mensajes · actualizado hoy</span>
                    </div>
                    
                    {/* Branch Row */}
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 bg-primary text-primary-foreground rounded font-mono text-xs" style={{ borderRadius: '8px' }}>
                        main
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 bg-secondary text-secondary-foreground rounded font-mono text-xs" style={{ borderRadius: '8px' }}>
                        concept-A
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 bg-secondary text-secondary-foreground rounded font-mono text-xs" style={{ borderRadius: '8px' }}>
                        concept-B
                      </span>
                    </div>
                    
                    {/* Actions Row */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <button className="flex items-center gap-1 px-2.5 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors">
                        <CornerDownRight className="w-3 h-3" />
                        Abrir
                      </button>
                      <button className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-accent rounded text-xs transition-colors">
                        <Copy className="w-3 h-3" />
                        Duplicar
                      </button>
                      <button className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-accent rounded text-xs transition-colors">
                        <Edit2 className="w-3 h-3" />
                        Renombrar
                      </button>
                      <button className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-accent rounded text-xs transition-colors">
                        <Trash2 className="w-3 h-3" />
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Thread Item 2 */}
                  <div className="bg-card border rounded-xl p-2.5 hover:shadow-xs transition-shadow" style={{ borderRadius: '12px' }}>
                    {/* Header Row */}
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm flex-1">Promo-Q4</span>
                      <span className="text-xs text-muted-foreground opacity-70">5 mensajes · ayer</span>
                    </div>
                    
                    {/* Branch Row */}
                    <div className="flex items-center gap-1 mb-3">
                      <span className="inline-flex items-center px-2 py-0.5 bg-primary text-primary-foreground rounded font-mono text-xs" style={{ borderRadius: '8px' }}>
                        main
                      </span>
                    </div>
                    
                    {/* Actions Row */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <button className="flex items-center gap-1 px-2.5 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors">
                        <CornerDownRight className="w-3 h-3" />
                        Abrir
                      </button>
                      <button className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-accent rounded text-xs transition-colors">
                        <Copy className="w-3 h-3" />
                        Duplicar
                      </button>
                      <button className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-accent rounded text-xs transition-colors">
                        <Edit2 className="w-3 h-3" />
                        Renombrar
                      </button>
                      <button className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-accent rounded text-xs transition-colors">
                        <Trash2 className="w-3 h-3" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Empty State (Hidden when there are threads) */}
                {false && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="w-8 h-8 text-muted-foreground mb-3" />
                    <h4 className="font-medium text-sm mb-1">Aún no hay hilos</h4>
                    <p className="text-xs text-muted-foreground">Cuando guardes una conversación, aparecerá aquí.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-3">
            <p className="text-xs text-muted-foreground">
              Consejo: haz clic en un template para insertarlo en el composer (diseño).
            </p>
          </div>
        </div>
        </>
      )}

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exportar conversación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground opacity-75">Formato</Label>
              <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="md" id="md" />
                  <Label htmlFor="md">Markdown (.md)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf">PDF (.pdf)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="html" id="html" />
                  <Label htmlFor="html">HTML (.html)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Range Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground opacity-75">Rango</Label>
              <RadioGroup value={exportRange} onValueChange={setExportRange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="current" id="current" />
                  <Label htmlFor="current">Mensaje actual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selection" id="selection" />
                  <Label htmlFor="selection">Selección de mensajes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="thread" id="thread" />
                  <Label htmlFor="thread">Hilo completo</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Cleanup Options */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground opacity-75">Limpieza</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="hide_meta" />
                  <Label htmlFor="hide_meta">Ocultar metadatos (tokens/hora)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="hide_chips" />
                  <Label htmlFor="hide_chips">Ocultar chips de herramientas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mask_pii" />
                  <Label htmlFor="mask_pii">Anonimizar PII</Label>
                  <span className="text-xs text-muted-foreground ml-1">E-mails, teléfonos, IDs</span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground opacity-75">Vista previa</Label>
              <div className="border rounded-lg p-3 bg-muted h-48 overflow-y-auto" style={{ borderRadius: '10px' }}>
                <div className="space-y-2 text-sm">
                  <div className="font-medium">Chat Maestro - Launch-2025</div>
                  <div className="text-xs text-muted-foreground">Exportado el {new Date().toLocaleDateString()}</div>
                  <hr className="my-2" />
                  <div className="space-y-1">
                    <div><strong>Usuario:</strong> Ejemplo de mensaje del usuario.</div>
                    <div><strong>AI:</strong> Respuesta final consolidada con viñetas...</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setShowExportDialog(false)}
                className="px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                <Download className="w-3 h-3" />
                Descargar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartir conversación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Mode Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground opacity-75">Modo de enlace</Label>
              <RadioGroup value={shareMode} onValueChange={setShareMode}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="readonly" id="readonly" />
                  <Label htmlFor="readonly">Solo lectura</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comments" id="comments" />
                  <Label htmlFor="comments">Con comentarios</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Scope Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground opacity-75">Ámbito</Label>
              <RadioGroup value={shareScope} onValueChange={setShareScope}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="thread" id="scope_thread" />
                  <Label htmlFor="scope_thread">Hilo completo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="branch" id="branch" />
                  <Label htmlFor="branch">Rama actual</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Privacy Options */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground opacity-75">Privacidad</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="require_code" />
                  <Label htmlFor="require_code">Requerir código de acceso</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="expire_7d" />
                  <Label htmlFor="expire_7d">Expira en 7 días</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="hide_usernames" />
                  <Label htmlFor="hide_usernames">Ocultar nombres de usuario</Label>
                </div>
              </div>
            </div>

            {/* Link Input */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground opacity-75">Enlace</Label>
              <div className="flex gap-2">
                <Input 
                  value="https://studio.example.com/share/abcdef123456"
                  readOnly
                  className="font-mono text-sm"
                  style={{ borderRadius: '8px' }}
                />
                <button className="flex items-center gap-1 px-3 py-2 border border-border rounded-md text-sm hover:bg-accent transition-colors">
                  <Copy className="w-3 h-3" />
                  Copiar
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setShowShareDialog(false)}
                className="px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
              >
                Cerrar
              </button>
              <button className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                <Link className="w-3 h-3" />
                Crear enlace
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QA & Accessibility Overlay */}
      {showQAOverlay && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" style={{ borderRadius: '14px' }}>
            <div className="sticky top-0 bg-card border-b px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Guía QA & Accesibilidad</h2>
              <button
                onClick={() => setShowQAOverlay(false)}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                aria-label="Cerrar guía"
                style={{ minWidth: '32px', minHeight: '32px' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Checklist Visual */}
              <section>
                <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Checklist Visual
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Header fijo; Composer sticky; Timeline ocupa todo el centro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Burbujas usuario derecha, assistant izquierda, system centrado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Panel derecho: desktop visible, móvil modal deslizante</span>
                  </div>
                </div>
              </section>

              {/* Checklist Accesibilidad */}
              <section>
                <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4" />
                  Checklist Accesibilidad
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Contraste AA verificado en botones y textos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Foco visible en todos los interactivos (outline 2px)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Etiquetas claras en iconos del header y acciones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Targets mínimo 32x32px para touch</span>
                  </div>
                </div>
              </section>

              {/* Checklist Performance */}
              <section>
                <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                  <ArrowUp className="w-4 h-4" />
                  Checklist Performance (diseño)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Skeletons en carga (implementados)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Botón 'Ir al final' aparece con overflow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Anotado el hint de 'ventana visible' (~20–30 items)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Lista virtualizada con spacers superior e inferior</span>
                  </div>
                </div>
              </section>

              {/* Keyboard Shortcuts */}
              <section>
                <h3 className="text-base font-medium mb-3">Atajos de Teclado</h3>
                <div className="space-y-1 text-sm font-mono bg-muted p-3 rounded-lg">
                  <div>Ctrl/⌘+Enter: Enviar mensaje</div>
                  <div>↑: Editar último mensaje (futuro)</div>
                  <div>/: Abrir menú de comandos</div>
                  <div>Esc: Cerrar modales/overlays</div>
                </div>
              </section>

              {/* ARIA Labels Info */}
              <section>
                <h3 className="text-base font-medium mb-3">Etiquetas ARIA</h3>
                <div className="space-y-1 text-sm bg-muted p-3 rounded-lg">
                  <div>• Botón modelo: "Seleccionar modelo"</div>
                  <div>• Botón preset: "Seleccionar preset del sistema"</div>
                  <div>• Toggle panel: "Abrir biblioteca"</div>
                  <div>• Estado sistema: "Estado del sistema: activo"</div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatModule;