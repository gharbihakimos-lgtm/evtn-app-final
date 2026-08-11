import React, { useState } from 'react';
import { X, Shield, FileText, Scale } from 'lucide-react';

const LegalModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('cgu'); // cgu, privacy, legal

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '700px', height: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Informations Légales</h2>
          <button className="btn-close" onClick={onClose} style={{ position: 'static' }}>
            <X size={20} />
          </button>
        </div>

        <div className="auth-tabs" style={{ marginTop: '1rem' }}>
          <button 
            className={`tab-btn ${activeTab === 'cgu' ? 'active' : ''}`}
            onClick={() => setActiveTab('cgu')}
          >
            <Scale size={16} style={{ marginRight: '0.4rem', verticalAlign: 'text-bottom' }} /> CGU
          </button>
          <button 
            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Shield size={16} style={{ marginRight: '0.4rem', verticalAlign: 'text-bottom' }} /> Confidentialité
          </button>
          <button 
            className={`tab-btn ${activeTab === 'legal' ? 'active' : ''}`}
            onClick={() => setActiveTab('legal')}
          >
            <FileText size={16} style={{ marginRight: '0.4rem', verticalAlign: 'text-bottom' }} /> Mentions Légales
          </button>
        </div>

        <div className="legal-content" style={{ overflowY: 'auto', padding: '1rem 0', flex: 1, color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {activeTab === 'cgu' && (
            <div>
              <h3>Conditions Générales d'Utilisation (CGU)</h3>
              <p>Dernière mise à jour : Août 2026</p>
              
              <h4 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>1. Objet</h4>
              <p>L'application EVTN (ci-après "l'Application") permet aux utilisateurs de localiser, d'ajouter et d'évaluer des bornes de recharge pour véhicules électriques en Tunisie.</p>

              <h4 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>2. Contributions des utilisateurs</h4>
              <p>Les utilisateurs inscrits peuvent ajouter de nouvelles bornes, modifier des informations existantes et laisser des avis. En soumettant des contenus (données, textes, photos), vous garantissez avoir les droits nécessaires et vous accordez à EVTN une licence d'utilisation non exclusive.</p>

              <h4 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>3. Responsabilité</h4>
              <p>EVTN est une plateforme communautaire. Nous ne garantissons pas l'exactitude des informations fournies par les utilisateurs (disponibilité, tarifs, puissance). L'utilisation de ces informations se fait à vos propres risques.</p>

              <h4 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>4. Modération</h4>
              <p>Nous nous réservons le droit de supprimer tout contenu jugé inapproprié (faux avis, spam, photos non pertinentes) et de suspendre le compte des utilisateurs ne respectant pas ces règles.</p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <h3>Politique de Confidentialité</h3>
              <p>Dernière mise à jour : Août 2026</p>

              <h4 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>1. Données collectées</h4>
              <p>Lors de votre utilisation de l'Application, nous collectons :<br/>
              - Vos données d'identification (nom, email, photo de profil) via Google Auth ou Email.<br/>
              - Vos données de localisation (avec votre consentement explicite) pour centrer la carte.<br/>
              - Les informations relatives à votre véhicule (type de connecteur).<br/>
              - Vos actions sur la plateforme (bornes favorites, avis, bornes ajoutées).</p>

              <h4 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>2. Utilisation des données</h4>
              <p>Vos données sont exclusivement utilisées pour le fonctionnement de l'application (authentification, personnalisation de l'affichage, leaderboard). Nous ne revendons aucune donnée à des tiers.</p>

              <h4 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>3. Hébergement</h4>
              <p>La base de données et l'authentification sont hébergées de manière sécurisée sur l'infrastructure Google Firebase (Firestore, Firebase Auth).</p>

              <h4 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>4. Vos droits</h4>
              <p>Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez demander la suppression de votre compte depuis les paramètres (ou en nous contactant).</p>
            </div>
          )}

          {activeTab === 'legal' && (
            <div>
              <h3>Mentions Légales</h3>
              
              <h4 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>1. Éditeur de l'application</h4>
              <p>
                <strong>Nom de l'application :</strong> EVTN - Recharge Tunisie<br/>
                <strong>Développé par :</strong> Communauté EVTN<br/>
                <strong>Email de contact :</strong> contact@evtn-app.tn<br/>
              </p>

              <h4 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>2. Hébergement</h4>
              <p>
                L'application web est hébergée par :<br/>
                <strong>Google LLC (Firebase)</strong><br/>
                1600 Amphitheatre Parkway<br/>
                Mountain View, CA 94043, USA<br/>
              </p>

              <h4 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>3. Propriété intellectuelle</h4>
              <p>Sauf mention contraire, les éléments de l'interface (code source, design, logos) sont la propriété exclusive du projet EVTN. Les données relatives aux bornes de recharge sont générées par la communauté et publiées sous licence ouverte (Open Data).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
