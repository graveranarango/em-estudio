import { useState, useEffect } from "react";
import { 
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Loader2,
  RotateCcw,
  Trash2,
  CheckSquare,
  Square,
  MoreVertical
} from "lucide-react";

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

export function GenerationStepStoryMobile() {
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
      <div className="h-full bg-canvas flex flex-col">
        {/* Header durante loading */}
        <div className="bg-white border-b border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium">Generación inicial de Historias</h1>
            <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              Paso 3 de 6
            </div>
          </div>
        </div>

        {/* Estado de loading */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-center">Generando borradores de historias con IA…</span>
          </div>

          {/* Skeleton grid móvil */}
          <div className="grid grid-cols-2 gap-4 w-full">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-3 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="h-6 bg-gray-200 rounded flex-1"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-canvas flex flex-col">
      {/* Header móvil */}
      <div className="bg-white border-b border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-medium">Generación inicial de Historias</h1>
          <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            Paso 3 de 6
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {selectedCount} seleccionada{selectedCount !== 1 ? 's' : ''}
          </span>
          <button 
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {selectedStories.length === stories.length ? 'Deseleccionar' : 'Seleccionar todo'}
          </button>
        </div>
      </div>

      {/* Grid de historias */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {stories.map((story) => {
            const isSelected = selectedStories.includes(story.id);
            
            return (
              <div 
                key={story.id}
                className={`bg-white rounded-xl shadow-sm p-3 transition-all border-2 ${
                  isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent'
                }`}
              >
                {/* Preview box 9:16 compacto */}
                <div className="relative mb-3">
                  <div 
                    className={`w-full h-48 rounded-lg ${story.preview.bg} flex items-center justify-center text-white relative overflow-hidden`}
                  >
                    <div className="text-center p-2">
                      {story.preview.content.split('\n').map((line, index) => (
                        <div 
                          key={index} 
                          className={`${
                            index === 0 ? 'text-sm font-bold mb-1' : 
                            index === 1 ? 'text-lg font-bold mb-1' : 
                            'text-xs'
                          }`}
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                    
                    {/* Overlay de tipo */}
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/20 backdrop-blur-sm rounded text-xs">
                      {story.type}
                    </div>
                    
                    {/* Overlay de selección */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckSquare className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Elementos sugeridos compactos */}
                <div className="mb-3">
                  <h4 className="font-medium text-xs mb-1">Elementos sugeridos</h4>
                  <ul className="space-y-0.5">
                    {story.elements.slice(0, 2).map((element, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-center gap-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
                        <span className="truncate">{element}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Acciones compactas */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStorySelect(story.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs flex-1 transition-colors ${
                      isSelected 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3 h-3" />
                    ) : (
                      <Square className="w-3 h-3" />
                    )}
                    <span className="hidden sm:inline">
                      {isSelected ? 'Seleccionada' : 'Seleccionar'}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleRegenerate(story.id)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    title="Regenerar IA"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => handleDiscard(story.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Descartar"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validación */}
      {!canProceed && (
        <div className="bg-amber-50 border-t border-amber-200 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Debes seleccionar al menos una historia para continuar.
            </p>
          </div>
        </div>
      )}

      {/* Footer fijo */}
      <div className="bg-white border-t border-gray-100 p-4">
        <div className="flex gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-200 rounded flex-1">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <button 
            disabled={!canProceed}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded flex-1 ${
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