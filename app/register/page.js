'use client';
import { useState } from 'react';

export default function RegisterPage() {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('Verifying ID and registering...');
        
        try {
            // Pointing to the universal '/register' door for pre-approved IDs
            const res = await fetch('https://school-backend-szf6.onrender.com/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password, fullName })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setMessage('Success! Your account is active. Redirecting to login...');
                setTimeout(() => window.location.href = '/', 2000);
            } else {
                setMessage(`Error: ${data.message || 'Could not register'}`);
            }
        } catch (err) {
            setMessage('Network error connecting to the server.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
                <h2 style={{ color: '#000080', textAlign: 'center', marginTop: '0', marginBottom: '0.5rem' }}>Claim Your Account</h2>
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '1.5rem' }}>Enter the ID provided by your Headmaster to activate your account.</p>
                
                {message && (
                    <div style={{ marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: message.includes('Success') ? '#dcfce7' : '#fee2e2', color: message.includes('Success') ? '#166534' : '#b91c1c', textAlign: 'center', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
                        {message}
                    </div>
                )}
                
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Full Name</label>
                        <input type="text" placeholder="e.g., Rahul Roy" value={fullName} onChange={e=>setFullName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }}/>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>School ID</label>
                        <input type="text" placeholder="e.g., stu01" value={userId} onChange={e=>setUserId(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }}/>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Create a Password</label>
                        <input type="password" placeholder="Choose a secure password" value={password} onChange={e=>setPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }}/>
                    </div>
                    
                    <button type="submit" style={{ padding: '0.85rem', backgroundColor: '#000080', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '0.5rem' }}>Activate Account</button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <a href="/" style={{ color: '#000080', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>&larr; Back to Login</a>
                </div>
            </div>
        </div>
    );
}
