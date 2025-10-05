import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Sparkles,
  Trash2,
  AlertTriangle,
  Video,
  Play,
  Pause,
  Eye,
  Clock
} from "lucide-react";

interface GenerationStepVideoFlowProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

interface GeneratedClip {
  id: string;
  sceneId: string;
  title: string;
  script: string;
  duration: number;
  previewColor: string;
  isSelected: boolean;
  isGenerating: boolean;
  thumbnailUrl?: string;
}

const BRAND_COLORS = [
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#dc2626', // Red
  '#059669', // Emerald
  '#d97706', // Amber
  '#db2777', // Pink
];

export function GenerationStepVideoFlow({ onNext, onPrevious }: GenerationStepVideoFlowProps) {
  const { brandKit } = useBrandKit();
  const { currentProject, updateBriefing } = useVideoProject();
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [generatedClips, setGeneratedClips] = useState<GeneratedClip[]>([]);
  const [regeneratingClips, setRegeneratingClips] = useState<Set<string>>(new Set());
  const [generatingAdditional, setGeneratingAdditional] = useState<Set<string>>(new Set());

  // Get scenes from the current project (from storyboard step)
  const scenes = React.useMemo(() => {
    return currentProject?.scenes || [];
  }, [currentProject?.scenes]);

  // Debug information
  useEffect(() => {
    console.log('GenerationStepVideoFlow - Debug Info:', {
      currentProject: !!currentProject,
      scenes: scenes.length,
      generatedClips: generatedClips.length
    });
  }, [scenes.length, generatedClips.length]);

  useEffect(() => {
    let mounted = true;
    
    const generateInitialClips = async () => {
      if (scenes.length === 0 || generatedClips.length > 0) {
        setIsInitialLoading(false);
        return;
      }

      setIsInitialLoading(true);
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (!mounted) return;
      
      const clips: GeneratedClip[] = scenes.map((scene, index) => ({
        id: `clip_${scene.id}_${index}`,
        sceneId: scene.id,
        title: scene.title || `Escena ${index + 1}`,
        script: (scene.metadata as any)?.script || scene.description || `Guión para la escena ${index + 1}. Esta es una propuesta generada automáticamente por IA basada en el contenido del storyboard.`,
        duration: scene.duration || 30,
        previewColor: brandKit?.colors?.primary || BRAND_COLORS[index % BRAND_COLORS.length],
        isSelected: false,
        isGenerating: false,
        thumbnailUrl: `https://picsum.photos/240/135?random=${scene.id}`
      }));
      
      if (mounted) {
        setGeneratedClips(clips);
        setIsInitialLoading(false);
      }
    };

    generateInitialClips();
    
    return () => {
      mounted = false;
    };
  }, [scenes.length, brandKit?.colors?.primary]); // Only depend on length and primary color

  const toggleClipSelection = (clipId: string) => {
    setGeneratedClips(prev => prev.map(clip => 
      clip.id === clipId 
        ? { ...clip, isSelected: !clip.isSelected }
        : clip
    ));
  };

  const regenerateClip = async (clipId: string) => {
    const clip = generatedClips.find(c => c.id === clipId);
    if (!clip || regeneratingClips.has(clipId)) return;

    setRegeneratingClips(prev => new Set(prev).add(clipId));
    
    // Mark clip as generating
    setGeneratedClips(prev => prev.map(c => 
      c.id === clipId 
        ? { ...c, isGenerating: true }
        : c
    ));

    try {
      // Simulate AI regeneration
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Generate new variation
      const variations = [
        { previewColor: '#3b82f6', script: 'Versión alternativa del guión con enfoque diferente...' },
        { previewColor: '#8b5cf6', script: 'Nueva perspectiva narrativa para mayor impacto...' },
        { previewColor: '#10b981', script: 'Enfoque más dinámico y energético para esta escena...' },
        { previewColor: '#f59e0b', script: 'Versión optimizada para engagement y retención...' }
      ];

      const randomVariation = variations[Math.floor(Math.random() * variations.length)];
      
      setGeneratedClips(prev => prev.map(c => 
        c.id === clipId 
          ? { 
              ...c, 
              isGenerating: false,
              previewColor: randomVariation.previewColor,
              script: randomVariation.script,
              isSelected: false,
              thumbnailUrl: `https://picsum.photos/240/135?random=${c.sceneId}&new=${Date.now()}`
            }
          : c
      ));
    } catch (error) {
      console.error('Error regenerating clip:', error);
      // Reset generating state on error
      setGeneratedClips(prev => prev.map(c => 
        c.id === clipId 
          ? { ...c, isGenerating: false }
          : c
      ));
    } finally {
      setRegeneratingClips(prev => {
        const newSet = new Set(prev);
        newSet.delete(clipId);
        return newSet;
      });
    }
  };

  const discardClip = (clipId: string) => {
    const clip = generatedClips.find(c => c.id === clipId);
    if (!clip) return;
    
    // Only allow discard if there's at least one clip remaining for this scene
    const sceneClips = generatedClips.filter(c => c.sceneId === clip.sceneId);
    if (sceneClips.length <= 1) {
      return; // Don't allow discarding the last clip for a scene
    }
    
    setGeneratedClips(prev => prev.filter(clip => clip.id !== clipId));
  };

  const generateAdditionalClip = async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene || generatingAdditional.has(sceneId)) return;

    const clipId = `clip_${sceneId}_additional_${Date.now()}`;
    setGeneratingAdditional(prev => new Set(prev).add(sceneId));

    const newClip: GeneratedClip = {
      id: clipId,
      sceneId: sceneId,
      title: scene.title || `Escena adicional`,
      script: 'Generando nuevo guión alternativo...',
      duration: scene.duration || 30,
      previewColor: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
      isSelected: false,
      isGenerating: true,
      thumbnailUrl: `https://picsum.photos/240/135?random=${sceneId}&new=${Date.now()}`
    };

    setGeneratedClips(prev => [...prev, newClip]);

    try {
      // Simulate generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const variations = [
        'Enfoque alternativo con mayor impacto emocional para esta escena...',
        'Versión más dinámica con ritmo acelerado...',
        'Perspectiva diferente que enfatiza los beneficios clave...',
        'Variación con mayor engagement y llamada a la acción...'
      ];

      const randomScript = variations[Math.floor(Math.random() * variations.length)];

      setGeneratedClips(prev => prev.map(c => 
        c.id === clipId 
          ? { ...c, isGenerating: false, script: randomScript }
          : c
      ));
    } catch (error) {
      console.error('Error generating additional clip:', error);
      // Remove the clip on error
      setGeneratedClips(prev => prev.filter(c => c.id !== clipId));
    } finally {
      setGeneratingAdditional(prev => {
        const newSet = new Set(prev);
        newSet.delete(sceneId);
        return newSet;
      });
    }
  };

  // Validation
  const validateSelection = () => {
    const sceneIds = [...new Set(scenes.map(scene => scene.id))];
    return sceneIds.every(sceneId => 
      generatedClips.some(clip => clip.sceneId === sceneId && clip.isSelected)
    );
  };

  const canProceed = validateSelection();

  const handleNext = () => {
    const selectedClips = generatedClips.filter(clip => clip.isSelected);
    
    // Update project context with selected clips
    updateBriefing({
      selectedClips: selectedClips.map(clip => ({
        id: clip.id,
        sceneId: clip.sceneId,
        title: clip.title,
        script: clip.script,
        duration: clip.duration,
        visualPreview: clip.previewColor,
        isGenerated: true
      }))
    });
    
    onNext?.();
  };

  const getSceneClips = React.useCallback((sceneId: string) => {
    return generatedClips.filter(clip => clip.sceneId === sceneId);
  }, [generatedClips]);

  const selectedClipsCount = React.useMemo(() => {
    return generatedClips.filter(clip => clip.isSelected).length;
  }, [generatedClips]);

  const totalDuration = React.useMemo(() => {
    return generatedClips
      .filter(clip => clip.isSelected)
      .reduce((total, clip) => total + clip.duration, 0);
  }, [generatedClips]);

  // No scenes available
  if (!isInitialLoading && scenes.length === 0) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="h-full overflow-auto">
          <div className="max-w-7xl mx-auto p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Generación inicial de clips</h1>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  Paso 4 de 7
                </Badge>
                <Button 
                  variant="ghost" 
                  onClick={onPrevious}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Button>
                <Button 
                  disabled
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50"
                >
                  Siguiente: Edición avanzada
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* No Scenes State */}
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">No hay escenas disponibles</h3>
                  <p className="text-sm text-gray-600">
                    Debes completar el paso del storyboard antes de generar clips.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={onPrevious}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Storyboard
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isInitialLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="h-full overflow-auto">
          <div className="max-w-7xl mx-auto p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Generación inicial de clips</h1>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  Paso 4 de 7
                </Badge>
                <Button 
                  variant="ghost" 
                  onClick={onPrevious}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Button>
                <Button 
                  disabled
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50"
                >
                  Siguiente: Edición avanzada
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Loading State */}
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Generando animatics con IA…</h3>
                  <p className="text-sm text-gray-600">
                    Creando propuestas visuales para cada escena del storyboard ({scenes.length} escenas)
                  </p>
                </div>
                
                {/* Skeleton Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
                  {Array.from({ length: Math.min(6, scenes.length || 3) }, (_, i) => (
                    <Card key={i} className="p-4 space-y-4">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-32 w-full rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Generación inicial de clips</h1>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                Paso 4 de 7
              </Badge>
              <Button 
                variant="ghost" 
                onClick={onPrevious}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
              >
                Siguiente: Edición avanzada
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Clips by Scene */}
          <div className="space-y-8">
            {scenes.map((scene, sceneIndex) => {
              const sceneClips = getSceneClips(scene.id);
              if (sceneClips.length === 0) return null;

              return (
                <div key={scene.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">
                      {scene.title || `Escena ${sceneIndex + 1}`}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {sceneClips.length} variación{sceneClips.length !== 1 ? 'es' : ''}
                      </Badge>
                      {sceneClips.length < 3 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateAdditionalClip(scene.id)}
                          disabled={generatingAdditional.has(scene.id)}
                          className="text-xs h-7 px-2"
                        >
                          {generatingAdditional.has(scene.id) ? (
                            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-1" />
                          ) : (
                            <Sparkles className="w-3 h-3 mr-1" />
                          )}
                          {generatingAdditional.has(scene.id) ? 'Generando...' : 'Más opciones'}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {sceneClips.map((clip, index) => (
              <Card key={clip.id} className="p-4 relative group hover:shadow-md transition-shadow">
                {/* Clip Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-medium text-sm text-gray-900">
                    {clip.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {clip.duration}s
                    </Badge>
                    {clip.isSelected && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Seleccionado
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Preview Box */}
                <div className="mb-4">
                  <div 
                    className="relative rounded-lg overflow-hidden border-2 group"
                    style={{
                      width: '100%',
                      height: '135px',
                      borderColor: clip.previewColor + '40'
                    }}
                  >
                    {clip.thumbnailUrl ? (
                      <img 
                        src={clip.thumbnailUrl}
                        alt={`Preview de ${clip.title}`}
                        className="w-full h-full object-cover"
                        style={{ filter: `hue-rotate(${Math.random() * 360}deg)` }}
                        onError={(e) => {
                          // Fallback to color preview if image fails
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: clip.previewColor + '20' }}
                      >
                        <div className="text-center space-y-2">
                          <div 
                            className="w-8 h-8 rounded mx-auto flex items-center justify-center"
                            style={{ backgroundColor: clip.previewColor }}
                          >
                            <Video className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-xs text-gray-600">
                            <div>Preview animatic 16:9</div>
                            <div className="text-gray-500">240×135px</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Color overlay for brand consistency */}
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{ backgroundColor: clip.previewColor }}
                    />

                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <button 
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg"
                        onClick={() => {
                          // Simulate preview playback
                          console.log(`Playing preview for clip: ${clip.id}`);
                        }}
                      >
                        <Play className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>

                    {/* Preview label */}
                    <div className="absolute top-2 left-2">
                      <Badge 
                        className="text-xs px-2 py-1 bg-white/80 backdrop-blur-sm text-gray-700"
                      >
                        Preview IA
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Script */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <strong>Guión:</strong> {clip.script}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`clip-${clip.id}`}
                      checked={clip.isSelected}
                      onCheckedChange={() => toggleClipSelection(clip.id)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label 
                      htmlFor={`clip-${clip.id}`}
                      className="text-xs font-medium cursor-pointer"
                    >
                      Seleccionar
                    </label>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => regenerateClip(clip.id)}
                    disabled={clip.isGenerating || regeneratingClips.has(clip.id)}
                    className="text-xs h-7 px-2"
                  >
                    {clip.isGenerating || regeneratingClips.has(clip.id) ? (
                      <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span className="ml-1">Regenerar IA</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => discardClip(clip.id)}
                    disabled={getSceneClips(clip.sceneId).length <= 1}
                    className="text-xs h-7 px-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="ml-1">Descartar</span>
                  </Button>
                </div>

                {/* Generating Overlay */}
                {(clip.isGenerating || regeneratingClips.has(clip.id)) && (
                  <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-blue-600">Regenerando...</p>
                    </div>
                  </div>
                )}
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats and Validation */}
          <div className="space-y-4">
            {/* Selection Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span>{generatedClips.length} clips generados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{selectedClipsCount} seleccionados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>~{totalDuration}s duración total</span>
                </div>
              </div>
              
              {brandKit && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Colores BrandKit aplicados
                  </Badge>
                </div>
              )}
            </div>

            {/* Validation Warning */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800">
                    <strong>Validación:</strong> Debes seleccionar al menos una propuesta por escena para continuar.
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-yellow-700">
                    {scenes.map(scene => {
                      const hasSelection = generatedClips.some(clip => 
                        clip.sceneId === scene.id && clip.isSelected
                      );
                      return (
                        <div key={scene.id} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${hasSelection ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span>{scene.title || `Escena ${scenes.findIndex(s => s.id === scene.id) + 1}`}</span>
                          {hasSelection && <span className="text-green-600">(✓ Seleccionado)</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4">
              <Button 
                variant="ghost" 
                onClick={onPrevious}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
              >
                Siguiente: Edición avanzada
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}