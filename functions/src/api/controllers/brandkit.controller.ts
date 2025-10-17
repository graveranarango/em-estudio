import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();

const getBrandKitRef = (userId: string) => {
  return db.collection('users').doc(userId).collection('brandkit').doc('config');
};

export const getBrandKit = async (req: Request, res: Response) => {
  const userId = res.locals.uid;
  if (!userId) {
    return res.status(401).send({ error: 'User not authenticated' });
  }

  try {
    const docRef = getBrandKitRef(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(200).send({ data: {} }); // Return empty object if not configured
    }

    return res.status(200).send({ data: doc.data() });
  } catch (error) {
    functions.logger.error('Error getting BrandKit:', error);
    return res.status(500).send({ error: 'Failed to get BrandKit' });
  }
};

export const updateBrandKit = async (req: Request, res: Response) => {
  const userId = res.locals.uid;
  if (!userId) {
    return res.status(401).send({ error: 'User not authenticated' });
  }

  const brandKitData = req.body;
  if (!brandKitData) {
    return res.status(400).send({ error: 'BrandKit data is required' });
  }

  try {
    const docRef = getBrandKitRef(userId);
    await docRef.set(brandKitData, { merge: true }); // Use merge to avoid overwriting all fields

    return res.status(200).send({ success: true, data: brandKitData });
  } catch (error) {
    functions.logger.error('Error updating BrandKit:', error);
    return res.status(500).send({ error: 'Failed to update BrandKit' });
  }
};