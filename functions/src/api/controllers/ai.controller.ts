import { Request, Response } from "express";
import appLogger from "../../lib/logger";

export const generateText = async (req: Request, res: Response) => {
  appLogger.info("AI generate-text endpoint reached");
  return res.status(200).json({ success: true, message: "Text generated successfully." });
};

export const generateImage = async (req: Request, res: Response) => {
  appLogger.info("AI generate-image endpoint reached");
  return res.status(200).json({ success: true, message: "Image generated successfully." });
};
