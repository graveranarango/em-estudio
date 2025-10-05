import { useRef, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { ConflictCard } from './ConflictCard';
import { PatchNote } from './PatchNote';
import { ChatBubble } from './ChatBubble';
import { Bot, User, AlertTriangle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    edited?: boolean;
  };
}

interface ChatTimelineProps {
  messages: Message[];
  isTyping: boolean;
}

export function ChatTimeline({ messages, isTyping }: ChatTimelineProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4 pb-4">
        {/* Example messages for D3 design */}
        <ChatBubble 
          role="assistant"
          content="Para definir el brief, confirmar: Objetivo, Audiencia, Oferta, Formato y CTA."
          timestamp="10:26"
        />

        <ChatBubble 
          role="user"
          content="Objetivo: aumentar ventas del nuevo plan PRO este mes."
          timestamp="10:27"
        />

        {/* PatchNote-1 */}
        <PatchNote 
          content={`{ "objective": "Aumentar ventas del plan PRO en 30 días" }`}
        />

        <ChatBubble 
          role="assistant"
          content="¿Plataformas principales y el público primario?"
          timestamp="10:28"
        />

        <ChatBubble 
          role="user"
          content="Instagram y TikTok; público 18–30 que busca ofertas."
          timestamp="10:29"
        />

        {/* PatchNote-2 */}
        <PatchNote 
          content={`{ "post.platforms": ["Instagram","TikTok"], "audience.primary": "18–30 cazadores de ofertas" }`}
        />

        <ChatBubble 
          role="assistant"
          content="¿Qué acción quieres que tomen los usuarios? Define el call-to-action principal."
          timestamp="10:30"
        />

        <ChatBubble 
          role="user"
          content="Quiero que 'Compren ahora' con urgencia. Es una promoción limitada."
          timestamp="10:31"
        />

        {/* PatchNote-3 */}
        <PatchNote 
          content={`{ "cta.primary": "Compra ahora", "cta.urgency": true, "offer.type": "promoción limitada" }`}
        />

        {/* Conflict/FieldCard 1 */}
        <ConflictCard 
          fieldName="post.cta"
          currentValue={`"Compra ahora"`}
          suggestedValue={`"Pruébalo hoy"`}
          colorVariant="amber"
          onMaintain={() => console.log('Mantener CTA')}
          onReplace={() => console.log('Reemplazar CTA')}
          onMerge={() => console.log('Fusionar CTA')}
        />

        {/* Conflict/FieldCard 2 */}
        <ConflictCard 
          fieldName="audience.age"
          currentValue={`"18-30"`}
          suggestedValue={`"25-35"`}
          colorVariant="orange"
          onMaintain={() => console.log('Mantener Age')}
          onReplace={() => console.log('Reemplazar Age')}
          onMerge={() => console.log('Fusionar Age')}
        />

        {/* Additional conversation */}
        <ChatBubble 
          role="assistant"
          content="Perfecto. ¿Cuál es el formato de post que prefieres? ¿Single, carousel o story?"
          timestamp="10:32"
        />

        <ChatBubble 
          role="user"
          content="Quiero hacer un carousel de 3 slides para explicar mejor el producto."
          timestamp="10:33"
        />

        {/* PatchNote-4 */}
        <PatchNote 
          content={`{ "format.type": "carousel", "format.slides": 3, "format.narrative": "explicativo" }`}
        />

        <ChatBubble 
          role="assistant"
          content="Excelente. Con esa información tengo todo lo necesario para generar el brief completo. ¿Procedemos con la generación?"
          timestamp="10:34"
        />

        <ChatBubble 
          role="user"
          content="Sí, genera el post por favor."
          timestamp="10:35"
        />

        {/* Final patch with complete brief */}
        <PatchNote 
          content={`{ 
  "status": "brief_completed",
  "generated_at": "2024-01-15T10:35:00Z",
  "total_fields": 8,
  "conflicts_resolved": 2
}`}
          badge="brief completado"
        />

        {/* Existing dynamic messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role !== 'user' && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'system' 
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                <Bot className="w-4 h-4" />
              </div>
            )}
            
            <div className={`rounded-lg p-3 max-w-[80%] ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : message.role === 'system'
                ? 'bg-amber-50 border border-amber-200 text-amber-800'
                : 'bg-muted'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs opacity-70">
                  {typeof message.timestamp === 'string' 
                    ? new Date(message.timestamp).toLocaleTimeString()
                    : message.timestamp.toLocaleTimeString()}
                </p>
                {message.metadata?.edited && (
                  <Badge variant="outline" className="text-xs py-0">
                    Editado
                  </Badge>
                )}
              </div>
            </div>
            
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}