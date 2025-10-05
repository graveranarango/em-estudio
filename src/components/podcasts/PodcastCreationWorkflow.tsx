import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { BrandKitAlert } from "../common/BrandKitAlert";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { usePodcastProject, PodcastProjectStep } from "../../contexts/PodcastProjectContext";

// Import workflow components
import { PodcastMonologueWorkflow } from "./PodcastMonologueWorkflow";

// Import step components for interviews
import { BriefingStepPodcast } from "./steps/BriefingStepPodcast";
import { RecordUploadStep } from "./steps/RecordUploadStep";
import { TranscriptionEditor } from "./steps/TranscriptionEditor";
import { HighlightsStep } from "./steps/HighlightsStep";
import { PublishStepPodcast } from "./steps/PublishStepPodcast";

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
  Headphones,
  Video,
  Clock,
  Users
} from "lucide-react";

const STEP_ICONS = {
  briefing: MessageSquare,
  recording: Mic,
  transcription: FileText,
  highlights: Sparkles,
  publishing: Send
};

const STEP_LABELS = {
  briefing: 'Briefing',
  recording: 'Grabación',
  transcription: 'Transcripción',
  highlights: 'Highlights',
  publishing: 'Publicación'
};

export function PodcastCreationWorkflow() {
  const { hasBrandKit } = useBrandKit();
  const { 
    currentProject, 
    currentStep, 
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    saveProject
  } = usePodcastProject();

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

  // Check if this is a monologue podcast and redirect to specific workflow
  if (currentProject.briefing.contentType === 'podcast_monologue') {
    return <PodcastMonologueWorkflow />;
  }

  const steps = Object.keys(STEP_LABELS) as PodcastProjectStep[];
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
        return <BriefingStepPodcast />;
      case 'recording':
        return <RecordUploadStep />;
      case 'transcription':
        return <TranscriptionEditor />;
      case 'highlights':
        return <HighlightsStep />;
      case 'publishing':
        return <PublishStepPodcast />;
      default:
        return <BriefingStepPodcast />;
    }
  };

  const getContentTypeDisplay = () => {
    const contentType = currentProject.briefing.contentType;
    const typeLabels = {
      podcast_interview: 'Podcast Entrevista',
      podcast_monologue: 'Podcast Monólogo'
    };
    return typeLabels[contentType] || 'Podcast';
  };

  const getHighlightsCount = () => {
    return currentProject.highlights?.filter(h => h.approved).length || 0;
  };

  const getClipsCount = () => {
    return currentProject.clips?.filter(c => c.status === 'ready').length || 0;
  };

  const getDurationDisplay = () => {
    const duration = currentProject.recording?.duration;
    if (!duration) return currentProject.briefing.targetDuration.label;
    
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getStatusColor = () => {
    switch (currentProject.status) {
      case 'briefing': return 'bg-blue-100 text-blue-800';
      case 'recording': return 'bg-orange-100 text-orange-800';
      case 'transcribing': return 'bg-purple-100 text-purple-800';
      case 'highlighting': return 'bg-yellow-100 text-yellow-800';
      case 'publishing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
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
                  {getContentTypeDisplay()}
                </Badge>
                <Badge className={getStatusColor()}>
                  <Headphones className="w-3 h-3 mr-1" />
                  Podcast
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
                {currentProject.transcription?.wordCount && (
                  <span>{currentProject.transcription.wordCount} palabras</span>
                )}
                {getHighlightsCount() > 0 && (
                  <span>{getHighlightsCount()} highlights</span>
                )}
                {getClipsCount() > 0 && (
                  <span>{getClipsCount()} clips</span>
                )}
                <span>Estilo {currentProject.briefing.contentStyle}</span>
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
                    } ${isActive ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
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
                Anterior
              </Button>
              <Button
                size="sm"
                onClick={goToNextStep}
                disabled={currentStepIndex === steps.length - 1}
                className="bg-purple-500 hover:bg-purple-600"
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Current Step Info */}
          <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              {React.createElement(STEP_ICONS[currentStep], { className: "w-5 h-5 text-purple-600" })}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-purple-800">
                Paso {currentStepIndex + 1}: {STEP_LABELS[currentStep]}
              </h3>
              <p className="text-sm text-purple-700">
                {currentStep === 'briefing' && 'Define el contenido y estructura de tu proyecto'}
                {currentStep === 'recording' && 'Graba o sube tu contenido de audio/video'}
                {currentStep === 'transcription' && 'Revisa y edita la transcripción automática'}
                {currentStep === 'highlights' && 'Genera clips destacados para redes sociales'}
                {currentStep === 'publishing' && 'Publica en múltiples plataformas'}
              </p>
            </div>
            
            {/* Step-specific indicators */}
            <div className="flex items-center gap-2">
              {currentStep === 'briefing' && currentProject.briefing.objectives.length > 0 && (
                <Badge variant="outline">{currentProject.briefing.objectives.length} objetivos</Badge>
              )}
              {currentStep === 'recording' && currentProject.recording?.status === 'completed' && (
                <Badge className="bg-green-100 text-green-800">✓ Grabado</Badge>
              )}
              {currentStep === 'transcription' && currentProject.transcription?.status === 'completed' && (
                <Badge className="bg-blue-100 text-blue-800">✓ Transcrito</Badge>
              )}
              {currentStep === 'highlights' && getHighlightsCount() > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800">{getHighlightsCount()} aprobados</Badge>
              )}
              {currentStep === 'publishing' && currentProject.publishing?.status && (
                <Badge className={getStatusColor()}>
                  {currentProject.publishing.status}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {renderCurrentStep()}
      </div>
    </div>
  );
}