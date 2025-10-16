import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StoryProject, StoryBriefing, StoryConcept, StoryLayer, StoryCopywriting, StoryObjective } from '@/types/stories';

interface StoryProjectContextType {
  currentProject: StoryProject | null;
  setCurrentProject: (project: StoryProject | null) => void;
  updateProject: (updates: Partial<StoryProject>) => void;
  
  // Helpers para diferentes fases
  updateBriefing: (briefing: Partial<StoryBriefing>) => void;
  addConcept: (concept: StoryConcept) => void;
  selectConcept: (conceptId: string) => void;
  updateLayers: (layers: StoryLayer[]) => void;
  updateLayer: (layerId: string, updates: Partial<StoryLayer>) => void;
  updateCopywriting: (copy: Partial<StoryCopywriting>) => void;
  
  // Estado del flujo
  currentStep: StoryProjectStep;
  setCurrentStep: (step: StoryProjectStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  
  // Persistencia
  saveProject: () => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  createNewProject: (objective: StoryObjective) => void;
}

export type StoryProjectStep = 'briefing' | 'configuration' | 'generation' | 'advanced-editing' | 'captions' | 'publishing';

const StoryProjectContext = createContext<StoryProjectContextType | undefined>(undefined);

interface StoryProjectProviderProps {
  children: ReactNode;
}

export function StoryProjectProvider({ children }: StoryProjectProviderProps) {
  const [currentProject, setCurrentProject] = useState<StoryProject | null>(null);
  const [currentStep, setCurrentStep] = useState<StoryProjectStep>('briefing');

  const updateProject = (updates: Partial<StoryProject>) => {
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      ...updates,
      updatedAt: new Date()
    };
    
    setCurrentProject(updatedProject);
  };

  const updateBriefing = (briefing: Partial<StoryBriefing>) => {
    if (!currentProject) return;
    
    updateProject({
      briefing: {
        ...currentProject.briefing,
        ...briefing
      },
      status: 'briefing'
    });
  };

  const addConcept = (concept: StoryConcept) => {
    if (!currentProject) return;
    
    updateProject({
      concepts: [...currentProject.concepts, concept],
      status: 'generating'
    });
  };

  const selectConcept = (conceptId: string) => {
    if (!currentProject) return;
    
    const selectedConcept = currentProject.concepts.find(c => c.id === conceptId);
    if (!selectedConcept) return;

    // Convertir el layout del concepto en capas editables
    const initialLayers = convertConceptToLayers(selectedConcept);
    
    const updatedConcepts = currentProject.concepts.map(concept => ({
      ...concept,
      isSelected: concept.id === conceptId
    }));
    
    updateProject({
      concepts: updatedConcepts,
      selectedConceptId: conceptId,
      layers: initialLayers,
      status: 'editing'
    });
  };

  const convertConceptToLayers = (concept: StoryConcept): StoryLayer[] => {
    const layers: StoryLayer[] = [];
    let zIndex = 0;

    // Background layer
    layers.push({
      id: `bg_${concept.id}`,
      type: 'background',
      name: 'Fondo',
      content: {
        type: concept.layout.background.type,
        primaryColor: concept.layout.background.primaryColor,
        secondaryColor: concept.layout.background.secondaryColor,
        direction: concept.layout.background.direction
      },
      position: { x: 0, y: 0, width: 100, height: 100 },
      style: { backgroundColor: concept.layout.background.primaryColor },
      visible: true,
      locked: false,
      zIndex: zIndex++
    });

    // Text layer
    const textArea = concept.layout.textPlacement.area;
    const textY = textArea === 'top' ? 15 : textArea === 'center' ? 45 : 75;
    
    layers.push({
      id: `text_${concept.id}`,
      type: 'text',
      name: 'Texto Principal',
      content: {
        text: concept.title,
        fontSize: 36,
        fontFamily: concept.brandElements.fonts[0]?.family || 'Inter',
        fontWeight: '700'
      },
      position: { x: 10, y: textY, width: 80, height: 15 },
      style: {
        fontSize: 36,
        fontFamily: concept.brandElements.fonts[0]?.family || 'Inter',
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: concept.layout.textPlacement.alignment
      },
      visible: true,
      locked: false,
      zIndex: zIndex++,
      animation: { type: 'fade_in', duration: 0.5 }
    });

    // Logo layer
    if (concept.layout.logoPosition !== 'hidden') {
      const logoPos = getLogoPosition(concept.layout.logoPosition);
      layers.push({
        id: `logo_${concept.id}`,
        type: 'logo',
        name: 'Logo',
        content: { type: 'placeholder', text: 'LOGO' },
        position: logoPos,
        style: {
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 8,
          color: '#FFFFFF'
        },
        visible: true,
        locked: false,
        zIndex: zIndex++
      });
    }

    // Overlay layers
    concept.layout.overlays.forEach((overlay, index) => {
      layers.push({
        id: `overlay_${concept.id}_${index}`,
        type: 'shape',
        name: `Overlay ${index + 1}`,
        content: { type: overlay.type },
        position: overlay.position,
        style: overlay.style,
        visible: true,
        locked: false,
        zIndex: zIndex++
      });
    });

    return layers;
  };

