import { useState, useRef, useEffect } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { ScrollArea } from "../../ui/scroll-area";
import { useBrandKit } from "../../../contexts/BrandKitContext";
import { usePostProject } from "../../../contexts/PostProjectContext";
import { ChatMessage, ReferenceImage } from "../../../types/posts";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Upload, 
  Image as ImageIcon,
  X,
  Plus,
  Target,
  Users,
  Lightbulb,
  History,
  Code2,
  Clock,
  ChevronRight,
  ChevronLeft,
  Menu
} from "lucide-react";

// Mock data para las sesiones de chat previas
interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

const mockChatSessions: ChatSession[] = [
  {
    id: 'session_1',
    title: 'Lanzamiento Producto X',
    lastMessage: 'Perfecto, creemos un post que destaque los beneficios...',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    messageCount: 8
  },
  {
    id: 'session_2', 
    title: 'Promoción Black Friday',
    lastMessage: 'Para la promoción necesitamos urgencia visual...',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día atrás
    messageCount: 12
  },
  {
    id: 'session_3',
    title: 'Tutorial React Hooks',
    lastMessage: 'El carrusel educativo debería incluir...',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
    messageCount: 6
  },
  {
    id: 'session_4',
    title: 'Testimonio Cliente',
    lastMessage: 'Excelente idea para generar confianza...',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 semana atrás
    messageCount: 4
  }
];

