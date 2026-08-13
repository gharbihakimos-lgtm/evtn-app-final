import React from 'react';
import { useStations } from '../context/StationsContext';
import { useAuth } from '../context/AuthContext';
import StationCard from './StationCard';
import { MapPinOff, Star, Car } from 'lucide-react';

const Sidebar = ({ onOpenLegal }) => {
  const { filteredStations, selectedStation, setSelectedStation, filters, setFilters } = useStations();
  const { user } = useAuth();

  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sidebar-header">
        <h2>⚡ Bornes</h2>
        <span className="count">{filteredStations?.length || 0}</span>
      </div>

      <div className="sidebar-toggles" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        <button 
          className={`toggle-btn ${filters.favoritesOnly ? 'active' : ''}`}
          onClick={() => setFilters(prev => ({ ...prev, favoritesOnly: !prev.favoritesOnly }))}
        >
          <Star size={14} className={filters.favoritesOnly ? 'filled' : ''} /> Mes Favoris
        </button>
        {user?.vehicle && (
          <button 
            className={`toggle-btn ${filters.compatibleOnly ? 'active' : ''}`}
            onClick={() => setFilters(prev => ({ ...prev, compatibleOnly: !prev.compatibleOnly }))}
          >
            <Car size={14} /> Mon Véhicule
          </button>
        )}
      </div>
      
      <div className="station-list" style={{ flex: 1, overflowY: 'auto' }}>
        {filteredStations && filteredStations.length > 0 ? (
          filteredStations.map(station => (
            <StationCard 
              key={station.id} 
              station={station} 
              isSelected={selectedStation?.id === station.id}
              onClick={() => setSelectedStation(station)}
            />
          ))
        ) : (
          <div className="empty-state">
            <MapPinOff size={48} />
            <p>Aucune borne ne correspond à vos critères.</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Essayez de modifier vos filtres</span>
          </div>
        )}
      </div>

      <div className="sidebar-footer" style={{ padding: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button 
          onClick={onOpenLegal} 
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Mentions Légales & Confidentialité
        </button>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Données temps réel alimentées par <strong>OpenChargeMap</strong>
        </span>
        <div style={{ color: 'var(--text-dim)' }}>
          © 2026 EVTN - Tous droits réservés
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
