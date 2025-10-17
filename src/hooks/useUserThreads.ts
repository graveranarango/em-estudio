import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Thread } from '../types/chat'; // Assuming a Thread type exists

export function useUserThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const auth = getAuth();
  const firestore = getFirestore();

  useEffect(() => {
    const fetchThreads = async () => {
      if (!auth.currentUser) {
        setIsLoading(false);
        // User not logged in, no threads to fetch
        return;
      }

      try {
        const userId = auth.currentUser.uid;
        const threadsRef = collection(firestore, 'users', userId, 'threads');
        const q = query(threadsRef, orderBy('updatedAt', 'desc'), limit(20));

        const querySnapshot = await getDocs(q);
        const userThreads = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Thread[];

        setThreads(userThreads);
      } catch (err) {
        console.error("Error fetching user threads:", err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
  }, [auth.currentUser, firestore]);

  return { threads, isLoading, error };
}