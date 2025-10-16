import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar } from "../ui/calendar";
import { 
  ArrowLeft, 
  Download, 
  Clock, 
  BarChart3,
  CheckCircle2,
  Calendar as CalendarIcon,
  Music,
  Youtube,
  Rss,
  Apple
} from "lucide-react";

interface PlatformChip {
  id: string;
  label: string;
  icon: 'spotify' | 'apple' | 'youtube' | 'rss';
  selected: boolean;
}

interface FormatChip {
  id: string;
  label: string;
  selected: boolean;
}

export function PodcastPublishingStep() {
  const [selectedFormats, setSelectedFormats] = useState<FormatChip[]>([
    { id: 'mp3', label: 'MP3 (192 kbps)', selected: true },
    { id: 'wav', label: 'WAV (sin compresión)', selected: false },
    { id: 'aac', label: 'AAC (alta calidad)', selected: false }
  ]);

  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformChip[]>([
    { id: 'spotify', label: 'Spotify', icon: 'spotify', selected: true },
    { id: 'apple', label: 'Apple Podcasts', icon: 'apple', selected: true },
    { id: 'youtube', label: 'YouTube', icon: 'youtube', selected: false },
    { id: 'rss', label: 'RSS propio', icon: 'rss', selected: true }
  ]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2025-10-12'));
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [isExported, setIsExported] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

  const toggleFormat = (formatId: string) => {
    setSelectedFormats(prev => 
      prev.map(format => 
        format.id === formatId 
          ? { ...format, selected: !format.selected }
          : format
      )
    );
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.map(platform => 
        platform.id === platformId 
          ? { ...platform, selected: !platform.selected }
          : platform
      )
    );
  };

  const handleExport = () => {
    // Simulate export process
    setIsExported(true);
  };

  const handleScheduleWithAI = () => {
    // Simulate AI scheduling
    setSelectedDate(new Date('2025-10-15'));
    setSelectedTime('19:30');
    setIsScheduled(true);
  };

  const handleManualSchedule = () => {
    setIsScheduled(true);
  };

  const getPlatformIcon = (iconType: string) => {
    switch (iconType) {
      case 'spotify':
        return <Music className="w-4 h-4" />;
      case 'apple':
        return <Apple className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'rss':
        return <Rss className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  const canFinalize = isExported || isScheduled;

  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-medium">Publicación final del Podcast</h1>
            <Badge variant="secondary" className="px-3 py-1">
              Paso 6 de 6
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <Button 
              variant="default"
              disabled={!canFinalize}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Finalizar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Export Section */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Exportar archivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-3 block">Formatos</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedFormats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => toggleFormat(format.id)}
                        className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                          format.selected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {format.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <Button 
                  variant="secondary" 
                  onClick={handleExport}
                  disabled={!selectedFormats.some(f => f.selected)}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isExported ? 'Exportado ✓' : 'Generar exportación'}
                </Button>
                
                {isExported && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Archivos exportados correctamente
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scheduling Section */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Programar publicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Programar manualmente</label>
                  <div className="flex gap-3">
                    <input
                      type="date"
                      value={selectedDate.toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={handleManualSchedule}
                    className="w-full"
                  >
                    Programar manualmente
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-3 text-gray-500">o</span>
                  </div>
                </div>
                
                <Button 
                  variant="secondary" 
                  onClick={handleScheduleWithAI}
                  className="w-full flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  📊 Programar con IA
                </Button>
                <p className="text-xs text-gray-600">
                  IA sugiere fecha/hora óptima según estadísticas
                </p>
                
                {isScheduled && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      📅 Programado para {selectedDate.toLocaleDateString('es-ES')} a las {selectedTime}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Platforms Section */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle>Plataformas de distribución</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {selectedPlatforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 text-sm ${
                        platform.selected
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {getPlatformIcon(platform.icon)}
                      {platform.label}
                      {platform.selected && (
                        <CheckCircle2 className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calendar Preview */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Vista rápida de agenda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Calendar
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-lg border border-gray-200"
                    modifiers={{
                      scheduled: selectedDate,
                    }}
                    modifiersStyles={{
                      scheduled: { 
                        backgroundColor: '#2563eb', 
                        color: 'white',
                        fontWeight: '600' 
                      },
                    }}
                  />
                  
                  {isScheduled && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <span className="font-medium">
                          {selectedDate.toLocaleDateString('es-ES')} - {selectedTime}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Episodio: Logística Internacional
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <Button 
            variant="default"
            disabled={!canFinalize}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finalizar
          </Button>
        </div>

      </div>
    </div>
  );
}