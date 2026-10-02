'use client';
import { useState } from 'react';

export default function LoginPage() {
    // Mode Toggles
    const [viewMode, setViewMode] = useState('login'); // 'login', 'forgot', 'activate'
    
    // Login States
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Student');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Forgot Password States
    const [forgotUserId, setForgotUserId] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Activation States
    const [actUserId, setActUserId] = useState('');
    const [actRole, setActRole] = useState('Student');
    const [actName, setActName] = useState('');
    const [actEmail, setActEmail] = useState('');
    const [actPass, setActPass] = useState('');
    const [actDob, setActDob] = useState('');
    const [actBlood, setActBlood] = useState('');
    const [actClass, setActClass] = useState('');
    const [actRoll, setActRoll] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true); setMessage('Authenticating...');
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
        } catch (err) { setMessage('Network Error.'); }
        setIsLoading(false);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!forgotUserId) return setMessage('Please enter your User ID.');
        setIsLoading(true); setMessage('Sending code to your email...');
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/security/send-otp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: forgotUserId })
            });
            const data = await res.json();
            if (res.ok) { setOtpSent(true); setMessage('OTP sent! Check your email inbox.'); } 
            else setMessage(`Error: ${data.message}`);
        } catch (err) { setMessage('Network Error.'); }
        setIsLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otpCode || !newPassword) return setMessage('Please enter the OTP and a new password.');
        setIsLoading(true); setMessage('Verifying...');
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/security/reset-with-otp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: forgotUserId, otpCode, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Success! Password reset. You can now log in.');
                setTimeout(() => { setViewMode('login'); setOtpSent(false); setMessage(''); }, 3000);
            } else setMessage(`Error: ${data.message}`);
        } catch (err) { setMessage('Network Error.'); }
        setIsLoading(false);
    };

    const handleActivate = async (e) => {
        e.preventDefault();
        if (!actUserId || !actName || !actPass) return setMessage('ID, Name, and Password are required.');
        setIsLoading(true); setMessage('Activating account...');
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/auth/activate', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: actUserId, role: actRole, fullName: actName, email: actEmail, password: actPass, 
                    dob: actDob, bloodGroup: actBlood, currentClass: actClass, rollNo: actRoll 
                })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Success! Account activated. Please log in.');
                setTimeout(() => { setViewMode('login'); setMessage(''); }, 3000);
            } else setMessage(`Error: ${data.message}`);
        } catch (err) { setMessage('Network Error.'); }
        setIsLoading(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '1rem', fontFamily: 'sans-serif' }}>
            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: viewMode === 'activate' ? '500px' : '400px', boxSizing: 'border-box', transition: 'max-width 0.3s ease' }}>
                <h1 style={{ color: '#000080', textAlign: 'center', marginBottom: '0.5rem', fontSize: '24px' }}>Academic Portal</h1>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem', fontSize: '14px' }}>
                    {viewMode === 'login' ? 'Secure System Access' : viewMode === 'activate' ? 'Activate Your New Account' : 'Password Recovery'}
                </p>

                {message && <div style={{ padding: '0.75rem', marginBottom: '1.5rem', backgroundColor: message.includes('Error') ? '#fee2e2' : '#dcfce7', color: message.includes('Error') ? '#9f1239' : '#166534', borderRadius: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>{message}</div>}

                {/* LOGIN MODE */}
                {viewMode === 'login' && (
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Role</label>
                            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '15px' }}>
                                <option value="Student">Student</option>
                                <option value="Teacher">Teacher</option>
                                <option value="Assistant Headmaster">Assistant Headmaster</option>
                                <option value="Headmaster">Headmaster</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>User ID</label>
                            <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter your ID" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                        </div>
                        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.85rem', backgroundColor: '#000080', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginBottom: '1rem' }}>Log In</button>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                            <button type="button" onClick={() => { setViewMode('activate'); setMessage(''); }} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>New? Activate Account</button>
                            <button type="button" onClick={() => { setViewMode('forgot'); setMessage(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '14px', cursor: 'pointer' }}>Forgot Password?</button>
                        </div>
                    </form>
                )}

                {/* FORGOT PASSWORD MODE */}
                {viewMode === 'forgot' && (
                    <div>
                        {!otpSent ? (
                            <form onSubmit={handleSendOtp}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Account User ID</label>
                                    <input type="text" value={forgotUserId} onChange={(e) => setForgotUserId(e.target.value)} placeholder="e.g. teacher99" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '12px', color: '#64748b' }}>We will email a 6-digit code to the address linked to this ID.</p>
                                </div>
                                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.85rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginBottom: '1rem' }}>Send Recovery Email</button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>6-Digit OTP Code</label>
                                    <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="000000" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', letterSpacing: '2px', textAlign: 'center' }} />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>New Password</label>
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.85rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginBottom: '1rem' }}>Reset & Save Password</button>
                            </form>
                        )}
                        <div style={{ textAlign: 'center' }}>
                            <button type="button" onClick={() => { setViewMode('login'); setOtpSent(false); setMessage(''); }} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}>← Back to Login</button>
                        </div>
                    </div>
                )}

                {/* ACTIVATE ACCOUNT MODE */}
                {viewMode === 'activate' && (
                    <form onSubmit={handleActivate}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px' }}>Authorized ID</label>
                                <input type="text" value={actUserId} onChange={(e) => setActUserId(e.target.value)} placeholder="e.g. stu123" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px' }}>Role</label>
                                <select value={actRole} onChange={(e) => setActRole(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                                    <option value="Student">Student</option>
                                    <option value="Teacher">Teacher</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px' }}>Full Name</label>
                            <input type="text" value={actName} onChange={(e) => setActName(e.target.value)} placeholder="John Doe" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px' }}>Email (For Passwords)</label>
                                <input type="email" value={actEmail} onChange={(e) => setActEmail(e.target.value)} placeholder="email@gmail.com" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px' }}>Create Password</label>
                                <input type="password" value={actPass} onChange={(e) => setActPass(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px' }}>Date of Birth</label>
                                <input type="date" value={actDob} onChange={(e) => setActDob(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px' }}>Blood Group</label>
                                <select value={actBlood} onChange={(e) => setActBlood(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                                    <option value="">Select...</option>
                                    <option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                                    <option value="A-">A-</option><option value="O-">O-</option><option value="B-">B-</option><option value="AB-">AB-</option>
                                </select>
                            </div>
                        </div>

                        {actRole === 'Student' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px', color: '#0369a1' }}>Current Class</label>
                                    <input type="text" value={actClass} onChange={(e) => setActClass(e.target.value)} placeholder="e.g. 10th Grade" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px', color: '#0369a1' }}>Roll Number</label>
                                    <input type="text" value={actRoll} onChange={(e) => setActRoll(e.target.value)} placeholder="e.g. 42" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.85rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginBottom: '1rem' }}>Complete Registration</button>
                        <div style={{ textAlign: 'center' }}>
                            <button type="button" onClick={() => { setViewMode('login'); setMessage(''); }} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}>Cancel & Go Back</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
