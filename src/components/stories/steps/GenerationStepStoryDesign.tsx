import { useState, useEffect } from "react";
import { 
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Loader2,
  RotateCcw,
  Trash2,
  CheckSquare,
  Square
} from "lucide-react";
import { useStoryProject } from "../../../contexts/StoryProjectContext";

// Datos mock de historias generadas
const MOCK_STORIES = [
  {
    id: 1,
    type: 'Promocional',
    preview: {
      bg: 'bg-gradient-to-br from-blue-500 to-purple-600',
      content: 'OFERTA FLASH\n50% OFF\nSolo hoy'
    },
    elements: [
      'Sticker: ¿Qué opinas?',
      'CTA: Desliza hacia arriba'
    ]
  },
  {
    id: 2,
    type: 'Engagement',
    preview: {
      bg: 'bg-gradient-to-br from-pink-500 to-red-500',
      content: '¿Cuál prefieres?\nA o B\nVota ahora'
    },
    elements: [
      'Encuesta: ¿A o B?',
      'CTA: Vota ahora'
    ]
  },
  {
    id: 3,
    type: 'Educativo',
    preview: {
      bg: 'bg-gradient-to-br from-green-500 to-teal-600',
      content: 'TIP DEL DÍA\n#MarketingTips\nAprende más'
    },
    elements: [
      'Sticker: Tip del día',
      'CTA: Aprende más'
    ]
  },
  {
    id: 4,
    type: 'Behind Scenes',
    preview: {
      bg: 'bg-gradient-to-br from-orange-500 to-yellow-500',
      content: 'DETRÁS DE\nCÁMARAS\nAsí trabajamos'
    },
    elements: [
      'Sticker: Behind scenes',
      'CTA: Ver proceso'
    ]
  },
  {
    id: 5,
    type: 'Producto',
    preview: {
      bg: 'bg-gradient-to-br from-indigo-500 to-blue-600',
      content: 'NUEVO\nPRODUCTO\nConoce más'
    },
    elements: [
      'Sticker: Nuevo producto',
      'CTA: Conoce más'
    ]
  },
  {
    id: 6,
    type: 'Evento',
    preview: {
      bg: 'bg-gradient-to-br from-teal-500 to-green-500',
      content: 'EVENTO\nESPECIAL\nTe esperamos'
    },
    elements: [
      'Sticker: Evento especial',
      'CTA: Te esperamos'
    ]
  }
];

export function GenerationStepStoryDesign() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStories, setSelectedStories] = useState<number[]>([]);
  const [stories, setStories] = useState(MOCK_STORIES);

  // Simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Manejar selección de historias
  const handleStorySelect = (storyId: number) => {
    setSelectedStories(prev => 
      prev.includes(storyId)
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    );
  };

  // Seleccionar todas las historias
  const handleSelectAll = () => {
    if (selectedStories.length === stories.length) {
      setSelectedStories([]);
    } else {
      setSelectedStories(stories.map(story => story.id));
    }
  };

  // Regenerar historia
  const handleRegenerate = (storyId: number) => {
    // Simular regeneración
    console.log(`Regenerating story ${storyId}`);
  };

  // Descartar historia
  const handleDiscard = (storyId: number) => {
    setStories(prev => prev.filter(story => story.id !== storyId));
    setSelectedStories(prev => prev.filter(id => id !== storyId));
  };

  const selectedCount = selectedStories.length;
  const canProceed = selectedCount > 0;

  if (isLoading) {
    return (
      <div className="h-full bg-canvas">
        <div className="h-full flex flex-col gap-6 p-8">
          {/* Header durante loading */}
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-medium">Generación inicial de Historias</h1>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                Paso 3 de 6
              </div>
              <button disabled className="flex items-center gap-2 px-4 py-2 text-gray-400">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
              <button disabled className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded">
                Siguiente: Edición avanzada
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Estado de loading */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-lg">Generando borradores de historias con IA…</span>
            </div>

            {/* Skeleton grid */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-4xl">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                  <div className="w-full h-[420px] bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-canvas">
      <div className="h-full flex flex-col gap-6 p-8">
        {/* Header */}
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-medium">Generación inicial de Historias</h1>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
              Paso 3 de 6
            </div>
            <span className="text-sm text-gray-600">
              {selectedCount} historia{selectedCount !== 1 ? 's' : ''} seleccionada{selectedCount !== 1 ? 's' : ''}
            </span>
            <button 
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedStories.length === stories.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <button 
              disabled={!canProceed}
              className={`flex items-center gap-2 px-4 py-2 rounded ${
                canProceed 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Siguiente: Edición avanzada
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grid de historias */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-6">
            {stories.map((story) => {
              const isSelected = selectedStories.includes(story.id);
              
              return (
                <div 
                  key={story.id}
                  className={`bg-white rounded-xl shadow-sm p-4 transition-all border-2 ${
                    isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent'
                  }`}
                >
                  {/* Preview box 9:16 */}
                  <div className="relative mb-4">
                    <div 
                      className={`w-full h-[420px] rounded-lg ${story.preview.bg} flex items-center justify-center text-white relative overflow-hidden`}
                      style={{ aspectRatio: '9/16' }}
                    >
                      <div className="text-center p-4">
                        {story.preview.content.split('\n').map((line, index) => (
                          <div 
                            key={index} 
                            className={`${
                              index === 0 ? 'text-2xl font-bold mb-2' : 
                              index === 1 ? 'text-4xl font-bold mb-2' : 
                              'text-lg'
                            }`}
                          >
                            {line}
                          </div>
                        ))}
                      </div>
                      
                      {/* Overlay de tipo */}
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/20 backdrop-blur-sm rounded text-xs">
                        {story.type}
                      </div>
                      
                      {/* Overlay de selección */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckSquare className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Elementos sugeridos */}
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2">Elementos sugeridos</h4>
                    <ul className="space-y-1">
                      {story.elements.map((element, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          {element}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStorySelect(story.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded text-sm flex-1 transition-colors ${
                        isSelected 
                          ? 'bg-blue-500 text-white hover:bg-blue-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      {isSelected ? 'Seleccionada' : 'Seleccionar'}
                    </button>
                    
                    <button
                      onClick={() => handleRegenerate(story.id)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                      title="Regenerar IA"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDiscard(story.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      title="Descartar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validación */}
        {!canProceed && (
          <div className="flex items-center gap-2 text-sm text-gray-500 px-4">
            <AlertTriangle className="w-4 h-4" />
            <span>Debes seleccionar al menos una historia para continuar.</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <button 
            disabled={!canProceed}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              canProceed 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Siguiente: Edición avanzada
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}