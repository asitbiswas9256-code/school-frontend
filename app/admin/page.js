'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
    // Tab State
    const [activeTab, setActiveTab] = useState('generate'); // 'generate' or 'reports'
    
    // ID Generation State
    const [role, setRole] = useState('Assistant Headmaster');
    const [newId, setNewId] = useState('');
    const [message, setMessage] = useState('');

    // Reports State
    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(false);

    // --- FUNCTION: Generate IDs (Your existing working code) ---
    const handleGenerate = async () => {
        if (!newId) return setMessage('Please enter an ID.');
        setMessage('Generating...');
        
        try {
            const token = localStorage.getItem('token'); 
            
            const endpoint = role === 'Assistant Headmaster' 
                ? 'https://school-backend-szf6.onrender.com/api/admin/add-assistant'
                : 'https://school-backend-szf6.onrender.com/api/admin/add-user';
            
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ userId: newId, password: 'password123', role: role })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(`Success! Created ${role}: ${newId}.`);
                setNewId('');
            } else {
                setMessage(`Backend Error: ${data.message || 'Failed'}`);
            }
        } catch (err) {
            setMessage('Network Error: Connecting to backend...');
        }
    };

    // --- FUNCTION: Fetch Confidential Reports ---
    const fetchReports = async () => {
        setLoadingReports(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://school-backend-szf6.onrender.com/api/reports/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                setReports(data);
            } else {
                setMessage(`Error loading reports: ${data.message}`);
            }
        } catch (err) {
            setMessage('Network error connecting to Under Zone.');
        }
        setLoadingReports(false);
    };

    // Automatically fetch reports when the Headmaster clicks the Reports tab
    useEffect(() => {
        if (activeTab === 'reports') {
            fetchReports();
        }
    }, [activeTab]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', boxSizing: 'border-box', fontFamily: 'sans-serif' }}>
            
            {/* Main Admin Container - Expanded slightly to fit reports nicely */}
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
                
                {/* Header & Logout */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ color: '#000080', margin: '0' }}>Admin Command Center</h2>
                    <button onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                        Log Out
                    </button>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
                    <button 
                        onClick={() => { setActiveTab('generate'); setMessage(''); }}
                        style={{ flex: 1, padding: '0.75rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'generate' ? '#000080' : '#f1f5f9', color: activeTab === 'generate' ? 'white' : '#475569' }}
                    >
                        Generate IDs
                    </button>
                    <button 
                        onClick={() => setActiveTab('reports')}
                        style={{ flex: 1, padding: '0.75rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'reports' ? '#b91c1c' : '#f1f5f9', color: activeTab === 'reports' ? 'white' : '#475569' }}
                    >
                        Under Zone Inbox
                    </button>
                </div>

                {/* Global Message Display */}
                {message && (
                    <div style={{ padding: '0.75rem', marginBottom: '1.5rem', backgroundColor: message.includes('Success') ? '#dcfce7' : '#fee2e2', color: message.includes('Success') ? '#166534' : '#b91c1c', borderRadius: '6px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                        {message}
                    </div>
                )}
                
                {/* TAB 1: ID Generation UI */}
                {activeTab === 'generate' && (
                    <div>
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
                )}

                {/* TAB 2: Under Zone (Reports) UI */}
                {activeTab === 'reports' && (
                    <div>
                        {loadingReports ? (
                            <p style={{ textAlign: 'center', color: '#64748b', fontWeight: 'bold' }}>Decrypting reports...</p>
                        ) : reports.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                                <p style={{ margin: 0, color: '#64748b', fontWeight: 'bold' }}>The inbox is currently empty.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {reports.map((report) => (
                                    <div key={report._id} style={{ borderLeft: '4px solid #b91c1c', backgroundColor: '#fff1f2', padding: '1rem', borderRadius: '0 8px 8px 0', border: '1px solid #fecdd3', borderLeftWidth: '4px' }}>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <h3 style={{ margin: 0, color: '#9f1239', fontSize: '16px' }}>{report.title}</h3>
                                            <span style={{ backgroundColor: report.status === 'Pending' ? '#fef08a' : '#dcfce7', color: report.status === 'Pending' ? '#854d0e' : '#166534', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                                {report.status}
                                            </span>
                                        </div>
                                        
                                        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                                            <strong>From Role:</strong> {report.reporterRole} | <strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}
                                        </p>
                                        
                                        <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '6px', fontSize: '14px', color: '#334155', border: '1px solid #fecdd3' }}>
                                            {report.description}
                                        </div>
                                        
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
