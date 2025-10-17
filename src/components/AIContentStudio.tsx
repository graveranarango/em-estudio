import React, { useState, Suspense, useEffect } from 'react';
import { Button } from './ui/button';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ onModuleChange }) => (
  <div className="w-64 bg-gray-100 p-4">
    <h2 className="font-bold mb-4">Módulos</h2>
    <div className="space-y-2">
      <Button onClick={() => onModuleChange('chat')}>Chat</Button>
      <Button onClick={() => onModuleChange('posts')}>Posts</Button>
      <Button onClick={() => onModuleChange('videos')}>Videos</Button>
      <Button onClick={() => onModuleChange('podcasts')}>Podcasts</Button>
      <Button onClick={() => onModuleChange('calendar')}>Calendario</Button>
      <Button onClick={() => onModuleChange('brandkit')}>BrandKit</Button>
      <Button onClick={() => onModuleChange('analytics')}>Analytics</Button>
      <Button onClick={() => onModuleChange('competition')}>Competition</Button>
    </div>
  </div>
);
const Header = () => <div className="h-16 bg-gray-200"></div>;

const ChatModuleUpdated = React.lazy(() => import('./modules/ChatModuleUpdated'));
const PostsCreatorModule = React.lazy(() => import('./posts/PostsCreatorModule'));
const VideosCreatorModule = React.lazy(() => import('./videos/VideosCreatorModule'));
const PodcastsCreatorModule = React.lazy(() => import('./podcasts/PodcastsCreatorModule'));
const CalendarModule = React.lazy(() => import('./calendar/CalendarModule'));
const BrandKitModule = React.lazy(() => import('./brandkit/BrandKitModule'));
const AnalyticsModule = React.lazy(() => import('./analytics/AnalyticsModule'));
const CompetitionModule = React.lazy(() => import('./competition/CompetitionModule'));

function LoadingSpinner() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 mx-auto border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

const StudioContent = () => {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                <Route path="chat" element={<ChatModuleUpdated />} />
                <Route path="posts" element={<PostsCreatorModule />} />
                <Route path="videos" element={<VideosCreatorModule />} />
                <Route path="podcasts" element={<PodcastsCreatorModule />} />
                <Route path="calendar" element={<CalendarModule />} />
                <Route path="brandkit" element={<BrandKitModule />} />
                <Route path="analytics" element={<AnalyticsModule />} />
                <Route path="competition" element={<CompetitionModule />} />
                <Route index element={<ChatModuleUpdated />} />
            </Routes>
        </Suspense>
    )
}


export function AIContentStudio() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleModuleChange = (module: string) => {
    navigate(`/studio/${module}`);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar onModuleChange={handleModuleChange} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4">
          <StudioContent />
        </main>
      </div>
    </div>
  );
}