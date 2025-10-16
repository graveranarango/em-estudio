import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenerativeAI } from "@google/generative-ai";
import textToSpeech from "@google-cloud/text-to-speech";
import { Storage } from "@google-cloud/storage";

// Vincula el secreto GEMINI_API_KEY
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

const tts = new textToSpeech.TextToSpeechClient();
const storage = new Storage();

export const geminiAI = onRequest({ secrets: [GEMINI_API_KEY] }, async (req, res): Promise<void> => {
  try {
    const { prompt, mode = "text" } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Falta el campo 'prompt'." });
      return;
    }

    const apiKey = GEMINI_API_KEY.value();
    if (!apiKey) {
      res.status(500).json({ error: "API key de Gemini no configurada." });
      return;
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 🎙️ Si el modo es "podcast", genera audio y guarda en Cloud Storage
    if (mode === "podcast") {
      const [audioResponse] = await tts.synthesizeSpeech({
        input: { text },
        voice: { languageCode: "es-US", ssmlGender: "MALE" },
        audioConfig: { audioEncoding: "MP3" },
      });

      const audioData = audioResponse.audioContent;
      if (!audioData) {
        res.status(500).json({ error: "No se generó audio." });
        return;
      }

      const bucket = storage.bucket("em-estudio.appspot.com");
      const file = bucket.file(`podcasts/${Date.now()}.mp3`);
      await file.save(audioData as Buffer, { contentType: "audio/mpeg" });

      res.json({
        type: "podcast",
        text,
        audioUrl: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
      });
      return;
    }

    res.json({ type: "text", reply: text });
  } catch (error) {
    console.error("Error con Gemini:", error);
    res.status(500).json({ error: "Error al conectar con Gemini" });
  }
});
