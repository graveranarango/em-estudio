import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { generatePodcast } from '../../services/podcastService';

export default function PodcastsCreatorModule() {
  const [script, setScript] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!script) return;
    setIsLoading(true);
    setError('');
    setAudioUrl('');

    try {
      const result = await generatePodcast(script);
      setAudioUrl(result.audioUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold">Generador de Podcast</h2>
      <div className="space-y-2">
        <Label htmlFor="script">Escribe o pega el guion para el podcast</Label>
        <Textarea
          id="script"
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Empieza a escribir tu guion aquí..."
          className="min-h-[200px]"
        />
      </div>
      <Button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Generando Audio...' : 'Generar Audio'}
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {audioUrl && (
        <div className="mt-4">
          <h4 className="font-semibold">Audio Generado:</h4>
          <audio src={audioUrl} controls className="mt-2 w-full" />
        </div>
      )}
    </div>
  );
}