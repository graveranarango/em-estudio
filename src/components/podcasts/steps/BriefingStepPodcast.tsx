import { useState, useRef } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { ScrollArea } from "../../ui/scroll-area";
import { useBrandKit, useBrandVoice } from "../../../contexts/BrandKitContext";
import { usePodcastProject } from "../../../contexts/PodcastProjectContext";
import { PodcastChatMessage, PodcastContentType, PodcastDuration, PodcastStyle, PodcastSegment, PODCAST_CONTENT_CONFIGS } from "../../../types/podcasts";
import { 
  Mic, 
  Send, 
  Bot, 
  User, 
  Clock,
  Target,
  Lightbulb,
  MessageSquare
} from "lucide-react";

const CONTENT_TYPE_OPTIONS = [
  { value: 'podcast_interview', label: 'Podcast Entrevista', description: 'Conversación con invitados', icon: MessageSquare }
];

const STYLE_OPTIONS = [
  { value: 'conversational', label: 'Conversacional', description: 'Natural y cercano' },
  { value: 'professional', label: 'Profesional', description: 'Formal y corporativo' },
  { value: 'storytelling', label: 'Narrativo', description: 'Basado en historias' }
];

export function BriefingStepPodcast() {
  const { hasBrandKit, getBrandInstructions } = useBrandKit();
  const { voiceTone, instructions: voiceInstructions, hasVoiceTone } = useBrandVoice();
  const { currentProject, updateBriefing, goToNextStep } = usePodcastProject();
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [description, setDescription] = useState(currentProject?.briefing.description || '');
  const [selectedContentType, setSelectedContentType] = useState<PodcastContentType>(currentProject?.briefing.contentType || 'podcast_interview');
  const [selectedDuration, setSelectedDuration] = useState<PodcastDuration>(currentProject?.briefing.targetDuration || { minutes: 30, label: '30 min', segments: 5 });
  const [selectedStyle, setSelectedStyle] = useState<PodcastStyle>(currentProject?.briefing.contentStyle || 'professional');
  const [targetAudience, setTargetAudience] = useState(currentProject?.briefing.targetAudience || '');
  const [objectives, setObjectives] = useState<string[]>(currentProject?.briefing.objectives || []);
  const [keyMessages, setKeyMessages] = useState<string[]>(currentProject?.briefing.keyMessages || []);
  const [newObjective, setNewObjective] = useState('');
  const [newKeyMessage, setNewKeyMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatHistory = currentProject?.briefing.chatHistory || [];
  const contentConfig = PODCAST_CONTENT_CONFIGS[selectedContentType];

  const sendMessage = async () => {
    if (!currentMessage.trim() || isThinking) return;

    const userMessage: PodcastChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    const updatedHistory = [...chatHistory, userMessage];
    
    updateBriefing({
      chatHistory: updatedHistory
    });

    setCurrentMessage('');
    setIsThinking(true);

    // Simular respuesta del asistente
    setTimeout(async () => {
      let response = `¡Perfecto! Entiendo que quieres crear ${selectedContentType.includes('podcast') ? 'un podcast' : 'contenido educativo'} sobre "${currentMessage}".`;
      
      if (hasBrandKit && hasVoiceTone) {
        response += ` Voy a aplicar automáticamente el tono de voz de tu marca (${voiceTone}) para mantener coherencia.`;
      }

      // Sugerencias específicas por tipo de contenido
      if (selectedContentType === 'podcast_interview') {
        response += ` Para entrevistas efectivas, te sugiero preparar preguntas abiertas, investigar al invitado y crear un ambiente cómodo.`;
      } else if (selectedContentType === 'educational_tutorial') {
        response += ` Para tutoriales, es clave dividir el contenido en pasos claros, usar ejemplos prácticos y ofrecer recursos adicionales.`;
      } else if (selectedContentType === 'podcast_solo') {
        response += ` Para podcasts en solitario, mantén un ritmo dinámico, usa historias personales y conecta emocionalmente con la audiencia.`;
      } else if (selectedContentType.includes('educational')) {
        response += ` Para contenido educativo, estructura el aprendizaje progresivamente, incluye evaluaciones y ofrece aplicaciones prácticas.`;
      }

      // Generar outline automático
      const outline = generateContentOutline(selectedContentType, selectedDuration, currentMessage);
      response += ` He generado un outline con ${outline.segments.length} segmentos que puedes revisar y ajustar.`;

      const assistantMessage: PodcastChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        suggestions: [
          'Generar preguntas clave para el contenido',
          'Sugerir estructura alternativa',
          'Crear lista de recursos adicionales',
          'Optimizar para SEO y discoverability'
        ]
      };

      updateBriefing({
        chatHistory: [...updatedHistory, assistantMessage],
        outline
      });

      setIsThinking(false);
    }, 2000);
  };

  const generateContentOutline = (contentType: PodcastContentType, duration: PodcastDuration, topic: string) => {
    const segments: PodcastSegment[] = [];
    const segmentDuration = duration.minutes / duration.segments;
    
    // Generar segmentos según el tipo de contenido
    switch (contentType) {
      case 'podcast_interview':
        segments.push(
          { id: 'intro', title: 'Introducción', description: 'Bienvenida y presentación del tema', estimatedDuration: segmentDuration, keyPoints: ['Saludo', 'Tema del día', 'Presentación del invitado'], order: 1, type: 'intro' },
          { id: 'guest_intro', title: 'Presentación del Invitado', description: 'Background y experiencia', estimatedDuration: segmentDuration, keyPoints: ['Trayectoria', 'Logros', 'Expertise'], order: 2, type: 'main_content' },
          { id: 'main_discussion', title: 'Conversación Principal', description: `Discusión sobre ${topic}`, estimatedDuration: segmentDuration * 3, keyPoints: ['Experiencias', 'Insights', 'Casos prácticos'], order: 3, type: 'discussion' },
          { id: 'qa', title: 'Preguntas Rápidas', description: 'Q&A dinámico', estimatedDuration: segmentDuration, keyPoints: ['Preguntas personales', 'Consejos', 'Recursos'], order: 4, type: 'qa' },
          { id: 'conclusion', title: 'Cierre', description: 'Resumen y despedida', estimatedDuration: segmentDuration, keyPoints: ['Takeaways', 'Contacto del invitado', 'Próximo episodio'], order: 5, type: 'conclusion' }
        );
        break;
      
      case 'podcast_solo':
        segments.push(
          { id: 'intro', title: 'Introducción', description: 'Hook y contexto', estimatedDuration: segmentDuration, keyPoints: ['Hook inicial', 'Tema del episodio', 'Por qué es importante'], order: 1, type: 'intro' },
          { id: 'context', title: 'Contexto', description: 'Background del tema', estimatedDuration: segmentDuration, keyPoints: ['Situación actual', 'Problema a resolver', 'Mi experiencia'], order: 2, type: 'main_content' },
          { id: 'deep_dive', title: 'Desarrollo', description: `Análisis profundo de ${topic}`, estimatedDuration: segmentDuration * 2, keyPoints: ['Puntos clave', 'Ejemplos', 'Estrategias'], order: 3, type: 'main_content' },
          { id: 'actionable', title: 'Accionable', description: 'Pasos concretos', estimatedDuration: segmentDuration, keyPoints: ['Qué hacer', 'Cómo empezar', 'Recursos'], order: 4, type: 'main_content' },
          { id: 'conclusion', title: 'Conclusión', description: 'Resumen y call to action', estimatedDuration: segmentDuration, keyPoints: ['Recap', 'Acción siguiente', 'Feedback'], order: 5, type: 'conclusion' }
        );
        break;
      
      case 'educational_tutorial':
        segments.push(
          { id: 'intro', title: 'Introducción', description: 'Objetivos de aprendizaje', estimatedDuration: segmentDuration, keyPoints: ['Qué aprenderás', 'Prerrequisitos', 'Duración estimada'], order: 1, type: 'intro' },
          { id: 'overview', title: 'Visión General', description: 'Conceptos básicos', estimatedDuration: segmentDuration, keyPoints: ['Fundamentos', 'Terminología', 'Herramientas necesarias'], order: 2, type: 'main_content' },
          { id: 'step_by_step', title: 'Tutorial Paso a Paso', description: `Implementación de ${topic}`, estimatedDuration: segmentDuration * 3, keyPoints: ['Paso 1', 'Paso 2', 'Paso 3', 'Solución de problemas'], order: 3, type: 'main_content' },
          { id: 'practice', title: 'Práctica', description: 'Ejercicios y ejemplos', estimatedDuration: segmentDuration, keyPoints: ['Ejercicio práctico', 'Variaciones', 'Errores comunes'], order: 4, type: 'main_content' },
          { id: 'conclusion', title: 'Conclusión', description: 'Resumen y próximos pasos', estimatedDuration: segmentDuration, keyPoints: ['Repaso', 'Recursos adicionales', 'Siguiente nivel'], order: 5, type: 'conclusion' }
        );
        break;
      
      default:
        // Estructura genérica
        for (let i = 1; i <= duration.segments; i++) {
          segments.push({
            id: `segment_${i}`,
            title: `Segmento ${i}`,
            description: `Parte ${i} del contenido sobre ${topic}`,
            estimatedDuration: segmentDuration,
            keyPoints: [`Punto clave ${i}`, `Desarrollo ${i}`, `Ejemplo ${i}`],
            order: i,
            type: i === 1 ? 'intro' : i === duration.segments ? 'conclusion' : 'main_content'
          });
        }
    }

    return {
      segments,
      totalEstimatedDuration: duration.minutes,
      introduction: `Bienvenidos a este ${contentType.includes('podcast') ? 'episodio' : 'contenido educativo'} sobre ${topic}`,
      conclusion: `Gracias por acompañarnos en este ${contentType.includes('podcast') ? 'episodio' : 'tutorial'}. Esperamos que el contenido te haya sido útil.`,
      transitionPhrases: [
        'Pasemos ahora a...',
        'Continuando con...',
        'Un punto importante es...',
        'Como mencioné anteriormente...',
        'Para concluir esta sección...'
      ]
    };
  };

  const handleContentTypeChange = (contentType: PodcastContentType) => {
    setSelectedContentType(contentType);
    const config = PODCAST_CONTENT_CONFIGS[contentType];
    setSelectedDuration(config.durations[1] || config.durations[0]); // Preferir duración media
    setSelectedStyle(config.styles[0]);
  };

  const addObjective = () => {
    if (newObjective.trim() && !objectives.includes(newObjective.trim())) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const addKeyMessage = () => {
    if (newKeyMessage.trim() && !keyMessages.includes(newKeyMessage.trim())) {
      setKeyMessages([...keyMessages, newKeyMessage.trim()]);
      setNewKeyMessage('');
    }
  };

  const removeObjective = (objective: string) => {
    setObjectives(objectives.filter(o => o !== objective));
  };

  const removeKeyMessage = (message: string) => {
    setKeyMessages(keyMessages.filter(m => m !== message));
  };

  const handleContinue = () => {
    updateBriefing({
      description,
      contentType: selectedContentType,
      targetDuration: selectedDuration,
      contentStyle: selectedStyle,
      targetAudience,
      objectives,
      keyMessages
    });
    goToNextStep();
  };

  const canContinue = description.trim() && selectedContentType && selectedDuration && targetAudience.trim();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-white">
            <Mic className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Briefing de Contenido</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Define tu podcast o contenido educativo. El asistente te ayudará a estructurar el contenido con tu BrandKit aplicado automáticamente.
        </p>
      </div>

      {/* Brand Voice Status */}
      {hasBrandKit && hasVoiceTone && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <h3 className="font-medium">Tono de voz activo: {voiceTone}</h3>
              <p className="text-sm text-green-700">{voiceInstructions}</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Aplicando automáticamente</Badge>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chat Area */}
        <Card className="xl:col-span-2 p-6">
          <div className="flex flex-col h-[600px]">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Asistente de Contenido</h3>
                <p className="text-sm text-muted-foreground">
                  Especializado en {selectedContentType.replace('_', ' ')} • {selectedDuration.minutes} min
                </p>
              </div>
              {hasBrandKit && (
                <Badge className="bg-green-100 text-green-800 ml-auto">
                  ✓ BrandKit
                </Badge>
              )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {/* Welcome message */}
                {chatHistory.length === 0 && (
                  <div className="flex justify-start">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 max-w-[80%]">
                        <p className="text-sm">
                          ¡Hola! Soy tu asistente para crear contenido de audio/video. Cuéntame sobre el contenido que quieres crear:
                        </p>
                        <ul className="text-xs text-gray-600 mt-2 space-y-1">
                          <li>• ¿De qué tema quieres hablar?</li>
                          <li>• ¿Cuál es tu objetivo principal?</li>
                          <li>• ¿Qué valor quieres aportar a tu audiencia?</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat History */}
                {chatHistory.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs opacity-70">Sugerencias:</p>
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6 px-2 bg-white/20 hover:bg-white/30"
                                onClick={() => setCurrentMessage(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Thinking indicator */}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-purple-600" />
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
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Describe tu idea de contenido o haz preguntas..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!currentMessage.trim() || isThinking}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Configuration Sidebar */}
        <Card className="p-6">
          <div className="space-y-6">
            <h3 className="font-semibold">Configuración de Contenido</h3>

            {/* Content Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Contenido</label>
              <Select value={selectedContentType} onValueChange={handleContentTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPE_OPTIONS.map(type => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{type.label}</p>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duración Objetivo
              </label>
              <Select 
                value={contentConfig.durations.findIndex(d => d.minutes === selectedDuration.minutes).toString()} 
                onValueChange={(value) => setSelectedDuration(contentConfig.durations[parseInt(value)])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentConfig.durations.map((duration, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{duration.label}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{duration.segments} segmentos</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Potencial de clips: {contentConfig.clipPotential} • {contentConfig.platforms.length} plataformas
              </p>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Estilo de Presentación
              </label>
              <Select value={selectedStyle} onValueChange={(value: PodcastStyle) => setSelectedStyle(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_OPTIONS.map(style => (
                    <SelectItem key={style.value} value={style.value}>
                      <div>
                        <p className="font-medium">{style.label}</p>
                        <p className="text-xs text-muted-foreground">{style.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción del Contenido</label>
              <Textarea
                placeholder="Describe el tema principal y enfoque..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Audiencia Objetivo</label>
              <Input
                placeholder="ej: Emprendedores 25-40, profesionales tech..."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            {/* Objectives */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Objetivos ({objectives.length})</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nuevo objetivo..."
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                />
                <Button onClick={addObjective} size="sm">
                  +
                </Button>
              </div>
              {objectives.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {objectives.map(objective => (
                    <Badge 
                      key={objective} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeObjective(objective)}
                    >
                      {objective} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Key Messages */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Mensajes Clave ({keyMessages.length})</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Mensaje clave..."
                  value={newKeyMessage}
                  onChange={(e) => setNewKeyMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyMessage()}
                />
                <Button onClick={addKeyMessage} size="sm">
                  +
                </Button>
              </div>
              {keyMessages.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {keyMessages.map(message => (
                    <Badge 
                      key={message} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeKeyMessage(message)}
                    >
                      {message} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Content Preview Info */}
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Preview del contenido</span>
              </div>
              <div className="text-xs text-purple-700 space-y-1">
                <p>• Tipo: {selectedContentType.replace('_', ' ')}</p>
                <p>• Duración: {selectedDuration.minutes} min</p>
                <p>• Estilo: {selectedStyle}</p>
                <p>• Segmentos: {selectedDuration.segments}</p>
                <p>• Plataformas: {contentConfig.platforms.length}</p>
              </div>
            </div>

            {/* Continue Button */}
            <Button 
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              Comenzar Grabación →
            </Button>

            {!canContinue && (
              <p className="text-xs text-muted-foreground text-center">
                Completa la descripción, audiencia y configuración
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Generated Outline Preview */}
      {currentProject?.briefing.outline && currentProject.briefing.outline.segments.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Outline Generado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentProject.briefing.outline.segments.map((segment, index) => (
              <Card key={segment.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(segment.estimatedDuration)} min
                    </Badge>
                    <Badge className={`text-xs ${
                      segment.type === 'intro' ? 'bg-green-100 text-green-800' :
                      segment.type === 'conclusion' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {segment.type}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm">{segment.title}</h4>
                  <p className="text-xs text-muted-foreground">{segment.description}</p>
                  <div className="space-y-1">
                    {segment.keyPoints.map((point, pointIndex) => (
                      <div key={pointIndex} className="flex items-center gap-1 text-xs">
                        <span className="w-1 h-1 bg-current rounded-full"></span>
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}