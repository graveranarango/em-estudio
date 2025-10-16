// Enhanced Chat Module with SDK Integration
// Connected to production backend with streaming, abort, regenerate, and persistence

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  ChevronRight, 
  X, 
  Paperclip, 
  Rocket, 
  Sparkles, 
  ChevronDown,
  Mic,
  Send,
  ListChecks,
  BadgeCheck,
  Image,
  Globe,
  FileText,
  XCircle,
  AlertTriangle,
  RotateCw,
  Download,
  Share,
  GitBranch,
  Plus,
  Clock,
  Play,
  ArrowDown,
  ChevronUp
} from 'lucide-react';

import { useChat } from '../../hooks/useChat';
import { useBrandGuard } from '../../hooks/useBrandGuard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BrandGuardChip } from '../chat/BrandGuardChip';
import { BrandGuardPanel } from '../chat/BrandGuardPanel';

// For demo purposes, we'll work in offline mode without real backend
const DEMO_MODE = true; // Set to false when real auth is available

export function ChatModuleUpdated() {
  // Chat hook with all functionality - undefined JWT for demo mode
  const chat = useChat(DEMO_MODE ? undefined : 'real_jwt_here');
  
  // Brand Guard hook
  const brandGuard = useBrandGuard();
  
  // UI state
  const [isMobile, setIsMobile] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('md');
  const [shareMode, setShareMode] = useState('readonly');
  const [showBrandGuardPanel, setShowBrandGuardPanel] = useState(false);
  
  // Memoized computed values to prevent re-renders
  const isStreaming = chat.isStreaming;
  const canSendMessage = chat.composerText.trim().length > 0 && !isStreaming;
  const canAbort = isStreaming;
  const threadTitle = useMemo(() => {
    const firstUserMessage = chat.messages.find(m => m.role === 'user');
    return firstUserMessage?.parts?.[0]?.value?.substring(0, 50) + '...' || 'New Chat';
  }, [chat.messages]);
  const currentTools = [];
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        chat.setRightPanelOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [chat]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
    }
  }, [chat.messages]);

  // Post-check assistant messages with Brand Guard
  useEffect(() => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (lastMessage && 
        lastMessage.role === 'assistant' && 
        lastMessage.parts?.[0]?.value && 
        !lastMessage.isStreaming &&
        chat.settings.brandGuard) {
      
      const assistantText = lastMessage.parts[0].value;
      if (assistantText.trim().length > 0) {
        brandGuard.checkAssistantMessage(assistantText, {
          objective: 'chat_response',
          audience: 'general'
        });
      }
    }
  }, [chat.messages, brandGuard, chat.settings.brandGuard]);

  // Demo mode: simulate Brand Guard analysis for user messages
  useEffect(() => {
    if (DEMO_MODE && chat.settings.brandGuard && chat.composerText.length > 10) {
      const timeoutId = setTimeout(() => {
        brandGuard.checkUserMessage(chat.composerText, {
          objective: 'user_input',
          audience: 'general'
        });
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [chat.composerText, brandGuard, chat.settings.brandGuard]);

  // Handle slash commands
  const handleSlashCommand = (command: string) => {
    const newText = chat.composerText + command;
    chat.setComposerText(newText);
    setShowSlashMenu(false);
    textareaRef.current?.focus();
  };

  // Handle send message with Brand Guard pre-check
  const handleSend = async () => {
    if (!canSendMessage) return;
    
    try {
      // Pre-check user message with Brand Guard (only if enabled)
      const userText = chat.composerText.trim();
      if (userText.length > 0 && chat.settings.brandGuard) {
        await brandGuard.checkUserMessage(userText, {
          objective: 'chat_conversation',
          audience: 'general'
        });
      }

      await chat.send();
      // Focus back to textarea after sending
      setTimeout(() => textareaRef.current?.focus(), 100);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle key presses
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSlashMenu(false);
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    chat.setComposerText(value);
    
    // Show slash menu when typing "/"
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastChar = textBeforeCursor.slice(-1);
    const charBeforeLast = textBeforeCursor.slice(-2, -1);
    
    setShowSlashMenu(
      lastChar === '/' && 
      (textBeforeCursor.length === 1 || charBeforeLast === ' ' || charBeforeLast === '\n')
    );
  };

  // Handle Brand Guard suggestion application
  const handleApplySuggestion = useCallback((suggestedText: string) => {
    chat.setComposerText(suggestedText);
    brandGuard.applySuggestion(chat.composerText, suggestedText);
    textareaRef.current?.focus();
  }, [chat, brandGuard]);

  // Render streaming status
  const renderStreamingStatus = () => {
    if (!isStreaming) return null;

    return (
      <div className="flex justify-center mb-4">
        <div className="bg-card border border-border rounded-xl p-3 max-w-md">
          <h4 className="text-sm font-medium mb-3">
            {chat.settings.persona === 'mentor' ? 'Analizando solicitud' : 
             chat.settings.persona === 'planner' ? 'Estructurando respuesta' : 
             'Procesando información'}
          </h4>
          
          {/* Current tools */}
          {currentTools.length > 0 && (
            <div className="space-y-2 mb-3">
              {currentTools.map((tool, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    tool.completed ? 'bg-green-500' : 'bg-amber-500'
                  }`}></div>
                  <span className="text-sm">{tool.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tool.mode === 'dry_run' ? '(simulado)' : '(en vivo)'}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* Progress indication */}
          <Progress value={isStreaming ? 45 : 100} className="mb-3" />
          
          {/* Cancel button */}
          {canAbort && (
            <Button
              variant="outline"
              size="sm"
              onClick={chat.abort}
              className="flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              Cancelar
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render message - memoized to prevent unnecessary re-renders
  const renderMessage = useCallback((message: any, index: number) => {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';
    
    return (
      <div key={message.id || index} className={`flex gap-2 sm:gap-3 ${isUser ? 'justify-end' : ''}`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
            AI
          </div>
        )}
        
        <div className={`flex-1 max-w-[85%] sm:max-w-[80%] ${isUser ? 'flex flex-col items-end' : ''}`}>
          <div className={`rounded-xl p-3 text-sm ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-50'
          }`}>
            {/* Message content */}
            <div className="whitespace-pre-wrap">
              {message.parts?.[0]?.value || message.content || ''}
            </div>
            
            {/* Tool chips for assistant messages */}
            {isAssistant && message.meta?.tools && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {message.meta.tools.map((tool: any, toolIndex: number) => (
                  <Badge key={toolIndex} variant="secondary" className="text-xs">
                    {tool.name}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Google IA request indicator */}
            {isAssistant && message.meta?.googleIaRequest && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs font-medium text-blue-800">
                  💫 Solicitud de generación visual
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {message.meta.googleIaRequest.task}: {message.meta.googleIaRequest.subject}
                </div>
              </div>
            )}
            
            {/* Usage info */}
            {isAssistant && message.meta?.usage && (
              <div className="mt-2 text-xs text-muted-foreground">
                {message.meta.usage.prompt + message.meta.usage.completion} tokens
              </div>
            )}
          </div>
          
          {/* Timestamp and Brand Guard status */}
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {message.createdAt ? new Date(message.createdAt).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Ahora'}
            </span>
            
            {/* Brand Guard chip for completed messages */}
            {!message.isStreaming && message.parts?.[0]?.value && (
              <BrandGuardChip
                report={isAssistant ? brandGuard.lastReport : null}
                isAnalyzing={false}
                onApplySuggestion={isUser ? handleApplySuggestion : undefined}
                size="sm"
                showLabel={false}
              />
            )}
          </div>
          
          {/* Regenerate button for last assistant message */}
          {isAssistant && index === chat.messages.length - 1 && !isStreaming && (
            <div className="mt-2 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => chat.regenerate()}
                className="text-xs"
              >
                <RotateCw className="w-3 h-3 mr-1" />
                Regenerar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => chat.regenerate('shorter')}
                className="text-xs"
              >
                Más breve
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => chat.regenerate('creative')}
                className="text-xs"
              >
                Más creativo
              </Button>
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
            U
          </div>
        )}
      </div>
    );
  }, [chat.messages.length, isStreaming, chat.regenerate]);

  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="min-h-14 border-b bg-card px-2 sm:px-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div 
              className={`w-4 h-4 rounded-full ${
                isStreaming ? 'bg-amber-500' : chat.error ? 'bg-red-500' : DEMO_MODE ? 'bg-blue-500' : 'bg-green-500'
              }`}
              title={isStreaming ? 'Generando' : chat.error ? 'Error' : DEMO_MODE ? 'Modo Demo' : 'Listo'}
            />
            
            <h1 className="text-base font-medium">
              Chat Maestro
              {DEMO_MODE && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Demo</span>}
            </h1>
            
            {/* Thread info */}
            <div className="hidden lg:flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <GitBranch className="w-3 h-3 mr-1" />
                {threadTitle}
              </Badge>
              
              {/* Model and persona */}
              <Badge variant="secondary" className="text-xs">
                {chat.settings.model} • {chat.settings.persona}
              </Badge>
            </div>
            
            {/* Export/Share buttons */}
            <div className="hidden lg:flex items-center gap-1">
              <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-3 h-3 mr-1" />
                    Exportar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Exportar Conversación</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="md" id="md" />
                        <Label htmlFor="md">Markdown (.md)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pdf" id="pdf" />
                        <Label htmlFor="pdf">PDF</Label>
                      </div>
                    </RadioGroup>
                    <Button onClick={() => setShowExportDialog(false)}>
                      Exportar como {exportFormat.toUpperCase()}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share className="w-3 h-3 mr-1" />
                    Compartir
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Compartir Conversación</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <RadioGroup value={shareMode} onValueChange={setShareMode}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="readonly" id="readonly" />
                        <Label htmlFor="readonly">Solo lectura</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="collaborative" id="collaborative" />
                        <Label htmlFor="collaborative">Colaborativo</Label>
                      </div>
                    </RadioGroup>
                    <Button onClick={() => setShowShareDialog(false)}>
                      Generar enlace
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Right panel toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => chat.setRightPanelOpen(!chat.rightPanelOpen)}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${
              chat.rightPanelOpen ? 'rotate-180' : ''
            }`} />
          </Button>
        </div>

        {/* Settings Row - Mobile/Desktop adaptive */}
        <div className="border-b bg-card px-2 sm:px-4 py-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Model selector */}
            <div className="flex items-center gap-1">
              <Rocket className="w-3 h-3 text-muted-foreground" />
              <select 
                value={chat.settings.model}
                onChange={(e) => chat.setSettings({ model: e.target.value as any })}
                className="text-xs bg-transparent border-none outline-none"
              >
                <option value="gpt-5">GPT-5</option>
              </select>
            </div>

            {/* Persona selector */}
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-muted-foreground" />
              <select 
                value={chat.settings.persona}
                onChange={(e) => chat.setSettings({ persona: e.target.value as any })}
                className="text-xs bg-transparent border-none outline-none"
              >
                <option value="mentor">Mentor creativo</option>
                <option value="planner">Planificador estratégico</option>
                <option value="engineer">Ingeniero técnico</option>
              </select>
            </div>

            {/* Temperature */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Temp</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={chat.settings.temperature}
                onChange={(e) => chat.setSettings({ temperature: parseFloat(e.target.value) })}
                className="w-16"
              />
              <Badge variant="secondary" className="text-xs font-mono">
                {chat.settings.temperature.toFixed(2)}
              </Badge>
            </div>

            {/* Brand Guard Toggle */}
            <div className="flex items-center gap-2">
              <Badge 
                variant={chat.settings.brandGuard ? "default" : "secondary"}
                className="text-xs cursor-pointer"
                onClick={() => chat.setSettings({ brandGuard: !chat.settings.brandGuard })}
              >
                Brand Guard {chat.settings.brandGuard ? 'ON' : 'OFF'}
              </Badge>
              
              {/* Brand Guard Chip with current status */}
              {chat.settings.brandGuard && (
                <div className="flex items-center gap-1">
                  <BrandGuardChip
                    report={brandGuard.lastReport}
                    isAnalyzing={brandGuard.isAnalyzing}
                    onApplySuggestion={handleApplySuggestion}
                    size="sm"
                    showLabel={true}
                  />
                  
                  {brandGuard.lastReport?.findings && brandGuard.lastReport.findings.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBrandGuardPanel(!showBrandGuardPanel)}
                      className="h-6 px-1"
                    >
                      {showBrandGuardPanel ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Brand Guard Panel - expandible */}
        {showBrandGuardPanel && brandGuard.lastReport && (
          <div className="border-b bg-card">
            <div className="max-w-4xl mx-auto p-4">
              <BrandGuardPanel
                report={brandGuard.lastReport}
                isAnalyzing={brandGuard.isAnalyzing}
                onApplySuggestion={handleApplySuggestion}
                onClose={() => setShowBrandGuardPanel(false)}
              />
            </div>
          </div>
        )}

        {/* Timeline */}
        <div 
          ref={timelineRef}
          className="flex-1 overflow-y-auto p-2 sm:p-4"
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Error display */}
            {chat.error && (
              <div className="flex justify-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 max-w-md">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-red-800">{chat.error}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {chat.messages.map((message, index) => (
              <div key={message.id || `msg-${index}`}>
                {renderMessage(message, index)}
              </div>
            ))}
            
            {/* Streaming status */}
            {renderStreamingStatus()}
            
            {/* Welcome message when no messages */}
            {chat.messages.length === 0 && !isStreaming && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  ¡Bienvenido al Chat Maestro!
                  {DEMO_MODE && <span className="block text-sm text-blue-600 mt-1">Modo Demo Activo</span>}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  {DEMO_MODE 
                    ? "En modo demo puedes probar todas las funcionalidades del chat sin conexión al backend. Las respuestas son simuladas para demostrar el flujo de trabajo."
                    : "Soy tu asistente de IA especializado en creación de contenido. Puedo ayudarte con briefings, análisis de documentos, generación de ideas y mucho más."
                  }
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => chat.setComposerText('/brief Crear campaña de redes sociales para lanzamiento de producto')}
                  >
                    💡 Brief creativo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => chat.setComposerText('/tone Revisar este copy: "Tu mejor versión está a un click de distancia"')}
                  >
                    🎯 Tone check
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => chat.setComposerText('/web Últimas tendencias en marketing digital 2025')}
                  >
                    🌐 Búsqueda web
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t bg-card shadow-sm">
          <div className="max-w-4xl mx-auto p-2 sm:p-3 space-y-2">
            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                title="Adjuntar archivo"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                title="Grabar audio"
              >
                <Mic className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSlashMenu(!showSlashMenu)}
                className="flex items-center gap-1"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Comandos</span>
              </Button>

              {/* Quick commands */}
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSlashCommand('/brief ')}
                  className="text-xs"
                >
                  /brief
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSlashCommand('/tone ')}
                  className="text-xs"
                >
                  /tone
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSlashCommand('/web ')}
                  className="text-xs"
                >
                  /web
                </Button>
              </div>
            </div>

            {/* Input area */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={chat.composerText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje... Usa / para abrir comandos, Ctrl/⌘+Enter para enviar"
                className="resize-none min-h-[80px] max-h-[200px] pr-12"
                disabled={isStreaming}
              />
              
              <Button
                onClick={handleSend}
                disabled={!canSendMessage}
                size="sm"
                className="absolute bottom-2 right-2"
              >
                <Send className="w-4 h-4" />
              </Button>

              {/* Slash menu */}
              {showSlashMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-96 bg-popover border border-border rounded-xl shadow-lg z-50">
                  <div className="p-2 space-y-1">
                    {[
                      { cmd: '/brief', icon: ListChecks, title: 'Brief creativo', desc: 'Objetivo, audiencia, conceptos y ganchos' },
                      { cmd: '/tone', icon: BadgeCheck, title: 'Tone Check', desc: 'Verificación de tono de marca' },
                      { cmd: '/imgjson', icon: Image, title: 'Prompt JSON', desc: 'Generar JSON para imágenes' },
                      { cmd: '/web', icon: Globe, title: 'Búsqueda web', desc: 'Buscar información actualizada' },
                      { cmd: '/sum', icon: FileText, title: 'Resumir', desc: 'Resumir documento adjunto' }
                    ].map((item) => (
                      <Button
                        key={item.cmd}
                        variant="ghost"
                        className="w-full justify-start p-2.5 h-auto"
                        onClick={() => handleSlashCommand(`${item.cmd} `)}
                      >
                        <item.icon className="w-4 h-4 mr-3 text-muted-foreground" />
                        <div className="text-left">
                          <div className="text-sm font-medium">{item.cmd} — {item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.desc}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom status */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {DEMO_MODE && <span className="text-blue-600">Demo Mode</span>}
                {DEMO_MODE && <span>•</span>}
                
                {/* Brand Guard Status */}
                <BrandGuardChip
                  report={brandGuard.lastReport}
                  isAnalyzing={brandGuard.isAnalyzing}
                  onApplySuggestion={handleApplySuggestion}
                  size="sm"
                  showLabel={true}
                />
                
                <span>•</span>
                <span>{chat.composerText.length} caracteres</span>
                <span>•</span>
                <span>≈ {Math.ceil(chat.composerText.length / 4)} tokens</span>
              </div>
              
              <div className="flex items-center gap-2">
                {isStreaming && <span>Generando...</span>}
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘+Enter</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Templates & History */}
      {chat.rightPanelOpen && (
        <div className="w-80 border-l bg-card flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Biblioteca</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => chat.setRightPanelOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Plantillas rápidas</h3>
                <div className="space-y-2">
                  {[
                    'Brief para campaña de redes sociales',
                    'Análisis de competencia',
                    'Propuesta creativa',
                    'Plan de contenidos mensual'
                  ].map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => chat.setComposerText(`Ayúdame a crear: ${template}`)}
                    >
                      {template}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Historial</h3>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={chat.createNewThread}
                    className="w-full justify-start text-xs"
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Nuevo chat
                  </Button>
                  
                  {/* Mock history items */}
                  {[
                    'Campaña lanzamiento producto...',
                    'Análisis brief cliente ABC...',
                    'Propuesta naming marca...'
                  ].map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs text-muted-foreground"
                    >
                      <Clock className="w-3 h-3 mr-2" />
                      {item}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
