import { useState } from "react";
import { 
  ArrowLeft,
  ArrowRight,
  AlertTriangle
} from "lucide-react";

// Elementos interactivos disponibles
const INTERACTIVE_ELEMENTS = [
  { id: 'sticker', label: 'Sticker' },
  { id: 'encuesta', label: 'Encuesta' },
  { id: 'pregunta', label: 'Pregunta' },
  { id: 'reaccion', label: 'Reacción' },
  { id: 'link_cta', label: 'Link / CTA' }
];

// Estilos visuales disponibles
const VISUAL_STYLES = [
  { id: 'minimalista', label: 'Minimalista' },
  { id: 'colorido', label: 'Colorido' },
  { id: 'dinamico', label: 'Dinámico' },
  { id: 'plantilla_oficial', label: 'Plantilla oficial' }
];

export function ConfigurationStepStoryMobile() {
  const [duracion, setDuracion] = useState(10);
  const [duracionInput, setDuracionInput] = useState('10');
  const [elementosInteractivos, setElementosInteractivos] = useState<string[]>(['link_cta']);
  const [estiloVisual, setEstiloVisual] = useState('minimalista');
  const [variaciones, setVariaciones] = useState(2);
  const [variacionesInput, setVariacionesInput] = useState('2');

  // Manejar cambio en slider de duración
  const handleDuracionChange = (value: number) => {
    setDuracion(value);
    setDuracionInput(value.toString());
  };

  // Manejar cambio en input de duración
  const handleDuracionInputChange = (value: string) => {
    setDuracionInput(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 5 && numValue <= 15) {
      setDuracion(numValue);
    }
  };

  // Manejar cambio en slider de variaciones
  const handleVariacionesChange = (value: number) => {
    setVariaciones(value);
    setVariacionesInput(value.toString());
  };

  // Manejar cambio en input de variaciones
  const handleVariacionesInputChange = (value: string) => {
    setVariacionesInput(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
      setVariaciones(numValue);
    }
  };

  // Manejar selección de elementos interactivos
  const handleElementoInteractivoToggle = (elementoId: string) => {
    setElementosInteractivos(prev => 
      prev.includes(elementoId)
        ? prev.filter(id => id !== elementoId)
        : [...prev, elementoId]
    );
  };

  // Manejar selección de estilo visual
  const handleEstiloVisualChange = (estiloId: string) => {
    setEstiloVisual(estiloId);
  };

  return (
    <div className="h-full bg-canvas flex flex-col">
      {/* Header móvil */}
      <div className="bg-white border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium">Configuración de Historia</h1>
          <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            Paso 2 de 6
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Sección: Duración */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-medium mb-4">Duración</h3>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Duración exacta (segundos)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="15"
                    value={duracionInput}
                    onChange={(e) => handleDuracionInputChange(e.target.value)}
                    className="w-12 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">s</span>
                </div>
              </div>
              <input
                type="range"
                min="5"
                max="15"
                step="1"
                value={duracion}
                onChange={(e) => handleDuracionChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, #2563EB 0%, #2563EB ${((duracion - 5) / (15 - 5)) * 100}%, #E5E7EB ${((duracion - 5) / (15 - 5)) * 100}%, #E5E7EB 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5s</span>
                <span>15s</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              El rango depende del tipo de historia seleccionado en el paso anterior.
            </p>
          </div>
        </div>

        {/* Sección: Elementos interactivos */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-medium mb-4">Elementos interactivos</h3>
          <div className="grid grid-cols-2 gap-2">
            {INTERACTIVE_ELEMENTS.map((elemento) => (
              <button
                key={elemento.id}
                onClick={() => handleElementoInteractivoToggle(elemento.id)}
                className={`px-3 py-2 rounded-xl text-sm border transition-all text-center ${
                  elementosInteractivos.includes(elemento.id)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {elemento.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sección: Estilo visual */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-medium mb-4">Estilo visual</h3>
          <div className="grid grid-cols-2 gap-2">
            {VISUAL_STYLES.map((estilo) => (
              <button
                key={estilo.id}
                onClick={() => handleEstiloVisualChange(estilo.id)}
                className={`px-3 py-2 rounded-xl text-sm border transition-all text-center ${
                  estiloVisual === estilo.id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {estilo.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sección: Número de variaciones */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-medium mb-4">Número de variaciones</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Variaciones a generar</label>
              <input
                type="number"
                min="1"
                max="5"
                value={variacionesInput}
                onChange={(e) => handleVariacionesInputChange(e.target.value)}
                className="w-12 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={variaciones}
              onChange={(e) => handleVariacionesChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              style={{
                background: `linear-gradient(to right, #2563EB 0%, #2563EB ${((variaciones - 1) / (5 - 1)) * 100}%, #E5E7EB ${((variaciones - 1) / (5 - 1)) * 100}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>5</span>
            </div>
          </div>
        </div>

        {/* Sección: Validación */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              <strong>Validación previa:</strong> logo y CTA deben estar presentes antes de exportar.
            </p>
          </div>
        </div>
      </div>

      {/* Footer fijo */}
      <div className="bg-white border-t border-gray-100 p-4">
        <div className="flex gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-200 rounded flex-1">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1">
            Siguiente: Generación inicial
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CSS personalizado para los sliders */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #2563EB;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .slider-thumb::-moz-range-thumb {
          height: 16px;
          width: 16px;
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