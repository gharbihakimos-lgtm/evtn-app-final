import React, { useState, useEffect } from 'react';
import { X, Trophy, Car, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, getLeaderboard } = useAuth();
  const [activeTab, setActiveTab] = useState('profil'); // 'profil' or 'leaderboard'
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Local state for form
  const [vehicleType, setVehicleType] = useState('');
  const [connectors, setConnectors] = useState([]);

  useEffect(() => {
    if (user && user.vehicle) {
      setVehicleType(user.vehicle.type || '');
      setConnectors(user.vehicle.connectors || []);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && activeTab === 'leaderboard') {
      const fetchLeaderboard = async () => {
        const data = await getLeaderboard();
        setLeaderboard(data);
      };
      fetchLeaderboard();
    }
  }, [isOpen, activeTab, getLeaderboard]);

  if (!isOpen) return null;

  const availableConnectors = ['Type 2', 'CCS', 'CHAdeMO', 'Type 1'];

  const handleConnectorToggle = (conn) => {
    setConnectors(prev => 
      prev.includes(conn) ? prev.filter(c => c !== conn) : [...prev, conn]
    );
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateUserProfile({
      vehicle: {
        type: vehicleType,
        connectors: connectors
      }
    });
    // onClose(); // optionally close on save
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Profil Utilisateur</h2>
          <button className="btn-close" onClick={onClose} style={{ position: 'static' }}>
            <X size={20} />
          </button>
        </div>

        <div className="auth-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profil' ? 'active' : ''}`}
            onClick={() => setActiveTab('profil')}
          >
            Mon Profil
          </button>
          <button 
            className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Classement
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'profil' && (
            <div className="profile-section">
              <div className="user-profile-header">
                <div className="avatar-large">
                  <span style={{ fontSize: '2rem' }}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
                <div className="user-details">
                  <h3>{user?.name}</h3>
                  <div className="points-badge">
                    <Trophy size={16} />
                    <span>{user?.points || 0} pts</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="auth-form" style={{ marginTop: '1.5rem' }}>
                <h4><Car size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }}/>Mon Véhicule</h4>
                
                <div className="form-group">
                  <label>Modèle de véhicule</label>
                  <input 
                    type="text" 
                    placeholder="ex: Tesla Model 3, Renault Zoe..." 
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Connecteurs compatibles</label>
                  <div className="checkbox-group">
                    {availableConnectors.map(conn => (
                      <label 
                        key={conn} 
                        className={`checkbox-label ${connectors.includes(conn) ? 'checked' : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          style={{ display: 'none' }}
                          checked={connectors.includes(conn)}
                          onChange={() => handleConnectorToggle(conn)}
                        />
                        {conn}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary full-width">
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="leaderboard-section">
              <ul className="leaderboard-list">
                {(leaderboard || []).map((u, index) => (
                  <li key={u.id} className={`leaderboard-item ${u.id === user?.id ? 'current-user' : ''}`}>
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{u.name} {u.id === user?.id && '(Vous)'}</span>
                    <span className="points"><Trophy size={14} style={{ marginRight: '0.25rem' }}/>{u.points || 0}</span>
                  </li>
                ))}
                {(!leaderboard || leaderboard.length === 0) && (
                  <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem 0' }}>Aucun utilisateur classé pour le moment.</p>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
