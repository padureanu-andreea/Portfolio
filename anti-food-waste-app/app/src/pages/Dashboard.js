import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const [feed, setFeed] = useState([]);
    const [myClaims, setMyClaims] = useState([]);
    const { user } = useContext(AuthContext);

    const fetchData = async () => {
        try {
            const resFeed = await API.get('/feed/products');
            setFeed(resFeed.data);

            const resClaims = await API.get('/claims?as=claimer');
            setMyClaims(resClaims.data);
        } catch (err) {
            console.error("Eroare la încărcarea datelor", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const claimItem = async (id) => {
        try {
            await API.post(`/inventory/${id}/claims`);
            window.customAlert("Revendicare trimisă cu succes!");
            fetchData(); 
        } catch (err) {
            window.customAlert("Ne pare rău, acest produs nu mai este disponibil. Actualizăm feed-ul...");
            fetchData(); 
        }
    };

    const shareOnSocial = async (id, platform) => {
        try {
            const { data } = await API.get(`/integrations/share/${platform}/${id}`);
            if (data && data.shareUrl) {
                if (platform === 'instagram' && data.generatedMessage) {
                    await navigator.clipboard.writeText(data.generatedMessage);
                    window.customAlert("Mesaj copiat! Te redirecționăm la Instagram.");
                }
                window.open(data.shareUrl, "_blank");
            }
        } catch (err) {
            window.customAlert("Eroare la share.");
        }
    };

    return (
        <div className="container">
            <h2 style={{ color: 'var(--primary-green)' }}>Produse Disponibile în Grupuri</h2>
            <div className="grid">
                {feed.length === 0 && <p>Niciun produs nou de la prieteni momentan.</p>}
                {feed.map(item => (
                    <div key={item.id} className="card">
                        <h3>{item.name}</h3>
                        <p><strong>Categorie:</strong> {item.category} | <strong>Cantitate:</strong> {item.quantity}</p>
                        <p><strong>De la:</strong> {item.User?.username}</p>
                        <p><strong>Expiră la:</strong> {new Date(item.expiryDate).toLocaleDateString()}</p>
                        
                        <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {/* Doar cei care NU dețin produsul îl pot revendica */}
                            {user && item.ownerId !== user.id && (
                                <button onClick={() => claimItem(item.id)} style={{ flex: 1 }}>
                                    Revendică
                                </button>
                            )}

                            {/* Doar proprietarul poate da share pe social media */}
                            {user && item.ownerId === user.id && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Share:</span>
                                    <button onClick={() => shareOnSocial(item.id, 'facebook')} style={{ background: 'none', border: 'none', color: '#1877F2', fontSize: '1.5rem', cursor: 'pointer', padding: 0, minWidth: 'auto' }}>
                                        <i className="fab fa-facebook"></i>
                                    </button>
                                    <button onClick={() => shareOnSocial(item.id, 'instagram')} style={{ background: 'none', border: 'none', color: '#E4405F', fontSize: '1.5rem', cursor: 'pointer', padding: 0, minWidth: 'auto' }}>
                                        <i className="fab fa-instagram"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <hr style={{ margin: '40px 0', border: '0.5px solid #ccc' }} />

            <h2 style={{ color: 'var(--primary-green)' }}>Revendicările Mele</h2>
            <div className="grid">
                {myClaims.length === 0 && <p>Nu ai revendicat niciun produs încă.</p>}
                {myClaims.map(claim => (
                    <div key={claim.id} className="card" style={{ backgroundColor: '#f9f9f9' }}>
                        <h3>{claim.Product?.name}</h3>
                        <p>Status cerere: <strong style={{ color: claim.status === 'approved' ? 'green' : 'orange' }}>{claim.status}</strong></p>
                        {claim.status === 'approved' && (
                            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f5e9', borderLeft: '4px solid green' }}>
                                <p style={{ margin: 0 }}>Aprobat! Contact donator: <strong>{claim.Product?.User?.phone || 'Nespecificat'}</strong></p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;