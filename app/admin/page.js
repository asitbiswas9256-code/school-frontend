'use client';
import { useState } from 'react';

export default function AdminDashboard() {
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('Assistant Headmaster');
    const [message, setMessage] = useState('');

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMessage('Creating account...');

        // This grabs the digital ID badge saved when the Headmaster logs in!
        const token = localStorage.getItem('token');

        try {
            // Decides which security door to knock on based on the role
            const endpoint = role === 'Assistant Headmaster' 
                ? '/api/admin/add-assistant' 
                : '/api/admin/add-user';

            const res = await fetch(`https://school-backend-szf6.onrender.com${endpoint}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token // Showing the badge to the backend guard
                },
                body: JSON.stringify({ userId, role })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(`Success! ${role} account created for ${userId}. They can now register their password.`);
                setUserId(''); // Clears the input box
            } else {
                setMessage(data.message || 'Error creating account. Access Denied.');
            }
        } catch (err) {
            setMessage('Network error connecting to backend.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', borderTop: '5px solid #000080' }}>
                <h1 style={{ color: '#000080', textAlign: 'center', margin: '0 0 0.5rem 0' }}>Admin Control Panel</h1>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem', fontSize: '14px' }}>Generate Official School Accounts</p>

                {message && <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#e2e8f0', color: '#1e293b', textAlign: 'center', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' }}>{message}</div>}

                <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ fontWeight: '600', color: '#334155', display: 'block', marginBottom: '0.5rem', fontSize: '14px' }}>Select Rank to Assign:</label>
                        <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: 'white' }}>
                            <option value="Assistant Headmaster">Assistant Headmaster</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Student">Student</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontWeight: '600', color: '#334155', display: 'block', marginBottom: '0.5rem', fontSize: '14px' }}>New User ID:</label>
                        <input 
                            type="text" 
                            placeholder="e.g., teacher_math_01" 
                            value={userId} 
                            onChange={e => setUserId(e.target.value)} 
                            required 
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                        />
                    </div>

                    <button type="submit" style={{ width: '100%', padding: '0.85rem', backgroundColor: '#000080', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '0.5rem' }}>
                        Generate ID
                    </button>
                </form>
            </div>
        </div>
    );
  }
                              
