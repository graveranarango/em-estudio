import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { BrandKitGlobalStatus } from "./brandkit/BrandKitGlobalStatus";
import { NetworkStatus } from "./common/NetworkStatus";
import { ExportShareActions } from "./chat/ExportShareActions";
import { 
  Menubar, 
  MenubarContent, 
  MenubarItem, 
  MenubarMenu, 
  MenubarSeparator, 
  MenubarTrigger 
} from "./ui/menubar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useSidebarContext } from "../contexts/SidebarContext";
import { useThreads } from "../hooks/useThreads";
import { 
  Plus, 
  Square, 
  Menu, 
  GitBranch, 
  MessageSquare, 
  Hash,
  File,
  Edit,
  Layers,
  Type,
  Share,
  Save,
  FolderPlus,
  Undo,
  Redo,
  Scissors,
  Copy,
  Clipboard,
  Languages,
  CheckSquare,
  FileVideo
} from "lucide-react";

interface HeaderProps {
  activeModule?: string;
  threadId?: string;
  threadTitle?: string;
  messageCount?: number;
  authToken?: string;
  showMasterMenu?: boolean;
}

export function Header({ 
  activeModule, 
  threadId, 
  threadTitle = "Chat sin título", 
  messageCount = 0,
  authToken,
  showMasterMenu = false
}: HeaderProps = {}) {
  const { toggle, isMobile } = useSidebarContext();
  
  // Show export/share actions only in chat module and when there's a thread
  const showExportShare = activeModule === 'chat' && threadId && messageCount > 0;

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Logo y Título */}
      <div className="flex items-center gap-4">
        {/* Botón hamburguesa para mobile */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggle}
            className="md:hidden p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        
        {/* Menú maestro mobile */}
        {showMasterMenu && isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden p-2">
                <Edit className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Archivo</DropdownMenuLabel>
              <DropdownMenuItem>
                <FolderPlus className="mr-2 h-4 w-4" />
                Nuevo proyecto
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Edición</DropdownMenuLabel>
              <DropdownMenuItem>
                <Undo className="mr-2 h-4 w-4" />
                Deshacer
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Redo className="mr-2 h-4 w-4" />
                Rehacer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Exportar</DropdownMenuLabel>
              <DropdownMenuItem>
                <CheckSquare className="mr-2 h-4 w-4" />
                Preflight QA
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileVideo className="mr-2 h-4 w-4" />
                Exportar MP4
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
          <Square className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-foreground font-semibold">AI Content Studio</h1>
          <div className="flex items-center gap-2 -mt-1">
            <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
              Sistema Completo
            </Badge>
          </div>
        </div>
      </div>

      {/* Área central - Master Menu y BrandKit Status */}
      <div className="flex-1 flex items-center justify-center gap-4">
        {/* Master Menu - Solo visible en modo videos con editor avanzado */}
        {showMasterMenu && (
          <div className="hidden lg:block">
            <Menubar className="bg-white border border-gray-200 shadow-sm">
              <MenubarMenu>
                <MenubarTrigger className="text-sm">Archivo</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Nuevo proyecto
                  </MenubarItem>
                  <MenubarItem>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    <Share className="mr-2 h-4 w-4" />
                    Exportar
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              
              <MenubarMenu>
                <MenubarTrigger className="text-sm">Edición</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    <Undo className="mr-2 h-4 w-4" />
                    Deshacer
                  </MenubarItem>
                  <MenubarItem>
                    <Redo className="mr-2 h-4 w-4" />
                    Rehacer
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    <Scissors className="mr-2 h-4 w-4" />
                    Cortar
                  </MenubarItem>
                  <MenubarItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar
                  </MenubarItem>
                  <MenubarItem>
                    <Clipboard className="mr-2 h-4 w-4" />
                    Pegar
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              
              <MenubarMenu>
                <MenubarTrigger className="text-sm">Capas</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    <Layers className="mr-2 h-4 w-4" />
                    Ordenar capas
                  </MenubarItem>
                  <MenubarItem>
                    <Layers className="mr-2 h-4 w-4" />
                    Agrupar
                  </MenubarItem>
                  <MenubarItem>
                    <Square className="mr-2 h-4 w-4" />
                    Bloquear
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              
              <MenubarMenu>
                <MenubarTrigger className="text-sm">Subtítulos</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Generar IA
                  </MenubarItem>
                  <MenubarItem>
                    <Type className="mr-2 h-4 w-4" />
                    Sincronizar
                  </MenubarItem>
                  <MenubarItem>
                    <Languages className="mr-2 h-4 w-4" />
                    Traducir
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              
              <MenubarMenu>
                <MenubarTrigger className="text-sm">Exportar</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Preflight QA
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    <FileVideo className="mr-2 h-4 w-4" />
                    Exportar MP4
                  </MenubarItem>
                  <MenubarItem>
                    <Share className="mr-2 h-4 w-4" />
                    Exportar multiformato
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        )}
        
        <BrandKitGlobalStatus />
        
        {/* Command Palette Indicator - Solo visible con master menu */}
        {showMasterMenu && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-50 px-2 py-1 rounded border">
            <span className="hidden sm:inline">⌘K</span>
            <span className="sm:hidden">⌘</span>
            <span>Paleta de comandos</span>
          </div>
        )}
      </div>

      {/* Actions y Controls */}
      <div className="flex items-center gap-4">
        <NetworkStatus showControls={false} />
        
        {/* Export/Share Actions for Chat Module */}
        {showExportShare && (
          <>
            <div className="h-6 w-px bg-border"></div>
            <ExportShareActions
              threadId={threadId!}
              threadTitle={threadTitle}
              messageCount={messageCount}
              authToken={authToken}
              variant="compact"
            />
          </>
        )}
        
        <div className="h-6 w-px bg-border"></div>
        <Button variant="default" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Proyecto
        </Button>
        
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-muted text-muted-foreground">
            US
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}