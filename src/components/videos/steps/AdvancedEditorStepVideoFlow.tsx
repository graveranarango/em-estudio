import { useState, useCallback, useEffect } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { ScrollArea } from "../../ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../ui/command";
import { useBrandKit } from "../../../contexts/BrandKitContext";
import { useVideoProject } from "../../../contexts/VideoProjectContext";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  ArrowLeft,
  ArrowRight,
  Video,
  Music,
  Type,
  Layers,
  Settings,
  Plus,
  ChevronDown,
  Wand2,
  Scissors,
  Shuffle,
  Languages,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Search
} from "lucide-react";

interface AdvancedEditorStepVideoFlowProps {
  onNext: () => void;
  onPrevious: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TimelineClip {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  color: string;
}

interface TimelineTrack {
  id: string;
  label: string;
  color: string;
  clips: TimelineClip[];
}

export function AdvancedEditorStepVideoFlow({ onNext, onPrevious }: AdvancedEditorStepVideoFlowProps) {
  const { hasBrandKit, brandKit } = useBrandKit();
  const { currentProject } = useVideoProject();
  
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'user',
      content: 'Agrega subtítulos en inglés a la escena 3',
      timestamp: new Date(Date.now() - 120000)
    },
    {
      id: '2',
      role: 'assistant',
      content: '✅ Subtítulos en inglés generados y sincronizados.',
      timestamp: new Date(Date.now() - 90000)
    },
    {
      id: '3',
      role: 'assistant',
      content: '⚠️ Contraste bajo detectado en subtítulos, sugerido color #FFFFFF.',
      timestamp: new Date(Date.now() - 85000)
    },
    {
      id: '4',
      role: 'user',
      content: 'Reduce el volumen de la música',
      timestamp: new Date(Date.now() - 60000)
    },
    {
      id: '5',
      role: 'assistant',
      content: '✅ Música reducida a 60%.',
      timestamp: new Date(Date.now() - 30000)
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // New states for advanced options
  const [showPreflightModal, setShowPreflightModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isProcessingMacro, setIsProcessingMacro] = useState<string | null>(null);

  // Video Controls State
  const [videoClipLength, setVideoClipLength] = useState<number[]>([60]);
  const [videoSpeed, setVideoSpeed] = useState<number[]>([1]);
  const [videoFilter, setVideoFilter] = useState<string>('Ninguno');

  // Audio Controls State
  const [audioVolume, setAudioVolume] = useState<number[]>([80]);
  const [autoFade, setAutoFade] = useState<boolean>(true);

  // Subtitles Controls State
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(true);
  const [subtitlesLanguage, setSubtitlesLanguage] = useState<string>('ES');
  const [subtitlesFont, setSubtitlesFont] = useState<string>('Montserrat');
  const [subtitlesColor, setSubtitlesColor] = useState<string>('#000000');
  const [subtitlesSize, setSubtitlesSize] = useState<number[]>([18]);

  // Overlays Controls State
  const [overlayAnimation, setOverlayAnimation] = useState<string>('Ninguna');
  const [overlayOpacity, setOverlayOpacity] = useState<number[]>([100]);

  // Mobile accordion state
  const [isPreviewsOpen, setIsPreviewsOpen] = useState<boolean>(false);

  // Command palette setup
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Mobile alternative: space + k
      if (e.key === 'k' && e.code === 'Space') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Timeline data placeholder
  const timelineTracks: TimelineTrack[] = [
    {
      id: 'video',
      label: 'Video',
      color: '#3B82F6',
      clips: [
        { id: 'clip1', name: 'Clip 1', startTime: 0, duration: 30, color: '#3B82F6' },
        { id: 'clip2', name: 'Clip 2 (placeholder)', startTime: 30, duration: 45, color: '#60A5FA' }
      ]
    },
    {
      id: 'audio',
      label: 'Audio',
      color: '#EC4899',
      clips: [
        { id: 'audio1', name: 'Música base (placeholder)', startTime: 0, duration: 75, color: '#EC4899' }
      ]
    },
    {
      id: 'subtitles',
      label: 'Subtítulos',
      color: '#10B981',
      clips: [
        { id: 'subtitle1', name: 'Texto (placeholder)', startTime: 5, duration: 65, color: '#10B981' }
      ]
    },
    {
      id: 'overlays',
      label: 'Overlays',
      color: '#FACC15',
      clips: [
        { id: 'overlay1', name: 'Logo (placeholder)', startTime: 0, duration: 10, color: '#FACC15' }
      ]
    }
  ];

  const totalDuration = 75; // seconds
  const timelineWidth = 800; // pixels
  const pixelsPerSecond = timelineWidth / totalDuration;

  const sendChatMessage = useCallback(async () => {
    if (!chatMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: chatMessage,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const responses = [
        '✅ Cambios aplicados correctamente.',
        '✅ He ajustado el elemento según tu solicitud.',
        '✅ Timeline actualizado. Los cambios mantienen la coherencia de marca.',
        '✅ Modificación completada. El proyecto sigue las directrices del BrandKit.'
      ];

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1500);
  }, [chatMessage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // AI Macros handlers
  const handleMacroAction = useCallback(async (macroType: string) => {
    setIsProcessingMacro(macroType);
    
    // Simulate processing time
    setTimeout(() => {
      const macroMessages = {
        'autocorte': '✅ Autocortes aplicados según el ritmo musical detectado.',
        'transiciones': '✅ Transiciones suaves aplicadas en todas las escenas.',
        'subtitulos': '✅ Subtítulos sincronizados automáticamente con el audio.',
        'multiformato': '✅ Versiones generadas: 16:9, 9:16 y 1:1.'
      };
      
      const assistantMessage: ChatMessage = {
        id: `macro_${Date.now()}`,
        role: 'assistant',
        content: macroMessages[macroType] || '✅ Macro ejecutado correctamente.',
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, assistantMessage]);
      setIsProcessingMacro(null);
    }, 2000);
  }, []);

  // Command palette handlers
  const handleCommandExecute = useCallback((command: string) => {
    setShowCommandPalette(false);
    
    const commandActions = {
      'Agregar subtítulo': () => setSubtitlesEnabled(true),
      'Insertar logo': () => {},
      'Cambiar velocidad clip': () => {},
      'Autocorte IA': () => handleMacroAction('autocorte'),
      'Exportar MP4': () => setShowPreflightModal(true)
    };
    
    if (commandActions[command]) {
      commandActions[command]();
    }
  }, [handleMacroAction]);

  const renderTimelineTrack = (track: TimelineTrack) => (
    <div key={track.id} className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-16 text-xs text-white font-medium">{track.label}</div>
        <div className="flex items-center gap-1">
          {track.id === 'video' && <Video className="w-3 h-3 text-white" />}
          {track.id === 'audio' && <Music className="w-3 h-3 text-white" />}
          {track.id === 'subtitles' && <Type className="w-3 h-3 text-white" />}
          {track.id === 'overlays' && <Layers className="w-3 h-3 text-white" />}
        </div>
      </div>
      <div className="h-10 bg-gray-800 rounded relative">
        {track.clips.map(clip => (
          <div
            key={clip.id}
            className="absolute h-8 top-1 rounded text-white text-xs flex items-center px-2 cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              left: clip.startTime * pixelsPerSecond,
              width: clip.duration * pixelsPerSecond,
              backgroundColor: clip.color
            }}
          >
            <span className="truncate">{clip.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
        {/* Left Panel - Chat IA */}
        <div className="w-full lg:w-72 flex flex-col">
          <Card className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Chat de Edición (IA)</h3>
                  <p className="text-xs text-muted-foreground">
                    {hasBrandKit ? 'BrandKit activo' : 'Sin BrandKit'}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatHistory.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Processing indicator */}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-4 border-t space-y-3">
              <Textarea
                placeholder="Escribe un comando…"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                className="min-h-[80px] resize-none"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={sendChatMessage}
                  disabled={!chatMessage.trim() || isProcessing}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCommandPalette(true)}
                  className="px-3"
                  title="Abrir paleta de comandos (⌘K)"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* BrandGuard Overlay - Mobile */}
          <div className="lg:hidden">
            <Card className="p-3 bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <Settings className="w-3 h-3 text-red-600" />
                </div>
                <h4 className="font-semibold text-sm">Validaciones BrandGuard</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-600">✅</span>
                  <span className="text-gray-700">Logo respeta zona segura</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-amber-600">⚠️</span>
                  <span className="text-gray-700">Contraste bajo en subtítulos</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-600">✅</span>
                  <span className="text-gray-700">Colores cumplen paleta</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-amber-600">⚠️</span>
                  <span className="text-gray-700">Música demasiado alta</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-xs px-3 py-1 h-7 flex-1">
                  Autocorregir
                </Button>
                <Button variant="ghost" size="sm" className="text-xs px-3 py-1 h-7 flex-1">
                  Ver reporte
                </Button>
              </div>
            </Card>
          </div>

          {/* Canvas Preview */}
          <Card className="h-[200px] lg:h-[360px] flex items-center justify-center bg-black border border-gray-300 rounded-lg overflow-hidden relative">
            <div className="w-[640px] h-[360px] bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400">Preview de escena activa</p>
                <p className="text-xs text-gray-500 mt-2">Canvas: 640x360</p>
              </div>
            </div>
            
            {/* BrandGuard Overlay - Desktop */}
            <div className="hidden lg:block absolute bottom-4 right-4 w-80 bg-white rounded-xl border border-gray-200 shadow-sm p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <Settings className="w-3 h-3 text-red-600" />
                </div>
                <h4 className="font-semibold text-sm">Validaciones BrandGuard</h4>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-600">✅</span>
                  <span className="text-gray-700">Logo respeta zona segura</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-amber-600">⚠️</span>
                  <span className="text-gray-700">Contraste bajo en subtítulos de escena 3</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-600">✅</span>
                  <span className="text-gray-700">Colores cumplen paleta BrandKit</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-amber-600">⚠️</span>
                  <span className="text-gray-700">Música demasiado alta (&gt;85 dB)</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-xs px-3 py-1 h-7">
                  Autocorregir
                </Button>
                <Button variant="ghost" size="sm" className="text-xs px-3 py-1 h-7">
                  Ver reporte
                </Button>
              </div>
            </div>
          </Card>

          {/* Timeline Multipista */}
          <Card className="h-[240px] lg:h-[320px] p-4 bg-gray-900 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Timeline Header */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-2 lg:gap-0">
                <div className="flex items-center gap-2 lg:gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hidden lg:inline-flex">
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hidden lg:inline-flex">
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <span className="text-white text-sm font-mono">
                    {formatTime(currentTime)} / {formatTime(totalDuration)}
                  </span>
                </div>
                <Badge variant="outline" className="text-white border-gray-600">
                  Timeline Multipista
                </Badge>
              </div>

              {/* Time ruler */}
              <div className="relative h-6 bg-gray-800 rounded mb-4">
                {Array.from({ length: Math.ceil(totalDuration / 10) + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full border-l border-gray-600"
                    style={{ left: i * 10 * pixelsPerSecond }}
                  >
                    <span className="absolute top-0 left-1 text-xs text-gray-400">
                      {i * 10}s
                    </span>
                  </div>
                ))}
                {/* Playhead */}
                <div
                  className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
                  style={{ left: currentTime * pixelsPerSecond }}
                />
              </div>

              {/* Timeline tracks */}
              <ScrollArea className="flex-1">
                <div className="space-y-2 min-w-[800px] lg:min-w-0">
                  {timelineTracks.map(renderTimelineTrack)}
                </div>
              </ScrollArea>
            </div>
          </Card>
        </div>

        {/* Right Panel - Herramientas */}
        <div className="w-full lg:w-72 flex flex-col">
          <Card className="flex-1">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Herramientas</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Video Clip Section */}
                <Card className="p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Video className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium">Video Clip</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Recorte: {videoClipLength[0]}s</label>
                      <input
                        type="range"
                        min="0"
                        max="300"
                        step="1"
                        value={videoClipLength[0]}
                        onChange={(e) => setVideoClipLength([parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Velocidad: {videoSpeed[0]}x</label>
                      <input
                        type="range"
                        min="0.25"
                        max="2"
                        step="0.25"
                        value={videoSpeed[0]}
                        onChange={(e) => setVideoSpeed([parseFloat(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Filtro</label>
                      <select 
                        value={videoFilter} 
                        onChange={(e) => setVideoFilter(e.target.value)}
                        className="w-full p-2 bg-gray-50 border rounded-lg"
                      >
                        <option value="Ninguno">Ninguno</option>
                        <option value="Cinemático">Cinemático</option>
                        <option value="Retro">Retro</option>
                        <option value="Blanco y Negro">Blanco y Negro</option>
                      </select>
                    </div>
                  </div>
                </Card>

                {/* Audio Section */}
                <Card className="p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Music className="w-4 h-4 text-pink-600" />
                    <h4 className="font-medium">Audio</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Volumen: {audioVolume[0]}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={audioVolume[0]}
                        onChange={(e) => setAudioVolume([parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Fade in/out automático</label>
                      <input
                        type="checkbox"
                        checked={autoFade}
                        onChange={(e) => setAutoFade(e.target.checked)}
                        className="w-4 h-4"
                      />
                    </div>
                    <Button variant="secondary" className="w-full">
                      Reemplazar pista
                    </Button>
                  </div>
                </Card>

                {/* Subtítulos Section */}
                <Card className="p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Type className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium">Subtítulos</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Activar subtítulos automáticos</label>
                      <input
                        type="checkbox"
                        checked={subtitlesEnabled}
                        onChange={(e) => setSubtitlesEnabled(e.target.checked)}
                        className="w-4 h-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Idioma</label>
                      <select 
                        value={subtitlesLanguage} 
                        onChange={(e) => setSubtitlesLanguage(e.target.value)}
                        className="w-full p-2 bg-gray-50 border rounded-lg"
                      >
                        <option value="ES">ES</option>
                        <option value="EN">EN</option>
                        <option value="Multi">Multi</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fuente</label>
                      <select 
                        value={subtitlesFont} 
                        onChange={(e) => setSubtitlesFont(e.target.value)}
                        className="w-full p-2 bg-gray-50 border rounded-lg"
                      >
                        <option value="Montserrat">Montserrat</option>
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        {hasBrandKit && brandKit?.typography?.primary?.name && (
                          <option value={brandKit.typography.primary.name}>
                            {brandKit.typography.primary.name}
                          </option>
                        )}
                        {hasBrandKit && brandKit?.typography?.secondary?.name && (
                          <option value={brandKit.typography.secondary.name}>
                            {brandKit.typography.secondary.name}
                          </option>
                        )}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Color texto</label>
                      <div className="flex gap-2 flex-wrap">
                        {hasBrandKit && brandKit?.colors ? (
                          <>
                            {Array.isArray(brandKit.colors.primary) && brandKit.colors.primary.map((color: string, index: number) => (
                              <button
                                key={`primary-${index}`}
                                className={`w-6 h-6 rounded-full border-2 hover:border-gray-500 transition-colors ${
                                  subtitlesColor === color ? 'border-gray-800' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setSubtitlesColor(color)}
                                aria-label={`Seleccionar color primario ${color}`}
                              />
                            ))}
                            {Array.isArray(brandKit.colors.secondary) && brandKit.colors.secondary.map((color: string, index: number) => (
                              <button
                                key={`secondary-${index}`}
                                className={`w-6 h-6 rounded-full border-2 hover:border-gray-500 transition-colors ${
                                  subtitlesColor === color ? 'border-gray-800' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setSubtitlesColor(color)}
                                aria-label={`Seleccionar color secundario ${color}`}
                              />
                            ))}
                          </>
                        ) : (
                          <>
                            <button
                              className={`w-6 h-6 rounded-full border-2 hover:border-gray-500 transition-colors bg-black ${
                                subtitlesColor === '#000000' ? 'border-gray-800' : 'border-gray-300'
                              }`}
                              onClick={() => setSubtitlesColor('#000000')}
                              aria-label="Seleccionar color negro"
                            />
                            <button
                              className={`w-6 h-6 rounded-full border-2 hover:border-gray-500 transition-colors bg-white ${
                                subtitlesColor === '#ffffff' ? 'border-gray-800' : 'border-gray-300'
                              }`}
                              onClick={() => setSubtitlesColor('#ffffff')}
                              aria-label="Seleccionar color blanco"
                            />
                            <button
                              className={`w-6 h-6 rounded-full border-2 hover:border-gray-500 transition-colors bg-gray-600 ${
                                subtitlesColor === '#666666' ? 'border-gray-800' : 'border-gray-300'
                              }`}
                              onClick={() => setSubtitlesColor('#666666')}
                              aria-label="Seleccionar color gris"
                            />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tamaño: {subtitlesSize[0]}px</label>
                      <input
                        type="range"
                        min="10"
                        max="48"
                        step="1"
                        value={subtitlesSize[0]}
                        onChange={(e) => setSubtitlesSize([parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </Card>

                {/* Overlays Section */}
                <Card className="p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-yellow-600" />
                    <h4 className="font-medium">Overlays</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Button variant="secondary" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar texto overlay
                      </Button>
                      <Button variant="secondary" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Insertar logo (BrandKit)
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Animación</label>
                      <select 
                        value={overlayAnimation} 
                        onChange={(e) => setOverlayAnimation(e.target.value)}
                        className="w-full p-2 bg-gray-50 border rounded-lg"
                      >
                        <option value="Ninguna">Ninguna</option>
                        <option value="Fade">Fade</option>
                        <option value="Zoom">Zoom</option>
                        <option value="Slide">Slide</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Opacidad: {overlayOpacity[0]}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={overlayOpacity[0]}
                        onChange={(e) => setOverlayOpacity([parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </Card>

                {/* Macros IA Section */}
                <Card className="p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Wand2 className="w-4 h-4 text-red-600" />
                    <h4 className="font-medium">Macros IA</h4>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      variant="secondary" 
                      className="w-full justify-start text-sm h-auto py-2 px-3"
                      onClick={() => handleMacroAction('autocorte')}
                      disabled={isProcessingMacro === 'autocorte'}
                    >
                      {isProcessingMacro === 'autocorte' ? (
                        <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      ) : (
                        <Scissors className="w-4 h-4 mr-2 flex-shrink-0" />
                      )}
                      <span className="text-left">Autocortes según ritmo de música</span>
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full justify-start text-sm h-auto py-2 px-3"
                      onClick={() => handleMacroAction('transiciones')}
                      disabled={isProcessingMacro === 'transiciones'}
                    >
                      {isProcessingMacro === 'transiciones' ? (
                        <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      ) : (
                        <Shuffle className="w-4 h-4 mr-2 flex-shrink-0" />
                      )}
                      <span className="text-left">Aplicar transiciones suaves a todas las escenas</span>
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full justify-start text-sm h-auto py-2 px-3"
                      onClick={() => handleMacroAction('subtitulos')}
                      disabled={isProcessingMacro === 'subtitulos'}
                    >
                      {isProcessingMacro === 'subtitulos' ? (
                        <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      ) : (
                        <Languages className="w-4 h-4 mr-2 flex-shrink-0" />
                      )}
                      <span className="text-left">Sincronizar subtítulos automáticamente</span>
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full justify-start text-sm h-auto py-2 px-3"
                      onClick={() => handleMacroAction('multiformato')}
                      disabled={isProcessingMacro === 'multiformato'}
                    >
                      {isProcessingMacro === 'multiformato' ? (
                        <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
                      )}
                      <span className="text-left">Generar multiformato (16:9, 9:16, 1:1)</span>
                    </Button>
                  </div>
                </Card>

                {/* Vista previa en plataformas Section - Desktop */}
                <div className="hidden lg:block">
                  <Card className="p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="w-4 h-4 text-purple-600" />
                      <h4 className="font-medium">Vista previa en plataformas</h4>
                    </div>
                    <div className="space-y-3">
                      {/* YouTube Mockup */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600">YouTube (16:9)</label>
                        <div 
                          className="w-full h-[60px] border border-gray-200 rounded-lg flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: hasBrandKit && brandKit?.colors?.primary?.[0] ? brandKit.colors.primary[0] : '#3B82F6' }}
                        >
                          <span className="text-white text-xs font-medium">Preview</span>
                        </div>
                      </div>

                      {/* TikTok Mockup */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600">TikTok (9:16)</label>
                        <div className="flex justify-center">
                          <div 
                            className="w-16 h-28 border border-gray-200 rounded-lg flex items-center justify-center shadow-xs"
                            style={{ backgroundColor: hasBrandKit && brandKit?.colors?.secondary?.[0] ? brandKit.colors.secondary[0] : '#EC4899' }}
                          >
                            <span className="text-white text-xs font-medium">Preview</span>
                          </div>
                        </div>
                      </div>

                      {/* LinkedIn Mockup */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600">LinkedIn (16:9)</label>
                        <div 
                          className="w-full h-[60px] border border-gray-200 rounded-lg flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: hasBrandKit && brandKit?.colors?.accent?.[0] ? brandKit.colors.accent[0] : '#0077B5' }}
                        >
                          <span className="text-white text-xs font-medium">Preview</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Vista previa en plataformas Section - Mobile Accordion */}
                <div className="lg:hidden">
                  <Collapsible open={isPreviewsOpen} onOpenChange={setIsPreviewsOpen}>
                    <CollapsibleTrigger asChild>
                      <Card className="p-3 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-purple-600" />
                            <h4 className="font-medium">Vista previa en plataformas</h4>
                          </div>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isPreviewsOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Card className="mt-2 p-3 shadow-sm">
                        <div className="space-y-3">
                          {/* YouTube Mockup */}
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600">YouTube (16:9)</label>
                            <div 
                              className="w-full h-[50px] border border-gray-200 rounded-lg flex items-center justify-center shadow-xs"
                              style={{ backgroundColor: hasBrandKit && brandKit?.colors?.primary?.[0] ? brandKit.colors.primary[0] : '#3B82F6' }}
                            >
                              <span className="text-white text-xs font-medium">Preview</span>
                            </div>
                          </div>

                          {/* TikTok Mockup */}
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600">TikTok (9:16)</label>
                            <div className="flex justify-center">
                              <div 
                                className="w-12 h-20 border border-gray-200 rounded-lg flex items-center justify-center shadow-xs"
                                style={{ backgroundColor: hasBrandKit && brandKit?.colors?.secondary?.[0] ? brandKit.colors.secondary[0] : '#EC4899' }}
                              >
                                <span className="text-white text-xs font-medium">Preview</span>
                              </div>
                            </div>
                          </div>

                          {/* LinkedIn Mockup */}
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600">LinkedIn (16:9)</label>
                            <div 
                              className="w-full h-[50px] border border-gray-200 rounded-lg flex items-center justify-center shadow-xs"
                              style={{ backgroundColor: hasBrandKit && brandKit?.colors?.accent?.[0] ? brandKit.colors.accent[0] : '#0077B5' }}
                            >
                              <span className="text-white text-xs font-medium">Preview</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-4 border-t bg-white">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Paso anterior
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm px-3 py-1">
              Paso 5D de 7 - Opciones avanzadas
            </Badge>
            {hasBrandKit && (
              <Badge className="bg-green-100 text-green-800">
                BrandKit Activo
              </Badge>
            )}
          </div>

          <Button onClick={onNext} className="bg-red-500 hover:bg-red-600">
            Siguiente paso
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Command Palette */}
      <CommandDialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
        <CommandInput placeholder="Escribe un comando..." />
        <CommandList>
          <CommandEmpty>No se encontraron comandos.</CommandEmpty>
          <CommandGroup heading="Comandos disponibles">
            <CommandItem onSelect={() => handleCommandExecute('Agregar subtítulo')}>
              <Type className="mr-2 h-4 w-4" />
              <span>Agregar subtítulo</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommandExecute('Insertar logo')}>
              <Layers className="mr-2 h-4 w-4" />
              <span>Insertar logo</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommandExecute('Cambiar velocidad clip')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Cambiar velocidad clip</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommandExecute('Autocorte IA')}>
              <Scissors className="mr-2 h-4 w-4" />
              <span>Autocorte IA</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommandExecute('Exportar MP4')}>
              <Video className="mr-2 h-4 w-4" />
              <span>Exportar MP4</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Preflight QA Modal */}
      <Dialog open={showPreflightModal} onOpenChange={setShowPreflightModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Preflight QA — Checklist de publicación
            </DialogTitle>
            <DialogDescription>
              Verificación final antes de exportar tu video
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-800">Logo presente en escena final</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-800">Colores cumplen BrandKit</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-800">Subtítulos legibles y contrastados</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-800">Audio nivelado</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span className="text-sm text-amber-800">Verifica duración total (supera los 5 minutos)</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowPreflightModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={() => setShowPreflightModal(false)} className="flex-1 bg-red-500 hover:bg-red-600">
              Continuar exportación
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}