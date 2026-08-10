import React from 'react';
import { Zap, Search, User, LogOut, Plus, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStations } from '../context/StationsContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onOpenAuthModal, onOpenStationForm }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { stations, filters, setFilters } = useStations();
  const { theme, toggleTheme } = useTheme();

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
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
        
        <div className="user-section">
          {isAuthenticated ? (
            <div className="user-profile">
              <div className="avatar">
                <User size={20} />
              </div>
              <span className="user-name">{user?.name}</span>
              <button className="btn-icon" onClick={logout} title="Déconnexion">
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
