import React, { useState, useEffect } from 'react';
import { 
  X, User, Moon, Sun, Bell, Volume2, Vibrate, 
  MapPin, Navigation, Plus, Gift, Trophy, Shield, 
  LogOut, ChevronRight, Globe, Info, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const MenuDrawer = ({ 
  isOpen, 
  onClose, 
  onOpenProfile, 
  onOpenAuth, 
  onOpenStationForm, 
  onOpenLegal, 
  onOpenAdmin,
  setAppMode,
  setMobileTab
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Local settings with localStorage persistence
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('evtn_app_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      notifications: true,
      haptics: true,
      sounds: true,
      language: 'fr'
    };
  });

  const toggleSetting = (key) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('evtn_app_settings', JSON.stringify(next));
      return next;
    });
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-brand">
            <Zap className="brand-icon" size={24} />
            <span className="drawer-title">Menu EVTN</span>
          </div>
          <button type="button" className="btn-close-drawer" onClick={onClose} title="Fermer">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="drawer-body">
          {/* User Profile Card */}
          <div className="drawer-user-card">
            {isAuthenticated ? (
              <div className="drawer-user-info">
                <div className="drawer-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || <User size={20} />}
                </div>
                <div className="drawer-user-details">
                  <div className="drawer-user-name">{user?.name}</div>
                  <div className="drawer-user-email">{user?.email}</div>
                  <div className="drawer-points-badge">
                    <Trophy size={13} />
                    <span>{user?.points || 0} points EVTN</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-edit-profile"
                  onClick={() => { onClose(); onOpenProfile?.(); }}
                >
                  Gérer
                </button>
              </div>
            ) : (
              <div className="drawer-guest-card">
                <div className="guest-text">
                  <strong>Rejoignez la communauté EVTN</strong>
                  <p>Enregistrez vos favoris, gagnez des récompenses et partagez vos avis.</p>
                </div>
                <button 
                  type="button" 
                  className="btn-primary full-width"
                  onClick={() => { onClose(); onOpenAuth?.(); }}
                >
                  <User size={16} />
                  <span>Se connecter / S'inscrire</span>
                </button>
              </div>
            )}
          </div>

          {/* Main Navigation Section */}
          <div className="drawer-section">
            <div className="drawer-section-title">Navigation</div>
            <div className="drawer-menu-list">
              <button 
                type="button" 
                className="drawer-menu-item"
                onClick={() => {
                  setAppMode?.('map');
                  setMobileTab?.('map');
                  onClose();
                }}
              >
                <div className="item-icon-wrapper map-icon">
                  <MapPin size={18} />
                </div>
                <div className="item-content">
                  <span className="item-title">Carte des Bornes</span>
                  <span className="item-subtitle">Disponibilité en direct en Tunisie</span>
                </div>
                <ChevronRight size={16} className="chevron" />
              </button>

              <button 
                type="button" 
                className="drawer-menu-item"
                onClick={() => {
                  setAppMode?.('route');
                  onClose();
                }}
              >
                <div className="item-icon-wrapper route-icon">
                  <Navigation size={18} />
                </div>
                <div className="item-content">
                  <span className="item-title">Calculateur d'Itinéraire</span>
                  <span className="item-subtitle">Planifier un trajet et les recharges</span>
                </div>
                <ChevronRight size={16} className="chevron" />
              </button>

              <button 
                type="button" 
                className="drawer-menu-item"
                onClick={() => {
                  onClose();
                  if (isAuthenticated) {
                    onOpenStationForm?.();
                  } else {
                    onOpenAuth?.();
                  }
                }}
              >
                <div className="item-icon-wrapper add-icon">
                  <Plus size={18} />
                </div>
                <div className="item-content">
                  <span className="item-title">Ajouter une borne</span>
                  <span className="item-subtitle">Contribuer à la carte communautaire</span>
                </div>
                <ChevronRight size={16} className="chevron" />
              </button>

              <button 
                type="button" 
                className="drawer-menu-item"
                onClick={() => {
                  onClose();
                  if (isAuthenticated) {
                    onOpenProfile?.();
                  } else {
                    onOpenAuth?.();
                  }
                }}
              >
                <div className="item-icon-wrapper gift-icon">
                  <Gift size={18} />
                </div>
                <div className="item-content">
                  <span className="item-title">EVTN Pass & Coupons</span>
                  <span className="item-subtitle">Réductions Shell, TotalEnergies, Hôtels</span>
                </div>
                <ChevronRight size={16} className="chevron" />
              </button>

              {user?.isAdmin && (
                <button 
                  type="button" 
                  className="drawer-menu-item admin-item"
                  onClick={() => {
                    onClose();
                    onOpenAdmin?.();
                  }}
                >
                  <div className="item-icon-wrapper admin-icon">
                    <Shield size={18} />
                  </div>
                  <div className="item-content">
                    <span className="item-title">Administration</span>
                    <span className="item-subtitle">Gérer les bornes et utilisateurs</span>
                  </div>
                  <ChevronRight size={16} className="chevron" />
                </button>
              )}
            </div>
          </div>

          {/* App Preferences & Settings Section */}
          <div className="drawer-section">
            <div className="drawer-section-title">Paramètres & Affichage</div>
            <div className="drawer-settings-list">
              {/* Theme Toggle */}
              <div className="drawer-setting-row" onClick={toggleTheme}>
                <div className="setting-info">
                  <div className="setting-icon">
                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                  </div>
                  <div>
                    <div className="setting-name">Mode Sombre</div>
                    <div className="setting-desc">{theme === 'dark' ? 'Activé (Thème Nuit)' : 'Désactivé (Thème Jour)'}</div>
                  </div>
                </div>
                <div className={`switch-toggle ${theme === 'dark' ? 'checked' : ''}`}>
                  <div className="switch-thumb" />
                </div>
              </div>

              {/* Push Notifications Toggle */}
              <div className="drawer-setting-row" onClick={() => toggleSetting('notifications')}>
                <div className="setting-info">
                  <div className="setting-icon">
                    <Bell size={18} />
                  </div>
                  <div>
                    <div className="setting-name">Notifications Push</div>
                    <div className="setting-desc">Alertes bornes et nouvelles offres</div>
                  </div>
                </div>
                <div className={`switch-toggle ${settings.notifications ? 'checked' : ''}`}>
                  <div className="switch-thumb" />
                </div>
              </div>

              {/* Haptic Vibrations Toggle */}
              <div className="drawer-setting-row" onClick={() => toggleSetting('haptics')}>
                <div className="setting-info">
                  <div className="setting-icon">
                    <Vibrate size={18} />
                  </div>
                  <div>
                    <div className="setting-name">Retours Haptiques (Vibrations)</div>
                    <div className="setting-desc">Vibration au glissement du slider</div>
                  </div>
                </div>
                <div className={`switch-toggle ${settings.haptics ? 'checked' : ''}`}>
                  <div className="switch-thumb" />
                </div>
              </div>

              {/* Sound Effects Toggle */}
              <div className="drawer-setting-row" onClick={() => toggleSetting('sounds')}>
                <div className="setting-info">
                  <div className="setting-icon">
                    <Volume2 size={18} />
                  </div>
                  <div>
                    <div className="setting-name">Effets Sonores</div>
                    <div className="setting-desc">Bips de branchement & check-in</div>
                  </div>
                </div>
                <div className={`switch-toggle ${settings.sounds ? 'checked' : ''}`}>
                  <div className="switch-thumb" />
                </div>
              </div>

              {/* Language Selection */}
              <div className="drawer-setting-row non-clickable">
                <div className="setting-info">
                  <div className="setting-icon">
                    <Globe size={18} />
                  </div>
                  <div>
                    <div className="setting-name">Langue de l'application</div>
                    <div className="setting-desc">Français (Tunisie) 🇹🇳</div>
                  </div>
                </div>
                <span className="badge-lang">FR</span>
              </div>
            </div>
          </div>

          {/* Legal & About Section */}
          <div className="drawer-section">
            <div className="drawer-section-title">À propos</div>
            <div className="drawer-menu-list">
              <button 
                type="button" 
                className="drawer-menu-item small"
                onClick={() => { onClose(); onOpenLegal?.(); }}
              >
                <div className="item-icon-wrapper info-icon">
                  <Info size={16} />
                </div>
                <div className="item-content">
                  <span className="item-title">Mentions Légales & Confidentialité</span>
                </div>
                <ChevronRight size={14} className="chevron" />
              </button>
            </div>
          </div>

          {/* Logout Button if Logged In */}
          {isAuthenticated && (
            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <button 
                type="button" 
                className="btn-drawer-logout"
                onClick={() => {
                  logout();
                  onClose();
                }}
              >
                <LogOut size={16} />
                <span>Se déconnecter</span>
              </button>
            </div>
          )}

          {/* App Version Info */}
          <div className="drawer-footer-version">
            <span>EVTN — Version 1.0.1</span>
            <p>© 2026 EVTN Tunisie. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDrawer;
