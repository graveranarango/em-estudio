import { Badge } from '@/components/ui/badge';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  edited?: boolean;
}

export function ChatBubble({ role, content, timestamp, edited }: ChatBubbleProps) {
  return (
    <div className={`flex gap-3 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {role !== 'user' && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          role === 'system' 
            ? 'bg-amber-100 text-amber-600'
            : 'bg-blue-100 text-blue-600'
        }`}>
          <Bot className="w-4 h-4" />
        </div>
      )}
      
      <div 
        className={`rounded-xl p-3 max-w-[80%] text-sm`}
        style={{
          backgroundColor: role === 'user' 
            ? 'var(--color-bubble-user)' 
            : role === 'system'
            ? 'var(--color-bubble-system)'
            : 'var(--color-bubble-assistant)',
          color: role === 'user' ? 'white' : 'inherit'
        }}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-xs opacity-70">{timestamp}</p>
          {edited && (
            <Badge variant="outline" className="text-xs py-0">
              Editado
            </Badge>
          )}
        </div>
      </div>
      
      {role === 'user' && (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white"
          style={{ backgroundColor: 'var(--color-bubble-user)' }}
        >
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
