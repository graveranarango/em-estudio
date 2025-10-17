import { db } from '../firebase';
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
  setDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

export const subscribeToMessages = (
  userId: string,
  threadId: string,
  callback: (messages: any[]) => void
) => {
  const messagesRef = collection(db, 'users', userId, 'threads', threadId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
  return unsubscribe;
};

export const ensureDefaultGroupAndThread = async (
  userId: string
): Promise<{ groupId: string; threadId: string }> => {
  const groupsRef = collection(db, 'users', userId, 'groups');
  const groupsSnap = await getDocs(groupsRef);
  if (!groupsSnap.empty) {
    const firstGroup = groupsSnap.docs[0];
    const threadsRef = collection(db, 'users', userId, 'groups', firstGroup.id, 'threads');
    const threadsSnap = await getDocs(threadsRef);
    if (!threadsSnap.empty) {
      const firstThread = threadsSnap.docs[0];
      return { groupId: firstGroup.id, threadId: firstThread.id };
    }
    const newThread = await addDoc(threadsRef, {
      title: 'Chat Maestro',
      createdAt: serverTimestamp(),
    });
    await setDoc(doc(db, 'users', userId, 'threads', newThread.id), {
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, 'users', userId, 'threads', newThread.id, 'messages'), {
      role: 'assistant',
      content: 'Bienvenido a Chat Maestro. ¡Escribe para comenzar!',
      createdAt: serverTimestamp(),
    });
    return { groupId: firstGroup.id, threadId: newThread.id };
  }

  const newGroup = await addDoc(groupsRef, {
    name: 'General',
    createdAt: serverTimestamp(),
  });

  const threadsRef = collection(db, 'users', userId, 'groups', newGroup.id, 'threads');
  const newThread = await addDoc(threadsRef, {
    title: 'Chat Maestro',
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, 'users', userId, 'threads', newThread.id), {
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, 'users', userId, 'threads', newThread.id, 'messages'), {
    role: 'assistant',
    content: 'Bienvenido a Chat Maestro. ¡Escribe para comenzar!',
    createdAt: serverTimestamp(),
  });

  return { groupId: newGroup.id, threadId: newThread.id };
};

export const addUserMessage = async (
  userId: string,
  threadId: string,
  content: string
) => {
  const messagesRef = collection(db, 'users', userId, 'threads', threadId, 'messages');
  await addDoc(messagesRef, {
    role: 'user',
    content,
    createdAt: serverTimestamp(),
  });
};
