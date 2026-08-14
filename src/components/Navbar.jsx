import React from 'react';
import { Zap, Search, User, LogOut, Plus, Moon, Sun, Settings, Car } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStations } from '../context/StationsContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onOpenAuthModal, onOpenStationForm, onOpenProfile, onOpenAdmin, appMode, setAppMode }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { stations, filters, setFilters, setSelectedStation } = useStations();
  const { theme, toggleTheme } = useTheme();

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleHomeClick = () => {
    setFilters((prev) => ({ ...prev, searchQuery: '' }));
    if (setSelectedStation) setSelectedStation(null);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
        <Zap className="brand-icon" size={28} />
        <div className="brand-text">
          <h1>EVTN</h1>
          <span className="tagline">Recharge Tunisie</span>
        </div>
      </div>
      
      <div className="navbar-center">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Chercher une ville, rue..."
            value={filters.searchQuery || ''}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="station-count-badge">
          {stations?.length || 0} bornes en Tunisie
        </div>
      </div>

      <div className="navbar-actions">
        <button className="btn-icon" onClick={toggleTheme} title="Changer le thème" style={{ marginRight: '0.5rem' }}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button 
          className="btn-primary" 
          onClick={isAuthenticated ? onOpenStationForm : onOpenAuthModal}
        >
          <Plus size={18} />
          <span>Ajouter une borne</span>
        </button>
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '20px', padding: '0.2rem', marginRight: '0.5rem' }}>
          <button 
            className={`btn-icon ${appMode === 'map' ? 'active' : ''}`}
            onClick={() => setAppMode('map')}
            style={{ borderRadius: '16px', padding: '0.4rem 1rem', background: appMode === 'map' ? 'var(--primary)' : 'transparent', color: appMode === 'map' ? 'white' : 'var(--text-main)' }}
          >
            Carte
          </button>
          <button 
            className={`btn-icon ${appMode === 'route' ? 'active' : ''}`}
            onClick={() => setAppMode('route')}
            style={{ borderRadius: '16px', padding: '0.4rem 1rem', background: appMode === 'route' ? 'var(--primary)' : 'transparent', color: appMode === 'route' ? 'white' : 'var(--text-main)' }}
          >
            Itinéraire
          </button>
        </div>

        <div className="user-section">
          {isAuthenticated ? (
            <div className="user-profile-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {user?.isAdmin && (
                <button className="btn-secondary" onClick={onOpenAdmin} style={{ padding: '0.4rem 0.75rem' }}>
                  <Settings size={16} style={{ marginRight: '0.25rem', verticalAlign: 'text-bottom' }} /> Admin
                </button>
              )}
              <div className="user-profile clickable" onClick={onOpenProfile} style={{ cursor: 'pointer', padding: '0.3rem 0.6rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="avatar" style={{ background: 'var(--primary)', color: '#000', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || <User size={18} />}
                </div>
                <div className="user-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="user-name" style={{ fontWeight: '600', fontSize: '0.88rem' }}>{user?.name}</span>
                    <span className="user-points" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>🏆 {user?.points || 0} pts</span>
                  </div>
                  {/* Car Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: user?.vehicle?.type ? '#10B981' : 'var(--text-dim)', fontWeight: '500' }}>
                    <Car size={13} />
                    <span>{user?.vehicle?.type || 'Ajouter mon véhicule'}</span>
                  </div>
                </div>
              </div>
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); logout(); }} title="Déconnexion">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button className="btn-secondary" onClick={onOpenAuthModal}>
              Connexion
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
