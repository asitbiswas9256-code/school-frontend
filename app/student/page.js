'use client';
import { useState, useEffect } from 'react';

export default function StudentDashboard() {
    // Tab State
    const [activeTab, setActiveTab] = useState('records'); // 'records' or 'report'

    // Academic Data State
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    // Report Form State
    const [reportTitle, setReportTitle] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportMessage, setReportMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- NEW: My Reports (Outbox) State ---
    const [myReports, setMyReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    // 1. Fetch academic records on login
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('https://school-backend-szf6.onrender.com/api/student/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                
                if (res.ok) {
                    setData(json); 
                } else {
                    setError(json.message);
                }
            } catch (err) {
                setError('Network error connecting to the database.');
            }
        };
        fetchProfile();
    }, []);

    // 2. NEW: Fetch My Past Reports
    const fetchMyReports = async () => {
        setLoadingReports(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://school-backend-szf6.onrender.com/api/reports/my-reports', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (res.ok) {
                setMyReports(json);
            }
        } catch (err) {
            console.error("Error fetching reports", err);
        }
        setLoadingReports(false);
    };

    // Automatically fetch past reports when the student clicks the Confidential Tip tab
    useEffect(() => {
        if (activeTab === 'report') {
            fetchMyReports();
        }
    }, [activeTab]);

    // 3. Submit a confidential report
    const handleSubmitReport = async (e) => {
        e.preventDefault();
        if (!reportTitle || !reportDescription) {
            return setReportMessage('Please provide both a title and details.');
        }
        
        setIsSubmitting(true);
        setReportMessage('Encrypting and sending securely...');
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://school-backend-szf6.onrender.com/api/reports/submit', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    title: reportTitle, 
                    description: reportDescription, 
                    evidenceUrl: '' 
                })
            });

            const json = await res.json();

            if (res.ok) {
                setReportMessage('Success: Your tip has been securely delivered to the Headmaster.');
                setReportTitle('');
                setReportDescription('');
                fetchMyReports(); // Instantly refresh the outbox list below!
            } else {
                setReportMessage(`Error: ${json.message}`);
            }
        } catch (err) {
            setReportMessage('Network error while submitting.');
        }
        setIsSubmitting(false);
    };

    // Helper function for dynamic badge colors matching the admin side
    const getBadgeStyle = (status) => {
        if (status === 'Pending') return { bg: '#fef08a', text: '#854d0e' }; 
        if (status === 'Reviewed') return { bg: '#bfdbfe', text: '#1e3a8a' }; 
        return { bg: '#dcfce7', text: '#166534' }; 
    };

    return (
        <div style={{ minHeight: '100vh', padding: '2rem 1rem', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={{ color: '#000080', margin: 0, fontSize: '24px' }}>Student Portal</h1>
                    <button onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Log Out
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
                    <button 
                        onClick={() => { setActiveTab('records'); setReportMessage(''); }}
                        style={{ flex: 1, padding: '0.75rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'records' ? '#000080' : '#f1f5f9', color: activeTab === 'records' ? 'white' : '#475569' }}
                    >
                        Academic Records
                    </button>
                    <button 
                        onClick={() => setActiveTab('report')}
                        style={{ flex: 1, padding: '0.75rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'report' ? '#b91c1c' : '#f1f5f9', color: activeTab === 'report' ? 'white' : '#475569' }}
                    >
                        Confidential Tip
                    </button>
                </div>

                {/* TAB 1: Academic Records */}
                {activeTab === 'records' && (
                    <div>
                        {error ? (
                            <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                                {error}
                            </div>
                        ) : !data ? (
                            <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Fetching your live academic records...</div>
                        ) : (
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
                )}

                {/* TAB 2: Confidential Report UI */}
                {activeTab === 'report' && (
                    <div>
                        <div style={{ padding: '1rem', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#9f1239', fontSize: '16px' }}>The Under Zone</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#be123c' }}>
                                This system is strictly confidential. Your report will be encrypted and sent directly to the Headmaster.
                            </p>
                        </div>

                        {reportMessage && (
                            <div style={{ padding: '0.75rem', marginBottom: '1.5rem', backgroundColor: reportMessage.includes('Success') ? '#dcfce7' : '#fee2e2', color: reportMessage.includes('Success') ? '#166534' : '#b91c1c', borderRadius: '6px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                                {reportMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmitReport}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px', color: '#334155' }}>Subject / Incident Title:</label>
                                <input 
                                    type="text" 
                                    value={reportTitle}
                                    onChange={(e) => setReportTitle(e.target.value)}
                                    placeholder="Brief title of the issue" 
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }} 
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px', color: '#334155' }}>Detailed Description:</label>
                                <textarea 
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    placeholder="Provide as much detail as possible. Who, what, when, where?" 
                                    rows="4"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px', resize: 'vertical' }} 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                style={{ width: '100%', padding: '0.85rem', backgroundColor: isSubmitting ? '#94a3b8' : '#b91c1c', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            >
                                {isSubmitting ? 'Sending securely...' : 'Submit Confidential Report'}
                            </button>
                        </form>

                        {/* NEW: My Past Tips Section */}
                        <hr style={{ margin: '2rem 0 1.5rem 0', border: 'none', borderTop: '2px dashed #e2e8f0' }} />
                        <h4 style={{ margin: '0 0 1rem 0', color: '#334155', fontSize: '16px' }}>My Past Tips</h4>
                        
                        {loadingReports ? (
                            <p style={{ color: '#64748b', fontSize: '14px' }}>Loading past tips...</p>
                        ) : myReports.length === 0 ? (
                            <p style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>You haven't submitted any tips yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {myReports.map(report => {
                                    const badge = getBadgeStyle(report.status);
                                    return (
                                        <div key={report._id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <strong style={{ color: '#0f172a', fontSize: '15px' }}>{report.title}</strong>
                                                <span style={{ backgroundColor: badge.bg, color: badge.text, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                                    {report.status}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                                                Submitted on: {new Date(report.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
