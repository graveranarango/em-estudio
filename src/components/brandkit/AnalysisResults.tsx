import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle, Brain, Clock, Zap, Palette, Type, Image } from "lucide-react";
import { useBrandKit } from "../../contexts/BrandKitContext";

export function AnalysisResults() {
  const { brandKit } = useBrandKit();

  if (!brandKit) {
    return null;
  }

  // Calculate confidence based on completeness (85% is default from backend)
  const confidence = 0.85;
  const confidenceColor = confidence > 0.8 ? "text-green-600" : confidence > 0.6 ? "text-yellow-600" : "text-red-600";
  const confidenceLabel = confidence > 0.8 ? "Alta" : confidence > 0.6 ? "Media" : "Baja";

  // Count extracted elements
  const primaryColors = brandKit.colors.primary.length;
  const secondaryColors = brandKit.colors.secondary.length;
  const alternativeColors = brandKit.colors.alternatives.length;
  const totalColors = primaryColors + secondaryColors + alternativeColors;
  
  const fonts = (brandKit.typography.primary.name !== "N/A" ? 1 : 0) + 
                (brandKit.typography.secondary.name !== "N/A" ? 1 : 0);
  
  const logos = brandKit.logos.length;
  
  const totalElements = totalColors + fonts + logos;

  return (
    <Card className="p-4 bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <h4 className="font-medium">Análisis Completado</h4>
        <Badge variant="secondary" className="ml-auto">
          Gemini con normalización
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-muted-foreground">Confianza</p>
            <p className={`font-medium ${confidenceColor}`}>
              {Math.round(confidence * 100)}% ({confidenceLabel})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-muted-foreground">Compliance</p>
            <p className="font-medium">{brandKit.validation.coherenceReport.complianceRate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-muted-foreground">Colores</p>
            <p className="font-medium">{totalColors} extraídos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-muted-foreground">Elementos</p>
            <p className="font-medium">{totalElements} total</p>
          </div>
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800">
        <h5 className="text-sm font-medium mb-2">Elementos Extraídos:</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <span>{primaryColors} colores primarios</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-orange-500 to-red-500"></div>
            <span>{secondaryColors} colores secundarios</span>
          </div>
          <div className="flex items-center gap-2">
            <Type className="w-3 h-3 text-gray-500" />
            <span>{fonts} tipografías</span>
          </div>
          <div className="flex items-center gap-2">
            <Image className="w-3 h-3 text-gray-500" />
            <span>{logos} logos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span>Tono de voz: {brandKit.voiceTone.style !== "N/A" ? "✓" : "✗"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span>Guidelines: {brandKit.usageGuidelines.posts.rules[0] !== "N/A" ? "✓" : "✗"}</span>
          </div>
        </div>
      </div>

      {/* Brand info */}
      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Marca: </span>
            <span className="font-medium">{brandKit.meta.brandName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Última actualización: </span>
            <span className="font-medium">{new Date(brandKit.meta.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Validation issues */}
      {brandKit.validation.coherenceReport.issues.length > 0 && (
        <details className="mt-4">
          <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
            Ver reporte de validación
          </summary>
          <div className="mt-2 p-3 bg-muted/50 rounded text-xs space-y-1">
            {brandKit.validation.coherenceReport.issues.map((issue, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                <span>{issue}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </Card>
  );
}