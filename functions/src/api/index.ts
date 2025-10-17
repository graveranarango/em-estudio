import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';
import threadRoutes from './routes/threads.routes';
import imageRoutes from './routes/image.routes';
import videoRoutes from './routes/video.routes';
import podcastRoutes from './routes/podcast.routes';

const app = express();
app.use(cors({ origin: true }));

app.use('/threads', threadRoutes);
app.use('/image', imageRoutes);
app.use('/video', videoRoutes);
app.use('/podcast', podcastRoutes);

export const apiV1 = functions.https.onRequest(app);