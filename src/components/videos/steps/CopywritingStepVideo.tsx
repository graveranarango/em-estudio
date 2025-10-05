import { useState, useEffect } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Textarea } from "../../ui/textarea";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { useBrandKit, useBrandVoice } from "../../../contexts/BrandKitContext";
import { useVideoProject } from "../../../contexts/VideoProjectContext";
import { VideoCopywriting, SubtitleSegment } from "../../../types/videos";
import { 
  FileText, 
  Sparkles, 
  Hash, 
  MessageSquare, 
  Copy,
  RefreshCw,
  Check,
  Subtitles,
  Volume2,
  Type,
  Mic
} from "lucide-react";

const TONE_OPTIONS = [
  { value: 'engaging', label: 'Atractivo', description: 'Capta la atención desde el inicio' },
  { value: 'educational', label: 'Educativo', description: 'Informativo y didáctico' },
  { value: 'entertaining', label: 'Entretenido', description: 'Divertido y dinámico' },
  { value: 'professional', label: 'Profesional', description: 'Formal y corporativo' },
  { value: 'inspirational', label: 'Inspiracional', description: 'Motivador y aspiracional' },
  { value: 'conversational', label: 'Conversacional', description: 'Cercano y directo' }
];

const VIDEO_HASHTAG_SUGGESTIONS = [
  '#video', '#content', '#creator', '#viral', '#trending', '#reel', '#short',
  '#tutorial', '#tips', '#howto', '#behind', '#process', '#brand', '#story'
];

