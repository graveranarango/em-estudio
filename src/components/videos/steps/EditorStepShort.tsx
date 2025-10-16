import React, { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Textarea } from "../../ui/textarea";
import { ScrollArea } from "../../ui/scroll-area";
import { Slider } from "../../ui/slider";
import { Switch } from "../../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Label } from "../../ui/label";
import { useBrandKit } from "../../../contexts/BrandKitContext";
import { useVideoProject } from "../../../contexts/VideoProjectContext";
import { 
  ArrowLeft,
  ArrowRight,
  Send,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  Scissors,
  Type,
  Image,
  Music,
  Settings,
  Smartphone,
  MessageSquare,
  Bot,
  Upload,
  Palette,
  Plus,
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

// Tipos para mensajes del chat
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Datos de ejemplo del timeline
const TIMELINE_TRACKS = [
  {
    id: 'video',
    label: 'Video',
    color: '#3B82F6',
    clips: [
      { id: 'clip1', name: 'Clip 1', start: 0, duration: 8, color: '#3B82F6' },
      { id: 'clip2', name: 'Clip 2', start: 8, duration: 12, color: '#3B82F6' },
      { id: 'clip3', name: 'Clip 3', start: 20, duration: 10, color: '#3B82F6' }
    ]
  },
  {
    id: 'overlays',
    label: 'Overlays',
    color: '#FACC15',
    clips: [
      { id: 'text1', name: 'Texto 1', start: 2, duration: 5, color: '#FACC15' },
      { id: 'logo1', name: 'Logo', start: 15, duration: 8, color: '#FACC15' }
    ]
  },
  {
    id: 'subtitles',
    label: 'Subtítulos',
    color: '#10B981',
    clips: [
      { id: 'sub1', name: 'Subs línea 1', start: 0, duration: 10, color: '#10B981' },
      { id: 'sub2', name: 'Subs línea 2', start: 10, duration: 20, color: '#10B981' }
    ]
  },
  {
    id: 'audio',
    label: 'Audio',
    color: '#EC4899',
    clips: [
      { id: 'music1', name: 'Música base', start: 0, duration: 30, color: '#EC4899' },
      { id: 'fx1', name: 'FX', start: 8, duration: 3, color: '#F97316' }
    ]
  }
];

// Mensajes iniciales del chat
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Agrega subtítulos en inglés',
    timestamp: new Date(Date.now() - 400000)
  },
  {
    id: '2',
    role: 'assistant',
    content: '✅ Subtítulos en inglés generados y sincronizados.',
    timestamp: new Date(Date.now() - 380000)
  },
  {
    id: '3',
    role: 'assistant',
    content: '⚠️ Contraste bajo detectado en subtítulos, sugerido color #FFFFFF.',
    timestamp: new Date(Date.now() - 360000)
  },
  {
    id: '4',
    role: 'user',
    content: 'Reduce el volumen de la música',
    timestamp: new Date(Date.now() - 180000)
  },
  {
    id: '5',
    role: 'assistant',
    content: '✅ Música reducida a 60%.',
    timestamp: new Date(Date.now() - 160000)
  }
];

interface EditorStepShortProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

