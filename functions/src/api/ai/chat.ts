import { onRequest } from "firebase-functions/v2/https";
import fetch from "node-fetch";

/**
 * Endpoint: /api/v1/ai/chat
 * Modelo: GPT-5 (OpenAI)
 */
export const chatAI = onRequest(async (req, res): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Falta el campo 'prompt'." });
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      }),
    });

    // 👇 Le decimos a TypeScript que la respuesta tiene la estructura esperada
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const message = data.choices?.[0]?.message?.content || "Sin respuesta generada.";
    res.json({ reply: message });
  } catch (error) {
    console.error("Error en chatAI:", error);
    res.status(500).json({ error: "Error al conectar con GPT-5" });
  }
});
