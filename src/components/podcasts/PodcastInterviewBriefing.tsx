import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { usePodcastProject } from "../../contexts/PodcastProjectContext";
import { 
  MessageSquare, 
  Send, 
  User, 
  Bot, 
  CheckCircle2,
  Circle,
  Sparkles
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FormData {
  tema: string;
  objetivo: string;
  publico: string;
  duracion: string;
  invitado: string;
  rol: string;
  bio: string;
  estilo: 'casual' | 'profesional' | 'tecnico' | 'inspirador';
  cta: string;
}

export function PodcastInterviewBriefing() {
  const { hasBrandKit } = useBrandKit();
  const { createNewProject } = usePodcastProject();
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'user',
      content: 'Quiero un podcast entrevista de 30 minutos sobre logística internacional.',
      timestamp: new Date()
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Entendido. @tema: logística internacional; @duracion: 30 min; @estilo: profesional; @objetivo: informar a emprendedores; @publico: empresarios PYME; @cta: visita nuestro sitio web.',
      timestamp: new Date()
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [formData, setFormData] = useState<FormData>({
    tema: 'El futuro de la logística internacional',
    objetivo: 'Informar, inspirar y educar sobre las tendencias actuales en logística',
    publico: 'Emprendedores, estudiantes y ejecutivos de comercio internacional',
    duracion: '30 minutos',
    invitado: '',
    rol: '',
    bio: '',
    estilo: 'profesional',
    cta: 'Visita nuestro sitio web para más recursos'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const parseMessageForBindings = (message: string) => {
    const bindings: Partial<FormData> = {};
    
    const patterns = {
      tema: /@tema:\s*([^;]+)/i,
      objetivo: /@objetivo:\s*([^;]+)/i,
      publico: /@publico:\s*([^;]+)/i,
      duracion: /@duracion:\s*([^;]+)/i,
      invitado: /@invitado:\s*([^;]+)/i,
      rol: /@rol:\s*([^;]+)/i,
      bio: /@bio:\s*([^;]+)/i,
      estilo: /@estilo:\s*([^;]+)/i,
      cta: /@cta:\s*([^;]+)/i,
    };
    
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = message.match(pattern);
      if (match) {
        bindings[key as keyof FormData] = match[1].trim();
      }
    });
    
    return bindings;
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    
    // Simular respuesta del asistente
    setTimeout(() => {
      let response = `Perfecto. Basándome en tu solicitud, he identificado: `;
      
      // Generar respuesta con bindings
      const suggestions = [];
      if (currentMessage.toLowerCase().includes('tema') || currentMessage.toLowerCase().includes('sobre')) {
        suggestions.push('@tema: ' + currentMessage.split('sobre')[1]?.trim() || 'tema identificado');
      }
      if (currentMessage.toLowerCase().includes('minutos') || currentMessage.toLowerCase().includes('min')) {
        const duration = currentMessage.match(/(\d+)\s*(minutos?|min)/i);
        if (duration) suggestions.push('@duracion: ' + duration[0]);
      }
      if (currentMessage.toLowerCase().includes('profesional')) {
        suggestions.push('@estilo: profesional');
      }
      
      response += suggestions.join('; ');
      
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
      
      // Aplicar bindings al formulario
      const bindings = parseMessageForBindings(response);
      setFormData(prev => ({ ...prev, ...bindings }));
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const updateFormField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormComplete = () => {
    const required = ['tema', 'objetivo', 'publico', 'duracion', 'invitado', 'rol', 'estilo', 'cta'];
    return required.every(field => formData[field as keyof FormData]);
  };

  const checklist = [
    { label: 'Tema definido', completed: !!formData.tema },
    { label: 'Objetivo claro', completed: !!formData.objetivo },
    { label: 'Público identificado', completed: !!formData.publico },
    { label: 'Duración aproximada', completed: !!formData.duracion },
    { label: 'Invitado confirmado', completed: !!formData.invitado },
    { label: 'Estilo de entrevista seleccionado', completed: !!formData.estilo },
    { label: 'CTA definido', completed: !!formData.cta }
  ];

  return (
    <div className="min-h-screen bg-canvas p-4">
      <div className="max-w-[1440px] mx-auto h-[900px] flex gap-4">
        
        {/* Left Panel - Chat Maestro */}
        <div className="w-[460px] bg-white rounded-lg shadow-sm p-3 flex flex-col">
          <div className="mb-3">
            <h3 className="text-sm font-medium">Chat Maestro (Briefing de Entrevista)</h3>
          </div>
          
          {/* Chat Window */}
          <Card className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-6 h-6 bg-bubble-assistant rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3 h-3" />
                      </div>
                    )}
                    <div className={`max-w-[300px] p-2 rounded-lg text-sm ${
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
          </Card>
          
          {/* Chat Input */}
          <div className="mt-3 space-y-2">
            <Textarea 
              placeholder="Escribe una instrucción…"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[60px] resize-none"
            />
            <Button 
              onClick={sendMessage}
              disabled={!currentMessage.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar al asistente
            </Button>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-3 overflow-auto">
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Nuevo Podcast: Entrevista</h2>
              <Badge variant="secondary" className="text-xs">Paso 1 de 5</Badge>
            </div>

            {/* Datos principales */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Datos principales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">
                    Tema central
                    <Badge variant="outline" className="ml-2 text-xs">AI</Badge>
                  </label>
                  <Input 
                    placeholder="Ej: El futuro de la logística internacional"
                    value={formData.tema}
                    onChange={(e) => updateFormField('tema', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">
                    Objetivo
                    <Badge variant="outline" className="ml-2 text-xs">AI</Badge>
                  </label>
                  <Textarea 
                    placeholder="Ej: Informar, inspirar, educar"
                    value={formData.objetivo}
                    onChange={(e) => updateFormField('objetivo', e.target.value)}
                    className="text-sm min-h-[60px]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">
                    Público objetivo
                    <Badge variant="outline" className="ml-2 text-xs">AI</Badge>
                  </label>
                  <Textarea 
                    placeholder="Ej: Emprendedores, estudiantes, ejecutivos"
                    value={formData.publico}
                    onChange={(e) => updateFormField('publico', e.target.value)}
                    className="text-sm min-h-[60px]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">
                    Duración estimada
                    <Badge variant="outline" className="ml-2 text-xs">AI</Badge>
                  </label>
                  <Input 
                    placeholder="Ej: 30 minutos"
                    value={formData.duracion}
                    onChange={(e) => updateFormField('duracion', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invitados */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Invitados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Nombre del invitado</label>
                  <Input 
                    placeholder="Ej: Juan Pérez"
                    value={formData.invitado}
                    onChange={(e) => updateFormField('invitado', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Rol / Cargo</label>
                  <Input 
                    placeholder="Ej: CEO de Global Logistics"
                    value={formData.rol}
                    onChange={(e) => updateFormField('rol', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Bio corta</label>
                  <Textarea 
                    placeholder="Ej: Experto en comercio internacional con 20 años de experiencia"
                    value={formData.bio}
                    onChange={(e) => updateFormField('bio', e.target.value)}
                    className="text-sm min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Estilo de entrevista */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Estilo de entrevista</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: 'casual', label: 'Casual' },
                      { value: 'profesional', label: 'Profesional' },
                      { value: 'tecnico', label: 'Técnico' },
                      { value: 'inspirador', label: 'Inspirador' }
                    ].map((style) => (
                      <Button
                        key={style.value}
                        variant={formData.estilo === style.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFormField('estilo', style.value as any)}
                        className="text-xs"
                      >
                        {style.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">CTA final</label>
                  <Input 
                    placeholder="Ej: Suscríbete al canal o visita nuestra web"
                    value={formData.cta}
                    onChange={(e) => updateFormField('cta', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Checklist */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {checklist.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-xs">
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={item.completed ? 'text-green-700' : 'text-muted-foreground'}>
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <Button 
                className="bg-primary hover:bg-primary/90"
                disabled={!isFormComplete()}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Siguiente: Configuración técnica
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}