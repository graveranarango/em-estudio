import { useState, useEffect } from "react";
import { AdvancedEditorStepStoryDesign } from "./AdvancedEditorStepStoryDesign";
import { AdvancedEditorStepStoryMobile } from "./AdvancedEditorStepStoryMobile";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

export function AdvancedEditorStepStoryResponsive() {
  const isMobile = useIsMobile();

  return isMobile ? <AdvancedEditorStepStoryMobile /> : <AdvancedEditorStepStoryDesign />;
}