import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { generateImage } from '../../services/imageService';

export default function PostsCreatorModule() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError('');
    setImageUrl('');

    try {
      const result = await generateImage(prompt);
      setImageUrl(result.imageUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Generador de Imágenes para Posts</h3>
      <div className="space-y-2">
        <Label htmlFor="prompt">Describe la imagen que quieres crear</Label>
        <Input
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: Un astronauta montando a caballo en Marte, estilo fotorrealista"
        />
      </div>
      <Button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Generando...' : 'Generar Imagen'}
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {imageUrl && (
        <div className="mt-4">
          <h4 className="font-semibold">Imagen Generada:</h4>
          <img src={imageUrl} alt={prompt} className="mt-2 rounded-lg shadow-md max-w-sm" />
        </div>
      )}
    </div>
  );
}