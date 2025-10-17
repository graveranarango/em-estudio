import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer by providing the moment Object
const localizer = momentLocalizer(moment);

// Mock events for demonstration
const mockEvents = [
  {
    id: 0,
    title: 'Lanzamiento de Campaña de Verano',
    start: new Date(new Date().setDate(new Date().getDate() - 5)),
    end: new Date(new Date().setDate(new Date().getDate() - 4)),
    allDay: true,
  },
  {
    id: 1,
    title: 'Reunión de Estrategia de Contenidos',
    start: new Date(),
    end: new Date(new Date().setHours(new Date().getHours() + 1)),
  },
  {
    id: 2,
    title: 'Publicación de Post en Blog',
    start: new Date(new Date().setDate(new Date().getDate() + 3)),
    end: new Date(new Date().setDate(new Date().getDate() + 3)),
  },
];

export default function CalendarModule() {
  const [events, setEvents] = useState(mockEvents);

  // In a real application, you would have functions here to handle
  // selecting events, creating new ones, etc.
  // For now, we just display the calendar.

  return (
    <div className="p-6 bg-white rounded-lg shadow-md" style={{ height: '80vh' }}>
      <h2 className="text-2xl font-bold mb-4">Calendario de Contenidos</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100% - 40px)' }}
      />
    </div>
  );
}