import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '../ui/button';
import { getGoogleAuthUrl } from '../../services/googleAuthService';
import { getCalendarEvents } from '../../services/calendarService';

const localizer = momentLocalizer(moment);

export default function CalendarModule() {
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(true); // Assume connected initially
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { events: fetchedEvents } = await getCalendarEvents();
        // The events from Google Calendar API need to be parsed
        const parsedEvents = fetchedEvents.map((event, index) => ({
          id: index,
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
          allDay: event.allDay,
        }));
        setEvents(parsedEvents);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to fetch calendar events:', error);
        setIsConnected(false); // If it fails, assume not connected
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleConnect = async () => {
    try {
      const { authUrl } = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
    }
  };

  if (isLoading) {
    return <p>Cargando calendario...</p>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md" style={{ height: '80vh' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Calendario de Contenidos</h2>
        {!isConnected && (
          <Button onClick={handleConnect}>Reconectar con Google Calendar</Button>
        )}
      </div>

      {isConnected ? (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100% - 40px)' }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500 mb-4">No se pudieron cargar los eventos. Por favor, conecta tu cuenta de Google Calendar.</p>
          <Button onClick={handleConnect}>Conectar ahora</Button>
        </div>
      )}
    </div>
  );
}