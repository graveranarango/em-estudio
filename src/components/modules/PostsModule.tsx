import { useState } from "react";
import { PostCreationWorkflow } from "../posts/PostCreationWorkflow";
import { CarouselCreationWorkflow } from "../posts/CarouselCreationWorkflow";
import { PostProjectProvider } from "../../contexts/PostProjectContext";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { 
  FileText, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  Image,
  Grid3X3
} from "lucide-react";

export function PostsModule() {
  const [activeSubModule, setActiveSubModule] = useState<'posts' | 'carousels'>('posts');

  const renderContent = () => {
    switch (activeSubModule) {
      case 'posts':
        return <PostCreationWorkflow />;
      case 'carousels':
        return <CarouselCreationWorkflow />;
      default:
        return <PostCreationWorkflow />;
    }
  };

  return (
    <PostProjectProvider>
      <div className="h-full flex flex-col">
        {/* Sub-Module Navigation */}
        <div className="bg-white border-b p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Posts & Carousels</h1>
                  <p className="text-muted-foreground">Crea contenido visual para redes sociales</p>
                </div>
              </div>
            </div>

            {/* Sub-Module Tabs */}
            <div className="flex gap-2">
              <Button
                variant={activeSubModule === 'posts' ? 'default' : 'outline'}
                onClick={() => setActiveSubModule('posts')}
                className="flex items-center gap-2"
              >
                <Image className="w-4 h-4" />
                Posts
                {activeSubModule === 'posts' && (
                  <Badge variant="secondary" className="ml-2">Activo</Badge>
                )}
              </Button>
              
              <Button
                variant={activeSubModule === 'carousels' ? 'default' : 'outline'}
                onClick={() => setActiveSubModule('carousels')}
                className="flex items-center gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                Carousels
                {activeSubModule === 'carousels' && (
                  <Badge variant="secondary" className="ml-2">Activo</Badge>
                )}
              </Button>
            </div>

            {/* Quick Info */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`p-4 border-2 transition-all cursor-pointer ${
                activeSubModule === 'posts' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
              }`} onClick={() => setActiveSubModule('posts')}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-blue-100 text-blue-600">
                    <Image className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Posts Individuales</h3>
                    <p className="text-sm text-muted-foreground">Crea posts únicos con IA</p>
                  </div>
                  {activeSubModule === 'posts' && (
                    <div className="text-blue-600">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </Card>

              <Card className={`p-4 border-2 transition-all cursor-pointer ${
                activeSubModule === 'carousels' ? 'border-purple-500 bg-purple-50' : 'hover:border-gray-300'
              }`} onClick={() => setActiveSubModule('carousels')}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-purple-100 text-purple-600">
                    <Grid3X3 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Carousels Multi-slide</h3>
                    <p className="text-sm text-muted-foreground">Series de slides conectados</p>
                  </div>
                  {activeSubModule === 'carousels' && (
                    <div className="text-purple-600">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </PostProjectProvider>
  );
}