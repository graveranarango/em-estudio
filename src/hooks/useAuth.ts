import { useEffect } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuthStore } from '../state/authStore';

export const useAuth = () => {
  const { setUser, setLoading, setError } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    }, (error) => {
      setError(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, setError]);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await auth.signOut();
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { ...useAuthStore((state) => state), signIn, signOut };
};