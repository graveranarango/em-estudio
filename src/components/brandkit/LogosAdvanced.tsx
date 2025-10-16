import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Image,
  Download,
  Upload
} from "lucide-react";
import { useBrandKit } from "../../contexts/BrandKitContext";

const LogosAdvanced: React.FC = () => {
  const { brandKit, updateBrandKit } = useBrandKit();
  const logos = brandKit?.logos || [];

  const getTypeColor = (usage: string) => {
    switch (usage?.toLowerCase()) {
      case 'main':
      case 'default': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'darkbackground': 
      case 'negative': return 'bg-black text-white';
      case 'secondary': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'monochrome': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Logos y Símbolos</h3>
          <p className="text-sm text-muted-foreground">
            {logos.length} versiones de logo disponibles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={logos.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Descargar Todo
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Subir Logo
          </Button>
        </div>
      </div>

      {/* Logos Grid */}
      {logos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {logos.map((logo, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="aspect-video bg-gray-50 dark:bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{logo.name}</h4>
                  <Badge className={getTypeColor(logo.usage)}>
                    {logo.usage}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1 mb-3">
                  <p><strong>Formatos:</strong> {logo.formats?.join(', ').toUpperCase() || 'N/A'}</p>
                  <p><strong>Uso:</strong> {logo.usage}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay logos definidos</h3>
            <p className="text-muted-foreground mb-4">
              Sube las diferentes versiones de tu logo para tener acceso rápido en todos los módulos.
            </p>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Subir Primer Logo
            </Button>
          </div>
        </Card>
      )}

      {/* Logo Guidelines */}
      {logos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Guías de Uso de Logo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Espacios de Protección</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Mantén un espacio libre alrededor del logo</li>
                  <li>• Mínimo equivalente a la altura de la letra más pequeña</li>
                  <li>• No coloques otros elementos en esta área</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Tamaños Mínimos</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Digital: Mínimo 32px de altura</li>
                  <li>• Impreso: Mínimo 10mm de altura</li>
                  <li>• Favicon: 16x16px</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { LogosAdvanced };