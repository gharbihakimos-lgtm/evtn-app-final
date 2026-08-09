import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, signup } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        setFormData({ ...formData, password: '', confirmPassword: '' });
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    }
  };

  const handleGoogleLogin = () => {
    login('google_mock@example.com', 'password123');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal auth-modal">
        <button className="btn-close" onClick={onClose}><X size={20} /></button>
        
        <div className="auth-tabs">
          <button 
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Connexion
          </button>
          <button 
            className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Inscription
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {activeTab === 'signup' && (
            <div className="form-group">
              <label>Nom complet</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          {activeTab === 'signup' && (
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          )}

          <button type="submit" className="btn-primary full-width">
            {activeTab === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <div className="auth-divider">
          <span>Ou</span>
        </div>

        <button className="btn-google full-width" onClick={handleGoogleLogin}>
          Continuer avec Google
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
