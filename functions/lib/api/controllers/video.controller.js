"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVideo = void 0;
const functions = require("firebase-functions");
// A placeholder video URL
const MOCK_VIDEO_URL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const generateVideo = async (req, res) => {
    const { prompt } = req.body;
    const userId = res.locals.uid;
    if (!prompt) {
        return res.status(400).send({ error: 'Prompt is required' });
    }
    if (!userId) {
        return res.status(401).send({ error: 'User not authenticated' });
    }
    functions.logger.info(`Video generation requested by ${userId} with prompt: "${prompt}"`);
    // Simulate a delay for video processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    return res.status(200).send({ videoUrl: MOCK_VIDEO_URL });
};
exports.generateVideo = generateVideo;
//# sourceMappingURL=video.controller.js.map