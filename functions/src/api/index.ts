import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';
import threadRoutes from './routes/threads.routes';
import imageRoutes from './routes/image.routes';

const app = express();
app.use(cors({ origin: true }));

app.use('/threads', threadRoutes); // Mount thread routes under /threads
app.use('/image', imageRoutes);   // Mount image routes under /image

export const apiV1 = functions.https.onRequest(app);