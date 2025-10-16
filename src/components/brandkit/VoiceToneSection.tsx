import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Edit2, Plus, X, MessageCircle } from "lucide-react";

interface VoiceTone {
  personality: string;
  tone: string;
  language: string;
  examples: string[];
}

interface VoiceToneSectionProps {
  voiceTone: VoiceTone;
  onVoiceToneChange: (voiceTone: VoiceTone) => void;
  isEditable?: boolean;
}

export function VoiceToneSection({ voiceTone, onVoiceToneChange, isEditable = true }: VoiceToneSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingExampleIndex, setEditingExampleIndex] = useState<number | null>(null);

  const updateVoiceTone = (field: keyof VoiceTone, value: string | string[]) => {
    onVoiceToneChange({ ...voiceTone, [field]: value });
  };

  const addExample = () => {
    const newExamples = [...voiceTone.examples, "Nuevo ejemplo de comunicación"];
    updateVoiceTone('examples', newExamples);
    setEditingExampleIndex(newExamples.length - 1);
  };

  const updateExample = (index: number, value: string) => {
    const updatedExamples = [...voiceTone.examples];
    updatedExamples[index] = value;
    updateVoiceTone('examples', updatedExamples);
  };

  const removeExample = (index: number) => {
    const updatedExamples = voiceTone.examples.filter((_, i) => i !== index);
    updateVoiceTone('examples', updatedExamples);
    setEditingExampleIndex(null);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="mb-1">Tono de Voz</h3>
          <p className="text-sm text-muted-foreground">
            Personalidad y estilo de comunicación de tu marca
          </p>
        </div>
        {isEditable && (
          <Button 
            onClick={() => setIsEditing(!isEditing)} 
            size="sm" 
            variant="outline"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            {isEditing ? 'Guardar' : 'Editar'}
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Características principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h4 className="font-medium mb-2 text-sm text-muted-foreground">PERSONALIDAD</h4>
            {isEditing ? (
              <Input
                value={voiceTone.personality}
                onChange={(e) => updateVoiceTone('personality', e.target.value)}
                placeholder="Ej: Profesional pero cercano"
              />
            ) : (
              <p className="font-medium">{voiceTone.personality}</p>
            )}
          </Card>

          <Card className="p-4">
            <h4 className="font-medium mb-2 text-sm text-muted-foreground">TONO</h4>
            {isEditing ? (
              <Input
                value={voiceTone.tone}
                onChange={(e) => updateVoiceTone('tone', e.target.value)}
                placeholder="Ej: Conversacional y empático"
              />
            ) : (
              <p className="font-medium">{voiceTone.tone}</p>
            )}
          </Card>

          <Card className="p-4">
            <h4 className="font-medium mb-2 text-sm text-muted-foreground">LENGUAJE</h4>
            {isEditing ? (
              <Input
                value={voiceTone.language}
                onChange={(e) => updateVoiceTone('language', e.target.value)}
                placeholder="Ej: Claro y directo"
              />
            ) : (
              <p className="font-medium">{voiceTone.language}</p>
            )}
          </Card>
        </div>

        {/* Ejemplos de comunicación */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Ejemplos de Comunicación</h4>
            {isEditable && (
              <Button onClick={addExample} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Ejemplo
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {voiceTone.examples.map((example, index) => (
              <Card key={index} className="p-4 relative group">
                {isEditable && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeExample(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    {editingExampleIndex === index ? (
                      <div className="space-y-2">
                        <Textarea
                          value={example}
                          onChange={(e) => updateExample(index, e.target.value)}
                          rows={2}
                          placeholder="Escribe un ejemplo de comunicación"
                        />
                        <Button
                          size="sm"
                          onClick={() => setEditingExampleIndex(null)}
                        >
                          Guardar
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={`${isEditable ? 'cursor-pointer hover:bg-muted/50 rounded p-2 -m-2' : ''}`}
                        onClick={() => isEditable && setEditingExampleIndex(index)}
                      >
                        <p className="text-sm leading-relaxed">{example}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {voiceTone.examples.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p>No hay ejemplos de comunicación definidos aún.</p>
              <p className="text-sm">Agrega ejemplos para definir el tono de voz de tu marca.</p>
            </div>
          )}
        </div>

        {/* Guías rápidas */}
        <Card className="p-4 bg-blue-50/50">
          <h4 className="font-medium mb-3">Guías de Aplicación</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-green-700 mb-2">✓ SÍ hacer:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Usar el tono definido consistentemente</li>
                <li>• Adaptar el mensaje al canal específico</li>
                <li>• Mantener la personalidad de marca</li>
                <li>• Ser auténtico y coherente</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-red-700 mb-2">✗ NO hacer:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Cambiar el tono según el humor</li>
                <li>• Usar jerga técnica innecesaria</li>
                <li>• Ser inconsistente entre canales</li>
                <li>• Imitar otras marcas</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  );
}