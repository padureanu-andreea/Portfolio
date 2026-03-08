import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Bun venit la AntiFoodWaste</h1>
      <p>Gestionează-ți inventarul și ajută la reducerea risipei alimentare.</p>
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button onClick={() => navigate('/login')} style={{ padding: '15px 30px', fontSize: '1.1rem' }}>
          Conectare
        </button>
        <button onClick={() => navigate('/register')} className="secondary" style={{ padding: '15px 30px', fontSize: '1.1rem' }}>
          Înregistrare
        </button>
      </div>
    </div>
  );
};

export default Landing;