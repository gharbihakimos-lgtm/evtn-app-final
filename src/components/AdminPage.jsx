import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStations } from '../context/StationsContext';
import StationForm from './StationForm';
import { Users, LayoutDashboard, MapPin, Edit, Trash2, LogOut, Activity, Star } from 'lucide-react';

const AdminPage = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, getAllUsers, updateUserRole } = useAuth();
  const { stations, deleteStation, getAdminStats } = useStations();
  
  const [stats, setStats] = useState({ totalStations: 0, totalUsers: 0, totalReviews: 0 });
  const [users, setUsers] = useState([]);
  const [editingStation, setEditingStation] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'dashboard') {
      Promise.resolve(getAdminStats()).then(currentStats => {
        if (isMounted && currentStats) setStats(currentStats);
      });
    } else if (activeTab === 'users') {
      Promise.resolve(getAllUsers()).then(allUsers => {
        if (isMounted && Array.isArray(allUsers)) setUsers(allUsers);
      });
    }
    return () => { isMounted = false; };
  }, [activeTab, getAdminStats, getAllUsers]);

  const handleDeleteStation = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette borne ?")) {
      deleteStation(id);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    if (window.confirm("Changer le rôle de cet utilisateur ?")) {
      await updateUserRole(userId, !currentRole);
      const updatedUsers = await getAllUsers();
      if (Array.isArray(updatedUsers)) setUsers(updatedUsers);
    }
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Activity className="brand-icon" size={28} />
          <div>
            <h2>Admin Panel</h2>
            <span className="tagline">EVTN Management</span>
          </div>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            Tableau de bord
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'stations' ? 'active' : ''}`}
            onClick={() => setActiveTab('stations')}
          >
            <MapPin size={20} />
            Bornes
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            Utilisateurs
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="avatar">{user?.name?.charAt(0) || 'A'}</div>
            <div className="user-details">
              <span className="name">{user?.name}</span>
              <span className="role">Administrateur</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-exit" onClick={() => onExit?.()}>
            <LogOut size={18} />
            Retour à la carte
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <h1>
            {activeTab === 'dashboard' && 'Tableau de bord'}
            {activeTab === 'stations' && 'Gestion des Bornes'}
            {activeTab === 'users' && 'Gestion des Utilisateurs'}
          </h1>
          {activeTab === 'stations' && (
            <button className="btn btn-primary" onClick={() => setEditingStation({})}>
              + Nouvelle Borne
            </button>
          )}
        </header>

        <div className="admin-scrollable-area">
          {activeTab === 'dashboard' && (
            <div className="admin-dashboard">
              <div className="stat-card">
                <div className="stat-icon"><MapPin size={24} /></div>
                <div className="stat-info">
                  <h3>Total Bornes</h3>
                  <p className="stat-value">{stats.totalStations}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Users size={24} /></div>
                <div className="stat-info">
                  <h3>Total Utilisateurs</h3>
                  <p className="stat-value">{stats.totalUsers}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Star size={24} /></div>
                <div className="stat-info">
                  <h3>Total Avis</h3>
                  <p className="stat-value">{stats.totalReviews}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stations' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nom / Ville</th>
                    <th>Statut</th>
                    <th>Connecteurs</th>
                    <th>Prix</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map(station => (
                    <tr key={station.id}>
                      <td>
                        <div className="td-title">{station.name}</div>
                        <div className="td-subtitle">{station.city}</div>
                      </td>
                      <td>
                        <span className={`status-badge status-${(station.status || 'offline').replace(/\s+/g, '-').toLowerCase()}`}>
                          {station.status}
                        </span>
                      </td>
                      <td>{station.connectors?.length || 0}</td>
                      <td>{station.price}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" onClick={() => setEditingStation(station)} title="Éditer">
                            <Edit size={18} />
                          </button>
                          <button className="btn-icon danger" onClick={() => handleDeleteStation(station.id)} title="Supprimer">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Points</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-profile-sm">
                          <div className="avatar-sm">{u.name?.charAt(0) || 'U'}</div>
                          <span>{u.name || 'Utilisateur'}</span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.isAdmin ? 'admin' : 'user'}`}>
                          {u.isAdmin ? 'Admin' : 'Utilisateur'}
                        </span>
                      </td>
                      <td>{u.points || 0} pts</td>
                      <td>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => handleToggleRole(u.id, u.isAdmin)}
                          disabled={u.id === user?.id} // Prevent removing own admin role
                        >
                          {u.isAdmin ? 'Rétrograder' : 'Promouvoir'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {editingStation && (
        <StationForm 
          isOpen={!!editingStation} 
          onClose={() => setEditingStation(null)} 
          initialData={Object.keys(editingStation).length === 0 ? null : editingStation} 
        />
      )}
    </div>
  );
};

export default AdminPage;
