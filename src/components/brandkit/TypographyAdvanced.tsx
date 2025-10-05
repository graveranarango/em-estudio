import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Type,
  Download
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useBrandKit } from "../../contexts/BrandKitContext";

const TypographyAdvanced: React.FC = () => {
  const { brandKit, updateBrandKit } = useBrandKit();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingFont, setEditingFont] = useState<any>(null);

  const typography = brandKit?.typography || [];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'secondary': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'heading': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'body': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tipografías</h3>
          <p className="text-sm text-muted-foreground">
            {typography.length} estilos tipográficos definidos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={typography.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Añadir Tipografía
          </Button>
        </div>
      </div>

      {/* Typography Grid */}
      {typography.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {typography.map((font, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">{font.name}</h4>
                    <Badge className={getTypeColor(font.type || 'body')}>
                      {font.type || 'body'}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div 
                  className="text-2xl mb-2"
                  style={{ 
                    fontFamily: font.font, 
                    fontWeight: font.weight 
                  }}
                >
                  {font.font}
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Familia:</strong> {font.font}</p>
                  <p><strong>Peso:</strong> {font.weight}</p>
                  {font.size && <p><strong>Tamaño:</strong> {font.size}</p>}
                  {font.lineHeight && <p><strong>Altura de línea:</strong> {font.lineHeight}</p>}
                  {font.usage && <p><strong>Uso:</strong> {font.usage}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <Type className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay tipografías definidas</h3>
            <p className="text-muted-foreground mb-4">
              Define estilos tipográficos para mantener consistencia en tus contenidos.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir Primera Tipografía
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export { TypographyAdvanced };