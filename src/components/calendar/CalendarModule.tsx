import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '../ui/button';
import { getGoogleAuthUrl } from '../../services/googleAuthService';

const localizer = momentLocalizer(moment);

const mockEvents = [
  {
    id: 0,
    title: 'Lanzamiento de Campaña de Verano',
    start: new Date(new Date().setDate(new Date().getDate() - 5)),
    end: new Date(new Date().setDate(new Date().getDate() - 4)),
    allDay: true,
  },
];

export default function CalendarModule() {
  const [events, setEvents] = useState(mockEvents);
  const [isConnected, setIsConnected] = useState(false); // Mock connection status

  const handleConnect = async () => {
    try {
      const { authUrl } = await getGoogleAuthUrl();
      window.location.href = authUrl; // Redirect user to Google's consent screen
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      // You could show an error message to the user here
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md" style={{ height: '80vh' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Calendario de Contenidos</h2>
        {!isConnected && (
          <Button onClick={handleConnect}>Conectar con Google Calendar</Button>
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
          <p className="text-gray-500 mb-4">Conecta tu cuenta de Google Calendar para ver y gestionar tus eventos.</p>
          <Button onClick={handleConnect}>Conectar ahora</Button>
        </div>
      )}
    </div>
  );
}