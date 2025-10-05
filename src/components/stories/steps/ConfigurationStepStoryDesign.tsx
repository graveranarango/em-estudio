import { useState } from "react";
import { 
  ArrowLeft,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { useStoryProject } from "../../../contexts/StoryProjectContext";

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

export function ConfigurationStepStoryDesign() {
  const { goToNextStep, goToPreviousStep } = useStoryProject();
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
    <div className="h-full bg-canvas">
      {/* Layout principal con padding y gap */}
      <div className="h-full flex flex-col gap-6 p-8">
        {/* Header */}
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-medium">Configuración de Historia</h1>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
              Paso 2 de 6
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Siguiente: Generación inicial
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 space-y-6 overflow-y-auto">
          {/* Sección: Duración */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-medium mb-4">Duración</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium min-w-0">Duración exacta (segundos)</label>
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="range"
                    min="5"
                    max="15"
                    step="1"
                    value={duracion}
                    onChange={(e) => handleDuracionChange(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, #2563EB 0%, #2563EB ${((duracion - 5) / (15 - 5)) * 100}%, #E5E7EB ${((duracion - 5) / (15 - 5)) * 100}%, #E5E7EB 100%)`
                    }}
                  />
                  <input
                    type="number"
                    min="5"
                    max="15"
                    value={duracionInput}
                    onChange={(e) => handleDuracionInputChange(e.target.value)}
                    className="w-16 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">s</span>
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
            <div className="flex flex-wrap gap-2">
              {INTERACTIVE_ELEMENTS.map((elemento) => (
                <button
                  key={elemento.id}
                  onClick={() => handleElementoInteractivoToggle(elemento.id)}
                  className={`px-3 py-2 rounded-xl text-sm border transition-all ${
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
            <div className="flex flex-wrap gap-2">
              {VISUAL_STYLES.map((estilo) => (
                <button
                  key={estilo.id}
                  onClick={() => handleEstiloVisualChange(estilo.id)}
                  className={`px-3 py-2 rounded-xl text-sm border transition-all ${
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
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium min-w-0">Variaciones a generar</label>
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={variaciones}
                    onChange={(e) => handleVariacionesChange(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, #2563EB 0%, #2563EB ${((variaciones - 1) / (5 - 1)) * 100}%, #E5E7EB ${((variaciones - 1) / (5 - 1)) * 100}%, #E5E7EB 100%)`
                    }}
                  />
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={variacionesInput}
                    onChange={(e) => handleVariacionesInputChange(e.target.value)}
                    className="w-16 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Validación */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertTriangle className="w-4 h-4" />
            <span>Validación previa: logo y CTA deben estar presentes antes de exportar.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button 
            onClick={goToPreviousStep}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior: Briefing
          </button>
          <button 
            onClick={goToNextStep}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
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