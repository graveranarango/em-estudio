import { useState, useEffect } from "react";
import { GenerationStepStoryDesign } from "./GenerationStepStoryDesign";
import { GenerationStepStoryMobile } from "./GenerationStepStoryMobile";

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

export function GenerationStepStoryResponsive() {
  const isMobile = useIsMobile();

  return isMobile ? <GenerationStepStoryMobile /> : <GenerationStepStoryDesign />;
}