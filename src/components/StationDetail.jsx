import React, { useRef, useEffect, useState } from 'react';
import { X, MapPin, Zap, Star, Clock, Building2, Banknote, Plug, Navigation, Heart, Wifi, Hash, Coffee, ShoppingBag, Car } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStations } from '../context/StationsContext';
import { db, storage, isFirebaseConfigured } from '../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { formatDate, formatPower, getStatusLabel } from '../utils/helpers';
import StationForm from './StationForm';
import SlideButton from './SlideButton';
import { mockCoupons } from '../data/mockCoupons';

const StationDetail = () => {
  const { user, isAuthenticated, addPoints, toggleFavorite } = useAuth();
  const { selectedStation, setSelectedStation, updateStationStatus, addReview } = useStations();
  const panelRef = useRef(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    setCurrentPhotoIndex(0); // Reset when station changes
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
  const isFavorite = user?.favorites?.includes(station.id);

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
    try {
      let photoUrl = null;
      if (photoFile && storage) {
        const fileRef = ref(storage, `reviews/${Date.now()}_${photoFile.name}`);
        await uploadBytes(fileRef, photoFile);
        photoUrl = await getDownloadURL(fileRef);
      }

      const reviewData = {
        rating: newReview.rating,
        comment: newReview.comment,
        userName: user?.name || 'Anonyme',
        userId: user?.id || 'mock-id',
        ...(photoUrl && { photoUrl })
      };
      
      await addReview(station.id, reviewData);
      
      // Add to local state to update UI immediately
      setReviews(prev => [{...reviewData, createdAt: new Date().toISOString(), id: Math.random().toString()}, ...prev]);
      setNewReview({ rating: 5, comment: '' });
      setPhotoFile(null);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderStars = (rating, interactive = false, setRating = null) => {
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

  const getAmenityIcon = (type) => {
    switch (type) {
      case 'cafe': return <Coffee size={16} />;
      case 'wifi': return <Wifi size={16} />;
      case 'shopping': return <ShoppingBag size={16} />;
      case 'parking': return <Car size={16} />;
      case 'restroom': return <Building2 size={16} />;
      default: return null;
    }
  };

  const getAmenityLabel = (type) => {
    switch (type) {
      case 'cafe': return 'Café';
      case 'wifi': return 'Wi-Fi';
      case 'shopping': return 'Shopping';
      case 'parking': return 'Parking';
      case 'restroom': return 'Toilettes';
      default: return type;
    }
  };

  return (
    <div className="station-detail-overlay">
      <div className="station-detail" ref={panelRef}>
        <button className="btn-close" onClick={() => setSelectedStation(null)}>
          <X size={20} />
        </button>

        {station.photos && station.photos.length > 0 ? (
          <div className="station-cover" style={{ position: 'relative' }}>
            <img src={station.photos[currentPhotoIndex]} alt={station.name} />
            {station.photos.length > 1 && (
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.5rem', borderRadius: '12px', color: 'white', fontSize: '0.8rem' }}>
                {currentPhotoIndex + 1} / {station.photos.length}
              </div>
            )}
            {station.photos.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentPhotoIndex(prev => prev === 0 ? station.photos.length - 1 : prev - 1)}
                  style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ❮
                </button>
                <button 
                  onClick={() => setCurrentPhotoIndex(prev => prev === station.photos.length - 1 ? 0 : prev + 1)}
                  style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ❯
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="station-cover-placeholder"></div>
        )}

        <div className="detail-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {station.name}
              {station.isSmart && (
                <span title="Borne connectée en temps réel (OCPP)" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', gap: '0.2rem' }}>
                  <Wifi size={14} /> Connectée
                </span>
              )}
            </h2>
            {user && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  className="favorite-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (toggleFavorite) toggleFavorite(station.id);
                  }}
                  title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: isFavorite ? '#ef4444' : 'var(--text-dim)' }}
                >
                  <Heart size={22} fill={isFavorite ? "#ef4444" : "none"} />
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setIsEditing(true)}
                  title="Modifier ou corriger cette borne"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                >
                  Corriger
                </button>
              </div>
            )}
          </div>

          {/* Partner Privilege Banner */}
          {(() => {
            const matchedCoupon = mockCoupons.find(c => 
              c.targetOperatorKeywords.some(kw => 
                (station.name || '').toLowerCase().includes(kw) || 
                (station.operator || '').toLowerCase().includes(kw) ||
                (station.address || '').toLowerCase().includes(kw) ||
                (station.city || '').toLowerCase().includes(kw)
              )
            );
            if (!matchedCoupon) return null;
            return (
              <div className="partner-privilege-banner" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 95, 70, 0.4))', border: '1px solid var(--primary)', borderRadius: '10px', padding: '0.75rem', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{matchedCoupon.partnerLogo}</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}> Privilège Partenaire EVTN</div>
                    <div style={{ fontWeight: '600', color: '#FFF', fontSize: '0.88rem' }}>{matchedCoupon.title}</div>
                  </div>
                </div>
                <div style={{ background: 'var(--primary)', color: '#000', fontWeight: '700', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                  {matchedCoupon.pointsCost} pts
                </div>
              </div>
            );
          })()}

          <div className="address-line" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} />
              <span>{station.address}, {station.city}</span>
            </div>
            {station.reference && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '1.4rem' }}>
                <span>Réf: {station.reference}</span>
              </div>
            )}
          </div>
        </div>

        <div className={`status-badge-large ${station.status}`} style={{ display: 'flex', flexDirection: 'column' }}>
          <span>{getStatusLabel(station.status)}</span>
          {station.status === 'busy' && station.busyUntil && new Date(station.busyUntil) > new Date() && (
            <span style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.2rem', fontWeight: 'normal' }}>
              Disponible vers {new Date(station.busyUntil).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          )}
        </div>

        <div className="action-buttons-row" style={{ marginTop: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', display: 'flex', gap: '0.5rem' }}>
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '0.8rem', minWidth: '150px' }}
          >
            <Navigation size={18} />
            <span>Y aller (GPS)</span>
          </a>
          
          <SlideButton
            active={station.status === 'busy'}
            text={station.status === 'available' ? 'Glissez pour brancher ➔' : 'Glissez pour débrancher ➔'}
            icon={Plug}
            onConfirm={() => {
              if (station.status === 'available') {
                handleStatusUpdate('busy');
                if (addPoints) addPoints(5);
              } else {
                handleStatusUpdate('available');
              }
            }}
          />
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
            {station.reference && (
              <div className="info-item">
                <Hash size={18} />
                <div>
                  <span className="label">Référence</span>
                  <span className="value">{station.reference}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h3>Connecteurs</h3>
          <div className="connectors-list-large">
            {(station.connectors || []).map(conn => (
              <span key={conn} className="connector-tag-large">
                <Plug size={14} /> {conn}
              </span>
            ))}
          </div>
        </div>

        {station.amenities && station.amenities.length > 0 && (
          <div className="detail-section">
            <h3>À proximité</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {station.amenities.map(am => (
                <div key={am} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                  {getAmenityIcon(am)}
                  <span>{getAmenityLabel(am)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="detail-section">
          <div className="rating-large">
            <div className="stars">
              {renderStars(station.rating || 0)}
            </div>
            <span className="rating-value">{typeof station?.rating === 'number' ? station.rating.toFixed(1) : '0.0'}</span>
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
                  <p style={{ margin: 0, fontSize: '0.9rem', marginBottom: rev.photoUrl ? '0.5rem' : '0' }}>{rev.comment}</p>
                  {rev.photoUrl && (
                    <a href={rev.photoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '0.5rem' }}>
                      <img src={rev.photoUrl} alt="Avis" className="review-photo" />
                    </a>
                  )}
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{formatDate(rev.createdAt)}</span>
                </div>
              ))
            )}
          </div>

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} style={{ marginTop: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 0.5rem' }}>Laissez un avis</h4>
              <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.5rem' }}>
                {renderStars(newReview.rating, true, (rating) => setNewReview(prev => ({...prev, rating})))}
              </div>
              <textarea 
                placeholder="Partagez votre expérience..."
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({...prev, comment: e.target.value}))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', marginBottom: '0.5rem', resize: 'vertical' }}
                required
              />
              <div style={{ marginBottom: '1rem' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}
                />
              </div>
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
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
              ><div className="status-dot available" style={{ margin: 0 }}></div> Disponible</button>
              <button 
                className={`btn-status-update occupee ${station.status === 'busy' ? 'active' : ''}`}
                onClick={() => handleStatusUpdate('busy')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
              ><div className="status-dot busy" style={{ margin: 0 }}></div> Occupée</button>
              <button 
                className={`btn-status-update hors-service ${station.status === 'offline' ? 'active' : ''}`}
                onClick={() => handleStatusUpdate('offline')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
              ><div className="status-dot offline" style={{ margin: 0 }}></div> Hors service</button>
            </div>
          </div>
        )}

        <div className="last-updated">
          Dernière mise à jour : {formatDate(station.lastUpdate)}
          {station.updatedBy && ` par ${station.updatedBy}`}
        </div>
      </div>
      <StationForm 
        isOpen={isEditing} 
        onClose={() => setIsEditing(false)} 
        initialData={station} 
      />
    </div>
  );
};

export default StationDetail;
