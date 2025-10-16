import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { BrandKitAlert } from "../common/BrandKitAlert";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { usePostProject, ProjectStep } from "../../contexts/PostProjectContext";

// Import step components
import { BriefChat } from "./BriefChat";
import { ConfigurationStep } from "./steps/ConfigurationStep";
import { GenerationStep } from "./steps/GenerationStep";
import EditingStep from "./steps/EditingStep";
import { CopywritingStep } from "./steps/CopywritingStep";
import CaptionHashtagsStep from "./steps/CaptionHashtagsStep";
import { PublishingStep } from "./steps/PublishingStep";
import { PublishingStepMobile } from "./steps/PublishingStepMobile";
import { useIsMobile } from "../ui/use-mobile";

import { 
  MessageSquare, 
  Settings, 
  Sparkles, 
  CheckCircle, 
  Edit, 
  FileText, 
  Send,
  ArrowLeft,
  ArrowRight,
  Save
} from "lucide-react";

const STEP_ICONS = {
  briefing: MessageSquare,
  configuration: Settings,
  generation: Sparkles,
  editing: Edit,
  copywriting: FileText,
  caption: FileText,
  publishing: Send
};

const STEP_LABELS = {
  briefing: 'Briefing',
  configuration: 'Configuración',
  generation: 'Generación',
  editing: 'Edición',
  copywriting: 'Copywriting',
  caption: 'Caption & Hashtags',
  publishing: 'Publicación'
};

export function PostCreationWorkflow() {
  const { hasBrandKit } = useBrandKit();
  const { 
    currentProject, 
    currentStep, 
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    saveProject,
    createNewProject
  } = usePostProject();
  const isMobile = useIsMobile();

  const [isSaving, setIsSaving] = useState(false);

  // Crear un proyecto automáticamente si no existe
  useEffect(() => {
    if (!currentProject) {
      createNewProject('post');
    }
  }, [currentProject, createNewProject]);

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">Iniciando proyecto...</h3>
          <p className="text-muted-foreground">Configurando el workspace para Posts</p>
        </div>
      </div>
    );
  }

  const steps = Object.keys(STEP_LABELS) as ProjectStep[];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

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
    switch (currentStep) {
      case 'briefing':
        return <BriefChat onContinue={goToNextStep} />;
      case 'configuration':
        return <ConfigurationStep />;
      case 'generation':
        return <GenerationStep />;
      case 'editing':
        return <EditingStep />;
      case 'copywriting':
        return <CopywritingStep />;
      case 'caption':
        return <CaptionHashtagsStep />;
      case 'publishing':
        return isMobile ? <PublishingStepMobile /> : <PublishingStep />;
      default:
        return <BriefChat onContinue={goToNextStep} />;
    }
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
                <h1 className="text-2xl font-bold">{currentProject.title}</h1>
                <Badge variant="outline" className="capitalize">
                  {currentProject.type}
                </Badge>
                {hasBrandKit && (
                  <Badge className="bg-green-100 text-green-800">
                    BrandKit Activo
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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

          {/* BrandKit Status */}
          <BrandKitAlert showOnlyWarning />

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso del proyecto</span>
              <span>{Math.round(progress)}% completado</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {steps.map((step, index) => {
                const Icon = STEP_ICONS[step];
                const isActive = currentStep === step;
                const isCompleted = index < currentStepIndex;
                const isClickable = index <= currentStepIndex;

                return (
                  <Button
                    key={step}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`gap-2 ${
                      isCompleted ? 'text-green-600' : 
                      isActive ? '' : 
                      isClickable ? 'text-muted-foreground' : 'text-gray-400'
                    }`}
                    onClick={() => isClickable && setCurrentStep(step)}
                    disabled={!isClickable}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{STEP_LABELS[step]}</span>
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
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                size="sm"
                onClick={goToNextStep}
                disabled={currentStepIndex === steps.length - 1}
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 ${currentStep === 'briefing' ? '' : 'overflow-auto bg-gradient-to-br from-gray-50 to-white'}`}>
        {renderCurrentStep()}
      </div>
    </div>
  );
}