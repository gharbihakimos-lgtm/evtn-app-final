import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockStations } from '../data/mockStations';
import { db, storage, isFirebaseConfigured } from '../config/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from './AuthContext';
import { useOpenChargeMap } from '../hooks/useOpenChargeMap';

const StationsContext = createContext();

export function StationsProvider({ children }) {
  const [firebaseStations, setFirebaseStations] = useState(mockStations);
  const { ocmStations } = useOpenChargeMap();

  // Combine Firebase stations + mockStations + OCM stations, avoiding duplicates
  const stations = React.useMemo(() => {
    const combined = [...firebaseStations];
    
    // Merge mockStations (the 28 real stations) if not yet in Firebase
    mockStations.forEach(mock => {
      const exists = combined.some(s => s.id === mock.id || (Math.abs(s.lat - mock.lat) < 0.001 && Math.abs(s.lng - mock.lng) < 0.001));
      if (!exists) combined.push(mock);
    });

    // Merge live OCM stations
    (ocmStations || []).forEach(ocm => {
      const exists = combined.some(s => s.id === ocm.id || (Math.abs(s.lat - ocm.lat) < 0.001 && Math.abs(s.lng - ocm.lng) < 0.001));
      if (!exists) combined.push(ocm);
    });

    return combined;
  }, [firebaseStations, ocmStations]);

  const [filteredStations, setFilteredStations] = useState(mockStations);
  const [selectedStation, setSelectedStation] = useState(null);
  const [filters, setFilters] = useState({
    minPower: 0,
    connectorType: '',
    status: '',
    searchQuery: '',
    favoritesOnly: false,
    compatibleOnly: false,
  });
  const { addPoints, user } = useAuth();

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    
    const unsubscribe = onSnapshot(collection(db, 'stations'), 
      (snapshot) => {
        const stationsData = snapshot.docs.map(doc => {
          const data = doc.data();
          let normalizedStatus = data.status;
          if (normalizedStatus === 'Disponible') normalizedStatus = 'available';
          if (normalizedStatus === 'Occupée') normalizedStatus = 'busy';
          if (normalizedStatus === 'Hors service') normalizedStatus = 'offline';
          return {
            id: doc.id,
            ...data,
            status: normalizedStatus
          };
        });
        if (!window.hasSeeded) {
          window.hasSeeded = true;
          mockStations.forEach(async (station) => {
            try {
              const docRef = doc(db, 'stations', station.id);
              await setDoc(docRef, station, { merge: true });
            } catch (err) {
              console.error("Error seeding station", err);
            }
          });
        }
        setFirebaseStations(stationsData);
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = stations;

    if (filters.minPower > 0) {
      result = result.filter(s => s.power >= filters.minPower);
    }

    if (filters.connectorType) {
      result = result.filter(s => s.connectors?.includes(filters.connectorType));
    }

    if (filters.status) {
      result = result.filter(s => s.status === filters.status);
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(s => 
        (s.name || '').toLowerCase().includes(q) || 
        (s.address || '').toLowerCase().includes(q) ||
        (s.city || '').toLowerCase().includes(q)
      );
    }

    if (filters.favoritesOnly && user && user.favorites) {
      result = result.filter(s => user.favorites.includes(s.id));
    }

    if (filters.compatibleOnly && user && user.vehicle && user.vehicle.connectors) {
      result = result.filter(s => {
        if (!s.connectors || s.connectors.length === 0) return true;
        // Check if any of the station's connectors are in the user's vehicle connectors
        return s.connectors.some(c => user.vehicle.connectors.includes(c));
      });
    }

    setFilteredStations(result);
  }, [stations, filters, user]);

  const updateStationStatus = useCallback(async (stationId, newStatus, userName = 'Anonyme', busyUntil = null) => {
    // 1. Update local state immediately so UI changes in real time
    setFirebaseStations(prev => {
      const exists = prev.some(s => s.id === stationId);
      if (exists) {
        return prev.map(s => s.id === stationId ? { ...s, status: newStatus, lastUpdate: new Date().toISOString(), updatedBy: userName, busyUntil } : s);
      } else {
        const base = stations.find(s => s.id === stationId);
        if (base) {
          return [...prev, { ...base, status: newStatus, lastUpdate: new Date().toISOString(), updatedBy: userName, busyUntil }];
        }
        return prev;
      }
    });

    // 2. Also update selectedStation directly so the open detail view reflects it instantly
    setSelectedStation(prev => {
      if (prev && prev.id === stationId) {
        return {
          ...prev,
          status: newStatus,
          lastUpdate: new Date().toISOString(),
          updatedBy: userName,
          busyUntil
        };
      }
      return prev;
    });

    // 3. Persist to Firestore if configured
    if (isFirebaseConfigured) {
      const updateData = {
        status: newStatus,
        lastUpdate: new Date().toISOString(),
        updatedBy: userName
      };
      if (busyUntil !== undefined) {
        updateData.busyUntil = busyUntil;
      }

      const stationRef = doc(db, 'stations', stationId);
      try {
        await updateDoc(stationRef, updateData);
      } catch (err) {
        // If document doesn't exist yet, create it with setDoc merge
        try {
          const base = stations.find(s => s.id === stationId);
          if (base) {
            await setDoc(stationRef, { ...base, ...updateData }, { merge: true });
          }
        } catch (setErr) {
          console.error("Firestore status update error:", setErr);
        }
      }
    }
  }, [stations]);

  // Check for expired Check-ins
  useEffect(() => {
    const interval = setInterval(() => {
      stations.forEach(station => {
        if (station.status === 'busy' && station.busyUntil) {
          if (new Date() > new Date(station.busyUntil)) {
            // Expired! Revert to available
            updateStationStatus(station.id, 'available', 'Système (Auto)', null);
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [stations, updateStationStatus]);

  const addStation = useCallback(async (stationData, photoFile = null) => {
    let photoUrl = null;

    if (photoFile && isFirebaseConfigured) {
      try {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `station_${Date.now()}.${fileExt}`;
        const storageRef = ref(storage, `stations/${fileName}`);
        await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(storageRef);
      } catch (err) {
        console.error("Erreur lors de l'upload de la photo :", err);
      }
    }

    const newStation = {
      ...stationData,
      lastUpdate: new Date().toISOString(),
      status: stationData.status || 'available',
      rating: 0,
      reviewCount: 0,
      photos: photoUrl ? [photoUrl] : [],
    };
    
    if (!isFirebaseConfigured) {
      newStation.id = Math.random().toString(36).substring(2, 9);
      if (photoFile) {
        newStation.photos = [URL.createObjectURL(photoFile)];
      }
      setFirebaseStations(prev => [...prev, newStation]);
      addPoints?.(10);
      return;
    }
    
    await addDoc(collection(db, 'stations'), newStation);
    if (addPoints) await addPoints(10); // Award 10 points for adding a station
  }, [addPoints]);

  const editStation = useCallback(async (stationId, stationData, photoFile = null) => {
    let photoUrl = null;

    if (photoFile && isFirebaseConfigured) {
      try {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `station_${Date.now()}.${fileExt}`;
        const storageRef = ref(storage, `stations/${fileName}`);
        await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(storageRef);
      } catch (err) {
        console.error("Erreur lors de l'upload de la photo :", err);
      }
    }

    const updatedStation = {
      ...stationData,
      lastUpdate: new Date().toISOString()
    };

    if (photoUrl) {
      updatedStation.photos = [photoUrl]; // or append if we supported multiple
    }

    if (!isFirebaseConfigured) {
      if (photoFile) {
        updatedStation.photos = [URL.createObjectURL(photoFile)];
      }
      setFirebaseStations(prev => prev.map(s => s.id === stationId ? { ...s, ...updatedStation } : s));
      return;
    }

    const stationRef = doc(db, 'stations', stationId);
    try {
      await updateDoc(stationRef, updatedStation);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const deleteStation = useCallback(async (stationId) => {
    if (!isFirebaseConfigured) {
      setFirebaseStations(prev => prev.filter(s => s.id !== stationId));
      return;
    }
    try {
      const stationRef = doc(db, 'stations', stationId);
      await deleteDoc(stationRef);
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  }, []);


  const addReview = useCallback(async (stationId, review) => {
    if (!isFirebaseConfigured) {
      setFirebaseStations(prev => prev.map(s => {
        if (s.id === stationId) {
          const newReviewCount = (s.reviewCount || 0) + 1;
          const newRating = (((s.rating || 0) * (s.reviewCount || 0)) + review.rating) / newReviewCount;
          return {
            ...s,
            rating: newRating,
            reviewCount: newReviewCount,
          };
        }
        return s;
      }));
      if (addPoints) addPoints(5);
      return;
    }

    // Save review to Firestore
    const reviewData = {
      ...review,
      stationId,
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'reviews'), reviewData);

    // Update station average
    const station = stations.find(s => s.id === stationId);
    if (station) {
      const newReviewCount = (station.reviewCount || 0) + 1;
      const newRating = (((station.rating || 0) * (station.reviewCount || 0)) + review.rating) / newReviewCount;
      const stationRef = doc(db, 'stations', stationId);
      try {
        await updateDoc(stationRef, {
          rating: newRating,
          reviewCount: newReviewCount
        });
      } catch (err) {
        console.error(err);
      }
    }
    
    if (addPoints) addPoints(5); // Award 5 points for a review
  }, [stations, addPoints]);

  const getAdminStats = useCallback(async () => {
    if (!isFirebaseConfigured) {
      return { totalStations: stations.length, totalUsers: 1, totalReviews: 0 };
    }
    try {
      // In a real app we'd use aggregations, but for this demo we'll fetch docs.
      const stationsSnap = await getDocs(collection(db, 'stations'));
      const usersSnap = await getDocs(collection(db, 'users'));
      const reviewsSnap = await getDocs(collection(db, 'reviews'));
      
      return {
        totalStations: stationsSnap.size,
        totalUsers: usersSnap.size,
        totalReviews: reviewsSnap.size
      };
    } catch (err) {
      console.error("Admin stats error:", err);
      return { totalStations: 0, totalUsers: 0, totalReviews: 0 };
    }
  }, [stations]);

  return (
    <StationsContext.Provider value={{
      stations,
      filteredStations,
      selectedStation,
      filters,
      setSelectedStation,
      setFilters,
      addStation,
      editStation,
      deleteStation,
      updateStationStatus,
      addReview,
      getAdminStats
    }}>
      {children}
    </StationsContext.Provider>
  );
}

export function useStations() {
  return useContext(StationsContext);
}
