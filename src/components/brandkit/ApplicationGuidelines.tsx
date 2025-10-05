import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Edit,
  Save,
  Settings,
  Image,
  Video,
  Smartphone,
  Mic
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useBrandKit } from "../../contexts/BrandKitContext";

const ApplicationGuidelines: React.FC = () => {
  const { brandKit, updateBrandKit } = useBrandKit();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(brandKit?.applicationGuidelines || {});

  const guidelines = brandKit?.applicationGuidelines || {};

  const handleSave = async () => {
    await updateBrandKit({
      applicationGuidelines: editData
    });
    setIsEditing(false);
    toast.success('Guías de aplicación actualizadas correctamente');
  };

  const modules = [
    {
      id: 'posts',
      title: 'Posts / Carousels',
      icon: Image,
      description: 'Guías para contenido de redes sociales'
    },
    {
      id: 'stories',
      title: 'Stories',
      icon: Smartphone,
      description: 'Directrices para contenido vertical'
    },
    {
      id: 'videos',
      title: 'Videos',
      icon: Video,
      description: 'Reglas para contenido audiovisual'
    },
    {
      id: 'podcasts',
      title: 'Podcasts',
      icon: Mic,
      description: 'Guidelines para contenido de audio'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Guías de Aplicación</h3>
          <p className="text-sm text-muted-foreground">
            Define cómo aplicar tu BrandKit en cada tipo de contenido
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

      {/* Module Guidelines */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <TabsTrigger key={module.id} value={module.id} className="flex items-center gap-2">
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{module.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {modules.map((module) => {
          const IconComponent = module.icon;
          const content = guidelines[module.id as keyof typeof guidelines];
          
          return (
            <TabsContent key={module.id} value={module.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5" />
                    Guías para {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <Label htmlFor={`guidelines-${module.id}`}>
                        {module.description}
                      </Label>
                      <Textarea
                        id={`guidelines-${module.id}`}
                        value={editData[module.id as keyof typeof editData] || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          [module.id]: e.target.value
                        })}
                        placeholder={`Define las reglas específicas para ${module.title.toLowerCase()}...`}
                        rows={6}
                      />
                    </div>
                  ) : (
                    <div>
                      {content ? (
                        <div className="space-y-4">
                          <p className="text-sm leading-relaxed">{content}</p>
                          
                          {/* Example preview based on module type */}
                          <div className="p-4 rounded-lg bg-muted/50">
                            <h4 className="font-medium mb-2">Ejemplo de aplicación:</h4>
                            <div className="text-xs text-muted-foreground">
                              {module.id === 'posts' && "✓ Logo en esquina inferior derecha"}
                              {module.id === 'stories' && "✓ Formato vertical 9:16, texto legible"}
                              {module.id === 'videos' && "✓ Intro de marca, subtítulos habilitados"}
                              {module.id === 'podcasts' && "✓ Intro musical, mención de marca"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <IconComponent className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No hay guías definidas para {module.title}</p>
                          <p className="text-xs mt-1">Define las reglas específicas para este tipo de contenido</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* General Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Directrices Generales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Aplicación de Colores</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Usa colores primarios para elementos principales</li>
                <li>• Colores secundarios para elementos de apoyo</li>
                <li>• Mantén contraste suficiente para legibilidad</li>
                <li>• Respeta las proporciones de la paleta</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Aplicación de Tipografías</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Usa tipografía principal para títulos</li>
                <li>• Tipografía secundaria para subtítulos</li>
                <li>• Mantén jerarquía visual clara</li>
                <li>• Respeta tamaños mínimos legibles</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Uso de Logos</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Respeta espacios de protección</li>
                <li>• No modifiques proporciones</li>
                <li>• Usa versión apropiada según fondo</li>
                <li>• Mantén tamaño mínimo visible</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Consistencia</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Aplica el mismo estilo en todos los formatos</li>
                <li>• Mantén tono de voz consistente</li>
                <li>• Usa elementos gráficos coherentes</li>
                <li>• Revisa antes de publicar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Todas las Guías
          </Button>
        </div>
      )}
    </div>
  );
};

export { ApplicationGuidelines };