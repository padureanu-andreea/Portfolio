import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', phone: '', bio: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/auth/register', formData);
            window.customAlert("Cont creat cu succes!");
            navigate('/login');
        } catch (err) {
            window.customAlert(err.response?.data?.message || "Eroare la înregistrare");
        }
    };

    return (
        <div className="container" style={{ maxWidth: '500px', marginTop: '30px' }}>
            <div className="card">
                <h2 style={{ color: 'var(--primary-green)', textAlign: 'center' }}>Creează un cont eco</h2>
                <form onSubmit={handleSubmit}>
                    <input placeholder="Username unic" onChange={e => setFormData({...formData, username: e.target.value})} required />
                    <input type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <input type="password" placeholder="Parolă" onChange={e => setFormData({...formData, password: e.target.value})} required />
                    <input placeholder="Telefon (07xxxxxxxx)" onChange={e => setFormData({...formData, phone: e.target.value})} />
                    <textarea placeholder="Bio scurt (ex: Îmi place să gătesc sustenabil)" onChange={e => setFormData({...formData, bio: e.target.value})} />
                    <button type="submit" style={{ width: '100%', marginTop: '10px' }}>Înregistrare</button>
                </form>
            </div>
        </div>
    );
};

export default Register;