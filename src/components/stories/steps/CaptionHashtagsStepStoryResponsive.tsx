import { useState, useEffect } from 'react';
import { CaptionHashtagsStepStory } from './CaptionHashtagsStepStory';
import { CaptionHashtagsStepStoryMobile } from './CaptionHashtagsStepStoryMobile';

export function CaptionHashtagsStepStoryResponsive() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile ? <CaptionHashtagsStepStoryMobile /> : <CaptionHashtagsStepStory />;
}