import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from './api';
import { AuthContext } from './context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useContext(AuthContext); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/auth/login', { email, password });
            console.log("Date primite la login:", data);
            
            localStorage.setItem('token', data.token);
            const userData = data.user || data;
            setUser(userData); 
            
            window.customAlert("Te-ai conectat cu succes!");
            
            navigate('/', {replace: true}); 
        } catch (err) {
            window.customAlert("Eroare la logare! Verifică email-ul sau parola.");
        }
    };

    return (
        <div className="container" style={{ maxWidth: '450px', marginTop: '50px' }}>
            <div className="card">
                <h2 style={{ color: 'var(--primary-green)', textAlign: 'center' }}>Conectare</h2>
                
                <form onSubmit={handleSubmit}>
                    <label>Adresă Email:</label>
                    <input 
                        type="email" 
                        placeholder="exemplu@email.com" 
                        required 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                    
                    <label>Parolă:</label>
                    <input 
                        type="password" 
                        placeholder="Parola ta" 
                        required 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                    
                    <button type="submit" style={{ width: '100%', marginTop: '10px' }}>
                        Intră în cont
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                    <p>
                        Niciun cont? <Link to="/register" style={{ color: 'var(--primary-green)', fontWeight: 'bold' }}>Înregistrează-te aici</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;