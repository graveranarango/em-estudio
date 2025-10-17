import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { generateVideo } from '../../services/videoService';

export default function VideosCreatorModule() {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError('');
    setVideoUrl('');

    try {
      const result = await generateVideo(prompt);
      setVideoUrl(result.videoUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold">Generador de Video (Sora2 PRO)</h2>
      <div className="space-y-2">
        <Label htmlFor="prompt">Describe la escena que quieres crear</Label>
        <Input
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: Un primer plano de un café con leche con arte latte detallado"
        />
      </div>
      <Button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Generando Video...' : 'Generar Video'}
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {videoUrl && (
        <div className="mt-4">
          <h4 className="font-semibold">Video Generado:</h4>
          <video src={videoUrl} controls className="mt-2 rounded-lg shadow-md max-w-sm" />
        </div>
      )}
    </div>
  );
}