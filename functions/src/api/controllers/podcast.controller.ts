import { Request, Response } from 'express';
import * as functions from 'firebase-functions';

// A placeholder audio URL
const MOCK_AUDIO_URL = 'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp3';

export const generatePodcast = async (req: Request, res: Response) => {
  const { script } = req.body;
  const userId = res.locals.uid;

  if (!script) {
    return res.status(400).send({ error: 'Script is required' });
  }
  if (!userId) {
    return res.status(401).send({ error: 'User not authenticated' });
  }

  functions.logger.info(`Podcast generation requested by ${userId}`);

  // Simulate a delay for audio processing
  await new Promise(resolve => setTimeout(resolve, 4000));

  return res.status(200).send({ audioUrl: MOCK_AUDIO_URL });
};