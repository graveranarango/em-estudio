import { useState, useEffect } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";
import { Checkbox } from "../../ui/checkbox";
import { useBrandKit, useBrandColors } from "../../../contexts/BrandKitContext";
import { usePostProject } from "../../../contexts/PostProjectContext";
import { 
  Sparkles, 
  Loader2,
  CheckCircle,
  Maximize2,
  Trash2,
  Instagram,
  Facebook,
  Video,
  Linkedin,
  Twitter,
  AlertCircle
} from "lucide-react";

const PLATFORM_ICONS = {
  Instagram,
  Facebook,
  TikTok: Video,
  LinkedIn: Linkedin,
  X: Twitter
};

// Datos de ejemplo estáticos para las propuestas
const MOCK_PROPOSALS = [
  {
    id: 1,
    platform: "Instagram",
    format: "1:1",
    validated: true,
    confidence: 95,
    style: "minimal"
  },
  {
    id: 2,
    platform: "Instagram", 
    format: "9:16",
    validated: true,
    confidence: 88,
    style: "bold"
  },
  {
    id: 3,
    platform: "Facebook",
    format: "1:1", 
    validated: true,
    confidence: 92,
    style: "professional"
  },
  {
    id: 4,
    platform: "LinkedIn",
    format: "16:9",
    validated: false,
    confidence: 78,
    style: "corporate"
  },
  {
    id: 5,
    platform: "TikTok",
    format: "9:16",
    validated: true,
    confidence: 85,
    style: "dynamic"
  },
  {
    id: 6,
    platform: "X",
    format: "16:9",
    validated: true,
    confidence: 90,
    style: "minimal"
  }
];

