import { useState } from "react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Checkbox } from "../../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { usePostProject } from "../../../contexts/PostProjectContext";
import { QAOverlay } from "../QAOverlay";
import { CalendarDays, Calendar as CalendarIcon, Settings, ChevronLeft, ChevronRight, Edit2, GripVertical, Zap } from "lucide-react";

// Datos de ejemplo para el calendario
const CALENDAR_EVENTS = [
  {
    day: 2,
    events: [
      { id: '1', title: 'Post IG — Oferta ✨', status: 'suggested' as const, platform: 'instagram' }
    ]
  },
  {
    day: 3,
    events: [
      { id: '2', title: 'Post FB — Anuncio ✅', status: 'approved' as const, platform: 'facebook' }
    ]
  },
  {
    day: 8,
    events: [
      { id: '3', title: 'Story IG — Behind scenes', status: 'pending' as const, platform: 'instagram' }
    ]
  },
  {
    day: 15,
    events: [
      { id: '4', title: 'Post LI — Artículo', status: 'approved' as const, platform: 'linkedin' }
    ]
  },
  {
    day: 22,
    events: [
      { id: '5', title: 'Video TK — Tendencia', status: 'suggested' as const, platform: 'tiktok' }
    ]
  }
];

// Posts programados para el sidebar
const SCHEDULED_POSTS = [
  {
    id: '1',
    title: 'Instagram — Oferta',
    status: 'suggested' as const,
    date: '2 Oct',
    time: '14:00'
  },
  {
    id: '2',
    title: 'Facebook — Anuncio',
    status: 'approved' as const,
    date: '3 Oct',
    time: '10:30'
  },
  {
    id: '3',
    title: 'LinkedIn — Blogpost',
    status: 'warning' as const,
    date: '15 Oct',
    time: '09:00'
  },
  {
    id: '4',
    title: 'TikTok — Video',
    status: 'suggested' as const,
    date: '22 Oct',
    time: '18:00'
  }
];

interface CalendarCellProps {
  day: number;
  events: Array<{
    id: string;
    title: string;
    status: 'suggested' | 'approved' | 'pending' | 'warning';
    platform: string;
  }>;
}

