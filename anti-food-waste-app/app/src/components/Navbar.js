import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('alertShown'); 
    setUser(null);
    navigate('/'); 
};

    // Punctul 3: Nu afișăm navbar-ul dacă nu este logat
    if (!user) return null;

    return (
        <nav style={{ padding: '10px 0' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ color: 'white', fontSize: '1.5rem', textDecoration: 'none' }}>AntiWaste</Link>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                    <Link to="/inventory" style={{ color: 'white', textDecoration: 'none' }}>Inventar</Link>
                    <Link to="/groups" style={{ color: 'white', textDecoration: 'none' }}>Grupuri</Link>
                    <Link to="/claims" style={{ color: 'white', textDecoration: 'none' }}>Cereri</Link>
                    <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>Profil</Link>
                    <button onClick={handleLogout} className="secondary" style={{ margin: 0, padding: '5px 15px' }}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;