import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Edit,
  Save,
  Book,
  Target,
  Eye,
  Heart,
  Clock
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useBrandKit } from "../../contexts/BrandKitContext";

const StorytellingSection: React.FC = () => {
  const { brandKit, updateBrandKit } = useBrandKit();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(brandKit?.storytelling || {});

  const storytelling = brandKit?.storytelling || {};

  const handleSave = async () => {
    await updateBrandKit({
      storytelling: editData
    });
    setIsEditing(false);
    toast.success('Historia de marca actualizada correctamente');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Historia de Marca</h3>
          <p className="text-sm text-muted-foreground">
            Define la narrativa y los valores fundamentales de tu marca
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Misión
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div>
                <Label htmlFor="mission">¿Cuál es el propósito de tu marca?</Label>
                <Textarea
                  id="mission"
                  value={editData.mission || ''}
                  onChange={(e) => setEditData({...editData, mission: e.target.value})}
                  placeholder="Describe el propósito y la razón de ser de tu marca..."
                  rows={4}
                />
              </div>
            ) : (
              <div>
                {storytelling.mission ? (
                  <p className="text-sm leading-relaxed">{storytelling.mission}</p>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Misión no definida</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vision */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Visión
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div>
                <Label htmlFor="vision">¿Hacia dónde se dirige tu marca?</Label>
                <Textarea
                  id="vision"
                  value={editData.vision || ''}
                  onChange={(e) => setEditData({...editData, vision: e.target.value})}
                  placeholder="Describe la visión de futuro de tu marca..."
                  rows={4}
                />
              </div>
            ) : (
              <div>
                {storytelling.vision ? (
                  <p className="text-sm leading-relaxed">{storytelling.vision}</p>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Visión no definida</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Values */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Valores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {storytelling.values && storytelling.values.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {storytelling.values.map((value, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/50 text-center">
                  <div className="w-8 h-8 bg-primary/10 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No hay valores definidos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Brand History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Historia de la Marca
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div>
              <Label htmlFor="brandHistory">¿Cómo nació tu marca?</Label>
              <Textarea
                id="brandHistory"
                value={editData.brandHistory || ''}
                onChange={(e) => setEditData({...editData, brandHistory: e.target.value})}
                placeholder="Cuenta la historia de cómo nació tu marca, los retos que resuelve y su evolución..."
                rows={5}
              />
            </div>
          ) : (
            <div>
              {storytelling.brandHistory ? (
                <p className="text-sm leading-relaxed">{storytelling.brandHistory}</p>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Historia de marca no definida</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Todos los Cambios
          </Button>
        </div>
      )}
    </div>
  );
};

export { StorytellingSection };