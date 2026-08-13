import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, isFirebaseConfigured } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
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
          let favorites = [];
          let vehicle = null;
          let isAdmin = false;

          if (isFirebaseConfigured) {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const data = userSnap.data();
              points = data.points || 0;
              favorites = data.favorites || [];
              vehicle = data.vehicle || null;
              isAdmin = data.isAdmin || false;
            } else {
              await setDoc(userRef, { 
                points: 0, 
                name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Utilisateur', 
                email: currentUser.email,
                favorites: [],
                vehicle: null,
                isAdmin: false
              });
            }
          }
          setUser({
            id: currentUser.uid,
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Utilisateur',
            email: currentUser.email,
            points,
            favorites,
            vehicle,
            isAdmin
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

  const toggleFavorite = async (stationId) => {
    if (!isAuthenticated || !user) return;
    try {
      const isFav = user.favorites?.includes(stationId);
      const newFavorites = isFav 
        ? user.favorites.filter(id => id !== stationId)
        : [...(user.favorites || []), stationId];
      
      await updateUserProfile({ favorites: newFavorites });
    } catch (err) {
      console.error(err);
    }
  };

  const updateUserProfile = async (data) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    
    if (isFirebaseConfigured) {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, data);
    } else {
      localStorage.setItem('evtn_user', JSON.stringify(updatedUser));
    }
  };

  const getAllUsers = async () => {
    if (!isFirebaseConfigured) {
      // Mock data if no firebase
      return [
        { id: '1', name: 'John Doe', email: 'john@example.com', points: 150, isAdmin: true },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', points: 80, isAdmin: false }
      ];
    }
    try {
      const q = query(collection(db, 'users'), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Error fetching all users:", e);
      return [];
    }
  };

  const updateUserRole = async (userId, isAdmin) => {
    if (!isFirebaseConfigured) return;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isAdmin });
    } catch (e) {
      console.error("Error updating user role:", e);
    }
  };

  const getLeaderboard = async () => {
    if (!isFirebaseConfigured) return [];
    try {
      const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Error fetching leaderboard:", e);
      return [];
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      signup, 
      logout, 
      addPoints, 
      loginWithGoogle,
      toggleFavorite,
      updateUserProfile,
      getLeaderboard,
      getAllUsers,
      updateUserRole
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
