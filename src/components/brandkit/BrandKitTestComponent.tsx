import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { useBrandKit } from '../../contexts/BrandKitContext';
import { Upload, Loader2, CheckCircle, AlertCircle, Eye, Palette, Type, MessageSquare } from 'lucide-react';

export default function BrandKitTestComponent() {
  const {
    brandKit,
    isLoading,
    isAnalyzing,
    error,
    lastUpdated,
    hasBrandKit,
    uploadAndAnalyzeManual,
    getPrimaryColors,
    getSecondaryColors,
    getPrimaryFont,
    getSecondaryFont,
    getVoiceToneInstructions,
    getBrandCompliance
  } = useBrandKit();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadAndAnalyzeManual(selectedFile);
      setSelectedFile(null);
    } catch (err) {
      console.error('Error analyzing manual:', err);
    }
  };

  const testConnection = async () => {
    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ecf7df64/health`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Server connection test successful:', data);
        alert('✅ Conexión al servidor exitosa!');
      } else {
        console.error('❌ Server connection test failed:', response.status);
        alert('❌ Error de conexión al servidor');
      }
    } catch (err) {
      console.error('❌ Connection test error:', err);
      alert('❌ Error de red');
    }
  };

  const testAIModels = async () => {
    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ecf7df64/ai-models`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🤖 AI Models diagnostic:', data);
        
        const googleAI = data.apis.googleAI;
        const openAI = data.apis.openAI;
        
        let message = '🤖 AI Models Status:\n\n';
        message += `Google AI: ${googleAI.configured ? '✅ Configured' : '❌ Not configured'}\n`;
        message += `Status: ${googleAI.status}\n`;
        if (googleAI.availableModels && googleAI.availableModels.length > 0) {
          message += `Available models: ${googleAI.availableModels.join(', ')}\n`;
        }
        message += `\nOpenAI: ${openAI.configured ? '✅ Configured' : '❌ Not configured'}\n`;
        
        alert(message);
      } else {
        console.error('❌ AI models test failed:', response.status);
        alert('❌ Error verificando modelos de IA');
      }
    } catch (err) {
      console.error('❌ AI models test error:', err);
      alert('❌ Error de red verificando IA');
    }
  };

  const testGeminiReal = async () => {
    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      // Show loading state
      alert('🔄 Probando conectividad real con Gemini...');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ecf7df64/test-gemini`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('🚀 Gemini real test result:', data);
      
      if (data.success) {
        let message = '✅ Gemini funcionando correctamente!\n\n';
        message += `Modelo usado: ${data.workingModel}\n`;
        message += `Respuesta de prueba: "${data.response}"\n`;
        message += `Timestamp: ${data.timestamp}`;
        alert(message);
      } else {
        let message = '❌ Error con Gemini:\n\n';
        message += `Error: ${data.error}\n`;
        message += `Timestamp: ${data.timestamp}`;
        alert(message);
      }
      
    } catch (err) {
      console.error('❌ Gemini real test error:', err);
      alert('❌ Error de red probando Gemini');
    }
  };

  const listGeminiModels = async () => {
    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      alert('🔄 Listando modelos disponibles...');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ecf7df64/list-models`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      const data = await response.json();
      console.log('📋 Available models:', data);
      
      if (data.success) {
        let message = '📋 Modelos disponibles:\n\n';
        
        if (Array.isArray(data.models)) {
          data.models.forEach((model: any) => {
            if (typeof model === 'string') {
              message += `• ${model}\n`;
            } else if (model.name) {
              message += `• ${model.name}: ${model.available ? '✅ Disponible' : '❌ No disponible'}\n`;
              if (model.error) {
                message += `  Error: ${model.error}\n`;
              }
            }
          });
        } else {
          message += JSON.stringify(data.models, null, 2);
        }
        
        message += `\n${data.note || ''}\nTimestamp: ${data.timestamp}`;
        alert(message);
      } else {
        alert(`❌ Error listando modelos:\n${data.error}`);
      }
      
    } catch (err) {
      console.error('❌ List models error:', err);
      alert('❌ Error de red listando modelos');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const primaryColors = getPrimaryColors();
  const secondaryColors = getSecondaryColors();
  const primaryFont = getPrimaryFont();
  const secondaryFont = getSecondaryFont();
  const voiceInstructions = getVoiceToneInstructions();
  const brandCompliance = getBrandCompliance();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🧪 BrandKit Test Lab</h1>
          <p className="text-muted-foreground">
            Prueba completa del análisis con Gemini AI y sistema de BrandKit
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {hasBrandKit && (
            <Badge variant="outline" className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              BrandKit Activo
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testConnection}
            className="flex items-center gap-2"
          >
            <Eye className="h-3 w-3" />
            Test Server
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testAIModels}
            className="flex items-center gap-2"
          >
            🤖
            Check AI Status
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testGeminiReal}
            className="flex items-center gap-2"
          >
            🚀
            Test Gemini Live
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={listGeminiModels}
            className="flex items-center gap-2"
          >
            📋
            List Models
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">📤 Upload & Analyze</TabsTrigger>
          <TabsTrigger value="colors">🎨 Colors</TabsTrigger>
          <TabsTrigger value="typography">📝 Typography</TabsTrigger>
          <TabsTrigger value="voice">🗣️ Voice & Tone</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Brand Manual
              </CardTitle>
              <CardDescription>
                Sube un manual de marca (PDF, DOCX o imagen) para análisis automático con Gemini AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-muted-foreground/25'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Soporta: PDF, DOCX, PNG, JPG (máx. 10MB)
                </p>
                
                <Input
                  type="file"
                  accept=".pdf,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  className="w-full max-w-sm mx-auto"
                />
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <div className="p-4 bg-muted/20 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type}
                      </p>
                    </div>
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={isAnalyzing}
                      className="flex items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analizando con Gemini...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Analizar Manual
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Status */}
              {isAnalyzing && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Gemini AI está analizando tu manual de marca. Esto puede tomar unos momentos...
                  </AlertDescription>
                </Alert>
              )}

              {lastUpdated && (
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    Última actualización: {lastUpdated}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Colores Primarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                {primaryColors.length > 0 ? (
                  <div className="space-y-2">
                    {primaryColors.map((color, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <p className="font-medium">{color.name}</p>
                          <p className="text-sm text-muted-foreground">{color.hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay colores primarios definidos</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Colores Secundarios</CardTitle>
              </CardHeader>
              <CardContent>
                {secondaryColors.length > 0 ? (
                  <div className="space-y-2">
                    {secondaryColors.map((color, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <p className="font-medium">{color.name}</p>
                          <p className="text-sm text-muted-foreground">{color.hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay colores secundarios definidos</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Tipografía Primaria
                </CardTitle>
              </CardHeader>
              <CardContent>
                {primaryFont ? (
                  <div className="space-y-2">
                    <p className="text-lg font-medium" style={{ fontFamily: primaryFont.font }}>
                      {primaryFont.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Peso: {primaryFont.weight}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tipo: {primaryFont.type}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay tipografía primaria definida</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipografía Secundaria</CardTitle>
              </CardHeader>
              <CardContent>
                {secondaryFont ? (
                  <div className="space-y-2">
                    <p className="text-lg font-medium" style={{ fontFamily: secondaryFont.font }}>
                      {secondaryFont.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Peso: {secondaryFont.weight}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tipo: {secondaryFont.type}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay tipografía secundaria definida</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Voice & Tone Tab */}
        <TabsContent value="voice" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Tono de Voz
                </CardTitle>
              </CardHeader>
              <CardContent>
                {voiceInstructions ? (
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed">{voiceInstructions}</p>
                    {brandKit?.voiceTone?.examples?.correct && (
                      <div>
                        <p className="font-medium text-green-600 mb-2">✅ Ejemplos Correctos:</p>
                        <ul className="text-sm space-y-1">
                          {brandKit.voiceTone.examples.correct.map((example, index) => (
                            <li key={index} className="p-2 bg-green-50 rounded border-l-2 border-green-200">
                              "{example}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {brandKit?.voiceTone?.examples?.incorrect && (
                      <div>
                        <p className="font-medium text-red-600 mb-2">❌ Ejemplos Incorrectos:</p>
                        <ul className="text-sm space-y-1">
                          {brandKit.voiceTone.examples.incorrect.map((example, index) => (
                            <li key={index} className="p-2 bg-red-50 rounded border-l-2 border-red-200">
                              "{example}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay instrucciones de tono de voz definidas</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance del BrandKit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Puntuación de Completitud</span>
                      <span className="text-lg font-bold">{brandCompliance.score}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${brandCompliance.score}%` }}
                      />
                    </div>
                  </div>
                  
                  {brandCompliance.missing.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Elementos Faltantes:</p>
                      <ul className="text-sm space-y-1">
                        {brandCompliance.missing.map((item, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-400 rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {brandCompliance.recommendations.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Recomendaciones:</p>
                      <ul className="text-sm space-y-1">
                        {brandCompliance.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Debug Info */}
      {brandKit && (
        <Card className="border-dashed border-muted-foreground/25">
          <CardHeader>
            <CardTitle className="text-sm">🔧 Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono bg-muted/20 p-3 rounded overflow-auto max-h-40">
              <pre>{JSON.stringify({
                brandName: brandKit.meta.brandName,
                version: brandKit.meta.version,
                lastUpdated: brandKit.meta.lastUpdated,
                colorsCount: {
                  primary: brandKit.colors.primary.length,
                  secondary: brandKit.colors.secondary.length,
                  alternatives: brandKit.colors.alternatives.length
                },
                hasTypography: !!(brandKit.typography?.primary?.name),
                hasVoiceTone: !!(brandKit.voiceTone?.style),
                complianceScore: brandCompliance.score
              }, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}