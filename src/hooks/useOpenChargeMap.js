import { useState, useEffect } from 'react';

// Mapper to normalize OpenChargeMap data to EVTN format
const mapOCMStation = (ocm) => {
  const address = ocm.AddressInfo || {};
  
  // Extract connectors and max power
  let connectors = [];
  let maxPower = 0;
  
  if (ocm.Connections && ocm.Connections.length > 0) {
    ocm.Connections.forEach(conn => {
      // OCM ConnectionTypeID mapping (approximate)
      // 2: CHAdeMO, 25: Type 2, 33: CCS, 1033: CCS Type 2, 28: Schuko (Prise domestique)
      if (conn.ConnectionType) {
        const typeTitle = conn.ConnectionType.Title || '';
        if (typeTitle.includes('Type 2')) connectors.push('Type 2');
        else if (typeTitle.includes('CCS')) connectors.push('CCS');
        else if (typeTitle.includes('CHAdeMO')) connectors.push('CHAdeMO');
        else connectors.push('Prise domestique');
      }
      
      if (conn.PowerKW && conn.PowerKW > maxPower) {
        maxPower = conn.PowerKW;
      }
    });
  }
  
  // Remove duplicates
  connectors = [...new Set(connectors)];
  if (connectors.length === 0) connectors = ['Type 2']; // Default
  if (maxPower === 0) maxPower = 22; // Default reasonable power
  
  // Status mapping
  let status = 'available';
  if (ocm.StatusType) {
    if (ocm.StatusType.IsOperational === false) status = 'offline';
  }
  
  return {
    id: `ocm-${ocm.ID}`,
    name: address.Title || 'Station OCM',
    address: address.AddressLine1 || '',
    city: address.Town || 'Tunisie',
    lat: address.Latitude,
    lng: address.Longitude,
    power: maxPower,
    connectors: connectors,
    status: status,
    price: ocm.UsageCost || 'Inconnu',
    operator: ocm.OperatorInfo ? ocm.OperatorInfo.Title : 'Inconnu',
    openHours: '24/7', // OCM has complex hours, defaulting for simplicity
    rating: 0,
    reviewCount: 0,
    lastUpdate: ocm.DateLastStatusUpdate || ocm.DateCreated,
    updatedBy: 'OpenChargeMap',
    description: ocm.GeneralComments || 'Importée depuis OpenChargeMap.',
    photos: [],
    amenities: [],
    isOCM: true
  };
};

export const useOpenChargeMap = () => {
  const [ocmStations, setOcmStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      const apiKey = import.meta.env.VITE_OCM_API_KEY;
      if (!apiKey) {
        console.warn('VITE_OCM_API_KEY is missing. Skipping OpenChargeMap fetch.');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://api.openchargemap.io/v3/poi/?output=json&countrycode=TN&maxresults=200&key=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération depuis OpenChargeMap');
        }
        
        const data = await response.json();
        const mappedStations = data.map(mapOCMStation);
        setOcmStations(mappedStations);
      } catch (err) {
        console.error('OCM Fetch Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  return { ocmStations, loading, error };
};
