import { memo } from "react";
import { Button } from "./ui/button";
import { useSidebarContext } from "../contexts/SidebarContext";
import { 
  Bot, 
  Image, 
  Video, 
  Mic, 
  Smartphone, 
  Calendar, 
  Folder, 
  Settings,
  Palette,
  BarChart3,
  Zap,
  Target,
  X
} from "lucide-react";

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  highlight?: boolean;
}

const menuItems: MenuItem[] = [
  { id: 'chat', label: 'Chat Maestro', icon: Bot, highlight: true },
  { id: 'posts', label: 'Posts/Carrousels', icon: Image },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'podcasts', label: 'Podcasts', icon: Mic },
  { id: 'stories', label: 'Historias', icon: Smartphone },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'library', label: 'Biblioteca', icon: Folder },
  { id: 'brandkit', label: 'BrandKit', icon: Palette },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'automation', label: 'Automatización', icon: Zap },
  { id: 'competition', label: 'Competencia', icon: Target }
];

const Sidebar = memo(function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  const { isOpen, isMobile, close } = useSidebarContext();

  const handleModuleChange = (module: string) => {
    onModuleChange(module);
    // En mobile, cerrar sidebar al seleccionar un módulo
    if (isMobile) {
      close();
    }
  };

  if (!isOpen && !isMobile) {
    return null;
  }

  return (
    <>
      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={close}
        />
      )}

      <aside 
        className={`
          ${isMobile 
            ? `fixed left-0 top-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'relative w-1/5 min-w-64'
          }
          bg-sidebar border-r border-sidebar-border flex flex-col
        `}
      >
        {/* Header del sidebar en mobile */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <h2 className="text-sidebar-foreground">AI Content Studio</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={close}
              className="p-2 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Menú principal */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            const isHighlighted = item.highlight;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-12 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                  isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground' 
                    : ''
                } ${
                  isHighlighted && !isActive 
                    ? 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 hover:from-purple-100 hover:to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-700' 
                    : ''
                }`}
                onClick={() => handleModuleChange(item.id)}
              >
                <Icon className={`w-5 h-5 ${isHighlighted && !isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                <span className={`${isHighlighted && !isActive ? 'text-purple-700 font-medium dark:text-purple-300' : ''}`}>
                  {item.label}
                </span>
                {isHighlighted && !isActive && (
                  <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Información del Sistema */}
        <div className="p-4 border-t border-sidebar-border/50">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Sistema Activo</span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Todos los módulos disponibles y funcionando correctamente.
            </p>
          </div>
        </div>


      </aside>
    </>
  );
});

export { Sidebar };