import React, { useRef, useEffect } from 'react';
import { X, MapPin, Zap, Star, Clock, Building2, Banknote, Plug, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStations } from '../context/StationsContext';
import { formatDate, formatPower, getStatusLabel } from '../utils/helpers';

const StationDetail = () => {
  const { user, isAuthenticated } = useAuth();
  const { selectedStation, setSelectedStation, updateStationStatus } = useStations();
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setSelectedStation(null);
      }
    };
    if (selectedStation) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectedStation, setSelectedStation]);

  if (!selectedStation) return null;

  const station = selectedStation;

  const handleStatusUpdate = (newStatus) => {
    updateStationStatus(station.id, newStatus, user?.name || 'Anonyme');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={18}
          className={`star-icon ${i < fullStars ? 'filled' : ''}`}
          fill={i < fullStars ? '#F59E0B' : 'none'}
          stroke="#F59E0B"
        />
      );
    }
    return stars;
  };

  return (
    <div className="station-detail-overlay">
      <div className="station-detail" ref={panelRef}>
        <button className="btn-close" onClick={() => setSelectedStation(null)}>
          <X size={20} />
        </button>

        {station.photos && station.photos.length > 0 ? (
          <div className="station-cover">
            <img src={station.photos[0]} alt={station.name} />
          </div>
        ) : (
          <div className="station-cover-placeholder"></div>
        )}

        <div className="detail-header">
          <h2>{station.name}</h2>
          <div className="address-line">
            <MapPin size={16} />
            <span>{station.address}, {station.city}</span>
          </div>
        </div>

        <div className={`status-badge-large ${station.status}`}>
          {getStatusLabel(station.status)}
        </div>

        <div className="action-buttons-row" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
          >
            <Navigation size={18} />
            <span>Y aller (GPS)</span>
          </a>
        </div>

        <div className="detail-section">
          <h3>Informations</h3>
          <div className="info-grid">
            <div className="info-item">
              <Zap size={18} />
              <div>
                <span className="label">Puissance</span>
                <span className="value">{formatPower(station.power)}</span>
              </div>
            </div>
            <div className="info-item">
              <Clock size={18} />
              <div>
                <span className="label">Horaires</span>
                <span className="value">{station.openHours || '24/7'}</span>
              </div>
            </div>
            <div className="info-item">
              <Building2 size={18} />
              <div>
                <span className="label">Opérateur</span>
                <span className="value">{station.operator || 'Indépendant'}</span>
              </div>
            </div>
            <div className="info-item">
              <Banknote size={18} />
              <div>
                <span className="label">Tarif</span>
                <span className="value price">{station.price}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Connecteurs</h3>
          <div className="connectors-list-large">
            {station.connectors.map(conn => (
              <span key={conn} className="connector-tag-large">
                <Plug size={14} /> {conn}
              </span>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <div className="rating-large">
            <div className="stars">
              {renderStars(station.rating || 0)}
            </div>
            <span className="rating-value">{station.rating?.toFixed(1) || '0.0'}</span>
            <span className="review-count">({station.reviewCount || 0} avis)</span>
          </div>
          {station.description && (
            <p className="description">{station.description}</p>
          )}
        </div>

        {isAuthenticated && (
          <div className="detail-section status-update-section">
            <h3>Mettre à jour le statut</h3>
            <div className="status-update-buttons">
              <button 
                className={`btn-status-update disponible ${station.status === 'available' ? 'active' : ''}`}
                onClick={() => handleStatusUpdate('available')}
              >🟢 Disponible</button>
              <button 
                className={`btn-status-update occupee ${station.status === 'busy' ? 'active' : ''}`}
                onClick={() => handleStatusUpdate('busy')}
              >🟡 Occupée</button>
              <button 
                className={`btn-status-update hors-service ${station.status === 'offline' ? 'active' : ''}`}
                onClick={() => handleStatusUpdate('offline')}
              >🔴 Hors service</button>
            </div>
          </div>
        )}

        <div className="last-updated">
          Dernière mise à jour : {formatDate(station.lastUpdate)}
          {station.updatedBy && ` par ${station.updatedBy}`}
        </div>
      </div>
    </div>
  );
};

export default StationDetail;
