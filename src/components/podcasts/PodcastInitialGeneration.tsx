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
  TriangleAlert,
  Loader2,
  Volume2
} from "lucide-react";

interface AudioBlock {
  id: string;
  title: string;
  duration: string;
  questions: string[];
  isSelected: boolean;
  isPlaying: boolean;
}

function AudioWaveform({ duration, isPlaying }: { duration: string; isPlaying: boolean }) {
  const bars = Array.from({ length: 40 }, (_, i) => ({
    height: Math.random() * 100 + 20,
    delay: i * 0.1
  }));

  return (
    <div className="bg-gray-200 rounded-md p-4 space-y-3">
      {/* Waveform Visualization */}
      <div className="flex items-center justify-center gap-1 h-16">
        {bars.map((bar, index) => (
          <div
            key={index}
            className={`w-1 bg-blue-500 rounded-full transition-all duration-300 ${
              isPlaying ? 'animate-pulse' : ''
            }`}
            style={{ 
              height: `${bar.height}%`,
              animationDelay: `${bar.delay}s`
            }}
          />
        ))}
      </div>
      
      {/* Duration Display */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>00:00</span>
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      {/* Loading Header */}
      <Card className="p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg font-medium">Generando borradores de audio con IA…</span>
        </div>
        <p className="text-center text-muted-foreground mt-2">
          Esto puede tomar unos minutos. Estamos creando audio de alta calidad para cada bloque.
        </p>
      </Card>

      {/* Skeleton Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function PodcastInitialGeneration() {
  const [isLoading, setIsLoading] = useState(true);
  const [audioBlocks, setAudioBlocks] = useState<AudioBlock[]>([
    {
      id: 'block-1',
      title: 'Bloque 1 — Introducción',
      duration: '02:30',
      questions: [
        'Cuéntanos brevemente quién eres.',
        '¿Qué te motivó a entrar en logística?'
      ],
      isSelected: false,
      isPlaying: false
    },
    {
      id: 'block-2',
      title: 'Bloque 2 — Desarrollo',
      duration: '15:00',
      questions: [
        '¿Cuál ha sido tu mayor reto?',
        '¿Qué consejo darías a alguien que empieza?'
      ],
      isSelected: false,
      isPlaying: false
    },
    {
      id: 'block-3',
      title: 'Bloque 3 — Cierre',
      duration: '05:00',
      questions: [
        '¿Dónde pueden encontrarte?',
        '¿Qué mensaje final quieres dejar?'
      ],
      isSelected: false,
      isPlaying: false
    }
  ]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleSelection = (blockId: string) => {
    setAudioBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, isSelected: !block.isSelected }
        : block
    ));
  };

  const togglePlayback = (blockId: string) => {
    setAudioBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, isPlaying: !block.isPlaying }
        : { ...block, isPlaying: false } // Stop others
    ));
  };

  const regenerateBlock = (blockId: string) => {
    // Simulate regeneration
    setAudioBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { 
            ...block, 
            duration: `${Math.floor(Math.random() * 20) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
            isSelected: false,
            isPlaying: false
          }
        : block
    ));
  };

  const discardBlock = (blockId: string) => {
    setAudioBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const isFormValid = () => {
    return audioBlocks.length >= 3 && audioBlocks.every(block => block.isSelected);
  };

  const selectedCount = audioBlocks.filter(block => block.isSelected).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas p-8">
        <div className="max-w-[1440px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-medium">Generación inicial de Podcast (Entrevista)</h1>
              <Badge variant="secondary" className="text-xs">Paso 4 de 5</Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button className="text-sm" disabled>
                Siguiente: Edición avanzada
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-medium">Generación inicial de Podcast (Entrevista)</h1>
            <Badge variant="secondary" className="text-xs">Paso 4 de 5</Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <Button 
              className="text-sm" 
              disabled={!isFormValid()}
            >
              Siguiente: Edición avanzada
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Progress Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Borradores generados: {audioBlocks.length} bloques
              </p>
              <p className="text-sm text-blue-700">
                Seleccionados: {selectedCount}/{audioBlocks.length}
              </p>
            </div>
            <Badge variant="outline" className="bg-white">
              IA Generada
            </Badge>
          </div>
        </Card>

        {/* Audio Blocks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {audioBlocks.map((block) => (
            <Card key={block.id} className={`rounded-xl shadow-sm transition-all ${
              block.isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{block.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {block.duration}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Audio Preview */}
                <div className="relative">
                  <AudioWaveform duration={block.duration} isPlaying={block.isPlaying} />
                  
                  {/* Play/Pause Button Overlay */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full w-12 h-12"
                    onClick={() => togglePlayback(block.id)}
                  >
                    {block.isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </Button>
                </div>

                {/* Questions List */}
                <div>
                  <label className="text-xs font-medium mb-2 block text-gray-600">
                    Preguntas incluidas ({block.questions.length})
                  </label>
                  <ul className="space-y-1">
                    {block.questions.map((question, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5 flex-shrink-0">{index + 1}.</span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
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
                  
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => regenerateBlock(block.id)}
                      className="text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Regenerar IA
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => discardBlock(block.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Descartar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Validation */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <TriangleAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-800">
              <strong>Debes seleccionar al menos una versión de audio por bloque para continuar.</strong>
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Progreso actual: {selectedCount}/{audioBlocks.length} bloques seleccionados
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" className="text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <Button 
            className="text-sm" 
            disabled={!isFormValid()}
          >
            Siguiente: Edición avanzada
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Debug info */}
        <Card className="bg-slate-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs text-slate-600">Estado de generación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-600 space-y-1">
              <p><strong>Bloques generados:</strong> {audioBlocks.length}</p>
              <p><strong>Bloques seleccionados:</strong> {selectedCount}</p>
              <p><strong>Validación:</strong> {isFormValid() ? '✅ Válido para continuar' : '❌ Selecciona todos los bloques'}</p>
              <p><strong>Duración total estimada:</strong> {
                audioBlocks.reduce((acc, block) => {
                  const [min, sec] = block.duration.split(':').map(Number);
                  return acc + min + (sec / 60);
                }, 0).toFixed(1)
              } minutos</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}