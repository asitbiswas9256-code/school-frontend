'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('broadcast'); // Default to the new Megaphone!
    const [role, setRole] = useState('Assistant Headmaster');
    const [newId, setNewId] = useState('');
    const [message, setMessage] = useState('');
    
    // Feature States
    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [leaves, setLeaves] = useState([]);
    const [loadingLeaves, setLoadingLeaves] = useState(false);
    const [feedback, setFeedback] = useState({});

    // Broadcast State
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');
    const [noticeType, setNoticeType] = useState('Notice');
    const [isPublishing, setIsPublishing] = useState(false);

    const handleLogout = () => { localStorage.removeItem('token'); window.location.href = '/'; };

    const handleGenerate = async () => {
        if (!newId) return setMessage('Enter an ID.');
        setMessage('Generating...');
        try {
            const token = localStorage.getItem('token');
            const ep = role === 'Assistant Headmaster' ? '/api/admin/add-assistant' : '/api/admin/add-user';
            const res = await fetch(`https://school-backend-szf6.onrender.com${ep}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ userId: newId, password: 'password123', role })
            });
            const data = await res.json();
            if (res.ok) { setMessage(`Success! Created ${role}: ${newId}`); setNewId(''); }
            else setMessage(`Error: ${data.message}`);
        } catch (err) { setMessage('Network Error'); }
    };

    const fetchReports = async () => {
        setLoadingReports(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://school-backend-szf6.onrender.com/api/reports/all', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) setReports(data);
        } catch (err) {}
        setLoadingReports(false);
    };

    const updateReportStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/reports/${id}/status`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setReports(reports.map(r => r._id === id ? { ...r, status } : r));
                setMessage(`Report marked ${status}.`);
            }
        } catch (err) { setMessage('Error updating status.'); }
    };

    const fetchLeaves = async () => {
        setLoadingLeaves(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://school-backend-szf6.onrender.com/api/leaves/all', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) setLeaves(data);
        } catch (err) {}
        setLoadingLeaves(false);
    };

    const updateLeaveStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/leaves/${id}/status`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status, adminFeedback: feedback[id] || '' })
            });
            if (res.ok) {
                setLeaves(leaves.map(l => l._id === id ? { ...l, status, adminFeedback: feedback[id] || '' } : l));
                setMessage(`Leave ${status}.`);
            }
        } catch (err) { setMessage('Error updating leave.'); }
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        if (!noticeTitle || !noticeContent) return setMessage('Title and content required.');
        setIsPublishing(true); setMessage('Publishing...');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://school-backend-szf6.onrender.com/api/notices/publish', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title: noticeTitle, content: noticeContent, type: noticeType })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Success: Announcement published!');
                setNoticeTitle(''); setNoticeContent('');
            } else setMessage(`Error: ${data.message || 'Failed'}`);
        } catch (err) { setMessage('Network Error'); }
        setIsPublishing(false);
    };

    useEffect(() => {
        if (activeTab === 'reports') fetchReports();
        if (activeTab === 'leaves') fetchLeaves();
    }, [activeTab]);

    const getBadgeStyle = (status) => {
        if (status === 'Pending') return { bg: '#fef08a', text: '#854d0e' }; 
        if (status === 'Reviewed' || status === 'Approved') return { bg: '#dcfce7', text: '#166534' }; 
        if (status === 'Rejected') return { bg: '#fee2e2', text: '#9f1239' };
        return { bg: '#e2e8f0', text: '#334155' }; 
    };

    return (
        <div style={{ minHeight: '100vh', padding: '2rem 1rem', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ color: '#000080', margin: '0', fontSize: '20px' }}>Admin Command</h2>
                    <button onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Log Out</button>
                </div>

                {/* 4-Tab Navigation */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => { setActiveTab('broadcast'); setMessage(''); }} style={{ flex: '1 1 20%', padding: '0.6rem 0.25rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'broadcast' ? '#9333ea' : '#f1f5f9', color: activeTab === 'broadcast' ? 'white' : '#475569', fontSize: '12px' }}>Broadcast</button>
                    <button onClick={() => { setActiveTab('leaves'); setMessage(''); }} style={{ flex: '1 1 20%', padding: '0.6rem 0.25rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'leaves' ? '#0f766e' : '#f1f5f9', color: activeTab === 'leaves' ? 'white' : '#475569', fontSize: '12px' }}>Leaves</button>
                    <button onClick={() => { setActiveTab('reports'); setMessage(''); }} style={{ flex: '1 1 20%', padding: '0.6rem 0.25rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'reports' ? '#b91c1c' : '#f1f5f9', color: activeTab === 'reports' ? 'white' : '#475569', fontSize: '12px' }}>Under Zone</button>
                    <button onClick={() => { setActiveTab('generate'); setMessage(''); }} style={{ flex: '1 1 20%', padding: '0.6rem 0.25rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'generate' ? '#000080' : '#f1f5f9', color: activeTab === 'generate' ? 'white' : '#475569', fontSize: '12px' }}>Gen IDs</button>
                </div>

                {message && <div style={{ padding: '0.75rem', marginBottom: '1.5rem', backgroundColor: message.includes('Success') || message.includes('marked') || message.includes('Approved') || message.includes('Rejected') ? '#dcfce7' : '#fee2e2', color: message.includes('Error') ? '#b91c1c' : '#166534', borderRadius: '6px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>{message}</div>}

                {/* TAB 1: NEW BROADCAST SYSTEM */}
                {activeTab === 'broadcast' && (
                    <div>
                        <div style={{ padding: '1rem', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#7e22ce', fontSize: '16px' }}>Global Megaphone</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#6b21a8' }}>Publish official Notices or urgent Logistics alerts to all students and teachers.</p>
                        </div>
                        <form onSubmit={handlePublish}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Announcement Type:</label>
                                <select value={noticeType} onChange={(e) => setNoticeType(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }}>
                                    <option value="Notice">School Notice (e.g. Holidays, Exams)</option>
                                    <option value="Logistics">Logistics Alert (e.g. Bus Delay, Schedule)</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Title:</label>
                                <input type="text" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} placeholder="e.g. Tomorrow is a Holiday" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Announcement Body:</label>
                                <textarea value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} rows="4" placeholder="Type the full announcement here..." style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px', resize: 'vertical' }} />
                            </div>
                            <button type="submit" disabled={isPublishing} style={{ width: '100%', padding: '0.85rem', backgroundColor: isPublishing ? '#d8b4fe' : '#9333ea', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: isPublishing ? 'not-allowed' : 'pointer' }}>
                                {isPublishing ? 'Publishing...' : 'Broadcast to School'}
                            </button>
                        </form>
                    </div>
                )}

                {/* TAB 2: LEAVE INBOX */}
                {activeTab === 'leaves' && (
                    <div>
                        {loadingLeaves ? <p style={{ textAlign: 'center', color: '#64748b' }}>Loading applications...</p> : leaves.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b' }}>No leave applications.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {leaves.map((leave) => {
                                    const badge = getBadgeStyle(leave.status);
                                    return (
                                        <div key={leave._id} style={{ backgroundColor: '#f0fdfa', padding: '1rem', borderRadius: '8px', border: '1px solid #ccfbf1', borderLeft: `4px solid ${badge.bg === '#dcfce7' ? '#166534' : badge.bg === '#fee2e2' ? '#9f1239' : '#eab308'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <h3 style={{ margin: 0, color: '#0f766e', fontSize: '16px' }}>{leave.applicantId} ({leave.applicantRole})</h3>
                                                <span style={{ backgroundColor: badge.bg, color: badge.text, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{leave.status}</span>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 0.5rem 0' }}><strong>Dates:</strong> {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}</p>
                                            <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '6px', fontSize: '14px', border: '1px solid #ccfbf1', marginBottom: '0.75rem' }}>{leave.reason}</div>
                                            
                                            {leave.status === 'Pending' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <input type="text" placeholder="Optional feedback (e.g. Approved, enjoy!)" value={feedback[leave._id] || ''} onChange={(e) => setFeedback({...feedback, [leave._id]: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => updateLeaveStatus(leave._id, 'Approved')} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Approve</button>
                                                        <button onClick={() => updateLeaveStatus(leave._id, 'Rejected')} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#9f1239', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Reject</button>
                                                    </div>
                                                </div>
                                            ) : leave.adminFeedback && (
                                                <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px dashed #cbd5e1', fontSize: '12px', color: '#334155' }}><strong>Your Note:</strong> {leave.adminFeedback}</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: CONFIDENTIAL REPORTS */}
                {activeTab === 'reports' && (
                    <div>
                        {loadingReports ? <p style={{ textAlign: 'center', color: '#64748b' }}>Decrypting reports...</p> : reports.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b' }}>Inbox empty.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {reports.map((report) => {
                                    const badge = getBadgeStyle(report.status);
                                    return (
                                        <div key={report._id} style={{ backgroundColor: '#fff1f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecdd3', borderLeft: `4px solid ${badge.bg === '#dcfce7' ? '#166534' : '#b91c1c'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <h3 style={{ margin: 0, color: '#9f1239', fontSize: '16px' }}>{report.title}</h3>
                                                <span style={{ backgroundColor: badge.bg, color: badge.text, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{report.status}</span>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 0.5rem 0' }}><strong>From:</strong> {report.reporterId} ({report.reporterRole}) | {new Date(report.createdAt).toLocaleDateString()}</p>
                                            <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '6px', fontSize: '14px', border: '1px solid #fecdd3', marginBottom: '0.75rem' }}>{report.description}</div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {report.status === 'Pending' && <button onClick={() => updateReportStatus(report._id, 'Reviewed')} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Mark Reviewed</button>}
                                                {report.status !== 'Resolved' && <button onClick={() => updateReportStatus(report._id, 'Resolved')} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Mark Resolved</button>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: GENERATE IDs */}
                {activeTab === 'generate' && (
                    <div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Select Rank:</label>
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
                        <button onClick={handleGenerate} style={{ width: '100%', padding: '0.85rem', backgroundColor: '#000080', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>Generate ID</button>
                    </div>
                )}
            </div>
        </div>
    );
}
