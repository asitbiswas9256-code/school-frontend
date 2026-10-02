'use client';
import { useState, useEffect } from 'react';

export default function StudentDashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    // The Magic: This automatically runs the moment the student logs in
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('https://school-backend-szf6.onrender.com/api/student/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                
                if (res.ok) {
                    setData(json); // Saves the backend data to display below!
                } else {
                    setError(json.message);
                }
            } catch (err) {
                setError('Network error connecting to the database.');
            }
        };
        fetchProfile();
    }, []);

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#000080', margin: 0, fontSize: '24px' }}>Student Portal</h1>
                    <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Log Out
                    </button>
                </div>

                {/* If there is an error (like no data), show this */}
                {error ? (
                    <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        {error}
                    </div>
                ) : !data ? (
                    /* Loading screen while fetching */
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Fetching your live academic records...</div>
                ) : (
                    /* The Live Data Display */
                    <div>
                        <div style={{ padding: '1.5rem', backgroundColor: '#e0e7ff', borderRadius: '8px', color: '#3730a3', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '20px' }}>Welcome, {data.fullName}</h3>
                            <p style={{ margin: 0, fontSize: '15px' }}>Class: <strong>{data.profile.currentClass}</strong></p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '14px' }}>Annual Attendance</h4>
                                <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: data.profile.annualAttendancePercentage >= 75 ? '#166534' : '#b91c1c' }}>
                                    {data.profile.annualAttendancePercentage}%
                                </p>
                            </div>
                            <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '14px' }}>Behavioral Rating</h4>
                                <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#000080' }}>
                                    {data.profile.behavioralRating} <span style={{fontSize: '16px', color: '#94a3b8'}}>/ 5</span>
                                </p>
                            </div>
                        </div>

                        {data.profile.behavioralComments && (
                            <div style={{ padding: '1.25rem', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '15px', color: '#334155', borderLeft: '4px solid #94a3b8' }}>
                                <strong style={{ color: '#0f172a' }}>Teacher's Comment: </strong> {data.profile.behavioralComments}
                            </div>
                        )}

                        <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Financial Status</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '16px' }}>
                                <span style={{ color: '#64748b' }}>Total Annual Fees:</span>
                                <strong>₹{data.profile.fees.totalAnnual}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '16px' }}>
                                <span style={{ color: '#64748b' }}>Amount Paid:</span>
                                <strong style={{ color: '#166534' }}>₹{data.profile.fees.amountPaid}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1', fontSize: '16px' }}>
                                <span style={{ color: '#64748b' }}>Pending Dues:</span>
                                <strong style={{ color: '#b91c1c' }}>₹{data.profile.fees.pendingDues}</strong>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
