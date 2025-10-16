import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PodcastProject, PodcastBriefing, PodcastRecording, PodcastTranscription, PodcastHighlight, PodcastClip, PodcastContentType, TranscriptSegment } from '@/types/podcasts';

interface PodcastProjectContextType {
  currentProject: PodcastProject | null;
  setCurrentProject: (project: PodcastProject | null) => void;
  updateProject: (updates: Partial<PodcastProject>) => void;
  
  // Helpers para diferentes fases
  updateBriefing: (briefing: Partial<PodcastBriefing>) => void;
  updateRecording: (recording: Partial<PodcastRecording>) => void;
  updateTranscription: (transcription: Partial<PodcastTranscription>) => void;
  addHighlight: (highlight: PodcastHighlight) => void;
  updateHighlight: (highlightId: string, updates: Partial<PodcastHighlight>) => void;
  addClip: (clip: PodcastClip) => void;
  updateClip: (clipId: string, updates: Partial<PodcastClip>) => void;
  
  // Transcript editing
  updateTranscriptSegment: (segmentId: string, updates: Partial<TranscriptSegment>) => void;
  mergeTranscriptSegments: (segmentIds: string[]) => void;
  splitTranscriptSegment: (segmentId: string, splitTime: number) => void;
  
  // Estado del flujo
  currentStep: PodcastProjectStep;
  setCurrentStep: (step: PodcastProjectStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  
  // Persistencia
  saveProject: () => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  createNewProject: (contentType: PodcastContentType) => void;
  exportProject: (format: 'json' | 'srt' | 'vtt') => Promise<string>;
}

export type PodcastProjectStep = 'briefing' | 'recording' | 'transcription' | 'highlights' | 'publishing';

const PodcastProjectContext = createContext<PodcastProjectContextType | undefined>(undefined);

interface PodcastProjectProviderProps {
  children: ReactNode;
}

export function PodcastProjectProvider({ children }: PodcastProjectProviderProps) {
  const [currentProject, setCurrentProject] = useState<PodcastProject | null>(null);
  const [currentStep, setCurrentStep] = useState<PodcastProjectStep>('briefing');

  const updateProject = (updates: Partial<PodcastProject>) => {
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      ...updates,
      updatedAt: new Date()
    };
    
    setCurrentProject(updatedProject);
  };

  const updateBriefing = (briefing: Partial<PodcastBriefing>) => {
    if (!currentProject) return;
    
    updateProject({
      briefing: {
        ...currentProject.briefing,
        ...briefing
      },
      status: 'briefing'
    });
  };

  const updateRecording = (recording: Partial<PodcastRecording>) => {
    if (!currentProject) return;
    
    updateProject({
      recording: {
        ...currentProject.recording,
        ...recording
      },
      status: recording.status === 'completed' ? 'transcribing' : 'recording'
    });
  };

  const updateTranscription = (transcription: Partial<PodcastTranscription>) => {
    if (!currentProject) return;
    
    updateProject({
      transcription: {
        ...currentProject.transcription,
        ...transcription
      },
      status: transcription.status === 'completed' ? 'highlighting' : 'transcribing'
    });
  };

  const updateTranscriptSegment = (segmentId: string, updates: Partial<TranscriptSegment>) => {
    if (!currentProject) return;
    
    const updatedSegments = currentProject.transcription.segments.map(segment => 
      segment.id === segmentId 
        ? { ...segment, ...updates, isEdited: true }
        : segment
    );
    
    updateTranscription({
      segments: updatedSegments,
      editHistory: [
        ...currentProject.transcription.editHistory,
        {
          id: `edit_${Date.now()}`,
          segmentId,
          originalText: currentProject.transcription.segments.find(s => s.id === segmentId)?.text || '',
          editedText: updates.text || '',
          timestamp: new Date(),
          reason: 'accuracy'
        }
      ]
    });
  };

