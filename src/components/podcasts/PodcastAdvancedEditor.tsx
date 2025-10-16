import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { 
  Send, 
  Bot, 
  User, 
  Play,
  Pause,
  Volume2,
  Music,
  Zap,
  FileText,
  Scissors,
  BarChart3,
  AudioWaveform,
  Upload,
  Download,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  Search,
  Command,
  ChevronDown,
  File,
  Edit,
  Headphones,
  Subtitles,
  Package
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TimelineClip {
  id: string;
  name: string;
  start: number;
  duration: number;
  color: string;
}

interface TimelineTrack {
  id: string;
  label: string;
  color: string;
  clips: TimelineClip[];
}

function WaveformPlaceholder() {
  const bars = Array.from({ length: 120 }, (_, i) => ({
    height: Math.random() * 80 + 20,
    opacity: Math.random() * 0.8 + 0.2
  }));

  return (
    <div className="w-full h-full bg-black border border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-4 flex items-center justify-center gap-1">
        {bars.map((bar, index) => (
          <div
            key={index}
            className="bg-blue-400 rounded-full"
            style={{
              width: '2px',
              height: `${bar.height}%`,
              opacity: bar.opacity
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 text-center">
        <div className="bg-black/50 text-white px-4 py-2 rounded-lg">
          <h3 className="text-lg font-medium">Waveform completo del episodio</h3>
          <p className="text-sm text-gray-300 mt-1">Vista general del audio procesado</p>
        </div>
      </div>
    </div>
  );
}

function TimelineTrackComponent({ track }: { track: TimelineTrack }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 h-12 flex items-center gap-3">
      <div className="w-40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: track.color }}
          />
          <span className="text-white text-sm font-medium">{track.label}</span>
        </div>
      </div>
      
      <div className="flex-1 relative h-8 bg-gray-900 rounded">
        {track.clips.map((clip) => (
          <div
            key={clip.id}
            className="absolute top-1 bottom-1 rounded opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            style={{
              backgroundColor: clip.color,
              left: `${clip.start}%`,
              width: `${clip.duration}%`
            }}
          >
            <div className="px-2 py-1 text-xs text-white truncate">
              {clip.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VoiceToolsSection() {
  const [trimValue, setTrimValue] = useState([0]);
  
  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          Pista principal (Voz)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs font-medium mb-2 block">
            Recorte (segundos): {trimValue[0]}
          </label>
          <Slider
            value={trimValue}
            onValueChange={setTrimValue}
            min={0}
            max={7200}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0s</span>
            <span>2h</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button variant="secondary" size="sm" className="w-full">
            <BarChart3 className="w-3 h-3 mr-2" />
            Normalizar volumen
          </Button>
          <Button variant="secondary" size="sm" className="w-full">
            <AudioWaveform className="w-3 h-3 mr-2" />
            Reducir ruido
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MusicToolsSection() {
  const [volumeValue, setVolumeValue] = useState([60]);
  const [fadeEnabled, setFadeEnabled] = useState(true);
  const [loopEnabled, setLoopEnabled] = useState(false);
  
  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Music className="w-4 h-4" />
          Música de fondo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs font-medium mb-2 block">
            Volumen: {volumeValue[0]}%
          </label>
          <Slider
            value={volumeValue}
            onValueChange={setVolumeValue}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Fade in/out automático</label>
            <Switch 
              checked={fadeEnabled} 
              onCheckedChange={setFadeEnabled}
              className="scale-75"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Loop continuo</label>
            <Switch 
              checked={loopEnabled} 
              onCheckedChange={setLoopEnabled}
              className="scale-75"
            />
          </div>
        </div>
        
        <Button variant="secondary" size="sm" className="w-full">
          <Upload className="w-3 h-3 mr-2" />
          Reemplazar pista musical
        </Button>
      </CardContent>
    </Card>
  );
}

function EffectsToolsSection() {
  const [fxVolumeValue, setFxVolumeValue] = useState([80]);
  const [syncMode, setSyncMode] = useState("Manual");
  
  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Efectos sonoros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="secondary" size="sm" className="w-full">
          <Zap className="w-3 h-3 mr-2" />
          Insertar efecto sonoro
        </Button>
        
        <div>
          <label className="text-xs font-medium mb-2 block">
            Volumen FX: {fxVolumeValue[0]}%
          </label>
          <Slider
            value={fxVolumeValue}
            onValueChange={setFxVolumeValue}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
        
        <div>
          <label className="text-xs font-medium mb-2 block">Sincronización</label>
          <Select value={syncMode} onValueChange={setSyncMode}>
            <SelectTrigger className="bg-gray-50 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="IA (auto-sync)">IA (auto-sync)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function SubtitlesToolsSection() {
  const [aiTranscriptionEnabled, setAiTranscriptionEnabled] = useState(true);
  const [language, setLanguage] = useState("ES");
  
  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Subtítulos / Transcripción
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium">Generar transcripción automática (IA)</label>
          <Switch 
            checked={aiTranscriptionEnabled} 
            onCheckedChange={setAiTranscriptionEnabled}
            className="scale-75"
          />
        </div>
        
        <div>
          <label className="text-xs font-medium mb-2 block">Idioma</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-gray-50 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ES">ES</SelectItem>
              <SelectItem value="EN">EN</SelectItem>
              <SelectItem value="Multi">Multi</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Button variant="secondary" size="sm" className="w-full">
            <Download className="w-3 h-3 mr-2" />
            Exportar transcripción (.txt)
          </Button>
          <Button variant="secondary" size="sm" className="w-full">
            <Download className="w-3 h-3 mr-2" />
            Exportar subtítulos (.srt)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BrandGuardOverlay() {
  const validations = [
    { id: 1, status: 'success', text: '✅ Intro detectada en minuto 0' },
    { id: 2, status: 'warning', text: '⚠️ Volumen irregular entre 5 y 12 min' },
    { id: 3, status: 'success', text: '✅ Música de fondo nivelada (-20dB)' },
    { id: 4, status: 'warning', text: '⚠️ Silencios largos en minuto 27' },
    { id: 5, status: 'warning', text: '⚠️ CTA final no detectado' }
  ];

  return (
    <Card className="absolute bottom-4 right-4 w-80 border border-gray-300 rounded-xl shadow-sm bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Validaciones BrandGuard (Audio)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {validations.map((validation) => (
            <div key={validation.id} className="flex items-start gap-2 text-xs">
              {validation.status === 'success' ? (
                <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
              )}
              <span className={`flex-1 ${
                validation.status === 'success' ? 'text-green-700' : 'text-amber-700'
              }`}>
                {validation.text}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button size="sm" className="flex-1 text-xs">
            <RotateCcw className="w-3 h-3 mr-1" />
            Autocorregir IA
          </Button>
          <Button size="sm" variant="ghost" className="flex-1 text-xs">
            <Eye className="w-3 h-3 mr-1" />
            Ver reporte completo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CoverPreviewSection() {
  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Preview de portada</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <div className="w-full aspect-square bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg border border-gray-300 shadow-xs p-6 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-lg mb-3 mx-auto flex items-center justify-center">
                <Volume2 className="w-8 h-8" />
              </div>
              <h4 className="font-semibold text-sm">Logística Internacional</h4>
              <p className="text-xs opacity-90 mt-1">Podcast Entrevista</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            <strong>Validación:</strong> logo debe estar visible en portada
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MacrosIASection() {
  const macros = [
    { id: 1, label: 'Limpiar ruido y normalizar voz', icon: AudioWaveform },
    { id: 2, label: 'Recortar silencios automáticamente', icon: Scissors },
    { id: 3, label: 'Nivelar volumen en todo el episodio', icon: BarChart3 },
    { id: 4, label: 'Insertar música de fondo sugerida', icon: Music }
  ];

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Macros IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {macros.map((macro) => {
          const Icon = macro.icon;
          return (
            <Button
              key={macro.id}
              variant="secondary"
              size="sm"
              className="w-full justify-start text-xs"
            >
              <Icon className="w-3 h-3 mr-2" />
              {macro.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function MasterMenuBar() {
  const menuItems = [
    {
      label: 'Archivo',
      icon: File,
      items: ['Nuevo proyecto', 'Guardar', 'Exportar']
    },
    {
      label: 'Edición',
      icon: Edit,
      items: ['Deshacer', 'Rehacer', 'Cortar silencio', 'Dividir clip']
    },
    {
      label: 'Audio',
      icon: Headphones,
      items: ['Normalizar', 'Reducir ruido', 'Auto Fade']
    },
    {
      label: 'Subtítulos',
      icon: Subtitles,
      items: ['Generar IA', 'Sincronizar', 'Traducir']
    },
    {
      label: 'Exportar',
      icon: Package,
      items: ['Preflight QA', 'Exportar MP3', 'Exportar WAV']
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-md p-1 flex items-center gap-1">
      {menuItems.map((menu) => {
        const Icon = menu.icon;
        return (
          <Button
            key={menu.label}
            variant="ghost"
            size="sm"
            className="text-xs h-8 px-3 flex items-center gap-1"
          >
            <Icon className="w-3 h-3" />
            {menu.label}
            <ChevronDown className="w-2 h-2" />
          </Button>
        );
      })}
    </div>
  );
}

function CommandPalette({ showCommandPalette, setShowCommandPalette, commandSearch, setCommandSearch }: {
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;
  commandSearch: string;
  setCommandSearch: (search: string) => void;
}) {
  const commands = [
    'Normalizar voz',
    'Recortar silencio',
    'Generar subtítulos',
    'Traducir subtítulos',
    'Exportar MP3'
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.toLowerCase().includes(commandSearch.toLowerCase())
  );

  return (
    <Dialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <Command className="w-4 h-4" />
            Paleta de comandos
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar comando..."
              value={commandSearch}
              onChange={(e) => setCommandSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredCommands.length > 0 ? (
              <div className="space-y-1">
                {filteredCommands.map((command, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                  >
                    {command}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">
                No se encontraron comandos
              </p>
            )}
          </div>
          
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+K</kbd> para abrir
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreflightQAModal({ showPreflightQA, setShowPreflightQA }: {
  showPreflightQA: boolean;
  setShowPreflightQA: (show: boolean) => void;
}) {
  const checklist = [
    { id: 1, status: 'success', text: '✅ Intro presente' },
    { id: 2, status: 'success', text: '✅ Outro presente' },
    { id: 3, status: 'success', text: '✅ Logo en portada' },
    { id: 4, status: 'success', text: '✅ Volumen consistente (-16 LUFS)' },
    { id: 5, status: 'success', text: '✅ Sin silencios mayores a 3s' },
    { id: 6, status: 'warning', text: '⚠️ CTA final no detectado' }
  ];

  return (
    <Dialog open={showPreflightQA} onOpenChange={setShowPreflightQA}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Preflight QA — Checklist de publicación</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-start gap-2 text-sm">
                {item.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                )}
                <span className={`flex-1 ${
                  item.status === 'success' ? 'text-green-700' : 'text-amber-700'
                }`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setShowPreflightQA(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => setShowPreflightQA(false)}
              className="flex-1"
            >
              Exportar ahora
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PodcastAdvancedEditor() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'user',
      content: 'Revisa si el audio tiene silencios largos',
      timestamp: new Date(Date.now() - 240000)
    },
    {
      id: '2',
      role: 'assistant',
      content: '⚠️ Detectados 3 silencios largos (min 12, 18 y 27). ¿Quieres que los recorte?',
      timestamp: new Date(Date.now() - 180000)
    },
    {
      id: '3',
      role: 'user',
      content: 'Sí, recórtalos automáticamente',
      timestamp: new Date(Date.now() - 120000)
    },
    {
      id: '4',
      role: 'assistant',
      content: '✅ Silencios recortados. Duración ajustada a 28:45.',
      timestamp: new Date(Date.now() - 60000)
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [showPreflightQA, setShowPreflightQA] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const timelineTracks: TimelineTrack[] = [
    {
      id: 'voice',
      label: 'Pista principal (voz)',
      color: '#3B82F6',
      clips: [
        { id: 'intro', name: 'Intro', start: 0, duration: 15, color: '#3B82F6' },
        { id: 'interview', name: 'Entrevista', start: 20, duration: 60, color: '#3B82F6' },
        { id: 'outro', name: 'Outro', start: 85, duration: 10, color: '#3B82F6' }
      ]
    },
    {
      id: 'music',
      label: 'Música de fondo',
      color: '#EC4899',
      clips: [
        { id: 'bg-music', name: 'Track 1 (loop)', start: 0, duration: 95, color: '#EC4899' }
      ]
    },
    {
      id: 'effects',
      label: 'Efectos sonoros',
      color: '#10B981',
      clips: [
        { id: 'applause', name: 'FX aplausos', start: 18, duration: 3, color: '#10B981' },
        { id: 'bell', name: 'FX campana', start: 82, duration: 2, color: '#10B981' }
      ]
    }
  ];

  const sendMessage = () => {
    if (!currentMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        '✅ Ajuste aplicado correctamente.',
        '🎵 Cambio de audio procesado.',
        '⚡ Efectos aplicados en las pistas seleccionadas.',
        '📈 Volumen normalizado automáticamente.',
        '🔇 Ruido de fondo reducido al 90%.'
      ];
      
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-canvas p-4">
      <div className="max-w-[1440px] mx-auto h-[900px] flex flex-col gap-4">
        
        {/* Master Menu Bar */}
        <div className="flex-shrink-0">
          <MasterMenuBar />
        </div>

        {/* Main Editor Layout */}
        <div className="flex-1 flex gap-4 min-h-0">
        
          {/* Left Panel - Chat IA */}
          <div className="w-80 bg-white rounded-xl shadow-sm p-4 flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Chat de Edición (IA)
              </h3>
            </div>
            
            {/* Chat Window */}
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-3 pr-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-6 h-6 bg-bubble-assistant rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3 h-3" />
                      </div>
                    )}
                    <div className={`max-w-[240px] p-3 rounded-lg text-sm ${
                      message.role === 'user' 
                        ? 'bg-bubble-user text-white' 
                        : 'bg-bubble-assistant text-foreground'
                    }`}>
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-6 h-6 bg-bubble-user rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Chat Input */}
            <div className="space-y-3">
              <Textarea 
                placeholder="Escribe una instrucción…"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[80px] resize-none"
              />
              <Button 
                onClick={sendMessage}
                disabled={!currentMessage.trim()}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>

          {/* Center Content */}
          <div className="flex-1 flex flex-col gap-6 relative">
            
            {/* Canvas Preview */}
            <div className="h-[360px]">
              <WaveformPlaceholder />
            </div>
            
            {/* Timeline Multipista */}
            <Card className="flex-1 bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white flex items-center justify-between">
                  <span>Timeline Multipista</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary">
                      <Play className="w-4 h-4 mr-1" />
                      Reproducir
                    </Button>
                    <Button size="sm" variant="outline">
                      <Pause className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {timelineTracks.map((track) => (
                  <TimelineTrackComponent key={track.id} track={track} />
                ))}
              </CardContent>
            </Card>

            {/* BrandGuard Overlay */}
            <BrandGuardOverlay />
          </div>

          {/* Right Panel - Herramientas */}
          <div className="w-65 bg-white rounded-xl shadow-sm p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium">Herramientas</h3>
            </div>
            
            <ScrollArea className="h-[360px] pr-2">
              <div className="space-y-4">
                <VoiceToolsSection />
                <MusicToolsSection />
                <EffectsToolsSection />
                <SubtitlesToolsSection />
              </div>
            </ScrollArea>

            {/* Macros IA Section */}
            <div className="mt-4">
              <MacrosIASection />
            </div>
            
            {/* Cover Preview Section */}
            <div className="mt-4">
              <CoverPreviewSection />
            </div>
            
            {/* Additional controls */}
            <Card className="mt-4 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <h4 className="text-sm font-medium text-blue-900">Control Maestro</h4>
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowPreflightQA(true)}
                    >
                      <Shield className="w-3 h-3 mr-2" />
                      Preflight QA
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Download className="w-3 h-3 mr-2" />
                      Exportar MP3
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Play className="w-3 h-3 mr-2" />
                      Vista Previa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modals and Overlays */}
          <CommandPalette 
            showCommandPalette={showCommandPalette}
            setShowCommandPalette={setShowCommandPalette}
            commandSearch={commandSearch}
            setCommandSearch={setCommandSearch}
          />
          <PreflightQAModal 
            showPreflightQA={showPreflightQA}
            setShowPreflightQA={setShowPreflightQA}
          />
        </div>
      </div>
    </div>
  );
}