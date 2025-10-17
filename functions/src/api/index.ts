import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';
import threadRoutes from './routes/threads.routes';
import imageRoutes from './routes/image.routes';
import videoRoutes from './routes/video.routes';
import podcastRoutes from './routes/podcast.routes';
import brandkitRoutes from './routes/brandkit.routes';
import competitionRoutes from './routes/competition.routes';
import googleRoutes from './routes/google.routes';
import calendarRoutes from './routes/calendar.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();
app.use(cors({ origin: true }));

app.use('/threads', threadRoutes);
app.use('/image', imageRoutes);
app.use('/video', videoRoutes);
app.use('/podcast', podcastRoutes);
app.use('/brandkit', brandkitRoutes);
app.use('/competition', competitionRoutes);
app.use('/google', googleRoutes);
app.use('/calendar', calendarRoutes);
app.use('/dashboard', dashboardRoutes);

export const apiV1 = functions.https.onRequest(app);