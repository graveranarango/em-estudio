import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const guardCheck = functions.https.onRequest(async (request, response) => {
  // For now, we'll return a simplified, non-mock response.
  // The full implementation will require more complex logic.
  const { text, role, brand, context } = request.body;

  functions.logger.info("Guard check requested for:", {text, role, brand, context});

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

export const exportHandler = functions.https.onRequest(async (request, response) => {
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