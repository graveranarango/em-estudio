import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { BrandKitAlert } from "../common/BrandKitAlert";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { useVideoProject, VideoProjectStep } from "../../contexts/VideoProjectContext";

// Tipo específico para pasos de Short que incluye configuración
type ShortProjectStep = VideoProjectStep | 'configuration';

// Import step components
import { BriefingStepShort } from "./steps/BriefingStepShort";
import { ConfigurationStepShort } from "./steps/ConfigurationStepShort";
import { GenerationStepShort } from "./steps/GenerationStepShort";
import { EditorStepShort } from "./steps/EditorStepShort";
import { CaptionsStepShort } from "./steps/CaptionsStepShort";
import { PublishingStepShort } from "./steps/PublishingStepShort";

import { 
  Smartphone, 
  MessageSquare, 
  Settings,
  Sparkles, 
  Edit, 
  FileText, 
  Send,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle
} from "lucide-react";

// Steps específicos para Short/Reels workflow  
const SHORT_STEPS: ShortProjectStep[] = ['briefing', 'configuration', 'generation', 'editing', 'copywriting', 'publishing'];

const SHORT_STEP_ICONS: Record<ShortProjectStep, any> = {
  briefing: MessageSquare,
  configuration: Settings,
  generation: Sparkles,
  editing: Edit,
  copywriting: FileText,
  publishing: Send
};

const SHORT_STEP_LABELS: Record<ShortProjectStep, string> = {
  briefing: 'Briefing',
  configuration: 'Configuración',
  generation: 'Generación',
  editing: 'Edición',
  copywriting: 'Captions & Hashtags',
  publishing: 'Publicación'
};

export function ShortCreationWorkflow() {
  const { hasBrandKit } = useBrandKit();
  const { 
    currentProject, 
    currentStep, 
    setCurrentStep,
    saveProject
  } = useVideoProject();

  const [isSaving, setIsSaving] = useState(false);

  const [internalStep, setInternalStep] = useState<ShortProjectStep>('briefing');

  // Sync internal step with context step
  useEffect(() => {
    setInternalStep(currentStep as ShortProjectStep);
  }, [currentStep]);

  // Custom navigation for Short workflow
  const goToNextShortStep = () => {
    const currentIndex = SHORT_STEPS.indexOf(internalStep);
    if (currentIndex < SHORT_STEPS.length - 1) {
      const nextStep = SHORT_STEPS[currentIndex + 1];
      if (nextStep === 'configuration') {
        setInternalStep('configuration');
      } else {
        setInternalStep(nextStep);
        if (nextStep !== 'configuration') {
          setCurrentStep(nextStep as VideoProjectStep);
        }
      }
    }
  };

  const goToPreviousShortStep = () => {
    const currentIndex = SHORT_STEPS.indexOf(internalStep);
    if (currentIndex > 0) {
      const prevStep = SHORT_STEPS[currentIndex - 1];
      if (prevStep === 'configuration') {
        setInternalStep('configuration');
        // Don't update context step when going to configuration
      } else {
        setInternalStep(prevStep);
        if (prevStep !== 'configuration') {
          setCurrentStep(prevStep as VideoProjectStep);
        }
      }
    }
  };

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-pink-500" />
          </div>
          <h3 className="text-lg font-medium">No hay proyecto activo</h3>
          <p className="text-muted-foreground">Selecciona crear un nuevo Short/Reel para comenzar</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = SHORT_STEPS.indexOf(internalStep);
  const progress = ((currentStepIndex + 1) / SHORT_STEPS.length) * 100;

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
        return <BriefingStepShort onNext={() => {
          setInternalStep('configuration');
        }} />;
      case 'configuration':
        return <ConfigurationStepShort 
          onNext={goToNextShortStep}
          onPrevious={goToPreviousShortStep}
        />;
      case 'generation':
        return <GenerationStepShort 
          onNext={goToNextShortStep}
          onPrevious={goToPreviousShortStep}
        />;
      case 'editing':
        return <EditorStepShort 
          onNext={goToNextShortStep}
          onPrevious={goToPreviousShortStep}
        />;
      case 'copywriting':
        return <CaptionsStepShort 
          onNext={goToNextShortStep}
          onPrevious={goToPreviousShortStep}
        />;
      case 'publishing':
        return <PublishingStepShort 
          onNext={() => {
            // Finalizar workflow - se podría agregar lógica aquí
            console.log('Flujo de Shorts/Reels completado');
          }}
          onPrevious={goToPreviousShortStep}
        />;
      default:
        return <BriefingStepShort onNext={() => setInternalStep('configuration')} />;
    }
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
                <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold">{currentProject.title}</h1>
                <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                  Short / Reel
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
              {internalStep === 'briefing' || internalStep === 'configuration' ? (
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  Paso {currentStepIndex + 1} de {SHORT_STEPS.length}
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

          {/* Show progress and navigation only after configuration */}
          {internalStep !== 'briefing' && internalStep !== 'configuration' && (
            <>
              {/* BrandKit Status */}
              <BrandKitAlert showOnlyWarning />

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso del Short/Reel</span>
                  <span>{Math.round(progress)}% completado</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Step Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {SHORT_STEPS.map((step, index) => {
                    const Icon = SHORT_STEP_ICONS[step];
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
                          isActive ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' : 
                          isClickable ? 'text-muted-foreground' : 'text-gray-400'
                        }`}
                        onClick={() => {
                          if (isClickable && step !== 'configuration') {
                            setInternalStep(step);
                            if (step !== 'configuration') {
                              setCurrentStep(step as VideoProjectStep);
                            }
                          }
                        }}
                        disabled={!isClickable || step === 'configuration'}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{SHORT_STEP_LABELS[step]}</span>
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
                    onClick={goToPreviousShortStep}
                    disabled={currentStepIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    onClick={goToNextShortStep}
                    disabled={currentStepIndex === SHORT_STEPS.length - 1}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
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
        internalStep === 'briefing' || internalStep === 'configuration'
          ? '' 
          : 'bg-gradient-to-br from-pink-50 to-purple-50'
      }`}>
        {renderCurrentStep()}
      </div>
    </div>
  );
}