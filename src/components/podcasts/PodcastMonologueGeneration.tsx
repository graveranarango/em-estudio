import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Skeleton } from "../ui/skeleton";
import { 
  ArrowLeft, 
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Loader2
} from "lucide-react";

interface AudioBlock {
  id: string;
  title: string;
  duration: string;
  text: string;
  isSelected: boolean;
  isPlaying: boolean;
}

export function PodcastMonologueGeneration() {
  const [isLoading, setIsLoading] = useState(true);
  const [audioBlocks, setAudioBlocks] = useState<AudioBlock[]>([]);

  // Simulate loading and generation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAudioBlocks([
        {
          id: 'block-1',
          title: 'Bloque 1 — Introducción',
          duration: '01:30',
          text: 'Hoy quiero hablarte sobre cómo mantener la motivación en el camino del emprendimiento.',
          isSelected: false,
          isPlaying: false
        },
        {
          id: 'block-2',
          title: 'Bloque 2 — Desarrollo',
          duration: '10:00',
          text: 'Te compartiré tres claves que te ayudarán a mantenerte firme frente a la frustración inicial del emprendimiento.',
          isSelected: false,
          isPlaying: false
        },
        {
          id: 'block-3',
          title: 'Bloque 3 — Conclusión',
          duration: '03:00',
          text: 'Recuerda: cada paso cuenta. La constancia es la clave para alcanzar el éxito. ¡Nos escuchamos en el próximo episodio!',
          isSelected: false,
          isPlaying: false
        }
      ]);
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const toggleSelection = (blockId: string) => {
    setAudioBlocks(prev => 
      prev.map(block => 
        block.id === blockId 
          ? { ...block, isSelected: !block.isSelected }
          : block
      )
    );
  };

  const togglePlayback = (blockId: string) => {
    setAudioBlocks(prev => 
      prev.map(block => 
        block.id === blockId 
          ? { ...block, isPlaying: !block.isPlaying }
          : { ...block, isPlaying: false } // Stop other blocks
      )
    );
  };

  const regenerateBlock = (blockId: string) => {
    // Simulate regeneration
    const newTexts = [
      'En este episodio exploraremos los desafíos más comunes que enfrentan los emprendedores.',
      'Déjame compartir contigo una perspectiva diferente sobre este tema tan importante.',
      'Lo que aprendí después de años de experiencia es que la perseverancia es fundamental.',
      'Hay tres aspectos clave que quiero que tengas en cuenta para tu crecimiento profesional.'
    ];
    
    const randomText = newTexts[Math.floor(Math.random() * newTexts.length)];
    
    setAudioBlocks(prev => 
      prev.map(block => 
        block.id === blockId 
          ? { ...block, text: randomText, isPlaying: false }
          : block
      )
    );
  };

  const discardBlock = (blockId: string) => {
    setAudioBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const selectedBlocks = audioBlocks.filter(block => block.isSelected).length;
  const canProceed = selectedBlocks >= Math.min(3, audioBlocks.length); // At least 3 or all available blocks

  const AudioWaveform = ({ duration, isPlaying }: { duration: string; isPlaying: boolean }) => {
    const bars = Array.from({ length: 40 }, (_, i) => ({
      height: Math.random() * 100 + 20,
      isActive: isPlaying && Math.random() > 0.7
    }));

    return (
      <div className="bg-gray-200 rounded-md p-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>00:00</span>
          <span>{duration}</span>
        </div>
        <div className="flex items-center justify-center gap-1 h-12">
          {bars.map((bar, index) => (
            <div
              key={index}
              className={`w-1 rounded-full transition-all duration-150 ${
                bar.isActive ? 'bg-orange-500' : 'bg-gray-400'
              }`}
              style={{ 
                height: `${bar.height}%`,
                opacity: isPlaying ? (bar.isActive ? 1 : 0.6) : 0.8
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const LoadingState = () => (
    <div className="space-y-6">
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          <div>
            <h3 className="font-medium text-lg">Generando borradores de audio con IA…</h3>
            <p className="text-muted-foreground mt-1">
              Esto puede tomar unos momentos mientras procesamos tu guión
            </p>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-4 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-medium">Generación inicial del Podcast (Monólogo)</h1>
              <p className="text-muted-foreground">Paso 4 de 5 - Borradores de audio generados por IA</p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              Paso 4 de 5
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <Button 
              variant="default"
              disabled={!canProceed || isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90"
            >
              Siguiente: Edición avanzada
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        {!isLoading && (
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Bloques seleccionados: {selectedBlocks}/{audioBlocks.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium">Duración total: ~{
                audioBlocks
                  .filter(block => block.isSelected)
                  .reduce((acc, block) => {
                    const [min, sec] = block.duration.split(':').map(Number);
                    return acc + min * 60 + sec;
                  }, 0) / 60
                }min</span>
            </div>
            {canProceed && (
              <Badge className="bg-green-100 text-green-800">
                ✓ Listo para continuar
              </Badge>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && <LoadingState />}

        {/* Audio Blocks Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {audioBlocks.map((block, index) => (
              <Card key={block.id} className={`rounded-xl shadow-sm transition-all ${
                block.isSelected 
                  ? 'border-orange-300 bg-orange-50' 
                  : 'border-gray-200 hover:border-orange-200'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {block.isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-orange-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                      )}
                      {block.title}
                    </CardTitle>
                    {audioBlocks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => discardBlock(block.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Audio Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Preview de audio</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePlayback(block.id)}
                        className="h-8 w-8 p-0"
                      >
                        {block.isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <AudioWaveform duration={block.duration} isPlaying={block.isPlaying} />
                  </div>

                  {/* Narrative Text */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Texto narrativo</span>
                    <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200 leading-relaxed">
                      {block.text}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`select-${block.id}`}
                        checked={block.isSelected}
                        onCheckedChange={() => toggleSelection(block.id)}
                      />
                      <label 
                        htmlFor={`select-${block.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        Seleccionar versión
                      </label>
                    </div>
                    
                    <div className="flex gap-2 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => regenerateBlock(block.id)}
                        className="text-xs"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Regenerar IA
                      </Button>
                    </div>
                  </div>

                  {/* Block Stats */}
                  <div className="text-xs text-muted-foreground text-right">
                    {block.text.split(' ').length} palabras • {block.duration}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Generation Summary */}
        {!isLoading && (
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resumen de generación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-orange-800 mb-1">Bloques generados:</p>
                  <p className="text-orange-700">{audioBlocks.length}</p>
                </div>
                <div>
                  <p className="font-medium text-orange-800 mb-1">Bloques seleccionados:</p>
                  <p className="text-orange-700">{selectedBlocks}</p>
                </div>
                <div>
                  <p className="font-medium text-orange-800 mb-1">Duración total:</p>
                  <p className="text-orange-700">
                    ~{Math.round(audioBlocks
                      .filter(block => block.isSelected)
                      .reduce((acc, block) => {
                        const [min, sec] = block.duration.split(':').map(Number);
                        return acc + min * 60 + sec;
                      }, 0) / 60
                    )} minutos
                  </p>
                </div>
                <div>
                  <p className="font-medium text-orange-800 mb-1">Estado:</p>
                  <p className="text-orange-700">
                    {canProceed ? '✓ Listo' : '⚠️ Selecciona más bloques'}
                  </p>
                </div>
              </div>
              
              {selectedBlocks > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-orange-800 mb-2">Bloques seleccionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {audioBlocks
                      .filter(block => block.isSelected)
                      .map((block, index) => (
                        <Badge
                          key={block.id}
                          className="bg-orange-100 text-orange-800 border-orange-200"
                        >
                          {index + 1}. {block.title.split('—')[1]?.trim() || `Bloque ${index + 1}`}
                        </Badge>
                      ))
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer Validation */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-800">
                <strong>Debes seleccionar al menos una versión de audio por bloque para continuar.</strong>
              </p>
              {!canProceed && !isLoading && (
                <p className="text-xs text-amber-700 mt-1">
                  ⚠️ Selecciona al menos {Math.min(3, audioBlocks.length)} bloques para proceder al siguiente paso.
                </p>
              )}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <Button 
              variant="default"
              disabled={!canProceed || isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90"
            >
              Siguiente: Edición avanzada
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}