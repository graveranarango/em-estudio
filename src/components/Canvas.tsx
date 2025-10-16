import { memo, useEffect, useState } from "react";
import { Card } from "./ui/card";
import AdvancedBrandKitModule from "./brandkit/AdvancedBrandKitModule";
import PostsCreatorModule from "./posts/PostsCreatorModule";
import VideosCreatorModule from "./videos/VideosCreatorModule";
import StoriesCreatorModule from "./stories/StoriesCreatorModule";
import PodcastsCreatorModule from "./podcasts/PodcastsCreatorModule";
import CalendarModule from "./modules/CalendarModule";
import { ChatModuleUpdated } from "./modules/ChatModuleUpdated";
import ChatMobile from "../src/views/chat/mobile/ChatMobile";
import AssetsLibrary from "./assets/AssetsLibrary";
import AnalyticsModule from "./analytics/AnalyticsModule";
import AutomationModule from "./automation/AutomationModule";
import CompetitionModule from "./competition/CompetitionModule";
import { useChatStore } from "@/state/chatStore";

interface CanvasProps {
  activeModule: string;
}

const moduleContent = {
  welcome: {
    title: "Bienvenido al AI Content Studio",
    description: "Selecciona un módulo del menú lateral para comenzar a crear contenido con inteligencia artificial.",
  },
  chat: {
    title: "Chat Maestro",
    description: "Genera contenido conversacional y respuestas automatizadas con IA.",
  },
  posts: {
    title: "Posts / Carrousels",
    description: "Crea publicaciones para redes sociales y carrousels interactivos.",
  },
  videos: {
    title: "Videos",
    description: "Produce y edita contenido audiovisual con herramientas de IA.",
  },
  podcasts: {
    title: "Podcasts",
    description: "Genera scripts, edita audio y crea episodios de podcast.",
  },
  stories: {
    title: "Historias",
    description: "Diseña contenido vertical para stories de Instagram, TikTok y más.",
  },
  analytics: {
    title: "Analítica",
    description: "Analiza el rendimiento de tu contenido y recibe sugerencias inteligentes.",
  },
  automation: {
    title: "Automatización IA",
    description: "Optimiza y automatiza tu estrategia de contenido con inteligencia artificial.",
  },
  competition: {
    title: "Análisis de Competencia",
    description: "Monitorea, compara y optimiza tu presencia frente a la competencia.",
  },
  brandkit: {
    title: "BrandKit",
    description: "Define y gestiona la identidad visual y comunicacional de tu marca.",
  },
  calendar: {
    title: "Calendar",
    description: "Planifica y programa tu contenido en el calendario editorial.",
  },
  library: {
    title: "Biblioteca",
    description: "Administra todos tus archivos, plantillas y recursos creativos.",
  },
  settings: {
    title: "Ajustes",
    description: "Configura tu perfil, preferencias y opciones del sistema.",
  },
};

function Canvas({ activeModule }: CanvasProps) {
  const { isMobileView, setIsMobileView } = useChatStore();
  const [isClient, setIsClient] = useState(false);

  // Mobile detection
  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobileView]);

  // Renderizar módulos específicos con BrandKit integrado
  const renderModule = () => {
    switch (activeModule) {
      case 'brandkit':
        return <AdvancedBrandKitModule />;
      case 'chat':
        // Use mobile chat on mobile devices
        if (isClient && isMobileView) {
          return <ChatMobile />;
        }
        return <ChatModuleUpdated />;
      case 'posts':
        return <PostsCreatorModule />;
      case 'videos':
        return <VideosCreatorModule />;
      case 'stories':
        return <StoriesCreatorModule />;
      case 'podcasts':
        return <PodcastsCreatorModule />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'automation':
        return <AutomationModule />;
      case 'competition':
        return <CompetitionModule />;
      case 'calendar':
        return <CalendarModule />;
      case 'library':
        return <AssetsLibrary />;
      default:
        return null;
    }
  };

  const moduleComponent = renderModule();
  if (moduleComponent) {
    return (
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-white overflow-auto">
        {moduleComponent}
      </main>
    );
  }

  const content = moduleContent[activeModule as keyof typeof moduleContent] || moduleContent.welcome;
  
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
      <Card className="h-full p-4 md:p-8 flex flex-col items-center justify-center text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-muted-foreground">
            {content.title}
          </h2>
          <p className="text-muted-foreground/80">
            {content.description}
          </p>
          
          {activeModule === 'welcome' && (
            <div className="mt-8 p-6 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <p className="text-muted-foreground/60">
                Área de trabajo principal
              </p>
            </div>
          )}
          
          {activeModule !== 'welcome' && (
            <div className="mt-8 space-y-4">
              <div className="p-4 bg-muted/10 rounded-lg border border-muted-foreground/10">
                <p className="text-muted-foreground/60">
                  Módulo: {content.title}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-muted/10 rounded border border-muted-foreground/10 flex items-center justify-center">
                  <span className="text-muted-foreground/40">Herramienta 1</span>
                </div>
                <div className="h-20 bg-muted/10 rounded border border-muted-foreground/10 flex items-center justify-center">
                  <span className="text-muted-foreground/40">Herramienta 2</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}

export default memo(Canvas);