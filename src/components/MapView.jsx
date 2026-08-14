import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import { useStations } from '../context/StationsContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useTheme } from '../context/ThemeContext';
import { Locate } from 'lucide-react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const createMarkerIcon = (status) => {
  const statusKey = status === 'available' ? 'available' : 
                    status === 'busy' ? 'busy' : 'offline';
  const colors = { available: '#22C55E', busy: '#EAB308', offline: '#EF4444' };
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${colors[statusKey]};width:36px;height:36px;min-width:36px;min-height:36px;border-radius:50% !important;display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,0.9);box-shadow:0 2px 12px rgba(0,0,0,0.4);cursor:pointer;"><svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M13 2L3 14h9l-1 10 10-12h-9l1-10z'/></svg></div>`,
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

const RoutingControl = ({ start, end }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!start || !end) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng)
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      show: false, // Hide the textual itinerary box
      addWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#3B82F6', opacity: 0.8, weight: 5 }]
      },
      createMarker: () => null // Disable default markers for start/end
    }).addTo(map);

    routingControl.on('routingerror', (e) => {
      console.error('Routing error:', e.error);
    });

    return () => {
      try {
        if (routingControl.getPlan()) {
          routingControl.getPlan().setWaypoints([]);
        }
        map.removeControl(routingControl);
      } catch (e) {
        console.error(e);
      }
    };
  }, [map, start?.lat, start?.lng, end?.lat, end?.lng]);

  return null;
};

const LocateMeControl = ({ position }) => {
  const map = useMap();
  
  const handleLocate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (position) {
      map.flyTo([position.lat, position.lng], 14, { duration: 1.5 });
    }
  };

  return (
    <div className="leaflet-bottom leaflet-right" style={{ bottom: '80px', right: '10px', position: 'absolute', zIndex: 400 }}>
      <div className="leaflet-control leaflet-bar">
        <button 
          onClick={handleLocate}
          style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
          title="Me localiser"
        >
          <Locate size={18} />
        </button>
      </div>
    </div>
  );
};

const MapView = () => {
  const { filteredStations, selectedStation, setSelectedStation } = useStations();
  const { position } = useGeolocation();
  const { theme } = useTheme();

  const defaultCenter = [36.8065, 10.1815]; // Tunis
  const center = selectedStation ? [selectedStation.lat, selectedStation.lng] : defaultCenter;
  const zoom = selectedStation ? 14 : 7;

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
          url={theme === 'dark' 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
        />
        <ZoomControl position="bottomright" />
        <LocateMeControl position={position} />
        
        {position && typeof position.lat === 'number' && typeof position.lng === 'number' && !isNaN(position.lat) && !isNaN(position.lng) && (
          <Marker position={[position.lat, position.lng]} icon={userLocationIcon}>
            <Popup>Votre position</Popup>
          </Marker>
        )}

        {filteredStations?.filter(s => typeof s?.lat === 'number' && typeof s?.lng === 'number' && !isNaN(s.lat) && !isNaN(s.lng)).map(station => (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div className={`status-dot ${station.status}`} style={{ margin: 0, marginTop: '2px' }}></div>
                    <span>{station.status === 'available' ? 'Disponible' : station.status === 'busy' ? 'Occupée' : 'Hors service'}</span>
                  </div>
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

        {selectedStation && position && (
          <RoutingControl 
            start={position} 
            end={{lat: selectedStation.lat, lng: selectedStation.lng}} 
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
