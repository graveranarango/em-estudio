"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recursiveDelete = void 0;
const functions = require("firebase-functions");
const firebase_tools_1 = require("firebase-tools");
const recursiveDelete = async (req, res) => {
    const userId = res.locals.uid;
    const { path } = req.body;
    if (!path) {
        return res.status(400).send({ error: 'Path is required' });
    }
    // Security check: Ensure the user is only deleting their own data.
    // This is a simple check; a more robust solution might involve more complex rules.
    if (!path.startsWith(`users/${userId}`)) {
        return res.status(403).send({ error: 'Permission denied' });
    }
    try {
        functions.logger.info(`User ${userId} requested to delete path: ${path}`);
        await firebase_tools_1.tools.firestore.delete(path, {
            project: process.env.GCLOUD_PROJECT,
            recursive: true,
            yes: true, // Auto-confirms deletion
        });
        return res.status(200).send({ success: true, message: `Successfully deleted path: ${path}` });
    }
    catch (error) {
        functions.logger.error('Error performing recursive delete:', error);
        return res.status(500).send({ error: 'Failed to perform recursive delete' });
    }
};
exports.recursiveDelete = recursiveDelete;
//# sourceMappingURL=utils.controller.js.map