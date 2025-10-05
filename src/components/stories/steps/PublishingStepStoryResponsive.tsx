import { useState, useEffect } from 'react';
import { PublishingStepStory } from './PublishingStepStory';
import { PublishingStepStoryMobile } from './PublishingStepStoryMobile';

export function PublishingStepStoryResponsive() {
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

  return isMobile ? <PublishingStepStoryMobile /> : <PublishingStepStory />;
}