import { Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import appLogger from "../../lib/logger";
import { auditService } from "../services/audit.service";

export const setRole = async (req: Request, res: Response) => {
  const { uid, newRole } = req.body;
  const validRoles = ["admin", "editor", "usuario"];

  if (!validRoles.includes(newRole)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    await getAuth().setCustomUserClaims(uid, { role: newRole });
    await getFirestore().collection("users").doc(uid).update({ role: newRole });
    await getAuth().revokeRefreshTokens(uid);

    await auditService.record({
      uid,
      role: "admin",
      action: "auth:set-role",
      resource: { type: "user", id: uid },
      status: "success",
    });

    appLogger.info(`Role updated for user ${uid} → ${newRole}`);
    return res.status(200).json({ message: `Role updated to ${newRole}` });
  } catch (err) {
    appLogger.error("Error setting role", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
