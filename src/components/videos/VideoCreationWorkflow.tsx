import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { BrandKitAlert } from "../common/BrandKitAlert";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { useVideoProject, VideoProjectStep } from "../../contexts/VideoProjectContext";

// Import step components for Videos Largos con Flow Narrativo (7 pasos)
import { BriefingStepVideoFlow } from "./steps/BriefingStepVideoFlow";
import { ConfigurationStepVideoFlow } from "./steps/ConfigurationStepVideoFlow";
import { StoryboardStepVideoFlow } from "./steps/StoryboardStepVideoFlow";
import { GenerationStepVideoFlow } from "./steps/GenerationStepVideoFlow";
import { AdvancedEditorStepVideoFlow } from "./steps/AdvancedEditorStepVideoFlow";
import { CopywritingStepVideo } from "./steps/CopywritingStepVideo";
import { PublishingStepVideo } from "./steps/PublishingStepVideo";

import { 
  Monitor, 
  MessageSquare, 
  Sparkles, 
  Edit, 
  FileText, 
  Send,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle,
  Settings,
  Film
} from "lucide-react";

// Tipo específico para pasos de Video Largo que incluye configuración y storyboard
type LongVideoProjectStep = VideoProjectStep | 'configuration' | 'storyboard';

// Steps específicos para Video Largo con Flow Narrativo (7 pasos)
const LONG_VIDEO_STEPS: LongVideoProjectStep[] = ['briefing', 'configuration', 'storyboard', 'generation', 'editing', 'copywriting', 'publishing'];

const LONG_VIDEO_STEP_ICONS: Record<LongVideoProjectStep, any> = {
  briefing: MessageSquare,
  configuration: Settings,
  storyboard: Film,
  generation: Sparkles,
  editing: Edit,
  copywriting: FileText,
  publishing: Send
};

const LONG_VIDEO_STEP_LABELS: Record<LongVideoProjectStep, string> = {
  briefing: 'Briefing (Flow)',
  configuration: 'Configuración Técnica',
  storyboard: 'Storyboard Narrativo',
  generation: 'Generación de Escenas',
  editing: 'Edición Multipista',
  copywriting: 'Captions & Subtítulos',
  publishing: 'Publicación Final'
};

