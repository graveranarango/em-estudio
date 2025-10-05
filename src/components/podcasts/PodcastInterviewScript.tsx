import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  RotateCcw, 
  Copy, 
  Edit3,
  Trash2,
  TriangleAlert,
  FileText
} from "lucide-react";

interface Question {
  id: string;
  text: string;
}

interface ScriptBlock {
  id: string;
  title: string;
  objective: string;
  questions: Question[];
}

export function PodcastInterviewScript() {
  const [scriptBlocks, setScriptBlocks] = useState<ScriptBlock[]>([
    {
      id: 'block-1',
      title: 'Bloque 1 — Introducción / Romper el hielo',
      objective: 'Presentar al invitado y establecer confianza.',
      questions: [
        { id: 'q1-1', text: 'Cuéntanos brevemente quién eres y a qué te dedicas.' },
        { id: 'q1-2', text: '¿Qué te motivó a involucrarte en la logística internacional?' }
      ]
    },
    {
      id: 'block-2',
      title: 'Bloque 2 — Desarrollo / Experiencia',
      objective: 'Profundizar en la experiencia y aprendizajes del invitado.',
      questions: [
        { id: 'q2-1', text: '¿Cuál ha sido tu mayor reto en el mundo de la logística?' },
        { id: 'q2-2', text: '¿Qué consejo le darías a alguien que recién empieza en este sector?' }
      ]
    },
    {
      id: 'block-3',
      title: 'Bloque 3 — Cierre / CTA',
      objective: 'Cerrar con mensaje inspirador y CTA.',
      questions: [
        { id: 'q3-1', text: '¿Dónde pueden encontrarte o contactarte?' },
        { id: 'q3-2', text: '¿Qué mensaje final quieres dejarle a la audiencia?' }
      ]
    }
  ]);

  const [editingQuestion, setEditingQuestion] = useState<{ blockId: string; questionId: string } | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');

  const updateBlockObjective = (blockId: string, objective: string) => {
    setScriptBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, objective } : block
    ));
  };

  const addQuestion = (blockId: string) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: 'Nueva pregunta...'
    };
    
    setScriptBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, questions: [...block.questions, newQuestion] }
        : block
    ));
    
    // Iniciar edición de la nueva pregunta
    setEditingQuestion({ blockId, questionId: newQuestion.id });
    setNewQuestionText('Nueva pregunta...');
  };

  const updateQuestion = (blockId: string, questionId: string, text: string) => {
    setScriptBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? {
            ...block,
            questions: block.questions.map(q => 
              q.id === questionId ? { ...q, text } : q
            )
          }
        : block
    ));
  };

  const deleteQuestion = (blockId: string, questionId: string) => {
    setScriptBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, questions: block.questions.filter(q => q.id !== questionId) }
        : block
    ));
  };

  const duplicateBlock = (blockId: string) => {
    const blockToDuplicate = scriptBlocks.find(b => b.id === blockId);
    if (!blockToDuplicate) return;
    
    const duplicatedBlock: ScriptBlock = {
      id: `block-${Date.now()}`,
      title: `${blockToDuplicate.title} (Copia)`,
      objective: blockToDuplicate.objective,
      questions: blockToDuplicate.questions.map(q => ({
        id: `q-${Date.now()}-${Math.random()}`,
        text: q.text
      }))
    };
    
    setScriptBlocks(prev => [...prev, duplicatedBlock]);
  };

  const regenerateQuestions = (blockId: string) => {
    // Simular regeneración de IA
    const sampleQuestions = [
      '¿Podrías compartir una experiencia transformadora?',
      '¿Cómo ha evolucionado tu perspectiva?',
      '¿Qué tendencias ves en el futuro?',
      '¿Cuál es tu mayor aprendizaje?'
    ];
    
    const newQuestions: Question[] = [
      { id: `q-${Date.now()}-1`, text: sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)] },
      { id: `q-${Date.now()}-2`, text: sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)] }
    ];
    
    setScriptBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, questions: newQuestions } : block
    ));
  };

  const handleQuestionEdit = (blockId: string, questionId: string, currentText: string) => {
    setEditingQuestion({ blockId, questionId });
    setNewQuestionText(currentText);
  };

  const saveQuestionEdit = () => {
    if (editingQuestion) {
      updateQuestion(editingQuestion.blockId, editingQuestion.questionId, newQuestionText);
      setEditingQuestion(null);
      setNewQuestionText('');
    }
  };

  const cancelQuestionEdit = () => {
    setEditingQuestion(null);
    setNewQuestionText('');
  };

  const isFormValid = () => {
    return scriptBlocks.length >= 3 && 
           scriptBlocks.every(block => 
             block.objective.trim() !== '' && 
             block.questions.length > 0 &&
             block.questions.every(q => q.text.trim() !== '')
           );
  };

  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-medium">Guion de entrevista</h1>
            <Badge variant="secondary" className="text-xs">Paso 3 de 5</Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <Button 
              className="text-sm" 
              disabled={!isFormValid()}
            >
              Siguiente: Generación inicial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Script Blocks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scriptBlocks.map((block) => (
            <Card key={block.id} className="rounded-xl shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {block.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Objetivo del bloque */}
                <div>
                  <label className="text-xs font-medium mb-2 block">
                    Objetivo del bloque
                  </label>
                  <Textarea 
                    value={block.objective}
                    onChange={(e) => updateBlockObjective(block.id, e.target.value)}
                    className="min-h-[60px] text-sm border border-gray-300 rounded-lg resize-none"
                    placeholder="Describe el objetivo de este bloque..."
                  />
                </div>

                {/* Lista de preguntas */}
                <div>
                  <label className="text-xs font-medium mb-2 block">
                    Preguntas ({block.questions.length})
                  </label>
                  <div className="space-y-2">
                    {block.questions.map((question, index) => (
                      <div key={question.id} className="flex items-start gap-2 group">
                        <span className="text-xs text-muted-foreground mt-1 w-4 flex-shrink-0">
                          {index + 1}.
                        </span>
                        
                        {editingQuestion?.blockId === block.id && editingQuestion?.questionId === question.id ? (
                          <div className="flex-1 space-y-2">
                            <Textarea
                              value={newQuestionText}
                              onChange={(e) => setNewQuestionText(e.target.value)}
                              className="text-sm border border-blue-300 rounded-lg resize-none"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={saveQuestionEdit}>
                                Guardar
                              </Button>
                              <Button size="sm" variant="ghost" onClick={cancelQuestionEdit}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-start justify-between group">
                            <p 
                              className="text-sm text-foreground cursor-pointer hover:text-blue-600 transition-colors flex-1"
                              onClick={() => handleQuestionEdit(block.id, question.id, question.text)}
                            >
                              {question.text}
                            </p>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => handleQuestionEdit(block.id, question.id, question.text)}
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                onClick={() => deleteQuestion(block.id, question.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => addQuestion(block.id)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Agregar pregunta
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => regenerateQuestions(block.id)}
                    className="text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Regenerar IA
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => duplicateBlock(block.id)}
                    className="text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Duplicar bloque
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Validación */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <TriangleAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-800">
              <strong>Validación:</strong> el guion debe incluir al menos 3 bloques (inicio, desarrollo, cierre).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" className="text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <Button 
            className="text-sm" 
            disabled={!isFormValid()}
          >
            Siguiente: Generación inicial
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Debug info */}
        <Card className="bg-slate-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs text-slate-600">Estado del guion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-600 space-y-1">
              <p><strong>Bloques totales:</strong> {scriptBlocks.length}</p>
              <p><strong>Preguntas totales:</strong> {scriptBlocks.reduce((acc, block) => acc + block.questions.length, 0)}</p>
              <p><strong>Validación:</strong> {isFormValid() ? '✅ Válido' : '❌ Incompleto'}</p>
              <p><strong>Bloques válidos:</strong> {scriptBlocks.filter(block => 
                block.objective.trim() !== '' && 
                block.questions.length > 0 &&
                block.questions.every(q => q.text.trim() !== '')
              ).length}/{scriptBlocks.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}