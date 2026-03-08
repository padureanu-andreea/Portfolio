import React, { useState, useEffect } from 'react';
import API from '../api';

const Claims = () => {
    const [claims, setClaims] = useState([]);

    const fetchClaims = async () => {
        try {
            const { data } = await API.get('/claims?as=owner');
            setClaims(data);
        } catch (err) {
            console.error("Eroare la încărcarea cererilor", err);
        }
    };

    useEffect(() => { fetchClaims(); }, []);

    const updateStatus = async (claimId, status) => {
        try {
            // Trimitem cererea de update către backend
            await API.patch(`/claims/${claimId}`, { status });
            
            const successMsg = status === 'approved' 
                ? "Revendicare aprobată! Produsul a fost marcat ca fiind revendicat." 
                : "Cerere respinsă.";
                
            window.customAlert(successMsg);
            fetchClaims(); // Refresh listă
        } catch (err) {
            // Afișăm mesajul de eroare din backend (dacă există)
            const errorMsg = err.response?.data?.message || "Eroare la actualizarea statusului.";
            window.customAlert(errorMsg);
        }
    };

    return (
        <div className="container">
            <h2 style={{ color: 'var(--primary-green)' }}>Cererile primite (Donator)</h2>
            <div className="grid">
                {claims.length === 0 && <p>Nu ai cereri noi pentru produsele tale.</p>}
                {claims.map(c => (
                    <div key={c.id} className="card">
                        <p><strong>Produs:</strong> {c.Product?.name}</p>
                        <p><strong>Solicitant:</strong> {c.User?.username}</p>
                        <p><strong>Telefon contact:</strong> {c.User?.phone || 'Nespecificat'}</p>
                        <p><strong>Status actual:</strong> <span className="tag">{c.status}</span></p>
                        
                        {c.status === 'pending' && (
                            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                <button onClick={() => updateStatus(c.id, 'approved')} style={{ flex: 1 }}>Acceptă</button>
                                <button onClick={() => updateStatus(c.id, 'rejected')} className="secondary" style={{ flex: 1 }}>Respinge</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Claims;