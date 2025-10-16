import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { BrandKitUploader } from "./BrandKitUploader";
import { ColorPalette } from "./ColorPalette";
import { TypographySection } from "./TypographySection";
import { LogosSection } from "./LogosSection";
import { VoiceToneSection } from "./VoiceToneSection";
import { UsageRulesSection } from "./UsageRulesSection";
import { AnalysisResults } from "./AnalysisResults";
import { BrandValidation } from "./BrandValidation";
import { Save, Download, Share, Upload } from "lucide-react";

interface BrandKitData {
  colors: any[];
  typography: any[];
  logos: any[];
  visualStyle: any;
  voiceTone: any;
  usageRules: any;
  lastUpdated?: string;
  analysisInfo?: {
    confidence?: number;
    processingTime?: string;
    extractedBy?: string;
    rawAnalysis?: any;
  };
}

export function BrandKitModule() {
  const [brandKitData, setBrandKitData] = useState<BrandKitData>({
    colors: [],
    typography: [],
    logos: [],
    visualStyle: {},
    voiceTone: {
      personality: "",
      tone: "",
      language: "",
      examples: []
    },
    usageRules: {
      dos: [],
      donts: []
    }
  });

  const [hasData, setHasData] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleUploadComplete = (extractedData: any) => {
    setBrandKitData({
      colors: extractedData.colors || [],
      typography: extractedData.typography || [],
      logos: extractedData.logos || [],
      visualStyle: extractedData.visualStyle || {},
      voiceTone: extractedData.voiceTone || { personality: "", tone: "", language: "", examples: [] },
      usageRules: extractedData.usageRules || { dos: [], donts: [] },
      lastUpdated: new Date().toISOString(),
      analysisInfo: {
        confidence: extractedData.confidence,
        processingTime: extractedData.processingTime,
        extractedBy: extractedData.extractedBy,
        rawAnalysis: extractedData.rawAnalysis
      }
    });
    setHasData(true);
    setActiveTab("overview");
  };

  const updateColors = (colors: any[]) => {
    setBrandKitData(prev => ({ ...prev, colors }));
  };

  const updateTypography = (typography: any[]) => {
    setBrandKitData(prev => ({ ...prev, typography }));
  };

  const updateLogos = (logos: any[]) => {
    setBrandKitData(prev => ({ ...prev, logos }));
  };

  const updateVoiceTone = (voiceTone: any) => {
    setBrandKitData(prev => ({ ...prev, voiceTone }));
  };

  const updateUsageRules = (usageRules: any) => {
    setBrandKitData(prev => ({ ...prev, usageRules }));
  };

  const saveBrandKit = () => {
    // En una implementación real, esto guardaría en Supabase
    console.log('Guardando BrandKit:', brandKitData);
    setBrandKitData(prev => ({ ...prev, lastUpdated: new Date().toISOString() }));
  };

  const exportBrandKit = () => {
    // Exportar como JSON
    const dataStr = JSON.stringify(brandKitData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brandkit.json';
    link.click();
  };

  if (!hasData) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2>Crea tu BrandKit con IA</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sube tu manual de marca y nuestra IA extraerá automáticamente colores, tipografías, logos, 
            tono de voz y reglas de uso. Todo será aplicado automáticamente en tus contenidos.
          </p>
        </div>

        {/* Uploader */}
        <div className="max-w-2xl mx-auto">
          <BrandKitUploader onUploadComplete={handleUploadComplete} />
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="text-center p-6 border rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              🎨
            </div>
            <h3 className="mb-2">Extracción Automática</h3>
            <p className="text-sm text-muted-foreground">
              La IA analiza tu manual y extrae automáticamente todos los elementos de marca
            </p>
          </div>
          
          <div className="text-center p-6 border rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              ⚡
            </div>
            <h3 className="mb-2">Aplicación Automática</h3>
            <p className="text-sm text-muted-foreground">
              Todos los módulos aplicarán automáticamente las reglas de tu BrandKit
            </p>
          </div>
          
          <div className="text-center p-6 border rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              ✏️
            </div>
            <h3 className="mb-2">Totalmente Editable</h3>
            <p className="text-sm text-muted-foreground">
              Revisa y ajusta manualmente cualquier elemento extraído por la IA
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-1">BrandKit</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Activo</Badge>
            {brandKitData.lastUpdated && (
              <span className="text-sm text-muted-foreground">
                Actualizado: {new Date(brandKitData.lastUpdated).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setHasData(false)}>
            <Upload className="w-4 h-4 mr-2" />
            Nuevo Manual
          </Button>
          <Button variant="outline" size="sm" onClick={exportBrandKit}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" onClick={saveBrandKit}>
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="colors">Colores</TabsTrigger>
          <TabsTrigger value="typography">Tipografía</TabsTrigger>
          <TabsTrigger value="logos">Logos</TabsTrigger>
          <TabsTrigger value="voice">Tono de Voz</TabsTrigger>
          <TabsTrigger value="rules">Reglas</TabsTrigger>
          <TabsTrigger value="validation">Validación</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Mostrar resultados del análisis si están disponibles */}
          {brandKitData.analysisInfo && (
            <AnalysisResults 
              analysis={{
                ...brandKitData.analysisInfo,
                colors: brandKitData.colors,
                typography: brandKitData.typography,
                logos: brandKitData.logos
              }} 
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Colores</h4>
              <div className="flex gap-1 mb-2">
                {brandKitData.colors.slice(0, 5).map((color, i) => (
                  <div 
                    key={i}
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {brandKitData.colors.length} colores definidos
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Tipografía</h4>
              <div className="space-y-1">
                {brandKitData.typography.slice(0, 3).map((typo, i) => (
                  <div key={i} className="text-sm text-muted-foreground">
                    {typo.name} - {typo.font}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {brandKitData.typography.length} estilos definidos
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Logos</h4>
              <div className="grid grid-cols-3 gap-1 mb-2">
                {brandKitData.logos.slice(0, 3).map((logo, i) => (
                  <div key={i} className="aspect-square bg-muted rounded flex items-center justify-center">
                    <span className="text-xs">📷</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {brandKitData.logos.length} versiones de logo
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Tono de Voz</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><span className="font-medium">Personalidad:</span> {brandKitData.voiceTone.personality}</p>
                <p><span className="font-medium">Tono:</span> {brandKitData.voiceTone.tone}</p>
                <p><span className="font-medium">Lenguaje:</span> {brandKitData.voiceTone.language}</p>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Reglas de Uso</h4>
              <div className="text-sm text-muted-foreground">
                <p>{brandKitData.usageRules.dos.length} reglas positivas</p>
                <p>{brandKitData.usageRules.donts.length} reglas restrictivas</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="colors">
          <ColorPalette 
            colors={brandKitData.colors} 
            onColorsChange={updateColors}
          />
        </TabsContent>

        <TabsContent value="typography">
          <TypographySection 
            typography={brandKitData.typography} 
            onTypographyChange={updateTypography}
          />
        </TabsContent>

        <TabsContent value="logos">
          <LogosSection 
            logos={brandKitData.logos} 
            onLogosChange={updateLogos}
          />
        </TabsContent>

        <TabsContent value="voice">
          <VoiceToneSection 
            voiceTone={brandKitData.voiceTone} 
            onVoiceToneChange={updateVoiceTone}
          />
        </TabsContent>

        <TabsContent value="rules">
          <UsageRulesSection 
            usageRules={brandKitData.usageRules} 
            onUsageRulesChange={updateUsageRules}
          />
        </TabsContent>

        <TabsContent value="validation">
          <BrandValidation brandKitData={brandKitData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}