import { Request, Response } from "express";
import appLogger from "../../lib/logger";

export const getAsset = async (req: Request, res: Response) => {
  const { projectId, assetId } = req.params;
  appLogger.info(`Fetching asset ${assetId} from project ${projectId}`);
  return res.status(200).json({ success: true, projectId, assetId });
};

