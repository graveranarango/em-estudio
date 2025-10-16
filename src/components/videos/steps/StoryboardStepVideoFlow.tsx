import React, { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { useBrandKit } from "../../../contexts/BrandKitContext";
import { useVideoProject } from "../../../contexts/VideoProjectContext";
import { VideoScene } from "../../../types/videos";

import { 
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Copy,
  Trash2,
  AlertTriangle,
  GripVertical,
  Play,
  Camera,
  Type,
  Users,
  Lightbulb
} from "lucide-react";

interface StoryboardStepVideoFlowProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

interface Scene {
  id: string;
  title: string;
  description: string;
  script: string;
  visualSuggestions: string[];
  order: number;
}

const INITIAL_SCENES: Scene[] = [
  {
    id: '1',
    title: 'Escena 1 — Introducción',
    description: 'Presentamos el problema: clientes buscan envíos rápidos y económicos.',
    script: '¿Cansado de esperar semanas para enviar tus paquetes?',
    visualSuggestions: [
      'Cliente en casa con paquete',
      'Pantalla móvil mostrando app de envíos'
    ],
    order: 1
  },
  {
    id: '2',
    title: 'Escena 2 — Desarrollo',
    description: 'Mostramos cómo funciona el servicio paso a paso.',
    script: 'Con nuestra app, envía en 3 simples pasos.',
    visualSuggestions: [
      'Animación de app móvil',
      'Cliente recibiendo confirmación'
    ],
    order: 2
  },
  {
    id: '3',
    title: 'Escena 3 — Conclusión',
    description: 'Cerramos con el beneficio clave y CTA.',
    script: 'Envíos rápidos, seguros y fáciles. ¡Descarga la app hoy mismo!',
    visualSuggestions: [
      'Logo de la empresa',
      'CTA en pantalla'
    ],
    order: 3
  }
];

export function StoryboardStepVideoFlow({ onNext, onPrevious }: StoryboardStepVideoFlowProps) {
  const { brandKit } = useBrandKit();
  const { currentProject, updateBriefing, setCurrentProject } = useVideoProject();
  
  const [scenes, setScenes] = useState<Scene[]>(INITIAL_SCENES);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);

  const updateScene = (sceneId: string, field: keyof Scene, value: string | string[]) => {
    setScenes(prev => prev.map(scene => 
      scene.id === sceneId 
        ? { ...scene, [field]: value }
        : scene
    ));
  };

  const regenerateScene = async (sceneId: string) => {
    setIsRegenerating(sceneId);
    
    // Simulate AI regeneration
    setTimeout(() => {
      const variations = [
        {
          description: 'Establecemos el contexto emocional del problema de envíos.',
          script: '¿Te has sentido frustrado esperando por tus envíos?',
          visualSuggestions: ['Persona mirando el reloj', 'Paquetes acumulándose']
        },
        {
          description: 'Mostramos los beneficios únicos de nuestro servicio.',
          script: 'Imagina recibir tus paquetes en tiempo récord.',
          visualSuggestions: ['Cronómetro en pantalla', 'Cliente sonriendo al recibir paquete']
        },
        {
          description: 'Presentamos testimonios y casos de éxito reales.',
          script: 'Miles de clientes ya confían en nosotros para sus envíos.',
          visualSuggestions: ['Testimonios en pantalla', 'Estadísticas de satisfacción']
        }
      ];

      const randomVariation = variations[Math.floor(Math.random() * variations.length)];
      
      setScenes(prev => prev.map(scene => 
        scene.id === sceneId 
          ? { 
              ...scene, 
              description: randomVariation.description,
              script: randomVariation.script,
              visualSuggestions: randomVariation.visualSuggestions
            }
          : scene
      ));
      setIsRegenerating(null);
    }, 2000);
  };

  const duplicateScene = (sceneId: string) => {
    const sceneToClone = scenes.find(s => s.id === sceneId);
    if (!sceneToClone) return;

    const newScene: Scene = {
      ...sceneToClone,
      id: Date.now().toString(),
      title: `${sceneToClone.title} (Copia)`,
      order: scenes.length + 1
    };

    setScenes(prev => [...prev, newScene]);
  };

  const deleteScene = (sceneId: string) => {
    if (scenes.length <= 3) {
      return; // Don't allow deletion if we have minimum scenes
    }
    setScenes(prev => prev.filter(scene => scene.id !== sceneId));
  };

  const addNewScene = () => {
    const newScene: Scene = {
      id: Date.now().toString(),
      title: `Escena ${scenes.length + 1} — Nueva escena`,
      description: 'Describe qué sucede en esta escena...',
      script: 'Guión para esta escena...',
      visualSuggestions: ['Elemento visual 1', 'Elemento visual 2'],
      order: scenes.length + 1
    };

    setScenes(prev => [...prev, newScene]);
  };

  // Validation
  const validateStoryboard = () => {
    const hasMinimumScenes = scenes.length >= 3;
    const allScenesHaveContent = scenes.every(scene => 
      scene.description.trim() && 
      scene.script.trim() && 
      scene.visualSuggestions.length > 0
    );
    
    return hasMinimumScenes && allScenesHaveContent;
  };

  const canProceed = validateStoryboard();

  const handleNext = () => {
    // Create proper VideoScene objects
    const videoScenes: VideoScene[] = scenes.map(scene => ({
      id: scene.id,
      projectId: currentProject?.id || '',
      order: scene.order,
      duration: 30,
      title: scene.title,
      description: scene.description,
      thumbnail: '',
      layers: [],
      transitions: [],
      brandElements: {
        colors: [],
        fonts: [],
        logos: [],
        animations: [],
        guidelines: []
      },
      metadata: {
        aiGenerated: true,
        tags: [],
        complexity: 'medium' as const,
        // Store additional storyboard data
        script: scene.script,
        visualSuggestions: scene.visualSuggestions
      } as any, // Use any to avoid complex typing issues
      createdAt: new Date(),
      isSelected: false
    }));

    // Update project with scenes
    if (currentProject && setCurrentProject) {
      setCurrentProject({
        ...currentProject,
        scenes: videoScenes,
        updatedAt: new Date()
      });
    }
    
    onNext?.();
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Storyboard narrativo</h1>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                Paso 3 de 7
              </Badge>
              <Button 
                variant="ghost" 
                onClick={onPrevious}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
              >
                Siguiente: Generación inicial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Storyboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {scenes.map((scene, index) => (
              <Card key={scene.id} className="p-4 relative group hover:shadow-md transition-shadow">
                {/* Scene Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-move" />
                    <h3 className="font-medium text-sm text-gray-900">
                      {scene.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Descripción narrativa</Label>
                    <Textarea
                      value={scene.description}
                      onChange={(e) => updateScene(scene.id, 'description', e.target.value)}
                      className="mt-1 text-sm min-h-[60px] resize-none"
                      placeholder="Describe qué sucede en esta escena..."
                    />
                  </div>

                  {/* Script */}
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Guión propuesto</Label>
                    <Textarea
                      value={scene.script}
                      onChange={(e) => updateScene(scene.id, 'script', e.target.value)}
                      className="mt-1 text-sm min-h-[60px] resize-none"
                      placeholder="Diálogo o narración para esta escena..."
                    />
                  </div>

                  {/* Visual Suggestions */}
                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-2 block">Visual sugerido</Label>
                    <div className="space-y-2">
                      {scene.visualSuggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs group">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <input
                            value={suggestion}
                            onChange={(e) => {
                              const newSuggestions = [...scene.visualSuggestions];
                              newSuggestions[idx] = e.target.value;
                              updateScene(scene.id, 'visualSuggestions', newSuggestions);
                            }}
                            className="flex-1 bg-transparent border-none outline-none text-gray-600 placeholder-gray-400"
                            placeholder="Elemento visual..."
                          />
                          {scene.visualSuggestions.length > 1 && (
                            <button
                              onClick={() => {
                                const newSuggestions = scene.visualSuggestions.filter((_, i) => i !== idx);
                                updateScene(scene.id, 'visualSuggestions', newSuggestions);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          if (scene.visualSuggestions.length < 5) {
                            const newSuggestions = [...scene.visualSuggestions, 'Nuevo elemento visual'];
                            updateScene(scene.id, 'visualSuggestions', newSuggestions);
                          }
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Lightbulb className="w-3 h-3" />
                        Agregar visual
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => regenerateScene(scene.id)}
                    disabled={isRegenerating === scene.id}
                    className="text-xs h-7 px-2"
                  >
                    {isRegenerating === scene.id ? (
                      <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span className="ml-1">Regenerar IA</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateScene(scene.id)}
                    className="text-xs h-7 px-2"
                  >
                    <Copy className="w-3 h-3" />
                    <span className="ml-1">Duplicar</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteScene(scene.id)}
                    disabled={scenes.length <= 3}
                    className="text-xs h-7 px-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="ml-1">Eliminar</span>
                  </Button>
                </div>

                {/* Regenerating Overlay */}
                {isRegenerating === scene.id && (
                  <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-blue-600">Regenerando con IA...</p>
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {/* Add New Scene Card */}
            <Card className="p-4 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group">
              <button
                onClick={addNewScene}
                className="w-full h-full min-h-[200px] flex flex-col items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors"
              >
                <div className="w-12 h-12 border-2 border-current rounded-full flex items-center justify-center mb-3">
                  <Play className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium">Agregar nueva escena</p>
                <p className="text-xs text-gray-400 mt-1">Expande tu narrativa</p>
              </button>
            </Card>
          </div>

          {/* Validation Footer */}
          <div className="space-y-4">
            {/* Validation Warning */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800">
                    <strong>Validación narrativa:</strong> el storyboard debe tener al menos 3 escenas (introducción, desarrollo, conclusión).
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-yellow-700">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${scenes.length >= 3 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>Mínimo 3 escenas ({scenes.length}/3)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${scenes.every(s => s.description.trim() && s.script.trim()) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>Todas las escenas con contenido completo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${scenes.every(s => s.visualSuggestions.length > 0) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>Elementos visuales definidos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Storyboard Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>{scenes.length} escenas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  <span>~{Math.round(scenes.reduce((acc, scene) => acc + scene.script.length, 0) / 100)} palabras</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>~{scenes.length * 30}s duración estimada</span>
                </div>
              </div>
              
              {brandKit && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    BrandKit aplicado
                  </Badge>
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4">
              <Button 
                variant="ghost" 
                onClick={onPrevious}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
              >
                Siguiente: Generación inicial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}