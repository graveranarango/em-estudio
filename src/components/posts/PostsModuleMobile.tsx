import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { ChatTimeline } from "./ChatTimeline";
import { ChatBubble } from "./ChatBubble";
import { 
  ChevronLeft, 
  PanelRightOpen, 
  Send, 
  Upload,
  Paperclip,
  X
} from "lucide-react";

// Mock data for demonstration
const mockMessages = [
  {
    id: "1",
    content: "Definamos el brief del post.",
    role: "system" as const,
    timestamp: new Date("2024-01-15T10:24:00Z")
  },
  {
    id: "2", 
    content: "Quiero un post para la promo.",
    role: "user" as const,
    timestamp: new Date("2024-01-15T10:25:00Z")
  },
  {
    id: "3",
    content: "Empecemos por el objetivo.",
    role: "assistant" as const,
    timestamp: new Date("2024-01-15T10:26:00Z")
  }
];

interface PostsModuleMobileProps {
  onBack?: () => void;
}

export function PostsModuleMobile({ onBack }: PostsModuleMobileProps) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeBriefTab, setActiveBriefTab] = useState("Objetivo");
  const [showQAOverlay, setShowQAOverlay] = useState(true);
  
  // Brief form data
  const [briefData, setBriefData] = useState({
    objetivo: "",
    cta: "",
    hashtags: ""
  });

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    
    // Aquí se agregaría la lógica para enviar el mensaje
    console.log("Enviando mensaje:", currentMessage);
    setCurrentMessage("");
  };

  const briefTabs = [
    "Objetivo",
    "Audiencia", 
    "Oferta",
    "Marca",
    "Formato",
    "CTA",
    "Hashtags",
    "Assets",
    "Restricciones",
    "Aceptación"
  ];

  return (
    <div className="h-screen w-full max-w-[390px] mx-auto flex flex-col relative" style={{ backgroundColor: 'var(--color-canvas)' }}>
      {/* Header */}
      <header className="h-14 px-3 flex items-center justify-between border-b shadow-sm" style={{ backgroundColor: 'var(--color-surface-elev-1)' }}>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <h1 className="text-center flex-1 px-2">Crear Post — Paso 1</h1>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2"
            >
              <PanelRightOpen className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          
          <SheetContent side="right" className="w-[360px] p-0">
            <SheetHeader className="h-12 px-3 flex-row items-center justify-between border-b" style={{ backgroundColor: 'var(--color-surface)' }}>
              <SheetTitle className="text-sm">Brief</SheetTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsSheetOpen(false)}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </SheetHeader>
            
            {/* Brief Tabs */}
            <Tabs value={activeBriefTab} onValueChange={setActiveBriefTab} className="h-full flex flex-col">
              <div className="border-b">
                <TabsList className="grid grid-cols-5 w-full h-auto p-1 gap-1">
                  {briefTabs.slice(0, 5).map((tab) => (
                    <TabsTrigger 
                      key={tab} 
                      value={tab}
                      className="text-xs py-2 px-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsList className="grid grid-cols-5 w-full h-auto p-1 gap-1">
                  {briefTabs.slice(5).map((tab) => (
                    <TabsTrigger 
                      key={tab} 
                      value={tab}
                      className="text-xs py-2 px-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {/* Brief Form Content */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                <TabsContent value="Objetivo" className="space-y-3 mt-0">
                  <div className="space-y-2">
                    <label className="text-sm">Objetivo</label>
                    <Textarea
                      placeholder="¿Qué debe lograr?"
                      value={briefData.objetivo}
                      onChange={(e) => setBriefData(prev => ({ ...prev, objetivo: e.target.value }))}
                      className="min-h-[80px] rounded-lg"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="CTA" className="space-y-3 mt-0">
                  <div className="space-y-2">
                    <label className="text-sm">CTA</label>
                    <Input
                      placeholder="Ej.: Compra ahora"
                      value={briefData.cta}
                      onChange={(e) => setBriefData(prev => ({ ...prev, cta: e.target.value }))}
                      className="rounded-lg"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="Hashtags" className="space-y-3 mt-0">
                  <div className="space-y-2">
                    <label className="text-sm">Hashtags</label>
                    <Input
                      placeholder="#marca #promo"
                      value={briefData.hashtags}
                      onChange={(e) => setBriefData(prev => ({ ...prev, hashtags: e.target.value }))}
                      className="rounded-lg"
                    />
                  </div>
                </TabsContent>
                
                {/* Placeholder for other tabs */}
                {briefTabs.filter(tab => !["Objetivo", "CTA", "Hashtags"].includes(tab)).map(tab => (
                  <TabsContent key={tab} value={tab} className="space-y-3 mt-0">
                    <div className="text-center text-muted-foreground py-8">
                      <p>Contenido de {tab}</p>
                      <p className="text-xs">En desarrollo</p>
                    </div>
                  </TabsContent>
                ))}
              </div>
              
              {/* Brief Footer */}
              <div className="h-12 px-3 flex items-center justify-between border-t" style={{ backgroundColor: 'var(--color-surface)' }}>
                <Badge variant="outline" className="text-xs">
                  Brief: 0/10
                </Badge>
                <div className="flex-1" />
                <Button size="sm" className="text-xs">
                  Continuar
                </Button>
              </div>
            </Tabs>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-canvas)' }}>
        {/* Chat Timeline */}
        <div className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-3">
            {/* System message */}
            <ChatBubble 
              role="system"
              content="Definamos el brief del post."
              timestamp="10:24"
            />
            
            {/* User message */}
            <ChatBubble 
              role="user"
              content="Quiero un post para la promo."
              timestamp="10:25"
            />
            
            {/* Assistant message */}
            <ChatBubble 
              role="assistant"
              content="Empecemos por el objetivo."
              timestamp="10:26"
            />
          </div>
        </div>

        {/* Composer */}
        <div className="h-32 p-3 border-t shadow-sm" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="flex items-start gap-2">
            <Button variant="ghost" size="sm" className="p-2 mt-1">
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <Textarea
              placeholder="Responde…"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              className="flex-1 min-h-[60px] resize-none rounded-lg"
              rows={3}
            />
            
            <div className="flex flex-col gap-1 mt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg"
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir
              </Button>
              
              <Button 
                size="sm"
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
                className="h-9"
              >
                Enviar
              </Button>
            </div>
          </div>
          
          <div className="text-right mt-2">
            <p className="text-xs text-muted-foreground opacity-70">
              PNG/JPG, PDF, TXT (diseño)
            </p>
          </div>
        </div>
      </main>

      {/* QA + Accessibility Overlay */}
      {showQAOverlay && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-4 max-w-sm w-full space-y-4 border shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Checklist de QA y A11y</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowQAOverlay(false)}
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Visual Checklist */}
            <Card className="p-3">
              <h4 className="font-medium text-xs mb-2">Checklist Visual</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>✓ Header fijo; Composer sticky; Timeline scrolleable</li>
                <li>✓ Panel Brief como sheet derecho (cerrado por defecto)</li>
                <li>✓ Espaciado base 8px; radios consistentes</li>
              </ul>
            </Card>
            
            {/* A11y Checklist */}
            <Card className="p-3">
              <h4 className="font-medium text-xs mb-2">Checklist A11y</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>✓ Contraste AA en botones y texto</li>
                <li>✓ Focus visible (outline 2px) en inputs/botones</li>
                <li>✓ Labels claros para íconos (Back, Panel, Enviar)</li>
              </ul>
            </Card>
            
            <div className="text-center">
              <Button 
                size="sm"
                onClick={() => setShowQAOverlay(false)}
                className="text-xs"
              >
                Cerrar Overlay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}