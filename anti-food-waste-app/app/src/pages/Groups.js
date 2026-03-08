import React, { useState, useEffect } from 'react';
import API from '../api';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [newGroupName, setNewGroupName] = useState('');
    const [taggingData, setTaggingData] = useState(null); // Reține {groupId, memberId} pentru modal
    const [tempTagName, setTempTagName] = useState("");   // Reține textul din modalul de etichetare

    const fetchGroups = async () => {
        try {
            // Preluăm grupurile împreună cu membrii și etichetele lor (formatate de backend)
            const { data } = await API.get('/groups');
            setGroups(data);
        } catch (err) {
            console.error("Eroare la încărcarea grupurilor", err);
        }
    };

    useEffect(() => { fetchGroups(); }, []);

    const createGroup = async (e) => {
        e.preventDefault();
        try {
            await API.post('/groups', { name: newGroupName });
            setNewGroupName('');
            window.customAlert("Grup creat cu succes!");
            fetchGroups();
        } catch (err) {
            window.customAlert("Eroare la crearea grupului.");
        }
    };

    const addMember = async (groupId) => {
        try {
            // 1. Căutăm user-ul pentru a-i afla ID-ul (Backend-ul caută după username)
            const userRes = await API.get(`/auth/users/${searchUser}`);
            const userId = userRes.data.id;

            // 2. Îl adăugăm în grup folosind ID-ul găsit
            await API.post(`/groups/${groupId}/members`, { userId: userId });
            window.customAlert("Membru adăugat!");
            setSearchUser('');
            fetchGroups();
        } catch (err) { 
            window.customAlert("Utilizatorul nu a fost găsit sau este deja în grup."); 
        }
    };

    // Deschide modalul nostru personalizat (fără localhost says)
    const openTagModal = (groupId, memberId) => {
        setTaggingData({ groupId, memberId });
        setTempTagName(""); 
    };

    const handleSaveTag = async (e) => {
        e.preventDefault();
        if (!tempTagName) return;

        try {
            // Pas 1: Creăm sau obținem Tag-ul în DB
            const tagRes = await API.post('/tags', { name: tempTagName });
            const tagId = tagRes.data.id || tagRes.data.tag?.id;

            // Pas 2: Asociem Tag-ul membrului în acest grup
            await API.post(`/groups/${taggingData.groupId}/members/${taggingData.memberId}/tags`, { tagId });
            
            window.customAlert("Etichetă adăugată cu succes!");
            setTaggingData(null); 
            fetchGroups(); 
        } catch (err) {
            window.customAlert("Eroare la adăugarea etichetei.");
        }
    };

    return (
        <div className="container">
            <h2 style={{ color: 'var(--primary-green)' }}>Management Grupuri</h2>
            
            <div className="card">
                <h3>Creează un grup nou</h3>
                <form onSubmit={createGroup} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        placeholder="Numele grupului (ex: Familie, Vecini)" 
                        value={newGroupName} 
                        onChange={e => setNewGroupName(e.target.value)} 
                        required 
                    />
                    <button type="submit">Creează</button>
                </form>
            </div>

            {groups.map(section => (
                <div key={section.status} style={{ marginTop: '30px' }}>
                    <h3 style={{ textTransform: 'capitalize' }}>
                        Grupuri în care ești {section.status === 'owner' ? 'Proprietar' : 'Membru'}
                    </h3>
                    <div className="grid">
                        {section.groups.map(g => (
                            <div key={g.id} className="group-card">
                                <h4>{g.name}</h4>
                                <div style={{ margin: '10px 0' }}>
                                    <strong>Membri:</strong>
                                    
                                    {/* Afișarea membrilor și a etichetelor lor alimentare (Pct 5) */}
                                    {g.members && g.members.length > 0 ? (
                                        g.members.map(m => (
                                            <div key={m.id} className="member-item" style={{ fontSize: '0.9rem', marginTop: '8px', padding: '5px', borderBottom: '1px solid #f0f0f0' }}>
                                                • {m.username} 
                                                {m.tags?.map(t => (
                                                    <span key={t.tagId} className="tag">{t.tagName}</span>
                                                ))}
                                                {section.status === 'owner' && (
                                                    <button 
                                                        onClick={() => openTagModal(g.id, m.id)} 
                                                        style={{ padding: '2px 6px', fontSize: '0.7rem', marginLeft: '10px' }}
                                                    >
                                                        + Etichetă
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ fontSize: '0.8rem', color: '#999' }}>Niciun membru momentan.</p>
                                    )}
                                </div>

                                {section.status === 'owner' && (
                                    <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px' }}>
                                        <input 
                                            placeholder="Caută username" 
                                            value={searchUser}
                                            onChange={e => setSearchUser(e.target.value)} 
                                            style={{ padding: '8px' }} 
                                        />
                                        <button onClick={() => addMember(g.id)} style={{ width: '100%', marginTop: '5px' }}>
                                            Adaugă Membru
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Modal Personalizat pentru Etichetare (fără localhost says) */}
            {taggingData && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <h3 style={{ color: 'var(--primary-green)' }}>Adaugă Etichetă</h3>
                        <p>Introdu preferința alimentară (ex: Vegan, Carnivor):</p>
                        
                        <form onSubmit={handleSaveTag}>
                            <input 
                                autoFocus
                                value={tempTagName} 
                                onChange={e => setTempTagName(e.target.value)} 
                                placeholder="Nume etichetă..."
                                required 
                            />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button type="submit" style={{ flex: 1 }}>Salvează</button>
                                <button 
                                    type="button" 
                                    className="secondary" 
                                    style={{ flex: 1 }} 
                                    onClick={() => setTaggingData(null)}
                                >
                                    Anulează
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groups;