import { useState, useEffect } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Textarea } from "../../ui/textarea";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Slider } from "../../ui/slider";
import { useBrandKit, useBrandVoice } from "../../../contexts/BrandKitContext";
import { usePostProject } from "../../../contexts/PostProjectContext";
import { PostCopywriting } from "../../../types/posts";
import { 
  FileText, 
  Sparkles, 
  Hash, 
  MessageSquare, 
  Copy,
  RefreshCw,
  Check,
  Target,
  Users,
  Volume2
} from "lucide-react";

const TONE_OPTIONS = [
  { value: 'professional', label: 'Profesional', description: 'Formal y corporativo' },
  { value: 'friendly', label: 'Amigable', description: 'Cercano y accesible' },
  { value: 'energetic', label: 'Energético', description: 'Dinámico y motivador' },
  { value: 'educational', label: 'Educativo', description: 'Informativo y didáctico' },
  { value: 'playful', label: 'Divertido', description: 'Casual y entretenido' },
  { value: 'inspirational', label: 'Inspiracional', description: 'Motivador y aspiracional' }
];

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Corto', description: '1-2 frases', chars: 100 },
  { value: 'medium', label: 'Medio', description: '3-5 frases', chars: 300 },
  { value: 'long', label: 'Largo', description: '6+ frases', chars: 500 }
];

const HASHTAG_SUGGESTIONS = [
  '#marketing', '#design', '#branding', '#business', '#entrepreneur',
  '#creativity', '#innovation', '#inspiration', '#success', '#growth',
  '#digitalmarketing', '#socialmedia', '#content', '#strategy'
];

