import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import {
  Plus,
  Copy,
  Edit,
  Trash2,
  CheckCircle,
  Palette,
  Eye,
  Download
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useBrandKit } from "../../contexts/BrandKitContext";

interface ColorData {
  name: string;
  hex: string;
  rgb?: string;
  cmyk?: string;
  usage: string;
  type: 'primary' | 'secondary' | 'accent' | 'neutral';
}

const ColorPaletteAdvanced: React.FC = () => {
  const { brandKit, updateBrandKit } = useBrandKit();
  const [editingColor, setEditingColor] = useState<ColorData | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newColor, setNewColor] = useState<ColorData>({
    name: '',
    hex: '#000000',
    rgb: '',
    cmyk: '',
    usage: '',
    type: 'primary'
  });

  const colors = brandKit?.colors || [];

  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgb(${r}, ${g}, ${b})`;
    }
    return '';
  };

  const hexToCmyk = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;

      const k = 1 - Math.max(r, Math.max(g, b));
      const c = (1 - r - k) / (1 - k) || 0;
      const m = (1 - g - k) / (1 - k) || 0;
      const y = (1 - b - k) / (1 - k) || 0;

      return `cmyk(${Math.round(c * 100)}, ${Math.round(m * 100)}, ${Math.round(y * 100)}, ${Math.round(k * 100)})`;
    }
    return '';
  };

  const handleColorChange = (hex: string, colorData: Partial<ColorData>) => {
    const updatedColor = {
      ...colorData,
      hex,
      rgb: colorData.rgb || hexToRgb(hex),
      cmyk: colorData.cmyk || hexToCmyk(hex)
    } as ColorData;

    if (editingColor) {
      setEditingColor(updatedColor);
    } else {
      setNewColor(updatedColor);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copiado al portapapeles`);
    } catch (err) {
      toast.error('Error al copiar');
    }
  };

  const handleAddColor = async () => {
    if (!newColor.name || !newColor.hex) {
      toast.error('Nombre y color son requeridos');
      return;
    }

    const updatedColors = [...colors, {
      ...newColor,
      rgb: newColor.rgb || hexToRgb(newColor.hex),
      cmyk: newColor.cmyk || hexToCmyk(newColor.hex)
    }];

    await updateBrandKit({ colors: updatedColors });
    setNewColor({
      name: '',
      hex: '#000000',
      rgb: '',
      cmyk: '',
      usage: '',
      type: 'primary'
    });
    setShowAddDialog(false);
    toast.success('Color añadido correctamente');
  };

  const handleEditColor = async () => {
    if (!editingColor) return;

    const updatedColors = colors.map(color => 
      color.name === editingColor.name && color.hex === editingColor.hex 
        ? editingColor 
        : color
    );

    await updateBrandKit({ colors: updatedColors });
    setEditingColor(null);
    toast.success('Color actualizado correctamente');
  };

  const handleDeleteColor = async (colorToDelete: ColorData) => {
    const updatedColors = colors.filter(color => 
      !(color.name === colorToDelete.name && color.hex === colorToDelete.hex)
    );

    await updateBrandKit({ colors: updatedColors });
    toast.success('Color eliminado correctamente');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'secondary': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'accent': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'neutral': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const exportPalette = () => {
    const paletteData = {
      name: 'Brand Colors',
      colors: colors.map(color => ({
        name: color.name,
        hex: color.hex,
        rgb: color.rgb,
        cmyk: color.cmyk,
        type: color.type
      }))
    };

    const dataStr = JSON.stringify(paletteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brand-colors.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const ColorEditDialog = ({ color, isEdit = false }: { color: ColorData, isEdit?: boolean }) => (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Editar Color' : 'Añadir Nuevo Color'}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="colorName">Nombre del Color</Label>
          <Input
            id="colorName"
            value={color.name}
            onChange={(e) => handleColorChange(color.hex, { ...color, name: e.target.value })}
            placeholder="Ej: Azul Primario"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="colorHex">Color</Label>
            <div className="flex gap-2">
              <Input
                id="colorHex"
                type="color"
                value={color.hex}
                onChange={(e) => handleColorChange(e.target.value, color)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={color.hex}
                onChange={(e) => handleColorChange(e.target.value, color)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="colorType">Tipo</Label>
            <Select value={color.type} onValueChange={(value) => handleColorChange(color.hex, { ...color, type: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primario</SelectItem>
                <SelectItem value="secondary">Secundario</SelectItem>
                <SelectItem value="accent">Acento</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="colorRgb">RGB</Label>
            <Input
              id="colorRgb"
              value={color.rgb || hexToRgb(color.hex)}
              onChange={(e) => handleColorChange(color.hex, { ...color, rgb: e.target.value })}
              placeholder="rgb(0, 0, 0)"
            />
          </div>

          <div>
            <Label htmlFor="colorCmyk">CMYK</Label>
            <Input
              id="colorCmyk"
              value={color.cmyk || hexToCmyk(color.hex)}
              onChange={(e) => handleColorChange(color.hex, { ...color, cmyk: e.target.value })}
              placeholder="cmyk(0, 0, 0, 100)"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="colorUsage">Uso y Aplicación</Label>
          <Textarea
            id="colorUsage"
            value={color.usage}
            onChange={(e) => handleColorChange(color.hex, { ...color, usage: e.target.value })}
            placeholder="Describe cuándo y cómo usar este color..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => isEdit ? setEditingColor(null) : setShowAddDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={isEdit ? handleEditColor : handleAddColor}>
            {isEdit ? 'Actualizar' : 'Añadir'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Paleta de Colores</h3>
          <p className="text-sm text-muted-foreground">
            {colors.length} colores definidos en tu BrandKit
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportPalette} disabled={colors.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Color
              </Button>
            </DialogTrigger>
            <ColorEditDialog color={newColor} />
          </Dialog>
        </div>
      </div>

      {/* Colors Grid */}
      {colors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colors.map((color, index) => (
            <Card key={index} className="overflow-hidden">
              <div 
                className="h-24 relative group"
                style={{ backgroundColor: color.hex }}
              >
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => copyToClipboard(color.hex, 'HEX')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copiar HEX</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingColor(color)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    {editingColor && <ColorEditDialog color={editingColor} isEdit />}
                  </Dialog>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDeleteColor(color)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{color.name}</h4>
                  <Badge className={getTypeColor(color.type)}>
                    {color.type}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">HEX:</span>
                    <button
                      onClick={() => copyToClipboard(color.hex, 'HEX')}
                      className="font-mono hover:text-primary transition-colors"
                    >
                      {color.hex}
                    </button>
                  </div>
                  
                  {color.rgb && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">RGB:</span>
                      <button
                        onClick={() => copyToClipboard(color.rgb!, 'RGB')}
                        className="font-mono hover:text-primary transition-colors text-right"
                      >
                        {color.rgb}
                      </button>
                    </div>
                  )}
                  
                  {color.cmyk && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">CMYK:</span>
                      <button
                        onClick={() => copyToClipboard(color.cmyk!, 'CMYK')}
                        className="font-mono hover:text-primary transition-colors text-right text-xs"
                      >
                        {color.cmyk}
                      </button>
                    </div>
                  )}
                </div>
                
                {color.usage && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">{color.usage}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay colores definidos</h3>
            <p className="text-muted-foreground mb-4">
              Añade colores a tu paleta para mantener consistencia en todos tus contenidos.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir Primer Color
            </Button>
          </div>
        </Card>
      )}

      {/* Usage Guidelines */}
      {colors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Guías de Uso de Color
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Jerarquía de Colores</h4>
                <div className="space-y-2">
                  {['primary', 'secondary', 'accent', 'neutral'].map(type => {
                    const typeColors = colors.filter(c => c.type === type);
                    if (typeColors.length === 0) return null;
                    
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {typeColors.slice(0, 3).map((color, idx) => (
                            <div
                              key={idx}
                              className="w-4 h-4 rounded-sm border"
                              style={{ backgroundColor: color.hex }}
                            />
                          ))}
                        </div>
                        <span className="text-sm capitalize">{type}</span>
                        <span className="text-xs text-muted-foreground">
                          ({typeColors.length} colores)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Consejos de Aplicación</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Usa colores primarios para elementos principales y CTAs</li>
                  <li>• Colores secundarios para elementos de apoyo</li>
                  <li>• Colores de acento para destacar información importante</li>
                  <li>• Colores neutrales para textos y fondos</li>
                  <li>• Mantén suficiente contraste para accesibilidad</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { ColorPaletteAdvanced };