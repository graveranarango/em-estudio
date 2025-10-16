"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImage = void 0;
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const openai_1 = require("openai");
const axios_1 = require("axios");
const os = require("os");
const path = require("path");
const fs = require("fs");
const { CHATGPT_EM_ESTUDIO } = functions.config().secrets || {};
const openai = new openai_1.default({ apiKey: CHATGPT_EM_ESTUDIO });
const generateImage = async (req, res) => {
    var _a, _b;
    const { prompt } = req.body;
    const userId = res.locals.uid;
    if (!prompt) {
        return res.status(400).send({ error: 'Prompt is required' });
    }
    if (!userId) {
        return res.status(401).send({ error: 'User not authenticated' });
    }
    try {
        // 1. Generate image with DALL-E 3
        const imageResponse = await openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'url',
        });
        const imageUrl = (_b = (_a = imageResponse.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.url;
        if (!imageUrl) {
            throw new Error('Image generation failed or URL not provided.');
        }
        // 2. Download the image to a temporary file
        const response = await axios_1.default.get(imageUrl, { responseType: 'arraybuffer' });
        const tempFileName = `${Date.now()}_${path.basename(imageUrl).split('?')[0]}`;
        const tempFilePath = path.join(os.tmpdir(), tempFileName);
        fs.writeFileSync(tempFilePath, response.data);
        // 3. Upload to Firebase Storage
        const bucket = admin.storage().bucket();
        const destination = `users/${userId}/images/${tempFileName}`;
        await bucket.upload(tempFilePath, {
            destination: destination,
            metadata: {
                contentType: 'image/png',
            },
        });
        // 4. Get the public URL
        const file = bucket.file(destination);
        const [publicUrl] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491', // A very long expiration date
        });
        // 5. Clean up temporary file
        fs.unlinkSync(tempFilePath);
        return res.status(200).send({ imageUrl: publicUrl });
    }
    catch (error) {
        functions.logger.error('Error generating image:', error);
        return res.status(500).send({ error: 'Failed to generate image' });
    }
};
exports.generateImage = generateImage;
//# sourceMappingURL=image.controller.js.map