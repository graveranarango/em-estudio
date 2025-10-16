import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  Kanban, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  Search,
  FileText,
  Video,
  Image as ImageIcon,
  Mic,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Target,
  Flag
} from 'lucide-react';

type ViewType = 'Calendario' | 'Kanban' | 'Timeline';

interface ContentItem {
  id: string;
  title: string;
  type: 'Posts' | 'Videos' | 'Historias' | 'Podcast';
  status: 'Borrador' | 'En producción' | 'Programado' | 'Publicado';
  date: Date;
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Spotify';
  duration?: string;
  priority: 'Alta' | 'Media' | 'Baja';
  responsible: 'Equipo' | 'Agente 1' | 'Agente 2';
  validation: 'Pendiente BrandGuard' | 'Validado';
}

// Mock data
const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'Post lanzamiento producto',
    type: 'Posts',
    status: 'Programado',
    date: new Date(),
    platform: 'Instagram',
    priority: 'Alta',
    responsible: 'Agente 1',
    validation: 'Validado'
  },
  {
    id: '2',
    title: 'Video tutorial',
    type: 'Videos',
    status: 'En producción',
    date: new Date(Date.now() + 86400000),
    platform: 'YouTube',
    duration: '2-5min',
    priority: 'Media',
    responsible: 'Agente 2',
    validation: 'Pendiente BrandGuard'
  },
  {
    id: '3',
    title: 'Historia behind scenes',
    type: 'Historias',
    status: 'Borrador',
    date: new Date(Date.now() + 172800000),
    platform: 'Instagram',
    duration: '<30s',
    priority: 'Baja',
    responsible: 'Equipo',
    validation: 'Pendiente BrandGuard'
  },
  {
    id: '4',
    title: 'Episodio podcast',
    type: 'Podcast',
    status: 'Publicado',
    date: new Date(Date.now() - 86400000),
    platform: 'Spotify',
    duration: '30-60min',
    priority: 'Alta',
    responsible: 'Agente 1',
    validation: 'Validado'
  }
];

