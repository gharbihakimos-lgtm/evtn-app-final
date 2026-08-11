import React from 'react';
import { Zap, Star, MapPin, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatPower, getStatusLabel } from '../utils/helpers';

const StationCard = ({ station, onClick, isSelected }) => {
  const { user, toggleFavorite } = useAuth();
  const isFavorite = user?.favorites?.includes(station.id);

  return (
    <div 
      className={`station-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="card-header">
        <div className="title-section">
          <div className={`status-dot ${station.status}`}></div>
          <div className="title-info">
            <h3>{station.name}</h3>
            <span className="city"><MapPin size={11} /> {station.city}</span>
          </div>
        </div>
        <div className="power-badge">
          <Zap size={12} />
          <span>{formatPower(station.power)}</span>
        </div>
        {user && (
          <button 
            className="favorite-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (toggleFavorite) toggleFavorite(station.id);
            }}
          >
            <Heart 
              size={18} 
              fill={isFavorite ? '#ef4444' : 'none'} 
              color={isFavorite ? '#ef4444' : 'var(--text-muted)'} 
            />
          </button>
        )}
      </div>

      <div className="connectors-list">
        {(station.connectors || []).map(conn => (
          <span key={conn} className="connector-tag">{conn}</span>
        ))}
      </div>

      <div className="card-footer">
        <div className="rating">
          <Star size={13} className="star-icon" />
          <span>{station.rating?.toFixed(1) || 'N/A'}</span>
        </div>
        <div className="price">{station.price}</div>
      </div>
      
      <div className="updated-time">
        {formatDate(station.lastUpdate)}
      </div>
    </div>
  );
};

export default StationCard;
