// Componente de historial de hilos con soporte para branches
import { useState, useEffect } from 'react';
import { useThreads } from '@/hooks/useThreads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  MessageSquare, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  GitBranch,
  Calendar,
  Hash
} from 'lucide-react';
import { cn } from '@/components/ui/utils';

interface ThreadHistoryProps {
  className?: string;
}

export function ThreadHistory({ className }: ThreadHistoryProps) {
  const {
    threadId: currentThreadId,
    branchId: currentBranchId,
    history,
    branches,
    createThread,
    renameThread,
    deleteThread,
    selectThread,
    switchBranch,
    loadHistory,
    canDeleteCurrentBranch
  } = useThreads();

  // State para diálogos
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    threadId?: string;
    currentTitle?: string;
  }>({ open: false });
  const [newTitle, setNewTitle] = useState('');

  // Cargar historial al montar
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleCreateNewThread = async () => {
    await createThread();
  };

  const handleRenameThread = async (threadId: string, currentTitle?: string) => {
    setRenameDialog({ open: true, threadId, currentTitle });
    setNewTitle(currentTitle || '');
  };

  const handleConfirmRename = async () => {
    if (renameDialog.threadId && newTitle.trim()) {
      await renameThread(renameDialog.threadId, newTitle.trim());
      setRenameDialog({ open: false });
      setNewTitle('');
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este hilo? Esta acción no se puede deshacer.')) {
      await deleteThread(threadId);
    }
  };

  const handleSelectThread = async (threadId: string, branchId?: string) => {
    await selectThread(threadId, branchId);
  };

  const handleSwitchBranch = async (branchId: string) => {
    await switchBranch(branchId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header con botón crear */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Historial de Hilos</h3>
        <Button
          onClick={handleCreateNewThread}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </Button>
      </div>

      {/* Lista de hilos */}
      <div className="space-y-2">
        {history.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay hilos aún</p>
                <p className="text-sm">Crea tu primer hilo para comenzar</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          history.map((thread) => {
            const isCurrentThread = thread.id === currentThreadId;
            const currentBranch = isCurrentThread 
              ? branches.find(b => b.id === currentBranchId)
              : thread.branches.find(b => b.isDefault);

            return (
              <Card 
                key={thread.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-accent/50",
                  isCurrentThread && "ring-2 ring-primary bg-accent/30"
                )}
                onClick={() => handleSelectThread(thread.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium truncate">
                        {thread.title || 'Hilo sin título'}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(thread.updatedAt)}
                        <Hash className="w-3 h-3 ml-2" />
                        {thread.msgCount} mensajes
                      </div>
                    </div>
                    
                    {/* Menu de acciones */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameThread(thread.id, thread.title);
                          }}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Renombrar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteThread(thread.id);
                          }}
                          className="text-destructive"
                          disabled={isCurrentThread && !canDeleteCurrentBranch}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                {/* Branches del hilo */}
                {thread.branches.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <GitBranch className="w-3 h-3" />
                        Ramas ({thread.branches.length})
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {thread.branches.map((branch) => {
                          const isCurrentBranch = isCurrentThread && branch.id === currentBranchId;
                          
                          return (
                            <Badge
                              key={branch.id}
                              variant={isCurrentBranch ? "default" : "secondary"}
                              className={cn(
                                "text-xs cursor-pointer hover:bg-primary/20",
                                branch.isDefault && "border-primary/50",
                                isCurrentBranch && "bg-primary text-primary-foreground"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isCurrentThread) {
                                  handleSwitchBranch(branch.id);
                                } else {
                                  handleSelectThread(thread.id, branch.id);
                                }
                              }}
                            >
                              {branch.name}
                              {branch.isDefault && " ⚡"}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Diálogo de renombrar */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => setRenameDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar Hilo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nombre del hilo"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirmRename();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialog({ open: false })}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmRename}
              disabled={!newTitle.trim()}
            >
              Renombrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
