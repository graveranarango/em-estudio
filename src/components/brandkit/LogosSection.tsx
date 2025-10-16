import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Edit2, Plus, X, Download, Upload } from "lucide-react";

interface Logo {
  name: string;
  type: string;
  format: string;
  description: string;
  url?: string;
}

interface LogosSectionProps {
  logos: Logo[];
  onLogosChange: (logos: Logo[]) => void;
  isEditable?: boolean;
}

export function LogosSection({ logos, onLogosChange, isEditable = true }: LogosSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const updateLogo = (index: number, field: keyof Logo, value: string) => {
    const updatedLogos = [...logos];
    updatedLogos[index] = { ...updatedLogos[index], [field]: value };
    onLogosChange(updatedLogos);
  };

  const addLogo = () => {
    const newLogo: Logo = {
      name: "Nuevo Logo",
      type: "positivo",
      format: "SVG",
      description: "Describe el uso de este logo"
    };
    onLogosChange([...logos, newLogo]);
    setEditingIndex(logos.length);
  };

  const removeLogo = (index: number) => {
    const updatedLogos = logos.filter((_, i) => i !== index);
    onLogosChange(updatedLogos);
    setEditingIndex(null);
  };

  const handleFileUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // En una implementación real, aquí subirías el archivo al storage
      const mockUrl = URL.createObjectURL(file);
      updateLogo(index, 'url', mockUrl);
    }
  };

  const getLogoTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'positivo': return 'bg-blue-100 text-blue-800';
      case 'negativo': return 'bg-gray-100 text-gray-800';
      case 'símbolo': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="mb-1">Logos y Marca</h3>
          <p className="text-sm text-muted-foreground">
            Versiones oficiales de tu logo
          </p>
        </div>
        {isEditable && (
          <Button onClick={addLogo} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Logo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {logos.map((logo, index) => (
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
                  onClick={() => removeLogo(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {/* Logo Preview */}
              <div className="h-32 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center relative overflow-hidden">
                {logo.url ? (
                  <img 
                    src={logo.url} 
                    alt={logo.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl">🖼️</span>
                    </div>
                    <p className="text-sm">Logo Preview</p>
                  </div>
                )}
                
                {!editingIndex && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Logo Info */}
              {editingIndex === index ? (
                <div className="space-y-3">
                  <Input
                    value={logo.name}
                    onChange={(e) => updateLogo(index, 'name', e.target.value)}
                    placeholder="Nombre del logo"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={logo.type}
                      onChange={(e) => updateLogo(index, 'type', e.target.value)}
                      placeholder="Tipo (positivo, negativo, etc.)"
                    />
                    <Input
                      value={logo.format}
                      onChange={(e) => updateLogo(index, 'format', e.target.value)}
                      placeholder="Formato (SVG, PNG, etc.)"
                    />
                  </div>
                  
                  <Textarea
                    value={logo.description}
                    onChange={(e) => updateLogo(index, 'description', e.target.value)}
                    placeholder="Descripción y uso del logo"
                    rows={2}
                  />
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subir archivo</label>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <label htmlFor={`logo-upload-${index}`} className="cursor-pointer">
                          <Upload className="w-3 h-3 mr-2" />
                          Seleccionar archivo
                        </label>
                      </Button>
                      <input
                        id={`logo-upload-${index}`}
                        type="file"
                        accept=".svg,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload(index, e)}
                        className="hidden"
                      />
                    </div>
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
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{logo.name}</h4>
                    <div className="flex gap-1">
                      <Badge className={getLogoTypeColor(logo.type)}>
                        {logo.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {logo.format}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {logo.description}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {logos.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay logos definidos aún.</p>
          <p className="text-sm">Sube un manual de marca para extraer automáticamente los logos.</p>
        </div>
      )}
    </Card>
  );
}