  const mergeTranscriptSegments = (segmentIds: string[]) => {
    if (!currentProject || segmentIds.length < 2) return;
    
    const segments = currentProject.transcription.segments;
    const segmentsToMerge = segments.filter(s => segmentIds.includes(s.id)).sort((a, b) => a.startTime - b.startTime);
    
    if (segmentsToMerge.length < 2) return;
    
    const mergedSegment: TranscriptSegment = {
      id: `merged_${Date.now()}`,
      startTime: segmentsToMerge[0].startTime,
      endTime: segmentsToMerge[segmentsToMerge.length - 1].endTime,
      text: segmentsToMerge.map(s => s.text).join(' '),
      confidence: segmentsToMerge.reduce((acc, s) => acc + s.confidence, 0) / segmentsToMerge.length,
      isEdited: true,
      brandFlags: [],
      emotions: segmentsToMerge[0].emotions,
      speaker: segmentsToMerge[0].speaker
    };
    
    const updatedSegments = [
      ...segments.filter(s => !segmentIds.includes(s.id)),
      mergedSegment
    ].sort((a, b) => a.startTime - b.startTime);
    
    updateTranscription({ segments: updatedSegments });
  };

  const splitTranscriptSegment = (segmentId: string, splitTime: number) => {
    if (!currentProject) return;
    
    const segment = currentProject.transcription.segments.find(s => s.id === segmentId);
    if (!segment || splitTime <= segment.startTime || splitTime >= segment.endTime) return;
    
    const words = segment.text.split(' ');
    const splitRatio = (splitTime - segment.startTime) / (segment.endTime - segment.startTime);
    const splitIndex = Math.floor(words.length * splitRatio);
    
    const firstPart: TranscriptSegment = {
      ...segment,
      id: `${segmentId}_part1`,
      endTime: splitTime,
      text: words.slice(0, splitIndex).join(' '),
      isEdited: true
    };
    
    const secondPart: TranscriptSegment = {
      ...segment,
      id: `${segmentId}_part2`,
      startTime: splitTime,
      text: words.slice(splitIndex).join(' '),
      isEdited: true
    };
    
    const updatedSegments = [
      ...currentProject.transcription.segments.filter(s => s.id !== segmentId),
      firstPart,
      secondPart
    ].sort((a, b) => a.startTime - b.startTime);
    
    updateTranscription({ segments: updatedSegments });
  };

  const addHighlight = (highlight: PodcastHighlight) => {
    if (!currentProject) return;
    
    updateProject({
      highlights: [...currentProject.highlights, highlight]
    });
  };

  const updateHighlight = (highlightId: string, updates: Partial<PodcastHighlight>) => {
    if (!currentProject) return;
    
    const updatedHighlights = currentProject.highlights.map(highlight => 
      highlight.id === highlightId 
        ? { ...highlight, ...updates }
        : highlight
    );
    
    updateProject({ highlights: updatedHighlights });
  };

  const addClip = (clip: PodcastClip) => {
    if (!currentProject) return;
    
    updateProject({
      clips: [...currentProject.clips, clip]
    });
  };

  const updateClip = (clipId: string, updates: Partial<PodcastClip>) => {
    if (!currentProject) return;
    
    const updatedClips = currentProject.clips.map(clip => 
      clip.id === clipId 
        ? { ...clip, ...updates }
        : clip
    );
    
    updateProject({ clips: updatedClips });
  };

  const stepOrder: PodcastProjectStep[] = ['briefing', 'recording', 'transcription', 'highlights', 'publishing'];

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

