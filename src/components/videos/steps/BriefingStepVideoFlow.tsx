import React, { useState, useRef, useEffect } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { useBrandKit } from "../../../contexts/BrandKitContext";
import { useVideoProject } from "../../../contexts/VideoProjectContext";

import { 
  ArrowRight,
  Bot,
  Send,
  Upload,
  CheckCircle,
  Circle,
  Users,
  Target,
  Clock,
  MessageSquare,
  FileUp,
  Sparkles
} from "lucide-react";

interface BriefingStepVideoFlowProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BriefingData {
  projectName: string;
  projectDescription: string;
  objective: string;
  audience: string;
  tone: string;
  duration: string;
  structure: string;
  cta: string;
  styleNotes: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Quiero un video narrativo de 3 minutos sobre cómo funciona nuestro servicio de envíos.',
    timestamp: new Date(Date.now() - 120000)
  },
  {
    id: '2', 
    role: 'assistant',
    content: 'Perfecto! Te ayudo a estructurar este video. He identificado: @objetivo: explicar funcionamiento del servicio; @audiencia: clientes nuevos; @tono: educativo; @duracion: 3 minutos; @estructura: introducción, pasos del proceso, conclusión; @cta: visita nuestra web.',
    timestamp: new Date(Date.now() - 60000)
  }
];

