import { useState } from "react";
import { 
  Send,
  Type,
  Sticker,
  Image,
  Palette,
  ChevronDown,
  ChevronUp,
  Upload
} from "lucide-react";

// Mensajes mock del chat
const MOCK_MESSAGES = [
  {
    id: 1,
    role: 'user' as const,
    content: 'Haz el texto principal más grande',
    timestamp: new Date(Date.now() - 120000)
  },
  {
    id: 2,
    role: 'assistant' as const,
    content: '✅ Texto aumentado en tamaño.',
    timestamp: new Date(Date.now() - 100000)
  }
];

// Opciones de herramientas (versión móvil)
const FONT_OPTIONS = ['Montserrat', 'Inter', 'Poppins', 'Roboto'];
const ANIMATION_OPTIONS = ['Ninguna', 'Fade', 'Slide', 'Zoom'];
const COLOR_PALETTE = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777'];
const BACKGROUND_TYPES = ['Color', 'Degradado', 'Imagen', 'Video'];
const STICKER_TYPES = ['Pregunta', 'Encuesta', 'Reacción', 'Link / CTA'];

// Historias mock seleccionadas del paso 3
const SELECTED_STORIES = [
  { id: 1, title: 'Historia 1', thumbnail: 'https://via.placeholder.com/180x320/2563eb/ffffff?text=1' },
  { id: 2, title: 'Historia 2', thumbnail: 'https://via.placeholder.com/180x320/dc2626/ffffff?text=2' },
  { id: 3, title: 'Historia 3', thumbnail: 'https://via.placeholder.com/180x320/059669/ffffff?text=3' },
];

// Configuración inicial por historia
const getInitialStoryConfig = () => ({
  // Herramientas de texto
  selectedFont: 'Montserrat',
  textColor: '#2563eb',
  textSize: 24,
  textAnimation: 'Ninguna',
  
  // Stickers
  selectedStickerTypes: ['Link / CTA'],
  stickerText: '',
  
  // Fondo
  backgroundType: 'Color',
  backgroundColor: '#2563eb',
  
  // Logo
  logoSize: 40,
  logoOpacity: 100,
});

