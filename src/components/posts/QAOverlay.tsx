import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { X, CheckCircle, AlertTriangle, Info, Zap } from "lucide-react";

interface QAOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

const QA_CHECKLIST_ITEMS = [
  {
    id: 'contrast',
    label: 'Contraste AA verificado en botones y texto',
    status: 'passed' as const,
    category: 'accessibility',
    details: 'Ratio de contraste mínimo 4.5:1 cumplido en todos los elementos de texto.'
  },
  {
    id: 'focus',
    label: 'Focus visible en todos los interactivos',
    status: 'passed' as const,
    category: 'accessibility',
    details: 'Indicadores de foco implementados en botones, inputs y elementos clickeables.'
  },
  {
    id: 'targets',
    label: 'Targets ≥ 32px',
    status: 'passed' as const,
    category: 'usability',
    details: 'Áreas de click/touch cumplen con el tamaño mínimo recomendado.'
  },
  {
    id: 'performance',
    label: 'Scroll fluido en vista con 1000+ eventos',
    status: 'warning' as const,
    category: 'performance',
    details: 'Requiere virtualización para listas grandes. Considerar lazy loading.'
  },
  {
    id: 'responsive',
    label: 'Diseño responsive validado',
    status: 'passed' as const,
    category: 'usability',
    details: 'Layout se adapta correctamente a diferentes tamaños de pantalla.'
  },
  {
    id: 'keyboard',
    label: 'Navegación completa por teclado',
    status: 'passed' as const,
    category: 'accessibility',
    details: 'Todos los elementos son accesibles usando solo el teclado.'
  }
];

function QAChecklistItem({ item }: { item: typeof QA_CHECKLIST_ITEMS[0] }) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'accessibility':
        return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">A11y</Badge>;
      case 'performance':
        return <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">Perf</Badge>;
      case 'usability':
        return <Badge variant="outline" className="text-xs bg-green-50 text-green-700">UX</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">General</Badge>;
    }
  };

  return (
    <div className="space-y-2">
      <div 
        className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setShowDetails(!showDetails)}
      >
        {getStatusIcon(item.status)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{item.label}</span>
            {getCategoryBadge(item.category)}
          </div>
        </div>
      </div>
      
      {showDetails && (
        <div className="ml-7 p-2 bg-gray-50 rounded text-xs text-gray-600">
          {item.details}
        </div>
      )}
    </div>
  );
}

export function QAOverlay({ isVisible, onClose, isMobile = false }: QAOverlayProps) {
  if (!isVisible) return null;

  const passedCount = QA_CHECKLIST_ITEMS.filter(item => item.status === 'passed').length;
  const warningCount = QA_CHECKLIST_ITEMS.filter(item => item.status === 'warning').length;
  const failedCount = QA_CHECKLIST_ITEMS.filter(item => item.status === 'failed').length;

  return (
    <div 
      className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
        isMobile ? 'p-2' : 'p-12'
      }`}
      onClick={onClose}
    >
      <Card 
        className={`bg-white shadow-md max-h-[80vh] overflow-auto ${
          isMobile ? 'w-full max-w-sm' : 'w-full max-w-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium">Checklist QA & Accesibilidad</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-medium text-green-700">{passedCount}</div>
              <div className="text-xs text-green-600">Pasado</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="text-lg font-medium text-amber-700">{warningCount}</div>
              <div className="text-xs text-amber-600">Advertencia</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-medium text-red-700">{failedCount}</div>
              <div className="text-xs text-red-600">Fallido</div>
            </div>
          </div>

          {/* Lista de items */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Items de verificación:</h4>
            <div className="space-y-1">
              {QA_CHECKLIST_ITEMS.map((item) => (
                <QAChecklistItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Nota de performance */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700">
                <strong>Nota de Performance:</strong> Para calendarios con más de 1000 eventos, 
                se recomienda implementar virtualización de scroll y lazy loading para mantener 
                un rendimiento óptimo.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
            <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
              Exportar reporte
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default QAOverlay;