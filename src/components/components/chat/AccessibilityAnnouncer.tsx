import React, { useEffect, useRef, useState } from 'react';

interface AccessibilityAnnouncerProps {
  children?: React.ReactNode;
}

interface AnnouncementQueue {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
  timestamp: number;
}

let globalAnnouncer: {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
} | null = null;

// Global function to announce messages from anywhere in the app
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (globalAnnouncer) {
    globalAnnouncer.announce(message, priority);
  }
}

export function AccessibilityAnnouncer({ children }: AccessibilityAnnouncerProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementQueue[]>([]);
  const [currentPolite, setCurrentPolite] = useState('');
  const [currentAssertive, setCurrentAssertive] = useState('');
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement: AnnouncementQueue = {
      id: `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: message.trim(),
      priority,
      timestamp: Date.now()
    };

    if (!announcement.message) return;

    setAnnouncements(prev => [...prev, announcement]);
  };

  // Set up global announcer
  useEffect(() => {
    globalAnnouncer = { announce };
    return () => {
      globalAnnouncer = null;
    };
  }, []);

  // Process announcement queue
  useEffect(() => {
    if (announcements.length === 0) return;

    const processNext = () => {
      setAnnouncements(prev => {
        if (prev.length === 0) return prev;
        
        const [next, ...remaining] = prev;
        
        if (next.priority === 'assertive') {
          setCurrentAssertive(next.message);
          // Clear assertive after a delay to allow re-announcement of similar messages
          setTimeout(() => setCurrentAssertive(''), 100);
        } else {
          setCurrentPolite(next.message);
          // Clear polite after a delay
          setTimeout(() => setCurrentPolite(''), 100);
        }
        
        return remaining;
      });
    };

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Process immediately for assertive, with small delay for polite
    const delay = announcements[0].priority === 'assertive' ? 0 : 150;
    timeoutRef.current = setTimeout(processNext, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [announcements]);

  // Clean up old announcements to prevent memory leaks
  useEffect(() => {
    const cleanup = setInterval(() => {
      const cutoff = Date.now() - 30000; // Keep announcements for 30 seconds max
      setAnnouncements(prev => prev.filter(ann => ann.timestamp > cutoff));
    }, 10000);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <>
      {children}
      
      {/* ARIA Live Regions */}
      <div className="sr-only">
        <div
          ref={politeRef}
          aria-live="polite"
          aria-atomic="true"
          role="status"
          aria-label="Actualizaciones de la aplicación"
        >
          {currentPolite}
        </div>
        
        <div
          ref={assertiveRef}
          aria-live="assertive"
          aria-atomic="true"
          role="alert"
          aria-label="Notificaciones urgentes"
        >
          {currentAssertive}
        </div>
      </div>
    </>
  );
}

// Hook para usar el announcer desde componentes
export function useAccessibilityAnnouncer() {
  return {
    announce: announceToScreenReader,
    announcePolite: (message: string) => announceToScreenReader(message, 'polite'),
    announceUrgent: (message: string) => announceToScreenReader(message, 'assertive')
  };
}

// Pre-built announcement messages for common chat scenarios
export const ChatAnnouncements = {
  messageReceived: (senderName?: string) => 
    senderName ? `Nuevo mensaje de ${senderName}` : 'Nuevo mensaje recibido',
  
  messageSent: () => 
    'Mensaje enviado',
  
  typing: (senderName?: string) => 
    senderName ? `${senderName} está escribiendo` : 'Alguien está escribiendo',
  
  threadChanged: (threadName: string) => 
    `Cambiado a conversación: ${threadName}`,
  
  branchCreated: (branchName?: string) => 
    branchName ? `Nueva rama creada: ${branchName}` : 'Nueva rama creada',
  
  branchSwitched: (branchName?: string) => 
    branchName ? `Cambiado a rama: ${branchName}` : 'Cambiado a rama alternativa',
  
  exportStarted: (format: string) => 
    `Iniciando exportación en formato ${format}`,
  
  exportCompleted: (format: string) => 
    `Exportación completada en formato ${format}`,
  
  error: (message: string) => 
    `Error: ${message}`,
  
  loading: (action: string) => 
    `Cargando ${action}...`,
  
  loadingComplete: (action: string) => 
    `${action} cargado completamente`,
  
  panelOpened: (panelName: string) => 
    `Panel ${panelName} abierto`,
  
  panelClosed: (panelName: string) => 
    `Panel ${panelName} cerrado`,
  
  settingsChanged: (setting: string) => 
    `Configuración ${setting} actualizada`,
  
  messagesLoaded: (count: number) => 
    `${count} mensajes ${count === 1 ? 'cargado' : 'cargados'}`,
  
  searchResults: (count: number) => 
    count === 0 ? 'No se encontraron resultados' : 
    count === 1 ? 'Un resultado encontrado' : 
    `${count} resultados encontrados`,
  
  connectionLost: () => 
    'Conexión perdida. Intentando reconectar...',
  
  connectionRestored: () => 
    'Conexión restaurada',
  
  brandGuardTriggered: (issue: string) => 
    `Brand Guard detectó: ${issue}`,
  
  brandGuardResolved: () => 
    'Problema de Brand Guard resuelto'
};