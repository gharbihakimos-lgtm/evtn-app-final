import React, { useState, useEffect } from 'react';
import { X, Trophy, Car, Gift, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockCoupons } from '../data/mockCoupons';

const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, getLeaderboard, redeemCoupon } = useAuth();
  const [activeTab, setActiveTab] = useState('profil'); // 'profil', 'leaderboard', 'coupons'
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedPass, setSelectedPass] = useState(null); // Selected claimed coupon for QR Code view
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');
  
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

  const availableConnectors = ['Type 2', 'CCS', 'CHAdeMO', 'Prise domestique'];

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
  };

  const handleRedeem = async (coupon) => {
    setRedeemError('');
    setRedeemSuccess('');
    try {
      const claimedPass = await redeemCoupon(coupon);
      setRedeemSuccess(`Bravo ! Offre "${coupon.title}" débloquée.`);
      setSelectedPass(claimedPass);
    } catch (err) {
      setRedeemError(err.message || 'Erreur lors du déblocage');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px', width: '92%' }}>
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
            className={`tab-btn ${activeTab === 'coupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            🎁 Avantages & Pass
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

          {activeTab === 'coupons' && (
            <div className="coupons-section">
              <div className="user-points-summary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem 1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <span>Solde de points fidélité :</span>
                <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Trophy size={18} /> {user?.points || 0} pts
                </span>
              </div>

              {redeemError && (
                <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} /> {redeemError}
                </div>
              )}

              {redeemSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '0.6rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} /> {redeemSuccess}
                </div>
              )}

              {/* Mes Pass Débloqués */}
              {(user?.coupons && user.coupons.length > 0) && (
                <div className="claimed-passes-section" style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <QrCode size={18} /> Mes Pass Privilèges Activés ({user.coupons.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {user.coupons.map((pass, i) => (
                      <div key={i} className="claimed-pass-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--primary)', borderRadius: '10px', padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>{pass.partnerLogo} {pass.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{pass.partnerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem', fontFamily: 'monospace' }}>Code: {pass.passCode}</div>
                        </div>
                        <button 
                          className="btn btn-outline"
                          onClick={() => setSelectedPass(pass)}
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <QrCode size={14} /> Voir QR
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Catalogue des Offres Partenaires */}
              <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Gift size={18} /> Offres Partenaires Disponibles
              </h4>
              
              <div className="coupons-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {mockCoupons.map((coupon) => {
                  const canAfford = (user?.points || 0) >= coupon.pointsCost;
                  return (
                    <div key={coupon.id} className="coupon-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.4rem' }}>{coupon.partnerLogo}</span>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>{coupon.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{coupon.partnerName}</div>
                          </div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700' }}>
                          {coupon.pointsCost} pts
                        </div>
                      </div>

                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                        {coupon.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px dashed var(--border)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Conditions : {coupon.terms}</span>
                        <button 
                          className={`btn ${canAfford ? 'btn-primary' : 'btn-outline'}`}
                          disabled={!canAfford}
                          onClick={() => handleRedeem(coupon)}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', opacity: canAfford ? 1 : 0.5 }}
                        >
                          {canAfford ? 'Obtenir' : 'Insuffisant'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
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

        {/* Modal Interne pour Afficher le QR Code du Pass */}
        {selectedPass && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }} onClick={() => setSelectedPass(null)}>
            <div style={{ background: '#0D1512', border: '2px solid var(--primary)', borderRadius: '16px', padding: '1.5rem', maxWidth: '380px', width: '100%', textCenter: 'center', textAlign: 'center', boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)' }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{selectedPass.partnerLogo}</div>
              <h3 style={{ color: 'var(--primary)', margin: '0 0 0.25rem 0', fontSize: '1.2rem' }}>Pass VIP EVTN</h3>
              <div style={{ fontWeight: '600', color: '#FFF', marginBottom: '0.25rem' }}>{selectedPass.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>{selectedPass.partnerName}</div>

              {/* QR Code SVG simulé ultra-pro */}
              <div style={{ background: '#FFF', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <svg width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" fill="white"/>
                  {/* Outer corner finders */}
                  <rect x="5" y="5" width="25" height="25" fill="black"/>
                  <rect x="9" y="9" width="17" height="17" fill="white"/>
                  <rect x="13" y="13" width="9" height="9" fill="black"/>

                  <rect x="70" y="5" width="25" height="25" fill="black"/>
                  <rect x="74" y="9" width="17" height="17" fill="white"/>
                  <rect x="78" y="13" width="9" height="9" fill="black"/>

                  <rect x="5" y="70" width="25" height="25" fill="black"/>
                  <rect x="9" y="74" width="17" height="17" fill="white"/>
                  <rect x="13" y="78" width="9" height="9" fill="black"/>

                  {/* Matrix pattern elements */}
                  <rect x="35" y="10" width="5" height="10" fill="black"/>
                  <rect x="45" y="5" width="15" height="5" fill="black"/>
                  <rect x="35" y="25" width="25" height="5" fill="black"/>
                  
                  <rect x="10" y="35" width="10" height="5" fill="black"/>
                  <rect x="25" y="35" width="15" height="15" fill="black"/>
                  <rect x="45" y="35" width="10" height="10" fill="black"/>
                  <rect x="60" y="35" width="30" height="5" fill="black"/>

                  <rect x="5" y="55" width="15" height="5" fill="black"/>
                  <rect x="25" y="55" width="5" height="10" fill="black"/>
                  <rect x="35" y="50" width="15" height="15" fill="black"/>
                  <rect x="55" y="55" width="20" height="10" fill="black"/>
                  <rect x="80" y="50" width="15" height="15" fill="black"/>

                  <rect x="35" y="70" width="10" height="10" fill="black"/>
                  <rect x="50" y="75" width="20" height="5" fill="black"/>
                  <rect x="75" y="70" width="15" height="10" fill="black"/>
                  <rect x="40" y="85" width="25" height="10" fill="black"/>
                  <rect x="70" y="85" width="15" height="10" fill="black"/>
                </svg>
              </div>

              <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '2px', color: 'var(--primary)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.4rem', borderRadius: '6px', marginBottom: '1rem' }}>
                {selectedPass.passCode}
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0 0 1.2rem 0' }}>
                Présentez ce QR Code au partenaire lors de votre recharge pour bénéficier de l'avantage.
              </p>

              <button className="btn btn-primary full-width" onClick={() => setSelectedPass(null)}>
                Fermer le Pass
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
