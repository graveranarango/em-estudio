"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAuthCallback = exports.getAuthUrl = void 0;
const googleapis_1 = require("googleapis");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// These secrets need to be set in Firebase Functions secrets
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = functions.config().secrets || {};
const OAUTH2_CLIENT = new googleapis_1.google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/apiV1/google/auth/callback`);
const getAuthUrl = (req, res) => {
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
exports.getAuthUrl = getAuthUrl;
const handleAuthCallback = async (req, res) => {
    const { code, state } = req.query;
    const userId = state; // The user ID was passed in the 'state' parameter
    if (!code) {
        return res.status(400).send('Authorization code is missing.');
    }
    try {
        const { tokens } = await OAUTH2_CLIENT.getToken(code);
        OAUTH2_CLIENT.setCredentials(tokens);
        // Save the tokens to Firestore for the user
        const tokensRef = admin.firestore().collection('users').doc(userId).collection('google').doc('tokens');
        await tokensRef.set(tokens);
        // Redirect user back to the calendar module in the frontend
        // In a real app, this URL should come from an environment variable
        return res.redirect('http://localhost:3000/calendar');
    }
    catch (error) {
        functions.logger.error('Error handling Google Auth callback:', error);
        return res.status(500).send('Failed to authenticate with Google.');
    }
};
exports.handleAuthCallback = handleAuthCallback;
//# sourceMappingURL=google.controller.js.map