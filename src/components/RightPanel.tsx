import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { 
  Palette, 
  Type, 
  Layout, 
  Layers,
  Upload,
  Download
} from "lucide-react";

interface RightPanelProps {
  activeModule: string;
}

export function RightPanel({ activeModule }: RightPanelProps) {
  const showTools = activeModule !== 'welcome' && activeModule !== 'brandkit';
  
  // Para el módulo BrandKit, mostrar un panel específico
  if (activeModule === 'brandkit') {
    return (
      <aside className="hidden lg:block w-1/5 min-w-64 bg-muted/30 border-l border-border p-4">
        <Card className="h-full p-4">
          <h3 className="mb-4 text-muted-foreground">
            BrandKit Tools
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-muted-foreground/80">Estado</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>IA Activa</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Auto-sync</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="mb-2 text-muted-foreground/80">Aplicaciones</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• Chat Maestro</p>
                <p>• Posts/Carrousels</p>
                <p>• Videos</p>
                <p>• Historias</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="mb-2 text-muted-foreground/80">Vista Rápida</h4>
              <div className="h-16 bg-muted/20 rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                <span className="text-muted-foreground/50 text-xs">
                  BrandKit Preview
                </span>
              </div>
            </div>
          </div>
        </Card>
      </aside>
    );
  }
  
  return null;
}