import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Palette,
  Type,
  ImageIcon
} from "lucide-react";

interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    category: string;
    message: string;
  }>;
  suggestions: string[];
}

interface BrandValidationProps {
  brandKitData: any;
  onValidationComplete?: (result: ValidationResult) => void;
}

export function BrandValidation({ brandKitData, onValidationComplete }: BrandValidationProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateBrandKit = () => {
    setIsValidating(true);
    
    // Simular validación asíncrona
    setTimeout(() => {
      const result = performValidation(brandKitData);
      setValidation(result);
      setIsValidating(false);
      onValidationComplete?.(result);
    }, 1500);
  };

  const performValidation = (data: any): ValidationResult => {
    const issues: ValidationResult['issues'] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Validar colores
    if (!data.colors || data.colors.length === 0) {
      issues.push({
        type: 'error',
        category: 'Colores',
        message: 'No se encontraron colores en el manual de marca'
      });
      score -= 25;
    } else if (data.colors.length < 3) {
      issues.push({
        type: 'warning',
        category: 'Colores',
        message: 'Se recomienda tener al menos 3 colores en la paleta'
      });
      score -= 10;
      suggestions.push('Agregar más colores secundarios y de apoyo');
    }

    // Validar HEX codes
    data.colors?.forEach((color: any, index: number) => {
      if (!color.hex || !/^#[0-9A-Fa-f]{6}$/.test(color.hex)) {
        issues.push({
          type: 'error',
          category: 'Colores',
          message: `Color ${index + 1} tiene un código HEX inválido: ${color.hex}`
        });
        score -= 5;
      }
    });

    // Validar tipografías
    if (!data.typography || data.typography.length === 0) {
      issues.push({
        type: 'warning',
        category: 'Tipografía',
        message: 'No se encontraron tipografías definidas'
      });
      score -= 15;
      suggestions.push('Definir al menos una tipografía principal');
    }

    // Validar logos
    if (!data.logos || data.logos.length === 0) {
      issues.push({
        type: 'warning',
        category: 'Logos',
        message: 'No se encontraron logos en el manual'
      });
      score -= 15;
      suggestions.push('Subir las versiones oficiales del logo');
    }

    // Validar tono de voz
    if (!data.voiceTone?.personality || !data.voiceTone?.tone) {
      issues.push({
        type: 'info',
        category: 'Tono de Voz',
        message: 'El tono de voz no está completamente definido'
      });
      score -= 10;
      suggestions.push('Completar la definición del tono de voz de la marca');
    }

    // Validar reglas de uso
    if (!data.usageRules?.dos?.length && !data.usageRules?.donts?.length) {
      issues.push({
        type: 'info',
        category: 'Reglas',
        message: 'No se definieron reglas de uso específicas'
      });
      score -= 10;
      suggestions.push('Agregar reglas claras sobre el uso correcto de la marca');
    }

    // Verificar completitud general
    const completedSections = [
      data.colors?.length > 0,
      data.typography?.length > 0,
      data.logos?.length > 0,
      data.voiceTone?.personality,
      data.usageRules?.dos?.length > 0 || data.usageRules?.donts?.length > 0
    ].filter(Boolean).length;

    if (completedSections >= 4) {
      suggestions.push('¡Excelente! Tu BrandKit está casi completo');
    } else if (completedSections >= 2) {
      suggestions.push('Continúa completando las secciones restantes para un BrandKit más robusto');
    }

    return {
      isValid: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions
    };
  };

  useEffect(() => {
    if (brandKitData && Object.keys(brandKitData).length > 0) {
      validateBrandKit();
    }
  }, [brandKitData]);

  if (!validation && !isValidating) {
    return (
      <Card className="p-6 text-center">
        <Button onClick={validateBrandKit} variant="outline">
          <CheckCircle className="w-4 h-4 mr-2" />
          Validar BrandKit
        </Button>
      </Card>
    );
  }

  if (isValidating) {
    return (
      <Card className="p-6 text-center">
        <RefreshCw className="w-6 h-6 mx-auto mb-3 animate-spin text-blue-500" />
        <p>Validando elementos del BrandKit...</p>
      </Card>
    );
  }

  if (!validation) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3>Validación del BrandKit</h3>
        <div className="flex items-center gap-3">
          <Badge className={`${getScoreColor(validation.score)} border-none`}>
            Puntuación: {validation.score}/100
          </Badge>
          <Button onClick={validateBrandKit} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Re-validar
          </Button>
        </div>
      </div>

      {/* Estado general */}
      <Alert className={`mb-6 ${validation.isValid ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <AlertDescription className="flex items-center gap-2">
          {validation.isValid ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-800">
                ¡Tu BrandKit está validado y listo para usar en todos los módulos!
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-yellow-800">
                Tu BrandKit necesita algunas mejoras antes de estar completamente funcional.
              </span>
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Issues */}
      {validation.issues.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3">Problemas Detectados</h4>
          <div className="space-y-2">
            {validation.issues.map((issue, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded bg-muted/30">
                {getIssueIcon(issue.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {issue.category}
                    </Badge>
                  </div>
                  <p className="text-sm">{issue.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {validation.suggestions.length > 0 && (
        <div>
          <h4 className="mb-3">Sugerencias de Mejora</h4>
          <div className="space-y-2">
            {validation.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded bg-blue-50/50">
                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                <p className="text-sm">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}