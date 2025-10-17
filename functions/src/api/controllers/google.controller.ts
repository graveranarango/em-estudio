import { Request, Response } from 'express';
import { google } from 'googleapis';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// These secrets need to be set in Firebase Functions secrets
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = functions.config().secrets || {};

const OAUTH2_CLIENT = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/apiV1/google/auth/callback`
);

export const getAuthUrl = (req: Request, res: Response) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  const url = OAUTH2_CLIENT.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    // A unique state value should be generated and validated in a real app
    state: res.locals.uid,
  });

  return res.status(200).send({ authUrl: url });
};

export const handleAuthCallback = async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const userId = state as string; // The user ID was passed in the 'state' parameter

  if (!code) {
    return res.status(400).send('Authorization code is missing.');
  }

  try {
    const { tokens } = await OAUTH2_CLIENT.getToken(code as string);
    OAUTH2_CLIENT.setCredentials(tokens);

    // Save the tokens to Firestore for the user
    const tokensRef = admin.firestore().collection('users').doc(userId).collection('google').doc('tokens');
    await tokensRef.set(tokens);

    // Redirect user back to the calendar module in the frontend
    // In a real app, this URL should come from an environment variable
    return res.redirect('http://localhost:3000/calendar');

  } catch (error) {
    functions.logger.error('Error handling Google Auth callback:', error);
    return res.status(500).send('Failed to authenticate with Google.');
  }
};