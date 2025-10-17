"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePost = exports.onUserMessageCreated = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const openai_1 = require("openai");
admin.initializeApp();
// Define secrets and parameters
const { CHATGPT_EM_ESTUDIO } = functions.config().secrets || {};
const OPENAI_MODEL = ((_a = functions.config().params) === null || _a === void 0 ? void 0 : _a.OPENAI_MODEL) || 'gpt-4o-mini';
const BRAND_GUARD_BANNED = (((_b = functions.config().params) === null || _b === void 0 ? void 0 : _b.BRAND_GUARD_BANNED) || '').split(',');
const BRAND_GUARD_STRICT = ((_c = functions.config().params) === null || _c === void 0 ? void 0 : _c.BRAND_GUARD_STRICT) === 'true';
const openai = new openai_1.default({ apiKey: CHATGPT_EM_ESTUDIO });
// Brand Guard utility function
const runBrandGuard = (text) => {
    const findings = [];
    const lowerText = text.toLowerCase();
    // 1. Check for banned terms
    const bannedFound = BRAND_GUARD_BANNED.filter((term) => term && lowerText.includes(term.toLowerCase()));
    if (bannedFound.length > 0) {
        findings.push({
            type: 'Banned Term',
            message: `El texto contiene los siguientes términos no permitidos: ${bannedFound.join(', ')}.`,
            suggestion: 'Reemplaza estos términos por alternativas aprobadas.',
        });
    }
    // 2. Check for excessive exclamation marks
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 1) {
        findings.push({
            type: 'Excessive Punctuation',
            message: `El texto contiene ${exclamationCount} signos de exclamación. Se recomienda usar uno como máximo.`,
            suggestion: text.replace(/!+/g, '!'),
        });
    }
    // 3. Check for all caps words (more than 3 letters)
    const allCapsWords = text.match(/\b[A-Z]{4,}\b/g) || [];
    if (allCapsWords.length > 0) {
        findings.push({
            type: 'Excessive Uppercasing',
            message: `El texto contiene palabras en mayúsculas: ${allCapsWords.join(', ')}.`,
            suggestion: 'Escribe el texto en minúsculas para un tono más conversacional.',
        });
    }
    const report = {
        score: 100 - (findings.length * 25), // Simple scoring
        findings,
        passed: findings.length === 0,
    };
    return report;
};
exports.onUserMessageCreated = functions.firestore
    .document('users/{userId}/threads/{threadId}/messages/{messageId}')
    .onCreate(async (snap, context) => {
    var _a, _b;
    const newMessage = snap.data();
    // Only process messages from 'user' role
    if (newMessage.role !== 'user') {
        return null;
    }
    const { userId, threadId } = context.params;
    const messagesRef = admin.firestore().collection('users').doc(userId).collection('threads').doc(threadId).collection('messages');
    // Pre-check user message with Brand Guard
    const userReport = runBrandGuard(newMessage.content);
    if (!userReport.passed && BRAND_GUARD_STRICT) {
        return messagesRef.add({
            role: 'assistant',
            content: 'Tu mensaje no cumple con las políticas de marca y no puede ser procesado. Por favor, ajústalo y vuelve a intentarlo.',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            brandGuardReport: userReport,
        });
    }
    try {
        const recentMessagesQuery = messagesRef.orderBy('createdAt', 'desc').limit(20);
        const recentMessagesSnap = await recentMessagesQuery.get();
        const contextMessages = recentMessagesSnap.docs
            .map(doc => doc.data())
            .reverse()
            .map(msg => ({ role: msg.role, content: msg.content }));
        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                { role: 'system', content: 'You are a helpful AI assistant.' },
                ...contextMessages,
            ],
        });
        const assistantResponse = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'No he podido generar una respuesta.';
        // Post-check assistant response with Brand Guard
        const assistantReport = runBrandGuard(assistantResponse);
        return messagesRef.add({
            role: 'assistant',
            content: assistantResponse,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            brandGuardReport: assistantReport, // Save the detailed report
        });
    }
    catch (error) {
        functions.logger.error("Error processing message with OpenAI:", error);
        return messagesRef.add({
            role: 'assistant',
            content: 'Ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
});
exports.generatePost = functions.https.onCall(async (data, context) => {
    var _a, _b;
    // 1. Ensure the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const { threadId } = data;
    const { uid } = context.auth;
    if (!threadId) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "threadId".');
    }
    try {
        // 2. Retrieve conversation messages from Firestore
        const messagesRef = admin.firestore().collection('users').doc(uid).collection('threads').doc(threadId).collection('messages');
        const messagesSnap = await messagesRef.orderBy('createdAt', 'asc').get();
        const conversation = messagesSnap.docs.map(doc => doc.data().content).join('\n');
        if (conversation.length === 0) {
            throw new functions.https.HttpsError('not-found', 'No messages found in the specified thread.');
        }
        // 3. Call OpenAI API to generate content
        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: `Basado en la siguiente conversación, genera un post para un blog. El post debe tener un título y un cuerpo. Responde únicamente con un objeto JSON con el formato: {"title": "título del post", "body": "cuerpo del post"}. No incluyas nada más en tu respuesta.`,
                },
                {
                    role: 'user',
                    content: conversation,
                },
            ],
            response_format: { type: 'json_object' },
        });
        const responseContent = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
        if (!responseContent) {
            throw new functions.https.HttpsError('internal', 'Failed to get a valid response from OpenAI.');
        }
        // 4. Parse the JSON response and return it
        const parsedContent = JSON.parse(responseContent);
        return parsedContent;
    }
    catch (error) {
        functions.logger.error('Error generating post from conversation:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred while generating the post.');
    }
});
//# sourceMappingURL=index.js.map