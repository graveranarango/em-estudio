import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Edit2, Plus, X } from "lucide-react";

interface Typography {
  name: string;
  font: string;
  weight: string;
  size: string;
  usage: string;
}

interface TypographySectionProps {
  typography: Typography[];
  onTypographyChange: (typography: Typography[]) => void;
  isEditable?: boolean;
}

const fontWeights = [
  { value: "300", label: "Light (300)" },
  { value: "400", label: "Regular (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semibold (600)" },
  { value: "700", label: "Bold (700)" },
  { value: "800", label: "Extrabold (800)" }
];

const fontSizes = [
  "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px", "64px"
];

export function TypographySection({ typography, onTypographyChange, isEditable = true }: TypographySectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const updateTypography = (index: number, field: keyof Typography, value: string) => {
    const updatedTypography = [...typography];
    updatedTypography[index] = { ...updatedTypography[index], [field]: value };
    onTypographyChange(updatedTypography);
  };

  const addTypography = () => {
    const newTypography: Typography = {
      name: "Nuevo Estilo",
      font: "Inter",
      weight: "400",
      size: "16px",
      usage: "Describe el uso de esta tipografía"
    };
    onTypographyChange([...typography, newTypography]);
    setEditingIndex(typography.length);
  };

  const removeTypography = (index: number) => {
    const updatedTypography = typography.filter((_, i) => i !== index);
    onTypographyChange(updatedTypography);
    setEditingIndex(null);
  };

  const getPreviewStyle = (typo: Typography) => ({
    fontFamily: typo.font,
    fontWeight: typo.weight,
    fontSize: typo.size,
    lineHeight: '1.4'
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="mb-1">Tipografía</h3>
          <p className="text-sm text-muted-foreground">
            Estilos tipográficos de tu marca
          </p>
        </div>
        {isEditable && (
          <Button onClick={addTypography} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Estilo
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {typography.map((typo, index) => (
          <Card key={index} className="p-4 relative group">
            {isEditable && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
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
                  onClick={() => removeTypography(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}

            {editingIndex === index ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nombre</label>
                    <Input
                      value={typo.name}
                      onChange={(e) => updateTypography(index, 'name', e.target.value)}
                      placeholder="Nombre del estilo"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fuente</label>
                    <Input
                      value={typo.font}
                      onChange={(e) => updateTypography(index, 'font', e.target.value)}
                      placeholder="Inter, Arial, etc."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Peso</label>
                    <Select
                      value={typo.weight}
                      onValueChange={(value) => updateTypography(index, 'weight', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontWeights.map((weight) => (
                          <SelectItem key={weight.value} value={weight.value}>
                            {weight.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tamaño</label>
                    <Select
                      value={typo.size}
                      onValueChange={(value) => updateTypography(index, 'size', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontSizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Uso</label>
                  <Input
                    value={typo.usage}
                    onChange={(e) => updateTypography(index, 'usage', e.target.value)}
                    placeholder="Describe cuándo usar este estilo"
                  />
                </div>
                
                <Button
                  size="sm"
                  onClick={() => setEditingIndex(null)}
                  className="w-full"
                >
                  Guardar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium mb-1">{typo.name}</h4>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{typo.font}</span>
                      <span>{fontWeights.find(w => w.value === typo.weight)?.label || typo.weight}</span>
                      <span>{typo.size}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{typo.usage}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
                  <div style={getPreviewStyle(typo)}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {typography.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay estilos tipográficos definidos aún.</p>
          <p className="text-sm">Sube un manual de marca para extraer automáticamente la tipografía.</p>
        </div>
      )}
    </Card>
  );
}