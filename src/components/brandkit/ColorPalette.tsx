import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Edit2, Plus, X, Copy, Check } from "lucide-react";

interface Color {
  name: string;
  hex: string;
  usage: string;
}

interface ColorPaletteProps {
  colors: Color[];
  onColorsChange: (colors: Color[]) => void;
  isEditable?: boolean;
}

export function ColorPalette({ colors, onColorsChange, isEditable = true }: ColorPaletteProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const updateColor = (index: number, field: keyof Color, value: string) => {
    const updatedColors = [...colors];
    updatedColors[index] = { ...updatedColors[index], [field]: value };
    onColorsChange(updatedColors);
  };

  const addColor = () => {
    const newColor: Color = {
      name: "Nuevo Color",
      hex: "#000000",
      usage: "Describe el uso de este color"
    };
    onColorsChange([...colors, newColor]);
    setEditingIndex(colors.length);
  };

  const removeColor = (index: number) => {
    const updatedColors = colors.filter((_, i) => i !== index);
    onColorsChange(updatedColors);
    setEditingIndex(null);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="mb-1">Paleta de Colores</h3>
          <p className="text-sm text-muted-foreground">
            Colores oficiales de tu marca extraídos automáticamente
          </p>
        </div>
        {isEditable && (
          <Button onClick={addColor} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Color
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colors.map((color, index) => (
          <Card key={index} className="p-4 relative group">
            {isEditable && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeColor(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {/* Color Preview */}
              <div 
                className="h-20 rounded-lg border-2 border-border relative overflow-hidden"
                style={{ backgroundColor: color.hex }}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(color.hex)}
                >
                  {copiedColor === color.hex ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>

              {/* Color Info */}
              {editingIndex === index ? (
                <div className="space-y-2">
                  <Input
                    value={color.name}
                    onChange={(e) => updateColor(index, 'name', e.target.value)}
                    placeholder="Nombre del color"
                  />
                  <Input
                    value={color.hex}
                    onChange={(e) => updateColor(index, 'hex', e.target.value)}
                    placeholder="#000000"
                  />
                  <Textarea
                    value={color.usage}
                    onChange={(e) => updateColor(index, 'usage', e.target.value)}
                    placeholder="Uso del color"
                    rows={2}
                  />
                  <Button
                    size="sm"
                    onClick={() => setEditingIndex(null)}
                    className="w-full"
                  >
                    Guardar
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{color.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {color.hex}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {color.usage}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {colors.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay colores definidos aún.</p>
          <p className="text-sm">Sube un manual de marca para extraer automáticamente los colores.</p>
        </div>
      )}
    </Card>
  );
}