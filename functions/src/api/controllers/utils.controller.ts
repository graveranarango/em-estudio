import { Request, Response } from 'express';
import * as functions from 'firebase-functions';
import { tools } from 'firebase-tools';

export const recursiveDelete = async (req: Request, res: Response) => {
  const userId = res.locals.uid;
  const { path } = req.body;

  if (!path) {
    return res.status(400).send({ error: 'Path is required' });
  }

  // Security check: Ensure the user is only deleting their own data.
  // This is a simple check; a more robust solution might involve more complex rules.
  if (!path.startsWith(`users/${userId}`)) {
    return res.status(403).send({ error: 'Permission denied' });
  }

  try {
    functions.logger.info(`User ${userId} requested to delete path: ${path}`);

    await tools.firestore.delete(path, {
      project: process.env.GCLOUD_PROJECT,
      recursive: true,
      yes: true, // Auto-confirms deletion
    });

    return res.status(200).send({ success: true, message: `Successfully deleted path: ${path}` });

  } catch (error: any) {
    functions.logger.error('Error performing recursive delete:', error);
    return res.status(500).send({ error: 'Failed to perform recursive delete' });
  }
};