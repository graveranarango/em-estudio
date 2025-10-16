import { useState, useEffect } from "react";
import { BriefingStepStoryDesign } from "./BriefingStepStoryDesign";
import { BriefingStepStoryMobile } from "./BriefingStepStoryMobile";

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

export function BriefingStepStoryResponsive() {
  const isMobile = useIsMobile();

  return isMobile ? <BriefingStepStoryMobile /> : <BriefingStepStoryDesign />;
}