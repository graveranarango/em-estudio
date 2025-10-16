import { onRequest } from "firebase-functions/v2/https";
import fetch from "node-fetch";

/**
 * Endpoint: /api/v1/video/generate
 * Proveedores disponibles:
 *  - runway  → API de RunwayML
 *  - veo     → Google Vertex AI (Veo-1)
 *  - sora    → OpenAI (Sora)
 */
export const generateVideo = onRequest(async (req, res): Promise<void> => {
  try {
    const { prompt, provider = "runway" } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Falta el campo 'prompt'." });
      return;
    }

    let apiKey: string | undefined;
    let apiUrl: string;
    let body: Record<string, any>;

    switch (provider.toLowerCase()) {
      // === Runway ML ===
      case "runway":
        apiKey = process.env.RUNWAY_API_KEY;
        apiUrl = "https://api.runwayml.com/v1/videos";
        body = { text_prompt: prompt };
        break;

      // === Google Vertex AI Veo-1 ===
      case "veo":
        apiUrl =
          "https://us-central1-aiplatform.googleapis.com/v1/projects/em-estudio/locations/us-central1/publishers/google/models/veo-1:generateContent";

        // Autenticación automática con la cuenta de servicio del proyecto
        const { GoogleAuth } = await import("google-auth-library");
        const auth = new GoogleAuth({
          scopes: ["https://www.googleapis.com/auth/cloud-platform"],
        });
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        apiKey = accessToken.token || undefined;

        // Estructura que el modelo Veo-1 acepta
        body = {
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        };
        break;

      // === OpenAI Sora / Sora2 ===
      case "sora":
      case "sora2":
        apiKey = process.env.SORA2_API_KEY || process.env.OPENAI_API_KEY;
        apiUrl = "https://api.openai.com/v1/sora/videos";
        body = { prompt };
        break;

      default:
        res.status(400).json({ error: `Proveedor no soportado: ${provider}` });
        return;
    }

    // Verificación de API-key (no aplica a Veo)
    if (!apiKey && provider !== "veo") {
      res.status(400).json({
        error: `No se encontró API key para el proveedor '${provider}'.`,
      });
      return;
    }

    // === Llamada al proveedor ===
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    if (!response.ok) {
      console.error("Error del proveedor:", response.status, text);
      res
        .status(response.status)
        .json({ error: `Error del proveedor ${provider}`, details: text });
      return;
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    res.status(200).json({ provider, success: true, data });
  } catch (error: any) {
    console.error("Error al generar video:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      details: error.message,
    });
  }
});