// Segmented Control Component
function SegmentedControl({ value, onChange, options }: {
  value: ViewType;
  onChange: (value: ViewType) => void;
  options: ViewType[];
}) {
  return (
    <div className="inline-flex items-center p-1 bg-gray-50 rounded-lg">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            value === option
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

// Calendar View Component
function CalendarView({ content }: { content: ContentItem[] }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState('Esta semana');
  const [contentType, setContentType] = useState('Todos');
  const [status, setStatus] = useState('Todos');

  const getContentForDate = (date: Date) => {
    return content.filter(item => 
      item.date.toDateString() === date.toDateString()
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Posts': return <FileText className="w-4 h-4" />;
      case 'Videos': return <Video className="w-4 h-4" />;
      case 'Historias': return <ImageIcon className="w-4 h-4" />;
      case 'Podcast': return <Mic className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white border-b">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Rango de fechas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Esta semana">Esta semana</SelectItem>
            <SelectItem value="Este mes">Este mes</SelectItem>
            <SelectItem value="Próximos 30 días">Próximos 30 días</SelectItem>
          </SelectContent>
        </Select>

        <Select value={contentType} onValueChange={setContentType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo de contenido" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Posts">Posts</SelectItem>
            <SelectItem value="Videos">Videos</SelectItem>
            <SelectItem value="Historias">Historias</SelectItem>
            <SelectItem value="Podcast">Podcast</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Borrador">Borrador</SelectItem>
            <SelectItem value="Programado">Programado</SelectItem>
            <SelectItem value="Publicado">Publicado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 flex">
        <div className="w-80 p-4 border-r">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            modifiers={{
              hasContent: (date) => getContentForDate(date).length > 0
            }}
            modifiersStyles={{
              hasContent: { 
                backgroundColor: '#2563eb', 
                color: 'white',
                fontWeight: 'bold'
              }
            }}
          />
        </div>

        <div className="flex-1 p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>

            {getContentForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getContentForDate(selectedDate).map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(item.type)}
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.platform}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.status === 'Publicado' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay contenido programado para este día</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Kanban View Component
function KanbanView({ content }: { content: ContentItem[] }) {
  const [moduleFilter, setModuleFilter] = useState('Todos');
  const [responsibleFilter, setResponsibleFilter] = useState('Todos');
  const [validationFilter, setValidationFilter] = useState('Todos');

  const columns = ['Borrador', 'En producción', 'Programado', 'Publicado'];

  const getItemsForColumn = (status: string) => {
    return content.filter(item => item.status === status);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Posts': return <FileText className="w-4 h-4" />;
      case 'Videos': return <Video className="w-4 h-4" />;
      case 'Historias': return <ImageIcon className="w-4 h-4" />;
      case 'Podcast': return <Mic className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'border-l-red-500';
      case 'Media': return 'border-l-yellow-500';
      case 'Baja': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white border-b">
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Módulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Posts">Posts</SelectItem>
            <SelectItem value="Videos">Videos</SelectItem>
            <SelectItem value="Historias">Historias</SelectItem>
            <SelectItem value="Podcast">Podcast</SelectItem>
          </SelectContent>
        </Select>

        <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Responsable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Equipo">Equipo</SelectItem>
            <SelectItem value="Agente 1">Agente 1</SelectItem>
            <SelectItem value="Agente 2">Agente 2</SelectItem>
          </SelectContent>
        </Select>

        <Select value={validationFilter} onValueChange={setValidationFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Validación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Pendiente BrandGuard">Pendiente BrandGuard</SelectItem>
            <SelectItem value="Validado">Validado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-4 gap-4 h-full">
          {columns.map((column) => (
            <div key={column} className="flex flex-col">
              <div className="bg-gray-50 p-3 rounded-t-lg border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{column}</h3>
                  <Badge variant="secondary">{getItemsForColumn(column).length}</Badge>
                </div>
              </div>
              
              <div className="flex-1 p-3 space-y-3 bg-gray-50/50 rounded-b-lg">
                {getItemsForColumn(column).map((item) => (
                  <Card key={item.id} className={`p-3 border-l-4 ${getPriorityColor(item.priority)} hover:shadow-md transition-shadow`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <span className="text-xs text-muted-foreground">{item.type}</span>
                        </div>
                        <Flag className={`w-3 h-3 ${
                          item.priority === 'Alta' ? 'text-red-500' :
                          item.priority === 'Media' ? 'text-yellow-500' : 'text-green-500'
                        }`} />
                      </div>
                      
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.platform}</span>
                        <span>{item.responsible}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={item.validation === 'Validado' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {item.validation === 'Validado' ? '✓' : '⏳'}
                        </Badge>
                        
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {getItemsForColumn(column).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Agregar contenido</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Timeline View Component
function TimelineView({ content }: { content: ContentItem[] }) {
  const [platformFilter, setPlatformFilter] = useState('Todas');
  const [durationFilter, setDurationFilter] = useState('Todos');
  const [priorityFilter, setPriorityFilter] = useState('Todas');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Posts': return <FileText className="w-4 h-4" />;
      case 'Videos': return <Video className="w-4 h-4" />;
      case 'Historias': return <ImageIcon className="w-4 h-4" />;
      case 'Podcast': return <Mic className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const sortedContent = [...content].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white border-b">
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas</SelectItem>
            <SelectItem value="Instagram">Instagram</SelectItem>
            <SelectItem value="TikTok">TikTok</SelectItem>
            <SelectItem value="YouTube">YouTube</SelectItem>
            <SelectItem value="Spotify">Spotify</SelectItem>
          </SelectContent>
        </Select>

        <Select value={durationFilter} onValueChange={setDurationFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Duración" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="<30s">&lt;30s</SelectItem>
            <SelectItem value="30s-1min">30s-1min</SelectItem>
            <SelectItem value="1-5min">1-5min</SelectItem>
            <SelectItem value="5min+">5min+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas</SelectItem>
            <SelectItem value="Alta">Alta</SelectItem>
            <SelectItem value="Media">Media</SelectItem>
            <SelectItem value="Baja">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <div className="flex-1 p-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-6">
            {sortedContent.map((item, index) => (
              <div key={item.id} className="relative flex items-start gap-4">
                {/* Timeline dot */}
                <div className={`relative z-10 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                  item.status === 'Publicado' ? 'bg-green-500' :
                  item.status === 'Programado' ? 'bg-blue-500' :
                  item.status === 'En producción' ? 'bg-yellow-500' : 'bg-gray-300'
                }`}></div>
                
                {/* Content card */}
                <Card className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getTypeIcon(item.type)}
                      <div className="space-y-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{item.type}</span>
                          <span>{item.platform}</span>
                          {item.duration && <span>{item.duration}</span>}
                          <span>Por {item.responsible}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.status === 'Publicado' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                          <Badge variant={item.priority === 'Alta' ? 'destructive' : 'outline'}>
                            {item.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {item.date.toLocaleDateString('es-ES', { 
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.date.toLocaleDateString('es-ES', { 
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CalendarModule() {
  const [activeView, setActiveView] = useState<ViewType>('Calendario');
  const views: ViewType[] = ['Calendario', 'Kanban', 'Timeline'];

  const renderView = () => {
    switch (activeView) {
      case 'Calendario':
        return <CalendarView content={mockContent} />;
      case 'Kanban':
        return <KanbanView content={mockContent} />;
      case 'Timeline':
        return <TimelineView content={mockContent} />;
      default:
        return <CalendarView content={mockContent} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-canvas">
      {/* Header with View Switcher */}
      <div className="flex items-center justify-center p-6 bg-white border-b">
        <SegmentedControl
          value={activeView}
          onChange={setActiveView}
          options={views}
        />
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>
    </div>
  );
}
