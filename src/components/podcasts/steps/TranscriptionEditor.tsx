import { useState, useRef, useEffect } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Progress } from "../../ui/progress";
import { ScrollArea } from "../../ui/scroll-area";
import { Slider } from "../../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { useBrandKit, useBrandVoice, useBrandColors, useBrandTypography } from "../../../contexts/BrandKitContext";
import { usePodcastProject } from "../../../contexts/PodcastProjectContext";
import { TranscriptSegment, BrandFlag, TranscriptEdit } from "../../../types/podcasts";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  Edit,
  Save,
  Undo,
  Redo,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Merge,
  Split,
  Trash2,
  Download,
  RefreshCw,
  Zap,
  Eye
} from "lucide-react";

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
}

export function TranscriptionEditor() {
  const { hasBrandKit, getBrandInstructions } = useBrandKit();
  const { voiceTone, instructions: voiceInstructions, hasVoiceTone } = useBrandVoice();
  const { primaryColors } = useBrandColors();
  const { primaryFont } = useBrandTypography();
  const { 
    currentProject, 
    updateTranscription, 
    updateTranscriptSegment,
    mergeTranscriptSegments,
    splitTranscriptSegment,
    goToPreviousStep, 
    goToNextStep,
    exportProject
  } = usePodcastProject();
  
  const [isGeneratingTranscription, setIsGeneratingTranscription] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    volume: 1.0
  });
  
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBrandFlags, setShowBrandFlags] = useState(true);
  const [isValidatingBrand, setIsValidatingBrand] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptionScrollRef = useRef<HTMLDivElement>(null);

  const transcription = currentProject?.transcription;
  const segments = transcription?.segments || [];
  const recording = currentProject?.recording;
  const brandAlignment = transcription?.brandAlignment;

  useEffect(() => {
    // Start transcription if not started
    if (currentProject && transcription?.status === 'not_started') {
      startTranscription();
    }
  }, [currentProject]);

  useEffect(() => {
    // Auto-scroll to current segment during playback
    if (playbackState.isPlaying) {
      const currentSegment = segments.find(s => 
        playbackState.currentTime >= s.startTime && 
        playbackState.currentTime <= s.endTime
      );
      
      if (currentSegment) {
        const segmentElement = document.getElementById(`segment-${currentSegment.id}`);
        if (segmentElement) {
          segmentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [playbackState.currentTime, playbackState.isPlaying, segments]);

  const startTranscription = async () => {
    if (!currentProject || !recording?.audioFile) return;

    setIsGeneratingTranscription(true);
    setTranscriptionProgress(0);

    updateTranscription({
      status: 'processing'
    });

    try {
      // Simulate transcription progress
      const interval = setInterval(() => {
        setTranscriptionProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsGeneratingTranscription(false);
            generateMockTranscription();
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

    } catch (error) {
      console.error('Error generating transcription:', error);
      setIsGeneratingTranscription(false);
      updateTranscription({
        status: 'error'
      });
    }
  };

  const generateMockTranscription = async () => {
    // Generate mock transcription segments
    const mockSegments: TranscriptSegment[] = [
      {
        id: 'seg_1',
        startTime: 0,
        endTime: 15,
        text: 'Bienvenidos a este nuevo episodio. Hoy vamos a hablar sobre un tema muy interesante que estoy seguro les va a gustar.',
        confidence: 0.95,
        isEdited: false,
        brandFlags: [],
        emotions: { primary: 'enthusiastic', confidence: 0.8, energy: 0.7 },
        speaker: 'Host'
      },
      {
        id: 'seg_2',
        startTime: 15,
        endTime: 45,
        text: 'Como saben, en nuestra empresa siempre buscamos la excelencia y esto es algo que queremos compartir con ustedes.',
        confidence: 0.88,
        isEdited: false,
        brandFlags: hasVoiceTone ? [] : [
          {
            type: 'tone_mismatch',
            severity: 'medium',
            suggestion: 'Consider using a more conversational tone to match your brand voice.',
            segmentId: 'seg_2'
          }
        ],
        emotions: { primary: 'serious', confidence: 0.9, energy: 0.6 },
        speaker: 'Host'
      },
      {
        id: 'seg_3',
        startTime: 45,
        endTime: 75,
        text: 'Permíteme contarte mi experiencia personal con este tema, porque creo que puede ser muy valioso para ti.',
        confidence: 0.92,
        isEdited: false,
        brandFlags: [],
        emotions: { primary: 'calm', confidence: 0.85, energy: 0.5 },
        speaker: 'Host'
      },
      {
        id: 'seg_4',
        startTime: 75,
        endTime: 120,
        text: 'Los puntos clave que quiero que recuerdes son tres: primero, la importancia de la planificación; segundo, la ejecución efectiva; y tercero, la medición de resultados.',
        confidence: 0.96,
        isEdited: false,
        brandFlags: [],
        emotions: { primary: 'serious', confidence: 0.95, energy: 0.8 },
        speaker: 'Host'
      },
      {
        id: 'seg_5',
        startTime: 120,
        endTime: 150,
        text: 'Eso es todo por hoy. Espero que este contenido te haya sido útil. No olvides suscribirte y compartir con quien creas que le puede servir.',
        confidence: 0.94,
        isEdited: false,
        brandFlags: [],
        emotions: { primary: 'enthusiastic', confidence: 0.88, energy: 0.7 },
        speaker: 'Host'
      }
    ];

    // Calculate brand alignment if BrandKit is available
    let brandAlignmentScore = {
      overallScore: 85,
      toneConsistency: hasVoiceTone ? 92 : 75,
      vocabularyAlignment: 88,
      messageClarity: 82,
      recommendations: hasVoiceTone ? [
        'Great consistency with your brand voice',
        'Consider adding more specific brand terminology',
        'Excellent energy level throughout'
      ] : [
        'Consider defining a brand voice for better consistency',
        'Add more brand-specific terminology',
        'Work on consistent tone throughout the content'
      ]
    };

    updateTranscription({
      status: 'completed',
      segments: mockSegments,
      confidence: 0.91,
      language: 'es',
      wordCount: mockSegments.reduce((acc, seg) => acc + seg.text.split(' ').length, 0),
      brandAlignment: brandAlignmentScore
    });

    setPlaybackState(prev => ({ ...prev, duration: 150 }));
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (playbackState.isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaybackState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlaybackState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const jumpToSegment = (segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (segment) {
      seekTo(segment.startTime);
    }
  };

  const startEditingSegment = (segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (segment) {
      setEditingSegmentId(segmentId);
      setEditingText(segment.text);
    }
  };

  const saveSegmentEdit = () => {
    if (editingSegmentId && editingText.trim()) {
      updateTranscriptSegment(editingSegmentId, {
        text: editingText.trim()
      });
      setEditingSegmentId(null);
      setEditingText('');
    }
  };

  const cancelSegmentEdit = () => {
    setEditingSegmentId(null);
    setEditingText('');
  };

  const handleSegmentSelection = (segmentId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedSegments(prev => [...prev, segmentId]);
    } else {
      setSelectedSegments(prev => prev.filter(id => id !== segmentId));
    }
  };

  const mergeSelectedSegments = () => {
    if (selectedSegments.length >= 2) {
      mergeTranscriptSegments(selectedSegments);
      setSelectedSegments([]);
    }
  };

  const splitSegment = (segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (segment) {
      const splitTime = segment.startTime + (segment.endTime - segment.startTime) / 2;
      splitTranscriptSegment(segmentId, splitTime);
    }
  };

  const validateBrandAlignment = async () => {
    if (!hasBrandKit) return;

    setIsValidatingBrand(true);

    try {
      const brandInstructions = await getBrandInstructions('podcast');
      
      // Simulate brand validation
      setTimeout(() => {
        const updatedSegments = segments.map(segment => {
          const flags: BrandFlag[] = [];
          
          // Check for brand alignment issues
          if (!hasVoiceTone) {
            flags.push({
              type: 'tone_mismatch',
              severity: 'medium',
              suggestion: 'Define a brand voice for better consistency',
              segmentId: segment.id
            });
          }
          
          // Check for brand terminology
          if (!segment.text.toLowerCase().includes('marca') && !segment.text.toLowerCase().includes('empresa')) {
            if (Math.random() > 0.7) {
              flags.push({
                type: 'missing_brand_terms',
                severity: 'low',
                suggestion: 'Consider adding brand-specific terminology',
                segmentId: segment.id
              });
            }
          }
          
          return { ...segment, brandFlags: flags };
        });

        updateTranscription({
          segments: updatedSegments,
          brandAlignment: {
            ...brandAlignment!,
            overallScore: hasVoiceTone ? 92 : 78,
            toneConsistency: hasVoiceTone ? 95 : 72
          }
        });

        setIsValidatingBrand(false);
      }, 2000);

    } catch (error) {
      console.error('Error validating brand alignment:', error);
      setIsValidatingBrand(false);
    }
  };

  const exportTranscription = async (format: 'srt' | 'vtt' | 'txt') => {
    try {
      let content = '';
      
      switch (format) {
        case 'srt':
          content = await exportProject('srt');
          break;
        case 'vtt':
          content = await exportProject('vtt');
          break;
        case 'txt':
          content = segments.map(s => s.text).join('\n\n');
          break;
      }
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcription.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting transcription:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSegments = segments.filter(segment =>
    searchQuery === '' || 
    segment.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canContinue = transcription?.status === 'completed' && segments.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header with controls */}
      <div className="p-6 border-b bg-white">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Editor de Transcripción</h2>
              {hasBrandKit && (
                <Badge className="bg-green-100 text-green-800">
                  BrandKit Activo
                </Badge>
              )}
              {transcription?.status === 'completed' && (
                <Badge className="bg-blue-100 text-blue-800">
                  {transcription.confidence * 100}% precisión
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => validateBrandAlignment()}
                disabled={isValidatingBrand || !hasBrandKit}
              >
                {isValidatingBrand ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Validar Marca
                  </>
                )}
              </Button>
              
              <Select onValueChange={(format: 'srt' | 'vtt' | 'txt') => exportTranscription(format)}>
                <SelectTrigger className="w-32">
                  <Download className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Exportar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="srt">SRT</SelectItem>
                  <SelectItem value="vtt">VTT</SelectItem>
                  <SelectItem value="txt">Texto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transcription Progress */}
          {isGeneratingTranscription && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generando transcripción automática...</span>
                <span>{Math.round(transcriptionProgress)}%</span>
              </div>
              <Progress value={transcriptionProgress} className="h-2" />
            </div>
          )}

          {/* Brand Alignment Summary */}
          {brandAlignment && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Alineación con BrandKit</h3>
                <Badge className={`${
                  brandAlignment.overallScore >= 85 ? 'bg-green-100 text-green-800' :
                  brandAlignment.overallScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {brandAlignment.overallScore}/100
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Tono</p>
                  <p className="font-medium">{brandAlignment.toneConsistency}/100</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Vocabulario</p>
                  <p className="font-medium">{brandAlignment.vocabularyAlignment}/100</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Claridad</p>
                  <p className="font-medium">{brandAlignment.messageClarity}/100</p>
                </div>
              </div>
              
              {brandAlignment.recommendations.length > 0 && (
                <div className="mt-3 space-y-1">
                  {brandAlignment.recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-blue-700">
                      <Lightbulb className="w-3 h-3" />
                      {rec}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Transcription Editor */}
        <div className="flex-1 flex flex-col">
          {/* Audio Player Controls */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayback}
                disabled={!recording?.audioFile}
              >
                {playbackState.isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => seekTo(Math.max(0, playbackState.currentTime - 10))}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => seekTo(playbackState.currentTime + 10)}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
              
              <div className="flex-1 flex items-center gap-2">
                <span className="text-sm font-mono">{formatTime(playbackState.currentTime)}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
                     onClick={(e) => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const x = e.clientX - rect.left;
                       const percent = x / rect.width;
                       seekTo(percent * playbackState.duration);
                     }}>
                  <div 
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${(playbackState.currentTime / playbackState.duration) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-mono">{formatTime(playbackState.duration)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <Slider
                  value={[playbackState.volume]}
                  onValueChange={(value) => setPlaybackState(prev => ({ ...prev, volume: value[0] }))}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-20"
                />
              </div>
              
              <Select 
                value={playbackState.playbackRate.toString()}
                onValueChange={(value) => setPlaybackState(prev => ({ ...prev, playbackRate: parseFloat(value) }))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar en transcripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Button
                variant={showBrandFlags ? "default" : "outline"}
                size="sm"
                onClick={() => setShowBrandFlags(!showBrandFlags)}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Flags de Marca
              </Button>
              
              {selectedSegments.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={mergeSelectedSegments}
                >
                  <Merge className="w-4 h-4 mr-2" />
                  Unir ({selectedSegments.length})
                </Button>
              )}
            </div>
          </div>

          {/* Transcript Segments */}
          <ScrollArea className="flex-1" ref={transcriptionScrollRef}>
            <div className="p-4 space-y-4">
              {filteredSegments.map((segment, index) => {
                const isCurrentSegment = playbackState.currentTime >= segment.startTime && 
                                       playbackState.currentTime <= segment.endTime;
                const isSelected = selectedSegments.includes(segment.id);
                const isEditing = editingSegmentId === segment.id;
                const hasFlags = segment.brandFlags.length > 0;

                return (
                  <Card 
                    key={segment.id}
                    id={`segment-${segment.id}`}
                    className={`p-4 transition-all ${
                      isCurrentSegment ? 'ring-2 ring-purple-500 bg-purple-50' : 
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 
                      hasFlags && showBrandFlags ? 'border-yellow-300 bg-yellow-50' : ''
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Segment Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSegmentSelection(segment.id, e.target.checked)}
                            className="rounded"
                          />
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => jumpToSegment(segment.id)}
                            className="text-xs"
                          >
                            {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                          </Button>
                          
                          {segment.speaker && (
                            <Badge variant="outline" className="text-xs">
                              {segment.speaker}
                            </Badge>
                          )}
                          
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              segment.confidence >= 0.9 ? 'bg-green-100 text-green-800' :
                              segment.confidence >= 0.8 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {Math.round(segment.confidence * 100)}%
                          </Badge>
                          
                          {segment.isEdited && (
                            <Badge variant="outline" className="text-xs">
                              Editado
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingSegment(segment.id)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => splitSegment(segment.id)}
                          >
                            <Split className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Segment Content */}
                      {isEditing ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="min-h-[80px]"
                            style={{
                              fontFamily: primaryFont?.font || 'Inter',
                              color: primaryColors[0]?.hex || undefined
                            }}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveSegmentEdit}>
                              <Save className="w-3 h-3 mr-1" />
                              Guardar
                            </Button>
                            <Button variant="outline" size="sm" onClick={cancelSegmentEdit}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p 
                          className="text-sm leading-relaxed cursor-pointer"
                          onClick={() => jumpToSegment(segment.id)}
                          style={{
                            fontFamily: primaryFont?.font || 'Inter',
                            color: primaryColors[0]?.hex || undefined
                          }}
                        >
                          {segment.text}
                        </p>
                      )}

                      {/* Brand Flags */}
                      {hasFlags && showBrandFlags && (
                        <div className="space-y-2">
                          {segment.brandFlags.map((flag, flagIndex) => (
                            <div key={flagIndex} className={`p-2 rounded-md text-xs flex items-start gap-2 ${
                              flag.severity === 'high' ? 'bg-red-50 text-red-800' :
                              flag.severity === 'medium' ? 'bg-yellow-50 text-yellow-800' :
                              'bg-blue-50 text-blue-800'
                            }`}>
                              <AlertTriangle className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                                flag.severity === 'high' ? 'text-red-600' :
                                flag.severity === 'medium' ? 'text-yellow-600' :
                                'text-blue-600'
                              }`} />
                              <div>
                                <p className="font-medium">{flag.type.replace('_', ' ')}</p>
                                <p className="opacity-90">{flag.suggestion}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Emotion Detection */}
                      {segment.emotions && (
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Emoción: {segment.emotions.primary}</span>
                          <span>Energía: {Math.round(segment.emotions.energy * 100)}%</span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Sidebar - Transcription Stats & Tools */}
        <div className="w-80 border-l bg-white overflow-auto">
          <div className="p-4 space-y-6">
            <h3 className="font-semibold">Herramientas de Edición</h3>

            {/* Transcription Stats */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">Estadísticas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Segmentos:</span>
                  <span>{segments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Palabras:</span>
                  <span>{transcription?.wordCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duración:</span>
                  <span>{formatTime(playbackState.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Precisión:</span>
                  <span>{Math.round((transcription?.confidence || 0) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Editados:</span>
                  <span>{segments.filter(s => s.isEdited).length}</span>
                </div>
              </div>
            </Card>

            {/* Brand Compliance */}
            {hasBrandKit && brandAlignment && (
              <Card className="p-4">
                <h4 className="font-medium mb-3">Cumplimiento de Marca</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Score General</span>
                    <Badge className={`${
                      brandAlignment.overallScore >= 85 ? 'bg-green-100 text-green-800' :
                      brandAlignment.overallScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {brandAlignment.overallScore}/100
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span>Tono consistente</span>
                        <span>{brandAlignment.toneConsistency}%</span>
                      </div>
                      <Progress value={brandAlignment.toneConsistency} className="h-1" />
                    </div>
                    
                    <div className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span>Vocabulario</span>
                        <span>{brandAlignment.vocabularyAlignment}%</span>
                      </div>
                      <Progress value={brandAlignment.vocabularyAlignment} className="h-1" />
                    </div>
                    
                    <div className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span>Claridad</span>
                        <span>{brandAlignment.messageClarity}%</span>
                      </div>
                      <Progress value={brandAlignment.messageClarity} className="h-1" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600">Flags encontrados:</p>
                    <div className="text-xs">
                      <span className="text-red-600">{segments.reduce((acc, s) => acc + s.brandFlags.filter(f => f.severity === 'high').length, 0)} críticos</span>
                      <span className="mx-2">•</span>
                      <span className="text-yellow-600">{segments.reduce((acc, s) => acc + s.brandFlags.filter(f => f.severity === 'medium').length, 0)} medios</span>
                      <span className="mx-2">•</span>
                      <span className="text-blue-600">{segments.reduce((acc, s) => acc + s.brandFlags.filter(f => f.severity === 'low').length, 0)} menores</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">Acciones Rápidas</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => validateBrandAlignment()}
                  disabled={isValidatingBrand}
                >
                  <Zap className="w-3 h-3 mr-2" />
                  Validar Marca
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => exportTranscription('txt')}
                >
                  <FileText className="w-3 h-3 mr-2" />
                  Exportar Texto
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setSelectedSegments(segments.map(s => s.id))}
                >
                  <Eye className="w-3 h-3 mr-2" />
                  Seleccionar Todo
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setSelectedSegments([])}
                >
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Limpiar Selección
                </Button>
              </div>
            </Card>

            {/* Voice Tone Guidance */}
            {hasVoiceTone && (
              <Card className="p-4 bg-green-50 border-green-200">
                <h4 className="font-medium mb-2 text-green-800">Tono de Marca</h4>
                <p className="text-sm text-green-700 mb-2">{voiceTone}</p>
                <p className="text-xs text-green-600">{voiceInstructions}</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 border-t bg-white">
        <div className="flex justify-between">
          <Button variant="outline" onClick={goToPreviousStep}>
            ← Volver a Grabación
          </Button>
          
          <Button 
            onClick={goToNextStep}
            disabled={!canContinue}
            className="bg-purple-500 hover:bg-purple-600"
          >
            Generar Highlights →
          </Button>
        </div>

        {!canContinue && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Espera a que la transcripción se complete
          </p>
        )}
      </div>

      {/* Hidden Audio Element */}
      {recording?.audioFile && (
        <audio
          ref={audioRef}
          src={typeof recording.audioFile === 'string' ? recording.audioFile : URL.createObjectURL(recording.audioFile)}
          onTimeUpdate={(e) => setPlaybackState(prev => ({ 
            ...prev, 
            currentTime: e.currentTarget.currentTime 
          }))}
          onLoadedMetadata={(e) => setPlaybackState(prev => ({ 
            ...prev, 
            duration: e.currentTarget.duration 
          }))}
          onEnded={() => setPlaybackState(prev => ({ ...prev, isPlaying: false }))}
        />
      )}
    </div>
  );
}