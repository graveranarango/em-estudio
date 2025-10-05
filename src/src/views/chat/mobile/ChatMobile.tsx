import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useChatStore } from '../../../state/chatStore';
import { VirtualizedTimeline } from '../../../components/chat/VirtualizedTimeline';
import { AccessibilityAnnouncer, ChatAnnouncements, useAccessibilityAnnouncer } from '../../../components/chat/AccessibilityAnnouncer';
import { BranchToolbar } from '../../../../components/chat/BranchToolbar';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../../../components/ui/sheet';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Separator } from '../../../../components/ui/separator';
import { Menu, Send, Library, Settings, Brain, Palette, Volume2, MessageSquare, Calendar, Video, Podcast, Image, History } from 'lucide-react';
import { useBrandKit } from '../../../../contexts/BrandKitContext';
import { Message } from '../../../../types/chat';

interface ChatMobileProps {
  className?: string;
}

const MOBILE_BREAKPOINT = 768;

// Message renderer for virtualized timeline
const MessageRenderer = ({ message, index }: { message: Message; index: number }) => {
  const brandKit = useBrandKit();
  const brandColors = brandKit?.brandKit?.colors;
  const isUser = message.role === 'user';
  const content = message.parts?.[0]?.value || '';
  const isStreaming = message.meta?.streaming;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} p-4`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? `text-white shadow-md`
            : 'bg-muted text-foreground border'
        }`}
        style={
          isUser && brandColors?.primary?.[0]
            ? { backgroundColor: brandColors.primary[0] }
            : undefined
        }
      >
        <div className="space-y-2">
          <p className="whitespace-pre-wrap break-words">{content}</p>
          
          {/* Streaming indicator */}
          {isStreaming && (
            <div className="flex items-center gap-1 text-xs opacity-70">
              <div className="flex space-x-1">
                <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
              <span>Escribiendo...</span>
            </div>
          )}
          
          {/* Tools used */}
          {message.meta?.tools && message.meta.tools.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {message.meta.tools.map((tool, toolIndex) => (
                <Badge key={toolIndex} variant="secondary" className="text-xs">
                  {tool.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function ChatMobile({ className = "" }: ChatMobileProps) {
  const store = useChatStore();
  
  const {
    messages = [],
    threadId = '',
    branchId = '',
    rightPanelOpen = false,
    composerText = '',
    streaming = { status: 'idle' },
    mobileKeyboardOpen = false,
    isMobileView = false,
    branches = [],
    pushUserMessage = () => {},
    setRightPanelOpen = () => {},
    setComposerText = () => {},
    setMobileKeyboardOpen = () => {},
    setIsMobileView = () => {}
  } = store;

  const { announce } = useAccessibilityAnnouncer() || { announce: () => {} };
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(true); // Mock for demo
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobileView(isMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobileView]);

  // Keyboard handling for mobile
  useEffect(() => {
    if (!isMobileView) return;

    const handleViewportChange = () => {
      const viewport = window.visualViewport;
      if (viewport) {
        const keyboardOpen = viewport.height < window.innerHeight * 0.75;
        const currentKeyboardHeight = window.innerHeight - viewport.height;
        
        setMobileKeyboardOpen(keyboardOpen);
        setKeyboardHeight(keyboardOpen ? currentKeyboardHeight : 0);
        
        // Announce keyboard state for accessibility
        if (keyboardOpen !== mobileKeyboardOpen) {
          announce(keyboardOpen ? 'Teclado abierto' : 'Teclado cerrado');
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => window.visualViewport?.removeEventListener('resize', handleViewportChange);
    }
  }, [isMobileView, mobileKeyboardOpen, setMobileKeyboardOpen, announce]);

  // Performance monitoring
  useEffect(() => {
    if (Math.random() < 0.15) { // 15% sampling
      const startTime = performance.now();
      
      const measurePerformance = () => {
        const renderTime = performance.now() - startTime;
        
        fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'chat_mobile_render',
            properties: {
              render_time_ms: renderTime,
              message_count: messages.length,
              is_keyboard_open: mobileKeyboardOpen,
              is_streaming: streaming.status !== 'idle'
            }
          })
        }).catch(() => {});
      };

      // Measure after next paint
      requestAnimationFrame(measurePerformance);
    }
  }, [messages.length, mobileKeyboardOpen, streaming.status]);

  const handleSendMessage = useCallback(async () => {
    if (!composerText.trim() || streaming.status !== 'idle') return;

    const startTime = performance.now();
    const messageText = composerText.trim();
    
    // Send message
    pushUserMessage(messageText);
    
    // Announce message sent
    announce(ChatAnnouncements.messageSent());
    
    // Blur composer to hide mobile keyboard
    if (composerRef.current) {
      composerRef.current.blur();
    }

    // Emit TTFT metric start
    if (Math.random() < 0.15) {
      performance.mark('chat-ttft-start');
      
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'chat_message_sent',
          properties: {
            thread_id: threadId,
            branch_id: branchId,
            message_length: messageText.length,
            send_time_ms: performance.now() - startTime,
            is_mobile: isMobileView
          }
        })
      }).catch(() => {});
    }

    // TODO: Start streaming request to backend
    console.log(`[ChatMobile] Sending message: ${messageText.substring(0, 50)}...`);
    
  }, [composerText, streaming.status, pushUserMessage, announce, threadId, branchId, isMobileView]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleLoadOlder = useCallback(async (threadId: string, branchId: string) => {
    // Mock loading older messages
    console.log(`[ChatMobile] Loading older messages for thread ${threadId}, branch ${branchId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    announce(ChatAnnouncements.messagesLoaded(10));
  }, [announce]);

  const handleJumpToNewest = useCallback(() => {
    announce('Saltando a los mensajes más recientes');
  }, [announce]);

  const currentBranch = branches.find(b => b.id === branchId);

  // Mobile sidebar content
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <SheetHeader className="px-6 py-4">
        <SheetTitle className="text-left">Biblioteca</SheetTitle>
      </SheetHeader>
      
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="mb-3">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-12 flex flex-col gap-1">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">Nueva Conversación</span>
              </Button>
              <Button variant="outline" size="sm" className="h-12 flex flex-col gap-1">
                <History className="h-4 w-4" />
                <span className="text-xs">Historial</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Módulos */}
          <div>
            <h3 className="mb-3">Módulos</h3>
            <div className="space-y-2">
              {[
                { icon: Brain, label: 'Chat Maestro', active: true },
                { icon: Image, label: 'Posts', active: false },
                { icon: Video, label: 'Videos', active: false },
                { icon: Podcast, label: 'Podcasts', active: false },
                { icon: Calendar, label: 'Calendar', active: false },
                { icon: Palette, label: 'BrandKit', active: false }
              ].map(({ icon: Icon, label, active }) => (
                <Button
                  key={label}
                  variant={active ? "default" : "ghost"}
                  className="w-full justify-start h-10"
                  size="sm"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <div>
            <h3 className="mb-3">Configuración</h3>
            <Button variant="ghost" className="w-full justify-start h-10" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Preferencias
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  if (!isMobileView) {
    return <div className="hidden" />; // Don't render on desktop
  }

  return (
    <AccessibilityAnnouncer>
      <div className={`h-screen flex flex-col bg-background ${className}`}>
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle */}
            <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Abrir biblioteca"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            
            <div className="flex flex-col">
              <h1 className="font-medium">Chat Maestro</h1>
              {currentBranch && (
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {currentBranch.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Configuración">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Branch Toolbar for mobile */}
        {branches.length > 0 && (
          <div className="border-b bg-card px-4 py-2">
            <BranchToolbar
              threadId={threadId}
              currentBranchId={branchId}
              branches={branches}
              compact={true}
            />
          </div>
        )}

        {/* Chat Timeline */}
        <div 
          className="flex-1 relative"
          style={{
            marginBottom: mobileKeyboardOpen ? `${keyboardHeight}px` : '0'
          }}
        >
          <VirtualizedTimeline
            messages={messages}
            threadId={threadId}
            branchId={branchId || ''}
            hasOlderMessages={hasOlderMessages}
            onLoadOlder={handleLoadOlder}
            onJumpToNewest={handleJumpToNewest}
            renderMessage={(message, index) => <MessageRenderer message={message} index={index} />}
            className="h-full"
          />
        </div>

        {/* Mobile Composer */}
        <div 
          className={`border-t bg-card transition-all duration-200 ${
            mobileKeyboardOpen ? 'fixed bottom-0 left-0 right-0 z-50' : ''
          }`}
          style={{
            paddingBottom: mobileKeyboardOpen ? 'env(keyboard-inset-height, 0px)' : '0'
          }}
        >
          <div className="p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Textarea
                  ref={composerRef}
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setIsComposerFocused(true)}
                  onBlur={() => setIsComposerFocused(false)}
                  placeholder="Escribe tu mensaje... (⌘/Ctrl + Enter para enviar)"
                  className="min-h-[44px] max-h-[120px] resize-none bg-input-background border-border"
                  disabled={streaming.status !== 'idle'}
                  aria-label="Escribir mensaje"
                />
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={!composerText.trim() || streaming.status !== 'idle'}
                size="icon"
                className="h-11 w-11 shrink-0"
                aria-label="Enviar mensaje"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile typing indicator */}
            {streaming.status !== 'idle' && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                  <div className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
                <span>
                  {streaming.status === 'thinking' && 'Pensando...'}
                  {streaming.status === 'streaming' && 'Escribiendo...'}
                  {streaming.status === 'error' && 'Error al procesar'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AccessibilityAnnouncer>
  );
}

export default ChatMobile;