export function CopywritingStepVideo() {
  const { hasBrandKit, getBrandInstructions } = useBrandKit();
  const { voiceTone, instructions: voiceInstructions, hasVoiceTone } = useBrandVoice();
  const { currentProject, updateCopywriting, goToPreviousStep, goToNextStep } = useVideoProject();
  
  const [caption, setCaption] = useState(currentProject?.copywriting.caption || '');
  const [title, setTitle] = useState(currentProject?.copywriting.title || '');
  const [description, setDescription] = useState(currentProject?.copywriting.description || '');
  const [hashtags, setHashtags] = useState<string[]>(currentProject?.copywriting.hashtags || []);
  const [callToAction, setCallToAction] = useState(currentProject?.copywriting.callToAction || '');
  const [selectedTone, setSelectedTone] = useState(currentProject?.copywriting.tone || 'engaging');
  const [customHashtag, setCustomHashtag] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [variations, setVariations] = useState<string[]>(currentProject?.copywriting.variations || []);
  const [transcript, setTranscript] = useState(currentProject?.copywriting.transcript || '');
  const [subtitles, setSubtitles] = useState<SubtitleSegment[]>(currentProject?.copywriting.subtitles || []);

  const briefing = currentProject?.briefing;
  const videoType = briefing?.videoType || 'reel';
  const platform = briefing?.platform || 'instagram';
  const duration = briefing?.duration?.target || 30;

  useEffect(() => {
    // Si hay BrandKit, aplicar el tono de voz automáticamente
    if (hasVoiceTone && voiceTone && !caption) {
      generateInitialCopy();
    }
  }, [hasVoiceTone, voiceTone]);

  const generateInitialCopy = async () => {
    if (!currentProject) return;

    setIsGenerating(true);
    
    try {
      let prompt = `Crea copy para ${videoType} de ${duration}s sobre: ${briefing?.description}`;
      
      if (hasBrandKit) {
        const brandInstructions = await getBrandInstructions('video');
        prompt += `\n\nAPLICAR TONO DE VOZ:\n${brandInstructions}`;
      }
      
      prompt += `\nPlataforma: ${platform}\nTono: ${selectedTone}`;
      
      // Simular generación de IA
      setTimeout(() => {
        const generatedContent = generateVideoContentByType();
        setCaption(generatedContent.caption);
        setTitle(generatedContent.title);
        setDescription(generatedContent.description);
        
        // Generar hashtags sugeridos
        const suggestedHashtags = generateHashtagsByVideoType();
        setHashtags(suggestedHashtags);
        
        // Generar CTA
        const cta = generateCallToActionForVideo();
        setCallToAction(cta);

        // Generar transcript y subtítulos
        generateTranscriptAndSubtitles();
        
        setIsGenerating(false);
      }, 2500);
    } catch (error) {
      console.error('Error generating video copy:', error);
      setIsGenerating(false);
    }
  };

  const generateVideoContentByType = () => {
    const description = briefing?.description || 'contenido increíble';
    const brandVoice = hasVoiceTone ? voiceInstructions : '';
    
    let content = {
      caption: '',
      title: '',
      description: ''
    };

    switch (videoType) {
      case 'reel':
      case 'short':
        content.caption = platform === 'tiktok' 
          ? `${description} ✨ ${brandVoice ? 'Con el estilo único de nuestra marca' : 'Dale like si te gustó'} 🔥`
          : `🎬 ${description}\n\n${brandVoice ? brandVoice.split('.')[0] : '¡No te pierdas este contenido!'} 💫`;
        content.title = `${description.split(' ').slice(0, 5).join(' ')}...`;
        content.description = `${description} ${brandVoice ? '- Contenido alineado con nuestra marca' : ''}`;
        break;

      case 'educational':
        content.caption = `📚 Aprende sobre ${description}\n\n${brandVoice || 'Contenido educativo de calidad'} 🎓`;
        content.title = `Tutorial: ${description}`;
        content.description = `Guía completa sobre ${description}. ${brandVoice ? brandVoice : 'Aprende paso a paso con ejemplos prácticos.'}`;
        break;

      case 'tutorial':
        content.caption = `🔧 Cómo hacer: ${description}\n\n${brandVoice || 'Sigue estos pasos'} ⚡`;
        content.title = `Tutorial: ${description}`;
        content.description = `Tutorial paso a paso: ${description}. ${brandVoice || 'Fácil de seguir y muy efectivo.'}`;
        break;

      case 'promotional':
        content.caption = `🚀 ${description}\n\n${brandVoice || 'No te lo pierdas'} 💎`;
        content.title = description;
        content.description = `${description} ${brandVoice ? '- Con la calidad que nos caracteriza' : ''}`;
        break;

      default:
        content.caption = `${description} ${brandVoice || ''}`;
        content.title = description;
        content.description = description;
    }
    
    return content;
  };

  const generateHashtagsByVideoType = () => {
    let suggested = [];
    
    // Hashtags específicos por tipo de video
    switch (videoType) {
      case 'reel':
        suggested.push('#reel', '#instagram', '#viral');
        break;
      case 'short':
        suggested.push('#shorts', '#youtube', '#tiktok');
        break;
      case 'educational':
        suggested.push('#tutorial', '#learn', '#education', '#tips');
        break;
      case 'tutorial':
        suggested.push('#howto', '#stepbystep', '#tutorial', '#guide');
        break;
      case 'promotional':
        suggested.push('#promo', '#launch', '#new', '#brand');
        break;
    }
    
    // Hashtags por plataforma
    if (platform === 'tiktok') {
      suggested.push('#fyp', '#foryoupage', '#trending');
    } else if (platform === 'instagram') {
      suggested.push('#explore', '#reelsinstagram', '#instagood');
    } else if (platform === 'youtube') {
      suggested.push('#youtubeshorts', '#youtube', '#subscribe');
    }
    
    // Completar con hashtags generales
    const general = VIDEO_HASHTAG_SUGGESTIONS.filter(h => !suggested.includes(h));
    suggested = [...suggested, ...general.slice(0, 8 - suggested.length)];
    
    return suggested.slice(0, 10);
  };

  const generateCallToActionForVideo = () => {
    const ctas = {
      reel: [
        '¡Dale like si te gustó! 💜',
        'Comparte con alguien que necesite verlo 🔄',
        'Sígueme para más contenido así ✨',
        'Cuéntame en los comentarios 👇'
      ],
      short: [
        '¡Suscríbete para más! 🔔',
        'Like si quieres la parte 2 👆',
        'Comenta tu opinión 💬',
        'Comparte si te ayudó 📤'
      ],
      educational: [
        '¿Te sirvió este tutorial? ¡Cuéntame! 📚',
        'Guarda este post para después 📌',
        'Sígueme para más tutoriales 🎓',
        '¿Qué tema quieres que cubra siguiente? 🤔'
      ],
      tutorial: [
        '¿Vas a intentarlo? ¡Etiquétame! 🏷️',
        'Muéstrame tu resultado en los comentarios 📸',
        'Like si te funcionó ✅',
        'Comparte con quien lo necesite 🤝'
      ],
      promotional: [
        '¡No te lo pierdas! Link en bio 🔗',
        'Comenta "YO" para más info 💬',
        'Dale like si te interesa 💖',
        'Comparte con tus amigos 👥'
      ]
    };
    
    const typeCtas = ctas[videoType as keyof typeof ctas] || ctas.reel;
    return typeCtas[Math.floor(Math.random() * typeCtas.length)];
  };

  const generateTranscriptAndSubtitles = () => {
    if (!briefing?.script) return;
    
    const script = briefing.script;
    setTranscript(script);
    
    // Generar subtítulos básicos dividiendo el script por tiempo
    const lines = script.split('\n').filter(line => line.trim());
    const timePerLine = duration / lines.length;
    
    const generatedSubtitles: SubtitleSegment[] = lines.map((line, index) => ({
      id: `sub_${index}`,
      startTime: index * timePerLine,
      endTime: (index + 1) * timePerLine,
      text: line.trim(),
      style: {
        fontSize: 24,
        fontFamily: 'Inter',
        fontWeight: '600',
        color: '#FFFFFF',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 8
      }
    }));
    
    setSubtitles(generatedSubtitles);
  };

  const regenerateCaption = async () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const newContent = generateVideoContentByType();
      setVariations(prev => [...prev, caption].filter(Boolean));
      setCaption(newContent.caption);
      setIsGenerating(false);
    }, 1500);
  };

  const addHashtag = () => {
    if (customHashtag.trim() && !hashtags.includes(customHashtag.trim())) {
      const newHashtag = customHashtag.startsWith('#') ? customHashtag : `#${customHashtag}`;
      setHashtags([...hashtags, newHashtag]);
      setCustomHashtag('');
    }
  };

  const removeHashtag = (hashtag: string) => {
    setHashtags(hashtags.filter(h => h !== hashtag));
  };

  const addSuggestedHashtag = (hashtag: string) => {
    if (!hashtags.includes(hashtag) && hashtags.length < 30) {
      setHashtags([...hashtags, hashtag]);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const copyFullVideoPost = () => {
    const fullText = `${title ? `${title}\n\n` : ''}${caption}\n\n${description ? `${description}\n\n` : ''}${callToAction}\n\n${hashtags.join(' ')}`;
    copyToClipboard(fullText, 'full');
  };

  const handleContinue = () => {
    const copywritingData: Partial<VideoCopywriting> = {
      caption,
      title,
      description,
      hashtags,
      callToAction,
      tone: selectedTone,
      transcript,
      subtitles,
      aiGenerated: true,
      variations
    };
    
    updateCopywriting(copywritingData);
    goToNextStep();
  };

  const canContinue = caption.trim().length > 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 text-white">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Copywriting del Video</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Genera el texto perfecto para tu video aplicando automáticamente tu tono de voz de marca
        </p>
      </div>

      {/* Brand Voice Status */}
      {hasBrandKit && hasVoiceTone && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <h3 className="font-medium">Tono de voz de marca activo</h3>
              <p className="text-sm text-green-700">{voiceInstructions}</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Aplicando automáticamente</Badge>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Configuration & Generation */}
        <Card className="p-6">
          <div className="space-y-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Configuración
            </h3>

            {/* Video Info */}
            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tipo:</span>
                <Badge variant="outline" className="capitalize">{videoType}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Plataforma:</span>
                <Badge variant="outline" className="capitalize">{platform}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Duración:</span>
                <Badge variant="outline">{duration}s</Badge>
              </div>
            </div>

            {/* Tone Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tono del Copy</label>
              <Select value={selectedTone} onValueChange={setSelectedTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map(tone => (
                    <SelectItem key={tone.value} value={tone.value}>
                      <div>
                        <p className="font-medium">{tone.label}</p>
                        <p className="text-xs text-muted-foreground">{tone.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasVoiceTone && (
                <p className="text-xs text-green-600">
                  ✓ Se aplicará tu tono de marca automáticamente
                </p>
              )}
            </div>

            {/* Generate Button */}
            <Button 
              onClick={generateInitialCopy} 
              disabled={isGenerating}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generar Copy IA
                </>
              )}
            </Button>

            {/* Transcript & Subtitles */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium flex items-center gap-2">
                <Subtitles className="w-4 h-4" />
                Transcripción
              </h4>
              <Textarea
                placeholder="Transcripción del video (se genera automáticamente del guion)..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[100px] font-mono text-sm"
              />
              
              {subtitles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Subtítulos generados: {subtitles.length}</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {subtitles.slice(0, 3).map((sub, index) => (
                      <div key={sub.id} className="text-xs p-2 bg-gray-50 rounded">
                        <span className="text-gray-500">{sub.startTime.toFixed(1)}s:</span> {sub.text}
                      </div>
                    ))}
                    {subtitles.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">+{subtitles.length - 3} subtítulos más</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Content Editor */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Contenido
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateCaption}
                disabled={isGenerating}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Regenerar
              </Button>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input
                placeholder="Título llamativo para el video..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Caption Principal</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(caption, 'caption')}
                >
                  {copiedText === 'caption' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <Textarea
                placeholder="Escribe tu caption aquí o genera uno con IA..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-[150px]"
                disabled={isGenerating}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{caption.length} caracteres</span>
                <span>Plataforma: {platform}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción (opcional)</label>
              <Textarea
                placeholder="Descripción más detallada para YouTube o LinkedIn..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Call to Action */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Call to Action</label>
              <Input
                placeholder="¿Qué quieres que hagan los viewers?"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
              />
            </div>

            {/* Previous Variations */}
            {variations.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Versiones anteriores</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {variations.map((variation, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm cursor-pointer hover:bg-gray-100"
                         onClick={() => setCaption(variation)}>
                      {variation.substring(0, 100)}...
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Hashtags & Actions */}
        <Card className="p-6">
          <div className="space-y-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Hashtags ({hashtags.length})
            </h3>

            {/* Add Custom Hashtag */}
            <div className="flex gap-2">
              <Input
                placeholder="Agregar hashtag..."
                value={customHashtag}
                onChange={(e) => setCustomHashtag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
              />
              <Button onClick={addHashtag} size="sm">
                Agregar
              </Button>
            </div>

            {/* Current Hashtags */}
            {hashtags.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Hashtags seleccionados</label>
                <div className="flex flex-wrap gap-1">
                  {hashtags.map(hashtag => (
                    <Badge 
                      key={hashtag} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeHashtag(hashtag)}
                    >
                      {hashtag} ×
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(hashtags.join(' '), 'hashtags')}
                  className="w-full"
                >
                  {copiedText === 'hashtags' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  Copiar hashtags
                </Button>
              </div>
            )}

            {/* Suggested Hashtags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sugerencias para {videoType}</label>
              <div className="flex flex-wrap gap-1">
                {VIDEO_HASHTAG_SUGGESTIONS
                  .filter(hashtag => !hashtags.includes(hashtag))
                  .slice(0, 8)
                  .map(hashtag => (
                    <Badge 
                      key={hashtag} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-red-50"
                      onClick={() => addSuggestedHashtag(hashtag)}
                    >
                      {hashtag} +
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Video Specific Actions */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm">Acciones</h4>
              
              <Button 
                onClick={copyFullVideoPost}
                variant="outline"
                className="w-full"
              >
                {copiedText === 'full' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar todo el contenido
                  </>
                )}
              </Button>

              {transcript && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(transcript, 'transcript')}
                  className="w-full"
                >
                  <Mic className="w-3 h-3 mr-2" />
                  Copiar transcripción
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={goToPreviousStep}>
          ← Volver a Edición
        </Button>
        
        <Button 
          onClick={handleContinue}
          disabled={!canContinue}
          className="bg-red-500 hover:bg-red-600"
        >
          Programar Video →
        </Button>
      </div>

      {!canContinue && (
        <p className="text-xs text-muted-foreground text-center">
          Completa al menos el caption para continuar
        </p>
      )}
    </div>
  );
}