export function CopywritingStep() {
  const { hasBrandKit, getBrandInstructions } = useBrandKit();
  const { voiceTone, instructions: voiceInstructions, hasVoiceTone } = useBrandVoice();
  const { currentProject, updateCopywriting, goToPreviousStep, goToNextStep } = usePostProject();
  
  const [caption, setCaption] = useState(currentProject?.copywriting.caption || '');
  const [hashtags, setHashtags] = useState<string[]>(currentProject?.copywriting.hashtags || []);
  const [callToAction, setCallToAction] = useState(currentProject?.copywriting.callToAction || '');
  const [selectedTone, setSelectedTone] = useState(currentProject?.copywriting.tone || 'professional');
  const [selectedLength, setSelectedLength] = useState<'short' | 'medium' | 'long'>(
    currentProject?.copywriting.length || 'medium'
  );
  const [customHashtag, setCustomHashtag] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [variations, setVariations] = useState<string[]>(currentProject?.copywriting.variations || []);

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
      let prompt = `Crea un caption para ${currentProject.type === 'post' ? 'post' : 'carrusel'} de redes sociales sobre: ${currentProject.briefing.description}`;
      
      if (hasBrandKit) {
        const brandInstructions = await getBrandInstructions('post');
        prompt += `\n\nAPLICAR TONO DE VOZ:\n${brandInstructions}`;
      }
      
      prompt += `\nTono: ${selectedTone}\nLongitud: ${selectedLength}`;
      
      // Simular generación de IA
      setTimeout(() => {
        const generatedCaption = generateCaptionByTone();
        setCaption(generatedCaption);
        
        // Generar hashtags sugeridos
        const suggestedHashtags = generateHashtagsByContext();
        setHashtags(suggestedHashtags);
        
        // Generar CTA
        const cta = generateCallToAction();
        setCallToAction(cta);
        
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('Error generating copy:', error);
      setIsGenerating(false);
    }
  };

  const generateCaptionByTone = () => {
    const description = currentProject?.briefing.description || 'contenido increíble';
    const brandVoice = hasVoiceTone ? voiceInstructions : '';
    
    const baseCaptions = {
      professional: `Presentamos ${description}. Una solución innovadora que transforma la manera en que trabajas. ${brandVoice}`,
      friendly: `¡Hola! 👋 Queremos compartir contigo ${description}. Estamos seguros de que te va a encantar. ${brandVoice}`,
      energetic: `🚀 ¡INCREÍBLE! ${description} está aquí y va a cambiar todo. ¿Estás listo para esta experiencia? ${brandVoice}`,
      educational: `Hoy aprenderemos sobre ${description}. Te explicamos paso a paso todo lo que necesitas saber. ${brandVoice}`,
      playful: `¿Sabías que ${description}? 🤔 ¡Prepárate para sorprenderte! Esto va a ser súper divertido. ${brandVoice}`,
      inspirational: `El cambio comienza con ${description}. Cada gran transformación empieza con un primer paso. ${brandVoice}`
    };
    
    let baseCaption = baseCaptions[selectedTone as keyof typeof baseCaptions] || baseCaptions.professional;
    
    // Ajustar longitud
    if (selectedLength === 'short') {
      baseCaption = baseCaption.split('.')[0] + '.';
    } else if (selectedLength === 'long') {
      baseCaption += ' Descubre más en nuestros comentarios y comparte tu experiencia con nosotros.';
    }
    
    return baseCaption.trim();
  };

  const generateHashtagsByContext = () => {
    const description = currentProject?.briefing.description || '';
    const platform = currentProject?.configuration.primaryPlatform || 'instagram';
    
    let suggested = [];
    
    // Hashtags basados en el contenido
    if (description.toLowerCase().includes('producto')) {
      suggested.push('#producto', '#novedad', '#lanzamiento');
    }
    if (description.toLowerCase().includes('servicio')) {
      suggested.push('#servicio', '#calidad', '#experiencia');
    }
    if (description.toLowerCase().includes('marca')) {
      suggested.push('#branding', '#marca', '#identidad');
    }
    
    // Hashtags basados en la plataforma
    if (platform === 'instagram') {
      suggested.push('#instagram', '#insta', '#igdaily');
    } else if (platform === 'linkedin') {
      suggested.push('#linkedin', '#business', '#professional');
    }
    
    // Completar con hashtags generales
    const general = ['#marketing', '#design', '#innovation', '#success'];
    suggested = [...suggested, ...general].slice(0, 8);
    
    return suggested;
  };

  const generateCallToAction = () => {
    const ctas = [
      '¿Qué opinas? ¡Cuéntanos en los comentarios!',
      'Comparte este post si te parece útil 🔄',
      'Etiqueta a alguien que necesite ver esto 👇',
      'Guarda este post para más tarde 💾',
      'Síguenos para más contenido como este ✨'
    ];
    
    return ctas[Math.floor(Math.random() * ctas.length)];
  };

  const regenerateCaption = async () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const newCaption = generateCaptionByTone();
      setVariations(prev => [...prev, caption].filter(Boolean));
      setCaption(newCaption);
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
    if (!hashtags.includes(hashtag) && hashtags.length < 20) {
      setHashtags([...hashtags, hashtag]);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const copyFullPost = () => {
    const fullText = `${caption}\n\n${callToAction}\n\n${hashtags.join(' ')}`;
    copyToClipboard(fullText, 'full');
  };

  const handleContinue = () => {
    const copywritingData: Partial<PostCopywriting> = {
      caption,
      hashtags,
      callToAction,
      tone: selectedTone,
      length: selectedLength,
      aiGenerated: true,
      variations
    };
    
    updateCopywriting(copywritingData);
    goToNextStep();
  };

  const canContinue = caption.trim().length > 0;
  const maxLength = LENGTH_OPTIONS.find(l => l.value === selectedLength)?.chars || 300;
  const isOverLimit = caption.length > maxLength;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Copywriting</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Genera el texto perfecto para tu publicación aplicando automáticamente tu tono de voz de marca
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <Card className="p-6">
          <div className="space-y-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Configuración
            </h3>

            {/* Tone Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tono</label>
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

            {/* Length Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Longitud</label>
              <Select value={selectedLength} onValueChange={(value: 'short' | 'medium' | 'long') => setSelectedLength(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LENGTH_OPTIONS.map(length => (
                    <SelectItem key={length.value} value={length.value}>
                      <div>
                        <p className="font-medium">{length.label}</p>
                        <p className="text-xs text-muted-foreground">{length.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Audience Reminder */}
            {currentProject?.briefing.targetAudience && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Audiencia objetivo</span>
                </div>
                <p className="text-sm text-blue-700">{currentProject.briefing.targetAudience}</p>
              </div>
            )}

            {/* Generate Button */}
            <Button 
              onClick={generateInitialCopy} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generar con IA
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Caption Editor */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Caption
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerateCaption}
                  disabled={isGenerating}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Regenerar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(caption, 'caption')}
                >
                  {copiedText === 'caption' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            {/* Caption Input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Escribe tu caption aquí o genera uno con IA..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-[200px]"
                disabled={isGenerating}
              />
              <div className="flex justify-between text-xs">
                <span className={isOverLimit ? 'text-red-600' : 'text-muted-foreground'}>
                  {caption.length} / {maxLength} caracteres
                </span>
                <span className="text-muted-foreground">
                  {selectedLength}
                </span>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Call to Action</label>
              <Input
                placeholder="¿Qué quieres que hagan tus seguidores?"
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

        {/* Hashtags */}
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
              <label className="text-sm font-medium">Sugerencias</label>
              <div className="flex flex-wrap gap-1">
                {HASHTAG_SUGGESTIONS
                  .filter(hashtag => !hashtags.includes(hashtag))
                  .slice(0, 10)
                  .map(hashtag => (
                    <Badge 
                      key={hashtag} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-blue-50"
                      onClick={() => addSuggestedHashtag(hashtag)}
                    >
                      {hashtag} +
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Full Post Copy */}
            <div className="pt-4 border-t">
              <Button 
                onClick={copyFullPost}
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
                    Copiar post completo
                  </>
                )}
              </Button>
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
          disabled={!canContinue || isOverLimit}
          className="bg-indigo-500 hover:bg-indigo-600"
        >
          Programar Publicación →
        </Button>
      </div>

      {(!canContinue || isOverLimit) && (
        <p className="text-xs text-muted-foreground text-center">
          {!canContinue 
            ? 'Escribe un caption para continuar' 
            : 'El caption excede el límite de caracteres'
          }
        </p>
      )}
    </div>
  );
}