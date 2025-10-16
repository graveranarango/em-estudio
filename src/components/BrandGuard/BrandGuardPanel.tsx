import React from 'react';
import { Button } from '../ui/button';

export function BrandGuardPanel({ report, onApplySuggestion }) {
  if (!report || !report.findings || report.findings.length === 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-green-800">¡Todo en orden!</h4>
        <p className="text-sm text-green-700">Este contenido cumple con todas las guías de la marca.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h4 className="font-semibold text-yellow-800">Oportunidades de Mejora</h4>
      <p className="text-sm text-yellow-700 mb-4">
        Se han detectado {report.findings.length} puntos que podrían no alinearse con la voz de la marca.
      </p>
      <div className="space-y-3">
        {report.findings.map((finding, index) => (
          <div key={index} className="p-3 bg-white rounded-md shadow-sm">
            <p className="font-semibold text-sm">{finding.type}</p>
            <p className="text-xs text-gray-600 mb-2">{finding.message}</p>
            {finding.suggestion && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <p className="text-xs italic text-gray-800">Sugerencia: "{finding.suggestion}"</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApplySuggestion(finding.suggestion)}
                >
                  Aplicar
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}