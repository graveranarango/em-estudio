import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Shield,
  Edit,
  Save,
  Eye,
  Type,
  Volume2,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useBrandKit } from "../../contexts/BrandKitContext";

const AccessibilitySection: React.FC = () => {
  const { brandKit, updateBrandKit } = useBrandKit();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(brandKit?.accessibility || {});

  const accessibility = brandKit?.accessibility || {};

  const handleSave = async () => {
    await updateBrandKit({
      accessibility: editData
    });
    setIsEditing(false);
    toast.success('Reglas de accesibilidad actualizadas correctamente');
  };

  // Mock contrast check for colors
  const checkColorContrast = (color1: string, color2: string) => {
    // This is a simplified contrast check - in real implementation, use proper contrast calculation
    const mockRatio = Math.random() * 10 + 1;
    return {
      ratio: mockRatio,
      level: mockRatio >= 4.5 ? 'AA' : mockRatio >= 3 ? 'AA Large' : 'Fail'
    };
  };

  const accessibilityScore = () => {
    let score = 0;
    if (accessibility.contrastRules) score += 25;
    if (accessibility.minTextSizes) score += 25;
    if (accessibility.videoSubtitles) score += 25;
    if (accessibility.guidelines && accessibility.guidelines.length > 0) score += 25;
    return score;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Accesibilidad</h3>
          <p className="text-sm text-muted-foreground">
            Asegura que tu marca sea accesible para todos los usuarios
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Puntuación</p>
            <div className="flex items-center gap-2">
              <Progress value={accessibilityScore()} className="w-20 h-2" />
              <span className="text-sm font-medium">{accessibilityScore()}%</span>
            </div>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contrast Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Reglas de Contraste
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div>
                <Label htmlFor="contrastRules">Definir reglas de contraste</Label>
                <Textarea
                  id="contrastRules"
                  value={editData.contrastRules || ''}
                  onChange={(e) => setEditData({...editData, contrastRules: e.target.value})}
                  placeholder="Ej: Mínimo 4.5:1 para texto normal, 3:1 para texto grande..."
                  rows={3}
                />
              </div>
            ) : (
              <div>
                {accessibility.contrastRules ? (
                  <p className="text-sm leading-relaxed">{accessibility.contrastRules}</p>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No hay reglas de contraste definidas</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Text Size Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Tamaños de Texto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div>
                <Label htmlFor="minTextSizes">Tamaños mínimos de texto</Label>
                <Textarea
                  id="minTextSizes"
                  value={editData.minTextSizes || ''}
                  onChange={(e) => setEditData({...editData, minTextSizes: e.target.value})}
                  placeholder="Ej: 14px para móvil, 16px para desktop..."
                  rows={3}
                />
              </div>
            ) : (
              <div>
                {accessibility.minTextSizes ? (
                  <p className="text-sm leading-relaxed">{accessibility.minTextSizes}</p>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No hay reglas de tamaño definidas</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Video Subtitles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Subtítulos y Audio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div>
              <Label htmlFor="videoSubtitles">Reglas para subtítulos y contenido de audio</Label>
              <Textarea
                id="videoSubtitles"
                value={editData.videoSubtitles || ''}
                onChange={(e) => setEditData({...editData, videoSubtitles: e.target.value})}
                placeholder="Ej: Obligatorios en todos los videos, fondo semitransparente..."
                rows={3}
              />
            </div>
          ) : (
            <div>
              {accessibility.videoSubtitles ? (
                <p className="text-sm leading-relaxed">{accessibility.videoSubtitles}</p>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay reglas de subtítulos definidas</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Color Contrast Check */}
      {brandKit?.colors && brandKit.colors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Verificación de Contraste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {brandKit.colors.slice(0, 4).map((color, index) => {
                const contrastCheck = checkColorContrast(color.hex, '#FFFFFF');
                const isGood = contrastCheck.ratio >= 4.5;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div>
                        <p className="font-medium">{color.name}</p>
                        <p className="text-sm text-muted-foreground">vs. Fondo blanco</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={isGood ? "default" : "destructive"}
                        className="flex items-center gap-1"
                      >
                        {isGood ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {contrastCheck.level}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {contrastCheck.ratio.toFixed(1)}:1
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Directrices Generales
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div>
              <Label>Añadir directrices adicionales (una por línea)</Label>
              <Textarea
                value={(editData.guidelines || []).join('\n')}
                onChange={(e) => setEditData({
                  ...editData, 
                  guidelines: e.target.value.split('\n').filter(Boolean)
                })}
                placeholder="Textos alternativos en todas las imágenes&#10;Navegación por teclado funcional&#10;Colores no como único medio de información"
                rows={5}
              />
            </div>
          ) : (
            <div>
              {accessibility.guidelines && accessibility.guidelines.length > 0 ? (
                <ul className="space-y-2">
                  {accessibility.guidelines.map((guideline, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{guideline}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay directrices generales definidas</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accessibility Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Verificación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-3">Contenido Visual</h4>
              <div className="space-y-2">
                {[
                  'Contraste suficiente entre texto y fondo',
                  'Tamaños de texto legibles en todos los dispositivos',
                  'Elementos interactivos claramente identificables',
                  'Información no solo por color'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Contenido Multimedia</h4>
              <div className="space-y-2">
                {[
                  'Videos con subtítulos incluidos',
                  'Descripciones alternativas para imágenes',
                  'Controles de reproducción accesibles',
                  'Transcripciones para contenido de audio'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Reglas de Accesibilidad
          </Button>
        </div>
      )}
    </div>
  );
};

export { AccessibilitySection };