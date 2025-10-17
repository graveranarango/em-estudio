import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { getBrandKit, updateBrandKit } from '../../services/brandkitService';

export default function BrandKitModule() {
  const [tone, setTone] = useState('');
  const [bannedTerms, setBannedTerms] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBrandKit = async () => {
      try {
        const response = await getBrandKit();
        const data = response.data || {};
        setTone(data.tone || 'Profesional y cercano');
        setBannedTerms((data.bannedTerms || []).join(', '));
      } catch (err) {
        setError('Failed to load BrandKit settings.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrandKit();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    try {
      const dataToSave = {
        tone,
        bannedTerms: bannedTerms.split(',').map(term => term.trim()).filter(Boolean),
      };
      await updateBrandKit(dataToSave);
      alert('BrandKit guardado con éxito!');
    } catch (err) {
      setError('Failed to save BrandKit settings.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <p>Cargando BrandKit...</p>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold">Configuración de Marca (BrandKit)</h2>
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-2">
        <Label htmlFor="tone">Tono de Voz</Label>
        <Input
          id="tone"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="Ej: Formal, divertido, inspirador..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bannedTerms">Términos a Evitar (separados por comas)</Label>
        <Textarea
          id="bannedTerms"
          value={bannedTerms}
          onChange={(e) => setBannedTerms(e.target.value)}
          placeholder="Ej: gratis, oferta por tiempo limitado, click aquí"
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}