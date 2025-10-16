import React, { useState } from 'react';
import threadsSDK from '@/sdk/threads/index';
import { useChatStore } from '@/state/chatStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DebugMessagesPage() {
  const [text, setText] = useState('Hola desde Debug');
  const [busy, setBusy] = useState(false);

  const {
    threadId,
    branchId,
    messages,
    createNewThread,
    selectThread,
    loadHistory,
  } = useChatStore();

  const handleCreateThread = async () => {
    setBusy(true);
    try {
      await createNewThread('Debug Thread');
      await loadHistory();
    } finally {
      setBusy(false);
    }
  };

  const handleAddMessage = async () => {
    if (!threadId || !branchId) return;
    setBusy(true);
    try {
      await threadsSDK.addMessage(threadId, branchId, {
        role: 'user',
        parts: [{ type: 'text', value: text }],
        createdAt: new Date().toISOString(),
      });
      // refresh messages by re-selecting the thread
      await selectThread(threadId, branchId);
    } catch (e) {
      console.error('Add message error', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug: Mensajes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <div>Thread ID: <code>{threadId || '(none)'}</code></div>
            <div>Branch ID: <code>{branchId || '(none)'}</code></div>
            <div>Messages: <b>{messages.length}</b></div>
          </div>

          {!threadId && (
            <Button onClick={handleCreateThread} disabled={busy}>
              {busy ? 'Creando...' : 'Crear hilo de debug'}
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe un mensaje"
            />
            <Button onClick={handleAddMessage} disabled={!threadId || !branchId || busy}>
              {busy ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Usa el historial para crear/seleccionar hilos y ramas. Luego envía mensajes aquí.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

