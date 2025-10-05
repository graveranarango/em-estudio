import { useState, useEffect } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Textarea } from "../../ui/textarea";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Slider } from "../../ui/slider";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Separator } from "../../ui/separator";
import { ScrollArea } from "../../ui/scroll-area";
import { BrandKitAlert } from "../../common/BrandKitAlert";
import { useBrandKit } from "../../../contexts/BrandKitContext";
import { useVideoProject } from "../../../contexts/VideoProjectContext";
import { 
  Smartphone, 
  MessageSquare,
  Sparkles,
  Target,
  Clock,
  Palette,
  ArrowRight,
  Lock,
  Upload,
  CheckCircle,
  Circle,
  Music,
  Mic,
  Globe,
  Send,
  Zap,
  Eye,
  Lightbulb,
  Volume2
} from "lucide-react";

// Comandos del Chat Maestro
const CHAT_COMMANDS = [
  { command: '/brief', hint: 'Estructura objetivo→audiencia→mensaje→CTA' },
  { command: '/hook', hint: 'Generar 3 ganchos (3s)' },
  { command: '/style', hint: 'Definir estilo visual' },
  { command: '/music', hint: 'Mood musical' },
  { command: '/subs', hint: 'Subtítulos & idioma' }
];

// Mensajes de ejemplo del chat
const SAMPLE_MESSAGES = [
  {
    role: 'user' as const,
    content: 'Quiero un Reel vertical sobre nuestra nueva promo de envío a Cuba, tono enérgico.'
  },
  {
    role: 'assistant' as const,
    content: 'Entendido. @objetivo: presentar promo; @audiencia: clientes en Miami; @duracion: 30s; @plataforma: Reels; @hook: "Ahorra hoy, envía ya"; @cta: "Reserva en línea".'
  }
];

// Opciones predefinidas
const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', maxDuration: 90 },
  { value: 'facebook', label: 'Facebook', maxDuration: 90 },
  { value: 'tiktok', label: 'TikTok', maxDuration: 60 },
  { value: 'youtube', label: 'YouTube Shorts', maxDuration: 60 }
];

const MUSIC_MOODS = [
  'Enérgica', 'Cálida', 'Corporativa', 'Urbana', 'Electrónica'
];

const SUBTITLE_LANGUAGES = [
  { value: 'es', label: 'ES', selected: true },
  { value: 'en', label: 'EN', selected: false },
  { value: 'multi', label: 'Multi', selected: false }
];

// Checklist items
const CHECKLIST_ITEMS = [
  'Objetivo definido (AI)',
  'Audiencia definida (AI)', 
  'Hook (0–3s) definido (AI)',
  'CTA definido (AI)',
  'Duración y plataforma elegidas',
  'Branding bloqueado por BrandKit',
  'Audio/subtítulos definidos'
];

interface BriefingStepShortProps {
  onNext?: () => void;
}

