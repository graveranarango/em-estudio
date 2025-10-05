// Export & Share Action Buttons for Chat Maestro
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { 
  Download, 
  Share2, 
  Copy, 
  FileText, 
  Globe, 
  FileImage,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { ExportDialog } from './ExportDialog';
import { ShareDialog } from './ShareDialog';
import { useExportShare } from '../../hooks/useExportShare';
import { toast } from 'sonner@2.0.3';

interface ExportShareActionsProps {
  threadId: string;
  threadTitle: string;
  messageCount: number;
  currentMessageId?: string;
  selectedMessageIds?: string[];
  authToken?: string;
  variant?: 'buttons' | 'dropdown' | 'compact';
  className?: string;
}

export const ExportShareActions: React.FC<ExportShareActionsProps> = ({
  threadId,
  threadTitle,
  messageCount,
  currentMessageId,
  selectedMessageIds = [],
  authToken,
  variant = 'buttons',
  className = ''
}) => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  const { 
    exportCurrentMessage, 
    shareConversation, 
    isLoading 
  } = useExportShare(authToken);

  // Quick actions
  const handleQuickExportMarkdown = async () => {
    if (!currentMessageId) {
      toast.error('No hay mensaje actual para exportar');
      return;
    }
    
    try {
      const result = await exportCurrentMessage(threadId, currentMessageId, 'md');
      if (result.content) {
        await navigator.clipboard.writeText(result.content);
        toast.success('Mensaje copiado como Markdown');
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleQuickShare = async () => {
    try {
      const result = await shareConversation(threadId, {
        mode: 'readonly',
        expiresDays: 7,
        hideUsernames: true
      });
      
      if (result) {
        await navigator.clipboard.writeText(result.link);
        toast.success('Enlace de compartir copiado al portapapeles');
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center ${className}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={handleQuickExportMarkdown}
              disabled={!currentMessageId || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              Copiar mensaje
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
              <Download className="mr-2 h-4 w-4" />
              Exportar...
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleQuickShare}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              Compartir rápido
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
              <Share2 className="mr-2 h-4 w-4" />
              Compartir...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          threadId={threadId}
          threadTitle={threadTitle}
          messageCount={messageCount}
          currentMessageId={currentMessageId}
          selectedMessageIds={selectedMessageIds}
          authToken={authToken}
        />

        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          threadId={threadId}
          threadTitle={threadTitle}
          messageCount={messageCount}
          selectedMessageIds={selectedMessageIds}
          authToken={authToken}
        />
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`flex items-center ${className}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={handleQuickExportMarkdown}
              disabled={!currentMessageId || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Copiar como MD
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
              <FileText className="mr-2 h-4 w-4" />
              Markdown
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
              <Globe className="mr-2 h-4 w-4" />
              HTML
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
              <FileImage className="mr-2 h-4 w-4" />
              PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShareDialogOpen(true)}
          className="ml-2"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Compartir
        </Button>

        <ExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          threadId={threadId}
          threadTitle={threadTitle}
          messageCount={messageCount}
          currentMessageId={currentMessageId}
          selectedMessageIds={selectedMessageIds}
          authToken={authToken}
        />

        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          threadId={threadId}
          threadTitle={threadTitle}
          messageCount={messageCount}
          selectedMessageIds={selectedMessageIds}
          authToken={authToken}
        />
      </div>
    );
  }

  // Default 'buttons' variant
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setExportDialogOpen(true)}
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar
      </Button>

      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShareDialogOpen(true)}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Compartir
      </Button>

      {currentMessageId && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleQuickExportMarkdown}
          disabled={isLoading}
          title="Copiar mensaje actual como Markdown"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      )}

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        threadId={threadId}
        threadTitle={threadTitle}
        messageCount={messageCount}
        currentMessageId={currentMessageId}
        selectedMessageIds={selectedMessageIds}
        authToken={authToken}
      />

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        threadId={threadId}
        threadTitle={threadTitle}
        messageCount={messageCount}
        selectedMessageIds={selectedMessageIds}
        authToken={authToken}
      />
    </div>
  );
};