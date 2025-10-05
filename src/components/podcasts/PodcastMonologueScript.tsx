import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { 
  ArrowLeft, 
  ArrowRight,
  FileText,
  Plus,
  RotateCcw,
  Copy,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Edit3
} from "lucide-react";

interface ScriptBlock {
  id: string;
  title: string;
  objective: string;
  aiText: string;
  isCompleted: boolean;
}

export function PodcastMonologueScript() {
  const [scriptBlocks, setScriptBlocks] = useState<ScriptBlock[]>([
    {
      id: 'block-1',
      title: 'Bloque 1 — Introducción',
      objective: 'Presentar el tema y conectar con la audiencia.',
      aiText: 'Hoy quiero hablarte sobre la importancia de mantener la motivación en el camino emprendedor.',
      isCompleted: true
    },
    {
      id: 'block-2',
      title: 'Bloque 2 — Desarrollo',
      objective: 'Profundizar en consejos prácticos y experiencias.',
      aiText: 'Uno de los mayores desafíos al emprender es superar la frustración inicial. Te compartiré tres claves para mantenerte firme.',
      isCompleted: true
    },
    {
      id: 'block-3',
      title: 'Bloque 3 — Conclusión',
      objective: 'Cerrar con mensaje inspirador y CTA.',
      aiText: 'Recuerda: el éxito no llega de la noche a la mañana, pero cada paso cuenta. ¡Suscríbete para más reflexiones!',
      isCompleted: true
    }
  ]);

  const updateBlockObjective = (blockId: string, objective: string) => {
    setScriptBlocks(prev => 
      prev.map(block => 
        block.id === blockId 
          ? { ...block, objective, isCompleted: objective.trim().length > 0 && block.aiText.trim().length > 0 }
          : block
      )
    );
  };

  const updateBlockText = (blockId: string, aiText: string) => {
    setScriptBlocks(prev => 
      prev.map(block => 
        block.id === blockId 
          ? { ...block, aiText, isCompleted: block.objective.trim().length > 0 && aiText.trim().length > 0 }
          : block
      )
    );
  };

  const addNewBlock = (afterId?: string) => {
    const newBlock: ScriptBlock = {
      id: `block-${Date.now()}`,
      title: `Bloque ${scriptBlocks.length + 1} — Nuevo bloque`,
      objective: '',
      aiText: '',
      isCompleted: false
    };

    if (afterId) {
      const index = scriptBlocks.findIndex(block => block.id === afterId);
      const newBlocks = [...scriptBlocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setScriptBlocks(newBlocks);
    } else {
      setScriptBlocks(prev => [...prev, newBlock]);
    }
  };

  const duplicateBlock = (blockId: string) => {
    const blockToDuplicate = scriptBlocks.find(block => block.id === blockId);
    if (!blockToDuplicate) return;

    const duplicatedBlock: ScriptBlock = {
      ...blockToDuplicate,
      id: `block-${Date.now()}`,
      title: `${blockToDuplicate.title} (Copia)`
    };

    const index = scriptBlocks.findIndex(block => block.id === blockId);
    const newBlocks = [...scriptBlocks];
    newBlocks.splice(index + 1, 0, duplicatedBlock);
    setScriptBlocks(newBlocks);
  };

  const regenerateAIText = (blockId: string) => {
    const sampleTexts = [
      'Aquí exploraremos los aspectos fundamentales que todo profesional debe conocer.',
      'Esta reflexión me surge de años de experiencia trabajando en este campo.',
      'Lo que realmente marca la diferencia es entender este concepto clave.',
      'Permíteme compartir contigo una perspectiva que cambió mi forma de pensar.',
      'Al final del día, lo importante es mantener esta mentalidad constante.'
    ];
    
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    updateBlockText(blockId, randomText);
  };

  const deleteBlock = (blockId: string) => {
    if (scriptBlocks.length <= 3) return; // Minimum 3 blocks required
    setScriptBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const completedBlocks = scriptBlocks.filter(block => block.isCompleted).length;
  const hasMinimumBlocks = scriptBlocks.length >= 3;
  const hasMinimumContent = completedBlocks >= 3;
  const canProceed = hasMinimumBlocks && hasMinimumContent;

  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-medium">Guión del Monólogo</h1>
              <p className="text-muted-foreground">Paso 3 de 5 - Estructura narrativa y contenido</p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              Paso 3 de 5
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <Button 
              variant="default"
              disabled={!canProceed}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90"
            >
              Siguiente: Generación inicial
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Bloques completados: {completedBlocks}/{scriptBlocks.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium">Total de bloques: {scriptBlocks.length}</span>
          </div>
          {canProceed && (
            <Badge className="bg-green-100 text-green-800">
              ✓ Listo para continuar
            </Badge>
          )}
        </div>

        {/* Script Blocks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scriptBlocks.map((block, index) => (
            <Card key={block.id} className={`rounded-xl shadow-sm transition-all ${
              block.isCompleted 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 hover:border-orange-200'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {block.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    )}
                    {block.title}
                  </CardTitle>
                  {scriptBlocks.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBlock(block.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Objetivo narrativo</label>
                  <Textarea
                    value={block.objective}
                    onChange={(e) => updateBlockObjective(block.id, e.target.value)}
                    placeholder="¿Qué quieres lograr con este bloque?"
                    className="min-h-[60px] resize-none rounded-lg border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Texto sugerido (IA)</label>
                  <Textarea
                    value={block.aiText}
                    onChange={(e) => updateBlockText(block.id, e.target.value)}
                    placeholder="El contenido de este bloque aparecerá aquí..."
                    className="min-h-[120px] resize-none rounded-lg border-gray-300"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addNewBlock(block.id)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Agregar bloque
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => regenerateAIText(block.id)}
                    className="text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Regenerar IA
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateBlock(block.id)}
                    className="text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Duplicar bloque
                  </Button>
                </div>

                {/* Character Count */}
                <div className="text-xs text-muted-foreground text-right">
                  {block.aiText.length} caracteres
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add New Block Button */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => addNewBlock()}
            className="border-dashed border-2 border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar nuevo bloque
          </Button>
        </div>

        {/* Script Summary */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resumen del guión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-orange-800 mb-1">Total de bloques:</p>
                <p className="text-orange-700">{scriptBlocks.length}</p>
              </div>
              <div>
                <p className="font-medium text-orange-800 mb-1">Palabras estimadas:</p>
                <p className="text-orange-700">
                  ~{scriptBlocks.reduce((acc, block) => acc + block.aiText.split(' ').length, 0)} palabras
                </p>
              </div>
              <div>
                <p className="font-medium text-orange-800 mb-1">Duración estimada:</p>
                <p className="text-orange-700">
                  ~{Math.round(scriptBlocks.reduce((acc, block) => acc + block.aiText.split(' ').length, 0) / 150)} minutos
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="font-medium text-orange-800 mb-2">Estructura actual:</p>
              <div className="flex flex-wrap gap-2">
                {scriptBlocks.map((block, index) => (
                  <Badge
                    key={block.id}
                    variant={block.isCompleted ? "default" : "secondary"}
                    className={`text-xs ${
                      block.isCompleted 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}. {block.title.split('—')[1]?.trim() || `Bloque ${index + 1}`}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Validation */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-800">
                <strong>Validación:</strong> el guión debe incluir al menos 3 bloques (inicio, desarrollo, cierre).
              </p>
              {!hasMinimumBlocks && (
                <p className="text-xs text-amber-700 mt-1">
                  ⚠️ Necesitas al menos 3 bloques para continuar.
                </p>
              )}
              {!hasMinimumContent && hasMinimumBlocks && (
                <p className="text-xs text-amber-700 mt-1">
                  ⚠️ Completa el contenido de al menos 3 bloques para continuar.
                </p>
              )}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <Button 
              variant="default"
              disabled={!canProceed}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90"
            >
              Siguiente: Generación inicial
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}