export function VideoCreationWorkflow() {
  const { hasBrandKit } = useBrandKit();
  const { 
    currentProject, 
    currentStep, 
    setCurrentStep,
    saveProject
  } = useVideoProject();

  const [isSaving, setIsSaving] = useState(false);
  const [internalStep, setInternalStep] = useState<LongVideoProjectStep>('briefing');

  // Sync internal step with context step
  useEffect(() => {
    setInternalStep(currentStep as LongVideoProjectStep);
  }, [currentStep]);

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <Monitor className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium">No hay proyecto activo</h3>
          <p className="text-muted-foreground">Selecciona crear un nuevo Video Largo para comenzar</p>
        </div>
      </div>
    );
  }

  // Custom navigation for Long Video workflow
  const goToNextLongVideoStep = () => {
    const currentIndex = LONG_VIDEO_STEPS.indexOf(internalStep);
    if (currentIndex < LONG_VIDEO_STEPS.length - 1) {
      const nextStep = LONG_VIDEO_STEPS[currentIndex + 1];
      setInternalStep(nextStep);
      if (nextStep !== 'configuration' && nextStep !== 'storyboard') {
        setCurrentStep(nextStep as VideoProjectStep);
      }
    }
  };

  const goToPreviousLongVideoStep = () => {
    const currentIndex = LONG_VIDEO_STEPS.indexOf(internalStep);
    if (currentIndex > 0) {
      const prevStep = LONG_VIDEO_STEPS[currentIndex - 1];
      setInternalStep(prevStep);
      if (prevStep !== 'configuration' && prevStep !== 'storyboard') {
        setCurrentStep(prevStep as VideoProjectStep);
      }
    }
  };

  const currentStepIndex = LONG_VIDEO_STEPS.indexOf(internalStep);
  const progress = ((currentStepIndex + 1) / LONG_VIDEO_STEPS.length) * 100;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveProject();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderCurrentStep = () => {
    switch (internalStep) {
      case 'briefing':
        return <BriefingStepVideoFlow 
          onNext={() => {
            setInternalStep('configuration');
          }}
        />;
      case 'configuration':
        return <ConfigurationStepVideoFlow 
          onNext={goToNextLongVideoStep}
          onPrevious={goToPreviousLongVideoStep}
        />;
      case 'storyboard':
        return <StoryboardStepVideoFlow 
          onNext={goToNextLongVideoStep}
          onPrevious={goToPreviousLongVideoStep}
        />;
      case 'generation':
        return <GenerationStepVideoFlow 
          onNext={goToNextLongVideoStep}
          onPrevious={goToPreviousLongVideoStep}
        />;
      case 'editing':
        return <AdvancedEditorStepVideoFlow 
          onNext={goToNextLongVideoStep}
          onPrevious={goToPreviousLongVideoStep}
        />;
      case 'copywriting':
        return <CopywritingStepVideo />;
      case 'publishing':
        return <PublishingStepVideo />;
      default:
        return <BriefingStepVideoFlow onNext={() => setInternalStep('configuration')} />;
    }
  };

  const getProjectTypeDisplay = () => {
    return 'Video Largo con Flow';
  };

  const getSelectedScenesCount = () => {
    return currentProject.selectedSceneIds?.length || 0;
  };

  const getTotalDuration = () => {
    const selectedScenes = currentProject.scenes.filter(s => 
      currentProject.selectedSceneIds?.includes(s.id)
    );
    return selectedScenes.reduce((total, scene) => total + scene.duration, 0);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header con progreso */}
      <div className="p-6 border-b bg-white">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Project Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <Monitor className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold">{currentProject.title}</h1>
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  {getProjectTypeDisplay()}
                </Badge>
                {currentProject.briefing.platform && (
                  <Badge variant="secondary" className="capitalize">
                    {currentProject.briefing.platform}
                  </Badge>
                )}
                {hasBrandKit && (
                  <Badge className="bg-green-100 text-green-800">
                    BrandKit Activo
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Step Progress */}
              {internalStep === 'briefing' || internalStep === 'configuration' || internalStep === 'storyboard' ? (
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  Paso {currentStepIndex + 1} de {LONG_VIDEO_STEPS.length}
                </Badge>
              ) : (
                /* Project Stats for other steps */
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {currentProject.scenes.length > 0 && (
                    <span>{currentProject.scenes.length} escenas creadas</span>
                  )}
                  {getSelectedScenesCount() > 0 && (
                    <span>{getSelectedScenesCount()} seleccionadas</span>
                  )}
                  {getTotalDuration() > 0 && (
                    <span>~{Math.round(getTotalDuration())}s duración</span>
                  )}
                </div>
              )}
              
              <Button 
                variant="outline" 
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>

          {/* Show progress and navigation only after briefing */}
          {internalStep !== 'briefing' && internalStep !== 'configuration' && internalStep !== 'storyboard' && (
            <>
              {/* BrandKit Status */}
              <BrandKitAlert showOnlyWarning />

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso del Video Largo con Flow</span>
                  <span>{Math.round(progress)}% completado</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Step Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {LONG_VIDEO_STEPS.map((step, index) => {
                    const Icon = LONG_VIDEO_STEP_ICONS[step];
                    const isActive = internalStep === step;
                    const isCompleted = index < currentStepIndex;
                    const isClickable = index <= currentStepIndex;

                    return (
                      <Button
                        key={step}
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={`gap-2 ${
                          isCompleted ? 'text-green-600' : 
                          isActive ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : 
                          isClickable ? 'text-muted-foreground' : 'text-gray-400'
                        }`}
                        onClick={() => {
                          if (isClickable && step !== 'configuration' && step !== 'storyboard') {
                            setInternalStep(step);
                            if (step !== 'configuration' && step !== 'storyboard') {
                              setCurrentStep(step as VideoProjectStep);
                            }
                          }
                        }}
                        disabled={!isClickable || step === 'configuration' || step === 'storyboard'}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{LONG_VIDEO_STEP_LABELS[step]}</span>
                        {isCompleted && <CheckCircle className="w-3 h-3 text-green-600" />}
                      </Button>
                    );
                  })}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousLongVideoStep}
                    disabled={currentStepIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    onClick={goToNextLongVideoStep}
                    disabled={currentStepIndex === LONG_VIDEO_STEPS.length - 1}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  >
                    Siguiente
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-auto ${
        internalStep === 'briefing' || internalStep === 'configuration' || internalStep === 'storyboard'
          ? '' 
          : 'bg-gradient-to-br from-blue-50 to-indigo-50'
      }`}>
        {renderCurrentStep()}
      </div>
    </div>
  );
}