import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell,
} from 'recharts';

// Mock data for the charts
const engagementData = [
  { name: 'Ene', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Abr', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
];

const contentPerformanceData = [
  { name: 'Post Blog A', views: 400, shares: 240 },
  { name: 'Video Tutorial', views: 300, shares: 139 },
  { name: 'Infografía', views: 200, shares: 980 },
  { name: 'Podcast Ep. 5', views: 278, shares: 390 },
];

const trafficSourceData = [
  { name: 'Orgánico', value: 400 },
  { name: 'Social Media', value: 300 },
  { name: 'Referidos', value: 300 },
  { name: 'Directo', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatCard = ({ title, value, change }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
    <p className={`text-xs ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change}</p>
  </div>
);

export default function AnalyticsModule() {
  return (
    <div className="p-6 bg-gray-50 space-y-6">
      <h2 className="text-2xl font-bold">Panel de Analíticas</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Visitantes Totales" value="12,408" change="+12.5% vs mes anterior" />
        <StatCard title="Tasa de Engagement" value="63.8%" change="-1.2% vs mes anterior" />
        <StatCard title="Nuevos Leads" value="1,283" change="+20.1% vs mes anterior" />
        <StatCard title="Tasa de Conversión" value="4.2%" change="+0.5% vs mes anterior" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Engagement a lo Largo del Tiempo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pv" stroke="#8884d8" name="Vistas" />
              <Line type="monotone" dataKey="uv" stroke="#82ca9d" name="Interacciones" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Rendimiento del Contenido</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contentPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#8884d8" name="Vistas" />
              <Bar dataKey="shares" fill="#82ca9d" name="Compartidos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Fuentes de Tráfico</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={trafficSourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {trafficSourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Contenido más Popular</h3>
           <ul>
            {contentPerformanceData.sort((a,b) => b.views - a.views).map(item => (
              <li key={item.name} className="flex justify-between py-2 border-b">
                <span>{item.name}</span>
                <span className="font-bold">{item.views} vistas</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}