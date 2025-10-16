// Shared Conversation View Component for Chat Maestro
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarContent, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  MessageSquare, 
  Clock, 
  Shield, 
  AlertCircle,
  User,
  Bot,
  Settings
} from 'lucide-react';
import { exportSDK, ShareGetResult } from '@/sdk/export';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface SharedConversationViewProps {
  token: string;
  className?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
  brandGuardFindings?: any[];
}

export const SharedConversationView: React.FC<SharedConversationViewProps> = ({
  token,
  className = ''
}) => {
  const [data, setData] = useState<ShareGetResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await exportSDK.getSharedContent(token);
        setData(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar el contenido compartido';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadSharedContent();
    }
  }, [token]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'assistant':
        return <Bot className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'user':
        return 'Usuario';
      case 'assistant':
        return 'Asistente';
      case 'system':
        return 'Sistema';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-blue-50 border-blue-200';
      case 'assistant':
        return 'bg-purple-50 border-purple-200';
      case 'system':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
        </Card>
        
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`max-w-4xl mx-auto p-6 ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`max-w-4xl mx-auto p-6 ${className}`}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se encontró contenido para mostrar.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{data.thread.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Vista compartida
                </Badge>
                <Badge variant="outline">
                  {data.messages.length} mensajes
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Privacy notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Shield className="h-4 w-4" />
              <span>
                Esta es una vista de solo lectura. El contenido ha sido filtrado para proteger información sensible.
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="space-y-4">
        {data.messages.map((message: Message, index) => (
          <Card key={message.id || index} className={getRoleColor(message.role)}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarContent>
                    {getRoleIcon(message.role)}
                  </AvatarContent>
                  <AvatarFallback>
                    {message.role === 'user' ? 'U' : message.role === 'assistant' ? 'A' : 'S'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {getRoleName(message.role)}
                      </span>
                      {!data.cleanup?.hideMeta && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                  
                  {/* Brand Guard Findings (if not hidden) */}
                  {!data.cleanup?.hideChips && message.brandGuardFindings?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-current/10">
                      <div className="text-xs font-medium text-orange-700 mb-2 flex items-center gap-1">
                        🛡️ Alertas de Brand Guard
                      </div>
                      <div className="space-y-1">
                        {message.brandGuardFindings.map((finding, findingIndex) => (
                          <div 
                            key={findingIndex}
                            className={`text-xs p-2 rounded ${
                              finding.severity === 'high' ? 'bg-red-100 text-red-700' :
                              finding.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}
                          >
                            <strong>{finding.severity}:</strong> {finding.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4" />
              <span>Conversación compartida desde AI Content Studio</span>
            </div>
            <div>
              Esta vista contiene {data.messages.length} mensajes y ha sido filtrada para proteger información sensible.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
