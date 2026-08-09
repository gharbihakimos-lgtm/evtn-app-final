import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, isFirebaseConfigured } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      const storedUser = localStorage.getItem('evtn_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          id: currentUser.uid,
          name: currentUser.displayName || currentUser.email.split('@')[0],
          email: currentUser.email
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    if (!isFirebaseConfigured) {
      const mockUser = { id: 'mock-id', name: email.split('@')[0], email };
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('evtn_user', JSON.stringify(mockUser));
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (name, email, password) => {
    if (!isFirebaseConfigured) {
      const mockUser = { id: 'mock-id', name, email };
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('evtn_user', JSON.stringify(mockUser));
      return;
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    setUser(prev => ({ ...prev, name }));
  };

  const logout = async () => {
    if (!isFirebaseConfigured) {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('evtn_user');
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
