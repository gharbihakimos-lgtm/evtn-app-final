import React, { useRef, useEffect, useState } from 'react';
import { X, MapPin, Zap, Star, Clock, Building2, Banknote, Plug, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStations } from '../context/StationsContext';
import { db, isFirebaseConfigured } from '../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { formatDate, formatPower, getStatusLabel } from '../utils/helpers';

const StationDetail = () => {
  const { user, isAuthenticated, addPoints } = useAuth();
  const { selectedStation, setSelectedStation, updateStationStatus, addReview } = useStations();
  const panelRef = useRef(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setSelectedStation(null);
      }
    };
    if (selectedStation) {
      document.addEventListener('mousedown', handleClick);
      // Fetch reviews
      if (isFirebaseConfigured) {
        const fetchReviews = async () => {
          try {
            const q = query(collection(db, 'reviews'), where('stationId', '==', selectedStation.id));
            const querySnapshot = await getDocs(q);
            const revs = [];
            querySnapshot.forEach((doc) => {
              revs.push({ id: doc.id, ...doc.data() });
            });
            // Sort client side because we might need an index if we order by in query
            revs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setReviews(revs);
          } catch (error) {
            console.error("Firestore reviews error:", error);
            setReviews([]);
          }
        };
        fetchReviews();
      } else {
        setReviews([]);
      }
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectedStation, setSelectedStation]);

  if (!selectedStation) return null;

  const station = selectedStation;

  const handleStatusUpdate = (newStatus) => {
    updateStationStatus(station.id, newStatus, user?.name || 'Anonyme');
  };

  const handleCheckIn = (minutes) => {
    const busyUntil = new Date(Date.now() + minutes * 60000).toISOString();
    updateStationStatus(station.id, 'busy', user?.name || 'Anonyme', busyUntil);
    setShowCheckIn(false);
    if (addPoints) addPoints(2); // Award 2 points for check-in
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    
    setIsSubmittingReview(true);
    const reviewData = {
      rating: newReview.rating,
      comment: newReview.comment,
      userName: user?.name || 'Anonyme',
      userId: user?.id || 'mock-id'
    };
    
    await addReview(station.id, reviewData);
    
    // Add to local state to update UI immediately
    setReviews(prev => [{...reviewData, createdAt: new Date().toISOString(), id: Math.random().toString()}, ...prev]);
    setNewReview({ rating: 5, comment: '' });
    setIsSubmittingReview(false);
  };

  const renderStars = (rating, interactive = false, currentRating = 0, setRating = null) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={18}
          className={`star-icon ${i < fullStars ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          fill={i < fullStars ? '#F59E0B' : 'none'}
          stroke="#F59E0B"
          onClick={() => interactive && setRating(i + 1)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
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

        <div className="action-buttons-row" style={{ marginTop: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '0.8rem' }}
          >
            <Navigation size={18} />
            <span>Y aller (GPS)</span>
          </a>
          
          {isAuthenticated && station.status === 'available' && (
            <button 
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '0.8rem', background: 'var(--primary)' }}
              onClick={() => setShowCheckIn(!showCheckIn)}
            >
              <Plug size={18} />
              <span>Je me branche</span>
            </button>
          )}
        </div>

        {showCheckIn && (
          <div className="checkin-menu" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <p style={{ width: '100%', margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Combien de temps allez-vous rester ?
            </p>
            <button className="btn-secondary" onClick={() => handleCheckIn(30)}>30 min</button>
            <button className="btn-secondary" onClick={() => handleCheckIn(60)}>1 h</button>
            <button className="btn-secondary" onClick={() => handleCheckIn(120)}>2 h</button>
          </div>
        )}

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

          <div className="reviews-list" style={{ marginTop: '1rem' }}>
            <h4>Derniers avis</h4>
            {reviews.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Aucun avis pour le moment.</p>
            ) : (
              reviews.map(rev => (
                <div key={rev.id} style={{ background: 'var(--bg-secondary)', padding: '0.8rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <strong>{rev.userName}</strong>
                    <div style={{ display: 'flex' }}>{renderStars(rev.rating)}</div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{rev.comment}</p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{formatDate(rev.createdAt)}</span>
                </div>
              ))
            )}
          </div>

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} style={{ marginTop: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 0.5rem' }}>Laissez un avis</h4>
              <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.5rem' }}>
                {renderStars(newReview.rating, true, newReview.rating, (rating) => setNewReview(prev => ({...prev, rating})))}
              </div>
              <textarea 
                placeholder="Partagez votre expérience..."
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({...prev, comment: e.target.value}))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', marginBottom: '0.5rem', resize: 'vertical' }}
                required
              />
              <button type="submit" className="btn-primary" disabled={isSubmittingReview} style={{ width: '100%', justifyContent: 'center' }}>
                {isSubmittingReview ? 'Envoi...' : 'Publier'}
              </button>
            </form>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '1rem' }}>Connectez-vous pour laisser un avis et gagner des points !</p>
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
