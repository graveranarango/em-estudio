// Export Dialog Component for Chat Maestro
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Globe, 
  FileImage, 
  Download, 
  Copy, 
  Loader2,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { useExportShare } from '../../hooks/useExportShare';
import { ExportRequest } from '../../src/sdk/export';
import { Separator } from '../ui/separator';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
  threadTitle: string;
  messageCount: number;
  currentMessageId?: string;
  selectedMessageIds?: string[];
  authToken?: string;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  threadId,
  threadTitle,
  messageCount,
  currentMessageId,
  selectedMessageIds = [],
  authToken
}) => {
  const {
    exportConversation,
    downloadLastExport,
    copyExportToClipboard,
    isExporting,
    lastExport,
    exportError,
    clearErrors
  } = useExportShare(authToken);

  const [exportConfig, setExportConfig] = useState<{
    format: 'md' | 'html' | 'pdf';
    range: 'thread' | 'selection' | 'current';
    hideMeta: boolean;
    hideChips: boolean;
    maskPII: boolean;
  }>({
    format: 'md',
    range: selectedMessageIds.length > 0 ? 'selection' : 'thread',
    hideMeta: false,
    hideChips: false,
    maskPII: false
  });

  const formatIcons = {
    md: FileText,
    html: Globe,
    pdf: FileImage
  };

  const formatNames = {
    md: 'Markdown',
    html: 'HTML', 
    pdf: 'PDF'
  };

  const handleExport = async () => {
    clearErrors();
    
    const request: ExportRequest = {
      threadId,
      range: exportConfig.range,
      format: exportConfig.format,
      cleanup: {
        hideMeta: exportConfig.hideMeta,
        hideChips: exportConfig.hideChips,
        maskPII: exportConfig.maskPII
      },
      ...(exportConfig.range === 'current' && currentMessageId ? { messageId: currentMessageId } : {}),
      ...(exportConfig.range === 'selection' ? { selectionIds: selectedMessageIds } : {})
    };

    try {
      await exportConversation(request);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Export failed:', error);
    }
  };

  const getContentInfo = () => {
    switch (exportConfig.range) {
      case 'thread':
        return `${messageCount} mensajes completos`;
      case 'selection':
        return `${selectedMessageIds.length} mensajes seleccionados`;
      case 'current':
        return '1 mensaje actual';
      default:
        return '';
    }
  };

  const isRangeDisabled = (range: string) => {
    if (range === 'selection' && selectedMessageIds.length === 0) return true;
    if (range === 'current' && !currentMessageId) return true;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Conversación
          </DialogTitle>
          <DialogDescription>
            Exporta <strong>{threadTitle}</strong> en el formato que prefieras.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Formato</Label>
            <RadioGroup
              value={exportConfig.format}
              onValueChange={(value) => setExportConfig(prev => ({ ...prev, format: value as any }))}
              className="grid grid-cols-3 gap-3"
            >
              {Object.entries(formatNames).map(([format, name]) => {
                const Icon = formatIcons[format as keyof typeof formatIcons];
                return (
                  <div key={format} className="relative">
                    <RadioGroupItem
                      value={format}
                      id={format}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={format}
                      className="flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-accent/50 transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{name}</span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Range Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Contenido</Label>
            <RadioGroup
              value={exportConfig.range}
              onValueChange={(value) => setExportConfig(prev => ({ ...prev, range: value as any }))}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="thread" id="thread" />
                <Label htmlFor="thread" className="text-sm">
                  Conversación completa
                  <span className="text-muted-foreground ml-1">({messageCount} mensajes)</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="selection" 
                  id="selection" 
                  disabled={isRangeDisabled('selection')}
                />
                <Label 
                  htmlFor="selection" 
                  className={`text-sm ${isRangeDisabled('selection') ? 'text-muted-foreground' : ''}`}
                >
                  Mensajes seleccionados
                  <span className="text-muted-foreground ml-1">
                    ({selectedMessageIds.length} seleccionados)
                  </span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="current" 
                  id="current" 
                  disabled={isRangeDisabled('current')}
                />
                <Label 
                  htmlFor="current" 
                  className={`text-sm ${isRangeDisabled('current') ? 'text-muted-foreground' : ''}`}
                >
                  Mensaje actual
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Cleanup Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Opciones de limpieza</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hideMeta"
                  checked={exportConfig.hideMeta}
                  onCheckedChange={(checked) => 
                    setExportConfig(prev => ({ ...prev, hideMeta: !!checked }))}
                />
                <Label htmlFor="hideMeta" className="text-sm">
                  Ocultar metadatos (fechas, IDs)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hideChips"
                  checked={exportConfig.hideChips}
                  onCheckedChange={(checked) => 
                    setExportConfig(prev => ({ ...prev, hideChips: !!checked }))}
                />
                <Label htmlFor="hideChips" className="text-sm">
                  Ocultar chips de Brand Guard
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="maskPII"
                  checked={exportConfig.maskPII}
                  onCheckedChange={(checked) => 
                    setExportConfig(prev => ({ ...prev, maskPII: !!checked }))}
                />
                <Label htmlFor="maskPII" className="text-sm">
                  Enmascarar información personal (PII)
                </Label>
              </div>
            </div>
          </div>

          {/* Export Info */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">{formatNames[exportConfig.format]}</Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{getContentInfo()}</span>
            </div>
          </div>

          {/* Error Display */}
          {exportError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{exportError}</span>
              </div>
            </div>
          )}

          {/* Success Actions */}
          {lastExport && !isExporting && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span>Exportación completada: {lastExport.filename}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={downloadLastExport}
                  className="h-8"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Descargar
                </Button>
                {lastExport.content && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={copyExportToClipboard}
                    className="h-8"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting || isRangeDisabled(exportConfig.range)}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};