import { useState, useCallback } from 'react';
import { brandGuardSDK, type GuardReport, type GuardFinding, type BrandKit } from '@/sdk/guard';
import { useBrandKit } from '@/contexts/BrandKitContext';

export interface BrandGuardState {
  isAnalyzing: boolean;
  lastReport: GuardReport | null;
  error: string | null;
  metrics: {
    totalChecks: number;
    averageScore: number;
    suggestionsApplied: number;
  };
}

export interface BrandGuardActions {
  checkUserMessage: (text: string, context?: { objective?: string; audience?: string }) => Promise<GuardReport>;
  checkAssistantMessage: (text: string, context?: { objective?: string; audience?: string }) => Promise<GuardReport>;
  applySuggestion: (originalText: string, suggestedText: string) => void;
  clearReport: () => void;
  getBrandKitForGuard: () => BrandKit | null;
}

export function useBrandGuard(): BrandGuardState & BrandGuardActions {
  const [state, setState] = useState<BrandGuardState>({
    isAnalyzing: false,
    lastReport: null,
    error: null,
    metrics: {
      totalChecks: 0,
      averageScore: 0,
      suggestionsApplied: 0
    }
  });

  const { brandKit } = useBrandKit();

  const getBrandKitForGuard = useCallback((): BrandKit | null => {
    if (!brandKit) {
      // Return default Brand Guard rules when no BrandKit is available
      return {
        tone: {
          do: ['profesional', 'claro', 'consistente', 'útil'],
          dont: ['agresivo', 'confuso', 'técnico excesivo', 'informal excesivo'],
          readingLevel: 'neutral'
        },
        lexicon: {
          preferred: ['solución', 'experiencia', 'innovación', 'calidad'],
          avoid: ['problema', 'fallo', 'error', 'imposible'],
          banned: ['spam', 'scam', 'fake', 'gratis!!!']
        },
        style: {
          emoji: false,
          exclamationMax: 1,
          linksPolicy: 'need-disclaimer'
        },
        claims: {
          allowed: ['Ofrecemos soluciones innovadoras', 'Experiencia comprobada'],
          forbidden: ['El mejor del mercado', '100% garantizado', 'Imposible de fallar'],
          needsDisclaimer: ['resultados pueden variar', 'sujeto a términos']
        },
        disclaimers: {
          standard: 'Esta información se proporciona solo con fines informativos.',
          legal: 'Consulte los términos y condiciones completos.'
        },
        locales: ['es']
      };
    }
    
    try {
      return brandGuardSDK.convertBrandKitToBrandGuard(brandKit);
    } catch (error) {
      console.warn('[Brand Guard] Failed to convert BrandKit:', error);
      return null;
    }
  }, [brandKit]);

  const updateMetrics = useCallback((report: GuardReport) => {
    setState(prev => {
      const newTotalChecks = prev.metrics.totalChecks + 1;
      const newAverageScore = ((prev.metrics.averageScore * prev.metrics.totalChecks) + report.score) / newTotalChecks;
      
      return {
        ...prev,
        metrics: {
          ...prev.metrics,
          totalChecks: newTotalChecks,
          averageScore: Math.round(newAverageScore)
        }
      };
    });
  }, []);

  const checkUserMessage = useCallback(async (
    text: string, 
    context?: { objective?: string; audience?: string }
  ): Promise<GuardReport> => {
    const guardBrandKit = getBrandKitForGuard();
    
    if (!guardBrandKit) {
      console.warn('[Brand Guard] No BrandKit available for analysis');
      return {
        score: 100,
        findings: [],
        disclaimerNeeded: false
      };
    }

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const response = await brandGuardSDK.preCheckUserMessage(text, guardBrandKit, context);
      const report = response.report;
      
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        lastReport: report,
        error: null 
      }));
      
      updateMetrics(report);
      
      // Log findings for development
      if (report.findings.length > 0) {
        console.log('[Brand Guard] User message findings:', report.findings);
      }
      
      return report;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error analyzing message';
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        error: errorMessage 
      }));
      
      // Return fallback report
      return {
        score: 75,
        findings: [{
          type: 'compliance',
          severity: 'info',
          message: 'Análisis de marca no disponible',
          suggestion: 'Revisa manualmente según directrices'
        }],
        disclaimerNeeded: false
      };
    }
  }, [getBrandKitForGuard, updateMetrics]);

  const checkAssistantMessage = useCallback(async (
    text: string, 
    context?: { objective?: string; audience?: string }
  ): Promise<GuardReport> => {
    const guardBrandKit = getBrandKitForGuard();
    
    if (!guardBrandKit) {
      return {
        score: 100,
        findings: [],
        disclaimerNeeded: false
      };
    }

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const response = await brandGuardSDK.postCheckAssistantMessage(text, guardBrandKit, context);
      const report = response.report;
      
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        lastReport: report,
        error: null 
      }));
      
      updateMetrics(report);
      
      // Log findings for development
      if (report.findings.length > 0) {
        console.log('[Brand Guard] Assistant message findings:', report.findings);
      }
      
      return report;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error analyzing message';
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        error: errorMessage 
      }));
      
      return {
        score: 75,
        findings: [],
        disclaimerNeeded: false
      };
    }
  }, [getBrandKitForGuard, updateMetrics]);

  const applySuggestion = useCallback((originalText: string, suggestedText: string) => {
    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        suggestionsApplied: prev.metrics.suggestionsApplied + 1
      }
    }));
    
    console.log('[Brand Guard] Applied suggestion:', { originalText, suggestedText });
  }, []);

  const clearReport = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      lastReport: null, 
      error: null 
    }));
  }, []);

  return {
    ...state,
    checkUserMessage,
    checkAssistantMessage,
    applySuggestion,
    clearReport,
    getBrandKitForGuard
  };
}
