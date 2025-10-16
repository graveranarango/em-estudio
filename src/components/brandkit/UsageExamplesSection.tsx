import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Plus,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import { useBrandKit } from "../../contexts/BrandKitContext";

const UsageExamplesSection: React.FC = () => {
  const { brandKit } = useBrandKit();
  const examples = brandKit?.usageExamples || { correct: [], incorrect: [] };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Ejemplos de Uso</h3>
          <p className="text-sm text-muted-foreground">
            Muestra cómo aplicar correctamente tu BrandKit
          </p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Añadir Ejemplo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correct Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Uso Correcto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {examples.correct && examples.correct.length > 0 ? (
              <div className="space-y-4">
                {examples.correct.map((example, index) => (
                  <div key={index} className="p-4 rounded-lg border-l-4 border-green-500 bg-green-50 dark:bg-green-900/10">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                      {example.description}
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {example.example}
                    </p>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Ejemplo Correcto
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="mb-2">No hay ejemplos correctos</p>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Primer Ejemplo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Incorrect Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Uso Incorrecto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {examples.incorrect && examples.incorrect.length > 0 ? (
              <div className="space-y-4">
                {examples.incorrect.map((example, index) => (
                  <div key={index} className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      {example.description}
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {example.example}
                    </p>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Ejemplo Incorrecto
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <XCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="mb-2">No hay ejemplos incorrectos</p>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Primer Ejemplo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Visual Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Ejemplos Visuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h4 className="font-medium mb-2">Próximamente: Ejemplos Visuales</h4>
            <p className="text-sm mb-4">
              Pronto podrás subir imágenes que muestren el uso correcto e incorrecto de tu BrandKit.
            </p>
            <Button variant="outline" disabled>
              <Plus className="w-4 h-4 mr-2" />
              Subir Ejemplo Visual
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Referencia Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/10">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-800 dark:text-green-200">Siempre Hacer</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                <li>• Respetar espacios de logo</li>
                <li>• Usar colores de la paleta</li>
                <li>• Mantener tipografías</li>
                <li>• Seguir tono de voz</li>
              </ul>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/10">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h4 className="font-medium text-red-800 dark:text-red-200">Nunca Hacer</h4>
              <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
                <li>• Distorsionar el logo</li>
                <li>• Usar colores ajenos</li>
                <li>• Cambiar tipografías</li>
                <li>• Ignorar las guías</li>
              </ul>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10">
              <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Verificar</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>• Contraste suficiente</li>
                <li>• Legibilidad del texto</li>
                <li>• Coherencia visual</li>
                <li>• Mensaje claro</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { UsageExamplesSection };