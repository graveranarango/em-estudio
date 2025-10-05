import { Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { BrandGuardPanel } from './BrandGuardPanel';
import type { GuardReport } from '../../src/sdk/guard/types';

interface BrandGuardChipProps {
  report: GuardReport | null;
  isAnalyzing: boolean;
  onApplySuggestion?: (suggestedText: string) => void;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function BrandGuardChip({ 
  report, 
  isAnalyzing, 
  onApplySuggestion,
  size = 'sm',
  showLabel = true
}: BrandGuardChipProps) {
  const getChipVariant = () => {
    if (isAnalyzing) return 'secondary';
    if (!report) return 'outline';
    
    if (report.score >= 90) return 'default';
    if (report.score >= 70) return 'secondary';
    return 'destructive';
  };

  const getChipIcon = () => {
    if (isAnalyzing) {
      return <Loader2 className="h-3 w-3 animate-spin" />;
    }
    
    if (!report) {
      return <Shield className="h-3 w-3" />;
    }

    if (report.findings.some(f => f.severity === 'block' || f.severity === 'warn')) {
      return <AlertTriangle className="h-3 w-3" />;
    }
    
    return <CheckCircle className="h-3 w-3" />;
  };

  const getChipText = () => {
    if (isAnalyzing) return 'Analizando...';
    if (!report) return 'Brand Guard';
    
    if (report.findings.length === 0) {
      return showLabel ? `${report.score}/100` : `${report.score}`;
    }
    
    return showLabel 
      ? `${report.score}/100 (${report.findings.length})` 
      : `${report.score} (${report.findings.length})`;
  };

  // Don't show chip if no data and not analyzing
  if (!isAnalyzing && !report) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className={`h-6 px-2 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}
        >
          <Badge variant={getChipVariant()} className="flex items-center gap-1">
            {getChipIcon()}
            {showLabel && (
              <span className="font-medium">
                {getChipText()}
              </span>
            )}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        side="top"
      >
        <BrandGuardPanel
          report={report}
          isAnalyzing={isAnalyzing}
          onApplySuggestion={onApplySuggestion}
        />
      </PopoverContent>
    </Popover>
  );
}