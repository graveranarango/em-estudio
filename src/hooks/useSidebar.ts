import { useState, useEffect } from 'react';

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false); // Empezar cerrado
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      const wasDesktop = !isMobile && !mobile;
      
      setIsMobile(mobile);
      
      // Si cambiamos de mobile a desktop, abrir sidebar
      if (!mobile && isMobile) {
        setIsOpen(true);
      }
      // Si cambiamos de desktop a mobile, cerrar sidebar
      else if (mobile && !isMobile) {
        setIsOpen(false);
      }
      // En la carga inicial, determinar estado según el dispositivo
      else if (isMobile === false && !mobile) {
        setIsOpen(true);
      }
    };

    // Verificar tamaño inicial
    checkScreenSize();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [isMobile]);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return {
    isOpen,
    isMobile,
    toggle,
    close,
    open
  };
}