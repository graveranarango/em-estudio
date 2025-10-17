import React, { useState, Suspense } from 'react';
import { Button } from './ui/button';
// Mock components for demonstration
const Sidebar = ({ onModuleChange }) => (
  <div className="w-64 bg-gray-100 p-4">
    <h2 className="font-bold mb-4">Módulos</h2>
    <div className="space-y-2">
      <Button onClick={() => onModuleChange('chat')}>Chat</Button>
      <Button onClick={() => onModuleChange('posts')}>Posts</Button>
      <Button onClick={() => onModuleChange('videos')}>Videos</Button>
      <Button onClick={() => onModuleChange('calendar')}>Calendario</Button>
    </div>
  </div>
);
const Header = () => <div className="h-16 bg-gray-200"></div>;
const ChatModuleUpdated = () => <div>Chat Module</div>;

// Lazy load modules
const PostsCreatorModule = React.lazy(() => import('./posts/PostsCreatorModule'));
const VideosCreatorModule = React.lazy(() => import('./videos/VideosCreatorModule'));
const CalendarModule = React.lazy(() => import('./calendar/CalendarModule'));

function LoadingSpinner() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 mx-auto border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

const renderModule = (activeModule: string) => {
  switch (activeModule) {
    case 'chat':
      return <ChatModuleUpdated />;
    case 'posts':
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <PostsCreatorModule />
        </Suspense>
      );
    case 'videos':
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <VideosCreatorModule />
        </Suspense>
      );
    case 'calendar':
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <CalendarModule />
        </Suspense>
      );
    default:
      return <ChatModuleUpdated />;
  }
};

export function AIContentStudio() {
  const [activeModule, setActiveModule] = useState('chat');

  return (
    <div className="flex min-h-screen">
      <Sidebar onModuleChange={setActiveModule} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4">
          {renderModule(activeModule)}
        </main>
      </div>
    </div>
  );
}