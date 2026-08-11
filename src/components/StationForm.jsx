import React, { useState, useEffect } from 'react';
import { useStations } from '../context/StationsContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { POWER_OPTIONS, CONNECTOR_TYPES } from '../data/mockStations';
import { X, MapPin, Camera } from 'lucide-react';

const CITIES = ['Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Nabeul', 'Ariana', 'Gabès'];

const StationForm = ({ isOpen, onClose, initialData = null }) => {
  const { addStation, editStation } = useStations();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    city: initialData?.city || 'Tunis',
    lat: initialData?.lat || '',
    lng: initialData?.lng || '',
    power: initialData?.power || POWER_OPTIONS?.[0] || '22',
    connectors: initialData?.connectors || [],
    status: initialData?.status || 'available',
    price: initialData?.price || 'Gratuit',
    operator: initialData?.operator || '',
    openHours: initialData?.openHours || '24/7',
    description: initialData?.description || '',
    reference: initialData?.reference || '',
    isSmart: initialData?.isSmart || false
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialData?.photos?.[0] || '');

  // Reset form when modal opens with new initialData
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || '',
        address: initialData?.address || '',
        city: initialData?.city || 'Tunis',
        lat: initialData?.lat || '',
        lng: initialData?.lng || '',
        power: initialData?.power || POWER_OPTIONS?.[0] || '22',
        connectors: initialData?.connectors || [],
        status: initialData?.status || 'available',
        price: initialData?.price || 'Gratuit',
        operator: initialData?.operator || '',
        openHours: initialData?.openHours || '24/7',
        description: initialData?.description || '',
        reference: initialData?.reference || '',
        isSmart: initialData?.isSmart || false
      });
      setPhotoPreview(initialData?.photos?.[0] || '');
      setPhotoFile(null);
      setError('');
    }
  }, [isOpen, initialData]);
  const [error, setError] = useState('');
  const { position, loading } = useGeolocation();

  useEffect(() => {
    if (position && !formData.lat && !formData.lng) {
      setFormData(prev => ({
        ...prev,
        lat: position.lat.toFixed(6),
        lng: position.lng.toFixed(6)
      }));
    }
  }, [position]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      if (files && files[0]) {
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoFile(files[0]);
        setPhotoPreview(URL.createObjectURL(files[0]));
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        connectors: checked 
          ? [...prev.connectors, value]
          : prev.connectors.filter(c => c !== value)
      }));
    } else if (name === 'isSmart') {
      setFormData(prev => ({ ...prev, isSmart: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.city || !formData.lat || !formData.lng || formData.connectors.length === 0) {
      setError('Veuillez remplir tous les champs obligatoires et choisir au moins un connecteur.');
      return;
    }
    
    const newStation = {
      ...formData,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      power: parseFloat(formData.power),
    };
    
    if (initialData) {
      editStation(initialData.id, newStation, photoFile);
    } else {
      addStation(newStation, photoFile);
    }
    
    // Reset form after submit
    setPhotoFile(null);
    setPhotoPreview('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal station-form">
        <button className="btn-close" onClick={onClose}><X size={20} /></button>
        <h2>{initialData ? 'Modifier la borne' : 'Ajouter une nouvelle borne'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="photo-upload-section">
            <label htmlFor="photo-upload" className="photo-upload-label">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="photo-preview" />
              ) : (
                <div className="photo-upload-placeholder">
                  <Camera size={32} />
                  <span>Ajouter une photo (optionnel)</span>
                </div>
              )}
            </label>
            <input 
              id="photo-upload" 
              type="file" 
              name="photo" 
              accept="image/*" 
              onChange={handleChange} 
              style={{ display: 'none' }}
            />
          </div>

          <div className="form-group">
            <label>Nom de la station *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Adresse *</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Ville *</label>
            <select name="city" value={formData.city} onChange={handleChange}>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude * {loading ? '(Géolocalisation...)' : '(Position actuelle)'}</label>
              <input type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Longitude *</label>
              <input type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Puissance *</label>
            <select name="power" value={formData.power} onChange={handleChange}>
              {POWER_OPTIONS?.map(p => <option key={p} value={p}>{p} kW</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Connecteurs *</label>
            <div className="checkbox-group">
              {CONNECTOR_TYPES?.map(conn => (
                <label key={conn} className="checkbox-label">
                  <input type="checkbox" name="connectors" value={conn} checked={formData.connectors.includes(conn)} onChange={handleChange} />
                  {conn}
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Statut</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="available">Disponible</option>
                <option value="busy">Occupée</option>
                <option value="offline">Hors service</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tarif</label>
              <input type="text" name="price" value={formData.price} onChange={handleChange} placeholder="ex: Gratuit, 0.5 TND/kWh" />
            </div>
          </div>

          <div className="form-group">
            <label>Opérateur</label>
            <input type="text" name="operator" value={formData.operator} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label>Référence (Optionnel)</label>
            <input type="text" name="reference" value={formData.reference} onChange={handleChange} placeholder="ex: FR*CHG*E12345" />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <input type="checkbox" id="isSmart" name="isSmart" checked={formData.isSmart} onChange={handleChange} />
            <label htmlFor="isSmart" style={{ margin: 0 }}>Borne connectée (OCPP / Temps réel)</label>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary">{initialData ? 'Enregistrer' : 'Ajouter'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StationForm;
