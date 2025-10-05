import { AlertTriangle, CheckCircle, Info, X, Zap } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import type { GuardReport, GuardFinding } from '../../src/sdk/guard/types';

interface BrandGuardPanelProps {
  report: GuardReport | null;
  isAnalyzing: boolean;
  onApplySuggestion?: (suggestedText: string) => void;
  onClose?: () => void;
  className?: string;
}

export function BrandGuardPanel({ 
  report, 
  isAnalyzing, 
  onApplySuggestion, 
  onClose,
  className = ""
}: BrandGuardPanelProps) {
  if (isAnalyzing) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Brand Guard
            </CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            Analizando conformidad con directrices de marca...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return null;
  }

  const getSeverityIcon = (severity: GuardFinding['severity']) => {
    switch (severity) {
      case 'block':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: GuardFinding['severity']) => {
    switch (severity) {
      case 'block':
        return 'destructive';
      case 'warn':
        return 'secondary';
      case 'info':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excelente';
    if (score >= 70) return 'Bueno';
    if (score >= 50) return 'Mejorable';
    return 'Requiere atención';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            Brand Guard
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className={`font-medium ${getScoreColor(report.score)}`}>
              {report.score}/100
            </span>
            <span className="text-sm text-muted-foreground">
              ({getScoreLabel(report.score)})
            </span>
          </div>
          {report.findings.length > 0 && (
            <Badge variant="secondary">
              {report.findings.length} finding{report.findings.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {report.findings.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>¡Perfecto! El contenido cumple con todas las directrices de marca.</p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-60">
              <div className="space-y-3">
                {report.findings.map((finding, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-2">
                      {getSeverityIcon(finding.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getSeverityColor(finding.severity)} className="text-xs">
                            {finding.type}
                          </Badge>
                          <span className="text-sm capitalize text-muted-foreground">
                            {finding.severity}
                          </span>
                        </div>
                        <p className="text-sm">{finding.message}</p>
                        {finding.suggestion && (
                          <p className="text-xs text-muted-foreground mt-1">
                            💡 {finding.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                    {index < report.findings.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {report.suggestedText && onApplySuggestion && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Texto sugerido:</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">{report.suggestedText}</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => onApplySuggestion(report.suggestedText!)}
                    className="w-full"
                  >
                    Aplicar sugerencia
                  </Button>
                </div>
              </>
            )}

            {report.disclaimerNeeded && report.disclaimerText && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    Disclaimer requerido:
                  </h4>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                    <p className="text-xs text-yellow-800">{report.disclaimerText}</p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}