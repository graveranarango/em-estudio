import { useState, useEffect } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Checkbox } from "../../ui/checkbox";
import { Skeleton } from "../../ui/skeleton";
import { useBrandKit } from "../../../contexts/BrandKitContext";
import { useVideoProject } from "../../../contexts/VideoProjectContext";
import { 
  ArrowLeft,
  ArrowRight,
  Maximize,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Smartphone,
  Clock,
  Palette
} from "lucide-react";

// Tipos para las propuestas generadas
interface ShortProposal {
  id: string;
  title: string;
  duration: number;
  platform: string;
  style: string;
  validation: 'valid' | 'warning' | 'error';
  validationMessage?: string;
  preview: {
    backgroundColor: string;
    thumbnail?: string;
  };
  metadata: {
    scenes: number;
    transitions: number;
    textOverlays: number;
  };
}

// Propuestas de ejemplo (simuladas)
const SAMPLE_PROPOSALS: ShortProposal[] = [
  {
    id: 'prop-1',
    title: 'Propuesta Dinámica',
    duration: 30,
    platform: 'Instagram Reels',
    style: 'Dinámico',
    validation: 'valid',
    preview: {
      backgroundColor: '#E91E63'
    },
    metadata: {
      scenes: 5,
      transitions: 8,
      textOverlays: 3
    }
  },
  {
    id: 'prop-2',
    title: 'Propuesta Minimalista',
    duration: 45,
    platform: 'TikTok',
    style: 'Minimalista',
    validation: 'warning',
    validationMessage: 'Revisar contraste',
    preview: {
      backgroundColor: '#9C27B0'
    },
    metadata: {
      scenes: 3,
      transitions: 4,
      textOverlays: 2
    }
  },
  {
    id: 'prop-3',
    title: 'Propuesta Urbana',
    duration: 35,
    platform: 'YouTube Shorts',
    style: 'Urbano',
    validation: 'valid',
    preview: {
      backgroundColor: '#FF9800'
    },
    metadata: {
      scenes: 6,
      transitions: 10,
      textOverlays: 4
    }
  },
  {
    id: 'prop-4',
    title: 'Propuesta Corporativa',
    duration: 40,
    platform: 'Instagram Reels',
    style: 'Corporativo',
    validation: 'valid',
    preview: {
      backgroundColor: '#2196F3'
    },
    metadata: {
      scenes: 4,
      transitions: 6,
      textOverlays: 3
    }
  },
  {
    id: 'prop-5',
    title: 'Propuesta Cinemática',
    duration: 50,
    platform: 'TikTok',
    style: 'Cinemático',
    validation: 'error',
    validationMessage: 'Duración excede límite de plataforma',
    preview: {
      backgroundColor: '#4CAF50'
    },
    metadata: {
      scenes: 7,
      transitions: 12,
      textOverlays: 5
    }
  },
  {
    id: 'prop-6',
    title: 'Propuesta Trendy',
    duration: 25,
    platform: 'Instagram Reels',
    style: 'Dinámico',
    validation: 'valid',
    preview: {
      backgroundColor: '#FF5722'
    },
    metadata: {
      scenes: 4,
      transitions: 7,
      textOverlays: 2
    }
  }
];

interface GenerationStepShortProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

