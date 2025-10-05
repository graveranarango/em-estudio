import React, { useState, Suspense } from "react";
import { Button } from "./ui/button";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BrandKitProvider } from "../contexts/BrandKitContext";
import { SidebarProvider } from "../contexts/SidebarContext";
import { VideoProjectProvider } from "../contexts/VideoProjectContext";
import { PostProjectProvider } from "../contexts/PostProjectContext";
import { StoryProjectProvider } from "../contexts/StoryProjectContext";
import { PodcastProjectProvider } from "../contexts/PodcastProjectContext";

// Importando módulos esenciales directamente
import { ChatModuleUpdated } from "./modules/ChatModuleUpdated";
import StoriesCreatorModule from "./stories/StoriesCreatorModule";

// Lazy loading para otros módulos para evitar problemas de importación
const PostsCreatorModule = React.lazy(() => import("./posts/PostsCreatorModule"));
const VideosCreatorModule = React.lazy(() => import("./videos/VideosCreatorModule"));
const PodcastsCreatorModule = React.lazy(() => import("./podcasts/PodcastsCreatorModule"));
const CalendarModule = React.lazy(() => import("./modules/CalendarModule").then(m => ({ default: m.CalendarModule })));
const AssetsLibrary = React.lazy(() => import("./assets/AssetsLibrary"));
const AdvancedBrandKitModule = React.lazy(() => import("./brandkit/AdvancedBrandKitModule"));
const AnalyticsModule = React.lazy(() => import("./analytics/AnalyticsModule"));
const AutomationModule = React.lazy(() => import("./automation/AutomationModule"));
const CompetitionModule = React.lazy(() => import("./competition/CompetitionModule"));

interface AIContentStudioProps {}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 mx-auto border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Cargando módulo...</p>
      </div>
    </div>
  );
}

// Error Fallback Component
function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <p className="text-red-500 font-medium">Error cargando el módulo</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <div className="space-x-2">
          <Button onClick={resetError} variant="outline">
            Reintentar
          </Button>
          <Button onClick={() => window.location.reload()}>
            Recargar aplicación
          </Button>
        </div>
      </div>
    </div>
  );
}

const renderModule = (activeModule: string, error: Error | null, resetError: () => void) => {
  if (error) {
    return <ErrorFallback error={error} resetError={resetError} />;
  }

  try {
    switch (activeModule) {
      case 'chat':
        return <ChatModuleUpdated />;
      case 'stories':
        return <StoriesCreatorModule />;
      case 'posts':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PostsCreatorModule />
          </Suspense>
        );
      case 'videos':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <VideosCreatorModule />
          </Suspense>
        );
      case 'podcasts':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PodcastsCreatorModule />
          </Suspense>
        );
      case 'calendar':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CalendarModule />
          </Suspense>
        );
      case 'library':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AssetsLibrary />
          </Suspense>
        );
      case 'brandkit':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AdvancedBrandKitModule />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AnalyticsModule />
          </Suspense>
        );
      case 'automation':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AutomationModule />
          </Suspense>
        );
      case 'competition':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CompetitionModule />
          </Suspense>
        );
      default:
        return <ChatModuleUpdated />;
    }
  } catch (error) {
    console.error('Error rendering module:', error);
    return <ErrorFallback error={error as Error} resetError={resetError} />;
  }
};

export function AIContentStudio({}: AIContentStudioProps) {
  const [activeModule, setActiveModule] = useState('chat');
  const [error, setError] = useState<Error | null>(null);

  // Master menu activo para módulos avanzados
  const showMasterMenu = ['videos', 'podcasts'].includes(activeModule);

  const resetError = () => setError(null);

  const handleModuleChange = (module: string) => {
    setError(null);
    setActiveModule(module);
  };

  return (
    <BrandKitProvider>
      <VideoProjectProvider>
        <PostProjectProvider>
          <StoryProjectProvider>
            <PodcastProjectProvider>
              <SidebarProvider>
                <div className="flex min-h-screen bg-canvas">
                  {/* Sidebar */}
                  <Sidebar 
                    activeModule={activeModule} 
                    onModuleChange={handleModuleChange} 
                  />
                  
                  {/* Main Content Area */}
                  <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <Header 
                      activeModule={activeModule} 
                      showMasterMenu={showMasterMenu}
                    />
                    
                    {/* Module Content */}
                    <main className="flex-1 overflow-hidden">
                      {renderModule(activeModule, error, resetError)}
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            </PodcastProjectProvider>
          </StoryProjectProvider>
        </PostProjectProvider>
      </VideoProjectProvider>
    </BrandKitProvider>
  );
}