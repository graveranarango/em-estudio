// Share Dialog Component for Chat Maestro
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Copy, 
  Eye, 
  MessageCircle, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  ExternalLink
} from 'lucide-react';
import { useExportShare } from '../../hooks/useExportShare';
import { ShareCreateRequest } from '@/sdk/export';
import { Separator } from '@/components/ui/separator';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
  threadTitle: string;
  messageCount: number;
  selectedMessageIds?: string[];
  authToken?: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onOpenChange,
  threadId,
  threadTitle,
  messageCount,
  selectedMessageIds = [],
  authToken
}) => {
  const {
    createShareLink,
    copyShareLink,
    revokeShareLink,
    isSharing,
    lastShare,
    shareError,
    clearErrors
  } = useExportShare(authToken);

  const [shareConfig, setShareConfig] = useState<{
    mode: 'readonly' | 'comments';
    scope: 'thread' | 'selection';
    expiresDays: number;
    hideUsernames: boolean;
    hideMeta: boolean;
    hideChips: boolean;
    maskPII: boolean;
  }>({
    mode: 'readonly',
    scope: selectedMessageIds.length > 0 ? 'selection' : 'thread',
    expiresDays: 7,
    hideUsernames: true,
    hideMeta: true,
    hideChips: true,
    maskPII: true
  });

  const [customDays, setCustomDays] = useState('7');

  const handleShare = async () => {
    clearErrors();
    
    const request: ShareCreateRequest = {
      threadId,
      mode: shareConfig.mode,
      scope: shareConfig.scope,
      expiresDays: shareConfig.expiresDays || undefined,
      hideUsernames: shareConfig.hideUsernames,
      cleanup: {
        hideMeta: shareConfig.hideMeta,
        hideChips: shareConfig.hideChips,
        maskPII: shareConfig.maskPII
      },
      ...(shareConfig.scope === 'selection' ? { selectionIds: selectedMessageIds } : {})
    };

    try {
      await createShareLink(request);
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleRevokeLink = async () => {
    if (!lastShare) return;
    
    try {
      // Extract ID from link or use token (simplified for demo)
      await revokeShareLink(lastShare.token);
    } catch (error) {
      console.error('Revoke failed:', error);
    }
  };

  const getContentInfo = () => {
    switch (shareConfig.scope) {
      case 'thread':
        return `${messageCount} mensajes completos`;
      case 'selection':
        return `${selectedMessageIds.length} mensajes seleccionados`;
      default:
        return '';
    }
  };

  const getExpirationText = () => {
    if (!shareConfig.expiresDays) return 'Sin expiración';
    return shareConfig.expiresDays === 1 ? '1 día' : `${shareConfig.expiresDays} días`;
  };

  const getExpirationDate = () => {
    if (!lastShare?.expires_at) return null;
    return new Date(lastShare.expires_at).toLocaleString();
  };

  const expirationOptions = [
    { value: 1, label: '1 día' },
    { value: 7, label: '1 semana' },
    { value: 30, label: '1 mes' },
    { value: 0, label: 'Sin expiración' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir Conversación
          </DialogTitle>
          <DialogDescription>
            Crea un enlace seguro para compartir <strong>{threadTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Modo de acceso</Label>
            <RadioGroup
              value={shareConfig.mode}
              onValueChange={(value) => setShareConfig(prev => ({ ...prev, mode: value as any }))}
              className="grid grid-cols-2 gap-3"
            >
              <div className="relative">
                <RadioGroupItem value="readonly" id="readonly" className="peer sr-only" />
                <Label
                  htmlFor="readonly"
                  className="flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-accent/50 transition-colors"
                >
                  <Eye className="h-5 w-5" />
                  <span className="text-xs font-medium">Solo lectura</span>
                </Label>
              </div>
              
              <div className="relative">
                <RadioGroupItem value="comments" id="comments" className="peer sr-only" />
                <Label
                  htmlFor="comments"
                  className="flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-accent/50 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Con comentarios</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Scope Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Contenido</Label>
            <RadioGroup
              value={shareConfig.scope}
              onValueChange={(value) => setShareConfig(prev => ({ ...prev, scope: value as any }))}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="thread" id="thread-share" />
                <Label htmlFor="thread-share" className="text-sm">
                  Conversación completa
                  <span className="text-muted-foreground ml-1">({messageCount} mensajes)</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="selection" 
                  id="selection-share"
                  disabled={selectedMessageIds.length === 0}
                />
                <Label 
                  htmlFor="selection-share" 
                  className={`text-sm ${selectedMessageIds.length === 0 ? 'text-muted-foreground' : ''}`}
                >
                  Mensajes seleccionados
                  <span className="text-muted-foreground ml-1">
                    ({selectedMessageIds.length} seleccionados)
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Expiration */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Expiración</Label>
            <RadioGroup
              value={shareConfig.expiresDays.toString()}
              onValueChange={(value) => {
                const days = parseInt(value);
                setShareConfig(prev => ({ ...prev, expiresDays: days }));
                setCustomDays(value);
              }}
              className="grid grid-cols-2 gap-2"
            >
              {expirationOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value.toString()} id={`expire-${option.value}`} />
                  <Label htmlFor={`expire-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Privacy Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Opciones de privacidad
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hideUsernames"
                  checked={shareConfig.hideUsernames}
                  onCheckedChange={(checked) => 
                    setShareConfig(prev => ({ ...prev, hideUsernames: !!checked }))}
                />
                <Label htmlFor="hideUsernames" className="text-sm">
                  Ocultar nombres de usuario
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hideMeta-share"
                  checked={shareConfig.hideMeta}
                  onCheckedChange={(checked) => 
                    setShareConfig(prev => ({ ...prev, hideMeta: !!checked }))}
                />
                <Label htmlFor="hideMeta-share" className="text-sm">
                  Ocultar metadatos internos
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hideChips-share"
                  checked={shareConfig.hideChips}
                  onCheckedChange={(checked) => 
                    setShareConfig(prev => ({ ...prev, hideChips: !!checked }))}
                />
                <Label htmlFor="hideChips-share" className="text-sm">
                  Ocultar alertas de Brand Guard
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="maskPII-share"
                  checked={shareConfig.maskPII}
                  onCheckedChange={(checked) => 
                    setShareConfig(prev => ({ ...prev, maskPII: !!checked }))}
                />
                <Label htmlFor="maskPII-share" className="text-sm">
                  Enmascarar información personal
                </Label>
              </div>
            </div>
          </div>

          {/* Share Info */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm mb-2">
              <Badge variant="outline">
                {shareConfig.mode === 'readonly' ? 'Solo lectura' : 'Con comentarios'}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{getContentInfo()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Expira en {getExpirationText()}</span>
            </div>
          </div>

          {/* Error Display */}
          {shareError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{shareError}</span>
              </div>
            </div>
          )}

          {/* Success Display */}
          {lastShare && !isSharing && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-green-700 mb-3">
                <CheckCircle className="h-4 w-4" />
                <span>Enlace creado exitosamente</span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white border rounded p-2">
                  <div className="text-xs text-muted-foreground mb-1">Enlace compartible:</div>
                  <div className="text-sm font-mono break-all">{lastShare.link}</div>
                </div>
                
                {getExpirationDate() && (
                  <div className="text-xs text-muted-foreground">
                    Expira el {getExpirationDate()}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={copyShareLink}
                    className="h-8"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar enlace
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(lastShare.link, '_blank')}
                    className="h-8"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Abrir
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={handleRevokeLink}
                    className="h-8"
                  >
                    Revocar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleShare}
            disabled={isSharing || (shareConfig.scope === 'selection' && selectedMessageIds.length === 0)}
          >
            {isSharing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Crear enlace
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
