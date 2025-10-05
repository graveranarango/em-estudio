import { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Hash, 
  X, 
  AlertTriangle,
  CheckCircle,
  Smile,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Historias mock seleccionadas (mobile)
const SELECTED_STORIES = [
  { 
    id: 1, 
    title: 'Historia 1',
    caption: '¡Oferta flash solo por hoy! 🚀 Desliza hacia arriba para aprovechar el descuento.',
    hashtags: ['#Oferta', '#Descuento', '#TuMarca'],
    isValid: false,
    characterCount: 89
  },
  { 
    id: 2, 
    title: 'Historia 2',
    caption: 'Nuevo producto disponible. ¡No te lo pierdas! ✨',
    hashtags: ['#Nuevo', '#Producto', '#TuMarca', '#Disponible'],
    isValid: true,
    characterCount: 52
  },
  { 
    id: 3, 
    title: 'Historia 3',
    caption: 'Behind the scenes de nuestro último proyecto. Proceso creativo increíble que queremos compartir contigo.',
    hashtags: ['#BehindTheScenes', '#Proceso', '#Creativo'],
    isValid: false,
    characterCount: 126
  },
];

// Hashtags sugeridos adicionales
const SUGGESTED_HASHTAGS = [
  '#Marketing', '#Ventas', '#Promocion', '#Limitado', '#Exclusivo',
  '#Calidad', '#Innovacion', '#Tendencia', '#Estilo', '#Premium'
];

export function CaptionHashtagsStepStoryMobile() {
  const [activeStoryId, setActiveStoryId] = useState(SELECTED_STORIES[0].id);
  const [storiesData, setStoriesData] = useState(SELECTED_STORIES);
  const [allowEmojis, setAllowEmojis] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Obtener datos de la historia activa
  const activeStory = storiesData.find(story => story.id === activeStoryId);
  if (!activeStory) return null;

  // Verificar si hay al menos una historia válida
  const hasValidStory = storiesData.some(story => story.isValid);
  const characterLimit = 125;
  const isOverLimit = activeStory.characterCount > characterLimit;

  // Funciones de actualización
  const updateActiveStory = (updates: Partial<typeof activeStory>) => {
    setStoriesData(prev => prev.map(story => 
      story.id === activeStoryId 
        ? { ...story, ...updates, characterCount: updates.caption?.length || story.characterCount }
        : story
    ));
  };

  const regenerateCaption = () => {
    const newCaptions = [
      '¡Nueva oferta disponible! 🔥 Aprovecha ahora.',
      'Descuento especial por tiempo limitado ⏰',
      'No te pierdas esta oportunidad única ✨',
      'Oferta flash: solo por hoy 🚀'
    ];
    const randomCaption = newCaptions[Math.floor(Math.random() * newCaptions.length)];
    updateActiveStory({ 
      caption: randomCaption,
      characterCount: randomCaption.length,
      isValid: randomCaption.length <= characterLimit
    });
  };

  const addHashtag = (hashtag: string) => {
    if (!activeStory.hashtags.includes(hashtag)) {
      updateActiveStory({ hashtags: [...activeStory.hashtags, hashtag] });
    }
  };

  const removeHashtag = (hashtagToRemove: string) => {
    updateActiveStory({ 
      hashtags: activeStory.hashtags.filter(tag => tag !== hashtagToRemove) 
    });
  };

  const validateStory = () => {
    updateActiveStory({ isValid: !isOverLimit && activeStory.caption.trim().length > 0 });
  };

  return (
    <div className="h-full bg-canvas flex flex-col">
      {/* Header compacto móvil */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-medium text-gray-900">Captions & Hashtags</h1>
          <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            5/6
          </div>
        </div>

        {/* Tabs de navegación móvil */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {storiesData.map((story) => (
            <button
              key={story.id}
              onClick={() => setActiveStoryId(story.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeStoryId === story.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {story.isValid ? (
                <CheckCircle className="w-3 h-3 text-green-400" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-orange-400" />
              )}
              {story.title}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido principal - scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Historia activa card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-medium text-xs">{activeStory.title.slice(-1)}</span>
              </div>
              <h2 className="font-medium text-gray-900">{activeStory.title}</h2>
            </div>

            {/* Caption section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-medium text-gray-900 text-sm">Caption generado por IA</label>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className={isOverLimit ? 'text-red-500' : 'text-gray-600'}>
                    {activeStory.characterCount}/{characterLimit}
                  </span>
                </div>
              </div>
              
              <textarea
                value={activeStory.caption}
                onChange={(e) => updateActiveStory({ 
                  caption: e.target.value,
                  characterCount: e.target.value.length
                })}
                onBlur={validateStory}
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows={4}
                placeholder="Escribe tu caption aquí..."
              />

              {/* Validation warning móvil */}
              {isOverLimit && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-orange-700 font-medium text-xs">
                      Caption demasiado largo
                    </div>
                    <div className="text-orange-600 text-xs">
                      Recorta a {characterLimit} caracteres
                    </div>
                  </div>
                </div>
              )}

              {/* Actions compactas */}
              <div className="flex gap-2">
                <button
                  onClick={regenerateCaption}
                  className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerar
                </button>
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="checkbox"
                    checked={allowEmojis}
                    onChange={(e) => setAllowEmojis(e.target.checked)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-3 h-3"
                  />
                  <Smile className="w-3 h-3 text-gray-600" />
                  <span className="text-xs text-gray-600">Emojis</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hashtags section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="font-medium text-gray-900 text-sm">Hashtags actuales</label>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {activeStory.hashtags.map((hashtag, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium"
                >
                  {hashtag}
                  <button
                    onClick={() => removeHashtag(hashtag)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </div>
              ))}
            </div>

            {/* Expandible suggestions */}
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center justify-between w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span>Sugerencias adicionales</span>
              {showSuggestions ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showSuggestions && (
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_HASHTAGS
                    .filter(tag => !activeStory.hashtags.includes(tag))
                    .slice(0, 8)
                    .map((hashtag) => (
                      <button
                        key={hashtag}
                        onClick={() => addHashtag(hashtag)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition-colors"
                      >
                        <Hash className="w-2 h-2" />
                        {hashtag.slice(1)}
                      </button>
                    ))}
                </div>
                <button className="text-xs text-blue-500 hover:text-blue-600">
                  Ver más sugerencias
                </button>
              </div>
            )}
          </div>

          {/* Footer validation móvil */}
          {!hasValidStory && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2 text-orange-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="text-xs">
                  Debes confirmar al menos un caption válido antes de continuar.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation móvil */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex justify-between gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <button 
            disabled={!hasValidStory}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              hasValidStory
                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Siguiente
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}