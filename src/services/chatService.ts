import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { recursiveDelete } from './utilsService'; // Import the new function

// --- Existing functions like uploadFile, subscribeToGroups, etc. would be here ---

export const deleteThread = async (userId: string, threadId: string): Promise<void> => {
  const path = `users/${userId}/threads/${threadId}`;
  await recursiveDelete(path);
};

export const deleteGroup = async (userId: string, groupId: string): Promise<void> => {
    const path = `users/${userId}/groups/${groupId}`;
    await recursiveDelete(path);
};

// --- Other functions ---