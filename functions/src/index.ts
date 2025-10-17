import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';

admin.initializeApp();

const { CHATGPT_EM_ESTUDIO } = functions.config().secrets || {};
const OPENAI_MODEL = functions.config().params?.OPENAI_MODEL || 'gpt-4o-mini';
const BRAND_GUARD_BANNED = (functions.config().params?.BRAND_GUARD_BANNED || '').split(',');
const BRAND_GUARD_STRICT = functions.config().params?.BRAND_GUARD_STRICT === 'true';

const openai = new OpenAI({ apiKey: CHATGPT_EM_ESTUDIO });

const runBrandGuard = (text: string) => {
  const findings: any[] = [];
  const lowerText = text.toLowerCase();
  const bannedFound = BRAND_GUARD_BANNED.filter((term: string) => term && lowerText.includes(term.toLowerCase()));
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

export const onUserMessageCreated = functions.firestore
  .document('users/{userId}/threads/{threadId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const newMessage = snap.data();
    if (newMessage.role !== 'user') return null;

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
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          // Update the same document with the concatenated string
          await assistantMessageRef.update({ content: fullResponse });
        }
      }

      const finalReport = runBrandGuard(fullResponse);
      await assistantMessageRef.update({
        isStreaming: false,
        brandGuardReport: finalReport,
      });

      return null;

    } catch (error) {
      functions.logger.error("Error processing message with OpenAI:", error);
      return messagesRef.add({
        role: 'assistant',
        content: 'Ha ocurrido un error al procesar tu solicitud.',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });