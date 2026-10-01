'use client';
import { useState } from 'react';

export default function AdminPage() {
    const [role, setRole] = useState('Assistant Headmaster');
    const [newId, setNewId] = useState('');
    const [message, setMessage] = useState('');

    const handleGenerate = async () => {
        if (!newId) return setMessage('Please enter an ID.');
        setMessage('Generating...');
        
        try {
            // 1. GRAB THE DIGITAL BADGE WE SAVED DURING LOGIN
            const token = localStorage.getItem('token');
            
            // 2. SEND IT TO THE BACKEND TO PROVE WE ARE AN ADMIN
            const res = await fetch('https://school-backend-szf6.onrender.com/api/auth/register', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                // We set a default password for new accounts here
                body: JSON.stringify({ userId: newId, password: 'password123', role: role })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(`Success! Created ${role}: ${newId}. Default password: password123`);
                setNewId('');
            } else {
                // Now it will show the REAL error from the backend
                setMessage(`Backend Error: ${data.message || 'Unauthorized or Failed'}`);
            }
        } catch (err) {
            setMessage('Network Error: Connecting to backend...');
        }
    };

    return (
        <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', boxSizing: 'border-box', fontFamily: 'sans-serif' }}>
            
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
                <h2 style={{ color: '#000080', textAlign: 'center', marginBottom: '1.5rem' }}>Admin Control Panel</h2>
                
                {message && (
                    <div style={{ padding: '0.75rem', marginBottom: '1.5rem', backgroundColor: message.includes('Success') ? '#dcfce7' : '#fee2e2', color: message.includes('Success') ? '#166534' : '#b91c1c', borderRadius: '6px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                        {message}
                    </div>
                )}
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Select Rank to Assign:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }}>
                        <option value="Assistant Headmaster">Assistant Headmaster</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Student">Student</option>
                    </select>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>New User ID:</label>
                    <input type="text" value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="e.g. teacher99" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }} />
                </div>

                <button onClick={handleGenerate} style={{ width: '100%', padding: '0.85rem', backgroundColor: '#000080', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                    Generate ID
                </button>
            </div>
        </div>
    );
}
