import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PostProject, PostBriefing, PostConfiguration, PostDesign, PostCopywriting } from '@/types/posts';

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

export function PostProjectProvider({ children }: PostProjectProviderProps) {
  const [currentProject, setCurrentProject] = useState<PostProject | null>(null);
  const [currentStep, setCurrentStep] = useState<ProjectStep>('briefing');

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
      console.log('Saving project:', projectData);

      // TODO: Implementar guardado real en Firestore
      // await savePostProject(projectData);

    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  };

  const loadProject = async (projectId: string) => {
    try {
      // TODO: Implementar carga desde Firestore
      // const project = await loadPostProject(projectId);
      // setCurrentProject(project);

      console.log('Loading project:', projectId);
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
