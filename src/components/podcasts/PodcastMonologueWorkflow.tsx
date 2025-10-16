import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { BrandKitAlert } from "../common/BrandKitAlert";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { usePodcastProject, PodcastProjectStep } from "../../contexts/PodcastProjectContext";

// Import monologue step components
import { PodcastMonologueBriefing } from "./PodcastMonologueBriefing";
import { PodcastMonologueConfiguration } from "./PodcastMonologueConfiguration";
import { PodcastMonologueScript } from "./PodcastMonologueScript";
import { PodcastMonologueGeneration } from "./PodcastMonologueGeneration";
import { PodcastMonologueAdvancedEditor } from "./PodcastMonologueAdvancedEditor";
import { PodcastMonologuePublishing } from "./PodcastMonologuePublishing";

import { 
  Mic, 
  MessageSquare, 
  Upload, 
  FileText, 
  Sparkles, 
  Send,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle,
  User,
  Settings,
  Volume2,
  Edit3,
  Clock
} from "lucide-react";

const MONOLOGUE_STEP_ICONS = {
  briefing: MessageSquare,
  configuration: Settings,
  script: FileText,
  generation: Volume2,
  editing: Edit3,
  publishing: Send
};

const MONOLOGUE_STEP_LABELS = {
  briefing: 'Briefing',
  configuration: 'Configuración',
  script: 'Script IA',
  generation: 'Generación',
  editing: 'Editor Avanzado',
  publishing: 'Publicación'
};

type MonologueStep = 'briefing' | 'configuration' | 'script' | 'generation' | 'editing' | 'publishing';

export function PodcastMonologueWorkflow() {
  const { hasBrandKit } = useBrandKit();
  const { 
    currentProject, 
    saveProject
  } = usePodcastProject();

  const [currentStep, setCurrentStep] = useState<MonologueStep>('briefing');
  const [isSaving, setIsSaving] = useState(false);

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <Mic className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">No hay proyecto activo</h3>
          <p className="text-muted-foreground">Selecciona crear un nuevo podcast para comenzar</p>
        </div>
      </div>
    );
  }

  const steps = Object.keys(MONOLOGUE_STEP_LABELS) as MonologueStep[];
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

  const goToNextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'briefing':
        return <PodcastMonologueBriefing />;
      case 'configuration':
        return <PodcastMonologueConfiguration />;
      case 'script':
        return <PodcastMonologueScript />;
      case 'generation':
        return <PodcastMonologueGeneration />;
      case 'editing':
        return <PodcastMonologueAdvancedEditor />;
      case 'publishing':
        return <PodcastMonologuePublishing />;
      default:
        return <PodcastMonologueBriefing />;
    }
  };

  const getStatusColor = () => {
    switch (currentProject.status) {
      case 'briefing': return 'bg-orange-100 text-orange-800';
      case 'recording': return 'bg-blue-100 text-blue-800';
      case 'transcribing': return 'bg-purple-100 text-purple-800';
      case 'highlighting': return 'bg-yellow-100 text-yellow-800';
      case 'publishing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDurationDisplay = () => {
    const duration = currentProject.recording?.duration;
    if (!duration) return currentProject.briefing.targetDuration.label;
    
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
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
                  Podcast Monólogo
                </Badge>
                <Badge className={getStatusColor()}>
                  <User className="w-3 h-3 mr-1" />
                  Monólogo
                </Badge>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  {getDurationDisplay()}
                </Badge>
                {hasBrandKit && (
                  <Badge className="bg-green-100 text-green-800">
                    BrandKit Activo
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Project Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Estilo {currentProject.briefing.contentStyle}</span>
                {currentProject.briefing.objectives.length > 0 && (
                  <span>{currentProject.briefing.objectives.length} objetivos</span>
                )}
              </div>
              
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
                const Icon = MONOLOGUE_STEP_ICONS[step];
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
                    } ${isActive ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                    onClick={() => isClickable && setCurrentStep(step)}
                    disabled={!isClickable}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{MONOLOGUE_STEP_LABELS[step]}</span>
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
                Anterior
              </Button>
              <Button
                size="sm"
                onClick={goToNextStep}
                disabled={currentStepIndex === steps.length - 1}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Current Step Info */}
          <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              {React.createElement(MONOLOGUE_STEP_ICONS[currentStep], { className: "w-5 h-5 text-orange-600" })}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-orange-800">
                Paso {currentStepIndex + 1}: {MONOLOGUE_STEP_LABELS[currentStep]}
              </h3>
              <p className="text-sm text-orange-700">
                {currentStep === 'briefing' && 'Define el tema y enfoque de tu monólogo'}
                {currentStep === 'configuration' && 'Configura los parámetros técnicos del podcast'}
                {currentStep === 'script' && 'Genera el script completo con IA'}
                {currentStep === 'generation' && 'Graba o sube tu audio del monólogo'}
                {currentStep === 'editing' && 'Edita y perfecciona tu podcast'}
                {currentStep === 'publishing' && 'Publica en múltiples plataformas'}
              </p>
            </div>
            
            {/* Step-specific indicators */}
            <div className="flex items-center gap-2">
              {currentStep === 'briefing' && currentProject.briefing.objectives.length > 0 && (
                <Badge variant="outline">{currentProject.briefing.objectives.length} objetivos</Badge>
              )}
              {currentStep === 'configuration' && (
                <Badge className="bg-orange-100 text-orange-800">Monólogo</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-orange-50 via-white to-red-50">
        {renderCurrentStep()}
      </div>
    </div>
  );
}