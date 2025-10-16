import { useState } from 'react';
import { Send, ArrowLeft, CheckCircle, AlertTriangle, Copy, RotateCcw, Zap, MoreHorizontal, Globe } from 'lucide-react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { ScrollArea } from '../../ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { usePostProject } from '../../../contexts/PostProjectContext';

interface ChatBubbleProps {
  type: 'system' | 'user' | 'assistant';
  content: string;
  meta?: string;
}

const ChatBubble = ({ type, content, meta }: ChatBubbleProps) => {
  const bubbleStyles = {
    system: 'bg-bubble-system text-yellow-800 mx-2 sm:mx-4',
    user: 'bg-bubble-user text-white ml-auto mr-2 sm:mr-4 max-w-[85%] sm:max-w-[80%]',
    assistant: 'bg-bubble-assistant text-gray-700 mr-auto ml-2 sm:ml-4 max-w-[85%] sm:max-w-[80%]'
  };

  return (
    <div className={`rounded-xl px-3 py-2 text-sm ${bubbleStyles[type]}`}>
      <p>{content}</p>
      {meta && (
        <div className="text-xs opacity-70 mt-1">
          {meta}
        </div>
      )}
    </div>
  );
};

interface TagInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const TagInput = ({ label, placeholder, value, onChange }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const tags = value ? value.split(' ').filter(tag => tag.trim() !== '') : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (inputValue.trim()) {
        const newTag = inputValue.startsWith('#') ? inputValue : `#${inputValue.trim()}`;
        const newTags = [...tags, newTag];
        onChange(newTags.join(' '));
        setInputValue('');
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(newTags.join(' '));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="space-y-2">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeTag(index)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
        )}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="text-sm"
        />
      </div>
    </div>
  );
};

