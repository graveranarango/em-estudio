import { useState, useRef, useEffect } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import { Slider } from "../../ui/slider";
import { useBrandKit, useBrandVoice } from "../../../contexts/BrandKitContext";
import { usePodcastProject } from "../../../contexts/PodcastProjectContext";
import { RecordingControls, LiveGuidanceState } from "../../../types/podcasts";
import { 
  Mic, 
  Video, 
  Upload, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Volume2,
  FileAudio,
  Camera,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Clock,
  Target,
  Zap
} from "lucide-react";

interface RecordingStats {
  duration: number;
  volume: number;
  quality: 'poor' | 'good' | 'excellent';
  fileSize: number;
}

export function RecordUploadStep() {
  const { hasBrandKit } = useBrandKit();
  const { voiceTone, instructions: voiceInstructions, hasVoiceTone } = useBrandVoice();
  const { currentProject, updateRecording, goToPreviousStep, goToNextStep } = usePodcastProject();
  
  const [recordingMethod, setRecordingMethod] = useState<'browser_audio' | 'browser_video' | 'upload_audio' | 'upload_video'>('browser_audio');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recordingStats, setRecordingStats] = useState<RecordingStats>({
    duration: 0,
    volume: 0,
    quality: 'good',
    fileSize: 0
  });
  
  const [liveGuidance, setLiveGuidance] = useState<LiveGuidanceState>({
    currentSegment: 0,
    suggestions: [],
    brandReminders: [],
    paceGuidance: 'good_pace',
    energyLevel: 'medium'
  });
  
  const [devicePermissions, setDevicePermissions] = useState({
    audio: false,
    video: false
  });
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const briefing = currentProject?.briefing;
  const targetDuration = briefing?.targetDuration.minutes || 30;
  const outline = briefing?.outline;

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Generate brand-aware live guidance
    if (hasVoiceTone && isRecording) {
      generateLiveGuidance();
    }
  }, [isRecording, currentTime, hasVoiceTone]);

  const generateLiveGuidance = () => {
    const currentSegmentIndex = Math.floor((currentTime / 60) / (targetDuration / (outline?.segments.length || 5)));
    const currentSegment = outline?.segments[currentSegmentIndex];
    
    const suggestions = [];
    const brandReminders = [];
    
    if (hasVoiceTone && voiceInstructions) {
      if (voiceTone === 'profesional') {
        brandReminders.push('Mantén un tono formal y estructurado');
        suggestions.push('Usa terminología técnica apropiada');
      } else if (voiceTone === 'cercano') {
        brandReminders.push('Conecta personalmente con la audiencia');
        suggestions.push('Comparte experiencias propias');
      } else if (voiceTone === 'motivacional') {
        brandReminders.push('Mantén energía alta y entusiasmo');
        suggestions.push('Usa frases inspiradoras');
      }
    }
    
    if (currentSegment) {
      suggestions.push(`Enfócate en: ${currentSegment.keyPoints[0]}`);
      if (currentTime > (currentSegmentIndex + 1) * (targetDuration / (outline?.segments.length || 5)) * 60) {
        suggestions.push('Es hora de transicionar al siguiente segmento');
      }
    }
    
    // Pace guidance based on target duration
    const progressPercent = (currentTime / 60) / targetDuration;
    const segmentProgress = currentSegmentIndex / (outline?.segments.length || 5);
    
    let paceGuidance: 'slow_down' | 'speed_up' | 'good_pace' = 'good_pace';
    if (progressPercent < segmentProgress - 0.1) {
      paceGuidance = 'speed_up';
      suggestions.push('Acelera un poco el ritmo');
    } else if (progressPercent > segmentProgress + 0.1) {
      paceGuidance = 'slow_down';
      suggestions.push('Tómate tu tiempo para desarrollar las ideas');
    }
    
    // Energy level detection (simulated)
    const energyLevel = volume > 0.7 ? 'high' : volume > 0.3 ? 'medium' : 'low';
    if (energyLevel === 'low') {
      suggestions.push('Aumenta la energía en tu voz');
    }

    setLiveGuidance({
      currentSegment: currentSegmentIndex,
      suggestions,
      brandReminders,
      paceGuidance,
      energyLevel
    });
  };

  const requestPermissions = async (video: boolean = false) => {
    try {
      const constraints = {
        audio: true,
        video: video
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      setDevicePermissions({
        audio: true,
        video: video
      });
      
      // Setup audio level monitoring
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      microphone.connect(analyser);
      
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average / 255);
        
        if (isRecording) {
          requestAnimationFrame(updateVolume);
        }
      };
      
      updateVolume();
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await requestPermissions(recordingMethod.includes('video'));
      
      const options = {
        mimeType: recordingMethod.includes('video') ? 'video/webm' : 'audio/webm'
      };
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      recordedChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: recordingMethod.includes('video') ? 'video/webm' : 'audio/webm'
        });
        
        const file = new File([blob], `recording.${recordingMethod.includes('video') ? 'webm' : 'webm'}`, {
          type: blob.type
        });
        
        updateRecording({
          status: 'completed',
          [recordingMethod.includes('video') ? 'videoFile' : 'audioFile']: file,
          duration: currentTime,
          metadata: {
            endTime: new Date(),
            fileSize: blob.size,
            environment: volume > 0.5 ? 'normal' : 'quiet'
          }
        });
      };
      
      mediaRecorderRef.current.start(1000); // Record in 1-second chunks
      setIsRecording(true);
      setCurrentTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
      
      updateRecording({
        status: 'recording',
        recordingMethod,
        metadata: {
          startTime: new Date()
        }
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      updateRecording({
        status: 'paused'
      });
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
      
      updateRecording({
        status: 'recording'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const resetRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsRecording(false);
    setIsPaused(false);
    setCurrentTime(0);
    recordedChunksRef.current = [];
    
    updateRecording({
      status: 'not_started',
      audioFile: undefined,
      videoFile: undefined,
      duration: undefined
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadedFile(file);
    setIsProcessingUpload(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessingUpload(false);
          
          // Update recording state with uploaded file
          updateRecording({
            status: 'uploaded',
            [file.type.startsWith('video/') ? 'videoFile' : 'audioFile']: file,
            recordingMethod: file.type.startsWith('video/') ? 'upload_video' : 'upload_audio',
            duration: 0, // Will be detected from file
            metadata: {
              fileSize: file.size,
              endTime: new Date()
            }
          });
          
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const canContinue = currentProject?.recording.status === 'completed' || currentProject?.recording.status === 'uploaded';

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-white">
            <Mic className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Grabación o Carga</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Graba tu contenido directamente o sube un archivo existente. Recibe guía en tiempo real para mantener coherencia con tu BrandKit.
        </p>
      </div>

      {/* Recording Method Selection */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Método de Grabación</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            className={`p-4 cursor-pointer transition-all ${
              recordingMethod === 'browser_audio' 
                ? 'ring-2 ring-purple-500 bg-purple-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setRecordingMethod('browser_audio')}
          >
            <div className="text-center space-y-2">
              <Mic className="w-6 h-6 mx-auto text-purple-600" />
              <h4 className="font-medium text-sm">Grabar Audio</h4>
              <p className="text-xs text-muted-foreground">Micrófono del navegador</p>
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-all ${
              recordingMethod === 'browser_video' 
                ? 'ring-2 ring-purple-500 bg-purple-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setRecordingMethod('browser_video')}
          >
            <div className="text-center space-y-2">
              <Video className="w-6 h-6 mx-auto text-purple-600" />
              <h4 className="font-medium text-sm">Grabar Video</h4>
              <p className="text-xs text-muted-foreground">Cámara + micrófono</p>
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-all ${
              recordingMethod === 'upload_audio' 
                ? 'ring-2 ring-purple-500 bg-purple-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setRecordingMethod('upload_audio')}
          >
            <div className="text-center space-y-2">
              <FileAudio className="w-6 h-6 mx-auto text-purple-600" />
              <h4 className="font-medium text-sm">Subir Audio</h4>
              <p className="text-xs text-muted-foreground">MP3, WAV, M4A</p>
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-all ${
              recordingMethod === 'upload_video' 
                ? 'ring-2 ring-purple-500 bg-purple-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setRecordingMethod('upload_video')}
          >
            <div className="text-center space-y-2">
              <Camera className="w-6 h-6 mx-auto text-purple-600" />
              <h4 className="font-medium text-sm">Subir Video</h4>
              <p className="text-xs text-muted-foreground">MP4, MOV, AVI</p>
            </div>
          </Card>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Recording/Upload Area */}
        <Card className="xl:col-span-2 p-6">
          {recordingMethod.startsWith('browser') ? (
            <div className="space-y-6">
              {/* Recording Interface */}
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                  {isRecording ? (
                    <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                  ) : (
                    <>
                      {recordingMethod === 'browser_video' ? (
                        <Video className="w-12 h-12 text-purple-600" />
                      ) : (
                        <Mic className="w-12 h-12 text-purple-600" />
                      )}
                    </>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {isRecording ? 'Grabando...' : 'Listo para grabar'}
                  </h3>
                  <p className="text-2xl font-mono font-bold text-purple-600">
                    {formatTime(currentTime)}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Objetivo: {targetDuration} minutos
                  </div>
                </div>
              </div>

              {/* Recording Controls */}
              <div className="flex justify-center gap-4">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="bg-red-500 hover:bg-red-600 px-8 py-3"
                    disabled={!devicePermissions.audio && recordingMethod.startsWith('browser')}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Iniciar Grabación
                  </Button>
                ) : (
                  <>
                    {!isPaused ? (
                      <Button
                        onClick={pauseRecording}
                        variant="outline"
                        className="px-6 py-3"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pausar
                      </Button>
                    ) : (
                      <Button
                        onClick={resumeRecording}
                        className="bg-green-500 hover:bg-green-600 px-6 py-3"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Reanudar
                      </Button>
                    )}
                    
                    <Button
                      onClick={stopRecording}
                      className="bg-blue-500 hover:bg-blue-600 px-6 py-3"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Finalizar
                    </Button>
                    
                    <Button
                      onClick={resetRecording}
                      variant="outline"
                      className="px-6 py-3"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reiniciar
                    </Button>
                  </>
                )}
              </div>

              {/* Volume Meter */}
              {(isRecording || devicePermissions.audio) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Nivel de Audio</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-100 ${
                        volume > 0.8 ? 'bg-red-500' : 
                        volume > 0.5 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {targetDuration > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progreso</span>
                    <span>{Math.round((currentTime / 60 / targetDuration) * 100)}%</span>
                  </div>
                  <Progress value={(currentTime / 60 / targetDuration) * 100} className="h-2" />
                </div>
              )}

              {/* Permissions Warning */}
              {!devicePermissions.audio && recordingMethod.startsWith('browser') && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Necesitamos acceso a tu {recordingMethod === 'browser_video' ? 'cámara y micrófono' : 'micrófono'} para grabar.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upload Interface */}
              <div className="text-center space-y-4 py-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                  {isProcessingUpload ? (
                    <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white animate-bounce" />
                    </div>
                  ) : (
                    <Upload className="w-12 h-12 text-purple-600" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {isProcessingUpload ? 'Procesando archivo...' : 'Subir archivo'}
                  </h3>
                  {uploadedFile && (
                    <p className="text-sm text-muted-foreground">
                      {uploadedFile.name} ({Math.round(uploadedFile.size / 1024 / 1024)} MB)
                    </p>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {isProcessingUpload && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Subiendo archivo</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Upload Button */}
              <div className="text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={recordingMethod === 'upload_video' ? 'video/*' : 'audio/*'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-purple-500 hover:bg-purple-600 px-8 py-3"
                  disabled={isProcessingUpload}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Seleccionar Archivo
                </Button>
              </div>

              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Formatos soportados: {recordingMethod === 'upload_video' ? 'MP4, MOV, AVI, WebM' : 'MP3, WAV, M4A, FLAC'}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Live Guidance Sidebar */}
        <Card className="p-6">
          <div className="space-y-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Guía en Tiempo Real
            </h3>

            {/* Brand Voice Guidance */}
            {hasBrandKit && hasVoiceTone && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Tono de Marca</h4>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">{voiceTone}</p>
                  <p className="text-xs text-green-700 mt-1">{voiceInstructions}</p>
                </div>
                
                {liveGuidance.brandReminders.length > 0 && (
                  <div className="space-y-1">
                    {liveGuidance.brandReminders.map((reminder, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-green-700">
                        <CheckCircle className="w-3 h-3" />
                        {reminder}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Current Segment */}
            {outline && outline.segments.length > 0 && isRecording && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Segmento Actual</h4>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    {outline.segments[liveGuidance.currentSegment]?.title || 'Introducción'}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {outline.segments[liveGuidance.currentSegment]?.description}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Puntos clave:</p>
                  {outline.segments[liveGuidance.currentSegment]?.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                      <Target className="w-3 h-3" />
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Suggestions */}
            {isRecording && liveGuidance.suggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Sugerencias</h4>
                <div className="space-y-2">
                  {liveGuidance.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded text-xs">
                      <Zap className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-yellow-800">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pace Guidance */}
            {isRecording && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Ritmo</h4>
                <div className={`p-3 rounded-lg ${
                  liveGuidance.paceGuidance === 'good_pace' ? 'bg-green-50' :
                  liveGuidance.paceGuidance === 'speed_up' ? 'bg-orange-50' :
                  'bg-blue-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${
                      liveGuidance.paceGuidance === 'good_pace' ? 'text-green-600' :
                      liveGuidance.paceGuidance === 'speed_up' ? 'text-orange-600' :
                      'text-blue-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      liveGuidance.paceGuidance === 'good_pace' ? 'text-green-800' :
                      liveGuidance.paceGuidance === 'speed_up' ? 'text-orange-800' :
                      'text-blue-800'
                    }`}>
                      {liveGuidance.paceGuidance === 'good_pace' ? 'Ritmo perfecto' :
                       liveGuidance.paceGuidance === 'speed_up' ? 'Acelera un poco' :
                       'Tómate tu tiempo'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Recording Stats */}
            {isRecording && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Estadísticas</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Energía:</span>
                    <Badge variant={
                      liveGuidance.energyLevel === 'high' ? 'default' :
                      liveGuidance.energyLevel === 'medium' ? 'secondary' :
                      'outline'
                    }>
                      {liveGuidance.energyLevel}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Calidad:</span>
                    <span className={getQualityColor(recordingStats.quality)}>
                      {recordingStats.quality}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Recording Status */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                {canContinue ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800">Grabación completada</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-800">
                      {isRecording ? 'Grabando...' : 'Sin grabación'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={goToPreviousStep}>
          ← Volver al Briefing
        </Button>
        
        <Button 
          onClick={goToNextStep}
          disabled={!canContinue}
          className="bg-purple-500 hover:bg-purple-600"
        >
          Generar Transcripción →
        </Button>
      </div>

      {!canContinue && (
        <p className="text-xs text-muted-foreground text-center">
          Completa la grabación o sube un archivo para continuar
        </p>
      )}
    </div>
  );
}