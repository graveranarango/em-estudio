import { useState, useEffect } from "react";
import { 
  MessageCircle,
  Send,
  ArrowRight,
  Bot,
  User,
  Check,
  CheckCircle,
  ChevronUp,
  ChevronDown
} from "lucide-react";

// Tipos de historia disponibles
const STORY_TYPES = [
  { id: 'engagement', label: 'Engagement (5–10s)', binding: '@tipo' },
  { id: 'promocional', label: 'Promocional (5–15s)', binding: '@tipo' },
  { id: 'anuncio', label: 'Anuncio (5–15s)', binding: '@tipo' },
  { id: 'educativo', label: 'Educativo (10–15s)', binding: '@tipo' },
  { id: 'behind_scenes', label: 'Behind Scenes (10–15s)', binding: '@tipo' },
  { id: 'producto', label: 'Producto (10–15s)', binding: '@tipo' },
  { id: 'evento', label: 'Evento (5–15s)', binding: '@tipo' },
  { id: 'pregunta_encuesta', label: 'Pregunta/Encuesta (5–10s)', binding: '@tipo' }
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FormData {
  tipo: string;
  objetivo: string;
  publico: string;
  mensaje: string;
  cta: string;
}

export function BriefingStepStoryMobile() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'user',
      content: 'Quiero una historia promocional de 10s con CTA de compra.',
      timestamp: new Date(Date.now() - 60000)
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Entendido. @tipo: Promocional; @duracion: 10s; @objetivo: vender oferta; @cta: Compra ahora; @publico: clientes jóvenes.',
      timestamp: new Date(Date.now() - 30000)
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [formData, setFormData] = useState<FormData>({
    tipo: 'promocional',
    objetivo: 'vender oferta',
    publico: 'clientes jóvenes',
    mensaje: '',
    cta: 'Compra ahora'
  });

  const [chatExpanded, setChatExpanded] = useState(false);

  // Simular smart bindings
  useEffect(() => {
    const lastAssistantMessage = messages
      .filter(m => m.role === 'assistant')
      .pop();
    
    if (lastAssistantMessage) {
      const content = lastAssistantMessage.content;
      
      const tipoMatch = content.match(/@tipo:\s*([^;]+)/);
      const objetivoMatch = content.match(/@objetivo:\s*([^;]+)/);
      const publicoMatch = content.match(/@publico:\s*([^;]+)/);
      const mensajeMatch = content.match(/@mensaje:\s*([^;]+)/);
      const ctaMatch = content.match(/@cta:\s*([^;]+)/);

      setFormData(prev => ({
        ...prev,
        ...(tipoMatch && { tipo: tipoMatch[1].toLowerCase().trim() }),
        ...(objetivoMatch && { objetivo: objetivoMatch[1].trim() }),
        ...(publicoMatch && { publico: publicoMatch[1].trim() }),
        ...(mensajeMatch && { mensaje: mensajeMatch[1].trim() }),
        ...(ctaMatch && { cta: ctaMatch[1].trim() })
      }));
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);

    setTimeout(() => {
      const assistantResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Perfecto. He actualizado los campos del formulario basándome en tu solicitud. ¿Hay algo más que quieras ajustar?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantResponse]);
    }, 1000);

    setInputMessage('');
  };

  const handleChipClick = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      tipo: typeId
    }));
  };

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const checklistItems = [
    { label: 'Tipo de historia seleccionado', completed: !!formData.tipo },
    { label: 'Objetivo definido', completed: !!formData.objetivo },
    { label: 'Público identificado', completed: !!formData.publico },
    { label: 'Mensaje principal listo', completed: !!formData.mensaje },
    { label: 'CTA definido', completed: !!formData.cta }
  ];

  const completedItems = checklistItems.filter(item => item.completed).length;
  const isFormComplete = completedItems === checklistItems.length;

  return (
    <div className="h-full bg-canvas flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Nueva Historia</h2>
          <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            Paso 1 de 6
          </div>
        </div>
      </div>

      {/* Contenido principal - Stack vertical */}
      <div className="flex-1 overflow-y-auto">
        {/* Chat Maestro (arriba) */}
        <div className="bg-white border-b border-gray-100">
          <button
            onClick={() => setChatExpanded(!chatExpanded)}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-sm">Chat Maestro (Briefing de Historia)</h3>
            </div>
            {chatExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {chatExpanded && (
            <div className="px-4 pb-4">
              {/* Ventana de chat */}
              <div className="max-h-60 overflow-y-auto py-3 space-y-3 border border-gray-100 rounded-lg p-3 mb-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-lg text-xs leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input del chat */}
              <div className="space-y-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribe una instrucción o idea…"
                  rows={2}
                  className="w-full p-2 text-sm border border-gray-200 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300"
                >
                  <Send className="w-3 h-3" />
                  Enviar al asistente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Formulario (debajo) */}
        <div className="p-4 space-y-4">
          {/* Tipo de historia */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h3 className="font-medium mb-3">Selecciona tipo de historia</h3>
            <div className="grid grid-cols-2 gap-2">
              {STORY_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleChipClick(type.id)}
                  className={`px-3 py-2 rounded-lg text-xs border transition-all text-left ${
                    formData.tipo === type.id
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Detalles */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h3 className="font-medium mb-3">Detalles de la historia</h3>
            <div className="space-y-4">
              {/* Objetivo */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm font-medium">Objetivo</label>
                  <div className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">AI</div>
                </div>
                <textarea
                  value={formData.objetivo}
                  onChange={(e) => handleFormChange('objetivo', e.target.value)}
                  placeholder="Ej: Aumentar interacción, generar ventas"
                  rows={2}
                  className="w-full p-2 text-sm border border-gray-200 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Público objetivo */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm font-medium">Público objetivo</label>
                  <div className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">AI</div>
                </div>
                <textarea
                  value={formData.publico}
                  onChange={(e) => handleFormChange('publico', e.target.value)}
                  placeholder="Ej: Jóvenes de 18–30 interesados en moda"
                  rows={2}
                  className="w-full p-2 text-sm border border-gray-200 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Mensaje principal */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm font-medium">Mensaje principal</label>
                  <div className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">AI</div>
                </div>
                <input
                  type="text"
                  value={formData.mensaje}
                  onChange={(e) => handleFormChange('mensaje', e.target.value)}
                  placeholder="Ej: Oferta flash disponible hoy"
                  className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* CTA */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm font-medium">CTA</label>
                  <div className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">AI</div>
                </div>
                <input
                  type="text"
                  value={formData.cta}
                  onChange={(e) => handleFormChange('cta', e.target.value)}
                  placeholder="Ej: Desliza hacia arriba, Compra ahora"
                  className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h3 className="font-medium mb-3">Checklist</h3>
            <div className="space-y-2">
              {checklistItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  {item.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 border border-gray-300 rounded-full" />
                  )}
                  <span className={`text-sm ${item.completed ? 'text-green-700' : 'text-gray-600'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            
            {isFormComplete && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    ¡Briefing completo! Listo para continuar.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer fijo */}
      <div className="bg-white border-t border-gray-100 p-4">
        <button
          disabled={!isFormComplete}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm ${
            isFormComplete
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Siguiente: Configuración
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}