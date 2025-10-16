import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import {
  Palette,
  Type,
  Image,
  MessageCircle,
  FileText,
  Book,
  Settings,
  CheckCircle,
  Shield,
  Edit,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useBrandKit } from "../../contexts/BrandKitContext";

const BrandKitOverview: React.FC = () => {
  const { brandKit, getBrandCompliance } = useBrandKit();
  const compliance = getBrandCompliance();

  if (!brandKit) return null;

  const sections = [
    {
      id: 'colors',
      title: 'Colores',
      icon: Palette,
      count: (brandKit.colors?.primary?.length || 0) + (brandKit.colors?.secondary?.length || 0) + (brandKit.colors?.alternatives?.length || 0),
      total: 6,
      status: (brandKit.colors?.primary?.length || 0) > 0 ? 'complete' : 'empty',
      description: `${(brandKit.colors?.primary?.length || 0) + (brandKit.colors?.secondary?.length || 0) + (brandKit.colors?.alternatives?.length || 0)} colores definidos`
    },
    {
      id: 'typography',
      title: 'Tipografía',
      icon: Type,
      count: (brandKit.typography?.primary ? 1 : 0) + (brandKit.typography?.secondary ? 1 : 0),
      total: 2,
      status: brandKit.typography?.primary ? 'complete' : 'empty',
      description: `${(brandKit.typography?.primary ? 1 : 0) + (brandKit.typography?.secondary ? 1 : 0)}/2 tipografías principales`
    },
    {
      id: 'logos',
      title: 'Logos',
      icon: Image,
      count: brandKit.logos?.length || 0,
      total: 3,
      status: brandKit.logos?.length > 0 ? 'complete' : 'empty',
      description: `${brandKit.logos?.length || 0} versiones de logo`
    },
    {
      id: 'voice',
      title: 'Tono de Voz',
      icon: MessageCircle,
      count: brandKit.voiceTone?.style ? 1 : 0,
      total: 1,
      status: brandKit.voiceTone?.style ? 'complete' : 'empty',
      description: brandKit.voiceTone?.style ? 'Definido' : 'No definido'
    },
    {
      id: 'messaging',
      title: 'Mensajes',
      icon: FileText,
      count: (brandKit.messaging?.tagline ? 1 : 0) + (brandKit.messaging?.slogans?.length || 0) + (brandKit.messaging?.differentiators?.length || 0),
      total: 5,
      status: brandKit.messaging?.tagline ? 'complete' : 'empty',
      description: `${(brandKit.messaging?.tagline ? 1 : 0) + (brandKit.messaging?.slogans?.length || 0)} mensajes clave`
    },
    {
      id: 'storytelling',
      title: 'Historia',
      icon: Book,
      count: (brandKit.storytelling?.mission ? 1 : 0) + (brandKit.storytelling?.vision ? 1 : 0) + (brandKit.storytelling?.values?.length || 0),
      total: 5,
      status: brandKit.storytelling?.mission ? 'complete' : 'empty',
      description: brandKit.storytelling?.mission ? 'Historia definida' : 'Historia pendiente'
    },
    {
      id: 'guidelines',
      title: 'Guías',
      icon: Settings,
      count: Object.values(brandKit.usageGuidelines || {}).filter(Boolean).length,
      total: 4,
      status: Object.values(brandKit.usageGuidelines || {}).filter(Boolean).length > 0 ? 'complete' : 'empty',
      description: `${Object.values(brandKit.usageGuidelines || {}).filter(Boolean).length}/4 aplicaciones`
    },
    {
      id: 'accessibility',
      title: 'Accesibilidad',
      icon: Shield,
      count: brandKit.accessibility?.contrastRatio ? 1 : 0,
      total: 1,
      status: brandKit.accessibility?.contrastRatio ? 'complete' : 'empty',
      description: brandKit.accessibility?.contrastRatio ? 'Reglas definidas' : 'Sin reglas'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'partial': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'empty': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return CheckCircle;
      case 'partial': return AlertCircle;
      case 'empty': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const completedSections = sections.filter(section => section.status === 'complete').length;
  const completionPercentage = Math.round((completedSections / sections.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completitud General</p>
                <p className="text-2xl font-bold">{compliance.score}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <Progress value={compliance.score} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Secciones Completas</p>
                <p className="text-2xl font-bold">{completedSections}/{sections.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <Progress value={completionPercentage} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Elementos Totales</p>
                <p className="text-2xl font-bold">
                  {sections.reduce((acc, section) => acc + section.count, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">elementos definidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Validation Summary */}
      {brandKit.validation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resumen de Validación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-blue-600">{brandKit.validation.coherenceReport.complianceRate}</p>
                <p className="text-sm text-muted-foreground">Cumplimiento</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-green-600">{brandKit.validation.coherenceReport.lastScan}</p>
                <p className="text-sm text-muted-foreground">Último Escaneo</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-purple-600">{brandKit.internationalization?.supportedLanguages?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Idiomas</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-orange-600">{brandKit.validation.coherenceReport.issues?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Problemas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section) => {
          const IconComponent = section.icon;
          const StatusIcon = getStatusIcon(section.status);
          
          return (
            <Card key={section.id} className="relative group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(section.status)}`}>
                    <StatusIcon className="w-3 h-3" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Progress 
                      value={(section.count / section.total) * 100} 
                      className="h-1 flex-1 mr-2" 
                    />
                    <span className="text-xs text-muted-foreground">
                      {section.count}/{section.total}
                    </span>
                  </div>
                </div>

                {/* Quick Edit Button - shown on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colors Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Paleta de Colores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {brandKit.colors && (brandKit.colors.primary?.length > 0 || brandKit.colors.secondary?.length > 0) ? (
              <div className="space-y-4">
                {/* Primary Colors */}
                {brandKit.colors.primary && brandKit.colors.primary.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Colores Primarios</h4>
                    <div className="flex gap-2">
                      {brandKit.colors.primary.map((color, index) => (
                        <div key={index} className="flex-1">
                          <div 
                            className="h-12 rounded-lg border"
                            style={{ backgroundColor: color }}
                          />
                          <p className="text-xs text-center mt-1 font-medium">Primario {index + 1}</p>
                          <p className="text-xs text-center text-muted-foreground">{color}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Secondary Colors */}
                {brandKit.colors.secondary && brandKit.colors.secondary.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Colores Secundarios</h4>
                    <div className="flex gap-2">
                      {brandKit.colors.secondary.map((color, index) => (
                        <div key={index} className="flex-1">
                          <div 
                            className="h-12 rounded-lg border"
                            style={{ backgroundColor: color }}
                          />
                          <p className="text-xs text-center mt-1 font-medium">Secundario {index + 1}</p>
                          <p className="text-xs text-center text-muted-foreground">{color}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Gradients */}
                {brandKit.colors.gradients && brandKit.colors.gradients.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Gradientes</h4>
                    <div className="flex gap-2">
                      {brandKit.colors.gradients.map((gradient, index) => (
                        <div key={index} className="flex-1">
                          <div 
                            className="h-12 rounded-lg border"
                            style={{ 
                              background: `linear-gradient(45deg, ${gradient.from}, ${gradient.to})` 
                            }}
                          />
                          <p className="text-xs text-center mt-1 font-medium">{gradient.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay colores definidos</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voice Tone Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Tono de Voz
            </CardTitle>
          </CardHeader>
          <CardContent>
            {brandKit.voiceTone?.style ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">Estilo</h4>
                  <p className="text-sm text-muted-foreground">{brandKit.voiceTone.style}</p>
                </div>
                
                {brandKit.voiceTone.examples?.correct && brandKit.voiceTone.examples.correct.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1 text-green-600">✅ Ejemplo Correcto</h4>
                    <p className="text-sm text-green-700 italic">
                      "{brandKit.voiceTone.examples.correct[0]}"
                    </p>
                  </div>
                )}
                
                {brandKit.voiceTone.examples?.incorrect && brandKit.voiceTone.examples.incorrect.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1 text-red-600">❌ Evitar</h4>
                    <p className="text-sm text-red-700 italic">
                      "{brandKit.voiceTone.examples.incorrect[0]}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Tono de voz no definido</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {compliance.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {compliance.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { BrandKitOverview };