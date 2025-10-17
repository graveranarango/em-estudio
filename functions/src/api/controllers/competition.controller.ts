import { Request, Response } from 'express';
import * as functions from 'firebase-functions';

const mockAnalysis = {
  keywords: ['IA para marketing', 'creación de contenido', 'redes sociales', 'SEO'],
  toneOfVoice: 'Educativo y profesional',
  contentStrategy: 'Enfocada en tutoriales de blog y casos de estudio.',
  threatScore: 78,
};

export const analyzeCompetition = async (req: Request, res: Response) => {
  const { url } = req.body;
  const userId = res.locals.uid;

  if (!url) {
    return res.status(400).send({ error: 'URL is required' });
  }
  if (!userId) {
    return res.status(401).send({ error: 'User not authenticated' });
  }

  functions.logger.info(`Competition analysis requested by ${userId} for URL: "${url}"`);

  // Simulate a delay for analysis
  await new Promise(resolve => setTimeout(resolve, 3500));

  return res.status(200).send({ report: mockAnalysis });
};