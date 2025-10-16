import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  const split = authorization.split('Bearer ');
  if (split.length !== 2) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  const token = split[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.locals = { ...res.locals, uid: decodedToken.uid, role: decodedToken.role, email: decodedToken.email };
    return next();
  } catch (err: any) {
    console.error(`${err.code} -  ${err.message}`);
    return res.status(401).send({ message: 'Unauthorized' });
  }
};