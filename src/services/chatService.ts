import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

const storage = getStorage();

export const uploadFile = async (userId: string, file: File): Promise<string> => {
  const storageRef = ref(storage, `users/${userId}/attachments/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const subscribeToGroups = (userId: string, callback: (groups: any[]) => void) => {
  const groupsRef = collection(db, 'users', userId, 'groups');
  const q = query(groupsRef, orderBy('createdAt', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(groups);
  });

  return unsubscribe;
};

export const updateMessageContent = async (
  userId: string,
  threadId: string,
  messageId: string,
  newContent: string
): Promise<void> => {
  const messageRef = doc(db, 'users', userId, 'threads', threadId, 'messages', messageId);
  await updateDoc(messageRef, {
    content: newContent,
    // Optionally, clear the report after applying suggestion
    brandGuardReport: null,
  });
};

export const subscribeToThreads = (userId: string, groupId: string, callback: (threads: any[]) => void) => {
  const threadsRef = collection(db, 'users', userId, 'groups', groupId, 'threads');
  const q = query(threadsRef, orderBy('createdAt', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const threads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(threads);
  });

  return unsubscribe;
};