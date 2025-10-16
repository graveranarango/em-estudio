import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

export const createPost = async (postData: any) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const postsRef = collection(db, 'users', user.uid, 'posts');
  await addDoc(postsRef, {
    ...postData,
    createdAt: serverTimestamp(),
    authorId: user.uid,
  });
};

export const getPosts = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const postsRef = collection(db, 'users', user.uid, 'posts');
  const q = query(postsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Other post service functions (update, delete) will be added here