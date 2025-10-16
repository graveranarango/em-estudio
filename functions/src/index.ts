import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { apiV1 } from "./api";

admin.initializeApp();

export { apiV1 };

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

export const getMessages = functions.https.onRequest(async (request, response) => {
  const { threadId, branchId } = request.query;

  if (!threadId || !branchId) {
    response.status(400).send({ error: "Missing 'threadId' or 'branchId' in request query" });
    return;
  }

  try {
    const messagesRef = admin.firestore()
      .collection('threads').doc(threadId as string)
      .collection('branches').doc(branchId as string)
      .collection('messages')
      .orderBy('createdAt', 'asc');

    const snapshot = await messagesRef.get();
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    response.status(200).send({ messages });
  } catch (error) {
    functions.logger.error("Error getting messages:", error);
    response.status(500).send({ error: "Failed to get messages." });
  }
});

export const addMessage = functions.https.onRequest(async (request, response) => {
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

    response.status(200).send({ id: docRef.id, ...message });
  } catch (error) {
    functions.logger.error("Error adding message:", error);
    response.status(500).send({ error: "Failed to add message." });
  }
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