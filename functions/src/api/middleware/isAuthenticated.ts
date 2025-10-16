import { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import appLogger from "../../lib/logger";

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authorization.split("Bearer ")[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    (req as any).user = decodedToken;
    return next();
  } catch (err) {
    appLogger.error("Invalid ID token", err);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
