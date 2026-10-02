'use client';
import { useState } from 'react';

export default function LoginPage() {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Student');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Forgot Password States
    const [isForgotMode, setIsForgotMode] = useState(false);
    const [forgotUserId, setForgotUserId] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');
    const [isProcessingOtp, setIsProcessingOtp] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('Authenticating...');
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/auth/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password, role })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                if (role === 'Headmaster' || role === 'Assistant Headmaster') window.location.href = '/admin';
                else if (role === 'Teacher') window.location.href = '/teacher';
                else window.location.href = '/student';
            } else setMessage(`Error: ${data.message}`);
        } catch (err) { setMessage('Network Error. Is the backend running?'); }
        setIsLoading(false);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!forgotUserId) return setForgotMessage('Please enter your User ID.');
        setIsProcessingOtp(true); setForgotMessage('Sending code to your email...');
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/security/send-otp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: forgotUserId })
            });
            const data = await res.json();
            if (res.ok) {
                setOtpSent(true);
                setForgotMessage('OTP sent! Check your email inbox.');
            } else setForgotMessage(`Error: ${data.message}`);
        } catch (err) { setForgotMessage('Network Error.'); }
        setIsProcessingOtp(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otpCode || !newPassword) return setForgotMessage('Please enter the OTP and a new password.');
        setIsProcessingOtp(true); setForgotMessage('Verifying...');
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/security/reset-with-otp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: forgotUserId, otpCode, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setForgotMessage('Success! Password reset. You can now log in.');
                setTimeout(() => {
                    setIsForgotMode(false); setOtpSent(false); setForgotUserId(''); setOtpCode(''); setNewPassword(''); setForgotMessage('');
                }, 3000);
            } else setForgotMessage(`Error: ${data.message}`);
        } catch (err) { setForgotMessage('Network Error.'); }
        setIsProcessingOtp(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '1rem', fontFamily: 'sans-serif' }}>
            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', boxSizing: 'border-box' }}>
                <h1 style={{ color: '#000080', textAlign: 'center', marginBottom: '0.5rem', fontSize: '24px' }}>Academic Portal</h1>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem', fontSize: '14px' }}>Secure System Access</p>
                
                {/* STANDARD LOGIN FORM */}
                {!isForgotMode ? (
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>Select Role</label>
                            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '15px', backgroundColor: '#f8fafc' }}>
                                <option value="Student">Student</option>
                                <option value="Teacher">Teacher</option>
                                <option value="Assistant Headmaster">Assistant Headmaster</option>
                                <option value="Headmaster">Headmaster</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>User ID</label>
                            <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter your ID" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '15px' }} />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '15px' }} />
                        </div>
                        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.85rem', backgroundColor: isLoading ? '#94a3b8' : '#000080', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: isLoading ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}>
                            {isLoading ? 'Authenticating...' : 'Secure Login'}
                        </button>
                        
                        {message && <div style={{ padding: '0.75rem', backgroundColor: message.includes('Error') ? '#fee2e2' : '#e0f2fe', color: message.includes('Error') ? '#9f1239' : '#0369a1', borderRadius: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>{message}</div>}
                        
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button type="button" onClick={() => setIsForgotMode(true)} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Forgot Password?</button>
                        </div>
                    </form>
                ) : (
                    
                    /* FORGOT PASSWORD FLOW */
                    <div>
                        <h2 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '1rem', textAlign: 'center' }}>Reset Password</h2>
                        {forgotMessage && <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: forgotMessage.includes('Error') ? '#fee2e2' : '#dcfce7', color: forgotMessage.includes('Error') ? '#9f1239' : '#166534', borderRadius: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>{forgotMessage}</div>}
                        
                        {!otpSent ? (
                            <form onSubmit={handleSendOtp}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>Account User ID</label>
                                    <input type="text" value={forgotUserId} onChange={(e) => setForgotUserId(e.target.value)} placeholder="e.g. teacher99" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '15px' }} />
                                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '12px', color: '#64748b' }}>We will email a 6-digit code to the address linked to this ID.</p>
                                </div>
                                <button type="submit" disabled={isProcessingOtp} style={{ width: '100%', padding: '0.85rem', backgroundColor: isProcessingOtp ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: isProcessingOtp ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}>
                                    {isProcessingOtp ? 'Sending...' : 'Send Recovery Email'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>6-Digit OTP Code</label>
                                    <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="000000" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '15px', letterSpacing: '2px', textAlign: 'center' }} />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>New Password</label>
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '15px' }} />
                                </div>
                                <button type="submit" disabled={isProcessingOtp} style={{ width: '100%', padding: '0.85rem', backgroundColor: isProcessingOtp ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: isProcessingOtp ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}>
                                    {isProcessingOtp ? 'Verifying...' : 'Reset & Save Password'}
                                </button>
                            </form>
                        )}
                        
                        <div style={{ textAlign: 'center' }}>
                            <button type="button" onClick={() => { setIsForgotMode(false); setOtpSent(false); setForgotMessage(''); }} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}>← Back to Login</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
