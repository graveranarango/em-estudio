import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { google } from 'googleapis';
import { Credentials } from 'google-auth-library';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = functions.config().secrets || {};

const getOauth2Client = () => {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/apiV1/google/auth/callback`
  );
};

export const getDashboardData = async (req: Request, res: Response) => {
  const userId = res.locals.uid;
  if (!userId) {
    return res.status(401).send({ error: 'User not authenticated' });
  }

  try {
    const db = admin.firestore();

    // 1. Fetch recent threads
    const threadsQuery = db.collection('users').doc(userId).collection('threads').orderBy('createdAt', 'desc').limit(3);
    const threadsSnap = await threadsQuery.get();
    const recentThreads = threadsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Fetch recent posts
    const postsQuery = db.collection('users').doc(userId).collection('posts').orderBy('createdAt', 'desc').limit(3);
    const postsSnap = await postsQuery.get();
    const recentPosts = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 3. Fetch upcoming calendar events
    let upcomingEvents: any[] = [];
    const tokensRef = db.collection('users').doc(userId).collection('google').doc('tokens');
    const tokenDoc = await tokensRef.get();
    if (tokenDoc.exists) {
      const tokens = tokenDoc.data() as Credentials;
      const oauth2Client = getOauth2Client();
      oauth2Client.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const eventList = await calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 3,
        singleEvents: true,
        orderBy: 'startTime',
      });
      upcomingEvents = eventList.data.items?.map(event => ({
        summary: event.summary,
        start: event.start?.dateTime || event.start?.date,
      })) || [];
    }

    const dashboardData = {
      recentThreads,
      recentPosts,
      upcomingEvents,
    };

    return res.status(200).send(dashboardData);

  } catch (error: any) {
    functions.logger.error('Error getting dashboard data:', error);
    return res.status(500).send({ error: 'Failed to fetch dashboard data' });
  }
};