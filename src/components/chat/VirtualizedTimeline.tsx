import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Message } from '@/types/chat';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { functionsUrl, FUNCTIONS_TOKEN } from '@/utils/backend';
import { ChevronDown } from 'lucide-react';

interface VirtualizedTimelineProps {
  messages: Message[];
  threadId: string;
  branchId: string;
  isLoading?: boolean;
  hasOlderMessages?: boolean;
  onLoadOlder: (threadId: string, branchId: string) => Promise<void>;
  onJumpToNewest: () => void;
  renderMessage: (message: Message, index: number) => React.ReactNode;
  className?: string;
}

const SKELETON_COUNT = 3;

export function VirtualizedTimeline({
  messages,
  threadId,
  branchId,
  isLoading = false,
  hasOlderMessages = false,
  onLoadOlder,
  onJumpToNewest,
  renderMessage,
  className = ""
}: VirtualizedTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Check if user is near bottom
  const checkScrollPosition = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const isNearBottom = distanceFromBottom < 100; // 100px threshold
      
      setIsAtBottom(isNearBottom);
      setShowJumpToBottom(!isNearBottom && messages.length > 5);
    }
  }, [messages.length]);

  // Auto-scroll to bottom for new messages (only if user is near bottom)
  useEffect(() => {
    if (containerRef.current && isAtBottom && messages.length > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length, isAtBottom]);

  const handleLoadOlder = useCallback(async () => {
    if (isLoadingOlder || !hasOlderMessages) return;
    
    setIsLoadingOlder(true);
    try {
      const startTime = performance.now();
      await onLoadOlder(threadId, branchId);
      
      // Emit performance metric
      const loadTime = performance.now() - startTime;
      if (window.performance && Math.random() < 0.15) { // 15% sampling
        // Send to telemetry
        fetch(functionsUrl('/api/events'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${FUNCTIONS_TOKEN}` },
          body: JSON.stringify({
            event: 'chat_load_older_messages',
            properties: {
              thread_id: threadId,
              branch_id: branchId,
              load_time_ms: loadTime,
              message_count: messages.length
            }
          })
        }).catch(() => {}); // Silent fail
      }
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [isLoadingOlder, hasOlderMessages, onLoadOlder, threadId, branchId, messages.length]);

  const handleJumpToNewest = useCallback(() => {
    const startTime = performance.now();
    
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    onJumpToNewest();

    // Emit performance metric
    const jumpTime = performance.now() - startTime;
    if (window.performance && Math.random() < 0.15) {
      fetch(functionsUrl('/api/events'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${FUNCTIONS_TOKEN}` },
        body: JSON.stringify({
          event: 'chat_jump_to_newest',
          properties: {
            thread_id: threadId,
            jump_time_ms: jumpTime,
            message_count: messages.length
          }
        })
      }).catch(() => {});
    }
  }, [onJumpToNewest, threadId, messages.length]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    
    checkScrollPosition();
    
    // Check if we're at the top and should load more
    if (scrollTop === 0 && hasOlderMessages && !isLoadingOlder) {
      handleLoadOlder();
    }
  }, [hasOlderMessages, isLoadingOlder, handleLoadOlder, checkScrollPosition]);

  // Performance monitoring
  useEffect(() => {
    if (Math.random() < 0.15) { // 15% sampling
      const startTime = performance.now();
      
      const measurePerformance = () => {
        const renderTime = performance.now() - startTime;
        
        fetch(functionsUrl('/api/events'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${FUNCTIONS_TOKEN}` },
          body: JSON.stringify({
            event: 'virtual_list_render',
            properties: {
              render_time_ms: renderTime,
              message_count: messages.length,
              is_loading: isLoading
            }
          })
        }).catch(() => {});
      };

      // Measure after next paint
      requestAnimationFrame(measurePerformance);
    }
  }, [messages.length, isLoading]);

  return (
    <div className={`relative flex flex-col h-full ${className}`} data-testid="virtual-timeline">
      {/* Loading older messages indicator */}
      {isLoadingOlder && (
        <div className="flex justify-center py-2 bg-muted/50">
          <div className="flex items-center gap-2">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full max-w-xs" />
            ))}
          </div>
        </div>
      )}

      {/* Messages container with basic scrolling */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {messages.length > 0 ? (
          <div className="space-y-2">
            {messages.map((message, index) => (
              <div key={message.id}>
                {renderMessage(message, index)}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p>No hay mensajes en esta conversación</p>
              <p>¡Empieza escribiendo algo!</p>
            </div>
          </div>
        )}
      </div>

      {/* Jump to bottom button */}
      {showJumpToBottom && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            onClick={handleJumpToNewest}
            className="h-10 w-10 rounded-full shadow-lg"
            size="icon"
            aria-label="Ir al final de la conversación"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* General loading state */}
      {isLoading && messages.length === 0 && (
        <div className="flex flex-col gap-4 p-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}
    </div>
  );
}

