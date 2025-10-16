import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ChatTimeline } from './ChatTimeline';
import { useBriefChatStore, briefSections } from '../../stores/briefChatStore';
import { useBrandKit } from '../../contexts/BrandKitContext';
import { usePostProject } from '../../contexts/PostProjectContext';
import {
  MessageSquare,
  Send,
  Upload,
  Bot,
  User,
  AlertTriangle,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Save,
  Clock,
  Zap,
  Info,
  Settings,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

interface BriefChatProps {
  onContinue?: () => void;
}

export function BriefChat({ onContinue }: BriefChatProps) {
  const { hasBrandKit } = useBrandKit();
  const { currentProject, goToNextStep } = usePostProject();
  
  const {
    // Chat state
    messages,
    isLoading,
    isTyping,
    addMessage,
    setIsLoading,
    setIsTyping,
    
    // Brief state
    briefData,
    activeBriefSection,
    setActiveBriefSection,
    updateBriefField,
    
    // Conflicts
    conflicts,
    hasUnresolvedConflicts,
    resolveConflict,
    dismissConflict,
    
    // UI state
    chatCollapsed,
    briefCollapsed,
    toggleChatCollapse,
    toggleBriefCollapse,
    
    // Auto-save
    lastSaved,
    hasUnsavedChanges,
    autoSaveEnabled,
    setAutoSaveEnabled,
    saveBrief,
    markSaved,
    
    // Completion
    briefCompleted,
    canContinueWorkflow,
    checkBriefCompletion,
    
    // Actions
    resetStore
  } = useBriefChatStore();

  const [currentMessage, setCurrentMessage] = useState('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-save logic
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges) {
      if (autoSaveIntervalRef.current) {
        clearTimeout(autoSaveIntervalRef.current);
      }
      
      autoSaveIntervalRef.current = setTimeout(async () => {
        try {
          setIsAutoSaving(true);
          await saveBrief();
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsAutoSaving(false);
        }
      }, 3000); // 3 seconds delay
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearTimeout(autoSaveIntervalRef.current);
      }
    };
  }, [hasUnsavedChanges, autoSaveEnabled, saveBrief]);

  // Check completion on data changes
  useEffect(() => {
    checkBriefCompletion();
  }, [briefData, conflicts, checkBriefCompletion]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    // Add user message
    addMessage(currentMessage, 'user');
    setCurrentMessage('');
    setIsLoading(true);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(currentMessage);
      addMessage(response, 'assistant');
      setIsLoading(false);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('objetivo') || lowerMessage.includes('meta')) {
      return `Perfecto, entiendo que quieres trabajar en el objetivo del post. Basándome en lo que me cuentas, te sugiero que el objetivo principal sea claro y medible. ${hasBrandKit ? 'Veo que tienes tu BrandKit configurado, así que podemos alinearlo con tu identidad de marca.' : 'Te recomiendo configurar tu BrandKit para mantener consistencia.'} ¿Puedes contarme más específicamente qué quieres lograr con este post?`;
    }
    
    if (lowerMessage.includes('audiencia') || lowerMessage.includes('público')) {
      return `Excelente, definir bien la audiencia es clave para el éxito del post. Te ayudo a segmentarla correctamente. ¿Me puedes describir a quién específicamente quieres llegar? Por ejemplo: edad, intereses, comportamiento en redes sociales, etc.`;
    }
    
    if (lowerMessage.includes('producto') || lowerMessage.includes('servicio')) {
      return `Entiendo que quieres promocionar un producto/servicio. Para crear un post efectivo, necesito entender: ¿cuál es el beneficio principal que aporta? ¿qué problema resuelve? ¿qué hace que sea único frente a la competencia?`;
    }
    
    if (lowerMessage.includes('promoción') || lowerMessage.includes('oferta') || lowerMessage.includes('descuento')) {
      return `Genial, las promociones pueden generar mucho engagement. Para maximizar el impacto, sugiero incluir: el beneficio específico, la urgencia (tiempo limitado), y un call-to-action claro. ¿Tienes definidos estos elementos?`;
    }
    
    if (lowerMessage.includes('evento') || lowerMessage.includes('lanzamiento')) {
      return `Los eventos y lanzamientos requieren una estrategia especial. Necesitamos destacar: la fecha y ubicación (si aplica), qué lo hace especial, quién debería asistir, y cómo participar. ¿Me puedes dar más detalles del evento?`;
    }
    
    // Generic response
    const responses = [
      `Interesante propuesta. Para ayudarte mejor, necesito entender algunos aspectos clave. ¿Podrías contarme más sobre el contexto del proyecto?`,
      `Me parece una buena idea. Para desarrollarla correctamente, ¿qué resultado específico esperas obtener con este post?`,
      `Entiendo la dirección. Para asegurarme de crear algo efectivo, ¿cuál dirías que es el mensaje principal que quieres transmitir?`,
      `Perfecto, vamos definiendo los detalles. ${hasBrandKit ? 'Con tu BrandKit aplicado, podemos mantener consistencia con tu marca.' : ''} ¿Hay algún elemento específico que no puede faltar en el post?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleFieldChange = (fieldId: keyof typeof briefData, value: any) => {
    updateBriefField(fieldId, value);
  };

  const handleContinueWorkflow = () => {
    if (canContinueWorkflow) {
      // Save before continuing
      saveBrief().then(() => {
        if (onContinue) {
          onContinue();
        } else {
          goToNextStep();
        }
      });
    }
  };

  const getCompletionStatus = () => {
    const requiredFields = ['objetivo', 'audienciaPrimaria', 'audienciaInsight', 'ofertaProducto', 'ofertaBeneficio', 'formatoTipo', 'cta'];
    const completed = requiredFields.filter(field => 
      briefData[field as keyof typeof briefData] && 
      String(briefData[field as keyof typeof briefData]).trim() !== ''
    ).length;
    
    return {
      completed,
      total: requiredFields.length,
      percentage: Math.round((completed / requiredFields.length) * 100)
    };
  };

  const getSectionCompletionStatus = (sectionId: string) => {
    const section = briefSections.find(s => s.id === sectionId);
    if (!section) return 'incompleto';
    
    const requiredFields = section.fields.filter(f => f.required);
    const completedFields = requiredFields.filter(field => {
      const value = briefData[field.id];
      return value && (Array.isArray(value) ? value.length > 0 : String(value).trim() !== '');
    });
    
    if (requiredFields.length === 0) return 'opcional';
    return completedFields.length === requiredFields.length ? 'completo' : 'incompleto';
  };

  const completionStatus = getCompletionStatus();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold">
                {currentProject?.type === 'carousel' ? 'Crear Carusel — Paso 1' : 'Crear Post Simple — Paso 1'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Brief interactivo con IA
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Completion Status */}
            <Badge variant={briefCompleted ? "default" : "secondary"}>
              Brief: {briefCompleted ? "completo" : `${completionStatus.percentage}%`}
            </Badge>
            
            {/* Auto-save Status */}
            <Badge variant="outline" className="flex items-center gap-1">
              {isAutoSaving ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Guardando...
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Clock className="w-3 h-3" />
                  Sin guardar
                </>
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  Guardado
                </>
              )}
            </Badge>
            
            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              title="Configurar auto-guardado"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3">
          <Progress value={completionStatus.percentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Progreso del brief</span>
            <span>{completionStatus.completed}/{completionStatus.total} campos clave</span>
          </div>
        </div>
      </div>

      {/* Conflicts Alert */}
      {hasUnresolvedConflicts && (
        <Alert className="m-4 border-amber-200 bg-amber-50">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Se detectaron {conflicts.filter(c => !c.resolved).length} conflictos entre el chat y el brief.
            <Button variant="link" className="p-0 h-auto ml-2 text-amber-700">
              Revisar conflictos
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Panel */}
        <div className={`transition-all duration-300 ${chatCollapsed ? 'w-12' : 'w-[60%]'} border-r bg-card/50`}>
          {chatCollapsed ? (
            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChatCollapse}
                className="w-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isTyping ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`} />
                  <span className="font-medium">Chat con ChatGPT-5 (Brief)</span>
                  {hasBrandKit && (
                    <Badge variant="secondary" className="text-xs">
                      BrandKit activo
                    </Badge>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleChatCollapse}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>

              {/* Chat Timeline with D3 Design */}
              <ChatTimeline 
                messages={messages}
                isTyping={isTyping}
              />

              {/* Message Input */}
              <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribe tu respuesta..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-lg"
                    title="Subir imagen o archivo (diseño)"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir
                  </Button>
                  <Button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isLoading}
                    size="sm"
                    className="h-9"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-right mt-2">
                  <p className="text-xs text-muted-foreground opacity-70">
                    Tipos (diseño): Imágenes (PNG/JPG), PDF, TXT
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Brief Panel */}
        <div className={`transition-all duration-300 ${briefCollapsed ? 'w-12' : 'w-[40%]'} bg-card`}>
          {briefCollapsed ? (
            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleBriefCollapse}
                className="w-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Brief Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Brief (editable)</span>
                  <Badge variant="outline" className="text-xs">
                    Autosave: {autoSaveEnabled ? 'ON' : 'OFF'}
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleBriefCollapse}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Brief Tabs */}
              <Tabs value={activeBriefSection} onValueChange={setActiveBriefSection} className="flex-1 flex flex-col">
                <ScrollArea className="px-3 py-2 border-b">
                  <TabsList className="inline-flex h-auto p-1 space-x-1 overflow-x-auto min-w-max">
                    {briefSections.map((section) => (
                      <TabsTrigger
                        key={section.id}
                        value={section.id}
                        className="text-xs py-2 px-3 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        {section.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </ScrollArea>

                <ScrollArea className="flex-1">
                  {briefSections.map((section) => (
                    <TabsContent key={section.id} value={section.id} className="p-3 space-y-3 mt-0">
                      {/* Section fields */}
                      {section.fields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label className="text-xs font-semibold opacity-85 flex items-center gap-2">
                            {field.label}
                            {field.required && <span className="text-red-500">*</span>}
                            {conflicts.some(c => c.fieldId === field.id && !c.resolved) && (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                          </Label>
                          
                          {field.type === 'input' && (
                            <Input
                              placeholder={field.placeholder}
                              value={briefData[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="h-9 rounded-lg"
                            />
                          )}
                          
                          {field.type === 'textarea' && (
                            <Textarea
                              placeholder={field.placeholder}
                              value={briefData[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="min-h-[72px] rounded-lg"
                              rows={field.id === 'audienciaInsight' ? 3 : 2}
                            />
                          )}
                          
                          {field.type === 'select' && field.id === 'formatoTipo' && (
                            <RadioGroup
                              value={briefData[field.id] || 'single'}
                              onValueChange={(value) => handleFieldChange(field.id, value)}
                              className="flex flex-row space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="single" id="single" />
                                <Label htmlFor="single" className="text-xs">Single</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="carousel" id="carousel" />
                                <Label htmlFor="carousel" className="text-xs">Carousel</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="story" id="story" />
                                <Label htmlFor="story" className="text-xs">Story</Label>
                              </div>
                            </RadioGroup>
                          )}
                          
                          {field.type === 'select' && field.id !== 'formatoTipo' && (
                            <Select
                              value={briefData[field.id] || ''}
                              onValueChange={(value) => handleFieldChange(field.id, value)}
                            >
                              <SelectTrigger className="h-9 rounded-lg">
                                <SelectValue placeholder={field.placeholder} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          
                          {field.type === 'tags' && field.id === 'formatoPlataformas' && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                {['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'X'].map((platform) => (
                                  <Button
                                    key={platform}
                                    variant={(briefData[field.id] as string[])?.includes(platform) ? 'default' : 'outline'}
                                    size="sm"
                                    className="text-xs h-8 rounded-lg"
                                    onClick={() => {
                                      const currentPlatforms = (briefData[field.id] as string[]) || [];
                                      const newPlatforms = currentPlatforms.includes(platform)
                                        ? currentPlatforms.filter(p => p !== platform)
                                        : [...currentPlatforms, platform];
                                      handleFieldChange(field.id, newPlatforms);
                                    }}
                                  >
                                    {platform}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {field.type === 'tags' && field.id === 'marcaColores' && (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                {['Primario', 'Secundario', 'Accento'].map((color) => (
                                  <Button
                                    key={color}
                                    variant={(briefData[field.id] as string[])?.includes(color) ? 'default' : 'outline'}
                                    size="sm"
                                    className="text-xs h-8 rounded-lg"
                                    onClick={() => {
                                      const currentColors = (briefData[field.id] as string[]) || [];
                                      const newColors = currentColors.includes(color)
                                        ? currentColors.filter(c => c !== color)
                                        : [...currentColors, color];
                                      handleFieldChange(field.id, newColors);
                                    }}
                                  >
                                    {color}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {field.type === 'tags' && !['formatoPlataformas', 'marcaColores'].includes(field.id) && (
                            <div className="space-y-2">
                              <Input
                                placeholder={field.placeholder}
                                className="h-9 rounded-lg"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const value = (e.target as HTMLInputElement).value.trim();
                                    if (value && !(briefData[field.id] as string[])?.includes(value)) {
                                      handleFieldChange(field.id, [...((briefData[field.id] as string[]) || []), value]);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                }}
                              />
                              {(briefData[field.id] as string[])?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {(briefData[field.id] as string[])?.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs h-6 rounded-lg">
                                      {tag}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-4 h-4 p-0 ml-1 hover:bg-transparent"
                                        onClick={() => {
                                          const newTags = (briefData[field.id] as string[]).filter((_, i) => i !== index);
                                          handleFieldChange(field.id, newTags);
                                        }}
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Hint text for specific fields */}
                          {field.id === 'objetivo' && (
                            <p className="text-xs text-muted-foreground">1 frase clara, medible si es posible</p>
                          )}
                          {field.id === 'hashtags' && (
                            <p className="text-xs text-muted-foreground">3–8 hashtags relevantes</p>
                          )}
                          
                          {/* Conflict resolution for this field */}
                          {conflicts.filter(c => c.fieldId === field.id && !c.resolved).map((conflict) => (
                            <Alert key={`${conflict.fieldId}-${conflict.timestamp.getTime()}`} className="border-amber-200 bg-amber-50">
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                              <AlertDescription className="space-y-2">
                                <p className="text-sm text-amber-800">{conflict.suggestion}</p>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => resolveConflict(conflict.fieldId, 'chat')}
                                    className="text-xs"
                                  >
                                    Usar chat: "{conflict.chatValue}"
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => resolveConflict(conflict.fieldId, 'brief')}
                                    className="text-xs"
                                  >
                                    Mantener brief
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => dismissConflict(conflict.fieldId)}
                                    className="text-xs"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      ))}
                      
                      {/* Section completion chip */}
                      <div className="pt-2">
                        <Badge 
                          variant={getSectionCompletionStatus(section.id) === 'completo' ? 'default' : 'secondary'}
                          className="h-6 rounded-lg text-xs"
                        >
                          {getSectionCompletionStatus(section.id)}
                        </Badge>
                      </div>
                    </TabsContent>
                  ))}
                </ScrollArea>
              </Tabs>

              {/* Brief Footer */}
              <div className="p-3 border-t bg-background">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getSectionCompletionStatus(activeBriefSection) === 'completo' ? "default" : "secondary"} className="text-xs">
                      Sección activa: {getSectionCompletionStatus(activeBriefSection)}
                    </Badge>
                    
                    {hasUnresolvedConflicts && (
                      <Badge variant="destructive" className="text-xs">
                        {conflicts.filter(c => !c.resolved).length} conflictos
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => saveBrief()}
                      disabled={isAutoSaving}
                      className="text-xs"
                    >
                      {isAutoSaving ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        'Guardar sección'
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleContinueWorkflow}
                      disabled={!canContinueWorkflow}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      Continuar
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {!canContinueWorkflow && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Completa los campos clave para continuar
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