export function BriefingStepShort({ onNext }: BriefingStepShortProps) {
  const { hasBrandKit } = useBrandKit();
  const { currentProject, updateBriefing, goToNextStep } = useVideoProject();
  
  // Form state
  const [videoType, setVideoType] = useState('Reel');
  const [projectName, setProjectName] = useState('Promo Envíos Cuba – Octubre');
  const [projectDescription, setProjectDescription] = useState('');
  const [platforms, setPlatforms] = useState(['instagram']);
  const [duration, setDuration] = useState([30]);
  const [objective, setObjective] = useState('');
  const [audience, setAudience] = useState('');
  const [hook, setHook] = useState('');
  const [cta, setCta] = useState('');
  const [musicMood, setMusicMood] = useState('Enérgica');
  const [voiceOver, setVoiceOver] = useState(false);
  const [subtitleLangs, setSubtitleLangs] = useState(['es']);
  const [styleNotes, setStyleNotes] = useState('');
  
  // AI completion states
  const [completedFields, setCompletedFields] = useState({
    objective: false,
    audience: false,
    hook: false,
    cta: false,
    duration: false,
    music: false,
    captions: false
  });

  // Chat state
  const [chatInput, setChatInput] = useState('');

  // Load existing data if available
  useEffect(() => {
    if (currentProject?.briefing) {
      const briefing = currentProject.briefing;
      if (briefing.description) setProjectDescription(briefing.description);
      if (briefing.duration?.target) setDuration([briefing.duration.target]);
    }
  }, [currentProject]);

  const selectedPlatforms = PLATFORMS.filter(p => platforms.includes(p.value));
  const maxDuration = Math.min(...selectedPlatforms.map(p => p.maxDuration));

  const handlePlatformToggle = (platformValue: string) => {
    setPlatforms(prev => 
      prev.includes(platformValue)
        ? prev.filter(p => p !== platformValue)
        : [...prev, platformValue]
    );
  };

  const handleSubtitleToggle = (langValue: string) => {
    setSubtitleLangs(prev => 
      prev.includes(langValue)
        ? prev.filter(l => l !== langValue)
        : [...prev, langValue]
    );
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    // Simulate AI completion of fields based on chat input
    // This is just UI simulation
    setChatInput('');
  };

  const canContinue = projectName && platforms.length > 0 && duration[0];

  const handleContinue = () => {
    if (!canContinue) return;

    updateBriefing({
      videoType: 'short',
      description: projectDescription,
      duration: {
        target: duration[0],
        min: Math.max(10, duration[0] - 10),
        max: Math.min(maxDuration, duration[0] + 15),
        label: `${duration[0]}s`
      },
      platform: platforms[0] as any,
      style: 'trendy' as any,
      objectives: [objective || 'viral'],
      flowRequired: false
    });

    onNext ? onNext() : goToNextStep();
  };

  const completedCount = Object.values(completedFields).filter(Boolean).length;

  return (
    <div className="h-full bg-canvas">
      <div className="h-full flex gap-4 p-4">
        {/* Chat Maestro - Left Panel */}
        <div className="w-[520px] flex flex-col bg-white rounded-lg shadow-sm">
          <div className="p-3 border-b">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-pink-600" />
              <h3 className="text-sm font-medium">Chat Maestro (Briefing de Short / Reel)</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              El chat entiende y rellena el formulario usando etiquetas como: @objetivo, @audiencia, @hook, @cta, @duracion, @musica, @capciones, @colores, @logo, @referencias.
            </p>
            
            {/* Command Chips */}
            <div className="flex flex-wrap gap-1">
              {CHAT_COMMANDS.map((cmd) => (
                <Button
                  key={cmd.command}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs border-dashed"
                  onClick={() => setChatInput(cmd.command + ' ')}
                >
                  {cmd.command}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {SAMPLE_MESSAGES.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-2 rounded-lg text-sm ${
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
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Describe tu Short/Reel..."
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estado: {completedCount} campos autocompletados · {7 - completedCount} pendientes
            </p>
          </div>
        </div>

        {/* Form - Right Panel */}
        <div className="flex-1 overflow-auto">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium">Nuevo Short / Reel</h2>
              <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={videoType === 'Short' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setVideoType('Short')}
                    className="h-7 px-3 text-xs"
                  >
                    Short
                  </Button>
                  <Button
                    variant={videoType === 'Reel' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setVideoType('Reel')}
                    className="h-7 px-3 text-xs"
                  >
                    Reel
                  </Button>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Paso 1 de 5
                </Badge>
              </div>
            </div>

            {/* Proyecto */}
            <Card className="p-3">
              <h3 className="font-medium mb-3">Proyecto</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="project-name" className="text-xs">Nombre del proyecto</Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Promo Envíos Cuba – Octubre"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="project-desc" className="text-xs">Descripción breve</Label>
                  <Textarea
                    id="project-desc"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Contexto, propósito, links internos"
                    rows={2}
                    className="mt-1 resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Plataforma & Formato */}
            <Card className="p-3">
              <h3 className="font-medium mb-3">Plataforma & Formato</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Plataforma</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {PLATFORMS.map((platform) => (
                      <Button
                        key={platform.value}
                        variant={platforms.includes(platform.value) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePlatformToggle(platform.value)}
                        className="h-7 px-3 text-xs"
                      >
                        {platform.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Relación de aspecto</Label>
                  <div className="flex items-center gap-2 mt-1 p-2 bg-gray-50 rounded text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    9:16 (vertical)
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Duración (seg.)</Label>
                    {completedFields.duration && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        AI
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>{duration[0]}s</span>
                      <span className="text-muted-foreground">Max: {maxDuration}s</span>
                    </div>
                    <Slider
                      value={duration}
                      onValueChange={setDuration}
                      min={5}
                      max={maxDuration}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Shorts: 15–60s · Reels: 30–90s
                  </p>
                </div>
              </div>
            </Card>

            {/* Estrategia de contenido */}
            <Card className="p-3">
              <h3 className="font-medium mb-3">Estrategia de contenido</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="objective" className="text-xs">Objetivo</Label>
                    {completedFields.objective && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        AI
                      </Badge>
                    )}
                  </div>
                  <Textarea
                    id="objective"
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Conversión, awareness, tráfico…"
                    rows={2}
                    className={`mt-1 resize-none ${completedFields.objective ? 'bg-blue-50 border-blue-200' : ''}`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="audience" className="text-xs">Audiencia</Label>
                    {completedFields.audience && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        AI
                      </Badge>
                    )}
                  </div>
                  <Textarea
                    id="audience"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="Ej: Clientes en Miami, 20–45, remesas/envíos"
                    rows={2}
                    className={`mt-1 resize-none ${completedFields.audience ? 'bg-blue-50 border-blue-200' : ''}`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hook" className="text-xs">Hook (0–3s)</Label>
                    {completedFields.hook && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        AI
                      </Badge>
                    )}
                  </div>
                  <Input
                    id="hook"
                    value={hook}
                    onChange={(e) => setHook(e.target.value)}
                    placeholder="El gancho inicial"
                    className={`mt-1 ${completedFields.hook ? 'bg-blue-50 border-blue-200' : ''}`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cta" className="text-xs">CTA</Label>
                    {completedFields.cta && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        AI
                      </Badge>
                    )}
                  </div>
                  <Input
                    id="cta"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    placeholder="Qué deben hacer (Reserva en línea, Llama hoy…)"
                    className={`mt-1 ${completedFields.cta ? 'bg-blue-50 border-blue-200' : ''}`}
                  />
                </div>
              </div>
            </Card>

            {/* Branding */}
            <Card className="p-3">
              <h3 className="font-medium mb-3">Branding (desde BrandKit)</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Paleta</Label>
                  <div className="flex items-center gap-2 mt-1 p-2 bg-gray-50 rounded text-xs">
                    <Lock className="w-3 h-3 text-primary" />
                    <span>Primaria</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Tipografía</Label>
                  <div className="flex items-center gap-2 mt-1 p-2 bg-gray-50 rounded text-xs">
                    <Lock className="w-3 h-3 text-primary" />
                    <span>Titulares</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Logo</Label>
                  <Select defaultValue="principal">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="principal">Principal</SelectItem>
                      <SelectItem value="negativo">Negativo</SelectItem>
                      <SelectItem value="alternativo">Alternativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Las opciones siguen el BrandKit. No se permiten colores/tipos fuera de norma.
                </p>
              </div>
            </Card>

            {/* Audio & Subtítulos */}
            <Card className="p-3">
              <h3 className="font-medium mb-3">Audio & Subtítulos</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Música (mood)</Label>
                    {completedFields.music && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        AI
                      </Badge>
                    )}
                  </div>
                  <Select value={musicMood} onValueChange={setMusicMood}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MUSIC_MOODS.map((mood) => (
                        <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="voice-over" className="text-xs">Voz en off</Label>
                  <Switch
                    id="voice-over"
                    checked={voiceOver}
                    onCheckedChange={setVoiceOver}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Subtítulos</Label>
                    {completedFields.captions && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        AI
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {SUBTITLE_LANGUAGES.map((lang) => (
                      <Button
                        key={lang.value}
                        variant={subtitleLangs.includes(lang.value) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSubtitleToggle(lang.value)}
                        className="h-7 px-3 text-xs"
                      >
                        {lang.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Referencias */}
            <Card className="p-3">
              <h3 className="font-medium mb-3">Referencias</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Subir imágenes/videos de referencia (opcional)</Label>
                  <div className="mt-1 border-2 border-dashed border-gray-200 rounded-lg p-3 text-center">
                    <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-muted-foreground">
                      Arrastra archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      .png, .jpg, .mp4, .pdf
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="style-notes" className="text-xs">Notas de estilo / restricciones</Label>
                  <Textarea
                    id="style-notes"
                    value={styleNotes}
                    onChange={(e) => setStyleNotes(e.target.value)}
                    placeholder="Evitar claims sensibles, respetar zonas seguras del logo…"
                    rows={2}
                    className="mt-1 resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Checklist */}
            <Card className="p-3">
              <h3 className="font-medium mb-3">Checklist de completitud</h3>
              <div className="space-y-2">
                {CHECKLIST_ITEMS.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {Math.random() > 0.6 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300" />
                    )}
                    <span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Footer */}
            <div className="flex justify-end bg-white p-3 rounded-lg shadow-sm">
              <Button 
                onClick={handleContinue}
                disabled={!canContinue}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
              >
                Siguiente: Configuración
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}