import React from 'react';
import { Zap, Search, User, LogOut, Plus, Moon, Sun, Settings, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStations } from '../context/StationsContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onOpenAuthModal, onOpenStationForm, onOpenProfile, onOpenAdmin, onOpenMenu, appMode, setAppMode }) => {
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

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      if (onOpenStationForm) onOpenStationForm();
    } else {
      if (onOpenAuthModal) onOpenAuthModal();
    }
  };

  const handleAuthClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenAuthModal) onOpenAuthModal();
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenProfile) onOpenProfile();
  };

  return (
    <nav className="navbar">
      {/* Top Row: Logo & Action Buttons (Icon Top + Text Below) */}
      <div className="navbar-top-row">
        <div className="navbar-left-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            type="button" 
            className="btn-hamburger" 
            onClick={(e) => { e.stopPropagation(); onOpenMenu?.(); }}
            title="Menu & Paramètres"
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>
          
          <div className="navbar-brand" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
            <Zap className="brand-icon" size={24} />
            <div className="brand-text">
              <h1>EVTN</h1>
              <span className="tagline">Recharge Tunisie</span>
            </div>
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
              type="button"
              className={`btn-mode ${appMode === 'map' ? 'active' : ''}`}
              onClick={() => setAppMode('map')}
            >
              Carte
            </button>
            <button 
              type="button"
              className={`btn-mode ${appMode === 'route' ? 'active' : ''}`}
              onClick={() => setAppMode('route')}
            >
              Itinéraire
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button 
            type="button"
            className="btn-nav-item" 
            onClick={toggleTheme} 
            title="Changer le thème"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            <span className="btn-nav-label">Thème</span>
          </button>

          {/* Add Station Button */}
          <button 
            type="button"
            className="btn-nav-item btn-nav-add" 
            onClick={handleAddClick}
            title="Ajouter une borne"
          >
            <Plus size={17} />
            <span className="btn-nav-label">Ajouter</span>
          </button>

          {/* User / Profile / Login Section */}
          <div className="user-section">
            {isAuthenticated ? (
              <div className="user-profile-wrapper">
                {user?.isAdmin && (
                  <button type="button" className="btn-nav-item desktop-only" onClick={onOpenAdmin}>
                    <Settings size={16} /> 
                    <span className="btn-nav-label">Admin</span>
                  </button>
                )}
                <button 
                  type="button"
                  className="btn-nav-item btn-nav-profile clickable" 
                  onClick={handleProfileClick} 
                  title="Mon Profil"
                >
                  <div className="avatar-mini">
                    {user?.name?.charAt(0)?.toUpperCase() || <User size={14} />}
                  </div>
                  <span className="btn-nav-label">Profil</span>
                </button>
                <button 
                  type="button"
                  className="btn-nav-item desktop-only" 
                  onClick={(e) => { e.stopPropagation(); logout(); }} 
                  title="Déconnexion"
                >
                  <LogOut size={16} />
                  <span className="btn-nav-label">Sortie</span>
                </button>
              </div>
            ) : (
              <button 
                type="button"
                className="btn-nav-item btn-nav-login" 
                onClick={handleAuthClick} 
                title="Se connecter"
              >
                <User size={17} />
                <span className="btn-nav-label">Connexion</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Row 2 (Mobile only): Mode Switch Carte / Itinéraire */}
      <div className="navbar-bottom-row mobile-only">
        <div className="mode-switch-mobile">
          <button 
            type="button"
            className={`btn-mode-mobile ${appMode === 'map' ? 'active' : ''}`}
            onClick={() => setAppMode('map')}
          >
            🗺️ Carte des Bornes
          </button>
          <button 
            type="button"
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
