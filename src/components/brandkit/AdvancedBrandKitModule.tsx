import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import {
  Upload,
  Save,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Palette,
  Type,
  Image,
  MessageCircle,
  Book,
  Settings,
  Eye,
  Shield
} from "lucide-react";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { EnhancedUploader } from "./EnhancedUploader";
import { ColorPaletteAdvanced } from "./ColorPaletteAdvanced";
import { TypographyAdvanced } from "./TypographyAdvanced";
import { LogosAdvanced } from "./LogosAdvanced";
import { VoiceToneAdvanced } from "./VoiceToneAdvanced";
import { MessagingSection } from "./MessagingSection";
import { StorytellingSection } from "./StorytellingSection";
import { ApplicationGuidelines } from "./ApplicationGuidelines";
import { UsageExamplesSection } from "./UsageExamplesSection";
import { AccessibilitySection } from "./AccessibilitySection";
import { BrandKitOverview } from "./BrandKitOverview";
import { AdvancedElementsSection } from "./AdvancedElementsSection";
import { ValidationReport } from "./ValidationReport";
import BrandKitTestComponent from "./BrandKitTestComponent";

const AdvancedBrandKitModule: React.FC = () => {
  const { 
    brandKit, 
    isLoading, 
    isAnalyzing, 
    error, 
    lastUpdated, 
    hasBrandKit, 
    updateBrandKit,
    getBrandCompliance 
  } = useBrandKit();
  
  const [activeTab, setActiveTab] = useState("overview");
  const compliance = getBrandCompliance();

  const handleSave = async () => {
    if (brandKit) {
      await updateBrandKit({
        metadata: {
          ...brandKit.metadata,
          updatedAt: new Date()
        }
      });
    }
  };

  const handleExport = () => {
    if (brandKit) {
      const dataStr = JSON.stringify(brandKit, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `brandkit-${brandKit.id}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'overview': return Eye;
      case 'upload': return Upload;
      case 'colors': return Palette;
      case 'typography': return Type;
      case 'logos': return Image;
      case 'voice': return MessageCircle;
      case 'messaging': return FileText;
      case 'storytelling': return Book;
      case 'guidelines': return Settings;
      case 'examples': return CheckCircle;
      case 'advanced': return Settings;
      case 'validation': return Shield;
      case 'accessibility': return Shield;
      case 'test': return Settings;
      default: return FileText;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getComplianceLabel = (score: number) => {
    if (score >= 90) return "Excelente";
    if (score >= 80) return "Muy Bueno";
    if (score >= 60) return "Bueno";
    if (score >= 40) return "Regular";
    return "Incompleto";
  };

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Analizando Manual de Marca</h3>
            <p className="text-muted-foreground">
              Nuestra IA está extrayendo los elementos de tu BrandKit...
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <Progress value={75} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Procesando colores, tipografías y elementos visuales
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasBrandKit) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto flex items-center justify-center">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">Crea tu BrandKit con IA</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Sube tu manual de marca y nuestra IA extraerá automáticamente todos los elementos: 
              colores, tipografías, logos, tono de voz y reglas de uso.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="max-w-3xl mx-auto">
          <EnhancedUploader />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold mb-2">Extracción Automática</h3>
            <p className="text-sm text-muted-foreground">
              Soporta PDF, DOCX e imágenes. La IA analiza y extrae todos los elementos de marca automáticamente.
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold mb-2">Completado Inteligente</h3>
            <p className="text-sm text-muted-foreground">
              La IA infiere elementos faltantes y genera propuestas coherentes con tu estilo de marca.
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">Totalmente Editable</h3>
            <p className="text-sm text-muted-foreground">
              Revisa, ajusta y personaliza cada elemento extraído. Control total sobre tu BrandKit.
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold mb-2">Aplicación Global</h3>
            <p className="text-sm text-muted-foreground">
              Todos los módulos aplicarán automáticamente las reglas y elementos de tu BrandKit.
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold mb-2">Validación Continua</h3>
            <p className="text-sm text-muted-foreground">
              Sistema de validación que verifica el cumplimiento del BrandKit en tiempo real.
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Download className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold mb-2">Exportación Completa</h3>
            <p className="text-sm text-muted-foreground">
              Exporta tu BrandKit completo en formato JSON para uso en otras herramientas.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">BrandKit Avanzado</h2>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Activo
              </Badge>
              {lastUpdated && (
                <span className="text-sm text-muted-foreground">
                  Actualizado {lastUpdated}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Completitud:</span>
                <span className={`text-sm font-medium ${getComplianceColor(compliance.score)}`}>
                  {compliance.score}% ({getComplianceLabel(compliance.score)})
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setActiveTab("upload")}>
            <Upload className="w-4 h-4 mr-2" />
            Nuevo Manual
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar
          </Button>
        </div>
      </div>

      {/* Compliance Alert */}
      {compliance.score < 80 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  BrandKit Incompleto
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  Tu BrandKit está al {compliance.score}%. Completa los siguientes elementos para máxima efectividad:
                </p>
                <div className="flex flex-wrap gap-1">
                  {compliance.missing.slice(0, 3).map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                  {compliance.missing.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{compliance.missing.length - 3} más
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Info */}
      {brandKit?.analysis && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium">Análisis Completado</h4>
                  <p className="text-sm text-muted-foreground">
                    Procesado en {brandKit.analysis.processingTime} con {Math.round(brandKit.analysis.confidence * 100)}% de confianza
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Archivo fuente:</p>
                <p className="text-sm font-medium">{brandKit.analysis.sourceFile}</p>
              </div>
            </div>
            
            {(brandKit.analysis.inferredElements?.length > 0 || brandKit.analysis.missingElements?.length > 0) && (
              <>
                <Separator className="my-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {brandKit.analysis.inferredElements?.length > 0 && (
                    <div>
                      <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Elementos inferidos por IA:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {brandKit.analysis.inferredElements.map((element, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {element}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {brandKit.analysis.missingElements?.length > 0 && (
                    <div>
                      <p className="font-medium text-orange-600 dark:text-orange-400 mb-1">
                        Elementos no encontrados:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {brandKit.analysis.missingElements.map((element, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {element}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-6 lg:grid-cols-14 gap-1">
                {[
                  { id: 'overview', label: 'Resumen' },
                  { id: 'upload', label: 'Subir' },
                  { id: 'colors', label: 'Colores' },
                  { id: 'typography', label: 'Tipografía' },
                  { id: 'logos', label: 'Logos' },
                  { id: 'voice', label: 'Voz' },
                  { id: 'messaging', label: 'Mensajes' },
                  { id: 'storytelling', label: 'Historia' },
                  { id: 'guidelines', label: 'Guías' },
                  { id: 'examples', label: 'Ejemplos' },
                  { id: 'advanced', label: 'Avanzado' },
                  { id: 'validation', label: 'Validación' },
                  { id: 'accessibility', label: 'Accesibilidad' },
                  { id: 'test', label: '🧪 Test' }
                ].map((tab) => {
                  const IconComponent = getTabIcon(tab.id);
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1 text-xs">
                      <IconComponent className="w-3 h-3" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview">
                <BrandKitOverview />
              </TabsContent>

              <TabsContent value="upload">
                <EnhancedUploader />
              </TabsContent>

              <TabsContent value="colors">
                <ColorPaletteAdvanced />
              </TabsContent>

              <TabsContent value="typography">
                <TypographyAdvanced />
              </TabsContent>

              <TabsContent value="logos">
                <LogosAdvanced />
              </TabsContent>

              <TabsContent value="voice">
                <VoiceToneAdvanced />
              </TabsContent>

              <TabsContent value="messaging">
                <MessagingSection />
              </TabsContent>

              <TabsContent value="storytelling">
                <StorytellingSection />
              </TabsContent>

              <TabsContent value="guidelines">
                <ApplicationGuidelines />
              </TabsContent>

              <TabsContent value="examples">
                <UsageExamplesSection />
              </TabsContent>

              <TabsContent value="advanced">
                <AdvancedElementsSection />
              </TabsContent>

              <TabsContent value="validation">
                <ValidationReport />
              </TabsContent>

              <TabsContent value="accessibility">
                <AccessibilitySection />
              </TabsContent>

              <TabsContent value="test">
                <BrandKitTestComponent />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedBrandKitModule;