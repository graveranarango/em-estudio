import { Router } from "express";
import { generateText, generateImage } from "../controllers/ai.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { hasRole } from "../middleware/hasRole";

const router = Router();

// 🔒 Todas las rutas de IA requieren autenticación
router.use(isAuthenticated);

// ✍️ Generar texto con IA (Gemini)
router.post("/generate-text", hasRole(["editor", "admin"]), generateText);

// 🖼️ Generar imagen con IA
router.post("/generate-image", hasRole(["editor", "admin"]), generateImage);

export default router;