export default function CaptionHashtagsStep() {
  const { goToPreviousStep, goToNextStep } = usePostProject();
  
  // Estado del chat
  const [chatInput, setChatInput] = useState('');
  const [chatMessages] = useState([
    {
      type: 'system' as const,
      content: 'Vamos a trabajar el caption y hashtags de tu post.',
      meta: undefined
    },
    {
      type: 'user' as const,
      content: 'Quiero un copy corto y directo para Instagram.',
      meta: '10:24'
    },
    {
      type: 'assistant' as const,
      content: 'Sugerencia: \'¡Tu mejor versión empieza hoy! ✨ #Bienestar #Motivación\'',
      meta: '10:25'
    }
  ]);

  // Estado del panel de caption
  const [caption, setCaption] = useState('');
  const [cta, setCta] = useState('');
  const [hashtags, setHashtags] = useState('');

  // Variaciones sugeridas
  const suggestedVariations = [
    'Descubre tu mejor versión. #Bienestar #Motivación',
    '¡Empieza hoy, hazlo tuyo! ✨ #Salud #Inspiración',
    'Cada día cuenta. Da el paso. #Crecimiento #Éxito'
  ];

  // Validaciones de Brand Guard (simuladas)
  const brandValidations = [
    { icon: 'check', color: 'green', message: 'Caption dentro del tono de marca' },
    { icon: 'warning', color: 'amber', message: 'Hashtag duplicado detectado (#Éxito)' },
    { icon: 'check', color: 'green', message: 'Longitud adecuada (menos de 2200)' },
    { icon: 'warning', color: 'amber', message: 'Uso excesivo de \'!\' (3 veces)' }
  ];

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    console.log('Send message:', chatInput);
    setChatInput('');
  };

  const handleContinue = () => {
    console.log('Continue to next step');
    goToNextStep();
  };

  const handleCopyVariation = (variation: string) => {
    navigator.clipboard.writeText(variation);
    console.log('Copied variation:', variation);
  };

  const handleApplyVariation = (variation: string) => {
    // Separar caption y hashtags de la variación
    const parts = variation.split(' #');
    const newCaption = parts[0];
    const newHashtags = parts.length > 1 ? '#' + parts.slice(1).join(' #') : '';
    
    setCaption(newCaption);
    if (newHashtags) {
      setHashtags(newHashtags);
    }
    console.log('Applied variation:', { caption: newCaption, hashtags: newHashtags });
  };

  const handleApplySuggestion = () => {
    console.log('Apply Brand Guard suggestion');
    // Aquí se implementaría la lógica para aplicar las sugerencias de Brand Guard
  };

  const handleViewDetail = () => {
    console.log('View Brand Guard detail');
    // Aquí se abriría un modal o panel con detalles de las validaciones
  };

  // Quick Actions handlers
  const handleSimplify = () => {
    console.log('Simplify caption');
    // Implementaría lógica para simplificar el texto
  };

  const handleMakeShorter = () => {
    console.log('Make caption shorter');
    // Implementaría lógica para acortar el texto
  };

  const handleMakeLonger = () => {
    console.log('Make caption longer');
    // Implementaría lógica para alargar el texto
  };

  const handleTranslate = () => {
    console.log('Translate caption');
    // Implementaría lógica para traducir el texto
  };

  const handleRegenerateCopy = () => {
    console.log('Regenerate copy');
    // Implementaría lógica para regenerar el copy
  };

  const isComplete = caption.trim() !== '' && hashtags.trim() !== '';

  return (
    <div className="h-full flex flex-col lg:flex-row bg-surface">
      {/* Chat Column */}
      <div className="w-full lg:w-[840px] bg-surface flex flex-col border-b lg:border-b-0 lg:border-r border-border">
        {/* Chat Header */}
        <div className="h-11 flex items-center px-3 bg-surface-elev-1 border-b border-border">
          <span className="text-sm font-semibold text-foreground">Chat con ChatGPT-5 (Copywriting)</span>
        </div>

        {/* Chat Timeline */}
        <ScrollArea className="flex-1 p-2 sm:p-3 min-h-[200px] lg:min-h-0">
          <div className="space-y-2">
            {chatMessages.map((message, index) => (
              <ChatBubble
                key={index}
                type={message.type}
                content={message.content}
                meta={message.meta}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Chat Composer */}
        <div className="h-25 p-2 bg-surface border-t border-border shadow-sm">
          <div className="space-y-2">
            <Textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Escribe tu respuesta o feedback…"
              className="min-h-[60px] text-sm resize-none bg-surface border border-border rounded-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              size="sm"
              className="w-full text-xs h-8"
            >
              <Send className="w-3 h-3 mr-1" />
              Enviar
            </Button>
          </div>
        </div>
      </div>

      {/* Panel Caption */}
      <div className="w-full lg:w-[600px] bg-surface-elev-1 lg:border-l border-border flex flex-col">
        {/* Panel Header */}
        <div className="h-11 flex items-center justify-between px-3 bg-surface border-b border-border">
          <span className="text-sm font-semibold text-foreground">Caption & Hashtags</span>
          <Badge variant="secondary" className="text-xs">
            {isComplete ? 'Completo' : 'Incompleto'}
          </Badge>
        </div>

        {/* Panel Body */}
        <ScrollArea className="flex-1 p-3 sm:p-4 min-h-[400px] lg:min-h-0">
          <div className="space-y-4">
            {/* Caption Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Caption principal</label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Escribe o edita aquí el texto final…"
                className="min-h-[100px] text-sm resize-none"
              />
            </div>

            {/* CTA Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Call to Action (CTA)</label>
              <Input
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                placeholder="Ej.: Compra ahora"
                className="text-sm"
              />
            </div>

            {/* Hashtags Field */}
            <TagInput
              label="Hashtags"
              placeholder="#ejemplo #marca #post"
              value={hashtags}
              onChange={setHashtags}
            />

            {/* Section: Contadores */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <Badge variant="secondary" className="text-xs font-mono px-3 py-1 h-6 justify-center">
                {caption.length} / 2200 caracteres
              </Badge>
              <Badge variant="secondary" className="text-xs font-mono px-3 py-1 h-6 justify-center">
                {hashtags ? hashtags.split(' ').filter(tag => tag.trim() !== '').length : 0} / 30 hashtags
              </Badge>
            </div>

            {/* Section: Variaciones sugeridas */}
            <Card className="shadow-xs border border-border bg-card">
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-sm font-medium">Variaciones sugeridas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-3 pb-3">
                {suggestedVariations.map((variation, index) => (
                  <div key={index} className="flex items-start justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-xs leading-relaxed">
                    <span className="flex-1 pr-2">
                      {index + 1}. '{variation}'
                    </span>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0 opacity-60 hover:opacity-100"
                        onClick={() => handleCopyVariation(variation)}
                        title="Copiar variación"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0 opacity-60 hover:opacity-100"
                        onClick={() => handleApplyVariation(variation)}
                        title="Aplicar variación"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Section: Brand Guard Validaciones */}
            <Card className="shadow-xs border border-border bg-card">
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-sm font-medium">Validaciones de marca</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-3 pb-3">
                {/* Lista de validaciones */}
                <div className="space-y-1.5">
                  {brandValidations.map((validation, index) => (
                    <div key={index} className="flex items-center gap-2 h-8">
                      {validation.icon === 'check' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span className="text-xs text-foreground">{validation.message}</span>
                    </div>
                  ))}
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-2 pt-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7"
                    onClick={handleViewDetail}
                  >
                    Ver detalle
                  </Button>
                  <Button 
                    size="sm" 
                    className="text-xs h-7 bg-purple-500 hover:bg-purple-600"
                    onClick={handleApplySuggestion}
                  >
                    Aplicar sugerencia
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Section: Acciones Rápidas */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 px-2"
                onClick={handleSimplify}
              >
                Simplificar
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 px-2"
                onClick={handleMakeShorter}
              >
                Más corto
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 px-2"
                onClick={handleMakeLonger}
              >
                Más largo
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 px-2"
                onClick={handleTranslate}
              >
                Traducir
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="text-xs h-7 px-2"
                onClick={handleRegenerateCopy}
              >
                Regenerar copy
              </Button>
            </div>

            {/* Section: Checklist Final */}
            <Card className="shadow-sm border border-border bg-card">
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-sm font-medium">Checklist final</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 px-3 pb-3">
                <div className="flex items-center gap-2 h-8">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs text-foreground">Caption completado y alineado a marca</span>
                </div>
                <div className="flex items-center gap-2 h-8">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs text-foreground">CTA definido</span>
                </div>
                <div className="flex items-center gap-2 h-8">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs text-foreground">Hashtags validados (sin duplicados prohibidos)</span>
                </div>
                <div className="flex items-center gap-2 h-8">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs text-foreground">Validaciones de BrandGuard aprobadas</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Panel Footer */}
        <div className="h-auto sm:h-12 flex flex-col sm:flex-row items-center justify-between px-3 py-2 sm:py-0 bg-surface border-t border-border gap-2 sm:gap-0">
          <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600 text-white order-2 sm:order-1">
            Caption listo ✅
          </Badge>
          
          <div className="flex-1 order-3 sm:order-2"></div>
          
          <Button 
            onClick={handleContinue}
            className="text-xs bg-purple-500 hover:bg-purple-600 w-full sm:w-auto order-1 sm:order-3"
            disabled={!isComplete}
          >
            <span className="hidden sm:inline">Continuar: Calendarización</span>
            <span className="sm:hidden">Siguiente: Calendarización</span>
          </Button>
        </div>
      </div>
    </div>
  );
}