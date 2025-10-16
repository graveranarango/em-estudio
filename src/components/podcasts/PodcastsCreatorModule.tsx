import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { BrandKitAlert } from "../common/BrandKitAlert";
import { PodcastCreationWorkflow } from "./PodcastCreationWorkflow";
import { usePodcastProject } from "../../contexts/PodcastProjectContext";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { 
  Mic, 
  Plus, 
  FolderOpen,
  Clock,
  MessageSquare,
  Sparkles,
  CheckCircle,
  TrendingUp,
  PlayCircle,
  User,
  Users
} from "lucide-react";

const PODCAST_TYPE_OPTIONS = [
  {
    type: 'podcast_interview',
    title: 'Podcast en Entrevista',
    description: 'Conversaciones profundas con invitados expertos que generan contenido viral',
    icon: Users,
    gradient: 'from-blue-500 to-purple-600',
    duration: '30-90 min',
    platforms: ['Spotify', 'Apple Podcasts', 'YouTube'],
    features: ['Entrevistas dinámicas', 'Q&A estructurado', 'Alto potencial viral', 'Red de contactos']
  },
  {
    type: 'podcast_monologue',
    title: 'Podcast en Monólogo / Opinión',
    description: 'Tu perspectiva única y análisis profundo que construye autoridad personal',
    icon: User,
    gradient: 'from-orange-500 to-red-600',
    duration: '10-35 min',
    platforms: ['Spotify', 'Apple Podcasts', 'Google Podcasts'],
    features: ['Perspectiva personal', 'Análisis experto', 'Mensaje directo', 'Construcción de marca']
  }
];

