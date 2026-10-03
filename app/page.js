'use client';
import { useState, useEffect } from 'react';

export default function AuthPage() {
    // Mode can be: 'login', 'register', 'forgot', 'reset'
    const [authMode, setAuthMode] = useState('login'); 
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

    // --- PASSWORD RESET STATES ---
    const [resetId, setResetId] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // SMART ROUTER
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
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: loginId, password: loginPassword })
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('token', data.token); localStorage.setItem('role', data.user.role);
                localStorage.setItem('userId', data.user.userId); localStorage.setItem('fullName', data.user.fullName);
                
                if (data.user.role === 'Headmaster' || data.user.role === 'Assistant Headmaster') window.location.href = '/admin';
                else if (data.user.role === 'Teacher') window.location.href = '/teacher';
                else if (data.user.role === 'Student') window.location.href = '/student';
            } else setMessage(`Login Failed: ${data.message}`);
        } catch (err) { setMessage('Network Error.'); }
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
            if (res.ok) { setMessage('Registration successful! You can now log in.'); setAuthMode('login'); setRegId(''); setRegPassword(''); setRegName(''); } 
            else setMessage(`Registration Failed: ${data.message}`);
        } catch (err) { setMessage('Network Error.'); }
        setIsLoading(false);
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true); setMessage('');
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/auth/forgot-password', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: resetId })
            });
            const data = await res.json();
            if (res.ok) { setMessage('OTP sent to your email! (Check spam folder if needed).'); setAuthMode('reset'); } 
            else setMessage(`Error: ${data.message}`);
        } catch (err) { setMessage('Network Error.'); }
        setIsLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true); setMessage('');
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/auth/reset-password', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: resetId, otpCode, newPassword })
            });
            const data = await res.json();
            if (res.ok) { setMessage('Password reset successfully! Please log in.'); setAuthMode('login'); setResetId(''); setOtpCode(''); setNewPassword(''); } 
            else setMessage(`Error: ${data.message}`);
        } catch (err) { setMessage('Network Error.'); }
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

                {/* TABS (Hidden during recovery mode) */}
                {(authMode === 'login' || authMode === 'register') && (
                    <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
                        <button onClick={() => { setAuthMode('login'); setMessage(''); }} style={{ flex: 1, padding: '1rem', border: 'none', background: authMode === 'login' ? 'white' : '#f8fafc', fontWeight: 'bold', color: authMode === 'login' ? '#0ea5e9' : '#64748b', borderBottom: authMode === 'login' ? '3px solid #0ea5e9' : '3px solid transparent', cursor: 'pointer' }}>Login</button>
                        <button onClick={() => { setAuthMode('register'); setMessage(''); }} style={{ flex: 1, padding: '1rem', border: 'none', background: authMode === 'register' ? 'white' : '#f8fafc', fontWeight: 'bold', color: authMode === 'register' ? '#10b981' : '#64748b', borderBottom: authMode === 'register' ? '3px solid #10b981' : '3px solid transparent', cursor: 'pointer' }}>Register ID</button>
                    </div>
                )}

                <div style={{ padding: '2rem' }}>
                    {message && <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: message.includes('Failed') || message.includes('Error') ? '#fee2e2' : '#dcfce7', color: message.includes('Failed') || message.includes('Error') ? '#9f1239' : '#166534', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>{message}</div>}

                    {/* LOGIN FORM */}
                    {authMode === 'login' && (
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
                            <p onClick={() => { setAuthMode('forgot'); setMessage(''); }} style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '14px', color: '#0ea5e9', cursor: 'pointer', fontWeight: 'bold' }}>Forgot Password?</p>
                        </form>
                    )}

                    {/* REGISTER FORM */}
                    {authMode === 'register' && (
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
                                {isLoading ? 'Verifying...' : 'Complete Registration'}
                            </button>
                        </form>
                    )}

                    {/* FORGOT PASSWORD FORM (Step 1) */}
                    {authMode === 'forgot' && (
                        <form onSubmit={handleForgotPassword}>
                            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Password Recovery</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '1.5rem' }}>Enter your User ID. We will send a 6-digit OTP to the email address saved in your Profile Settings.</p>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Your User ID</label>
                                <input type="text" value={resetId} onChange={(e) => setResetId(e.target.value)} required placeholder="e.g. ADMIN-001" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.85rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: isLoading ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}>
                                {isLoading ? 'Sending...' : 'Send OTP to Email'}
                            </button>
                            <p onClick={() => { setAuthMode('login'); setMessage(''); }} style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', cursor: 'pointer', fontWeight: 'bold' }}>Back to Login</p>
                        </form>
                    )}

                    {/* RESET PASSWORD FORM (Step 2) */}
                    {authMode === 'reset' && (
                        <form onSubmit={handleResetPassword}>
                            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Enter OTP</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '1.5rem' }}>Please check your email and enter the 6-digit code below.</p>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>6-Digit OTP</label>
                                <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required placeholder="123456" maxLength="6" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', letterSpacing: '2px', fontSize: '18px', textAlign: 'center' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>New Password</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Enter new strong password" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.85rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                                {isLoading ? 'Verifying...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
