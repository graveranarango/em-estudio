import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  ArrowLeft, 
  ArrowRight,
  Mic,
  Target,
  Clock,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  Users,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface MonologueField {
  id: string;
  label: string;
  value: string;
  isCompleted: boolean;
  suggestions: string[];
}

export function PodcastMonologueBriefing() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      content: '¡Hola! Soy tu asistente especializado en podcasts de monólogo y opinión. Te ayudaré a crear un episodio donde puedas expresar tu punto de vista único y conectar profundamente con tu audiencia.',
      timestamp: new Date(Date.now() - 180000)
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Para comenzar, me encantaría conocer más sobre el tema que quieres abordar. ¿Hay algún tema específico sobre el que te sientes especialmente apasionado o sobre el cual tienes una perspectiva única que compartir?',
      timestamp: new Date(Date.now() - 120000),
      suggestions: [
        'Tendencias en mi industria',
        'Una experiencia personal transformadora',
        'Mi análisis sobre un tema actual',
        'Lecciones aprendidas en mi carrera'
      ]
    }
  ]);

  const [currentMessage, setCurrentMessage] = useState('');
  const [monologueFields, setMonologueFields] = useState<MonologueField[]>([
    {
      id: 'topic',
      label: 'Tema principal',
      value: '',
      isCompleted: false,
      suggestions: ['Innovación tecnológica', 'Liderazgo empresarial', 'Transformación digital']
    },
    {
      id: 'perspective',
      label: 'Tu perspectiva única',
      value: '',
      isCompleted: false,
      suggestions: ['Basada en experiencia personal', 'Análisis de datos exclusivos', 'Visión contraria al consenso']
    },
    {
      id: 'audience',
      label: 'Audiencia objetivo',
      value: '',
      isCompleted: false,
      suggestions: ['Emprendedores', 'Profesionales senior', 'Estudiantes universitarios']
    },
    {
      id: 'tone',
      label: 'Tono del episodio',
      value: '',
      isCompleted: false,
      suggestions: ['Inspiracional y motivador', 'Analítico y reflexivo', 'Provocador y desafiante']
    },
    {
      id: 'duration',
      label: 'Duración objetivo',
      value: '',
      isCompleted: false,
      suggestions: ['10-15 minutos (formato corto)', '20-25 minutos (formato medio)', '30-35 minutos (formato largo)']
    },
    {
      id: 'cta',
      label: 'Call-to-action principal',
      value: '',
      isCompleted: false,
      suggestions: ['Visitar mi sitio web', 'Seguir en redes sociales', 'Descargar recurso gratuito']
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    
    // Simulate AI response based on message content
    setTimeout(() => {
      let aiResponse = '';
      let suggestions: string[] = [];
      
      const lowerMessage = currentMessage.toLowerCase();
      
      if (lowerMessage.includes('tema') || lowerMessage.includes('hablar')) {
        aiResponse = '¡Excelente tema! Me parece muy interesante tu perspectiva. Para desarrollar mejor tu monólogo, ¿podrías contarme cuál es tu experiencia personal con este tema? Esto nos ayudará a crear un contenido más auténtico y conectar mejor con tu audiencia.';
        suggestions = [
          'He trabajado en esto por X años',
          'Viví una experiencia que me cambió la perspectiva',
          'He investigado esto profundamente',
          'Es mi área de especialización'
        ];
        updateField('topic', currentMessage);
      } else if (lowerMessage.includes('experiencia') || lowerMessage.includes('perspectiva')) {
        aiResponse = 'Perfecto, esa experiencia personal le dará mucha autenticidad a tu podcast. Ahora, ¿a quién te gustaría dirigir este mensaje? ¿Quién crees que se beneficiaría más de escuchar tu perspectiva sobre este tema?';
        suggestions = [
          'Profesionales de mi industria',
          'Personas que están empezando en este campo',
          'Gente que enfrenta desafíos similares',
          'Audiencia general interesada en el tema'
        ];
        updateField('perspective', currentMessage);
      } else if (lowerMessage.includes('audiencia') || lowerMessage.includes('dirigir')) {
        aiResponse = 'Excelente segmentación de audiencia. Eso nos ayudará a ajustar el tono y el enfoque. Hablando de tono, ¿cómo te gustaría que se sienta tu audiencia después de escuchar este episodio? ¿Inspirados, reflexivos, desafiados a actuar?';
        suggestions = [
          'Inspirados y motivados',
          'Más informados y conscientes',
          'Desafiados a cambiar su perspectiva',
          'Con herramientas prácticas para actuar'
        ];
        updateField('audience', currentMessage);
      } else if (lowerMessage.includes('tono') || lowerMessage.includes('sienta')) {
        aiResponse = 'Perfecto, ese tono se alinea muy bien con tu mensaje. Para finalizar el briefing, ¿cuánto tiempo te gustaría que dure este episodio? Recuerda que en monólogos, la concisión suele ser clave para mantener la atención.';
        suggestions = [
          '10-15 minutos para máximo impacto',
          '20-25 minutos para desarrollo completo',
          '30+ minutos para análisis profundo'
        ];
        updateField('tone', currentMessage);
      } else if (lowerMessage.includes('minuto') || lowerMessage.includes('duración')) {
        aiResponse = 'Excelente duración. Por último, ¿qué te gustaría que haga tu audiencia después de escuchar el episodio? ¿Hay alguna acción específica que quieres que tomen?';
        suggestions = [
          'Implementar algo específico que mencioné',
          'Contactarme o seguirme en redes',
          'Reflexionar sobre su propia situación',
          'Compartir el episodio con otros'
        ];
        updateField('duration', currentMessage);
      } else {
        aiResponse = 'Entiendo. ¿Hay algo más específico sobre tu monólogo en lo que te gustaría profundizar? Estoy aquí para ayudarte a desarrollar la mejor estructura y enfoque para tu contenido.';
        suggestions = [
          'Cómo estructurar mi mensaje',
          'Qué ejemplos usar',
          'Cómo mantener el engagement',
          'Cuál es el mejor gancho inicial'
        ];
      }
      
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        suggestions
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const updateField = (fieldId: string, value: string) => {
    setMonologueFields(prev => 
      prev.map(field => 
        field.id === fieldId 
          ? { ...field, value: value, isCompleted: true }
          : field
      )
    );
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const completedFields = monologueFields.filter(field => field.isCompleted).length;
  const canProceed = completedFields >= 4; // Minimum 4 fields completed

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <div className="min-h-screen bg-canvas p-4">
      <div className="max-w-[1440px] mx-auto h-[900px] flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-medium">Podcast en Monólogo / Opinión</h1>
              <p className="text-muted-foreground">Paso 1 de 6 - Briefing con Chat Maestro</p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              Paso 1 de 6
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <Button 
              variant="default"
              disabled={!canProceed}
              className="flex items-center gap-2"
            >
              Continuar
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedFields / monologueFields.length) * 100}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {completedFields}/{monologueFields.length} campos completados
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 min-h-0">
          
          {/* Left Panel - Chat */}
          <div className="flex-1 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Chat Maestro - Especialista en Monólogos
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4 pr-3">
                    {chatMessages.map((message) => (
                      <div key={message.id}>
                        <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {message.role !== 'user' && (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                              message.role === 'system' ? 'bg-blue-100' : 'bg-orange-100'
                            }`}>
                              {message.role === 'system' ? (
                                <Sparkles className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Bot className="w-4 h-4 text-orange-600" />
                              )}
                            </div>
                          )}
                          <div className={`max-w-[80%] p-4 rounded-xl ${
                            message.role === 'user' 
                              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' 
                              : message.role === 'system'
                              ? 'bg-blue-50 border border-blue-200 text-blue-900'
                              : 'bg-gray-50 text-foreground'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                          {message.role === 'user' && (
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 ml-11 space-y-2">
                            <p className="text-xs text-muted-foreground">Sugerencias:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full hover:border-orange-300 hover:bg-orange-50 transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
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
                    placeholder="Cuéntame sobre el tema de tu monólogo, tu perspectiva única o cualquier aspecto que quieras desarrollar..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="min-h-[80px] resize-none"
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!currentMessage.trim()}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar mensaje
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Briefing Fields */}
          <div className="w-96">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Briefing del Monólogo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-3">
                  <div className="space-y-4">
                    {monologueFields.map((field) => (
                      <Card key={field.id} className={`p-4 transition-all ${
                        field.isCompleted 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 hover:border-orange-200'
                      }`}>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{field.label}</h4>
                            {field.isCompleted && (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          
                          {field.value ? (
                            <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                              {field.value}
                            </p>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">Sugerencias:</p>
                              <div className="space-y-1">
                                {field.suggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setCurrentMessage(`${field.label}: ${suggestion}`)}
                                    className="w-full text-left px-2 py-1 text-xs bg-gray-50 hover:bg-orange-50 rounded transition-colors"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Summary Stats */}
                <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-medium">Progreso</span>
                      </div>
                      <p className="text-sm font-semibold text-orange-800">
                        {Math.round((completedFields / monologueFields.length) * 100)}%
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-medium">Tipo</span>
                      </div>
                      <p className="text-sm font-semibold text-orange-800">Monólogo</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}