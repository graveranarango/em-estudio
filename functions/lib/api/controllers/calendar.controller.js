"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarEvents = void 0;
const googleapis_1 = require("googleapis");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = functions.config().secrets || {};
const getOauth2Client = () => {
    return new googleapis_1.google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/apiV1/google/auth/callback`);
};
const getCalendarEvents = async (req, res) => {
    var _a, _b, _c;
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
        oauth2Client.setCredentials(tokens);
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
        const eventList = await calendar.events.list({
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });
        const events = (_a = eventList.data.items) === null || _a === void 0 ? void 0 : _a.filter(event => event.start && event.end).map(event => ({
            title: event.summary,
            start: new Date(event.start.dateTime || event.start.date),
            end: new Date(event.end.dateTime || event.end.date),
            allDay: !!event.start.date,
        }));
        return res.status(200).send({ events });
    }
    catch (error) {
        functions.logger.error('Error getting calendar events:', error);
        if (((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) === 'invalid_grant') {
            return res.status(401).send({ error: 'Google token expired or revoked. Please reconnect.' });
        }
        return res.status(500).send({ error: 'Failed to get calendar events' });
    }
};
exports.getCalendarEvents = getCalendarEvents;
//# sourceMappingURL=calendar.controller.js.map