import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../services/dashboardService';
import { Button } from '../components/ui/button';

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center">
      <div className="p-3 bg-blue-100 rounded-full mr-4">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

export function Dashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <p>Cargando dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="p-6 bg-gray-50 space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Principal</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Conversaciones Recientes" value={data?.recentThreads?.length || 0} icon="💬" />
        <StatCard title="Posts Creados" value={data?.recentPosts?.length || 0} icon="📝" />
        <StatCard title="Eventos Próximos" value={data?.upcomingEvents?.length || 0} icon="🗓️" />
        <StatCard title="Acciones Rápidas" value="4" icon="⚡" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Conversaciones Recientes</h3>
          <ul>
            {data?.recentThreads?.map(thread => <li key={thread.id} className="py-2 border-b">{thread.title}</li>)}
          </ul>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Posts Recientes</h3>
          <ul>
            {data?.recentPosts?.map(post => <li key={post.id} className="py-2 border-b">{post.title}</li>)}
          </ul>
        </div>
      </div>
       <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Eventos Próximos en el Calendario</h3>
           <ul>
            {data?.upcomingEvents?.map(event => (
              <li key={event.summary} className="py-2 border-b">
                <strong>{event.summary}</strong> - {new Date(event.start).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
    </div>
  );
}