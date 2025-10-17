"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = void 0;
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const googleapis_1 = require("googleapis");
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = functions.config().secrets || {};
const getOauth2Client = () => {
    return new googleapis_1.google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/apiV1/google/auth/callback`);
};
const getDashboardData = async (req, res) => {
    var _a;
    const userId = res.locals.uid;
    if (!userId) {
        return res.status(401).send({ error: 'User not authenticated' });
    }
    try {
        const db = admin.firestore();
        // 1. Fetch recent threads
        const threadsQuery = db.collection('users').doc(userId).collection('threads').orderBy('createdAt', 'desc').limit(3);
        const threadsSnap = await threadsQuery.get();
        const recentThreads = threadsSnap.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        // 2. Fetch recent posts
        const postsQuery = db.collection('users').doc(userId).collection('posts').orderBy('createdAt', 'desc').limit(3);
        const postsSnap = await postsQuery.get();
        const recentPosts = postsSnap.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        // 3. Fetch upcoming calendar events
        let upcomingEvents = [];
        const tokensRef = db.collection('users').doc(userId).collection('google').doc('tokens');
        const tokenDoc = await tokensRef.get();
        if (tokenDoc.exists) {
            const tokens = tokenDoc.data();
            const oauth2Client = getOauth2Client();
            oauth2Client.setCredentials(tokens);
            const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
            const eventList = await calendar.events.list({
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                maxResults: 3,
                singleEvents: true,
                orderBy: 'startTime',
            });
            upcomingEvents = ((_a = eventList.data.items) === null || _a === void 0 ? void 0 : _a.map(event => {
                var _a, _b;
                return ({
                    summary: event.summary,
                    start: ((_a = event.start) === null || _a === void 0 ? void 0 : _a.dateTime) || ((_b = event.start) === null || _b === void 0 ? void 0 : _b.date),
                });
            })) || [];
        }
        const dashboardData = {
            recentThreads,
            recentPosts,
            upcomingEvents,
        };
        return res.status(200).send(dashboardData);
    }
    catch (error) {
        functions.logger.error('Error getting dashboard data:', error);
        return res.status(500).send({ error: 'Failed to fetch dashboard data' });
    }
};
exports.getDashboardData = getDashboardData;
//# sourceMappingURL=dashboard.controller.js.map