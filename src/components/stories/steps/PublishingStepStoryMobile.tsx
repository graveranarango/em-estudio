import { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Download, 
  Calendar, 
  Clock, 
  Sparkles,
  Instagram,
  Facebook,
  MessageCircle,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Mock data para historias seleccionadas (mobile)
const SELECTED_STORIES = [
  { 
    id: 1, 
    title: 'Historia 1',
    type: 'Promocional',
    exported: false,
    scheduled: false,
    platforms: []
  },
  { 
    id: 2, 
    title: 'Historia 2', 
    type: 'Informativo',
    exported: true,
    scheduled: true,
    platforms: ['instagram', 'facebook']
  },
  { 
    id: 3, 
    title: 'Historia 3',
    type: 'Behind the Scenes',
    exported: false,
    scheduled: false,
    platforms: []
  },
];

// Plataformas disponibles
const AVAILABLE_PLATFORMS = [
  { id: 'instagram', name: 'Instagram Stories', icon: Instagram, color: 'bg-pink-500' },
  { id: 'facebook', name: 'Facebook Stories', icon: Facebook, color: 'bg-blue-600' },
  { id: 'tiktok', name: 'TikTok Stories', icon: MessageCircle, color: 'bg-black' },
];

// Eventos de calendario mock
const CALENDAR_EVENTS = [
  { date: '2025-10-15', time: '18:00', story: 'Historia 1', type: 'Promocional' },
  { date: '2025-10-16', time: '12:00', story: 'Historia 2', type: 'Informativo' },
  { date: '2025-10-17', time: '15:30', story: 'Historia 3', type: 'Behind the Scenes' },
];

export function PublishingStepStoryMobile() {
  const [activeStoryId, setActiveStoryId] = useState(SELECTED_STORIES[0].id);
  const [storiesData, setStoriesData] = useState(SELECTED_STORIES);
  const [exportQuality, setExportQuality] = useState('high');
  const [schedulingMode, setSchedulingMode] = useState('manual');
  const [scheduleDate, setScheduleDate] = useState('2025-10-15');
  const [scheduleTime, setScheduleTime] = useState('18:00');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const activeStory = storiesData.find(story => story.id === activeStoryId);
  if (!activeStory) return null;

  // Verificar si al menos una historia está lista para finalizar
  const hasCompletedStory = storiesData.some(story => story.exported && story.scheduled && story.platforms.length > 0);

  const updateActiveStory = (updates: Partial<typeof activeStory>) => {
    setStoriesData(prev => prev.map(story => 
      story.id === activeStoryId ? { ...story, ...updates } : story
    ));
  };

  const handleExport = () => {
    setShowExportDialog(true);
    setTimeout(() => {
      updateActiveStory({ exported: true });
      setShowExportDialog(false);
    }, 2000);
  };

  const togglePlatform = (platformId: string) => {
    const currentPlatforms = activeStory.platforms;
    const newPlatforms = currentPlatforms.includes(platformId)
      ? currentPlatforms.filter(p => p !== platformId)
      : [...currentPlatforms, platformId];
    
    updateActiveStory({ platforms: newPlatforms });
  };

  const scheduleWithAI = () => {
    // Simular programación con IA
    const aiSuggestions = [
      { date: '2025-10-15', time: '18:00', reason: 'Mayor engagement los martes por la tarde' },
      { date: '2025-10-16', time: '12:00', reason: 'Horario de almuerzo óptimo para tu audiencia' },
      { date: '2025-10-17', time: '20:30', reason: 'Peak time para tu demografía' },
    ];
    
    const suggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
    setScheduleDate(suggestion.date);
    setScheduleTime(suggestion.time);
    setSchedulingMode('ai');
    updateActiveStory({ scheduled: true });
  };

  const confirmSchedule = () => {
    updateActiveStory({ scheduled: true });
  };

  return (
    <div className="h-full bg-canvas flex flex-col">
      {/* Header compacto móvil */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-medium text-gray-900">Publicación final</h1>
          <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
            6/6
          </div>
        </div>

        {/* Tabs de navegación móvil */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {storiesData.map((story) => {
            const isComplete = story.exported && story.scheduled && story.platforms.length > 0;
            return (
              <button
                key={story.id}
                onClick={() => setActiveStoryId(story.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeStoryId === story.id
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isComplete ? (
                  <CheckCircle className="w-3 h-3 text-green-400" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-orange-400" />
                )}
                {story.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido principal - scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          
          {/* Export section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                <Download className="w-3 h-3 text-white" />
              </div>
              <h2 className="font-medium text-gray-900">Exportar archivo</h2>
              {activeStory.exported && (
                <div className="flex items-center gap-1 text-green-600 text-xs ml-auto">
                  <Check className="w-3 h-3" />
                  Exportado
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-medium text-gray-900 text-sm block mb-2">Formato</label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-700 text-sm">
                  9:16 (vertical) - Optimizado para Stories
                </div>
              </div>

              <div>
                <label className="font-medium text-gray-900 text-sm block mb-2">Calidad</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExportQuality('high')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      exportQuality === 'high'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Alta (1080x1920)
                  </button>
                  <button
                    onClick={() => setExportQuality('medium')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      exportQuality === 'medium'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Media (720x1280)
                  </button>
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={activeStory.exported || showExportDialog}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                  activeStory.exported
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : showExportDialog
                    ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {showExportDialog ? (
                  <>
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Generando...
                  </>
                ) : activeStory.exported ? (
                  <>
                    <Check className="w-3 h-3" />
                    Completado
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3" />
                    Generar exportación
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Scheduling section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-3 h-3 text-white" />
              </div>
              <h2 className="font-medium text-gray-900">Programar publicación</h2>
              {activeStory.scheduled && (
                <div className="flex items-center gap-1 text-green-600 text-xs ml-auto">
                  <Check className="w-3 h-3" />
                  Programado
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-medium text-gray-900 text-sm block mb-2">Programar manualmente</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Fecha</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Hora</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                
                {schedulingMode === 'manual' && (
                  <button
                    onClick={confirmSchedule}
                    className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Confirmar programación
                  </button>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>

              <button
                onClick={scheduleWithAI}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm"
              >
                <Sparkles className="w-3 h-3" />
                Programar con IA
              </button>
              
              {schedulingMode === 'ai' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-purple-700 text-xs">
                    📊 IA recomienda: <strong>{scheduleDate} a las {scheduleTime}</strong>
                  </div>
                  <div className="text-purple-600 text-xs mt-1">
                    Mayor engagement según tu audiencia
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Platforms section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <h2 className="font-medium text-gray-900">Plataformas</h2>
            </div>

            <div className="space-y-2">
              {AVAILABLE_PLATFORMS.map((platform) => {
                const isSelected = activeStory.platforms.includes(platform.id);
                const Icon = platform.icon;
                
                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all w-full ${
                      isSelected
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 ${platform.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{platform.name}</span>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-blue-500 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar section expandible */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-3 h-3 text-white" />
                </div>
                <h2 className="font-medium text-gray-900">Vista de agenda</h2>
              </div>
              {showCalendar ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {showCalendar && (
              <div className="space-y-2">
                {CALENDAR_EVENTS.map((event, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{event.story}</div>
                        <div className="text-gray-600 text-xs">{event.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 text-xs font-medium">{event.date}</div>
                        <div className="text-gray-600 text-xs flex items-center gap-1">
                          <Clock className="w-2 h-2" />
                          {event.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-blue-700 text-xs font-medium">
                    📅 {CALENDAR_EVENTS.length} historias programadas esta semana
                  </div>
                  <div className="text-blue-600 text-xs mt-1">
                    Distribución óptima para máximo alcance
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress summary móvil */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3 text-sm">Resumen del progreso</h3>
            <div className="space-y-2">
              {storiesData.map((story) => {
                const progress = [
                  story.exported,
                  story.scheduled,
                  story.platforms.length > 0
                ].filter(Boolean).length;
                
                return (
                  <div key={story.id} className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">{story.title}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${(progress / 3) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{progress}/3</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation mensaje móvil */}
          {!hasCompletedStory && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2 text-orange-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="text-xs">
                  Completa exportación, programación y plataformas para al menos una historia.
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
            disabled={!hasCompletedStory}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              hasCompletedStory
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}