  const getLogoPosition = (position: string) => {
    switch (position) {
      case 'top-left': return { x: 5, y: 5, width: 15, height: 8 };
      case 'top-right': return { x: 80, y: 5, width: 15, height: 8 };
      case 'bottom-left': return { x: 5, y: 87, width: 15, height: 8 };
      case 'bottom-right': return { x: 80, y: 87, width: 15, height: 8 };
      case 'center': return { x: 42.5, y: 46, width: 15, height: 8 };
      default: return { x: 80, y: 87, width: 15, height: 8 };
    }
  };

  const updateLayers = (layers: StoryLayer[]) => {
    if (!currentProject) return;
    updateProject({ layers });
  };

  const updateLayer = (layerId: string, updates: Partial<StoryLayer>) => {
    if (!currentProject) return;
    
    const updatedLayers = currentProject.layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, ...updates }
        : layer
    );
    
    updateProject({ layers: updatedLayers });
  };

  const updateCopywriting = (copy: Partial<StoryCopywriting>) => {
    if (!currentProject) return;
    
    updateProject({
      copywriting: {
        ...currentProject.copywriting,
        ...copy
      },
      status: 'finalizing'
    });
  };

  const stepOrder: StoryProjectStep[] = ['briefing', 'configuration', 'generation', 'advanced-editing', 'captions', 'publishing'];

  const goToNextStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const createNewProject = (objective: StoryObjective) => {
    const newProject: StoryProject = {
      id: `story_project_${Date.now()}`,
      title: `Nueva Historia`,
      type: 'story',
      objective,
      status: 'briefing',
      briefing: {
        description: '',
        objective,
        platform: 'instagram',
        duration: { seconds: 10, label: '10s (Estándar)', autoAdvance: true },
        chatHistory: []
      },
      concepts: [],
      layers: [],
      copywriting: {
        mainText: '',
        hashtags: [],
        tone: '',
        length: 'short',
        aiGenerated: false
      },
      publishing: {
        platforms: [],
        status: 'draft'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      brandKitCompliant: true
    };
    
    setCurrentProject(newProject);
    setCurrentStep('briefing');
  };

  const saveProject = async () => {
    if (!currentProject) return;
    
    try {
      // Aquí se implementaría la lógica para guardar en Firestore
      const projectData = {
        ...currentProject,
        updatedAt: new Date()
      };
      
      // Simular guardado por ahora
      console.log('Saving story project:', projectData);
      
      // TODO: Implementar guardado real en Firestore
      // await saveStoryProject(projectData);
      
    } catch (error) {
      console.error('Error saving story project:', error);
      throw error;
    }
  };

  const loadProject = async (projectId: string) => {
    try {
      // TODO: Implementar carga desde Firestore
      // const project = await loadStoryProject(projectId);
      // setCurrentProject(project);
      
      console.log('Loading story project:', projectId);
    } catch (error) {
      console.error('Error loading story project:', error);
      throw error;
    }
  };

  const contextValue: StoryProjectContextType = {
    currentProject,
    setCurrentProject,
    updateProject,
    updateBriefing,
    addConcept,
    selectConcept,
    updateLayers,
    updateLayer,
    updateCopywriting,
    currentStep,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    saveProject,
    loadProject,
    createNewProject
  };

  return (
    <StoryProjectContext.Provider value={contextValue}>
      {children}
    </StoryProjectContext.Provider>
  );
}

export function useStoryProject() {
  const context = useContext(StoryProjectContext);
  if (context === undefined) {
    throw new Error('useStoryProject must be used within a StoryProjectProvider');
  }
  return context;
}