export function BriefingStepVideoFlow({ onNext, onPrevious }: BriefingStepVideoFlowProps) {
  const { brandKit } = useBrandKit();
  const { currentProject, updateBriefing } = useVideoProject();
  
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [briefingData, setBriefingData] = useState<BriefingData>({
    projectName: 'Video Explicativo Envíos',
    projectDescription: 'Video narrativo que explica el proceso de envíos paso a paso',
    objective: 'Explicar el funcionamiento del servicio de envíos de manera clara y educativa',
    audience: 'Clientes nuevos interesados en conocer cómo funciona el servicio',
    tone: 'Educativo y profesional',
    duration: '3 minutos',
    structure: 'Introducción del problema → Pasos del proceso → Beneficios → Conclusión',
    cta: 'Visita nuestra web para comenzar',
    styleNotes: 'Incluir logo oficial y slogan "Fácil, rápido y seguro"'
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Parse @mentions from chat and update form fields
  const parseAndUpdateFields = (content: string) => {
    const mentions = {
      '@objetivo': /@objetivo:\s*([^;@]+)/g,
      '@audiencia': /@audiencia:\s*([^;@]+)/g,
      '@tono': /@tono:\s*([^;@]+)/g,
      '@duracion': /@duracion:\s*([^;@]+)/g,
      '@estructura': /@estructura:\s*([^;@]+)/g,
      '@cta': /@cta:\s*([^;@]+)/g
    };

    const updates: Partial<BriefingData> = {};
    
    Object.entries(mentions).forEach(([key, regex]) => {
      const match = regex.exec(content);
      if (match && match[1]) {
        const value = match[1].trim();
        switch (key) {
          case '@objetivo':
            updates.objective = value;
            break;
          case '@audiencia':
            updates.audience = value;
            break;
          case '@tono':
            updates.tone = value;
            break;
          case '@duracion':
            updates.duration = value;
            break;
          case '@estructura':
            updates.structure = value;
            break;
          case '@cta':
            updates.cta = value;
            break;
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      setBriefingData(prev => ({ ...prev, ...updates }));
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Entendido. @objetivo: generar engagement; @audiencia: millennials; @tono: dinámico; @duracion: 2 minutos; @estructura: gancho inicial, desarrollo, call to action; @cta: descarga la app.',
        'Perfecto! He actualizado los campos: @objetivo: educar sobre el producto; @audiencia: profesionales 30-50 años; @tono: formal pero accesible; @duracion: 4 minutos; @estructura: problema, solución, casos de uso; @cta: solicita una demo.',
        'Excelente idea! @objetivo: mostrar casos de éxito; @audiencia: empresarios; @tono: inspirador; @duracion: 5 minutos; @estructura: testimonios, resultados, proceso; @cta: contáctanos para más información.'
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      parseAndUpdateFields(randomResponse);
      setIsTyping(false);
    }, 1500);
  };

  const handleInputChange = (field: keyof BriefingData, value: string) => {
    setBriefingData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Check completion status
  const checklistItems = [
    { label: 'Objetivo definido', completed: !!briefingData.objective },
    { label: 'Audiencia definida', completed: !!briefingData.audience },
    { label: 'Duración aproximada indicada', completed: !!briefingData.duration },
    { label: 'Narrativa estructurada', completed: !!briefingData.structure },
    { label: 'CTA claro', completed: !!briefingData.cta },
    { label: 'Recursos subidos', completed: uploadedFiles.length > 0 || !!briefingData.styleNotes }
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const canProceed = completedCount >= 4; // At least 4 items completed

  const handleNext = () => {
    // Update project context
    updateBriefing({
      description: briefingData.projectDescription,
      script: briefingData.structure,
      objectives: [briefingData.objective],
      targetAudience: briefingData.audience
    });
    
    onNext?.();
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="h-full p-4 flex gap-4 max-w-none overflow-hidden">
        {/* Left Panel - Chat Maestro */}
        <div className="w-[480px] flex flex-col bg-white rounded-lg shadow-sm border">
          {/* Chat Header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Chat Maestro</h3>
                <p className="text-sm text-muted-foreground">Briefing de Video con Flow</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">Asistente escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t">
            <div className="space-y-3">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe una instrucción o idea…"
                className="min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isTyping}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar al asistente
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border min-w-0">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Nuevo Video con Flow</h2>
              <Badge variant="secondary">Paso 1 de 7</Badge>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-6">
            {/* Proyecto */}
            <Card className="p-4">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Proyecto
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="projectName">Nombre del proyecto</Label>
                    <Input
                      id="projectName"
                      value={briefingData.projectName}
                      onChange={(e) => handleInputChange('projectName', e.target.value)}
                      placeholder="Demo Envíos Octubre"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="projectDescription">Descripción breve</Label>
                    <Textarea
                      id="projectDescription"
                      value={briefingData.projectDescription}
                      onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                      placeholder="Ej: Explicar a clientes nuevos cómo usar la plataforma"
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Estrategia narrativa */}
            <Card className="p-4">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Estrategia narrativa
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="objective" className="flex items-center gap-2">
                      Objetivo
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    </Label>
                    <Textarea
                      id="objective"
                      value={briefingData.objective}
                      onChange={(e) => handleInputChange('objective', e.target.value)}
                      placeholder="¿Qué quieres lograr con el video?"
                      className="min-h-[60px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="audience" className="flex items-center gap-2">
                      Audiencia
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    </Label>
                    <Textarea
                      id="audience"
                      value={briefingData.audience}
                      onChange={(e) => handleInputChange('audience', e.target.value)}
                      placeholder="Ej: Clientes en USA de 25–45 años"
                      className="min-h-[60px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tone" className="flex items-center gap-2">
                        Tono/Estilo
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      </Label>
                      <Input
                        id="tone"
                        value={briefingData.tone}
                        onChange={(e) => handleInputChange('tone', e.target.value)}
                        placeholder="Educativo, humorístico, formal…"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="duration" className="flex items-center gap-2">
                        Duración estimada
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      </Label>
                      <Input
                        id="duration"
                        value={briefingData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        placeholder="Ej: 3 minutos"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="structure" className="flex items-center gap-2">
                      Estructura narrativa
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    </Label>
                    <Textarea
                      id="structure"
                      value={briefingData.structure}
                      onChange={(e) => handleInputChange('structure', e.target.value)}
                      placeholder="Ej: introducción, desarrollo, conclusión"
                      className="min-h-[60px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cta" className="flex items-center gap-2">
                      CTA principal
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    </Label>
                    <Input
                      id="cta"
                      value={briefingData.cta}
                      onChange={(e) => handleInputChange('cta', e.target.value)}
                      placeholder="Ej: Visita nuestra web"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Recursos obligatorios */}
            <Card className="p-4">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <FileUp className="w-4 h-4" />
                  Recursos obligatorios
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fileUpload">Subir imágenes/videos de referencia</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        id="fileUpload"
                        multiple
                        accept=".png,.jpg,.jpeg,.mp4,.mov"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('fileUpload')?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Seleccionar archivos (.png, .jpg, .mp4)
                      </Button>
                      
                      {uploadedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{file.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                ✕
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="styleNotes">Notas de estilo / slogans obligatorios</Label>
                    <Textarea
                      id="styleNotes"
                      value={briefingData.styleNotes}
                      onChange={(e) => handleInputChange('styleNotes', e.target.value)}
                      placeholder="Incluye el logo oficial y el slogan 'Fácil, rápido y seguro'"
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Checklist */}
            <Card className="p-4">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Checklist ({completedCount}/6)
                </h3>
                
                <div className="space-y-2">
                  {checklistItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {item.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={`text-sm ${item.completed ? 'text-green-800' : 'text-gray-600'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                {completedCount < 4 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Completa al menos 4 elementos para continuar al siguiente paso.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="flex justify-end">
              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Siguiente: Configuración
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}