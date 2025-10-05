import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Alert, AlertDescription } from "../ui/alert";
import { BrandKitUploader } from "./BrandKitUploader";
import { AnalysisResults } from "./AnalysisResults";
import { FirestoreStatus } from "./FirestoreStatus";
import { BrandKitData, saveBrandKit, loadBrandKit, formatLastUpdated } from "../../utils/firebase/brandkit";
import { 
  Palette, 
  Type, 
  Image, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  Copy,
  Download,
  Check,
  FileText,
  Video,
  Calendar,
  Zap,
  Sparkles,
  ArrowRight,
  Clock,
  RefreshCw,
  AlertCircle,
  Database
} from "lucide-react";

function BrandKitPage() {
  const [brandKitData, setBrandKitData] = useState<BrandKitData | null>(null);
  const [copiedColor, setCopiedColor] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Cargar BrandKit existente al iniciar
  useEffect(() => {
    const loadExistingBrandKit = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        const existingData = await loadBrandKit();
        if (existingData) {
          setBrandKitData(existingData);
          
          // Formatear fecha de última actualización
          if (existingData.metadata?.updatedAt) {
            setLastUpdated(formatLastUpdated(existingData.metadata.updatedAt));
          }
        }
      } catch (err) {
        console.error("Error cargando BrandKit:", err);
        setError(err instanceof Error ? err.message : "Error cargando datos");
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingBrandKit();
  }, []);

  const handleUploadComplete = async (extractedData: any) => {
    try {
      setIsSaving(true);
      setError("");

      // Organizar colores por tipo
      const organizedColors = extractedData.colors?.map((color: any, index: number) => ({
        ...color,
        type: index < 2 ? 'primary' : index < 4 ? 'secondary' : 'alternative'
      })) || [];

      const newBrandKitData: BrandKitData = {
        colors: organizedColors,
        typography: extractedData.typography || [],
        logos: extractedData.logos || [],
        visualStyle: extractedData.visualStyle || {},
        voiceTone: extractedData.voiceTone || { personality: "", tone: "", language: "", examples: [] },
        usageRules: extractedData.usageRules || { dos: [], donts: [] },
        analysisInfo: {
          confidence: extractedData.confidence,
          processingTime: extractedData.processingTime,
          extractedBy: extractedData.extractedBy
        }
      };

      // Guardar en Firestore
      await saveBrandKit(newBrandKitData);
      
      // Actualizar estado local
      setBrandKitData(newBrandKitData);
      setLastUpdated(formatLastUpdated(new Date()));

      console.log("BrandKit guardado exitosamente en Firestore");
      
    } catch (err) {
      console.error("Error guardando BrandKit:", err);
      setError(err instanceof Error ? err.message : "Error guardando datos");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(`${type}-${text}`);
    setTimeout(() => setCopiedColor(""), 2000);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto p-6 flex items-center justify-center min-h-[500px]">
          <div className="text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
            <h3 className="text-lg font-medium">Cargando BrandKit</h3>
            <p className="text-muted-foreground">Conectando con Firestore...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BrandKit AI Studio
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sube tu manual de marca y deja que Gemini Ultra extraiga automáticamente todos los elementos de tu identidad visual y verbal
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert className="max-w-4xl mx-auto border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Last Updated Info */}
        {brandKitData && lastUpdated && (
          <Alert className="max-w-4xl mx-auto border-green-200 bg-green-50">
            <Database className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Última actualización: {lastUpdated}</span>
              {isSaving && (
                <div className="flex items-center gap-2 ml-auto">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Guardando...</span>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Saving State */}
        {isSaving && (
          <Alert className="max-w-4xl mx-auto border-blue-200 bg-blue-50">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-800">
              Guardando BrandKit en Firestore...
            </AlertDescription>
          </Alert>
        )}

        {/* Firestore Status */}
        <div className="max-w-4xl mx-auto">
          <FirestoreStatus onBrandKitLoad={(data) => {
            if (data && !brandKitData) {
              setBrandKitData(data);
              if (data.metadata?.updatedAt) {
                setLastUpdated(formatLastUpdated(data.metadata.updatedAt));
              }
            }
          }} />
        </div>

        {/* Uploader */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {brandKitData ? "Actualizar BrandKit" : "Crear BrandKit"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {brandKitData 
                      ? "Sube un nuevo manual para actualizar tu BrandKit existente"
                      : "Sube tu manual de marca para generar automáticamente tu BrandKit"
                    }
                  </p>
                </div>
              </div>
              {brandKitData && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Database className="w-3 h-3 mr-1" />
                  Guardado
                </Badge>
              )}
            </div>
            <BrandKitUploader onUploadComplete={handleUploadComplete} />
          </Card>
        </div>

        {/* Analysis Results */}
        {brandKitData?.analysisInfo && (
          <div className="max-w-4xl mx-auto">
            <AnalysisResults 
              analysis={{
                ...brandKitData.analysisInfo,
                colors: brandKitData.colors,
                typography: brandKitData.typography,
                logos: brandKitData.logos
              }} 
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Paleta de Colores */}
          <Card className="p-6 bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold">Paleta de Colores</h3>
              {brandKitData?.colors && (
                <Badge variant="secondary" className="ml-auto">
                  {brandKitData.colors.length} colores
                </Badge>
              )}
            </div>

            {!brandKitData ? (
              // Placeholder state
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="group">
                      <div 
                        className="w-full h-20 rounded-xl bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center transition-all hover:bg-gray-100"
                      >
                        <span className="text-xs text-gray-400 font-medium">Color pendiente</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-2 bg-gray-100 rounded animate-pulse w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Real data state
              <div className="space-y-6">
                {/* Primary Colors */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Colores Primarios</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {brandKitData.colors.filter(c => c.type === 'primary').map((color, i) => (
                      <TooltipProvider key={i}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="group cursor-pointer"
                              onClick={() => copyToClipboard(color.hex, 'primary')}
                            >
                              <div 
                                className="w-full h-20 rounded-xl border-2 border-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                                style={{ backgroundColor: color.hex }}
                              >
                                <div className="w-full h-full rounded-xl bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-all">
                                  {copiedColor === `primary-${color.hex}` ? (
                                    <Check className="w-5 h-5 text-white" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-white/0 group-hover:text-white/80 transition-all" />
                                  )}
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="font-medium">{color.name}</p>
                                <p className="text-sm text-gray-500">{color.hex}</p>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Clic para copiar: {color.hex}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>

                {/* Secondary Colors */}
                {brandKitData.colors.filter(c => c.type === 'secondary').length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Colores Secundarios</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {brandKitData.colors.filter(c => c.type === 'secondary').map((color, i) => (
                        <TooltipProvider key={i}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div 
                                className="group cursor-pointer"
                                onClick={() => copyToClipboard(color.hex, 'secondary')}
                              >
                                <div 
                                  className="w-full h-16 rounded-lg border-2 border-white shadow-md transition-all hover:scale-105"
                                  style={{ backgroundColor: color.hex }}
                                >
                                  <div className="w-full h-full rounded-lg bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-all">
                                    {copiedColor === `secondary-${color.hex}` ? (
                                      <Check className="w-4 h-4 text-white" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-white/0 group-hover:text-white/80 transition-all" />
                                    )}
                                  </div>
                                </div>
                                <div className="mt-1">
                                  <p className="text-sm font-medium">{color.name}</p>
                                  <p className="text-xs text-gray-500">{color.hex}</p>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Clic para copiar: {color.hex}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Tipografías */}
          <Card className="p-6 bg-gradient-to-br from-white to-blue-50/30 border border-blue-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Type className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold">Tipografías</h3>
              {brandKitData?.typography && (
                <Badge variant="secondary" className="ml-auto">
                  {brandKitData.typography.length} fuentes
                </Badge>
              )}
            </div>

            {!brandKitData ? (
              // Placeholder state
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-3xl text-gray-300 font-light mb-2">Aa Bb Cc</div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Real data state
              <div className="space-y-4">
                {brandKitData.typography.map((typo, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div 
                      className="text-3xl mb-3 transition-all"
                      style={{ 
                        fontFamily: typo.font, 
                        fontWeight: typo.weight 
                      }}
                    >
                      Aa Bb Cc 123
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold">{typo.name}</h4>
                      <p className="text-sm text-gray-600">
                        {typo.font} • {typo.weight} • {typo.size}
                      </p>
                      <p className="text-xs text-gray-500">{typo.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Logos */}
          <Card className="p-6 bg-gradient-to-br from-white to-green-50/30 border border-green-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Image className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold">Logos</h3>
              {brandKitData?.logos && (
                <Badge variant="secondary" className="ml-auto">
                  {brandKitData.logos.length} versiones
                </Badge>
              )}
            </div>

            {!brandKitData ? (
              // Placeholder state
              <div className="grid grid-cols-1 gap-4">
                {['Principal', 'Negativo', 'Alternativo'].map((type, i) => (
                  <div key={i} className="p-4 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300">
                    <div className="h-20 flex items-center justify-center">
                      <div className="text-center">
                        <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400 font-medium">{type}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Real data state
              <div className="grid grid-cols-1 gap-4">
                {brandKitData.logos.map((logo, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white border border-gray-100 shadow-sm">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* Mockup fondo claro */}
                      <div className="h-16 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                        <div className="text-xs text-gray-400 text-center">
                          Logo {logo.name}<br/>
                          <span className="text-gray-300">Fondo claro</span>
                        </div>
                      </div>
                      {/* Mockup fondo oscuro */}
                      <div className="h-16 bg-gray-900 rounded-lg flex items-center justify-center">
                        <div className="text-xs text-gray-400 text-center">
                          Logo {logo.name}<br/>
                          <span className="text-gray-500">Fondo oscuro</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">{logo.name}</h4>
                      <p className="text-sm text-gray-600">{logo.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="w-3 h-3 mr-1" />
                          PNG
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="w-3 h-3 mr-1" />
                          SVG
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Tono de Voz */}
          <Card className="p-6 bg-gradient-to-br from-white to-purple-50/30 border border-purple-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold">Tono de Voz</h3>
              {brandKitData?.voiceTone?.examples?.length && (
                <Badge variant="secondary" className="ml-auto">
                  {brandKitData.voiceTone.examples.length} ejemplos
                </Badge>
              )}
            </div>

            {!brandKitData ? (
              // Placeholder state
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                  <p className="text-gray-400 italic text-lg">
                    "Ejemplo de tono pendiente..."
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded text-center">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Real data state
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">Personalidad</h4>
                    <p className="text-sm text-purple-700">{brandKitData.voiceTone.personality}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Tono</h4>
                    <p className="text-sm text-blue-700">{brandKitData.voiceTone.tone}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Lenguaje</h4>
                    <p className="text-sm text-green-700">{brandKitData.voiceTone.language}</p>
                  </div>
                </div>

                {brandKitData.voiceTone.examples?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Ejemplos de Comunicación</h4>
                    <div className="space-y-3">
                      {brandKitData.voiceTone.examples.map((example, i) => (
                        <div key={i} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-l-4 border-purple-400">
                          <p className="italic text-gray-700">"{example}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Reglas de Uso */}
        <Card className="p-6 bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold">Reglas de Uso</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Qué SÍ hacer */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Qué SÍ hacer</h4>
              </div>
              {!brandKitData ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-green-50/50 rounded-lg border border-green-200/50">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                      <div className="h-4 bg-green-200 rounded animate-pulse flex-1"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {brandKitData.usageRules.dos.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-green-800">{rule}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Qué NO hacer */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-red-900">Qué NO hacer</h4>
              </div>
              {!brandKitData ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-red-50/50 rounded-lg border border-red-200/50">
                      <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
                      <div className="h-4 bg-red-200 rounded animate-pulse flex-1"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {brandKitData.usageRules.donts.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-800">{rule}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Integraciones Activas */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold">Integraciones Activas</h3>
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
              Sistema conectado
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Chat Maestro', icon: MessageSquare, color: 'blue' },
              { name: 'Posts & Carousels', icon: FileText, color: 'green' },
              { name: 'Videos', icon: Video, color: 'purple' },
              { name: 'Calendar', icon: Calendar, color: 'orange' }
            ].map(({ name, icon: Icon, color }, i) => (
              <div key={i} className={`p-4 rounded-lg bg-${color}-50 border border-${color}-200 transition-all hover:shadow-md`}>
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-6 h-6 text-${color}-600`} />
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-medium mb-1">{name}</h4>
                <p className="text-xs text-gray-600">BrandKit aplicado automáticamente</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Activo</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-white/50 rounded-lg border border-white/50">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {brandKitData ? "¡Tu BrandKit está funcionando!" : "Configura tu BrandKit"}
                </p>
                <p className="text-sm text-gray-600">
                  {brandKitData 
                    ? "Todos los módulos aplicarán automáticamente las reglas de marca almacenadas en Firestore."
                    : "Una vez completado, se guardará en Firestore y estará disponible en todos los módulos."
                  }
                </p>
                {brandKitData && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                    <Database className="w-3 h-3" />
                    <span>Sincronizado con Firestore</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default BrandKitPage;