import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { analyzeCompetition } from '../../services/competitionService';

export default function CompetitionModule() {
  const [url, setUrl] = useState('');
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url) return;
    setIsLoading(true);
    setError('');
    setReport(null);

    try {
      const result = await analyzeCompetition(url);
      setReport(result.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold">Análisis de Competencia</h2>
      <div className="space-y-2">
        <Label htmlFor="url">URL del Competidor</Label>
        <Input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.competidor.com"
        />
      </div>
      <Button onClick={handleAnalyze} disabled={isLoading}>
        {isLoading ? 'Analizando...' : 'Analizar Competidor'}
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {report && (
        <div className="mt-6 p-4 border rounded-lg space-y-4">
          <h3 className="font-semibold text-lg">Informe de Análisis:</h3>
          <div>
            <h4 className="font-bold">Puntuación de Amenaza:</h4>
            <p className="text-blue-600 font-bold text-2xl">{report.threatScore} / 100</p>
          </div>
          <div>
            <h4 className="font-bold">Palabras Clave Principales:</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {report.keywords.map((kw, i) => <span key={i} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm">{kw}</span>)}
            </div>
          </div>
          <div>
            <h4 className="font-bold">Tono de Voz Detectado:</h4>
            <p>{report.toneOfVoice}</p>
          </div>
          <div>
            <h4 className="font-bold">Estrategia de Contenido Principal:</h4>
            <p>{report.contentStrategy}</p>
          </div>
        </div>
      )}
    </div>
  );
}