export function BriefingStep() {
  const { hasBrandKit, getBrandInstructions } = useBrandKit();
  const { currentProject, updateBriefing, goToNextStep } = usePostProject();
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [projectDescription, setProjectDescription] = useState(currentProject?.briefing.description || '');
  const [objectives, setObjectives] = useState<string[]>(currentProject?.briefing.objectives || []);
  const [newObjective, setNewObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState(currentProject?.briefing.targetAudience || '');
  const [showPromptJSON, setShowPromptJSON] = useState(false);
  const [generatedPromptJSON, setGeneratedPromptJSON] = useState('');
  const [showChatLibrary, setShowChatLibrary] = useState(false);
  const [activeChatSession, setActiveChatSession] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatHistory = currentProject?.briefing.chatHistory || [];
  const referenceImages = currentProject?.briefing.referenceImages || [];

  // Función para auto-rellenar campos basado en el chat
  const autoFillFieldsFromChat = (chatContent: string) => {
    // Extraer información del contenido del chat
    const chatText = chatContent.toLowerCase();
    
    // Auto-rellenar descripción si está vacía
    if (!projectDescription && chatContent.length > 20) {
      const sentences = chatContent.split('.').filter(s => s.trim().length > 0);
      if (sentences.length > 0) {
        setProjectDescription(sentences[0].trim() + '.');
      }
    }

    // Auto-rellenar audiencia objetivo
    if (!targetAudience) {
      if (chatText.includes('jóvenes') || chatText.includes('millennials')) {
        setTargetAudience('Jóvenes 18-35 años, activos en redes sociales');
      } else if (chatText.includes('profesional') || chatText.includes('empresa')) {
        setTargetAudience('Profesionales y empresarios, LinkedIn y redes corporativas');
      } else if (chatText.includes('estudiante') || chatText.includes('educación')) {
        setTargetAudience('Estudiantes universitarios y recién graduados');
      } else if (chatText.includes('familia') || chatText.includes('padres')) {
        setTargetAudience('Padres de familia, 25-45 años');
      } else {
        setTargetAudience('Audiencia general, 18-50 años, interesados en ' + (currentProject?.type === 'post' ? 'contenido visual' : 'contenido secuencial'));
      }
    }

    // Auto-rellenar objetivos
    if (objectives.length === 0) {
      const newObjectives = [];
      if (chatText.includes('vender') || chatText.includes('promoción') || chatText.includes('comprar')) {
        newObjectives.push('Incrementar ventas y conversiones');
      }
      if (chatText.includes('conocimiento') || chatText.includes('educativo') || chatText.includes('enseñar')) {
        newObjectives.push('Educar y informar a la audiencia');
      }
      if (chatText.includes('marca') || chatText.includes('reconocimiento')) {
        newObjectives.push('Fortalecer reconocimiento de marca');
      }
      if (chatText.includes('engagement') || chatText.includes('interacción') || chatText.includes('comentarios')) {
        newObjectives.push('Aumentar engagement y participación');
      }
      
      if (newObjectives.length === 0) {
        newObjectives.push('Generar interacción y alcance orgánico');
        newObjectives.push('Comunicar mensaje clave de manera efectiva');
      }
      
      setObjectives(newObjectives);
    }
  };

  // Generar JSON prompt para Vertex AI
  const generatePromptJSON = () => {
    const promptData = {
      task: "content_generation",
      content_type: currentProject?.type || "post",
      description: projectDescription,
      target_audience: targetAudience,
      objectives: objectives,
      brand_kit_applied: hasBrandKit,
      reference_images_count: referenceImages.length,
      platform_optimization: "instagram_facebook_linkedin",
      style_preferences: [
        "professional",
        "engaging", 
        "brand_consistent"
      ],
      requirements: {
        format: currentProject?.type === 'post' ? "single_image" : "carousel_sequence",
        quality: "high_resolution",
        text_overlay: "optimized",
        call_to_action: "included"
      },
      generation_parameters: {
        creativity_level: 0.8,
        brand_adherence: hasBrandKit ? 0.9 : 0.5,
        engagement_focus: 0.9
      }
    };

    return JSON.stringify(promptData, null, 2);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isThinking) return;

    const userMessage: ChatMessage = {
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
      let response = `Entiendo que quieres crear un ${currentProject?.type === 'post' ? 'post' : 'carrusel'} sobre "${currentMessage}".`;
      
      if (hasBrandKit) {
        const brandInstructions = await getBrandInstructions('post');
        response += ` Basándome en tu BrandKit, te sugiero considerar estos elementos de marca para que el contenido sea coherente con tu identidad visual.`;
      } else {
        response += ` Para asegurarme de que el contenido esté alineado con tu marca, te recomiendo configurar tu BrandKit antes de continuar.`;
      }

      // Agregar sugerencias específicas basadas en el contexto
      if (currentMessage.toLowerCase().includes('producto')) {
        response += ` Para un post de producto, consideraría mostrar beneficios clave, call-to-action claro y elementos visuales que destaquen las características principales.`;
      } else if (currentMessage.toLowerCase().includes('evento')) {
        response += ` Para contenido de evento, incluiría fecha, ubicación, y elementos que generen expectativa y urgencia.`;
      } else if (currentMessage.toLowerCase().includes('promoción')) {
        response += ` Para contenido promocional, destacaría el descuento/beneficio, limitaciones de tiempo y un CTA persuasivo.`;
      }

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      const finalHistory = [...updatedHistory, assistantMessage];
      updateBriefing({
        chatHistory: finalHistory
      });

      // Auto-rellenar campos después de 3+ mensajes
      if (finalHistory.length >= 4) {
        setTimeout(() => {
          autoFillFieldsFromChat(currentMessage + ' ' + response);
          setShowPromptJSON(true);
          setGeneratedPromptJSON(generatePromptJSON());
        }, 500);
      }

      setIsThinking(false);
    }, 2000);
  };

  const loadChatSession = (session: ChatSession) => {
    // Simular carga de sesión anterior
    const mockMessages: ChatMessage[] = [
      {
        id: 'mock_1',
        role: 'user',
        content: `Quiero crear contenido sobre ${session.title}`,
        timestamp: session.timestamp
      },
      {
        id: 'mock_2', 
        role: 'assistant',
        content: session.lastMessage,
        timestamp: new Date(session.timestamp.getTime() + 30000)
      }
    ];

    updateBriefing({
      chatHistory: mockMessages
    });

    setActiveChatSession(session.id);

    // Auto-rellenar con información de la sesión
    setTimeout(() => {
      autoFillFieldsFromChat(session.title + ' ' + session.lastMessage);
      setShowPromptJSON(true);
      setGeneratedPromptJSON(generatePromptJSON());
    }, 1000);

    // En mobile, cerrar el drawer después de seleccionar
    if (window.innerWidth < 1024) {
      setShowChatLibrary(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ReferenceImage = {
          id: `img_${Date.now()}_${Math.random()}`,
          url: e.target?.result as string,
          filename: file.name,
          uploadedAt: new Date()
        };

        updateBriefing({
          referenceImages: [...referenceImages, newImage]
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (imageId: string) => {
    updateBriefing({
      referenceImages: referenceImages.filter(img => img.id !== imageId)
    });
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      updateBriefing({
        objectives: [...objectives, newObjective.trim()]
      });
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    const updated = objectives.filter((_, i) => i !== index);
    setObjectives(updated);
    updateBriefing({ objectives: updated });
  };

  // Efecto para actualizar el JSON cuando cambien los campos
  useEffect(() => {
    if (showPromptJSON) {
      setGeneratedPromptJSON(generatePromptJSON());
    }
  }, [projectDescription, targetAudience, objectives, showPromptJSON]);

  // Efecto para cerrar el drawer en resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && showChatLibrary) {
        setShowChatLibrary(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showChatLibrary]);

  const handleContinue = () => {
    // Guardar datos finales antes de continuar
    updateBriefing({
      description: projectDescription,
      objectives,
      targetAudience
    });
    goToNextStep();
  };

  const canContinue = projectDescription.trim() && (chatHistory.length > 0 || objectives.length > 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Briefing del Proyecto</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Describe tu proyecto y objetivos. El asistente de IA te ayudará a definir los detalles y aplicar tu BrandKit automáticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <Card className="lg:col-span-2 p-6 relative">
          <div className="flex h-[600px] relative">
            {/* Chat Principal */}
            <div className="flex-1 flex flex-col mr-2">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Asistente de Briefing</h3>
                  <p className="text-sm text-muted-foreground">
                    {hasBrandKit ? 'Con BrandKit aplicado' : 'Sin BrandKit configurado'}
                  </p>
                </div>
                {hasBrandKit && (
                  <Badge className="bg-green-100 text-green-800">
                    ✓ Marca
                  </Badge>
                )}
                {/* Botón para abrir biblioteca de chats */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChatLibrary(!showChatLibrary)}
                  className="flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">Historial</span>
                  {showChatLibrary ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
              </div>

            {/* Messages */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {/* Welcome message */}
                {chatHistory.length === 0 && (
                  <div className="flex justify-start">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 max-w-[80%]">
                        <p className="text-sm">
                          ¡Hola! Soy tu asistente para crear {currentProject?.type === 'post' ? 'posts' : 'carruseles'} increíbles. 
                          Cuéntame sobre el contenido que quieres crear:
                        </p>
                        <ul className="text-xs text-gray-600 mt-2 space-y-1">
                          <li>• ¿Qué quieres comunicar?</li>
                          <li>• ¿A quién va dirigido?</li>
                          <li>• ¿Cuál es el objetivo?</li>
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
                          ? 'bg-blue-500 text-white' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-blue-600" />
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
            <div className="mt-4 pt-4 border-t space-y-3">
              {/* Reference Images */}
              {referenceImages.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {referenceImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img 
                        src={img.url} 
                        alt={img.filename}
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Describe tu proyecto o haz preguntas..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={sendMessage} 
                  disabled={!currentMessage.trim() || isThinking}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            </div>

            {/* Chat Library Drawer - Derecha */}
            <div className={`
              absolute top-0 right-0 h-full bg-white border-l border-gray-200 shadow-lg z-10 transition-all duration-300 ease-in-out
              ${showChatLibrary ? 'w-80 lg:w-96' : 'w-0'}
              ${showChatLibrary ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}>
              {showChatLibrary && (
                <div className="h-full flex flex-col p-4">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium">Biblioteca de Chats</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowChatLibrary(false)}
                      className="p-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="space-y-3">
                      {mockChatSessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => loadChatSession(session)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all group ${
                            activeChatSession === session.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h5 className={`font-medium text-sm line-clamp-2 ${
                                activeChatSession === session.id
                                  ? 'text-blue-900'
                                  : 'text-gray-900 group-hover:text-blue-600'
                              }`}>
                                {session.title}
                              </h5>
                              {activeChatSession === session.id && (
                                <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                                  Activa
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {session.lastMessage}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{session.messageCount} mensajes</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {session.timestamp.toLocaleDateString() === new Date().toLocaleDateString() 
                                    ? session.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : session.timestamp.toLocaleDateString()
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="w-3 h-3 mr-2" />
                      Nueva Sesión
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Overlay para mobile cuando el drawer está abierto */}
          {showChatLibrary && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowChatLibrary(false)}
            />
          )}
        </Card>

        {/* Project Details Sidebar */}
        <Card className="p-6">
          <div className="space-y-6">
            <h3 className="font-semibold">Detalles del Proyecto</h3>

            {/* Project Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Descripción General
              </label>
              <Textarea
                placeholder="Resume en pocas líneas qué quieres comunicar..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Audiencia Objetivo
              </label>
              <Input
                placeholder="ej: Jóvenes 18-35, profesionales, padres..."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            {/* Objectives */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Objetivos
              </label>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar objetivo..."
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                />
                <Button onClick={addObjective} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {objectives.length > 0 && (
                <div className="space-y-1">
                  {objectives.map((objective, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                      <span className="flex-1">{objective}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeObjective(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reference Images Summary */}
            {referenceImages.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Referencias ({referenceImages.length})
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {referenceImages.slice(0, 6).map((img) => (
                    <div key={img.id} className="relative group">
                      <img 
                        src={img.url} 
                        alt={img.filename}
                        className="w-full h-16 object-cover rounded border"
                      />
                      {referenceImages.length > 6 && img === referenceImages[5] && (
                        <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center text-white text-xs">
                          +{referenceImages.length - 5}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt JSON - Solo se muestra después del chat */}
            {showPromptJSON && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Prompt JSON
                </label>
                <Textarea
                  value={generatedPromptJSON}
                  readOnly
                  className="min-h-[200px] font-mono text-xs bg-gray-50 border border-gray-200"
                  placeholder="El prompt JSON se generará automáticamente después de la conversación..."
                />
                <p className="text-xs text-muted-foreground">
                  Este JSON se puede usar directamente con Vertex AI para la generación de contenido
                </p>
              </div>
            )}

            {/* Continue Button */}
            <Button 
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full"
            >
              Continuar a Configuración
            </Button>

            {!canContinue && (
              <p className="text-xs text-muted-foreground text-center">
                Completa la descripción y al menos un objetivo para continuar
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}