function PodcastsCreatorContent() {
  const { hasBrandKit } = useBrandKit();
  const { currentProject, createNewProject } = usePodcastProject();
  const [showWorkflow, setShowWorkflow] = useState(!!currentProject);

  const handleCreateProject = (type: 'podcast_interview' | 'podcast_monologue') => {
    createNewProject(type);
    setShowWorkflow(true);
  };

  const handleOpenExistingProject = () => {
    // TODO: Implementar selector de proyectos existentes
    console.log('Opening existing podcast project selector');
  };

  if (showWorkflow && currentProject) {
    return <PodcastCreationWorkflow />;
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Mic className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">Creator de Podcasts</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Produce podcasts profesionales desde briefing hasta distribución programada, con transcripción automática y tu BrandKit aplicado consistentemente
          </p>
        </div>

        {/* BrandKit Status */}
        <BrandKitAlert />

        {/* Podcast Type Selection */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">¿Qué tipo de podcast quieres crear?</h2>
            <p className="text-muted-foreground">Cada formato está optimizado para diferentes objetivos y audiencias</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {PODCAST_TYPE_OPTIONS.map((option) => {
              const Icon = option.icon;
              
              return (
                <Card 
                  key={option.type} 
                  className="p-8 hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-opacity-50" 
                  onClick={() => handleCreateProject(option.type as 'podcast_interview' | 'podcast_monologue')}
                >
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className={`w-16 h-16 bg-gradient-to-br ${option.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-100">
                          <Plus className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <h3 className="text-xl font-bold">{option.title}</h3>
                        <p className="text-muted-foreground">{option.description}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-center items-center gap-4 text-sm">
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {option.duration}
                        </Badge>
                        <Badge variant="secondary">
                          IA + BrandKit
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-600 text-center">Plataformas principales:</p>
                        <div className="flex flex-wrap justify-center gap-1">
                          {option.platforms.map(platform => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 text-center">Características principales:</p>
                        <div className="grid grid-cols-2 gap-1">
                          {option.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="w-1.5 h-1.5 bg-current rounded-full flex-shrink-0"></span>
                              <span className="text-xs">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button className={`w-full group-hover:shadow-lg transition-all bg-gradient-to-r ${option.gradient} hover:opacity-90 text-lg py-6`}>
                      <Sparkles className="w-5 h-5 mr-3" />
                      Crear {option.title}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Proyectos de Podcast Recientes</h3>
            </div>
            <Button variant="outline" onClick={handleOpenExistingProject}>
              Ver todos
            </Button>
          </div>

          {/* Recent podcast projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-3 hover:bg-gray-50 cursor-pointer transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">Entrevista</Badge>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    <Clock className="w-2 h-2 mr-1" />
                    Programado
                  </Badge>
                </div>
                <h4 className="font-medium text-sm">CEO TechStartup</h4>
                <p className="text-xs text-muted-foreground">Mañana 15:00</p>
                <div className="w-full h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded border flex items-center justify-center">
                  <Users className="w-4 h-4 text-white opacity-70" />
                </div>
              </div>
            </Card>

            <Card className="p-3 hover:bg-gray-50 cursor-pointer transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">Monólogo</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                    <Clock className="w-2 h-2 mr-1" />
                    Editando
                  </Badge>
                </div>
                <h4 className="font-medium text-sm">Futuro del IA</h4>
                <p className="text-xs text-muted-foreground">20 min grabado</p>
                <div className="w-full h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded border flex items-center justify-center">
                  <User className="w-4 h-4 text-white opacity-70" />
                </div>
              </div>
            </Card>

            <Card className="p-3 hover:bg-gray-50 cursor-pointer transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">Entrevista</Badge>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <CheckCircle className="w-2 h-2 mr-1" />
                    Publicado
                  </Badge>
                </div>
                <h4 className="font-medium text-sm">CMO Scale-up</h4>
                <p className="text-xs text-muted-foreground">hace 3 días</p>
                <div className="w-full h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded border flex items-center justify-center">
                  <Users className="w-4 h-4 text-white opacity-70" />
                </div>
              </div>
            </Card>

            <Card className="p-3 hover:bg-gray-50 cursor-pointer transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">Monólogo</Badge>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <CheckCircle className="w-2 h-2 mr-1" />
                    Publicado
                  </Badge>
                </div>
                <h4 className="font-medium text-sm">Mi experiencia como Founder</h4>
                <p className="text-xs text-muted-foreground">hace 1 semana</p>
                <div className="w-full h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded border flex items-center justify-center">
                  <User className="w-4 h-4 text-white opacity-70" />
                </div>
              </div>
            </Card>
          </div>
        </Card>

        {/* Features Overview */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              ¿Qué incluye el Creator de Podcasts?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">1. Briefing IA</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Chat especializado por tipo</li>
                  <li>• Generación de preguntas</li>
                  <li>• BrandKit integrado</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">2. Grabación + Script</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Grabación directa</li>
                  <li>• Carga de archivos</li>
                  <li>• Script IA personalizado</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">3. Transcripción IA</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Transcripción automática</li>
                  <li>• Editor sincronizado</li>
                  <li>• Validación de marca</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">4. Highlights + Clips</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Detección automática</li>
                  <li>• Clips para redes sociales</li>
                  <li>• Formato optimizado</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">5. Publicación Multi</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Programación automática</li>
                  <li>• Múltiples plataformas</li>
                  <li>• Analytics integrado</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Platform Compatibility */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Plataformas Soportadas</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-sm">Spotify</h4>
                <p className="text-xs text-muted-foreground">Podcast + Video</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-sm">Apple Podcasts</h4>
                <p className="text-xs text-muted-foreground">Audio nativo</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-sm">YouTube</h4>
                <p className="text-xs text-muted-foreground">Video + Audio</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-sm">Google Podcasts</h4>
                <p className="text-xs text-muted-foreground">Discovery nativo</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-sm">Anchor</h4>
                <p className="text-xs text-muted-foreground">Distribución masiva</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Brand Integration Notice */}
        {hasBrandKit && (
          <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="flex-1">
                <h4 className="font-medium text-green-800">Tu BrandKit está activo</h4>
                <p className="text-sm text-green-700">
                  Todos los podcasts aplicarán automáticamente tu tono de voz, colores, logos y lineamientos para máxima coherencia en contenido, clips y transcripciones
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function PodcastsCreatorModule() {
  return <PodcastsCreatorContent />;
}

export default PodcastsCreatorModule;