'use client';
import { useState } from 'react';

export default function RegisterPage() {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [adminSecret, setAdminSecret] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('Registering...');
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/auth/register-headmaster', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password, fullName, adminSecret })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Success! You can now go back and log in.');
            } else {
                setMessage(data.message || 'Error registering');
            }
        } catch (err) {
            setMessage('Network error.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#000080', textAlign: 'center', marginBottom: '1.5rem' }}>Register Headmaster</h2>
                
                {message && <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#e2e8f0', textAlign: 'center', borderRadius: '4px' }}>{message}</div>}
                
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="text" placeholder="Full Name (e.g., Asit Biswas)" value={fullName} onChange={e=>setFullName(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}/>
                    <input type="text" placeholder="Choose a User ID (e.g., admin01)" value={userId} onChange={e=>setUserId(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}/>
                    <input type="password" placeholder="Choose a Password" value={password} onChange={e=>setPassword(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}/>
                    <input type="password" placeholder="Admin Secret Key (e.g., HM2026)" value={adminSecret} onChange={e=>setAdminSecret(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}/>
                    
                    <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#000080', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>Create Account</button>
                </form>
            </div>
        </div>
    );
}