export function GenerationStepShort({ onNext, onPrevious }: GenerationStepShortProps) {
  const { hasBrandKit } = useBrandKit();
  const { 
    currentProject, 
    updateBriefing, 
    goToNextStep, 
    goToPreviousStep 
  } = useVideoProject();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [proposals, setProposals] = useState<ShortProposal[]>([]);
  const [selectedProposals, setSelectedProposals] = useState<string[]>([]);
  const [expandedProposal, setExpandedProposal] = useState<string | null>(null);

  // Simulate loading and generation
  useEffect(() => {
    const timer = setTimeout(() => {
      setProposals(SAMPLE_PROPOSALS);
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleProposalToggle = (proposalId: string) => {
    setSelectedProposals(prev => 
      prev.includes(proposalId)
        ? prev.filter(id => id !== proposalId)
        : [...prev, proposalId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProposals.length === proposals.length) {
      setSelectedProposals([]);
    } else {
      setSelectedProposals(proposals.map(p => p.id));
    }
  };

  const handleDiscardProposal = (proposalId: string) => {
    setProposals(prev => prev.filter(p => p.id !== proposalId));
    setSelectedProposals(prev => prev.filter(id => id !== proposalId));
  };

  const handleExpandProposal = (proposalId: string) => {
    setExpandedProposal(expandedProposal === proposalId ? null : proposalId);
  };

  const canContinue = selectedProposals.length > 0;

  const handleContinue = () => {
    if (!canContinue) return;

    // Store selected proposals in project data
    updateBriefing({
      selectedProposals: selectedProposals,
      totalProposals: proposals.length
    });

    onNext ? onNext() : goToNextStep();
  };

  const handleGoBack = () => {
    onPrevious ? onPrevious() : goToPreviousStep();
  };

  const getValidationIcon = (validation: ShortProposal['validation']) => {
    switch (validation) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getValidationText = (proposal: ShortProposal) => {
    switch (proposal.validation) {
      case 'valid':
        return '✅ Validado';
      case 'warning':
        return `⚠️ ${proposal.validationMessage}`;
      case 'error':
        return `❌ ${proposal.validationMessage}`;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full bg-canvas">
        <div className="max-w-7xl mx-auto p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Generación de Shorts / Reels</h1>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Paso 3 de 5
            </Badge>
          </div>

          {/* Loading State */}
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
              <div>
                <h3 className="text-lg font-medium mb-2">Generando tus propuestas con IA…</h3>
                <p className="text-muted-foreground">
                  Creando múltiples versiones basadas en tu briefing y configuración
                </p>
              </div>
            </div>
          </Card>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <Skeleton className="w-full h-64 rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-canvas">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Generación de Shorts / Reels</h1>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Paso 3 de 5
            </Badge>
            
            <span className="text-sm text-muted-foreground">
              {selectedProposals.length} propuestas seleccionadas
            </span>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedProposals.length === proposals.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </Button>
          </div>
        </div>

        {/* Proposals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="p-4 relative">
              {/* Selection Checkbox */}
              <div className="absolute top-3 right-3 z-10">
                <Checkbox
                  checked={selectedProposals.includes(proposal.id)}
                  onCheckedChange={() => handleProposalToggle(proposal.id)}
                  className="bg-white border-2 shadow-sm"
                />
              </div>

              <div className="space-y-3">
                {/* Preview Box */}
                <div className="relative">
                  <div 
                    className="w-full h-64 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: proposal.preview.backgroundColor }}
                  >
                    <div className="text-center text-white">
                      <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-80" />
                      <div className="text-sm font-medium opacity-90">Preview Short/Reel</div>
                      <div className="text-xs opacity-70">{proposal.style}</div>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExpandProposal(proposal.id)}
                    className="flex-1"
                  >
                    <Maximize className="w-4 h-4 mr-1" />
                    Ampliar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDiscardProposal(proposal.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Meta Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Duración: {proposal.duration}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span>Plataforma: {proposal.platform}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <span>Estilo: {proposal.style}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getValidationIcon(proposal.validation)}
                    <span className={`text-xs ${
                      proposal.validation === 'valid' ? 'text-green-600' :
                      proposal.validation === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {getValidationText(proposal)}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedProposal === proposal.id && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                    <div>Escenas: {proposal.metadata.scenes}</div>
                    <div>Transiciones: {proposal.metadata.transitions}</div>
                    <div>Textos superpuestos: {proposal.metadata.textOverlays}</div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {proposals.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No hay propuestas disponibles</h3>
              <p>Todas las propuestas han sido descartadas. Vuelve al paso anterior para generar nuevas propuestas.</p>
            </div>
          </Card>
        )}

        {/* Summary */}
        {proposals.length > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">
                  {proposals.length} propuestas generadas
                </h4>
                <p className="text-sm text-blue-800">
                  Selecciona las que más te gusten para continuar con la edición. 
                  Puedes elegir múltiples opciones para compararlas.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          
          <Button 
            onClick={handleContinue}
            disabled={!canContinue}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center gap-2"
          >
            Siguiente: Edición
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {!canContinue && (
          <p className="text-sm text-gray-500 text-center mt-2">
            Selecciona al menos una propuesta para continuar
          </p>
        )}
      </div>
    </div>
  );
}