"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserMessageCreated = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const openai_1 = require("openai");
admin.initializeApp();
const { CHATGPT_EM_ESTUDIO } = functions.config().secrets || {};
const OPENAI_MODEL = ((_a = functions.config().params) === null || _a === void 0 ? void 0 : _a.OPENAI_MODEL) || 'gpt-4o-mini';
const BRAND_GUARD_BANNED = (((_b = functions.config().params) === null || _b === void 0 ? void 0 : _b.BRAND_GUARD_BANNED) || '').split(',');
const BRAND_GUARD_STRICT = ((_c = functions.config().params) === null || _c === void 0 ? void 0 : _c.BRAND_GUARD_STRICT) === 'true';
const openai = new openai_1.default({ apiKey: CHATGPT_EM_ESTUDIO });
const runBrandGuard = (text) => {
    const findings = [];
    const lowerText = text.toLowerCase();
    const bannedFound = BRAND_GUARD_BANNED.filter((term) => term && lowerText.includes(term.toLowerCase()));
    if (bannedFound.length > 0) {
        findings.push({
            type: 'Banned Term',
            message: `Contiene términos no permitidos: ${bannedFound.join(', ')}.`,
            suggestion: 'Reemplaza estos términos.',
        });
    }
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 1) {
        findings.push({
            type: 'Excessive Punctuation',
            message: `Contiene ${exclamationCount} exclamaciones.`,
            suggestion: text.replace(/!+/g, '!'),
        });
    }
    const allCapsWords = text.match(/\b[A-Z]{4,}\b/g) || [];
    if (allCapsWords.length > 0) {
        findings.push({
            type: 'Excessive Uppercasing',
            message: `Contiene mayúsculas: ${allCapsWords.join(', ')}.`,
            suggestion: 'Usa minúsculas.',
        });
    }
    return { score: 100 - (findings.length * 25), findings, passed: findings.length === 0 };
};
exports.onUserMessageCreated = functions.firestore
    .document('users/{userId}/threads/{threadId}/messages/{messageId}')
    .onCreate(async (snap, context) => {
    var _a, e_1, _b, _c;
    var _d, _e;
    const newMessage = snap.data();
    if (newMessage.role !== 'user')
        return null;
    const { userId, threadId } = context.params;
    const messagesRef = admin.firestore().collection('users').doc(userId).collection('threads').doc(threadId).collection('messages');
    const userReport = runBrandGuard(newMessage.content);
    if (!userReport.passed && BRAND_GUARD_STRICT) {
        return messagesRef.add({
            role: 'assistant',
            content: 'Tu mensaje no cumple con las políticas de marca.',
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
        // 1. Create an empty assistant message document to get its ID
        const assistantMessageRef = await messagesRef.add({
            role: 'assistant',
            content: '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isStreaming: true,
        });
        const stream = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [{ role: 'system', content: 'You are a helpful AI assistant.' }, ...contextMessages],
            stream: true,
        });
        let fullResponse = '';
        try {
            for (var _f = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = await stream_1.next(), _a = stream_1_1.done, !_a; _f = true) {
                _c = stream_1_1.value;
                _f = false;
                const chunk = _c;
                const content = ((_e = (_d = chunk.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content) || '';
                if (content) {
                    fullResponse += content;
                    // Update the same document with the concatenated string
                    await assistantMessageRef.update({ content: fullResponse });
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_f && !_a && (_b = stream_1.return)) await _b.call(stream_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        const finalReport = runBrandGuard(fullResponse);
        await assistantMessageRef.update({
            isStreaming: false,
            brandGuardReport: finalReport,
        });
        return null;
    }
    catch (error) {
        functions.logger.error("Error processing message with OpenAI:", error);
        return messagesRef.add({
            role: 'assistant',
            content: 'Ha ocurrido un error al procesar tu solicitud.',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
});
//# sourceMappingURL=index.js.map