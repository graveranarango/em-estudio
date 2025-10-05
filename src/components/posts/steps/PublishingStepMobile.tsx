import { useState } from "react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Card } from "../../ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../ui/sheet";
import { usePostProject } from "../../../contexts/PostProjectContext";
import { QAOverlay } from "../QAOverlay";
import { 
  Menu, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Settings,
  Calendar as CalendarIcon,
  Zap
} from "lucide-react";

// Datos para vista semanal móvil
const MOBILE_WEEKLY_EVENTS = [
  {
    day: 'Mar',
    dayNumber: 2,
    events: [
      { id: 'm1', title: '✨ IG sugerido — 10:00', status: 'suggested' as const, platform: 'instagram' }
    ]
  },
  {
    day: 'Jue',
    dayNumber: 4,
    events: [
      { id: 'm2', title: '✨ Story sugerida — 18:00', status: 'suggested' as const, platform: 'instagram' }
    ]
  }
];

// Posts programados móvil
const MOBILE_SCHEDULED_POSTS = [
  {
    id: '1',
    title: 'Instagram — Oferta',
    status: 'approved' as const,
    date: '2 Oct',
    time: '14:00'
  },
  {
    id: '2',
    title: 'Facebook — Anuncio',
    status: 'warning' as const,
    date: '3 Oct',
    time: '10:30'
  }
];

function MobileWeeklyCalendar() {
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="space-y-4">
      {/* Header del calendario móvil */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Semana 30 Sep - 6 Oct</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid semanal móvil */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {/* Header de días */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-border">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Celdas de días */}
        <div className="grid grid-cols-7">
          {weekDays.map((dayName, index) => {
            const eventData = MOBILE_WEEKLY_EVENTS.find(e => e.day === dayName);
            const dayNumber = index + 1;
            
            return (
              <div key={dayName} className="min-h-[80px] p-1 border border-border bg-white">
                <div className="text-xs font-medium text-gray-900 mb-1">{dayNumber}</div>
                <div className="space-y-1">
                  {eventData && eventData.events.map((event) => (
                    <div
                      key={event.id}
                      className="text-[10px] px-1 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer"
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

function MobilePostsSidebar() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">✅ aprobado</Badge>;
      case 'warning':
        return <Badge variant="destructive" className="text-xs bg-amber-500 hover:bg-amber-600">⚠️ revisar</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">✨ sugerido</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Posts programados</h3>
      
      <div className="space-y-2">
        {MOBILE_SCHEDULED_POSTS.map((post) => (
          <Card key={post.id} className="p-3">
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
      
      <Button variant="outline" size="sm" className="w-full text-xs">
        <Settings className="w-3 h-3 mr-1" />
        Gestionar calendario
      </Button>
    </div>
  );
}

export function PublishingStepMobile() {
  const { currentProject } = usePostProject();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showQAOverlay, setShowQAOverlay] = useState(false);

  const handleFinalize = () => {
    console.log('Finalizar proyecto móvil');
  };

  return (
    <div className="h-full flex flex-col bg-canvas">
      {/* Header móvil */}
      <div className="h-14 flex items-center justify-between px-3 bg-surface-elev-1 border-b border-border shadow-xs">
        <Button variant="ghost" size="sm">
          <Menu className="w-4 h-4" />
        </Button>
        
        <h2 className="font-medium">Publicación</h2>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowQAOverlay(true)}
        >
          <Zap className="w-4 h-4" />
        </Button>
      </div>

      {/* Contenido principal móvil */}
      <div className="flex-1 overflow-auto p-2">
        <MobileWeeklyCalendar />
      </div>

      {/* Sheet sidebar móvil */}
      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="fixed bottom-20 right-4 shadow-lg z-10"
          >
            <CalendarIcon className="w-4 h-4 mr-1" />
            Posts
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 bg-surface shadow-lg">
          <SheetHeader>
            <SheetTitle className="text-left">Posts programados</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <MobilePostsSidebar />
          </div>
        </SheetContent>
      </Sheet>

      {/* Footer móvil */}
      <div className="h-12 flex items-center justify-end px-3 bg-surface-elev-1 border-t border-border">
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
        isMobile={true}
      />
    </div>
  );
}

export default PublishingStepMobile;