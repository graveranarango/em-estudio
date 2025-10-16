import { useState, useEffect } from "react";
import { ConfigurationStepStoryDesign } from "./ConfigurationStepStoryDesign";
import { ConfigurationStepStoryMobile } from "./ConfigurationStepStoryMobile";

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

export function ConfigurationStepStoryResponsive() {
  const isMobile = useIsMobile();

  return isMobile ? <ConfigurationStepStoryMobile /> : <ConfigurationStepStoryDesign />;
}