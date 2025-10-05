import React, { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  ArrowLeft, 
  Download,
  Calendar,
  Clock,
  Sparkles,
  Music,
  Apple,
  Youtube,
  Rss,
  CheckCircle,
  Radio
} from "lucide-react";

interface ExportFormat {
  id: string;
  label: string;
  selected: boolean;
}

interface Platform {
  id: string;
  label: string;
  icon: any;
  selected: boolean;
}

interface CalendarEvent {
  date: string;
  time: string;
  label: string;
}

export function PodcastMonologuePublishing() {
  const [exportFormats, setExportFormats] = useState<ExportFormat[]>([
    { id: 'mp3', label: 'MP3 (192 kbps)', selected: true },
    { id: 'wav', label: 'WAV (sin compresión)', selected: false },
    { id: 'aac', label: 'AAC (alta calidad)', selected: false }
  ]);

  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: 'spotify', label: 'Spotify', icon: Radio, selected: true },
    { id: 'apple', label: 'Apple Podcasts', icon: Apple, selected: true },
    { id: 'youtube', label: 'YouTube', icon: Youtube, selected: false },
    { id: 'rss', label: 'RSS propio', icon: Rss, selected: true }
  ]);

  const [scheduledDate, setScheduledDate] = useState('2025-10-12');
  const [scheduledTime, setScheduledTime] = useState('18:00');
  const [isExported, setIsExported] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

  const calendarEvents: CalendarEvent[] = [
    { date: '2025-10-12', time: '18:00', label: 'Episodio: Motivación Emprendedora' }
  ];

  const handleFormatToggle = (formatId: string) => {
    setExportFormats(prev => 
      prev.map(format => 
        format.id === formatId 
          ? { ...format, selected: !format.selected }
          : format
      )
    );
  };

  const handlePlatformToggle = (platformId: string) => {
    setPlatforms(prev => 
      prev.map(platform => 
        platform.id === platformId 
          ? { ...platform, selected: !platform.selected }
          : platform
      )
    );
  };

  const handleExport = () => {
    setIsExported(true);
  };

  const handleScheduleWithAI = () => {
    setIsScheduled(true);
    setScheduledDate('2025-10-15');
    setScheduledTime('19:30');
  };

  const handleManualSchedule = () => {
    setIsScheduled(true);
  };

  const canFinalize = isExported || isScheduled;

  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-medium">Publicación final del Podcast (Monólogo)</h1>
            <Badge variant="secondary">Paso 6 de 6</Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <Button disabled={!canFinalize}>
              Finalizar
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
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
                <Label className="text-sm font-medium mb-3 block">Formatos</Label>
                <div className="flex flex-wrap gap-2">
                  {exportFormats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => handleFormatToggle(format.id)}
                      className={`px-3 py-2 text-xs rounded-xl border transition-colors ${
                        format.selected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-muted'
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
                className="w-full"
                disabled={!exportFormats.some(f => f.selected)}
              >
                <Download className="w-4 h-4 mr-2" />
                Generar exportación
                {isExported && <CheckCircle className="w-4 h-4 ml-2 text-green-600" />}
              </Button>
            </CardContent>
          </Card>

          {/* Scheduling Section */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Programar publicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Programar manualmente</Label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleManualSchedule}
                  className="w-full"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Programar manualmente
                  {isScheduled && <CheckCircle className="w-4 h-4 ml-2 text-green-600" />}
                </Button>
              </div>
              
              <div className="pt-2 border-t border-border">
                <Button 
                  variant="secondary" 
                  onClick={handleScheduleWithAI}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  📊 Programar con IA
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  IA sugiere fecha/hora óptima según estadísticas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Platforms Section */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Plataformas de distribución
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handlePlatformToggle(platform.id)}
                      className={`flex items-center gap-2 px-3 py-2 text-xs rounded-xl border transition-colors ${
                        platform.selected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-muted'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {platform.label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Calendar Preview Section */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Vista rápida de agenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="text-sm font-medium mb-3 text-gray-700">Octubre 2025</div>
                
                {/* Mini Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day) => (
                    <div key={day} className="text-xs text-gray-500 text-center p-1 font-medium">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <div
                      key={day}
                      className={`text-xs text-center p-1 rounded ${
                        day === 12
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Events List */}
                <div className="space-y-2 border-t border-gray-200 pt-3">
                  {calendarEvents.map((event, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{event.label}</div>
                        <div className="text-xs text-gray-500">{event.date} • {event.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <Button disabled={!canFinalize}>
            Finalizar
          </Button>
        </div>
      </div>
    </div>
  );
}