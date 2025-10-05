import { Button } from "./ui/button";
import { useSidebarContext } from "../contexts/SidebarContext";
import { PanelLeft, PanelLeftClose } from "lucide-react";

export function SidebarToggle() {
  const { isOpen, isMobile, toggle } = useSidebarContext();

  // No mostrar en mobile
  if (isMobile) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className={`fixed top-20 z-30 bg-background border border-border shadow-md hover:shadow-lg transition-all duration-300 ${
        isOpen ? 'left-64' : 'left-4'
      }`}
      title={isOpen ? "Ocultar sidebar" : "Mostrar sidebar"}
    >
      {isOpen ? (
        <PanelLeftClose className="w-4 h-4" />
      ) : (
        <PanelLeft className="w-4 h-4" />
      )}
    </Button>
  );
}