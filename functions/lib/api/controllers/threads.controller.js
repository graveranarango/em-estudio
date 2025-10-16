"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchFromMessage = exports.switchBranch = exports.deleteBranch = exports.renameBranch = exports.createBranch = exports.deleteThread = exports.renameThread = exports.createThread = exports.listThreads = void 0;
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const listThreads = async (req, res) => {
    try {
        const threadsRef = admin.firestore().collection('threads').orderBy('createdAt', 'desc');
        const snapshot = await threadsRef.get();
        const threads = await Promise.all(snapshot.docs.map(async (doc) => {
            const threadData = doc.data();
            const branchesRef = doc.ref.collection('branches');
            const branchesSnapshot = await branchesRef.get();
            const branches = branchesSnapshot.docs.map(branchDoc => (Object.assign({ id: branchDoc.id }, branchDoc.data())));
            return Object.assign(Object.assign({ id: doc.id }, threadData), { branches });
        }));
        res.status(200).send({ threads });
    }
    catch (error) {
        functions.logger.error("Error listing threads:", error);
        res.status(500).send({ error: "Failed to list threads." });
    }
};
exports.listThreads = listThreads;
const createThread = async (req, res) => {
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
    }
    catch (error) {
        functions.logger.error("Error creating thread:", error);
        res.status(500).send({ error: "Failed to create thread." });
    }
};
exports.createThread = createThread;
const renameThread = async (req, res) => {
    const { threadId, title } = req.body;
    if (!threadId || !title) {
        res.status(400).send({ error: "Missing 'threadId' or 'title' in request body" });
        return;
    }
    try {
        await admin.firestore().collection('threads').doc(threadId).update({ title });
        res.status(200).send({ ok: true });
    }
    catch (error) {
        functions.logger.error("Error renaming thread:", error);
        res.status(500).send({ error: "Failed to rename thread." });
    }
};
exports.renameThread = renameThread;
const deleteThread = async (req, res) => {
    const { threadId } = req.body;
    if (!threadId) {
        res.status(400).send({ error: "Missing 'threadId' in request body" });
        return;
    }
    try {
        await admin.firestore().collection('threads').doc(threadId).delete();
        res.status(200).send({ ok: true });
    }
    catch (error) {
        functions.logger.error("Error deleting thread:", error);
        res.status(500).send({ error: "Failed to delete thread." });
    }
};
exports.deleteThread = deleteThread;
const createBranch = async (req, res) => {
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
    }
    catch (error) {
        functions.logger.error("Error creating branch:", error);
        res.status(500).send({ error: "Failed to create branch." });
    }
};
exports.createBranch = createBranch;
const renameBranch = async (req, res) => {
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
    }
    catch (error) {
        functions.logger.error("Error renaming branch:", error);
        res.status(500).send({ error: "Failed to rename branch." });
    }
};
exports.renameBranch = renameBranch;
const deleteBranch = async (req, res) => {
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
    }
    catch (error) {
        functions.logger.error("Error deleting branch:", error);
        res.status(500).send({ error: "Failed to delete branch." });
    }
};
exports.deleteBranch = deleteBranch;
// Placeholder for switchBranch and branchFromMessage
const switchBranch = async (req, res) => {
    res.status(501).send({ message: 'Not implemented' });
};
exports.switchBranch = switchBranch;
const branchFromMessage = async (req, res) => {
    res.status(501).send({ message: 'Not implemented' });
};
exports.branchFromMessage = branchFromMessage;
//# sourceMappingURL=threads.controller.js.map