export function GenerationStep() {
  const { hasBrandKit } = useBrandKit();
  const { primaryColors, secondaryColors } = useBrandColors();
  const { goToNextStep, goToPreviousStep } = usePostProject();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProposals, setSelectedProposals] = useState<Set<number>>(new Set());

  // Colores del BrandKit o fallback
  const primaryColor = primaryColors[0]?.hex || "#2563eb";
  const secondaryColor = secondaryColors[0]?.hex || "#6366f1";
  const alternativeColor = secondaryColors[1]?.hex || "#8b5cf6";

  // Simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    goToPreviousStep();
  };

  const handleNext = () => {
    if (selectedProposals.size > 0) {
      // TODO: En implementación real, cada propuesta seleccionada se convertiría 
      // en una publicación independiente para el flujo de edición
      goToNextStep();
    }
  };

  const handleToggleProposal = (proposalId: number) => {
    const newSelected = new Set(selectedProposals);
    if (newSelected.has(proposalId)) {
      newSelected.delete(proposalId);
    } else {
      newSelected.add(proposalId);
    }
    setSelectedProposals(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProposals.size === MOCK_PROPOSALS.length) {
      setSelectedProposals(new Set());
    } else {
      setSelectedProposals(new Set(MOCK_PROPOSALS.map(p => p.id)));
    }
  };

  const handleExpandProposal = (proposalId: number) => {
    // TODO: Open proposal in modal/fullscreen
    console.log("Expanding proposal:", proposalId);
  };

  const handleDiscardProposal = (proposalId: number) => {
    // TODO: Remove proposal from list
    console.log("Discarding proposal:", proposalId);
  };

  const getProposalColor = (index: number) => {
    const colors = [primaryColor, secondaryColor, alternativeColor];
    return colors[index % colors.length];
  };

  const selectedCount = selectedProposals.size;
  const allSelected = selectedProposals.size === MOCK_PROPOSALS.length;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl">Generación de Diseños</h1>
          <Badge variant="secondary" className="self-start sm:self-center">
            Paso 3 de 6
          </Badge>
        </div>
        
        {/* Controls Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-sm text-muted-foreground">
              {selectedCount} {selectedCount === 1 ? 'post seleccionado' : 'posts seleccionados'}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSelectAll}
              className="text-sm self-start sm:self-auto"
            >
              {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </Button>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex-1 sm:flex-none">
              ← Volver
            </Button>
            <Button 
              size="sm"
              onClick={handleNext} 
              disabled={selectedCount === 0}
              className="flex-1 sm:flex-none"
              style={{ 
                backgroundColor: selectedCount > 0 ? primaryColor : undefined,
                opacity: selectedCount > 0 ? 1 : 0.5
              }}
            >
              <span className="hidden sm:inline">Siguiente: Edición</span>
              <span className="sm:hidden">Siguiente</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryColor }} />
              <h3 className="text-lg">Generando propuestas con IA…</h3>
            </div>
            <p className="text-muted-foreground">
              {hasBrandKit 
                ? 'Aplicando automáticamente los colores, tipografías y estilo de tu BrandKit'
                : 'Creando diseños con paleta de colores predeterminada'
              }
            </p>
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="p-3">
                <Skeleton className="w-full aspect-square rounded-lg mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Grid de Propuestas */}
      {!isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg">Propuestas generadas</h3>
            <Badge variant="outline" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              6 diseños listos
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_PROPOSALS.map((proposal, index) => {
              const PlatformIcon = PLATFORM_ICONS[proposal.platform as keyof typeof PLATFORM_ICONS];
              const isSelected = selectedProposals.has(proposal.id);
              const proposalColor = getProposalColor(index);
              
              return (
                <Card 
                  key={proposal.id} 
                  className={`transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-offset-2' : ''
                  }`}
                  style={{
                    ringColor: isSelected ? primaryColor : undefined
                  }}
                >
                  <CardContent className="p-3 space-y-3">
                    {/* Preview Box */}
                    <div className="relative">
                      <div 
                        className="w-full aspect-square rounded-lg flex items-center justify-center text-white transition-transform hover:scale-[1.02] cursor-pointer"
                        style={{ backgroundColor: proposalColor }}
                        onClick={() => handleToggleProposal(proposal.id)}
                      >
                        <div className="text-center space-y-2">
                          <PlatformIcon className="w-8 h-8 mx-auto opacity-80" />
                          <div className="text-sm opacity-90">Preview {proposal.id}</div>
                          <div className="text-xs opacity-70">{proposal.style}</div>
                        </div>
                      </div>
                      
                      {/* Checkbox */}
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleProposal(proposal.id)}
                          className="w-5 h-5 bg-white/90 border-2"
                          style={{ 
                            borderColor: isSelected ? primaryColor : '#d1d5db',
                            backgroundColor: isSelected ? primaryColor : 'rgba(255,255,255,0.9)'
                          }}
                          aria-label={`Seleccionar diseño ${proposal.id}`}
                        />
                      </div>
                      
                      {/* Validation Badge */}
                      <Badge 
                        className={`absolute top-2 right-2 text-xs ${
                          proposal.validated 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                        variant="outline"
                      >
                        {proposal.validated ? '✅' : '⚠️'}
                      </Badge>
                    </div>

                    {/* Actions Row */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleExpandProposal(proposal.id)}
                        className="p-2 flex-1"
                        title="Expandir"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDiscardProposal(proposal.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 flex-1"
                        title="Descartar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Meta Row */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Plataforma:</span>
                        <div className="flex items-center gap-1">
                          <PlatformIcon className="w-3 h-3" />
                          <span>{proposal.platform}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Formato:</span>
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          {proposal.format}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Validación:</span>
                        <span className={proposal.validated ? "text-green-600" : "text-amber-600"}>
                          {proposal.validated ? "✅ Aprobado" : "⚠️ Revisión"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Confianza:</span>
                        <span className="font-medium">{proposal.confidence}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-4">
        <Button variant="ghost" onClick={handleBack} className="sm:w-auto">
          ← Volver
        </Button>
        <Button 
          onClick={handleNext}
          disabled={selectedCount === 0}
          className="sm:w-auto"
          style={{ 
            backgroundColor: selectedCount > 0 ? primaryColor : undefined,
            opacity: selectedCount > 0 ? 1 : 0.5
          }}
        >
          {selectedCount > 0 
            ? `Siguiente: Edición (${selectedCount} ${selectedCount === 1 ? 'post' : 'posts'})` 
            : "Selecciona al menos un diseño"
          }
        </Button>
      </div>

      {/* Info notice about multiple selection */}
      {selectedCount > 1 && !isLoading && (
        <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-blue-600" />
          <p className="text-sm text-blue-700">
            Has seleccionado <strong>{selectedCount} diseños</strong>. Cada uno se convertirá en una publicación independiente.
          </p>
        </div>
      )}

      {/* Warning notice when no selection */}
      {selectedCount === 0 && !isLoading && (
        <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <p className="text-sm text-amber-700">
            Selecciona al menos una propuesta para continuar al siguiente paso
          </p>
        </div>
      )}
    </div>
  );
}