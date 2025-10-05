import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  Plus,
  Edit,
  MessageCircle,
  Quote,
  Save
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useBrandKit } from "../../contexts/BrandKitContext";

const VoiceToneAdvanced: React.FC = () => {
  const { brandKit, updateBrandKit } = useBrandKit();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(brandKit?.voiceTone || {});

  const handleSave = async () => {
    await updateBrandKit({
      voiceTone: editData
    });
    setIsEditing(false);
    toast.success('Tono de voz actualizado correctamente');
  };

  const voiceTone = brandKit?.voiceTone;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tono de Voz</h3>
          <p className="text-sm text-muted-foreground">
            Define la personalidad y el estilo de comunicación de tu marca
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

      {/* Voice Tone Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Características Principales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="personality">Personalidad</Label>
                  <Textarea
                    id="personality"
                    value={editData.personality || ''}
                    onChange={(e) => setEditData({...editData, personality: e.target.value})}
                    placeholder="Ej: Profesional y accesible, con un toque humano..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tone">Tono</Label>
                  <Textarea
                    id="tone"
                    value={editData.tone || ''}
                    onChange={(e) => setEditData({...editData, tone: e.target.value})}
                    placeholder="Ej: Amigable pero experto, confiable y empático..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="language">Lenguaje</Label>
                  <Textarea
                    id="language"
                    value={editData.language || ''}
                    onChange={(e) => setEditData({...editData, language: e.target.value})}
                    placeholder="Ej: Español neutral, claro y directo..."
                    rows={2}
                  />
                </div>
                
                <Button onClick={handleSave} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </>
            ) : (
              <>
                <div>
                  <h4 className="font-medium mb-2">Personalidad</h4>
                  <p className="text-sm text-muted-foreground">
                    {voiceTone?.personality || 'No definida'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Tono</h4>
                  <p className="text-sm text-muted-foreground">
                    {voiceTone?.tone || 'No definido'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Lenguaje</h4>
                  <p className="text-sm text-muted-foreground">
                    {voiceTone?.language || 'No definido'}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Quote className="w-5 h-5" />
              Ejemplos de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            {voiceTone?.examples && voiceTone.examples.length > 0 ? (
              <div className="space-y-4">
                {voiceTone.examples.map((example, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium text-sm mb-2">{example.context}</h4>
                    <p className="text-sm italic">"{example.example}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Quote className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay ejemplos definidos</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Ejemplo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Voice Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Guías de Aplicación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-600">✅ Sí Hacer</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Mantén un tono consistente en todas las comunicaciones</li>
                <li>• Usa un lenguaje claro y accesible</li>
                <li>• Muestra empatía hacia tu audiencia</li>
                <li>• Sé auténtico y transparente</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-red-600">❌ No Hacer</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• No uses jerga técnica innecesaria</li>
                <li>• Evita ser demasiado formal o frío</li>
                <li>• No hagas promesas que no puedas cumplir</li>
                <li>• No ignores el contexto de la conversación</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { VoiceToneAdvanced };