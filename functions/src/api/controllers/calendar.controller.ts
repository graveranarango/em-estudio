import { Request, Response } from 'express';
import { google } from 'googleapis';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Credentials } from 'google-auth-library';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = functions.config().secrets || {};

const getOauth2Client = () => {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/apiV1/google/auth/callback`
  );
};

export const getCalendarEvents = async (req: Request, res: Response) => {
  const userId = res.locals.uid;
  if (!userId) {
    return res.status(401).send({ error: 'User not authenticated' });
  }

  try {
    const tokensRef = admin.firestore().collection('users').doc(userId).collection('google').doc('tokens');
    const tokenDoc = await tokensRef.get();
    if (!tokenDoc.exists) {
      return res.status(400).send({ error: 'Google account not connected.' });
    }
    const tokens = tokenDoc.data();
    if (!tokens) {
        return res.status(400).send({ error: 'Tokens are missing.' });
    }

    const oauth2Client = getOauth2Client();
    oauth2Client.setCredentials(tokens as Credentials);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const eventList = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = eventList.data.items
        ?.filter(event => event.start && event.end) // Ensure start and end exist
        .map(event => ({
            title: event.summary,
            start: new Date(event.start!.dateTime || event.start!.date!),
            end: new Date(event.end!.dateTime || event.end!.date!),
            allDay: !!event.start!.date,
    }));

    return res.status(200).send({ events });

  } catch (error: any) {
    functions.logger.error('Error getting calendar events:', error);
    if (error.response?.data?.error === 'invalid_grant') {
       return res.status(401).send({ error: 'Google token expired or revoked. Please reconnect.' });
    }
    return res.status(500).send({ error: 'Failed to get calendar events' });
  }
};