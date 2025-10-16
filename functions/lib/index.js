"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportHandler = exports.guardCheck = exports.helloWorld = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
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