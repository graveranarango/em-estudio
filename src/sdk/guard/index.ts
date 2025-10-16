import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { GuardInput, GuardCheckResponse, BrandKit } from "./types";
import { FUNCTIONS_BASE_URL, FUNCTIONS_TOKEN, functionsUrl } from "../../utils/backend";

/**
 * Inicialización de Firebase (sustituye Supabase)
 */
const firebaseConfig = {
  apiKey: "AIzaSyBQb8sz5oZVmmk9tOf49CbtAzaHLxwzIJw",
  authDomain: "em-estudio.firebaseapp.com",
  projectId: "em-estudio",
  storageBucket: "em-estudio.firebasestorage.app",
  messagingSenderId: "642931774003",
  appId: "1:642931774003:web:b1970320faf53bd7874946"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * SDK principal: BrandGuardSDK
 * Encargado de validar tono, mensajes y cumplimiento de marca
 */
export class BrandGuardSDK {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    // En producción apunta al endpoint real de Firebase Functions
    this.baseUrl = FUNCTIONS_BASE_URL;
    this.headers = {
      "Authorization": `Bearer ${FUNCTIONS_TOKEN}`,
      "Content-Type": "application/json"
    };
  }

  /** Verificación de texto contra directrices de marca */
  async checkText(input: GuardInput): Promise<GuardCheckResponse> {
    try {
      const response = await fetch(functionsUrl('/api/guard/check'), {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ input })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Brand guard check failed: ${errorData.error || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[Brand Guard SDK] Check error:", error);

      // Respuesta de contingencia
      return {
        report: {
          score: 75,
          findings: [{
            type: "compliance",
            severity: "info",
            message: "Análisis de marca no disponible temporalmente",
            suggestion: "Revisa manualmente según directrices de marca"
          }],
          disclaimerNeeded: false
        }
      };
    }
  }

  /** Pre-chequeo del mensaje del usuario antes del envío */
  async preCheckUserMessage(
    text: string,
    brand: BrandKit,
    context?: { objective?: string; audience?: string }
  ): Promise<GuardCheckResponse> {
    return this.checkText({
      text,
      role: "user",
      brand,
      context
    });
  }

  /** Post-chequeo de la respuesta del asistente antes de mostrarla */
  async postCheckAssistantMessage(
    text: string,
    brand: BrandKit,
    context?: { objective?: string; audience?: string }
  ): Promise<GuardCheckResponse> {
    return this.checkText({
      text,
      role: "assistant",
      brand,
      context
    });
  }

  /** Actualización de reglas del guard de marca (solo admin) */
  async updateRules(patch: Partial<BrandKit>, adminToken: string): Promise<{ ok: boolean; updated?: BrandKit }> {
    try {
      const response = await fetch(functionsUrl('/api/guard/rules/update'), {
        method: "POST",
        headers: {
          ...this.headers,
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ patch })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Rules update failed: ${errorData.error || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[Brand Guard SDK] Rules update error:", error);
      throw error;
    }
  }

  /** Conversión de BrandKit a formato BrandGuard */
  convertBrandKitToBrandGuard(brandKitData: any): BrandKit {
    const voiceToneStyle = brandKitData.voiceTone?.style || "";
    const incorrectExamples = brandKitData.voiceTone?.examples?.incorrect || [];

    let toneDoList = ["profesional", "claro", "consistente"];
    let toneDontList = ["agresivo", "confuso", "inconsistente"];

    if (voiceToneStyle.toLowerCase().includes("profesional")) {
      toneDoList.push("formal", "cortés");
    }
    if (voiceToneStyle.toLowerCase().includes("cercano") || voiceToneStyle.toLowerCase().includes("amigable")) {
      toneDoList.push("cercano", "amigable");
      toneDontList.push("frío", "distante");
    }

    return {
      tone: {
        do: toneDoList,
        dont: toneDontList,
        readingLevel: "neutral"
      },
      lexicon: {
        preferred: brandKitData.messaging?.differentiators || [],
        avoid: incorrectExamples.map((ex: string) => ex.split(" ").slice(0, 2).join(" ")).filter(Boolean),
        banned: ["spam", "scam", "fake", "gratis!!!"]
      },
      style: {
        emoji: true,
        exclamationMax: voiceToneStyle.toLowerCase().includes("enérgico") ? 3 : 1,
        linksPolicy: "need-disclaimer"
      },
      claims: {
        allowed: [
          ...(brandKitData.messaging?.slogans || []),
          ...(brandKitData.messaging?.differentiators || []),
          brandKitData.messaging?.tagline
        ].filter(Boolean),
        forbidden: ["el mejor del mundo", "100% garantizado", "imposible de fallar", "nunca falla"],
        needsDisclaimer: ["resultados pueden variar", "sujeto a términos", "disponibilidad limitada"]
      },
      disclaimers: {
        standard: "Esta información se proporciona solo con fines informativos.",
        legal: "Consulte los términos y condiciones completos."
      },
      locales: brandKitData.internationalization?.supportedLanguages || ["es"]
    };
  }
}

// Exportar instancia global
export const brandGuardSDK = new BrandGuardSDK();

// Exportar tipos
export * from "./types";
