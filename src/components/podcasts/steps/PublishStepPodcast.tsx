import { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Calendar } from "../../ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Checkbox } from "../../ui/checkbox";
import { useBrandKit, useBrandVoice } from "../../../contexts/BrandKitContext";
import { usePodcastProject } from "../../../contexts/PodcastProjectContext";
import { PodcastPublishingPlatform, ClipPublishingPlatform, SocialPlatform } from "../../../types/podcasts";
import { 
  Send, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle,
  Mic, 
  Youtube,
  Linkedin,
  Instagram,
  Twitter,
  Globe,
  Save,
  Zap,
  RefreshCw,
  Sparkles,
  Download,
  Share,
  BarChart3,
  Headphones,
  Play,
  Link,
  Copy,
  Eye
} from "lucide-react";

const PODCAST_PLATFORM_OPTIONS = [
  { value: 'spotify', label: 'Spotify', icon: Headphones, color: 'from-green-500 to-green-600', description: 'Plataforma líder de podcasts' },
  { value: 'apple_podcasts', label: 'Apple Podcasts', icon: Play, color: 'from-purple-500 to-purple-600', description: 'Ecosistema Apple' },
  { value: 'google_podcasts', label: 'Google Podcasts', icon: Headphones, color: 'from-blue-500 to-blue-600', description: 'Búsqueda y descubrimiento' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-600', description: 'Video podcast + audiencia amplia' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'from-blue-600 to-blue-700', description: 'Audiencia profesional' },
  { value: 'website', label: 'Mi Website', icon: Globe, color: 'from-gray-500 to-gray-600', description: 'Control total de la distribución' }
];

const CLIP_PLATFORM_OPTIONS = [
  { value: 'instagram_reel', label: 'Instagram Reels', icon: Instagram, color: 'from-pink-500 to-purple-600' },
  { value: 'tiktok', label: 'TikTok', icon: Play, color: 'from-black to-gray-800' },
  { value: 'youtube_shorts', label: 'YouTube Shorts', icon: Youtube, color: 'from-red-500 to-red-600' },
  { value: 'linkedin_video', label: 'LinkedIn Video', icon: Linkedin, color: 'from-blue-600 to-blue-700' },
  { value: 'twitter_video', label: 'Twitter Video', icon: Twitter, color: 'from-blue-400 to-blue-500' }
];

const PODCAST_CATEGORIES = [
  'Technology', 'Business', 'Education', 'Health & Fitness', 'Arts', 'Comedy',
  'News', 'Science', 'Society & Culture', 'Sports', 'True Crime', 'Fiction'
];

export function PublishStepPodcast() {
  const { hasBrandKit } = useBrandKit();
  const { voiceTone, instructions: voiceInstructions, hasVoiceTone } = useBrandVoice();
  const { currentProject, updateProject, saveProject } = usePodcastProject();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [publishingMode, setPublishingMode] = useState<'now' | 'schedule' | 'draft'>('schedule');
  
  // Podcast metadata
  const [title, setTitle] = useState(currentProject?.title || '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isExplicit, setIsExplicit] = useState(false);
  const [episodeNumber, setEpisodeNumber] = useState<number>();
  const [seasonNumber, setSeasonNumber] = useState<number>();
  const [seriesName, setSeriesName] = useState('');
  
  // Publishing platforms
  const [podcastPlatforms, setPodcastPlatforms] = useState<PodcastPublishingPlatform[]>([
    { platform: 'spotify', status: 'pending' },
    { platform: 'youtube', status: 'pending' }
  ]);
  
  const [clipsPlatforms, setClipsPlatforms] = useState<ClipPublishingPlatform[]>([
    { platform: 'instagram_reel', clipIds: [], scheduledTimes: [], status: 'pending' },
    { platform: 'tiktok', clipIds: [], scheduledTimes: [], status: 'pending' }
  ]);
  
  // Distribution settings
  const [enableRSS, setEnableRSS] = useState(true);
  const [enableEmbedCode, setEnableEmbedCode] = useState(true);
  const [enableDownloadLink, setEnableDownloadLink] = useState(true);
  const [enableSocialSharing, setEnableSocialSharing] = useState(true);
  const [enableAnalytics, setEnableAnalytics] = useState(true);
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingProgress, setPublishingProgress] = useState(0);
  const [campaignName, setCampaignName] = useState('');

  const briefing = currentProject?.briefing;
  const highlights = currentProject?.highlights || [];
  const clips = currentProject?.clips || [];
  const recording = currentProject?.recording;
  const transcription = currentProject?.transcription;

  const handlePodcastPlatformToggle = (platform: string) => {
    const exists = podcastPlatforms.find(p => p.platform === platform);
    
    if (exists) {
      setPodcastPlatforms(podcastPlatforms.filter(p => p.platform !== platform));
    } else {
      setPodcastPlatforms([
        ...podcastPlatforms,
        { platform: platform as any, status: 'pending' }
      ]);
    }
  };

  const handleClipPlatformToggle = (platform: SocialPlatform) => {
    const exists = clipsPlatforms.find(p => p.platform === platform);
    const availableClips = clips.filter(c => c.platform === platform && c.status === 'ready');
    
    if (exists) {
      setClipsPlatforms(clipsPlatforms.filter(p => p.platform !== platform));
    } else {
      setClipsPlatforms([
        ...clipsPlatforms,
        { 
          platform, 
          clipIds: availableClips.map(c => c.id),
          scheduledTimes: availableClips.map(() => selectedDate),
          status: 'pending'
        }
      ]);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const generateSEODescription = async () => {
    // Generate SEO-optimized description based on transcription and brand voice
    let generatedDescription = '';
    
    if (briefing?.description) {
      generatedDescription = `En este episodio exploramos ${briefing.description.toLowerCase()}. `;
    }
    
    if (briefing?.keyMessages.length) {
      generatedDescription += `Puntos clave: ${briefing.keyMessages.slice(0, 3).join(', ')}. `;
    }
    
    if (hasVoiceTone) {
      generatedDescription += `Contenido presentado con un enfoque ${voiceTone}. `;
    }
    
    if (highlights.length > 0) {
      const topHighlight = highlights.sort((a, b) => b.score - a.score)[0];
      generatedDescription += `Highlight: ${topHighlight.description}`;
    }
    
    setDescription(generatedDescription);
  };

  const handlePublish = async () => {
    if (!currentProject) return;

    setIsPublishing(true);
    setPublishingProgress(0);

    try {
      const scheduledDate = publishingMode === 'schedule' 
        ? new Date(`${selectedDate.toDateString()} ${selectedTime}`)
        : publishingMode === 'now'
          ? new Date()
          : undefined;

      // Update project with publishing information
      updateProject({
        title,
        publishing: {
          podcastPlatforms: podcastPlatforms.map(p => ({
            ...p,
            customTitle: title,
            customDescription: description,
            customTags: tags,
            scheduledTime: scheduledDate
          })),
          clipsPlatforms: clipsPlatforms.map(p => ({
            ...p,
            scheduledTimes: scheduledDate ? [scheduledDate] : [],
            campaignName: campaignName || title
          })),
          scheduledDate,
          status: publishingMode === 'draft' ? 'draft' : publishingMode === 'now' ? 'publishing' : 'scheduled',
          metadata: {
            category,
            tags,
            language: 'es',
            isExplicit,
            episode: episodeNumber,
            season: seasonNumber,
            series: seriesName
          },
          distribution: {
            rss: enableRSS,
            embedCode: enableEmbedCode,
            downloadLink: enableDownloadLink,
            socialSharing: enableSocialSharing,
            analytics: enableAnalytics
          }
        }
      });

      // Simulate publishing progress
      const stages = [
        'Preparando archivos de audio...',
        'Optimizando calidad...',
        'Generando metadatos...',
        'Aplicando BrandKit a clips...',
        'Subiendo a plataformas principales...',
        'Programando clips en redes sociales...',
        'Configurando distribución RSS...',
        'Activando analytics...',
        'Finalizando publicación...'
      ];

      for (let i = 0; i < stages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPublishingProgress(((i + 1) / stages.length) * 100);
      }

      // Save project
      await saveProject();

      // Update platform statuses
      setPodcastPlatforms(platforms =>
        platforms.map(p => ({
          ...p,
          status: publishingMode === 'now' ? 'published' : 'scheduled',
          publishedUrl: `https://${p.platform}.com/podcast/${currentProject.id}`
        }))
      );

      setClipsPlatforms(platforms =>
        platforms.map(p => ({
          ...p,
          status: publishingMode === 'now' ? 'published' : 'scheduled'
        }))
      );

      setIsPublishing(false);

    } catch (error) {
      console.error('Error publishing podcast:', error);
      setIsPublishing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const canPublish = title.trim() && description.trim() && 
    (podcastPlatforms.length > 0 || clipsPlatforms.length > 0) &&
    (publishingMode !== 'schedule' || (selectedDate && selectedTime));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-white">
            <Send className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Publicación y Distribución</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Publica tu podcast en múltiples plataformas y programa los clips en redes sociales con tu BrandKit aplicado automáticamente.
        </p>
      </div>

      {/* Brand Voice Status */}
      {hasBrandKit && hasVoiceTone && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <h3 className="font-medium">Tono de voz aplicado: {voiceTone}</h3>
              <p className="text-sm text-green-700">{voiceInstructions}</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Coherencia garantizada</Badge>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content Configuration */}
        <Card className="xl:col-span-2 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Información del Contenido</h3>
              <Button 
                onClick={generateSEODescription} 
                variant="outline"
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generar Descripción IA
              </Button>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título del Contenido</label>
                <Input
                  placeholder="Título optimizado para SEO..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  placeholder="Descripción detallada para plataformas y SEO..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  {description.length} caracteres • Óptimo: 150-300 caracteres
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoría</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PODCAST_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="explicit"
                    checked={isExplicit}
                    onCheckedChange={setIsExplicit}
                  />
                  <label htmlFor="explicit" className="text-sm font-medium">
                    Contenido explícito
                  </label>
                </div>
              </div>

              {/* Series Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Serie (opcional)</label>
                  <Input
                    placeholder="Nombre de la serie..."
                    value={seriesName}
                    onChange={(e) => setSeriesName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Temporada</label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={seasonNumber || ''}
                    onChange={(e) => setSeasonNumber(parseInt(e.target.value) || undefined)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Episodio</label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={episodeNumber || ''}
                    onChange={(e) => setEpisodeNumber(parseInt(e.target.value) || undefined)}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Tags ({tags.length})</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    Agregar
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Publishing Mode */}
            <div className="space-y-3 pt-4 border-t">
              <label className="text-sm font-medium">¿Cuándo publicar?</label>
              <div className="grid grid-cols-3 gap-3">
                <Card 
                  className={`p-3 cursor-pointer transition-all ${
                    publishingMode === 'now' 
                      ? 'ring-2 ring-green-500 bg-green-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setPublishingMode('now')}
                >
                  <div className="text-center space-y-1">
                    <Zap className="w-5 h-5 mx-auto text-green-600" />
                    <h4 className="font-medium text-sm">Ahora</h4>
                  </div>
                </Card>

                <Card 
                  className={`p-3 cursor-pointer transition-all ${
                    publishingMode === 'schedule' 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setPublishingMode('schedule')}
                >
                  <div className="text-center space-y-1">
                    <Clock className="w-5 h-5 mx-auto text-blue-600" />
                    <h4 className="font-medium text-sm">Programar</h4>
                  </div>
                </Card>

                <Card 
                  className={`p-3 cursor-pointer transition-all ${
                    publishingMode === 'draft' 
                      ? 'ring-2 ring-gray-500 bg-gray-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setPublishingMode('draft')}
                >
                  <div className="text-center space-y-1">
                    <Save className="w-5 h-5 mx-auto text-gray-600" />
                    <h4 className="font-medium text-sm">Borrador</h4>
                  </div>
                </Card>
              </div>
            </div>

            {/* Date & Time Selection */}
            {publishingMode === 'schedule' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha</label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hora</label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                              {`${hour}:00`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Horarios recomendados</h4>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p>🎧 Podcasts: 06:00-09:00, 17:00-20:00</p>
                      <p>📱 Reels/TikTok: 11:00-13:00, 19:00-21:00</p>
                      <p>💼 LinkedIn: 08:00-10:00, 17:00-18:00</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Platform Selection & Settings */}
        <Card className="p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Plataformas de Publicación</h3>

            {/* Podcast Platforms */}
            <div className="space-y-3">
              <h4 className="font-medium">Podcast Completo</h4>
              <div className="space-y-2">
                {PODCAST_PLATFORM_OPTIONS.map(platform => {
                  const Icon = platform.icon;
                  const isSelected = podcastPlatforms.some(p => p.platform === platform.value);
                  
                  return (
                    <div key={platform.value} className="flex items-center space-x-3">
                      <Checkbox
                        id={platform.value}
                        checked={isSelected}
                        onCheckedChange={() => handlePodcastPlatformToggle(platform.value)}
                      />
                      <label 
                        htmlFor={platform.value}
                        className={`flex-1 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-purple-200 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`p-2 rounded bg-gradient-to-r ${platform.color} text-white`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{platform.label}</p>
                          <p className="text-xs text-muted-foreground">{platform.description}</p>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Duración: {Math.round((recording?.duration || 0) / 60)} minutos
              </p>
            </div>

            {/* Clips Platforms */}
            {clips.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Clips para Redes Sociales</h4>
                <div className="space-y-2">
                  {CLIP_PLATFORM_OPTIONS.map(platform => {
                    const Icon = platform.icon;
                    const isSelected = clipsPlatforms.some(p => p.platform === platform.value);
                    const availableClips = clips.filter(c => c.platform === platform.value && c.status === 'ready');
                    
                    return (
                      <div key={platform.value} className="flex items-center space-x-3">
                        <Checkbox
                          id={`clip_${platform.value}`}
                          checked={isSelected}
                          onCheckedChange={() => handleClipPlatformToggle(platform.value)}
                          disabled={availableClips.length === 0}
                        />
                        <label 
                          htmlFor={`clip_${platform.value}`}
                          className={`flex-1 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-purple-200 bg-purple-50' 
                              : availableClips.length === 0
                                ? 'border-gray-100 bg-gray-50 cursor-not-allowed'
                                : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`p-2 rounded bg-gradient-to-r ${platform.color} text-white`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{platform.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {availableClips.length} clips listos
                            </p>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
                
                {clipsPlatforms.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre de Campaña (opcional)</label>
                    <Input
                      placeholder="ej: Campaña Podcast Enero..."
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Distribution Settings */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium">Configuración de Distribución</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="rss"
                    checked={enableRSS}
                    onCheckedChange={setEnableRSS}
                  />
                  <label htmlFor="rss" className="text-sm">Generar feed RSS</label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="embed"
                    checked={enableEmbedCode}
                    onCheckedChange={setEnableEmbedCode}
                  />
                  <label htmlFor="embed" className="text-sm">Código de embed</label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="download"
                    checked={enableDownloadLink}
                    onCheckedChange={setEnableDownloadLink}
                  />
                  <label htmlFor="download" className="text-sm">Link de descarga</label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="social"
                    checked={enableSocialSharing}
                    onCheckedChange={setEnableSocialSharing}
                  />
                  <label htmlFor="social" className="text-sm">Botones sociales</label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="analytics"
                    checked={enableAnalytics}
                    onCheckedChange={setEnableAnalytics}
                  />
                  <label htmlFor="analytics" className="text-sm">Analytics avanzado</label>
                </div>
              </div>
            </div>

            {/* Content Summary */}
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Resumen del contenido</span>
              </div>
              <div className="text-xs text-purple-700 space-y-1">
                <p>• Tipo: {briefing?.contentType.replace('_', ' ')}</p>
                <p>• Duración: {Math.round((recording?.duration || 0) / 60)} min</p>
                <p>• Highlights: {highlights.length}</p>
                <p>• Clips generados: {clips.filter(c => c.status === 'ready').length}</p>
                <p>• Plataformas: {podcastPlatforms.length + clipsPlatforms.length}</p>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={handlePublish}
              disabled={!canPublish || isPublishing}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {publishingMode === 'now' ? 'Publicar Ahora' :
                   publishingMode === 'schedule' ? 'Programar Publicación' :
                   'Guardar Borrador'}
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Publishing Progress */}
      {isPublishing && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
              <Mic className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold">
              {publishingMode === 'now' ? 'Publicando contenido...' :
               publishingMode === 'schedule' ? 'Programando publicación...' :
               'Guardando borrador...'}
            </h3>
            <div className="space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-sm">
                <span>Progreso</span>
                <span>{Math.round(publishingProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${publishingProgress}%` }}
                />
              </div>
            </div>
            <div className="flex justify-center gap-4 text-sm text-gray-600">
              <span>🎧 {podcastPlatforms.length} plataformas</span>
              <span>•</span>
              <span>📱 {clipsPlatforms.length} redes sociales</span>
              <span>•</span>
              <span>⏱️ {Math.round((recording?.duration || 0) / 60)} min</span>
            </div>
          </div>
        </Card>
      )}

      {/* Success State & URLs */}
      {podcastPlatforms.some(p => p.status === 'published' || p.status === 'scheduled') && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold">
                {publishingMode === 'now' ? '¡Publicación exitosa!' : '¡Programación completada!'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {podcastPlatforms.filter(p => p.publishedUrl).map(platform => (
                <div key={platform.platform} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="capitalize">{platform.platform}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(platform.publishedUrl!)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(platform.publishedUrl, '_blank')}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {enableRSS && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Feed RSS generado</h4>
                    <p className="text-xs text-muted-foreground">Para distribución automática</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`https://feeds.yoursite.com/podcast/${currentProject?.id}`)}
                  >
                    <Link className="w-3 h-3 mr-1" />
                    Copiar URL
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          ← Volver a Highlights
        </Button>
        
        <Button 
          onClick={handlePublish}
          disabled={!canPublish || isPublishing}
          className="bg-purple-500 hover:bg-purple-600"
        >
          {publishingMode === 'now' ? 'Publicar' : 'Programar'} Contenido
        </Button>
      </div>

      {!canPublish && (
        <p className="text-xs text-muted-foreground text-center">
          Completa el título, descripción y selecciona al menos una plataforma
        </p>
      )}

      {/* Brand Integration Notice */}
      {hasBrandKit && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div className="flex-1">
              <h4 className="font-medium text-green-800">BrandKit aplicado automáticamente</h4>
              <p className="text-sm text-green-700">
                Tu contenido mantendrá coherencia visual y tonal en todas las plataformas, con colores, tipografías y voz de marca aplicados consistentemente
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}