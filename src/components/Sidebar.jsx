import React from 'react';
import { useStations } from '../context/StationsContext';
import StationCard from './StationCard';
import { MapPinOff } from 'lucide-react';

const Sidebar = () => {
  const { filteredStations, selectedStation, setSelectedStation } = useStations();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>⚡ Bornes</h2>
        <span className="count">{filteredStations?.length || 0}</span>
      </div>
      
      <div className="station-list">
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
    </div>
  );
};

export default Sidebar;
