import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { BrandKitAlert } from "../common/BrandKitAlert";
import { VideoCreationWorkflow } from "./VideoCreationWorkflow";
import { ShortCreationWorkflow } from "./ShortCreationWorkflow";
import { useVideoProject } from "../../contexts/VideoProjectContext";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { VideoType } from "../../types/videos";
import { 
  Video, 
  Play, 
  Smartphone, 
  Monitor,
  Tv,
  Plus, 
  FolderOpen,
  Sparkles,
  Clock,
  CheckCircle,
  Target,
  BookOpen,
  Megaphone
} from "lucide-react";

const VIDEO_TYPE_OPTIONS = [
  {
    type: 'short' as VideoType,
    title: 'Shorts / Reels',
    description: 'Workflow de 6 pasos: Briefing → Configuración → Generación → Edición → Captions → Publicación',
    icon: Smartphone,
    gradient: 'from-pink-500 to-purple-600',
    duration: '15-90s',
    platforms: ['Instagram', 'TikTok', 'YouTube Shorts'],
    features: ['Grid de propuestas 9:16', 'Timeline simple', 'Texto, música y overlays', 'Captions & Hashtags']
  },
  {
    type: 'video_long' as VideoType,
    title: 'Videos Largos con Flow Narrativo',
    description: 'Workflow de 7 pasos: Briefing (Flow) → Configuración → Storyboard → Generación → Edición Multipista → Captions → Publicación',
    icon: Monitor,
    gradient: 'from-blue-500 to-blue-600',
    duration: '2-20min',
    platforms: ['YouTube', 'LinkedIn', 'Website'],
    features: ['Cards de escenas', 'Previews IA por bloque', 'Edición multipista (Prompts A-D)', 'Subtítulos multi-idioma']
  }
];

