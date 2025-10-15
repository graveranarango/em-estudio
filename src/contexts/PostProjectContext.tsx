import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PostProject, PostBriefing, PostConfiguration, PostDesign, PostCopywriting, DesignLayer, CanvasState } from '../types/posts';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface PostProjectContextType {
  currentProject: PostProject | null;
  setCurrentProject: (project: PostProject | null) => void;
  updateProject: (updates: Partial<PostProject>) => void;
  
  // Helpers para diferentes fases
  updateBriefing: (briefing: Partial<PostBriefing>) => void;
  updateConfiguration: (config: Partial<PostConfiguration>) => void;
  addDesign: (design: PostDesign) => void;
  selectDesign: (designId: string) => void;
  updateSelectedDesign: (updates: Partial<PostDesign>) => void;
  updateCopywriting: (copy: Partial<PostCopywriting>) => void;
  
  // Helpers para el editor
  updateLayer: (layerId: string, updates: Partial<DesignLayer>) => void;
  selectLayer: (layerId: string | null) => void;

  // Estado del flujo
  currentStep: ProjectStep;
  setCurrentStep: (step: ProjectStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  
  // Persistencia
  saveProject: () => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  createNewProject: (type: 'post' | 'carousel') => void;
}

export type ProjectStep = 'briefing' | 'selection' | 'configuration' | 'generation' | 'editing' | 'copywriting' | 'caption' | 'publishing';

const PostProjectContext = createContext<PostProjectContextType | undefined>(undefined);

interface PostProjectProviderProps {
  children: ReactNode;
}

const initialProject: PostProject = {
  id: `project_${Date.now()}`,
  title: 'Nuevo Post',
  type: 'post',
  status: 'editing',
  briefing: {
    description: '',
    chatHistory: [],
    referenceImages: [],
    objectives: [],
  },
  configuration: {
    socialPlatforms: ['instagram'],
    primaryPlatform: 'instagram',
    generationCount: 3,
    format: {
      ratio: '1:1',
      name: 'Cuadrado',
      width: 1080,
      height: 1080,
    },
    dimensions: { width: 1080, height: 1080 },
  },
  designs: [
    {
      id: 'design_1',
      projectId: 'project_1',
      version: 1,
      thumbnail: '',
      layers: [
        {
          id: 'title',
          type: 'text',
          name: 'Título',
          content: 'Título de ejemplo',
          position: { x: 10, y: 20, width: 80, height: 20 },
          style: {
            fontSize: 48,
            fontFamily: 'Montserrat',
            fontWeight: 'bold',
            color: '#000000',
          },
          visible: true,
          locked: false,
          zIndex: 1,
        },
      ],
      metadata: {
        aiGenerated: false,
        tags: [],
      },
      brandElements: {
        colors: [],
        fonts: [],
        logos: [],
        guidelines: [],
      },
      createdAt: new Date(),
      isSelected: true,
    },
  ],
  selectedDesignId: 'design_1',
  canvas: {
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedLayerId: null,
    clipboardLayers: [],
    history: [],
    historyIndex: -1,
  },
  copywriting: {
    caption: '',
    hashtags: [],
    tone: '',
    length: 'medium',
    aiGenerated: false,
  },
  publishing: {
    platforms: [],
    status: 'draft',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  brandKitCompliant: true,
};

export function PostProjectProvider({ children }: PostProjectProviderProps) {
  const [currentProject, setCurrentProject] = useState<PostProject | null>(initialProject);
  const [currentStep, setCurrentStep] = useState<ProjectStep>('editing');

  const updateProject = (updates: Partial<PostProject>) => {
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      ...updates,
      updatedAt: new Date()
    };
    
    setCurrentProject(updatedProject);
  };

  const updateBriefing = (briefing: Partial<PostBriefing>) => {
    if (!currentProject) return;
    
    updateProject({
      briefing: {
        ...currentProject.briefing,
        ...briefing
      },
      status: 'briefing'
    });
  };

  const updateConfiguration = (config: Partial<PostConfiguration>) => {
    if (!currentProject) return;
    
    updateProject({
      configuration: {
        ...currentProject.configuration,
        ...config
      },
      status: 'configuring'
    });
  };

  const addDesign = (design: PostDesign) => {
    if (!currentProject) return;
    
    updateProject({
      designs: [...currentProject.designs, design],
      status: 'generating'
    });
  };

  const selectDesign = (designId: string) => {
    if (!currentProject) return;
    
    const updatedDesigns = currentProject.designs.map(d => ({
      ...d,
      isSelected: d.id === designId
    }));
    
    updateProject({
      designs: updatedDesigns,
      selectedDesignId: designId,
      status: 'editing'
    });
  };

  const updateSelectedDesign = (updates: Partial<PostDesign>) => {
    if (!currentProject || !currentProject.selectedDesignId) return;
    
    const updatedDesigns = currentProject.designs.map(d => 
      d.id === currentProject.selectedDesignId 
        ? { ...d, ...updates }
        : d
    );
    
    updateProject({
      designs: updatedDesigns
    });
  };

  const updateCopywriting = (copy: Partial<PostCopywriting>) => {
    if (!currentProject) return;
    
    updateProject({
      copywriting: {
        ...currentProject.copywriting,
        ...copy
      },
      status: 'finalizing'
    });
  };

  const updateLayer = (layerId: string, updates: Partial<DesignLayer>) => {
    if (!currentProject || !currentProject.selectedDesignId) return;

    const updatedDesigns = currentProject.designs.map(d =>
      d.id === currentProject.selectedDesignId
        ? {
            ...d,
            layers: d.layers.map(l =>
              l.id === layerId ? { ...l, ...updates } : l
            ),
          }
        : d
    );

    updateProject({ designs: updatedDesigns });
  };

  const selectLayer = (layerId: string | null) => {
    if (!currentProject) return;

    updateProject({
      canvas: {
        ...currentProject.canvas,
        selectedLayerId: layerId,
      },
    });
  };

  const stepOrder: ProjectStep[] = ['briefing', 'configuration', 'generation', 'editing', 'copywriting', 'caption', 'publishing'];

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

  const createNewProject = (type: 'post' | 'carousel') => {
    const newProject: PostProject = {
      id: `project_${Date.now()}`,
      title: `Nuevo ${type === 'post' ? 'Post' : 'Carrusel'}`,
      type,
      status: 'briefing',
      briefing: {
        description: '',
        chatHistory: [],
        referenceImages: [],
        objectives: [],
      },
      configuration: {
        socialPlatforms: ['instagram'],
        primaryPlatform: 'instagram',
        generationCount: 3,
        format: {
          ratio: '1:1',
          name: 'Cuadrado',
          width: 1080,
          height: 1080
        },
        dimensions: { width: 1080, height: 1080 }
      },
      designs: [],
      copywriting: {
        caption: '',
        hashtags: [],
        tone: '',
        length: 'medium',
        aiGenerated: false
      },
      publishing: {
        platforms: [],
        status: 'draft'
      },
      canvas: {
        zoom: 1,
        pan: { x: 0, y: 0 },
        selectedLayerId: null,
        clipboardLayers: [],
        history: [],
        historyIndex: -1,
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
      const functions = getFunctions();
      const savePostProject = httpsCallable(functions, 'savePostProject');
      await savePostProject({ project: currentProject });
      console.log('Project saved');
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  };

  const loadProject = async (projectId: string) => {
    try {
      const functions = getFunctions();
      const loadPostProject = httpsCallable(functions, 'loadPostProject');
      const result = await loadPostProject({ projectId });
      setCurrentProject(result.data as PostProject);
      console.log('Project loaded:', result.data);
    } catch (error) {
      console.error('Error loading project:', error);
      throw error;
    }
  };

  const contextValue: PostProjectContextType = {
    currentProject,
    setCurrentProject,
    updateProject,
    updateBriefing,
    updateConfiguration,
    addDesign,
    selectDesign,
    updateSelectedDesign,
    updateCopywriting,
    updateLayer,
    selectLayer,
    currentStep,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    saveProject,
    loadProject,
    createNewProject
  };

  return (
    <PostProjectContext.Provider value={contextValue}>
      {children}
    </PostProjectContext.Provider>
  );
}

export function usePostProject() {
  const context = useContext(PostProjectContext);
  if (context === undefined) {
    throw new Error('usePostProject must be used within a PostProjectProvider');
  }
  return context;
}
