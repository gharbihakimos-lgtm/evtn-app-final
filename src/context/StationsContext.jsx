import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockStations } from '../data/mockStations';
import { db, storage, isFirebaseConfigured } from '../config/firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
        // Fallback for local mock (creates a local object URL for preview)
        newStation.photos = [URL.createObjectURL(photoFile)];
      }
      setStations(prev => [...prev, newStation]);
      return;
    }
    
    await addDoc(collection(db, 'stations'), newStation);
  }, []);

  const updateStationStatus = useCallback(async (stationId, newStatus, userName) => {
    if (!isFirebaseConfigured) {
      setStations(prev => prev.map(s => {
        if (s.id === stationId) {
          return {
            ...s,
            status: newStatus,
            lastUpdate: new Date().toISOString(),
            updatedBy: userName,
          };
        }
        return s;
      }));
      return;
    }

    const stationRef = doc(db, 'stations', stationId);
    await updateDoc(stationRef, {
      status: newStatus,
      lastUpdate: new Date().toISOString(),
      updatedBy: userName
    });
  }, []);

  const addReview = useCallback((stationId, review) => {
    setStations(prev => prev.map(s => {
      if (s.id === stationId) {
        const newReviewCount = s.reviewCount + 1;
        const newRating = ((s.rating * s.reviewCount) + review.rating) / newReviewCount;
        return {
          ...s,
          rating: newRating,
          reviewCount: newReviewCount,
        };
      }
      return s;
    }));
  }, []);

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
