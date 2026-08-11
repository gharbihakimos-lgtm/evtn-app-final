import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, isFirebaseConfigured } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult
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
        try {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch (e) {
          setUser(null);
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          let points = 0;
          if (isFirebaseConfigured) {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              points = userSnap.data().points || 0;
            } else {
              await setDoc(userRef, { points: 0, name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Utilisateur', email: currentUser.email });
            }
          }
          setUser({
            id: currentUser.uid,
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Utilisateur',
            email: currentUser.email,
            points
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    });

    if (isFirebaseConfigured) {
      getRedirectResult(auth).catch((error) => {
        console.error('Google redirect error:', error);
      });
    }

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

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      const mockUser = { id: 'mock-google', name: 'Google User', email: 'google@example.com' };
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('evtn_user', JSON.stringify(mockUser));
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
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

  const addPoints = async (amount) => {
    if (!user) return;
    const newPoints = (user.points || 0) + amount;
    setUser(prev => ({ ...prev, points: newPoints }));
    if (isFirebaseConfigured) {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { points: increment(amount) });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, addPoints, loginWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