function VideosCreatorContent() {
  const { hasBrandKit } = useBrandKit();
  const { currentProject, createNewProject } = useVideoProject();
  const [showWorkflow, setShowWorkflow] = useState(!!currentProject);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateProject = (type: VideoType) => {
    try {
      setIsLoading(true);
      createNewProject(type);
      setShowWorkflow(true);
    } catch (error) {
      console.error('Error creating video project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenExistingProject = () => {
    // TODO: Implementar selector de proyectos existentes
    console.log('Opening existing video project selector');
  };

  if (showWorkflow && currentProject) {
    try {
      // Detectar automáticamente el workflow basado en el tipo de proyecto
      if (currentProject.type === 'short') {
        return <ShortCreationWorkflow />;
      } else {
        return <VideoCreationWorkflow />;
      }
    } catch (error) {
      console.error('Error loading video workflow:', error);
      setShowWorkflow(false);
    }
  }
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 mx-auto border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Creando proyecto de video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 text-white">
              <Video className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">Creator de Videos</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Produce contenido audiovisual profesional desde briefing hasta publicación programada, con tu BrandKit aplicado automáticamente
          </p>
        </div>

        {/* BrandKit Status */}
        <BrandKitAlert />

        {/* Video Type Selection */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">¿Qué tipo de video quieres crear?</h2>
            <p className="text-muted-foreground">Cada tipo está optimizado para diferentes plataformas y objetivos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {VIDEO_TYPE_OPTIONS.map((option) => {
              const Icon = option.icon;
              
              return (
                <Card 
                  key={option.type} 
                  className="p-8 hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-opacity-50" 
                  onClick={() => handleCreateProject(option.type)}
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

        {/* Existing Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Proyectos de Video Recientes</h3>
            </div>
            <Button variant="outline" onClick={handleOpenExistingProject}>
              Ver todos
            </Button>
          </div>

          {/* Mock recent video projects */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 hover:bg-gray-50 cursor-pointer">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs">Shorts/Reels</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Paso 4/6
                  </Badge>
                </div>
                <h4 className="font-medium">Tips JavaScript</h4>
                <p className="text-sm text-muted-foreground">En edición • 45s</p>
                <div className="w-full h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded border flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-white opacity-70" />
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:bg-gray-50 cursor-pointer">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs">Video Largo</Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Programado
                  </Badge>
                </div>
                <h4 className="font-medium">Masterclass React</h4>
                <p className="text-sm text-muted-foreground">Flow narrativo • 15min</p>
                <div className="w-full h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded border flex items-center justify-center">
                  <Monitor className="w-8 h-8 text-white opacity-70" />
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:bg-gray-50 cursor-pointer">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs">Shorts/Reels</Badge>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Publicado
                  </Badge>
                </div>
                <h4 className="font-medium">CSS Grid Hacks</h4>
                <p className="text-sm text-muted-foreground">Viral en TikTok • 30s</p>
                <div className="w-full h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded border flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-white opacity-70" />
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:bg-gray-50 cursor-pointer">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs">Video Largo</Badge>
                  <Badge className="bg-purple-100 text-purple-800">
                    Paso 3/7
                  </Badge>
                </div>
                <h4 className="font-medium">Guía Backend Node.js</h4>
                <p className="text-sm text-muted-foreground">En storyboard • 12min</p>
                <div className="w-full h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded border flex items-center justify-center">
                  <Monitor className="w-8 h-8 text-white opacity-70" />
                </div>
              </div>
            </Card>
          </div>
        </Card>

        {/* Features Overview */}
        <Card className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-600" />
              ¿Qué incluye el Creator de Videos?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shorts/Reels Features */}
              <div className="space-y-4">
                <h4 className="font-medium text-base text-pink-600 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Workflow Shorts/Reels (6 pasos)
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-sm font-medium">1. Briefing</span>
                    <p className="text-xs text-gray-600">Chat especializado en contenido viral</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium">2. Configuración</span>
                    <p className="text-xs text-gray-600">Formato, duración, estilo y versiones</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium">3. Generación</span>
                    <p className="text-xs text-gray-600">Grid de propuestas 9:16</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium">4. Edición</span>
                    <p className="text-xs text-gray-600">Timeline simple con texto, música y overlays</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium">5. Captions & Hashtags</span>
                    <p className="text-xs text-gray-600">Optimización por plataforma</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium">6. Publicación</span>
                    <p className="text-xs text-gray-600">Programación multicanal</p>
                  </div>
                </div>
              </div>

              {/* Videos Largos Features */}
              <div className="space-y-4">
                <h4 className="font-medium text-base text-blue-600 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Workflow Videos Largos con Flow (7 pasos)
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-sm font-medium">1. Briefing (Flow)</span>
                    <p className="text-xs text-gray-600">Selección de Flow narrativo</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium">2. Configuración Técnica</span>
                    <p className="text-xs text-gray-600">Formato, duración, estilo y versiones</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium">3. Storyboard Narrativo</span>
                    <p className="text-xs text-gray-600">Cards de escenas secuenciales</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium">4. Generación de Escenas</span>
                    <p className="text-xs text-gray-600">Previews IA por bloque</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium">5. Edición Multipista</span>
                    <p className="text-xs text-gray-600">Prompts A–D avanzados</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium">6. Captions & Subtítulos</span>
                    <p className="text-xs text-gray-600">Multi-idioma finales</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium">7. Publicación Final</span>
                    <p className="text-xs text-gray-600">Programación con thumbnails custom</p>
                  </div>
                </div>
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
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-black to-gray-800 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-sm">TikTok</h4>
                <p className="text-xs text-muted-foreground">Vertical • 15-180s</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-sm">Instagram</h4>
                <p className="text-xs text-muted-foreground">Reels • 15-90s</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-sm">YouTube</h4>
                <p className="text-xs text-muted-foreground">Shorts + Long • Sin límite</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-700 to-blue-800 rounded-lg flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-sm">LinkedIn</h4>
                <p className="text-xs text-muted-foreground">Video • Hasta 10min</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center">
                  <Tv className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-sm">X (Twitter)</h4>
                <p className="text-xs text-muted-foreground">Video • Hasta 2:20</p>
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
                  Todos los videos aplicarán automáticamente tus colores, tipografías, logos, animaciones y tono de voz corporativo
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function VideosCreatorModule() {
  return <VideosCreatorContent />;
}

export default VideosCreatorModule;