export function AdvancedEditorStepStoryMobile() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showTools, setShowTools] = useState(false);
  
  // Estado para navegación entre historias
  const [activeStoryId, setActiveStoryId] = useState(SELECTED_STORIES[0].id);
  
  // Estados de configuración por historia
  const [storyConfigs, setStoryConfigs] = useState(() => {
    const configs: Record<number, any> = {};
    SELECTED_STORIES.forEach(story => {
      configs[story.id] = getInitialStoryConfig();
    });
    return configs;
  });

  // Obtener configuración de la historia activa
  const currentConfig = storyConfigs[activeStoryId];
  
  // Funciones para actualizar configuración de la historia activa
  const updateCurrentConfig = (updates: Partial<any>) => {
    setStoryConfigs(prev => ({
      ...prev,
      [activeStoryId]: {
        ...prev[activeStoryId],
        ...updates
      }
    }));
  };

  // Manejar envío de mensaje
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      role: 'user' as const,
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simular respuesta del asistente
    setTimeout(() => {
      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant' as const,
        content: '✅ Instrucción procesada.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full bg-canvas flex flex-col">
      {/* Navegación de historias - móvil */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex flex-col gap-2">
          <h2 className="font-medium text-gray-900 text-sm">Editando:</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SELECTED_STORIES.map((story) => (
              <button
                key={story.id}
                onClick={() => setActiveStoryId(story.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeStoryId === story.id
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded border border-white/20 flex-shrink-0"
                  style={{ backgroundColor: activeStoryId === story.id ? '#ffffff40' : '#00000020' }}
                />
                {story.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sección de Chat (Acordeón) */}
      <div className="bg-white border-b border-gray-200">
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <h3 className="font-medium">Chat de Edición (IA)</h3>
          {showChat ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showChat && (
          <div className="px-4 pb-4">
            {/* Mensajes compactos */}
            <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                      message.role === 'user'
                        ? 'bg-bubble-user text-white'
                        : 'bg-bubble-assistant text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input compacto */}
            <div className="space-y-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ej: 'Agrega sticker de encuesta'"
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm ${
                  inputValue.trim()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                Enviar instrucción
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Canvas central */}
      <div className="flex-1 flex items-center justify-center p-4 bg-black">
        {/* Canvas 9:16 móvil */}
        <div 
          className="bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center relative"
          style={{ width: '216px', height: '384px' }} // 9:16 ratio pero más pequeño para móvil
        >
          {/* Indicador de historia activa */}
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            {SELECTED_STORIES.find(s => s.id === activeStoryId)?.title}
          </div>
          
          <div className="text-center text-gray-600">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-300 rounded-lg flex items-center justify-center">
              <Image className="w-6 h-6 text-gray-500" />
            </div>
            <h4 className="font-medium mb-1 text-sm">Canvas Historia 9:16</h4>
            <p className="text-xs text-gray-500">(Capas editables)</p>
            <div className="mt-2 text-xs text-gray-400">
              216 × 384 px
            </div>
            
            {/* Mostrar configuración actual compacta */}
            <div className="mt-3 p-2 bg-white rounded text-left text-xs">
              <div className="text-gray-700 font-medium mb-1">Config actual:</div>
              <div className="text-gray-500 space-y-1">
                <div>{currentConfig.selectedFont} {currentConfig.textSize}px</div>
                <div className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded border"
                    style={{ backgroundColor: currentConfig.textColor }}
                  />
                  Color texto
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Herramientas (Acordeón) */}
      <div className="bg-white border-t border-gray-200">
        <button
          onClick={() => setShowTools(!showTools)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <h3 className="font-medium">Herramientas</h3>
          {showTools ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showTools && (
          <div className="px-4 pb-4 max-h-96 overflow-y-auto">
            {/* Herramientas avanzadas para móvil */}
            <div className="space-y-4">
              {/* Sección: Texto */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Type className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-sm">Texto</h4>
                </div>
                
                <div className="space-y-3">
                  {/* Fuente */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Fuente</label>
                    <div className="relative">
                      <select
                        value={currentConfig.selectedFont}
                        onChange={(e) => updateCurrentConfig({ selectedFont: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                      >
                        {FONT_OPTIONS.map((font) => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Color</label>
                    <div className="flex gap-2">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateCurrentConfig({ textColor: color })}
                          className={`w-6 h-6 rounded-full border-2 ${
                            currentConfig.textColor === color ? 'border-gray-400' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tamaño */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Tamaño: {currentConfig.textSize}px
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="72"
                      value={currentConfig.textSize}
                      onChange={(e) => updateCurrentConfig({ textSize: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      style={{
                        background: `linear-gradient(to right, #2563EB 0%, #2563EB ${((currentConfig.textSize - 10) / (72 - 10)) * 100}%, #E5E7EB ${((currentConfig.textSize - 10) / (72 - 10)) * 100}%, #E5E7EB 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Sección: Stickers / Interacción */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Sticker className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-sm">Stickers / Interacción</h4>
                </div>
                
                <div className="space-y-3">
                  {/* Tipos de stickers */}
                  <div className="grid grid-cols-2 gap-2">
                    {STICKER_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          const newTypes = currentConfig.selectedStickerTypes.includes(type)
                            ? currentConfig.selectedStickerTypes.filter((t: string) => t !== type)
                            : [...currentConfig.selectedStickerTypes, type];
                          updateCurrentConfig({ selectedStickerTypes: newTypes });
                        }}
                        className={`px-2 py-1 rounded-lg text-xs border transition-all ${
                          currentConfig.selectedStickerTypes.includes(type)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Texto del sticker */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Texto del sticker</label>
                    <input
                      type="text"
                      value={currentConfig.stickerText}
                      onChange={(e) => updateCurrentConfig({ stickerText: e.target.value })}
                      placeholder="Ej: ¿Qué opinas?"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sección: Fondo */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-sm">Fondo</h4>
                </div>
                
                <div className="space-y-3">
                  {/* Tipo de fondo */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Tipo</label>
                    <div className="relative">
                      <select
                        value={currentConfig.backgroundType}
                        onChange={(e) => updateCurrentConfig({ backgroundType: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                      >
                        {BACKGROUND_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Color de fondo */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Color de fondo</label>
                    <div className="flex gap-2">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateCurrentConfig({ backgroundColor: color })}
                          className={`w-6 h-6 rounded-full border-2 ${
                            currentConfig.backgroundColor === color ? 'border-gray-400' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Uploader compacto */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Subir imagen/video</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-2 text-center hover:border-gray-300 transition-colors">
                      <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">JPG, PNG, MP4</p>
                      <input type="file" accept=".jpg,.png,.mp4" className="hidden" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección: Logo / Branding */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Image className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-sm">Logo / Branding</h4>
                </div>
                
                <div className="space-y-3">
                  {/* Insertar logo */}
                  <button className="w-full px-3 py-2 text-sm bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Insertar logo (BrandKit)
                  </button>

                  {/* Tamaño logo */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Tamaño logo: {currentConfig.logoSize}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={currentConfig.logoSize}
                      onChange={(e) => updateCurrentConfig({ logoSize: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      style={{
                        background: `linear-gradient(to right, #2563EB 0%, #2563EB ${((currentConfig.logoSize - 10) / (100 - 10)) * 100}%, #E5E7EB ${((currentConfig.logoSize - 10) / (100 - 10)) * 100}%, #E5E7EB 100%)`
                      }}
                    />
                  </div>

                  {/* Opacidad logo */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Opacidad logo: {currentConfig.logoOpacity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentConfig.logoOpacity}
                      onChange={(e) => updateCurrentConfig({ logoOpacity: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      style={{
                        background: `linear-gradient(to right, #2563EB 0%, #2563EB ${currentConfig.logoOpacity}%, #E5E7EB ${currentConfig.logoOpacity}%, #E5E7EB 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS personalizado para los sliders móviles */}
      <style jsx="true">{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563EB;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563EB;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}