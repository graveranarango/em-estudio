import { Router } from "express";
import { getAsset } from "../controllers/asset.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

const router = Router();

// 🔒 Todas las rutas de assets requieren autenticación
router.use(isAuthenticated);

// 📦 Obtener un asset por proyecto y ID
router.get("/:projectId/assets/:assetId", getAsset);

export default router;
