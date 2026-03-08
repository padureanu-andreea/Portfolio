import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  
  // Starea locală pentru input-uri
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    bio: ''
  });

  // Stare pentru notificări (fără alert)
  const [notification, setNotification] = useState(null);

  // Pasul 1: Populați formularul când datele utilizatorului sunt încărcate din context
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const showNotification = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Trimitem modificările la backend
      const { data } = await API.patch('/auth/me', formData);
      
      // Actualizăm contextul global - acest lucru va declanșa actualizarea previzualizării
      setUser(data.user);
      showNotification("Profilul a fost actualizat cu succes!");
    } catch (err) {
      showNotification(err.response?.data?.message || "Eroare la actualizare.", "error");
    }
  };

  return (
    <div className="container">
      {/* Sistem de notificare personalizat */}
      {notification && (
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: '600',
          backgroundColor: notification.type === 'success' ? 'var(--primary-green)' : 'var(--danger)',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {notification.text}
        </div>
      )}

      <div className="card">
        {/* S-a scos cuvântul 'Eco' conform cerinței */}
        <h2 style={{ color: 'var(--primary-green)', marginBottom: '10px' }}>
          Gestionare Profil <span className="tag">Membru Comunitate</span>
        </h2>
        <p style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
          Datele tale sunt folosite pentru a facilita ridicarea produselor revendicate.
        </p>

        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: '600' }}>Nume utilizator (unic):</label>
            <input 
              type="text" 
              value={formData.username} 
              onChange={e => setFormData({ ...formData, username: e.target.value })} 
              required 
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: '600' }}>Număr de telefon (07xxxxxxxx):</label>
            <input 
              type="text" 
              value={formData.phone} 
              onChange={e => setFormData({ ...formData, phone: e.target.value })} 
              placeholder="Ex: 0722123456"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: '600' }}>Despre tine:</label>
            <textarea 
              value={formData.bio} 
              onChange={e => setFormData({ ...formData, bio: e.target.value })} 
              placeholder="Spune-le celorlalți ceva despre tine..."
              style={{ height: '100px', resize: 'vertical' }}
            />
          </div>

          <button type="submit" style={{ width: '100%', marginTop: '10px' }}>
            Salvează Modificările
          </button>
        </form>
      </div>

      {/* Secțiune Previzualizare: Folosește datele din 'user' pentru a se actualiza doar după Save */}
      <div className="category-section" style={{ marginTop: '30px' }}>
        <h3>Previzualizare Profil</h3>
        <div className="card" style={{ borderLeft: '5px solid var(--primary-green)' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>{user?.username || "Încărcare..."}</h4>
          <p><strong>Contact:</strong> {user?.phone || 'Fără telefon setat'}</p>
          <p><strong>Despre:</strong> {user?.bio || 'Nicio descriere adăugată.'}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;