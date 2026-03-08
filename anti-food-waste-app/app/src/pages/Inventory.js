import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import API from '../api';

const CATEGORIES = ["Lactate", "Fructe", "Legume", "Carne", "Conserve", "Mancare gatita", "Diverse"];

// Helper pentru calcularea expirării în timp real (Pct 6)
const checkIsExpiring = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiryDate = new Date(dateStr);
    const inTwoDays = new Date();
    inTwoDays.setDate(today.getDate() + 2);
    inTwoDays.setHours(23, 59, 59, 999);

    return expiryDate <= inTwoDays && expiryDate >= today;
};

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [sortBy, setSortBy] = useState('expiryDate');
    const [showForm, setShowForm] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', expiryDate: '', category: 'Diverse', quantity: '', notes: '' });
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, itemId: null });
    
    const location = useLocation();

    const loadData = async () => {
        try {
            const resInv = await API.get('/inventory');
            const resGroups = await API.get('/groups');
            setItems(resInv.data);
            const allGroups = resGroups.data.flatMap(g => g.groups);
            setMyGroups(allGroups);
        } catch (err) {
            console.error("Eroare la încărcarea datelor", err);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/inventory', newItem);
            setShowForm(false);
            loadData();
            window.customAlert("Produs adăugat cu succes!");
        } catch (err) { window.customAlert("Eroare la salvarea produsului."); }
    };

    const confirmDelete = async (status) => {
        try {
            // Soft Delete conform cerințelor de statistici
            await API.patch(`/inventory/${deleteModal.itemId}`, { status });
            setDeleteModal({ show: false, itemId: null });
            loadData(); 
            window.customAlert(status === 'consumed' ? "Să îți fie de bine!" : "Produs marcat ca irosit.");
        } catch (err) {
            window.customAlert("Eroare la procesarea cererii.");
        }
    };

    const handleShare = async (productId) => {
        if (selectedGroups.length === 0) return window.customAlert("Selectează cel puțin un grup!");
        try {
            await API.post(`/products/${productId}/share`, { groupIds: selectedGroups });
            window.customAlert("Produs partajat cu succes!");
            loadData(); 
        } catch (err) { window.customAlert("Eroare la partajare."); }
    };

    const shareOnSocial = async (id, platform) => {
        try {
            const { data } = await API.get(`/integrations/share/${platform}/${id}`);
            if (data && data.shareUrl) {
                if (platform === 'instagram' && data.generatedMessage) {
                    await navigator.clipboard.writeText(data.generatedMessage);
                    window.customAlert("Mesajul a fost copiat! Lipsește-l în postarea de Instagram.");
                }
                window.open(data.shareUrl, "_blank");
            }
        } catch (err) { window.customAlert("Eroare la generarea link-ului."); }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.patch(`/inventory/${editItem.id}`, editItem);
            window.customAlert("Produs actualizat!");
            setEditItem(null); 
            loadData(); 
        } catch (err) { window.customAlert("Eroare la actualizare."); }
    };

    const sortedItems = [...items].sort((a, b) => {
        if (sortBy === 'expiryDate') return new Date(a.expiryDate) - new Date(b.expiryDate);
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="container">
            <h2 style={{ color: 'var(--primary-green)', textAlign: 'center' }}>Inventarul meu</h2>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Închide Formularul" : "+ Adaugă Aliment Nou"}
                </button>
            </div>

            {showForm && (
                <div className="card">
                    <h3>Detalii Produs Nou</h3>
                    <form onSubmit={handleSubmit}>
                        <label>Nume produs:</label>
                        <input placeholder="ex: Iaurt" required onChange={e => setNewItem({...newItem, name: e.target.value})} />
                        <label>Data expirării:</label>
                        <input type="date" required onChange={e => setNewItem({...newItem, expiryDate: e.target.value})} />
                        <label>Categorie:</label>
                        <select onChange={e => setNewItem({...newItem, category: e.target.value})}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <label>Cantitate:</label>
                        <input placeholder="ex: 200g, 1 buc" required onChange={e => setNewItem({...newItem, quantity: e.target.value})} />
                        <button type="submit" style={{ width: '100%' }}>Salvează</button>
                    </form>
                </div>
            )}

            <div className="card" style={{ marginBottom: '30px' }}>
                <label>Sortează după: </label>
                <select style={{ width: 'auto', marginLeft: '10px' }} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="expiryDate">Data Expirării</option>
                    <option value="name">Nume (A-Z)</option>
                </select>
            </div>

            {CATEGORIES.map(cat => {
                const catItems = sortedItems.filter(i => i.category === cat);
                if (catItems.length === 0) return null;
                return (
                    <div key={cat} className="category-section">
                        <h3>{cat}</h3>
                        <div className="grid">
                            {catItems.map(item => {
                                // Pct 6: Calculăm vizualizarea critică în timp real
                                const isCritical = checkIsExpiring(item.expiryDate) && item.status === 'available';

                                return (
                                    <div key={item.id} className="card" style={{ 
                                        position: 'relative',
                                        border: isCritical ? '2px solid var(--danger)' : '1px solid #e0e0e0',
                                        backgroundColor: isCritical ? '#fff5f5' : 'white'
                                    }}>
                                        <button 
                                            onClick={() => setEditItem(item)} 
                                            style={{ 
                                                position: 'absolute', top: '10px', right: '10px', 
                                                background: 'none', color: 'var(--primary-green)',
                                                fontSize: '1.2rem', minWidth: 'auto', border: 'none', cursor: 'pointer',
                                                border: '1px solid var(--primary-green)'
                                            }}
                                            title="Editează produs"
                                        >Edit</button>

                                        <h4>{item.name} {isCritical && <span style={{color: 'red', fontSize: '0.8rem'}}> (!Expiră curând)</span>}</h4>
                                        <p><strong>Cantitate:</strong> {item.quantity}</p>
                                        <p><strong>Expiră:</strong> {new Date(item.expiryDate).toLocaleDateString()}</p>
                                        <p><strong>Status:</strong> <span style={{color: item.status === 'available' ? 'green' : 'gray'}}>{item.status}</span></p>
                                        
                                        {item.status === 'available' && (
                                            <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                                <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Partajează cu grupul:</p>
                                                <div style={{ maxHeight: '100px', overflowY: 'auto', marginBottom: '10px' }}>
                                                    {myGroups.map(g => (
                                                        <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                                            <input type="checkbox" style={{ width: 'auto' }}
                                                                onChange={(e) => {
                                                                    const id = g.id.toString();
                                                                    if (e.target.checked) setSelectedGroups([...selectedGroups, id]);
                                                                    else setSelectedGroups(selectedGroups.filter(x => x !== id));
                                                                }}
                                                            /> {g.name}
                                                        </label>
                                                    ))}
                                                </div>
                                                <button onClick={() => handleShare(item.id)} style={{ fontSize: '0.8rem', width: '100%', marginBottom: '10px' }}>Trimite la Prieteni</button>
                                                
                                                {/* Pct 7: Share Social cu pictograme */}
                                                {item.ProductVisibilities?.length > 0 && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                                                        <span style={{ fontSize: '0.9rem' }}>Share:</span>
                                                        <button onClick={() => shareOnSocial(item.id, 'facebook')} style={{ background: 'none', border: '1px solid var(--primary-green)', color: '#1877F2', fontSize: '1.5rem', cursor: 'pointer', minWidth: 'auto' }}>
                                                            <i className="fab fa-facebook"></i>
                                                        </button>
                                                        <button onClick={() => shareOnSocial(item.id, 'instagram')} style={{ background: 'none', border: '1px solid var(--primary-green)', color: '#E4405F', fontSize: '1.5rem', cursor: 'pointer', minWidth: 'auto' }}>
                                                            <i className="fab fa-instagram"></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <button className="secondary" onClick={() => setDeleteModal({ show: true, itemId: item.id })} style={{ width: '100%', marginTop: '5px' }}>Șterge / Consumat</button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Modal Editare (Pct 12) */}
            {editItem && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal" style={{ maxWidth: '500px' }}>
                        <h3>Editează Produs</h3>
                        <form onSubmit={handleUpdateSubmit}>
                            <label>Nume:</label>
                            <input value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} required />
                            <label>Data:</label>
                            <input type="date" value={editItem.expiryDate} onChange={e => setEditItem({...editItem, expiryDate: e.target.value})} required />
                            <label>Cantitate:</label>
                            <input value={editItem.quantity} onChange={e => setEditItem({...editItem, quantity: e.target.value})} required />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button type="submit" style={{ flex: 1 }}>Salvează</button>
                                <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => setEditItem(null)}>Anulează</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Ștergere (Pct 4) */}
            {deleteModal.show && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <h3>Ce s-a întâmplat cu produsul?</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                            <button onClick={() => confirmDelete('consumed')}>✅ L-am CONSUMAT</button>
                            <button className="secondary" onClick={() => confirmDelete('trashed')}>🗑️ L-am ARUNCAT</button>
                            <button style={{ background: 'none', color: 'gray' }} onClick={() => setDeleteModal({ show: false })}>Anulează</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;