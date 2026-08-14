import React from 'react';
import { useStations } from '../context/StationsContext';
import { useAuth } from '../context/AuthContext';
import { RotateCcw, Car } from 'lucide-react';

const FilterBar = () => {
  const { filters, setFilters, filteredStations } = useStations();
  const { user } = useAuth();

  const handlePowerChange = (value) => {
    const minPower = value === 'all' ? 0 : parseInt(value);
    setFilters(prev => ({ ...prev, minPower }));
  };

  const handleConnectorChange = (value) => {
    setFilters(prev => ({ ...prev, connectorType: value === 'all' ? '' : value }));
  };

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }));
  };

  const resetFilters = () => {
    setFilters({ minPower: 0, connectorType: '', status: '', searchQuery: '', compatibleOnly: false, favoritesOnly: false });
  };

  const hasActiveFilters = filters.minPower > 0 || !!filters.connectorType || !!filters.status || !!filters.compatibleOnly || !!filters.favoritesOnly || !!filters.searchQuery;

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>Puissance</label>
        <select 
          value={filters.minPower || 'all'} 
          onChange={(e) => handlePowerChange(e.target.value)}
        >
          <option value="all">Toutes</option>
          <option value="7">≥ 7 kW</option>
          <option value="22">≥ 22 kW</option>
          <option value="50">≥ 50 kW</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Connecteur</label>
        <select 
          value={filters.connectorType || 'all'} 
          onChange={(e) => handleConnectorChange(e.target.value)}
        >
          <option value="all">Tous</option>
          <option value="Type 2">Type 2</option>
          <option value="CCS">CCS</option>
          <option value="CHAdeMO">CHAdeMO</option>
          <option value="Prise domestique">Prise domestique</option>
        </select>
      </div>

      <div className="status-filters">
        {[
          { value: 'all', label: 'Toutes' },
          { value: 'available', label: 'Disponible' },
          { value: 'busy', label: 'Occupée' },
          { value: 'offline', label: 'Hors service' },
        ].map(opt => (
          <button
            key={opt.value}
            className={`status-pill ${(filters.status === opt.value || (!filters.status && opt.value === 'all')) ? 'active' : ''}`}
            onClick={() => handleStatusChange(opt.value)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {opt.value !== 'all' && <span className={`status-dot ${opt.value}`} style={{ marginTop: 0 }}></span>}
            {opt.label}
          </button>
        ))}
      </div>
      {user?.vehicle?.connectors?.length > 0 && (
        <div className="filter-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', background: 'var(--bg-secondary)', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
          <Car size={16} color={filters.compatibleOnly ? 'var(--primary)' : 'var(--text-muted)'} />
          <label style={{ margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: filters.compatibleOnly ? 'var(--primary)' : 'var(--text-main)' }}>
              Mon véhicule
            </span>
            <input 
              type="checkbox" 
              checked={filters.compatibleOnly || false}
              onChange={(e) => setFilters(prev => ({ ...prev, compatibleOnly: e.target.checked }))}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </label>
        </div>
      )}

      <div className="filter-results">
        <span className="results-count">{filteredStations?.length || 0} bornes</span>
        {hasActiveFilters && (
          <button className="btn-reset" onClick={resetFilters} title="Réinitialiser">
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
