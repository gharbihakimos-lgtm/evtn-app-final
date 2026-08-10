import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockStations } from '../data/mockStations';
import { db, storage, isFirebaseConfigured } from '../config/firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from './AuthContext';

const StationsContext = createContext();

export function StationsProvider({ children }) {
  const [stations, setStations] = useState(mockStations);
  const [filteredStations, setFilteredStations] = useState(mockStations);
  const [selectedStation, setSelectedStation] = useState(null);
  const [filters, setFilters] = useState({
    minPower: 0,
    connectorType: '',
    status: '',
    searchQuery: '',
  });
  const { addPoints } = useAuth();

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    
    const unsubscribe = onSnapshot(collection(db, 'stations'), (snapshot) => {
      const stationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStations(stationsData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = stations;

    if (filters.minPower > 0) {
      result = result.filter(s => s.power >= filters.minPower);
    }

    if (filters.connectorType) {
      result = result.filter(s => s.connectors.includes(filters.connectorType));
    }

    if (filters.status) {
      result = result.filter(s => s.status === filters.status);
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.address.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
      );
    }

    setFilteredStations(result);
  }, [stations, filters]);

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
      setStations(prev => [...prev, newStation]);
      addPoints?.(10);
      return;
    }
    
    await addDoc(collection(db, 'stations'), newStation);
    if (addPoints) await addPoints(10); // Award 10 points for adding a station
  }, [addPoints]);

  const updateStationStatus = useCallback(async (stationId, newStatus, userName, busyUntil = null) => {
    if (!isFirebaseConfigured) {
      setStations(prev => prev.map(s => {
        if (s.id === stationId) {
          return {
            ...s,
            status: newStatus,
            lastUpdate: new Date().toISOString(),
            updatedBy: userName,
            busyUntil
          };
        }
        return s;
      }));
      return;
    }

    const updateData = {
      status: newStatus,
      lastUpdate: new Date().toISOString(),
      updatedBy: userName
    };
    if (busyUntil !== undefined) {
      updateData.busyUntil = busyUntil;
    }

    const stationRef = doc(db, 'stations', stationId);
    await updateDoc(stationRef, updateData);
  }, []);

  const addReview = useCallback(async (stationId, review) => {
    if (!isFirebaseConfigured) {
      setStations(prev => prev.map(s => {
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
      await updateDoc(stationRef, {
        rating: newRating,
        reviewCount: newReviewCount
      });
    }
    
    if (addPoints) addPoints(5); // Award 5 points for a review
  }, [stations, addPoints]);

  return (
    <StationsContext.Provider value={{
      stations,
      filteredStations,
      selectedStation,
      filters,
      setSelectedStation,
      setFilters,
      addStation,
      updateStationStatus,
      addReview
    }}>
      {children}
    </StationsContext.Provider>
  );
}

export function useStations() {
  return useContext(StationsContext);
}
