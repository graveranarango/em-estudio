import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut as firebaseSignOut, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const allowedEmail = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
    const unsubscribe = onAuthStateChanged(
      auth,
      (fbUser) => {
        // If an admin email is configured, restrict access to that email only.
        if (fbUser) {
          if (allowedEmail && fbUser.email !== allowedEmail) {
            setUser(null);
            setError(new Error('Este usuario no está autorizado. Verifica VITE_ADMIN_EMAIL.'));
          } else {
            setUser(fbUser);
            setError(null);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const login = async (email, password, remember = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const persistence = remember ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const allowedEmail = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
      if (allowedEmail && cred.user?.email !== allowedEmail) {
        // Sign out immediately if not authorized to avoid a flicker
        await firebaseSignOut(auth);
        throw new Error('Usuario no autorizado para acceder.');
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