export function EditorStepShort({ onNext, onPrevious }: EditorStepShortProps) {
  const { hasBrandKit, brandKit } = useBrandKit();
  const { 
    currentProject, 
    updateBriefing, 
    goToNextStep, 
    goToPreviousStep 
  } = useVideoProject();

  // BrandKit data
  const brandColors = React.useMemo(() => {
    if (brandKit?.colors) {
      const colors = [];
      if (brandKit.colors.primary) {
        brandKit.colors.primary.forEach((hex, index) => {
          colors.push({ name: `Primario ${index + 1}`, hex });
        });
      }
      if (brandKit.colors.secondary) {
        brandKit.colors.secondary.forEach((hex, index) => {
          colors.push({ name: `Secundario ${index + 1}`, hex });
        });
      }
      if (brandKit.colors.alternatives) {
        brandKit.colors.alternatives.forEach((hex, index) => {
          colors.push({ name: `Alternativo ${index + 1}`, hex });
        });
      }
      return colors.length > 0 ? colors : [
        { name: 'Primario', hex: '#E91E63' },
        { name: 'Secundario', hex: '#9C27B0' },
        { name: 'Texto', hex: '#212121' },
        { name: 'Fondo', hex: '#FFFFFF' }
      ];
    }
    return [
      { name: 'Primario', hex: '#E91E63' },
      { name: 'Secundario', hex: '#9C27B0' },
      { name: 'Texto', hex: '#212121' },
      { name: 'Fondo', hex: '#FFFFFF' }
    ];
  }, [brandKit?.colors]);

  const brandFonts = React.useMemo(() => {
    const fonts = [];
    if (brandKit?.typography?.primary?.name) {
      fonts.push(brandKit.typography.primary.name);
    }
    if (brandKit?.typography?.secondary?.name) {
      fonts.push(brandKit.typography.secondary.name);
    }
    return fonts.length > 0 ? fonts : [
      'Montserrat',
      'Inter', 
      'Roboto',
      'Open Sans'
    ];
  }, [brandKit?.typography]);
  
  // State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Video Tools State
  const [videoDuration, setVideoDuration] = useState([30]);
  const [videoSpeed, setVideoSpeed] = useState([1]);
  const [videoFilter, setVideoFilter] = useState("Ninguno");

  // Audio Tools State
  const [audioVolume, setAudioVolume] = useState([80]);
  const [autoFade, setAutoFade] = useState(true);
  const [musicMood, setMusicMood] = useState("Enérgica");

  // Subtitles Tools State
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [subtitlesLanguage, setSubtitlesLanguage] = useState("ES");
  const [subtitlesFont, setSubtitlesFont] = useState("Montserrat");
  const [subtitlesColor, setSubtitlesColor] = useState("#FFFFFF");
  const [subtitlesSize, setSubtitlesSize] = useState([18]);

  // Overlays Tools State
  const [overlayAnimation, setOverlayAnimation] = useState("Sin animación");
  const [overlayOpacity, setOverlayOpacity] = useState([100]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '✅ Instrucción ejecutada correctamente.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleContinue = () => {
    updateBriefing({
      editingCompleted: true,
      finalDuration: 30
    });

    onNext ? onNext() : goToNextStep();
  };

  const handleGoBack = () => {
    onPrevious ? onPrevious() : goToPreviousStep();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full bg-gradient-to-br from-pink-50 to-purple-50 relative">
      <div className="h-full p-4 gap-4 flex pb-20">
        {/* Left Panel - Chat IA */}
        <Card className="w-[300px] flex flex-col">
          <div className="p-3 border-b">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-pink-600" />
              <h3 className="font-medium">Chat de Edición (IA)</h3>
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="h-[500px] p-3">
            <div className="space-y-3">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-3 border-t space-y-2">
            <Textarea
              placeholder="Escribe una instrucción…"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar
            </Button>
          </div>
        </Card>

        {/* Center Content */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Canvas Preview */}
          <Card className="h-[400px] bg-black border-gray-300">
            <div className="h-full flex items-center justify-center relative">
              {/* Preview Container */}
              <div className="relative">
                <div 
                  className="bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center overflow-hidden"
                  style={{ width: '225px', height: '400px' }} // 9:16 ratio
                >
                  <div className="text-center text-white/70">
                    <Smartphone className="w-12 h-12 mx-auto mb-3" />
                    <div className="text-sm">Preview Video (9:16)</div>
                    <div className="text-xs text-white/50 mt-1">30 segundos</div>
                  </div>
                </div>

                {/* Play Controls Overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-white/20 p-1"
                    onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-white/20 p-2"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-white/20 p-1"
                    onClick={() => setCurrentTime(Math.min(30, currentTime + 5))}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  <div className="text-white text-xs mx-2">
                    {formatTime(currentTime)} / {formatTime(30)}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-white/20 p-1"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-white/20 p-1"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* BrandGuard Overlay */}
              <Card className="absolute bottom-4 right-4 w-64 shadow-lg border border-gray-200">
                <div className="p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-medium">Validaciones BrandGuard</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Logo respeta zona segura</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      <span>Contraste bajo en subtítulos</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Paleta de colores oficial</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      <span>Música demasiado alta (&gt;85 dB)</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                      Autocorregir
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1">
                      <FileText className="w-3 h-3 mr-1" />
                      Ver reporte
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="h-[300px] bg-gray-900 border-gray-700">
            <div className="h-full p-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">Timeline</h4>
                <div className="text-gray-400 text-sm">30s</div>
              </div>

              <div className="space-y-2 h-[240px] overflow-y-auto">
                {TIMELINE_TRACKS.map((track) => (
                  <div key={track.id} className="flex items-center gap-3">
                    {/* Track Label */}
                    <div 
                      className="w-20 text-xs font-medium text-white p-2 rounded text-center"
                      style={{ backgroundColor: track.color }}
                    >
                      {track.label}
                    </div>

                    {/* Track Content */}
                    <div className="flex-1 h-10 bg-gray-800 rounded relative overflow-hidden">
                      {track.clips.map((clip) => (
                        <div
                          key={clip.id}
                          className="absolute h-full rounded text-white text-xs flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: clip.color,
                            left: `${(clip.start / 30) * 100}%`,
                            width: `${(clip.duration / 30) * 100}%`,
                          }}
                        >
                          <span className="truncate px-1">{clip.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline Ruler */}
              <div className="mt-2 flex justify-between text-gray-400 text-xs">
                <span>0s</span>
                <span>15s</span>
                <span>30s</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel - Herramientas */}
        <Card className="w-[240px] flex flex-col">
          <div className="p-3 border-b">
            <h3 className="font-medium">Herramientas</h3>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {/* Video Clip Section */}
              <Card className="p-3 space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-sm">Video Clip</h4>
                </div>
                
                <Button variant="secondary" size="sm" className="w-full">
                  <Upload className="w-3 h-3 mr-2" />
                  Reemplazar clip
                </Button>

                <div className="space-y-2">
                  <Label className="text-xs">Duración (trim)</Label>
                  <Slider 
                    value={videoDuration}
                    onValueChange={setVideoDuration}
                    max={90}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">{videoDuration[0]}s</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Velocidad</Label>
                  <Slider 
                    value={videoSpeed}
                    onValueChange={setVideoSpeed}
                    max={2}
                    min={0.25}
                    step={0.25}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">{videoSpeed[0]}x</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Filtro</Label>
                  <Select value={videoFilter} onValueChange={setVideoFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ninguno">Ninguno</SelectItem>
                      <SelectItem value="Cinemático">Cinemático</SelectItem>
                      <SelectItem value="Retro">Retro</SelectItem>
                      <SelectItem value="Blanco y Negro">Blanco y Negro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {/* Audio Section */}
              <Card className="p-3 space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-pink-600" />
                  <h4 className="font-medium text-sm">Audio</h4>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Volumen</Label>
                  <Slider 
                    value={audioVolume}
                    onValueChange={setAudioVolume}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">{audioVolume[0]}%</div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Fade in/out automático</Label>
                  <Switch 
                    checked={autoFade}
                    onCheckedChange={setAutoFade}
                    className="scale-75"
                  />
                </div>

                <Button variant="secondary" size="sm" className="w-full">
                  <Music className="w-3 h-3 mr-2" />
                  Reemplazar música
                </Button>

                <div className="space-y-2">
                  <Label className="text-xs">Música (mood)</Label>
                  <Select value={musicMood} onValueChange={setMusicMood}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Enérgica">Enérgica</SelectItem>
                      <SelectItem value="Corporativa">Corporativa</SelectItem>
                      <SelectItem value="Urbana">Urbana</SelectItem>
                      <SelectItem value="Electrónica">Electrónica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {/* Subtítulos Section */}
              <Card className="p-3 space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-green-600" />
                  <h4 className="font-medium text-sm">Subtítulos</h4>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Activar subtítulos automáticos</Label>
                  <Switch 
                    checked={subtitlesEnabled}
                    onCheckedChange={setSubtitlesEnabled}
                    className="scale-75"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Idioma</Label>
                  <Select value={subtitlesLanguage} onValueChange={setSubtitlesLanguage}>
                    <SelectTrigger className="h-8 text-xs">
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
                  <Label className="text-xs">Fuente (BrandKit)</Label>
                  <Select value={subtitlesFont} onValueChange={setSubtitlesFont}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {brandFonts.map((font) => (
                        <SelectItem key={font} value={font}>{font}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Color texto</Label>
                  <div className="flex gap-1 flex-wrap">
                    {brandColors.map((color) => (
                      <button
                        key={color.hex}
                        className={`w-6 h-6 rounded-full border-2 ${
                          subtitlesColor === color.hex ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        onClick={() => setSubtitlesColor(color.hex)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Tamaño</Label>
                  <Slider 
                    value={subtitlesSize}
                    onValueChange={setSubtitlesSize}
                    max={48}
                    min={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">{subtitlesSize[0]}px</div>
                </div>
              </Card>

              {/* Overlays Section */}
              <Card className="p-3 space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-purple-600" />
                  <h4 className="font-medium text-sm">Overlays</h4>
                </div>

                <Button variant="secondary" size="sm" className="w-full">
                  <Plus className="w-3 h-3 mr-2" />
                  Agregar texto overlay
                </Button>

                <Button variant="secondary" size="sm" className="w-full">
                  <Palette className="w-3 h-3 mr-2" />
                  Insertar logo (BrandKit)
                </Button>

                <div className="space-y-2">
                  <Label className="text-xs">Animación</Label>
                  <Select value={overlayAnimation} onValueChange={setOverlayAnimation}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sin animación">Sin animación</SelectItem>
                      <SelectItem value="Desvanecer">Desvanecer</SelectItem>
                      <SelectItem value="Deslizar">Deslizar</SelectItem>
                      <SelectItem value="Zoom">Zoom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Opacidad</Label>
                  <Slider 
                    value={overlayOpacity}
                    onValueChange={setOverlayOpacity}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">{overlayOpacity[0]}%</div>
                </div>
              </Card>

              {/* Platform Previews Section */}
              <Card className="p-3 space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-medium text-sm">Vista previa en plataformas</h4>
                </div>

                {/* TikTok Preview */}
                <div className="space-y-2">
                  <Label className="text-xs">TikTok</Label>
                  <div 
                    className="border border-gray-300 rounded-lg p-2 flex items-center justify-center shadow-sm"
                    style={{ 
                      width: '140px', 
                      height: '260px',
                      backgroundImage: `linear-gradient(135deg, ${brandColors[0]?.hex || '#E91E63'}, ${brandColors[1]?.hex || '#9C27B0'})`
                    }}
                  >
                    <div className="text-center text-white text-xs">
                      <div className="mb-1">📱</div>
                      <div>TikTok</div>
                      <div className="text-xs opacity-75">9:16</div>
                    </div>
                  </div>
                </div>

                {/* Instagram Reels Preview */}
                <div className="space-y-2">
                  <Label className="text-xs">Instagram Reels</Label>
                  <div 
                    className="border border-gray-300 rounded-lg p-2 flex items-center justify-center shadow-sm"
                    style={{ 
                      width: '140px', 
                      height: '260px',
                      backgroundImage: `linear-gradient(135deg, ${brandColors[1]?.hex || '#9C27B0'}, ${brandColors[2]?.hex || '#212121'})`
                    }}
                  >
                    <div className="text-center text-white text-xs">
                      <div className="mb-1">📸</div>
                      <div>Instagram</div>
                      <div className="text-xs opacity-75">Reels</div>
                    </div>
                  </div>
                </div>

                {/* YouTube Shorts Preview */}
                <div className="space-y-2">
                  <Label className="text-xs">YouTube Shorts</Label>
                  <div 
                    className="border border-gray-300 rounded-lg p-2 flex items-center justify-center shadow-sm"
                    style={{ 
                      width: '100%', 
                      height: '135px',
                      backgroundImage: `linear-gradient(135deg, ${brandColors[2]?.hex || '#212121'}, ${brandColors[0]?.hex || '#E91E63'})`
                    }}
                  >
                    <div className="text-center text-white text-xs">
                      <div className="mb-1">🎥</div>
                      <div>YouTube Shorts</div>
                      <div className="text-xs opacity-75">16:9</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>

          {/* Settings */}
          <div className="p-3 border-t">
            <Button variant="outline" className="w-full" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              Paso 4 de 5
            </Badge>
            <span className="text-sm text-muted-foreground">
              Editor de Video
            </span>
          </div>

          <Button 
            onClick={handleContinue}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center gap-2"
          >
            Siguiente: Copy & Tags
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}