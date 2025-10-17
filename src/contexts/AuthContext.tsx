import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut as firebaseSignOut, setPersistence, browserLocalPersistence, browserSessionPersistence, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [anonTried, setAnonTried] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (fbUser) => {
        // Permitir cualquier usuario autenticado de Firebase
        setUser(fbUser || null);
        setError(null);
        setIsLoading(false);

        // Open access mode: si no hay usuario, intenta login anónimo automáticamente
        const openAccess = import.meta.env.VITE_OPEN_ACCESS === 'true';
        if (openAccess && !fbUser && !anonTried) {
          setAnonTried(true);
          signInAnonymously(auth).catch(() => {/* ignore */});
        }
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
      await signInWithEmailAndPassword(auth, email, password);
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
