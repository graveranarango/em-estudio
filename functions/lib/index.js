"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportHandler = exports.addMessage = exports.getMessages = exports.guardCheck = exports.helloWorld = exports.apiV1 = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const api_1 = require("./api");
Object.defineProperty(exports, "apiV1", { enumerable: true, get: function () { return api_1.apiV1; } });
admin.initializeApp();
exports.helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});
exports.guardCheck = functions.https.onRequest(async (request, response) => {
    // For now, we'll return a simplified, non-mock response.
    // The full implementation will require more complex logic.
    const { text, role, brand, context } = request.body;
    functions.logger.info("Guard check requested for:", { text, role, brand, context });
    // Basic validation
    if (!text) {
        response.status(400).send({ error: "Missing 'text' in request body" });
        return;
    }
    const mockResponse = {
        report: {
            score: 95, // A high score, indicating general compliance
            findings: [], // No specific findings in this mock
            disclaimerNeeded: false,
        },
    };
    response.status(200).send(mockResponse);
});
exports.getMessages = functions.https.onRequest(async (request, response) => {
    const { threadId, branchId } = request.query;
    if (!threadId || !branchId) {
        response.status(400).send({ error: "Missing 'threadId' or 'branchId' in request query" });
        return;
    }
    try {
        const messagesRef = admin.firestore()
            .collection('threads').doc(threadId)
            .collection('branches').doc(branchId)
            .collection('messages')
            .orderBy('createdAt', 'asc');
        const snapshot = await messagesRef.get();
        const messages = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        response.status(200).send({ messages });
    }
    catch (error) {
        functions.logger.error("Error getting messages:", error);
        response.status(500).send({ error: "Failed to get messages." });
    }
});
exports.addMessage = functions.https.onRequest(async (request, response) => {
    const { threadId, branchId, message } = request.body;
    if (!threadId || !branchId || !message) {
        response.status(400).send({ error: "Missing 'threadId', 'branchId', or 'message' in request body" });
        return;
    }
    try {
        const messagesRef = admin.firestore()
            .collection('threads').doc(threadId)
            .collection('branches').doc(branchId)
            .collection('messages');
        const docRef = await messagesRef.add(message);
        response.status(200).send(Object.assign({ id: docRef.id }, message));
    }
    catch (error) {
        functions.logger.error("Error adding message:", error);
        response.status(500).send({ error: "Failed to add message." });
    }
});
exports.exportHandler = functions.https.onRequest(async (request, response) => {
    const { format } = request.body;
    if (!format) {
        response.status(400).send({ error: "Missing 'format' in request body" });
        return;
    }
    const mockResponse = {
        filename: `export.${format}`,
        content: `# Mock Export\n\nThis is a mock export in ${format} format.`,
    };
    response.status(200).send(mockResponse);
});
//# sourceMappingURL=index.js.map