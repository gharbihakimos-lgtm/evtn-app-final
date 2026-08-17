import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, signup, loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (isOpen) {
      setError('');
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setActiveTab('login');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (activeTab === 'login') {
        await login(formData.email, formData.password);
        onClose();
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas.');
          return;
        }
        await signup(formData.name, formData.email, formData.password);
        setActiveTab('login');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (err) {
      setError(err?.message ? String(err.message) : 'Une erreur est survenue.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(err?.message ? String(err.message) : 'Erreur lors de la connexion avec Google.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" style={{ position: 'relative' }}>
          <button type="button" className="btn-close" onClick={onClose} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 10 }}>
            <X size={20} />
          </button>
        
          <div className="auth-tabs">
            <button type="button" className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>Connexion</button>
            <button type="button" className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => setActiveTab('signup')}>Inscription</button>
          </div>

          {error ? <div className="error-message">{error}</div> : null}

          <form onSubmit={handleSubmit} className="auth-form">
            {activeTab === 'signup' ? (
              <div className="form-group">
                <label>Nom complet</label>
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required />
              </div>
            ) : null}
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" name="password" value={formData.password || ''} onChange={handleChange} required />
            </div>
            {activeTab === 'signup' ? (
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword || ''} onChange={handleChange} required />
              </div>
            ) : null}

            <button type="submit" className="btn-primary full-width">
              {activeTab === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>

          <div className="auth-divider">
            <span>Ou</span>
          </div>

          <button type="button" className="btn-google full-width" onClick={handleGoogleLogin}>
            Continuer avec Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
