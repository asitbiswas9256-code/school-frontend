'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [lang, setLang] = useState('en-IN');
    const router = useRouter(); 

    const content = {
        'en-IN': {
            title: 'Academic Portal',
            subtitle: 'Enter your credentials to continue',
            idLabel: 'User ID',
            passLabel: 'Password',
            button: 'Sign In',
            toggleBtn: 'বাংলায় দেখুন',
            errorMissing: 'Please fill in all fields.',
        },
        'bn-IN': {
            title: 'একাডেমিক পোর্টাল',
            subtitle: 'অ্যাক্সেস করতে আপনার আইডি এবং পাসওয়ার্ড দিন',
            idLabel: 'ব্যবহারকারী আইডি',
            passLabel: 'পাসওয়ার্ড',
            button: 'প্রবেশ করুন',
            toggleBtn: 'View in English',
            errorMissing: 'অনুগ্রহ করে সমস্ত তথ্য পূরণ করুন।',
        }
    };

    const t = content[lang];

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!userId || !password) {
            setError(t.errorMissing);
            return;
        }

        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Save the digital ID badge
                localStorage.setItem('token', data.token);
                
                // NEW ROUTING LOGIC: Sends each role to their specific dashboard
                if (data.role === 'Headmaster' || data.role === 'Assistant Headmaster') {
                    router.push('/admin');
                } else if (data.role === 'Student') {
                    router.push('/student');
                } else if (data.role === 'Teacher') {
                    router.push('/teacher');
                } else {
                    router.push('/');
                }
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch (err) {
            setError('Network error connecting to backend.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'system-ui, sans-serif' }}>
            <button 
                onClick={() => setLang(lang === 'en-IN' ? 'bn-IN' : 'en-IN')}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#000080', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
                {t.toggleBtn}
            </button>

            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '90%', maxWidth: '400px', borderTop: '5px solid #000080' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#000080', margin: '0 0 0.5rem 0', fontSize: '24px' }}>{t.title}</h1>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>{t.subtitle}</p>
                </div>

                {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155', fontSize: '14px' }}>{t.idLabel}</label>
                        <input 
                            type="text" 
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155', fontSize: '14px' }}>{t.passLabel}</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                        />
                    </div>

                    <button type="submit" style={{ width: '100%', padding: '0.85rem', backgroundColor: '#000080', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                        {t.button}
                    </button>
                </form>
            </div>
        </div>
    );
}
