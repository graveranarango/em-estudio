import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';
import threadRoutes from './routes/threads.routes';

const app = express();
app.use(cors({ origin: true }));

app.use('/', threadRoutes);

export const apiV1 = functions.https.onRequest(app);