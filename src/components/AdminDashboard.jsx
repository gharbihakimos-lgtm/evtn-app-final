import React, { useState, useEffect } from 'react';
import { X, Users, MapPin, Star, Trash2 } from 'lucide-react';
import { useStations } from '../context/StationsContext';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { stations, getAdminStats } = useStations();
  const [stats, setStats] = useState({ totalStations: 0, totalUsers: 0, totalReviews: 0 });

  useEffect(() => {
    if (isOpen && user?.isAdmin) {
      const fetchStats = async () => {
        const data = await getAdminStats();
        setStats(data);
      };
      fetchStats();
    }
  }, [isOpen, user, getAdminStats]);

  if (!isOpen || !user?.isAdmin) return null;

  const handleDeleteStation = (id) => {
    // Mock delete functionality
    console.log(`Supprimer la borne avec l'ID: ${id}`);
    alert(`Borne ${id} supprimée (Mock)`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Tableau de bord Admin</h2>
          <button className="btn-close" onClick={onClose} style={{ position: 'static' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="stat-icon"><MapPin size={24} /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalStations}</span>
                <span className="stat-label">Bornes</span>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon"><Users size={24} /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalUsers}</span>
                <span className="stat-label">Utilisateurs</span>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon"><Star size={24} /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalReviews}</span>
                <span className="stat-label">Avis</span>
              </div>
            </div>
          </div>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Gestion des bornes</h3>
          <div className="admin-stations-list">
            {stations.map(station => (
              <div key={station.id} className="admin-station-item">
                <div className="admin-station-info">
                  <h4>{station.name}</h4>
                  <span className="admin-station-address">{station.address}, {station.city}</span>
                </div>
                <button 
                  className="btn-icon btn-delete" 
                  onClick={() => handleDeleteStation(station.id)}
                  title="Supprimer la borne"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {stations.length === 0 && (
              <p style={{ color: 'var(--text-dim)' }}>Aucune borne disponible.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
