import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { BrandKitAlert } from "../common/BrandKitAlert";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { useVideoProject } from "../../contexts/VideoProjectContext";
import { VideoCreationWorkflow } from "../videos/VideoCreationWorkflow";
import { ShortCreationWorkflow } from "../videos/ShortCreationWorkflow";
import { VideoType } from "../../types/videos";
import { 
  Video, 
  Plus,
  Play,
  Monitor,
  Smartphone,
  BookOpen,
  ArrowRight
} from "lucide-react";

const VIDEO_TYPE_OPTIONS = [
  {
    type: 'short' as VideoType,
    title: 'Short / Reel',
    description: 'Videos cortos y dinámicos de menos de 60 segundos',
    icon: Smartphone,
    color: 'from-pink-500 to-rose-500',
    platforms: ['Instagram', 'TikTok', 'YouTube Shorts']
  },
  {
    type: 'tutorial' as VideoType,
    title: 'Video con Flow',
    description: 'Producción premium con storyboard y narrativa estructurada',
    icon: BookOpen,
    color: 'from-purple-500 to-violet-500',
    platforms: ['YouTube', 'Cursos', 'Documentales']
  }
];

export function VideosModule() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { hasBrandKit } = useBrandKit();
  const { currentProject, createNewProject } = useVideoProject();

  useEffect(() => {
    // Delay initialization to ensure contexts are ready
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  if (!isInitialized) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 mx-auto border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Inicializando módulo Videos...</p>
        </div>
      </div>
    );
  }

  // Si hay un proyecto activo, mostrar el workflow apropiado
  if (currentProject) {
    // Si es un proyecto de Short/Reel, usar el workflow específico
    if (currentProject.type === 'short' || currentProject.type === 'reel') {
      return <ShortCreationWorkflow />;
    }
    // Para otros tipos, usar el workflow general
    return <VideoCreationWorkflow />;
  }

  const handleCreateProject = (type: VideoType) => {
    createNewProject(type);
  };

  // Vista inicial para seleccionar tipo de proyecto
  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg">
              <Video className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Videos</h1>
              <p className="text-gray-600">Crea contenido audiovisual profesional</p>
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Produce contenido audiovisual con tu identidad de marca aplicada automáticamente. 
            Elige el tipo de video que quieres crear.
          </p>
        </div>

        {/* BrandKit Status */}
        <div className="max-w-4xl mx-auto">
          <BrandKitAlert moduleType="video" />
        </div>

        {/* Video Type Selection */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            ¿Qué tipo de video quieres crear?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VIDEO_TYPE_OPTIONS.map((option) => {
              const Icon = option.icon;
              
              return (
                <Card key={option.type} className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 hover:border-purple-300">
                  <div className="p-6 space-y-4">
                    {/* Icon with gradient background */}
                    <div className="text-center">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${option.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900">{option.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{option.description}</p>
                    </div>
                    
                    {/* Platforms */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium">Ideal para:</p>
                      <div className="flex flex-wrap gap-1">
                        {option.platforms.map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <Button 
                      onClick={() => handleCreateProject(option.type)}
                      className={`w-full bg-gradient-to-r ${option.color} hover:opacity-90 text-white shadow-md group-hover:shadow-lg transition-all`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear {option.title}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Brand Integration Info */}
        {hasBrandKit && (
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Video className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 mb-2">BrandKit Activo</h4>
                  <p className="text-green-800 text-sm">
                    Tu identidad de marca se aplicará automáticamente en todos los videos, 
                    incluyendo colores, tipografías, logos y tono de comunicación.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}