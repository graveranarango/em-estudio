import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { BrandKitAlert } from "../common/BrandKitAlert";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { usePostProject, ProjectStep } from "../../contexts/PostProjectContext";

// Import carousel step components
import { BriefChat } from "./BriefChat";
import { ConfigurationStepCarousel } from "./steps/ConfigurationStepCarousel";
import { GenerationStepCarousel } from "./steps/GenerationStepCarousel";
import { EditingStepCarousel } from "./steps/EditingStepCarousel";
import { CopywritingStep } from "./steps/CopywritingStep";
import { CaptionHashtagsStepCarousel } from "./steps/CaptionHashtagsStepCarousel";
import { PublishingStepCarousel } from "./steps/PublishingStepCarousel";
import { SelectionStepCarousel } from "./steps/SelectionStepCarousel";
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
  Save,
  Grid3X3,
  Layout
} from "lucide-react";

const CAROUSEL_STEP_ICONS = {
  briefing: MessageSquare,
  selection: Layout,
  configuration: Settings,
  generation: Sparkles,
  editing: Edit,
  copywriting: FileText,
  caption: FileText,
  publishing: Send
};

const CAROUSEL_STEP_LABELS = {
  briefing: 'Briefing',
  selection: 'Templates',
  configuration: 'Configuración',
  generation: 'Generación',
  editing: 'Edición',
  copywriting: 'Copywriting',
  caption: 'Caption & Hashtags',
  publishing: 'Publicación'
};

// Definir los pasos específicos para carousels
type CarouselStep = 'briefing' | 'selection' | 'configuration' | 'generation' | 'editing' | 'copywriting' | 'caption' | 'publishing';

export function CarouselCreationWorkflow() {
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
      createNewProject('carousel');
    }
  }, [currentProject, createNewProject]);

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center animate-pulse">
            <Grid3X3 className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium">Iniciando proyecto de Carousel...</h3>
          <p className="text-muted-foreground">Configurando el workspace para Carousels</p>
        </div>
      </div>
    );
  }

  const steps = Object.keys(CAROUSEL_STEP_LABELS) as CarouselStep[];
  const currentStepIndex = steps.indexOf(currentStep as CarouselStep);
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
      case 'selection':
        return <SelectionStepCarousel />;
      case 'configuration':
        return <ConfigurationStepCarousel />;
      case 'generation':
        return <GenerationStepCarousel />;
      case 'editing':
        return <EditingStepCarousel />;
      case 'copywriting':
        return <CopywritingStep />;
      case 'caption':
        return <CaptionHashtagsStepCarousel />;
      case 'publishing':
        return <PublishingStepCarousel />;
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
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                  <Grid3X3 className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold">{currentProject.title || 'Nuevo Carousel'}</h1>
                <Badge variant="outline" className="capitalize bg-purple-100 text-purple-800 border-purple-300">
                  Carousel
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
          <BrandKitAlert showOnlyWarning moduleType="carousel" />

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso del carousel</span>
              <span>{Math.round(progress)}% completado</span>
            </div>
            <Progress value={progress} className="h-2 bg-purple-100">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all" 
                style={{ width: `${progress}%` }}
              />
            </Progress>
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {steps.map((step, index) => {
                const Icon = CAROUSEL_STEP_ICONS[step];
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
                      isActive ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' : 
                      isClickable ? 'text-muted-foreground hover:text-purple-600' : 'text-gray-400'
                    }`}
                    onClick={() => isClickable && setCurrentStep(step as ProjectStep)}
                    disabled={!isClickable}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{CAROUSEL_STEP_LABELS[step]}</span>
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
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 ${currentStep === 'briefing' ? '' : 'overflow-auto bg-gradient-to-br from-purple-50 via-pink-50 to-white'}`}>
        {renderCurrentStep()}
      </div>
    </div>
  );
}