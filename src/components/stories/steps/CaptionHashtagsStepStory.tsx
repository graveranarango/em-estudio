import { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Hash, 
  X, 
  AlertTriangle,
  CheckCircle,
  Smile
} from 'lucide-react';

// Historias mock seleccionadas
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

export function CaptionHashtagsStepStory() {
  const [activeStoryId, setActiveStoryId] = useState(SELECTED_STORIES[0].id);
  const [storiesData, setStoriesData] = useState(SELECTED_STORIES);
  const [allowEmojis, setAllowEmojis] = useState(true);

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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-medium text-gray-900">Captions & Hashtags para Historias</h1>
              <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                Paso 5 de 6
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {storiesData.map((story) => (
                <button
                  key={story.id}
                  onClick={() => setActiveStoryId(story.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    activeStoryId === story.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {story.isValid ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                  )}
                  {story.title}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
              <button 
                disabled={!hasValidStory}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                  hasValidStory
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Siguiente: Publicación
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-medium text-sm">{activeStory.title.slice(-1)}</span>
              </div>
              <h2 className="text-lg font-medium text-gray-900">{activeStory.title}</h2>
            </div>

            <div className="space-y-6">
              {/* Caption section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium text-gray-900">Caption generado por IA</label>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
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
                  className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Escribe tu caption aquí..."
                />

                {/* Validation warning */}
                {isOverLimit && (
                  <div className="flex items-center gap-2 mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <div>
                      <div className="text-orange-700 font-medium text-sm">
                        Caption demasiado largo para Instagram
                      </div>
                      <div className="text-orange-600 text-sm">
                        IA recomienda acortar a {characterLimit} caracteres
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hashtags section */}
              <div>
                <label className="font-medium text-gray-900 block mb-3">Hashtags sugeridos</label>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {activeStory.hashtags.map((hashtag, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      {hashtag}
                      <button
                        onClick={() => removeHashtag(hashtag)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Additional hashtag suggestions */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Sugerencias adicionales:</div>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_HASHTAGS
                      .filter(tag => !activeStory.hashtags.includes(tag))
                      .slice(0, 5)
                      .map((hashtag) => (
                        <button
                          key={hashtag}
                          onClick={() => addHashtag(hashtag)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                        >
                          <Hash className="w-3 h-3" />
                          {hashtag.slice(1)}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={regenerateCaption}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerar caption
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                    <Hash className="w-4 h-4" />
                    Sugerir más hashtags
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={allowEmojis}
                      onChange={(e) => setAllowEmojis(e.target.checked)}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <Smile className="w-4 h-4" />
                    Permitir emojis
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer validation */}
          {!hasValidStory && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm">
                  Debes confirmar al menos un caption válido antes de continuar.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-6xl mx-auto flex justify-end gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <button 
            disabled={!hasValidStory}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
              hasValidStory
                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Siguiente: Publicación
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}