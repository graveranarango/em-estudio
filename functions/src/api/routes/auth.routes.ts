import { Router } from "express";
import { setRole } from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { hasRole } from "../middleware/hasRole";

export const router = Router();

// Solo los administradores pueden cambiar roles
router.post("/set-role", isAuthenticated, hasRole(["admin"]), setRole);
