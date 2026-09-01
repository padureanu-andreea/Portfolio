import './App.css';
import React, { useEffect, useContext, useState } from 'react'; // Adăugat useState aici
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import API from './api';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './Login';      
import Register from './pages/Register'; 
import Inventory from './pages/Inventory';
import Groups from './pages/Groups';
import Claims from './pages/Claims';
import Profile from './pages/Profile';
import Landing from './pages/Landing';

// --- SISTEMUL DE ALERTE ACTUALIZAT ---
const AlertSystem = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const check = async () => {
            if (!user || sessionStorage.getItem('alertShown')) return;

            try {
                const { data } = await API.get('/inventory');
                const today = new Date();
                const inTwoDays = new Date();
                inTwoDays.setDate(today.getDate() + 2);

                const expiring = data.filter(i => 
                    new Date(i.expiryDate) <= inTwoDays && i.status === 'available'
                );

                if (expiring.length > 0) {
                    sessionStorage.setItem('alertShown', 'true');
                    
                    // FOLOSIM NOUL MODAL ÎN LOC DE ALERT
                    window.customAlert(`Atenție! Ai ${expiring.length} produse care expiră în mai puțin de 2 zile. Te redirecționăm către Inventar pentru a le verifica.`);
                    
                    navigate('/inventory', { state: { highlightIds: expiring.map(i => i.id) } });
                }
            } catch (err) { console.error(err); }
        };
        check();
    }, [user, navigate]);

    return null;
};

// --- APP CONTENT CU MODAL INTEGRAT ---
function AppContent() {
    const { user } = useContext(AuthContext);
    const [modalMessage, setModalMessage] = useState(null);

    // Expunem funcția global pentru a fi folosită în orice pagină (Register, Login, Inventory, etc.)
    window.customAlert = (msg) => setModalMessage(msg);
    

    return (
        <>
            <Navbar />
            <AlertSystem />
            
            {/* Pop-up personalizat pentru o experiență profesională pe Azure */}
            {modalMessage && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <h3 style={{ color: 'var(--primary-green)' }}>Notificare</h3>
                        <p>{modalMessage}</p>
                        <button onClick={() => setModalMessage(null)} style={{ width: '100%' }}>
                            Am înțeles
                        </button>
                    </div>
                </div>
            )}

            <div className="container">
                <Routes>
                    <Route path="/" element={user ? <Dashboard /> : <Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/inventory" element={user ? <Inventory /> : <Navigate to="/login" />} />
                    <Route path="/groups" element={user ? <Groups /> : <Navigate to="/login" />} />
                    <Route path="/claims" element={user ? <Claims /> : <Navigate to="/login" />} />
                    <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;