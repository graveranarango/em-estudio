import React, { createContext, useContext, useState, ReactNode } from 'react';
import { VideoProject, VideoBriefing, VideoScene, VideoTimeline, VideoCopywriting, VideoType } from '../types/videos';

interface VideoProjectContextType {
  currentProject: VideoProject | null;
  setCurrentProject: (project: VideoProject | null) => void;
  updateProject: (updates: Partial<VideoProject>) => void;
  
  // Helpers para diferentes fases
  updateBriefing: (briefing: Partial<VideoBriefing>) => void;
  addScene: (scene: VideoScene) => void;
  updateScene: (sceneId: string, updates: Partial<VideoScene>) => void;
  selectScenes: (sceneIds: string[]) => void;
  updateTimeline: (timeline: Partial<VideoTimeline>) => void;
  updateCopywriting: (copy: Partial<VideoCopywriting>) => void;
  
  // Estado del flujo
  currentStep: VideoProjectStep;
  setCurrentStep: (step: VideoProjectStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  
  // Persistencia
  saveProject: () => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  createNewProject: (type: VideoType) => void;
}

export type VideoProjectStep = 'briefing' | 'configuration' | 'storyboard' | 'generation' | 'editing' | 'copywriting' | 'publishing';

const VideoProjectContext = createContext<VideoProjectContextType | undefined>(undefined);

interface VideoProjectProviderProps {
  children: ReactNode;
}

export function VideoProjectProvider({ children }: VideoProjectProviderProps) {
  const [currentProject, setCurrentProject] = useState<VideoProject | null>(null);
  const [currentStep, setCurrentStep] = useState<VideoProjectStep>('briefing');

  const updateProject = (updates: Partial<VideoProject>) => {
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      ...updates,
      updatedAt: new Date()
    };
    
    setCurrentProject(updatedProject);
  };

  const updateBriefing = (briefing: Partial<VideoBriefing>) => {
    if (!currentProject) return;
    
    updateProject({
      briefing: {
        ...currentProject.briefing,
        ...briefing
      },
      status: 'briefing'
    });
  };

  const addScene = (scene: VideoScene) => {
    if (!currentProject) return;
    
    updateProject({
      scenes: [...currentProject.scenes, scene],
      status: 'generating'
    });
  };

  const updateScene = (sceneId: string, updates: Partial<VideoScene>) => {
    if (!currentProject) return;
    
    const updatedScenes = currentProject.scenes.map(scene => 
      scene.id === sceneId 
        ? { ...scene, ...updates }
        : scene
    );
    
    updateProject({
      scenes: updatedScenes
    });
  };

  const selectScenes = (sceneIds: string[]) => {
    if (!currentProject) return;
    
    const updatedScenes = currentProject.scenes.map(scene => ({
      ...scene,
      isSelected: sceneIds.includes(scene.id)
    }));
    
    updateProject({
      scenes: updatedScenes,
      selectedSceneIds: sceneIds,
      status: 'editing'
    });
  };

  const updateTimeline = (timeline: Partial<VideoTimeline>) => {
    if (!currentProject) return;
    
    updateProject({
      timeline: {
        ...currentProject.timeline,
        ...timeline
      }
    });
  };

  const updateCopywriting = (copy: Partial<VideoCopywriting>) => {
    if (!currentProject) return;
    
    updateProject({
      copywriting: {
        ...currentProject.copywriting,
        ...copy
      },
      status: 'finalizing'
    });
  };

  const stepOrder: VideoProjectStep[] = ['briefing', 'configuration', 'storyboard', 'generation', 'editing', 'copywriting', 'publishing'];

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

  const createNewProject = (type: VideoType) => {
    const newProject: VideoProject = {
      id: `video_project_${Date.now()}`,
      title: `Nuevo ${type === 'short' ? 'Short/Reel' : type === 'video_long' ? 'Video Largo' : type}`,
      type,
      status: 'briefing',
      briefing: {
        description: '',
        videoType: type,
        duration: { target: 30, min: 15, max: 60, label: '30s' },
        platform: type === 'short' ? 'multiple' : 'youtube',
        style: type === 'short' ? 'trendy' : 'dynamic',
        chatHistory: [],
        objectives: type === 'short' ? ['viral'] : []
      },
      scenes: [],
      selectedSceneIds: [],
      timeline: {
        totalDuration: 0,
        scenes: [],
        globalLayers: [],
        audioTracks: [],
        markers: []
      },
      copywriting: {
        caption: '',
        hashtags: [],
        tone: '',
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
      console.log('Saving video project:', projectData);
      
      // TODO: Implementar guardado real en Firestore
      // await saveVideoProject(projectData);
      
    } catch (error) {
      console.error('Error saving video project:', error);
      throw error;
    }
  };

  const loadProject = async (projectId: string) => {
    try {
      // TODO: Implementar carga desde Firestore
      // const project = await loadVideoProject(projectId);
      // setCurrentProject(project);
      
      console.log('Loading video project:', projectId);
    } catch (error) {
      console.error('Error loading video project:', error);
      throw error;
    }
  };

  const contextValue: VideoProjectContextType = {
    currentProject,
    setCurrentProject,
    updateProject,
    updateBriefing,
    addScene,
    updateScene,
    selectScenes,
    updateTimeline,
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
    <VideoProjectContext.Provider value={contextValue}>
      {children}
    </VideoProjectContext.Provider>
  );
}

export function useVideoProject() {
  const context = useContext(VideoProjectContext);
  if (context === undefined) {
    throw new Error('useVideoProject must be used within a VideoProjectProvider');
  }
  return context;
}