import React from 'react';
import { useStoryProject } from '../../contexts/StoryProjectContext';

// Importar todos los pasos responsivos
import { BriefingStepStoryResponsive } from './steps/BriefingStepStoryResponsive';
import { ConfigurationStepStoryResponsive } from './steps/ConfigurationStepStoryResponsive';
import { GenerationStepStoryResponsive } from './steps/GenerationStepStoryResponsive';
import { AdvancedEditorStepStoryResponsive } from './steps/AdvancedEditorStepStoryResponsive';
import { CaptionHashtagsStepStoryResponsive } from './steps/CaptionHashtagsStepStoryResponsive';
import { PublishingStepStoryResponsive } from './steps/PublishingStepStoryResponsive';

function StoriesCreatorModule() {
  const { currentStep, currentProject } = useStoryProject();

  // Si no hay proyecto activo, crear uno nuevo automáticamente
  React.useEffect(() => {
    if (!currentProject) {
      // Auto-inicializar con un proyecto básico
      // Este efecto se ejecutará cuando se abra el módulo
    }
  }, [currentProject]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'briefing':
        return <BriefingStepStoryResponsive />;
      
      case 'configuration':
        return <ConfigurationStepStoryResponsive />;
      
      case 'generation':
        return <GenerationStepStoryResponsive />;
      
      case 'advanced-editing':
        return <AdvancedEditorStepStoryResponsive />;
      
      case 'captions':
        return <CaptionHashtagsStepStoryResponsive />;
      
      case 'publishing':
        return <PublishingStepStoryResponsive />;
      
      default:
        return <BriefingStepStoryResponsive />;
    }
  };

  return (
    <div className="h-full w-full">
      {renderCurrentStep()}
    </div>
  );
}

export default StoriesCreatorModule;