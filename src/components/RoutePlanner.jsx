import React, { useState } from 'react';
import { useStations } from '../context/StationsContext';
import { MapPin, Navigation, Car, AlertCircle } from 'lucide-react';

const RoutePlanner = () => {
  const { stations, setFilters, filteredStations } = useStations();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(80); // percentage
  const [range, setRange] = useState(300); // km

  const handlePlanRoute = (e) => {
    e.preventDefault();
    // In a real app, this would use a routing API (like Mapbox Directions or OSRM)
    // and then check for stations along the path.
    // For this mockup, we'll just filter stations to show a subset that might be "on the route".
    // We can simulate it by setting a special filter flag or just updating the UI.
    
    // Fake simulation: Just set a search query to simulate filtering stations along the route
    if (end) {
      setFilters(prev => ({ ...prev, searchQuery: end.split(',')[0] }));
    }
  };

  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sidebar-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Navigation size={22} color="var(--primary)" /> 
          Itinéraire
        </h2>
      </div>

      <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
        <form onSubmit={handlePlanRoute} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} /> Départ
            </label>
            <input 
              type="text" 
              placeholder="Position actuelle ou ville..." 
              value={start}
              onChange={(e) => setStart(e.target.value)}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} color="var(--primary)" /> Arrivée
            </label>
            <input 
              type="text" 
              placeholder="Destination..." 
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              required
            />
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
              <Car size={16} /> Mon véhicule (Simulation)
            </h4>
            
            <div className="form-group">
              <label>Autonomie estimée: {range} km</label>
              <input 
                type="range" 
                min="50" max="600" step="10"
                value={range}
                onChange={(e) => setRange(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Batterie actuelle: {batteryLevel}%</label>
              <input 
                type="range" 
                min="10" max="100" step="5"
                value={batteryLevel}
                onChange={(e) => setBatteryLevel(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '1rem', justifyContent: 'center', fontSize: '1rem', marginTop: '0.5rem' }}>
            <Navigation size={18} /> Calculer le trajet
          </button>
        </form>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <h4 style={{ color: 'var(--primary)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> Note
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
            Ceci est une simulation. Les bornes affichées sur la carte seront filtrées selon votre destination. Dans une version future, le tracé exact du GPS sera affiché.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
