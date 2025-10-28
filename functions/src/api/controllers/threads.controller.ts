import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const listThreads = async (req: Request, res: Response) => {
  try {
    const threadsRef = admin.firestore().collection('threads').orderBy('createdAt', 'desc');
    const snapshot = await threadsRef.get();

    const threads = await Promise.all(snapshot.docs.map(async (doc) => {
      const threadData = doc.data();
      const branchesRef = doc.ref.collection('branches');
      const branchesSnapshot = await branchesRef.get();
      const branches = branchesSnapshot.docs.map(branchDoc => ({
        id: branchDoc.id,
        ...branchDoc.data()
      }));

      return {
        id: doc.id,
        ...threadData,
        branches
      };
    }));

    res.status(200).send({ threads });
  } catch (error) {
    functions.logger.error("Error listing threads:", error);
    res.status(500).send({ error: "Failed to list threads." });
  }
};

export const createThread = async (req: Request, res: Response) => {
  const { title } = req.body;

  if (!title) {
    res.status(400).send({ error: "Missing 'title' in request body" });
    return;
  }

  try {
    const newThreadRef = await admin.firestore().collection('threads').add({
      title,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const defaultBranchRef = await newThreadRef.collection('branches').add({
      name: 'main',
      isDefault: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).send({ id: newThreadRef.id, branchId: defaultBranchRef.id });
  } catch (error) {
    functions.logger.error("Error creating thread:", error);
    res.status(500).send({ error: "Failed to create thread." });
  }
};

export const renameThread = async (req: Request, res: Response) => {
  const { threadId, title } = req.body;

  if (!threadId || !title) {
    res.status(400).send({ error: "Missing 'threadId' or 'title' in request body" });
    return;
  }

  try {
    await admin.firestore().collection('threads').doc(threadId).update({ title });
    res.status(200).send({ ok: true });
  } catch (error) {
    functions.logger.error("Error renaming thread:", error);
    res.status(500).send({ error: "Failed to rename thread." });
  }
};

export const deleteThread = async (req: Request, res: Response) => {
  const { threadId } = req.body;

  if (!threadId) {
    res.status(400).send({ error: "Missing 'threadId' in request body" });
    return;
  }

  try {
    await admin.firestore().collection('threads').doc(threadId).delete();
    res.status(200).send({ ok: true });
  } catch (error) {
    functions.logger.error("Error deleting thread:", error);
    res.status(500).send({ error: "Failed to delete thread." });
  }
};

export const createBranch = async (req: Request, res: Response) => {
  const { threadId, name } = req.body;

  if (!threadId || !name) {
    res.status(400).send({ error: "Missing 'threadId' or 'name' in request body" });
    return;
  }

  try {
    const newBranchRef = await admin.firestore()
      .collection('threads').doc(threadId)
      .collection('branches').add({
        name,
        isDefault: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.status(200).send({ id: newBranchRef.id });
  } catch (error) {
    functions.logger.error("Error creating branch:", error);
    res.status(500).send({ error: "Failed to create branch." });
  }
};

export const renameBranch = async (req: Request, res: Response) => {
  const { threadId, branchId, name } = req.body;

  if (!threadId || !branchId || !name) {
    res.status(400).send({ error: "Missing 'threadId', 'branchId', or 'name' in request body" });
    return;
  }

  try {
    await admin.firestore()
      .collection('threads').doc(threadId)
      .collection('branches').doc(branchId)
      .update({ name });
    res.status(200).send({ ok: true });
  } catch (error) {
    functions.logger.error("Error renaming branch:", error);
    res.status(500).send({ error: "Failed to rename branch." });
  }
};

export const deleteBranch = async (req: Request, res: Response) => {
  const { threadId, branchId } = req.body;

  if (!threadId || !branchId) {
    res.status(400).send({ error: "Missing 'threadId' or 'branchId' in request body" });
    return;
  }

  try {
    await admin.firestore()
      .collection('threads').doc(threadId)
      .collection('branches').doc(branchId)
      .delete();
    res.status(200).send({ ok: true });
  } catch (error) {
    functions.logger.error("Error deleting branch:", error);
    res.status(500).send({ error: "Failed to delete branch." });
  }
};

export const switchBranch = async (req: Request, res: Response) => {
  const { threadId, branchId } = req.body;

  if (!threadId || !branchId) {
    res.status(400).send({ error: "Missing 'threadId' or 'branchId' in request body" });
    return;
  }

  try {
    // Verify that the branch exists
    const branchRef = admin.firestore()
      .collection('threads').doc(threadId)
      .collection('branches').doc(branchId);

    const branchDoc = await branchRef.get();

    if (!branchDoc.exists) {
      res.status(404).send({ error: "Branch not found" });
      return;
    }

    // Update the thread to mark this as the active branch
    await admin.firestore()
      .collection('threads').doc(threadId)
      .update({
        activeBranchId: branchId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.status(200).send({ ok: true, branchId });
  } catch (error) {
    functions.logger.error("Error switching branch:", error);
    res.status(500).send({ error: "Failed to switch branch." });
  }
};

export const branchFromMessage = async (req: Request, res: Response) => {
  const { threadId, messageId, name } = req.body;

  if (!threadId || !messageId) {
    res.status(400).send({ error: "Missing 'threadId' or 'messageId' in request body" });
    return;
  }

  try {
    // Create a new branch with default name if not provided
    const branchName = name || `rama-${Date.now()}`;

    const newBranchRef = await admin.firestore()
      .collection('threads').doc(threadId)
      .collection('branches').add({
        name: branchName,
        isDefault: false,
        branchedFromMessageId: messageId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    // Copy messages up to and including the specified messageId to the new branch
    // This would require finding the message across branches, which is complex
    // For now, we'll just create an empty branch that references the message

    res.status(200).send({
      branchId: newBranchRef.id,
      name: branchName
    });
  } catch (error) {
    functions.logger.error("Error branching from message:", error);
    res.status(500).send({ error: "Failed to create branch from message." });
  }
};

// === Messages APIs ===
export const getMessages = async (req: Request, res: Response) => {
  const threadId = (req.query.threadId as string) || '';
  const branchId = (req.query.branchId as string) || '';

  if (!threadId || !branchId) {
    return res.status(400).send({ error: "Missing 'threadId' or 'branchId' in query" });
  }

  try {
    const messagesRef = admin
      .firestore()
      .collection('threads')
      .doc(threadId)
      .collection('branches')
      .doc(branchId)
      .collection('messages');

    const snap = await messagesRef.orderBy('createdAt', 'asc').get();
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.status(200).send({ messages });
  } catch (error) {
    functions.logger.error('Error getting messages:', error);
    return res.status(500).send({ error: 'Failed to get messages.' });
  }
};

export const addMessage = async (req: Request, res: Response) => {
  const { threadId, branchId, message } = req.body || {};
  if (!threadId || !branchId || !message) {
    return res.status(400).send({ error: "Missing 'threadId', 'branchId' or 'message' in body" });
  }

  try {
    const messagesRef = admin
      .firestore()
      .collection('threads')
      .doc(threadId)
      .collection('branches')
      .doc(branchId)
      .collection('messages');

    const payload = {
      ...message,
      createdAt: message.createdAt || admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await messagesRef.add(payload);
    return res.status(200).send({ id: docRef.id, createdAt: payload.createdAt });
  } catch (error) {
    functions.logger.error('Error adding message:', error);
    return res.status(500).send({ error: 'Failed to add message.' });
  }
};
