import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
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
  CheckCircle,
  AlertTriangle,
  Shield,
  Wand2,
  Eye,
  Menu,
  Command,
  Search,
  ChevronDown,
  Sparkles,
  X,
  Volume,
  VolumeX,
  Settings
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
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
            className="bg-orange-400 rounded-full"
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
          <h3 className="text-lg font-medium">Waveform completo del monólogo</h3>
          <p className="text-sm text-gray-300 mt-1">Vista general del audio procesado</p>
        </div>
        </div>
      </div>
  );
}

function TimelineTrackComponent({ track }: { track: TimelineTrack }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 h-12 flex items-center gap-3">
      {/* Track label */}
      <div className="w-40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: track.color }}
          />
          <span className="text-white text-sm font-medium">{track.label}</span>
        </div>
      </div>
      
      {/* Track timeline */}
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
  const [equalization, setEqualization] = useState("Voz clara");
  
  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          Pista de voz (Monólogo)
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
        
        <div>
          <label className="text-xs font-medium mb-2 block">Ecualización</label>
          <Select value={equalization} onValueChange={setEqualization}>
            <SelectTrigger className="bg-gray-50 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ninguna">Ninguna</SelectItem>
              <SelectItem value="Voz clara">Voz clara</SelectItem>
              <SelectItem value="Podcast Pro">Podcast Pro</SelectItem>
              <SelectItem value="Radio">Radio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function MusicToolsSection() {
  const [volumeValue, setVolumeValue] = useState([50]);
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

function TranscriptionToolsSection() {
  const [aiTranscriptionEnabled, setAiTranscriptionEnabled] = useState(true);
  const [language, setLanguage] = useState("ES");
  
  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Transcripción
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

function CoverPreviewSection() {
  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Preview de portada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg border border-gray-300 shadow-xs flex items-center justify-center relative overflow-hidden">
          {/* Simulated podcast cover */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
          
          {/* Logo placeholder */}
          <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-5 h-5 bg-orange-600 rounded-full" />
          </div>
          
          <div className="relative z-10 text-center text-white">
            <div className="text-lg font-medium mb-1">Podcast Monólogo</div>
            <div className="text-sm opacity-80">Episodio #42</div>
          </div>
          
          {/* Audio wave decoration */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-1 opacity-50">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="bg-white rounded-full"
                style={{
                  width: '2px',
                  height: `${Math.random() * 20 + 5}px`
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-green-700 font-medium">✅ Logo detectado en portada</span>
        </div>
      </CardContent>
    </Card>
  );
}

function BrandGuardOverlay() {
  const validations = [
    { status: 'success', text: '✅ Intro presente en el minuto 0' },
    { status: 'warning', text: '⚠️ Nivel de voz bajo entre minuto 5 y 7' },
    { status: 'success', text: '✅ Música de fondo nivelada (-20dB)' },
    { status: 'warning', text: '⚠️ No se detectó CTA al final' },
    { status: 'success', text: '✅ Logo presente en portada' }
  ];

  return (
    <Card className="absolute bottom-4 right-4 w-80 rounded-xl border border-gray-300 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Validaciones BrandGuard (Audio & Branding)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {validations.map((validation, index) => (
            <div key={index} className="flex items-start gap-2">
              {validation.status === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              )}
              <span className={`text-xs leading-relaxed ${
                validation.status === 'success' ? 'text-green-700' : 'text-amber-700'
              }`}>
                {validation.text}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <Button size="sm" className="flex-1">
            <Wand2 className="w-3 h-3 mr-1" />
            Autocorregir IA
          </Button>
          <Button size="sm" variant="ghost" className="flex-1">
            <Eye className="w-3 h-3 mr-1" />
            Ver reporte completo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MacrosIASection() {
  const macros = [
    { label: 'Limpiar ruido y normalizar voz', icon: AudioWaveform },
    { label: 'Recortar silencios automáticamente', icon: Scissors },
    { label: 'Nivelar volumen en todo el episodio', icon: BarChart3 },
    { label: 'Insertar música sugerida por IA', icon: Music }
  ];

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Macros IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {macros.map((macro, index) => (
          <Button 
            key={index}
            variant="secondary" 
            size="sm" 
            className="w-full justify-start"
          >
            <macro.icon className="w-3 h-3 mr-2" />
            {macro.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

function MasterMenuBar() {
  const menuItems = [
    {
      label: 'Archivo',
      items: ['Nuevo proyecto', 'Guardar', 'Exportar']
    },
    {
      label: 'Edición',
      items: ['Deshacer', 'Rehacer', 'Cortar silencio', 'Dividir clip']
    },
    {
      label: 'Audio',
      items: ['Normalizar', 'Reducir ruido', 'Auto Fade']
    },
    {
      label: 'Transcripción',
      items: ['Generar IA', 'Exportar .txt', 'Exportar .srt']
    },
    {
      label: 'Exportar',
      items: ['Preflight QA', 'Exportar MP3', 'Exportar WAV']
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-md p-1 flex gap-1">
      {menuItems.map((menu, index) => (
        <DropdownMenu key={index}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs">
              {menu.label}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {menu.items.map((item, itemIndex) => (
              <DropdownMenuItem 
                key={itemIndex}
                className="text-xs"
                onClick={() => {
                  if (item === 'Preflight QA') {
                    // This will be handled by the parent component
                    document.dispatchEvent(new CustomEvent('openPreflightQA'));
                  }
                }}
              >
                {item}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  );
}

function PreflightQAModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const checklist = [
    { status: 'success', text: '✅ Intro presente' },
    { status: 'success', text: '✅ Outro presente' },
    { status: 'success', text: '✅ Logo en portada' },
    { status: 'success', text: '✅ Volumen consistente (-16 LUFS)' },
    { status: 'success', text: '✅ Sin silencios mayores a 3s' },
    { status: 'warning', text: '⚠️ CTA final no detectado' }
  ];

  const hasWarnings = checklist.some(item => item.status === 'warning');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Preflight QA — Checklist de publicación
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3">
            {checklist.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                {item.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                )}
                <span className={`text-sm ${
                  item.status === 'success' ? 'text-green-700' : 'text-amber-700'
                }`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
          
          {hasWarnings && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Se detectaron advertencias. ¿Continuar con la exportación?
              </p>
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="ghost" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button className="flex-1">
              <Download className="w-3 h-3 mr-1" />
              Exportar ahora
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CommandPalette({ open, onOpenChange, query, setQuery, commands, onExecute }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  setQuery: (query: string) => void;
  commands: Array<{ id: string; label: string; icon: any }>;
  onExecute: (id: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl p-0">
        <div className="flex items-center border-b border-gray-200 px-3">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            className="flex-1 py-3 bg-transparent border-0 outline-none text-sm placeholder-gray-400"
            placeholder="Buscar comandos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="text-xs text-gray-400 ml-2">⌘K</div>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {commands.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-gray-500">
              No se encontraron comandos
            </div>
          ) : (
            <div className="py-1">
              {commands.map((command) => (
                <button
                  key={command.id}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => onExecute(command.id)}
                >
                  <command.icon className="w-4 h-4 text-gray-500" />
                  {command.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PodcastMonologueAdvancedEditor() {
  const [showPreflightQA, setShowPreflightQA] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'user',
      content: 'Revisa si falta un CTA',
      timestamp: new Date(Date.now() - 240000)
    },
    {
      id: '2',
      role: 'assistant',
      content: '⚠️ No se detectó CTA en los últimos 30s. ¿Quieres que sugiera uno?',
      timestamp: new Date(Date.now() - 180000)
    },
    {
      id: '3',
      role: 'user',
      content: 'Sí, agrega un CTA al final.',
      timestamp: new Date(Date.now() - 120000)
    },
    {
      id: '4',
      role: 'assistant',
      content: '✅ CTA sugerido: \'Suscríbete y comparte este episodio\' añadido al cierre.',
      timestamp: new Date(Date.now() - 60000)
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const timelineTracks: TimelineTrack[] = [
    {
      id: 'voice',
      label: 'Pista de voz (monólogo)',
      color: '#3B82F6',
      clips: [
        { id: 'intro', name: 'Intro', start: 0, duration: 12, color: '#3B82F6' },
        { id: 'main-content', name: 'Contenido principal', start: 15, duration: 70, color: '#3B82F6' },
        { id: 'outro', name: 'Cierre', start: 88, duration: 10, color: '#3B82F6' }
      ]
    },
    {
      id: 'music',
      label: 'Música de fondo',
      color: '#EC4899',
      clips: [
        { id: 'loop1', name: 'Loop 1', start: 0, duration: 45, color: '#EC4899' },
        { id: 'loop2', name: 'Loop 2', start: 50, duration: 48, color: '#EC4899' }
      ]
    },
    {
      id: 'effects',
      label: 'Efectos',
      color: '#10B981',
      clips: [
        { id: 'transition', name: 'FX transición', start: 45, duration: 3, color: '#10B981' },
        { id: 'ending', name: 'FX cierre', start: 85, duration: 3, color: '#10B981' }
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
        '🔇 Ruido de fondo reducido al 90%.',
        '⚠️ Se detectó problema de audio. ¿Quieres que lo corrija?',
        '✅ Validación BrandGuard completada.'
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

  // Command palette shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commandItems = [
    { id: 'normalize', label: 'Normalizar voz', icon: Volume },
    { id: 'trim-silence', label: 'Recortar silencio', icon: Scissors },
    { id: 'generate-transcript', label: 'Generar transcripción', icon: FileText },
    { id: 'export-subtitles', label: 'Exportar subtítulos', icon: Download },
    { id: 'export-mp3', label: 'Exportar MP3', icon: Download }
  ];

  const filteredCommands = commandItems.filter(item =>
    item.label.toLowerCase().includes(commandQuery.toLowerCase())
  );

  const executeCommand = (commandId: string) => {
    setShowCommandPalette(false);
    setCommandQuery('');
    
    // Simulate command execution
    const commandMessage: ChatMessage = {
      id: `cmd_${Date.now()}`,
      role: 'system',
      content: `✅ Comando ejecutado: ${commandItems.find(c => c.id === commandId)?.label}`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, commandMessage]);
  };

  // Handle Preflight QA modal trigger
  React.useEffect(() => {
    const handleOpenPreflight = () => setShowPreflightQA(true);
    document.addEventListener('openPreflightQA', handleOpenPreflight);
    return () => document.removeEventListener('openPreflightQA', handleOpenPreflight);
  }, []);

  return (
    <div className="min-h-screen bg-canvas p-4">
      <div className="max-w-[1440px] mx-auto h-[900px] flex flex-col gap-4">
        
        {/* Header with Master Menu */}
        <div className="flex items-center justify-between">
          <MasterMenuBar />
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCommandPalette(true)}
            >
              <Command className="w-3 h-3 mr-1" />
              Comandos
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex gap-4">
        
        {/* Left Panel - Chat IA */}
        <div className="w-80 bg-white rounded-xl shadow-sm p-4 flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Chat de Edición (IA)
            </h3>
          </div>
          
          {/* Chat Window */}
          <ScrollArea className="flex-1 mb-4 h-[480px]">
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
          <div className="h-[280px]">
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
          
          <ScrollArea className="h-[450px] pr-2">
            <div className="space-y-4">
              <VoiceToolsSection />
              <MusicToolsSection />
              <EffectsToolsSection />
              <TranscriptionToolsSection />
              <MacrosIASection />
              <CoverPreviewSection />
            </div>
          </ScrollArea>
          
          {/* Additional controls */}
          <Card className="mt-4 bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <h4 className="text-sm font-medium text-orange-900">Control Maestro</h4>
                <div className="space-y-2">
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
      </div>
      
      {/* Modals and Overlays */}
      <PreflightQAModal 
        open={showPreflightQA} 
        onOpenChange={setShowPreflightQA} 
      />
      
      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        query={commandQuery}
        setQuery={setCommandQuery}
        commands={filteredCommands}
        onExecute={executeCommand}
      />
    </div>
    </div>
  );
}