interface QuickEditPopoverProps {
  eventData: {
    id: string;
    title: string;
    date: string;
    time: string;
    platform: string;
    autoPublish: boolean;
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

function QuickEditPopover({ eventData, onSave, onCancel }: QuickEditPopoverProps) {
  const [editData, setEditData] = useState(eventData);

  const handleSave = () => {
    onSave(editData);
  };

  return (
    <PopoverContent className="w-72 p-3 shadow-lg rounded-lg" side="top">
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Editar programación</h4>
        
        <div className="space-y-2">
          <Label htmlFor="date" className="text-xs">Fecha</Label>
          <Input
            id="date"
            type="date"
            value={editData.date}
            onChange={(e) => setEditData({...editData, date: e.target.value})}
            className="h-8 text-xs"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="time" className="text-xs">Hora</Label>
          <Input
            id="time"
            type="time"
            value={editData.time}
            onChange={(e) => setEditData({...editData, time: e.target.value})}
            className="h-8 text-xs"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="platform" className="text-xs">Plataforma</Label>
          <Select 
            value={editData.platform} 
            onValueChange={(value) => setEditData({...editData, platform: value})}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">X</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="auto-publish"
            checked={editData.autoPublish}
            onCheckedChange={(checked) => setEditData({...editData, autoPublish: !!checked})}
          />
          <Label htmlFor="auto-publish" className="text-xs">Publicar automáticamente</Label>
        </div>
        
        <div className="flex justify-end gap-2 pt-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button 
            size="sm" 
            className="text-xs h-7 bg-purple-500 hover:bg-purple-600"
            onClick={handleSave}
          >
            Guardar
          </Button>
        </div>
      </div>
    </PopoverContent>
  );
}

function CalendarCell({ day, events }: CalendarCellProps) {
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const getEventChipStyles = (status: string, isDragging = false) => {
    const baseStyles = 'text-[11px] px-1.5 py-0.5 rounded-md border cursor-pointer transition-all shadow-xs';
    const dragStyles = isDragging ? 'opacity-60 shadow-lg scale-105' : 'hover:opacity-80';
    
    switch (status) {
      case 'suggested':
        return `${baseStyles} ${dragStyles} bg-blue-100 text-blue-700 border-blue-200`;
      case 'approved':
        return `${baseStyles} ${dragStyles} bg-green-100 text-green-700 border-green-200`;
      case 'pending':
        return `${baseStyles} ${dragStyles} bg-gray-100 text-gray-700 border-gray-200`;
      case 'warning':
        return `${baseStyles} ${dragStyles} bg-amber-100 text-amber-700 border-amber-200`;
      default:
        return `${baseStyles} ${dragStyles} bg-gray-100 text-gray-700 border-gray-200`;
    }
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent({
      id: event.id,
      title: event.title,
      date: '2025-10-01',
      time: '14:30',
      platform: event.platform,
      autoPublish: true
    });
    setShowQuickEdit(true);
  };

  const handleQuickEditSave = (data: any) => {
    console.log('Saving event data:', data);
    setShowQuickEdit(false);
    setSelectedEvent(null);
  };

  const handleQuickEditCancel = () => {
    setShowQuickEdit(false);
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-[100px] p-1.5 border border-border bg-white hover:bg-gray-50 transition-colors">
      <div className="text-xs font-medium text-gray-900 mb-1">{day}</div>
      <div className="space-y-1">
        {events.map((event, index) => (
          <Popover key={event.id} open={showQuickEdit && selectedEvent?.id === event.id} onOpenChange={setShowQuickEdit}>
            <PopoverTrigger asChild>
              <div
                className={`group relative ${getEventChipStyles(event.status, false)}`}
                title={event.title}
                onClick={() => handleEventClick(event)}
              >
                <div className="flex items-center gap-1">
                  <GripVertical className="w-2.5 h-2.5 opacity-40 group-hover:opacity-70 transition-opacity" />
                  <div className="truncate flex-1">{event.title}</div>
                  <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-70 transition-opacity" />
                </div>
              </div>
            </PopoverTrigger>
            {selectedEvent && selectedEvent.id === event.id && (
              <QuickEditPopover
                eventData={selectedEvent}
                onSave={handleQuickEditSave}
                onCancel={handleQuickEditCancel}
              />
            )}
          </Popover>
        ))}
        
        {/* Ejemplo de evento siendo arrastrado - solo en día 5 para demo */}
        {day === 5 && (
          <div
            className={`${getEventChipStyles('approved', true)} relative`}
            title="Instagram — Oferta (arrastrando…)"
          >
            <div className="flex items-center gap-1">
              <GripVertical className="w-2.5 h-2.5 opacity-70" />
              <div className="truncate flex-1">Instagram — Oferta (arrastrando…)</div>
            </div>
            {/* Indicador visual de arrastre */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Datos para vista semanal
const WEEKLY_EVENTS = [
  {
    day: 'Mar',
    dayNumber: 2,
    events: [
      { id: 'w1', title: '✨ Post sugerido — 10:00 AM', status: 'suggested' as const, platform: 'instagram' }
    ]
  },
  {
    day: 'Jue',
    dayNumber: 4,
    events: [
      { id: 'w2', title: '✨ Story sugerida — 18:00 PM', status: 'suggested' as const, platform: 'instagram' }
    ]
  }
];

function CalendarGrid({ viewMode }: { viewMode: 'Mes' | 'Semana' }) {
  const [currentMonth] = useState(new Date(2024, 9)); // Octubre 2024
  
  if (viewMode === 'Semana') {
    // Vista semanal - 1 fila, 7 columnas
    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    return (
      <div className="bg-canvas flex-1 p-4">
        {/* Header del calendario semanal */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Semana del 30 Sep - 6 Oct 2024</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Grid semanal */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          {/* Header de días de la semana */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-border">
            {weekDays.map((day) => (
              <div key={day} className="p-3 text-center text-xs font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>
          
          {/* Grid de días semanales */}
          <div className="grid grid-cols-7">
            {weekDays.map((dayName, index) => {
              const weeklyData = WEEKLY_EVENTS.find(e => e.day === dayName);
              const dayNumber = index + 1;
              
              return (
                <div key={dayName} className="min-h-[120px] p-1.5 border border-border bg-white hover:bg-gray-50 transition-colors">
                  <div className="text-xs font-medium text-gray-900 mb-1">{dayNumber}</div>
                  <div className="space-y-1">
                    {weeklyData && weeklyData.events.map((event) => (
                      <div
                        key={event.id}
                        className="text-[11px] px-1.5 py-0.5 rounded-md border cursor-pointer hover:opacity-80 transition-opacity bg-blue-100 text-blue-700 border-blue-200 shadow-xs"
                        title={event.title}
                      >
                        <div className="truncate">{event.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  
  // Vista mensual (código original)
  // Generar días del mes
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  // Días de la semana
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Crear array de días con eventos
  const calendarDays = [];
  
  // Días vacíos al inicio
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = CALENDAR_EVENTS.find(e => e.day === day)?.events || [];
    calendarDays.push({ day, events: dayEvents });
  }

  return (
    <div className="bg-canvas flex-1 p-4">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Octubre 2024</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid del calendario */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {/* Header de días de la semana */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-border">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center text-xs font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Grid de días */}
        <div className="grid grid-cols-7">
          {calendarDays.map((dayData, index) => (
            <div key={index}>
              {dayData ? (
                <CalendarCell day={dayData.day} events={dayData.events} />
              ) : (
                <div className="min-h-[100px] p-1.5 border border-border bg-gray-50"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AIRecommendationsCard() {
  const handleApplySuggestions = () => {
    console.log('Aplicando sugerencias de IA');
  };

  return (
    <Card className="p-3 shadow-xs rounded-xl">
      <div className="space-y-3">
        <h4 className="font-medium text-sm flex items-center gap-1">
          Recomendaciones IA ✨
        </h4>
        
        <div className="space-y-2">
          <div className="text-xs leading-tight bg-gray-50 rounded-md p-2">
            📊 Tus posts tienen más engagement los martes a las 10:00 AM.
          </div>
          
          <div className="text-xs leading-tight bg-gray-50 rounded-md p-2">
            ✨ Recomendamos publicar una Story el jueves a las 18:00 PM.
          </div>
          
          <div className="text-xs leading-tight bg-gray-50 rounded-md p-2">
            ✅ Evita sábados tarde: menor alcance registrado.
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            size="sm" 
            className="text-xs h-7 bg-purple-500 hover:bg-purple-600"
            onClick={handleApplySuggestions}
          >
            Aplicar sugerencias
          </Button>
        </div>
      </div>
    </Card>
  );
}

function PostsProgramadosSidebar() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'suggested':
        return <Badge variant="secondary" className="text-xs">✨ sugerido</Badge>;
      case 'approved':
        return <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">✅ aprobado</Badge>;
      case 'warning':
        return <Badge variant="destructive" className="text-xs bg-amber-500 hover:bg-amber-600">⚠️ revisar</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">pendiente</Badge>;
    }
  };

  return (
    <div className="w-80 bg-surface-elev-1 border-l border-border p-3 space-y-3">
      <h3 className="font-medium text-sm">Posts programados</h3>
      
      <div className="space-y-2">
        {SCHEDULED_POSTS.map((post) => (
          <Card key={post.id} className="p-2 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground">{post.date} • {post.time}</p>
                </div>
                {getStatusBadge(post.status)}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Recomendaciones IA */}
      <AIRecommendationsCard />
      
      {/* Leyenda de estados */}
      <div className="space-y-2 pt-2 border-t border-border">
        <h4 className="text-xs font-medium text-muted-foreground">Estados:</h4>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
            ✅ aprobado
          </Badge>
          <Badge variant="destructive" className="text-xs bg-amber-500 hover:bg-amber-600">
            ⚠️ revisar
          </Badge>
          <Badge variant="secondary" className="text-xs">
            ✨ sugerido
          </Badge>
        </div>
      </div>
      
      <Button variant="outline" size="sm" className="w-full text-xs">
        <Settings className="w-3 h-3 mr-1" />
        Gestionar calendario
      </Button>
    </div>
  );
}

export function PublishingStep() {
  const { currentProject } = usePostProject();
  const [calendarView, setCalendarView] = useState<'Mes' | 'Semana'>('Mes');
  const [showQAOverlay, setShowQAOverlay] = useState(false);

  const handleScheduleManually = () => {
    console.log('Programar manualmente');
    // Aquí se abriría un modal o flujo para programación manual
  };

  const handleFinalize = () => {
    console.log('Finalizar proyecto');
    // Aquí se completaría el flujo del proyecto
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-3 py-0 bg-surface-elev-1 border-b border-border shadow-xs">
        <h2 className="font-medium">Publicación — Calendarización</h2>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Select value={calendarView} onValueChange={(value: 'Mes' | 'Semana') => setCalendarView(value)}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mes">Mes</SelectItem>
                <SelectItem value="Semana">Semana</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-8"
            onClick={() => setShowQAOverlay(true)}
          >
            <Zap className="w-3 h-3 mr-1" />
            QA
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm" 
            className="text-xs h-8"
            onClick={handleScheduleManually}
          >
            <CalendarIcon className="w-3 h-3 mr-1" />
            Programar manualmente
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Calendar View */}
        <CalendarGrid viewMode={calendarView} />
        
        {/* Sidebar Posts Programados */}
        <PostsProgramadosSidebar />
      </div>

      {/* Footer */}
      <div className="h-12 flex items-center justify-end px-3 bg-surface-elev-1 border-t border-border shadow-xs">
        <Button 
          className="text-xs bg-purple-500 hover:bg-purple-600"
          onClick={handleFinalize}
        >
          Finalizar
        </Button>
      </div>

      {/* QA Overlay */}
      <QAOverlay 
        isVisible={showQAOverlay} 
        onClose={() => setShowQAOverlay(false)}
        isMobile={false}
      />
    </div>
  );
}

export default PublishingStep;