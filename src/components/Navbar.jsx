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
      <div className="navbar-top-row">
        <div className="navbar-brand" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
          <Zap className="brand-icon" size={26} />
          <div className="brand-text">
            <h1>EVTN</h1>
            <span className="tagline">Recharge Tunisie</span>
          </div>
        </div>
        
        <div className="navbar-center desktop-only">
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
          {/* Desktop Mode Switch */}
          <div className="mode-switch desktop-only">
            <button 
              className={`btn-mode ${appMode === 'map' ? 'active' : ''}`}
              onClick={() => setAppMode('map')}
            >
              Carte
            </button>
            <button 
              className={`btn-mode ${appMode === 'route' ? 'active' : ''}`}
              onClick={() => setAppMode('route')}
            >
              Itinéraire
            </button>
          </div>

          <button className="btn-icon" onClick={toggleTheme} title="Changer le thème">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button 
            className="btn-primary btn-add-station" 
            onClick={isAuthenticated ? onOpenStationForm : onOpenAuthModal}
            title="Ajouter une borne"
          >
            <Plus size={18} />
            <span className="desktop-only-inline">Ajouter</span>
          </button>

          <div className="user-section">
            {isAuthenticated ? (
              <div className="user-profile-wrapper">
                {user?.isAdmin && (
                  <button className="btn-secondary btn-admin desktop-only" onClick={onOpenAdmin}>
                    <Settings size={16} /> <span>Admin</span>
                  </button>
                )}
                <div className="user-profile clickable" onClick={onOpenProfile} title="Mon Profil">
                  <div className="avatar">
                    {user?.name?.charAt(0)?.toUpperCase() || <User size={16} />}
                  </div>
                  <div className="user-info desktop-only">
                    <div className="user-name-row">
                      <span className="user-name">{user?.name}</span>
                      <span className="user-points">🏆 {user?.points || 0} pts</span>
                    </div>
                    <div className="user-car-row">
                      <Car size={12} />
                      <span>{user?.vehicle?.type || 'Mon véhicule'}</span>
                    </div>
                  </div>
                </div>
                <button className="btn-icon desktop-only" onClick={(e) => { e.stopPropagation(); logout(); }} title="Déconnexion">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button className="btn-secondary btn-connexion" onClick={onOpenAuthModal} title="Se connecter">
                <User size={16} />
                <span>Connexion</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Row 2: Mode Switch (Carte / Itinéraire) */}
      <div className="navbar-bottom-row mobile-only">
        <div className="mode-switch-mobile">
          <button 
            className={`btn-mode-mobile ${appMode === 'map' ? 'active' : ''}`}
            onClick={() => setAppMode('map')}
          >
            🗺️ Carte
          </button>
          <button 
            className={`btn-mode-mobile ${appMode === 'route' ? 'active' : ''}`}
            onClick={() => setAppMode('route')}
          >
            🛣️ Itinéraire
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
