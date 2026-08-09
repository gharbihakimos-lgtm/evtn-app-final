import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useStations } from '../context/StationsContext';
import { useGeolocation } from '../hooks/useGeolocation';
import L from 'leaflet';

const createMarkerIcon = (status) => {
  const statusKey = status === 'available' ? 'available' : 
                    status === 'busy' ? 'busy' : 'offline';
  const colors = { available: '#22C55E', busy: '#EAB308', offline: '#EF4444' };
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${colors[statusKey]};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,0.9);box-shadow:0 2px 12px rgba(0,0,0,0.4);cursor:pointer;"><svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M13 2L3 14h9l-1 10 10-12h-9l1-10z'/></svg></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const userLocationIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background:#3B82F6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

const MapView = () => {
  const { filteredStations, selectedStation, setSelectedStation } = useStations();
  const { position } = useGeolocation();

  const center = [36.8, 10.18];
  const zoom = 7;

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {position && (
          <Marker position={[position.lat, position.lng]} icon={userLocationIcon}>
            <Popup>Votre position</Popup>
          </Marker>
        )}

        {filteredStations?.map(station => (
          <Marker 
            key={station.id} 
            position={[station.lat, station.lng]} 
            icon={createMarkerIcon(station.status)}
          >
            <Popup>
              <div className="map-popup">
                <h3>{station.name}</h3>
                <div className="popup-info">
                  <span>⚡ {station.power} kW</span>
                  <span>{station.status === 'available' ? '🟢 Disponible' : station.status === 'busy' ? '🟡 Occupée' : '🔴 Hors service'}</span>
                </div>
                <button 
                  className="btn-popup-detail"
                  onClick={() => setSelectedStation(station)}
                >
                  Voir détails
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedStation && (
          <ChangeView center={[selectedStation.lat, selectedStation.lng]} zoom={14} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
