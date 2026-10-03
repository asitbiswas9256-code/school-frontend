'use client';
import { useState, useEffect } from 'react';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    // --- LOGIN STATES ---
    const [loginId, setLoginId] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // --- REGISTRATION STATES ---
    const [regId, setRegId] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regName, setRegName] = useState('');
    const [regClass, setRegClass] = useState('');
    const [regRoll, setRegRoll] = useState('');

    // SMART ROUTER: If they are already logged in, skip this page!
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token && role) {
            if (role === 'Headmaster' || role === 'Assistant Headmaster') window.location.href = '/admin';
            else if (role === 'Teacher') window.location.href = '/teacher';
            else if (role === 'Student') window.location.href = '/student';
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true); setMessage('');
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/auth/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: loginId, password: loginPassword })
            });
            const data = await res.json();
            
            if (res.ok) {
                // 1. Save their secure digital token and profile data
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.user.role);
                localStorage.setItem('userId', data.user.userId);
                localStorage.setItem('fullName', data.user.fullName);
                
                // 2. Teleport them to the correct dashboard!
                if (data.user.role === 'Headmaster' || data.user.role === 'Assistant Headmaster') window.location.href = '/admin';
                else if (data.user.role === 'Teacher') window.location.href = '/teacher';
                else if (data.user.role === 'Student') window.location.href = '/student';
            } else {
                setMessage(`Login Failed: ${data.message}`);
            }
        } catch (err) { setMessage('Network Error. Is the backend running?'); }
        setIsLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true); setMessage('');
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/auth/register', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: regId, password: regPassword, fullName: regName, currentClass: regClass, rollNo: regRoll })
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage('Registration successful! You can now log in.');
                setIsLogin(true); // Automatically switch them to the login tab
                setRegId(''); setRegPassword(''); setRegName('');
            } else {
                setMessage(`Registration Failed: ${data.message}`);
            }
        } catch (err) { setMessage('Network Error. Is the backend running?'); }
        setIsLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif', padding: '1rem' }}>
            <div style={{ width: '100%', maxWidth: '450px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                
                {/* HEADER */}
                <div style={{ backgroundColor: '#0f172a', padding: '2rem', textAlign: 'center', color: 'white' }}>
                    <h1 style={{ margin: 0, fontSize: '24px', color: '#38bdf8' }}>School Portal</h1>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px', color: '#94a3b8' }}>Secure Enterprise Login</p>
                </div>

                {/* TABS */}
                <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
                    <button onClick={() => { setIsLogin(true); setMessage(''); }} style={{ flex: 1, padding: '1rem', border: 'none', background: isLogin ? 'white' : '#f8fafc', fontWeight: 'bold', color: isLogin ? '#0ea5e9' : '#64748b', borderBottom: isLogin ? '3px solid #0ea5e9' : '3px solid transparent', cursor: 'pointer' }}>Login</button>
                    <button onClick={() => { setIsLogin(false); setMessage(''); }} style={{ flex: 1, padding: '1rem', border: 'none', background: !isLogin ? 'white' : '#f8fafc', fontWeight: 'bold', color: !isLogin ? '#10b981' : '#64748b', borderBottom: !isLogin ? '3px solid #10b981' : '3px solid transparent', cursor: 'pointer' }}>Register ID</button>
                </div>

                <div style={{ padding: '2rem' }}>
                    {message && <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: message.includes('Failed') || message.includes('Error') ? '#fee2e2' : '#dcfce7', color: message.includes('Failed') || message.includes('Error') ? '#9f1239' : '#166534', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>{message}</div>}

                    {/* LOGIN FORM */}
                    {isLogin ? (
                        <form onSubmit={handleLogin}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>User ID</label>
                                <input type="text" value={loginId} onChange={(e) => setLoginId(e.target.value)} required placeholder="Enter your registered ID" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Password</label>
                                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.85rem', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                                {isLoading ? 'Authenticating...' : 'Secure Login'}
                            </button>
                            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '14px', color: '#64748b', cursor: 'pointer' }}>Forgot Password?</p>
                        </form>
                    ) : (
                        // REGISTER FORM
                        <form onSubmit={handleRegister}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Authorized ID</label>
                                <input type="text" value={regId} onChange={(e) => setRegId(e.target.value)} required placeholder="Provided by Administration" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Full Name</label>
                                <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required placeholder="e.g. John Doe" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Create Password</label>
                                <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required placeholder="Create a strong password" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            
                            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '1rem' }}>*If you are a student, please provide your Class and Roll Number below. Staff may leave this blank.</p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <input type="text" value={regClass} onChange={(e) => setRegClass(e.target.value)} placeholder="Class (e.g. X)" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                <input type="text" value={regRoll} onChange={(e) => setRegRoll(e.target.value)} placeholder="Roll No" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>

                            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.85rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                                {isLoading ? 'Verifying ID...' : 'Complete Registration'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
