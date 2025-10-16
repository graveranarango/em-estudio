import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { BrandKitAlert } from "../common/BrandKitAlert";
import { PostCreationWorkflow } from "./PostCreationWorkflow";
import { PostsModuleMobile } from "./PostsModuleMobile";
import { usePostProject } from "../../contexts/PostProjectContext";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { useIsMobile } from "../ui/use-mobile";
import { 
  FileText, 
  Layers, 
  Plus, 
  FolderOpen,
  Sparkles,
  Clock,
  CheckCircle
} from "lucide-react";

function PostsCreatorContent() {
  const { hasBrandKit } = useBrandKit();
  const { currentProject, createNewProject } = usePostProject();
  const isMobile = useIsMobile();
  const [showWorkflow, setShowWorkflow] = useState(!!currentProject);
  const [showMobileView, setShowMobileView] = useState(false);
  const [forceMobileDemo, setForceMobileDemo] = useState(false);

  const handleCreateProject = (type: 'post' | 'carousel') => {
    createNewProject(type);
    if (isMobile || forceMobileDemo) {
      setShowMobileView(true);
    } else {
      setShowWorkflow(true);
    }
  };

  const handleOpenExistingProject = () => {
    // TODO: Implementar selector de proyectos existentes
    console.log('Opening existing project selector');
  };

  const handleBackFromMobile = () => {
    setShowMobileView(false);
  };

  // Mobile view
  if ((isMobile || forceMobileDemo) && showMobileView) {
    return <PostsModuleMobile onBack={handleBackFromMobile} />;
  }

  // Desktop workflow
  if (showWorkflow && currentProject) {
    return <PostCreationWorkflow />;
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">Creator de Posts y Carruseles</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Flujo completo de creación desde briefing hasta publicación programada, con tu BrandKit aplicado automáticamente en cada paso
          </p>
          
          {/* Mobile Demo Toggle */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button 
              variant={forceMobileDemo ? "default" : "outline"}
              size="sm"
              onClick={() => setForceMobileDemo(!forceMobileDemo)}
              className="text-sm"
            >
              📱 Vista Móvil D4 (Demo)
            </Button>
          </div>
        </div>

        {/* BrandKit Status */}
        <BrandKitAlert />

        {/* Project Creation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Post */}
          <Card className="p-8 hover:shadow-lg transition-all cursor-pointer group" onClick={() => handleCreateProject('post')}>
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-bold">Crear Post Simple</h3>
                <p className="text-muted-foreground">
                  Publicación única para redes sociales con diseño profesional y copywriting optimizado
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary">IA + BrandKit</Badge>
                  <Badge variant="secondary">Multi-plataforma</Badge>
                  <Badge variant="secondary">Programación</Badge>
                </div>
                
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Diseño automático con tu marca</li>
                  <li>✓ Copywriting con tu tono de voz</li>
                  <li>✓ Optimizado por red social</li>
                  <li>✓ Publicación programada</li>
                </ul>
              </div>

              <Button className="w-full group-hover:bg-blue-600">
                <Sparkles className="w-4 h-4 mr-2" />
                Comenzar Post
              </Button>
            </div>
          </Card>

          {/* Create Carousel */}
          <Card className="p-8 hover:shadow-lg transition-all cursor-pointer group" onClick={() => handleCreateProject('carousel')}>
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layers className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-bold">Crear Carrusel</h3>
                <p className="text-muted-foreground">
                  Serie de slides interactivas para contar historias completas y generar mayor engagement
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary">Multi-slide</Badge>
                  <Badge variant="secondary">Storytelling</Badge>
                  <Badge variant="secondary">Alto engagement</Badge>
                </div>
                
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Hasta 10 slides por carrusel</li>
                  <li>✓ Narrativa coherente automática</li>
                  <li>✓ Transiciones optimizadas</li>
                  <li>✓ Métricas de deslizamiento</li>
                </ul>
              </div>

              <Button className="w-full group-hover:bg-purple-600">
                <Sparkles className="w-4 h-4 mr-2" />
                Comenzar Carrusel
              </Button>
            </div>
          </Card>
        </div>

        {/* Existing Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Proyectos Recientes</h3>
            </div>
            <Button variant="outline" onClick={handleOpenExistingProject}>
              Ver todos
            </Button>
          </div>

          {/* Mock recent projects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 hover:bg-gray-50 cursor-pointer">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Post</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Borrador
                  </Badge>
                </div>
                <h4 className="font-medium">Lanzamiento Producto X</h4>
                <p className="text-sm text-muted-foreground">Última edición: hace 2 horas</p>
                <div className="w-full h-24 bg-gray-200 rounded border"></div>
              </div>
            </Card>

            <Card className="p-4 hover:bg-gray-50 cursor-pointer">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Carrusel</Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Programado
                  </Badge>
                </div>
                <h4 className="font-medium">Tutorial 5 pasos</h4>
                <p className="text-sm text-muted-foreground">Se publica: Mañana 10:00</p>
                <div className="w-full h-24 bg-gray-200 rounded border"></div>
              </div>
            </Card>

            <Card className="p-4 hover:bg-gray-50 cursor-pointer">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Post</Badge>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Publicado
                  </Badge>
                </div>
                <h4 className="font-medium">Testimonio Cliente</h4>
                <p className="text-sm text-muted-foreground">Publicado: hace 3 días</p>
                <div className="w-full h-24 bg-gray-200 rounded border"></div>
              </div>
            </Card>
          </div>
        </Card>

        {/* Features Overview */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              ¿Qué incluye el Creator completo?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">1. Briefing Inteligente</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Chat con IA especializada</li>
                  <li>• Subida de referencias</li>
                  <li>• Definición de objetivos</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">2. Configuración Automática</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Formatos por plataforma</li>
                  <li>• Aplicación de BrandKit</li>
                  <li>• Optimización visual</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">3. Generación + Edición</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Múltiples opciones de diseño</li>
                  <li>• Editor con capas</li>
                  <li>• Chat de edición por IA</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">4. Copy + Publicación</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Copywriting automático</li>
                  <li>• Hashtags sugeridos</li>
                  <li>• Programación multi-red</li>
                </ul>
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
                  Todos los contenidos creados aplicarán automáticamente tus colores, tipografías, logos y tono de voz corporativo
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function PostsCreatorModule() {
  return <PostsCreatorContent />;
}

export default PostsCreatorModule;