  const createNewProject = (contentType: PodcastContentType) => {
    const newProject: PodcastProject = {
      id: `podcast_project_${Date.now()}`,
      title: `Nuevo ${contentType.includes('podcast') ? 'Podcast' : 'Contenido Educativo'}`,
      type: contentType.includes('podcast') ? 'podcast' : 'educational',
      status: 'briefing',
      briefing: {
        description: '',
        contentType,
        targetDuration: { minutes: 30, label: '30 min', segments: 5 },
        contentStyle: 'professional',
        targetAudience: '',
        chatHistory: [],
        outline: {
          segments: [],
          totalEstimatedDuration: 0,
          introduction: '',
          conclusion: '',
          transitionPhrases: []
        },
        objectives: [],
        keyMessages: [],
        callToActions: []
      },
      recording: {
        status: 'not_started',
        recordingMethod: 'browser_audio',
        quality: {
          audioSampleRate: 44100,
          audioBitrate: 128,
          format: 'webm'
        },
        metadata: {},
        liveGuidance: {
          currentSegment: 0,
          suggestions: [],
          brandReminders: [],
          paceGuidance: 'good_pace',
          energyLevel: 'medium'
        }
      },
      transcription: {
        status: 'not_started',
        segments: [],
        confidence: 0,
        language: 'es',
        wordCount: 0,
        editHistory: [],
        brandAlignment: {
          overallScore: 0,
          toneConsistency: 0,
          vocabularyAlignment: 0,
          messageClarity: 0,
          recommendations: []
        }
      },
      highlights: [],
      clips: [],
      publishing: {
        podcastPlatforms: [],
        clipsPlatforms: [],
        status: 'draft',
        metadata: {
          category: 'Technology',
          tags: [],
          language: 'es',
          isExplicit: false
        },
        distribution: {
          rss: true,
          embedCode: true,
          downloadLink: true,
          socialSharing: true,
          analytics: true
        }
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
      const projectData = {
        ...currentProject,
        updatedAt: new Date()
      };
      
      // Simular guardado por ahora
      console.log('Saving podcast project:', projectData);
      
      // TODO: Implementar guardado real en Firestore
      // await savePodcastProject(projectData);
      
    } catch (error) {
      console.error('Error saving podcast project:', error);
      throw error;
    }
  };

  const loadProject = async (projectId: string) => {
    try {
      // TODO: Implementar carga desde Firestore
      // const project = await loadPodcastProject(projectId);
      // setCurrentProject(project);
      
      console.log('Loading podcast project:', projectId);
    } catch (error) {
      console.error('Error loading podcast project:', error);
      throw error;
    }
  };

  const exportProject = async (format: 'json' | 'srt' | 'vtt'): Promise<string> => {
    if (!currentProject) return '';
    
    try {
      switch (format) {
        case 'json':
          return JSON.stringify(currentProject, null, 2);
        
        case 'srt':
          return generateSRTSubtitles(currentProject.transcription.segments);
        
        case 'vtt':
          return generateVTTSubtitles(currentProject.transcription.segments);
        
        default:
          return '';
      }
    } catch (error) {
      console.error('Error exporting project:', error);
      return '';
    }
  };

  const generateSRTSubtitles = (segments: TranscriptSegment[]): string => {
    return segments
      .map((segment, index) => {
        const startTime = formatSRTTime(segment.startTime);
        const endTime = formatSRTTime(segment.endTime);
        return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`;
      })
      .join('\n');
  };

  const generateVTTSubtitles = (segments: TranscriptSegment[]): string => {
    const header = 'WEBVTT\n\n';
    const content = segments
      .map(segment => {
        const startTime = formatVTTTime(segment.startTime);
        const endTime = formatVTTTime(segment.endTime);
        return `${startTime} --> ${endTime}\n${segment.text}\n`;
      })
      .join('\n');
    return header + content;
  };

  const formatSRTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
  };

  const formatVTTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  const contextValue: PodcastProjectContextType = {
    currentProject,
    setCurrentProject,
    updateProject,
    updateBriefing,
    updateRecording,
    updateTranscription,
    addHighlight,
    updateHighlight,
    addClip,
    updateClip,
    updateTranscriptSegment,
    mergeTranscriptSegments,
    splitTranscriptSegment,
    currentStep,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    saveProject,
    loadProject,
    createNewProject,
    exportProject
  };

  return (
    <PodcastProjectContext.Provider value={contextValue}>
      {children}
    </PodcastProjectContext.Provider>
  );
}

export function usePodcastProject() {
  const context = useContext(PodcastProjectContext);
  if (context === undefined) {
    throw new Error('usePodcastProject must be used within a PodcastProjectProvider');
  }
  return context;
}
