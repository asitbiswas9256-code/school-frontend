'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('broadcast');
    const [role, setRole] = useState('Assistant Headmaster');
    const [newId, setNewId] = useState('');
    const [message, setMessage] = useState('');
    
    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [leaves, setLeaves] = useState([]);
    const [loadingLeaves, setLoadingLeaves] = useState(false);
    const [feedback, setFeedback] = useState({});

    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');
    const [noticeType, setNoticeType] = useState('Notice');
    const [isPublishing, setIsPublishing] = useState(false);
    const [notices, setNotices] = useState([]);
    const [loadingNotices, setLoadingNotices] = useState(false);

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

    const fetchNotices = async () => {
        setLoadingNotices(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://school-backend-szf6.onrender.com/api/notices/all', { headers: { 'Authorization': `Bearer ${token}` } });
            let json = [];
            try { json = await res.json(); } catch(e) {}
            if (res.ok) setNotices(json);
        } catch (err) {}
        setLoadingNotices(false);
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
                fetchNotices(); 
            } else setMessage(`Error: ${data.message || 'Failed'}`);
        } catch (err) { setMessage('Network Error'); }
        setIsPublishing(false);
    };

    useEffect(() => {
        if (activeTab === 'reports') fetchReports();
        if (activeTab === 'leaves') fetchLeaves();
        if (activeTab === 'broadcast') fetchNotices();
    }, [activeTab]);

    const getBadgeStyle = (status) => {
        if (status === 'Pending') return { bg: '#fef08a', text: '#854d0e' }; 
        if (status === 'Reviewed' || status === 'Approved') return { bg: '#dcfce7', text: '#166534' }; 
        if (status === 'Rejected') return { bg: '#fee2e2', text: '#9f1239' };
        return { bg: '#e2e8f0', text: '#334155' }; 
    };

    // Helper for rendering Native App-style Bottom Navigation Buttons
    const renderNavButton = (id, label, color) => {
        const isActive = activeTab === id;
        return (
            <button onClick={() => { setActiveTab(id); setMessage(''); }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'none', border: 'none', cursor: 'pointer', color: isActive ? color : '#64748b' }}>
                <div style={{ width: '22px', height: '22px', marginBottom: '4px', borderRadius: '50%', backgroundColor: isActive ? color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isActive ? 'none' : '2px solid #cbd5e1' }}>
                    {isActive && <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%' }} />}
                </div>
                <span style={{ fontSize: '11px', fontWeight: isActive ? 'bold' : 'normal' }}>{label}</span>
            </button>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
            
            {/* FIXED TOP HEADER */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
                <h2 style={{ color: '#000080', margin: '0', fontSize: '20px' }}>Admin Command</h2>
                <button onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Log Out</button>
            </header>

            {/* SCROLLABLE MAIN APP CONTENT */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '1rem', paddingBottom: '90px' }}>
                
                {message && <div style={{ padding: '0.75rem', marginBottom: '1.5rem', backgroundColor: message.includes('Success') || message.includes('marked') || message.includes('Approved') || message.includes('Rejected') ? '#dcfce7' : '#fee2e2', color: message.includes('Error') ? '#b91c1c' : '#166534', borderRadius: '6px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{message}</div>}

                {/* TAB 1: BROADCAST SYSTEM */}
                {activeTab === 'broadcast' && (
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ padding: '1rem', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#7e22ce', fontSize: '16px' }}>Global Megaphone</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#6b21a8' }}>Publish official Notices or urgent Logistics alerts.</p>
                        </div>
                        <form onSubmit={handlePublish}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Type:</label>
                                <select value={noticeType} onChange={(e) => setNoticeType(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '16px', backgroundColor: '#f8fafc' }}>
                                    <option value="Notice">School Notice</option>
                                    <option value="Logistics">Logistics Alert</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Title:</label>
                                <input type="text" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} placeholder="e.g. Holiday Alert" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '16px', backgroundColor: '#f8fafc' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Body:</label>
                                <textarea value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} rows="3" placeholder="Type announcement..." style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '16px', resize: 'vertical', backgroundColor: '#f8fafc' }} />
                            </div>
                            <button type="submit" disabled={isPublishing} style={{ width: '100%', padding: '0.85rem', backgroundColor: isPublishing ? '#d8b4fe' : '#9333ea', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: isPublishing ? 'not-allowed' : 'pointer' }}>
                                {isPublishing ? 'Publishing...' : 'Broadcast'}
                            </button>
                        </form>

                        <hr style={{ margin: '2rem 0 1.5rem 0', border: 'none', borderTop: '2px dashed #e2e8f0' }} />
                        <h4 style={{ margin: '0 0 1rem 0', color: '#334155', fontSize: '16px' }}>History</h4>
                        {loadingNotices ? <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Loading history...</p> : notices.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>No notices published yet.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {notices.map(notice => (
                                    <div key={notice._id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: notice.type === 'Logistics' ? '#fffbeb' : '#f8fafc', borderLeft: `4px solid ${notice.type === 'Logistics' ? '#f59e0b' : '#3b82f6'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <strong style={{ color: '#0f172a', fontSize: '15px' }}>{notice.title}</strong>
                                            <span style={{ backgroundColor: notice.type === 'Logistics' ? '#fef3c7' : '#dbeafe', color: notice.type === 'Logistics' ? '#b45309' : '#1d4ed8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{notice.type}</span>
                                        </div>
                                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: '#64748b' }}>By {notice.authorRole} • {new Date(notice.createdAt).toLocaleDateString()}</p>
                                        <div style={{ margin: 0, fontSize: '14px', color: '#334155', whiteSpace: 'pre-wrap' }}>{notice.content}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: LEAVE INBOX */}
                {activeTab === 'leaves' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {loadingLeaves ? <p style={{ textAlign: 'center', color: '#64748b' }}>Loading applications...</p> : leaves.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>No leave applications.</p> : (
                            leaves.map((leave) => {
                                const badge = getBadgeStyle(leave.status);
                                return (
                                    <div key={leave._id} style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `4px solid ${badge.bg === '#dcfce7' ? '#166534' : badge.bg === '#fee2e2' ? '#9f1239' : '#eab308'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <h3 style={{ margin: 0, color: '#0f766e', fontSize: '16px' }}>{leave.applicantId} ({leave.applicantRole})</h3>
                                            <span style={{ backgroundColor: badge.bg, color: badge.text, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{leave.status}</span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 0.5rem 0' }}><strong>Dates:</strong> {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}</p>
                                        <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '14px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>{leave.reason}</div>
                                        
                                        {leave.status === 'Pending' ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <input type="text" placeholder="Optional feedback..." value={feedback[leave._id] || ''} onChange={(e) => setFeedback({...feedback, [leave._id]: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => updateLeaveStatus(leave._id, 'Approved')} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Approve</button>
                                                    <button onClick={() => updateLeaveStatus(leave._id, 'Rejected')} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#9f1239', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Reject</button>
                                                </div>
                                            </div>
                                        ) : leave.adminFeedback && (
                                            <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', border: '1px dashed #cbd5e1', fontSize: '12px', color: '#334155' }}><strong>Your Note:</strong> {leave.adminFeedback}</div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* TAB 3: CONFIDENTIAL REPORTS */}
                {activeTab === 'reports' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {loadingReports ? <p style={{ textAlign: 'center', color: '#64748b' }}>Decrypting reports...</p> : reports.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>Inbox empty.</p> : (
                            reports.map((report) => {
                                const badge = getBadgeStyle(report.status);
                                return (
                                    <div key={report._id} style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `4px solid ${badge.bg === '#dcfce7' ? '#166534' : '#b91c1c'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <h3 style={{ margin: 0, color: '#9f1239', fontSize: '16px' }}>{report.title}</h3>
                                            <span style={{ backgroundColor: badge.bg, color: badge.text, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{report.status}</span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 0.5rem 0' }}><strong>From:</strong> {report.reporterId} ({report.reporterRole}) | {new Date(report.createdAt).toLocaleDateString()}</p>
                                        <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '14px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>{report.description}</div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {report.status === 'Pending' && <button onClick={() => updateReportStatus(report._id, 'Reviewed')} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Mark Reviewed</button>}
                                            {report.status !== 'Resolved' && <button onClick={() => updateReportStatus(report._id, 'Resolved')} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Mark Resolved</button>}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* TAB 4: GENERATE IDs */}
                {activeTab === 'generate' && (
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 1rem 0', color: '#000080', fontSize: '16px' }}>Onboard Personnel</h3>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Select Rank:</label>
                            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '16px', backgroundColor: '#f8fafc' }}>
                                <option value="Assistant Headmaster">Assistant Headmaster</option>
                                <option value="Teacher">Teacher</option>
                                <option value="Student">Student</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>New User ID:</label>
                            <input type="text" value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="e.g. teacher99" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '16px', backgroundColor: '#f8fafc' }} />
                        </div>
                        <button onClick={handleGenerate} style={{ width: '100%', padding: '0.85rem', backgroundColor: '#000080', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>Generate ID</button>
                    </div>
                )}
            </main>

            {/* FIXED BOTTOM NAVIGATION BAR */}
            <nav style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', position: 'fixed', bottom: 0, left: 0, right: 0, height: '65px', paddingBottom: 'env(safe-area-inset-bottom, 0px)', zIndex: 50 }}>
                {renderNavButton('broadcast', 'Broadcast', '#9333ea')}
                {renderNavButton('leaves', 'Leaves', '#0f766e')}
                {renderNavButton('reports', 'Under Zone', '#b91c1c')}
                {renderNavButton('generate', 'Gen IDs', '#000080')}
            </nav>
        </div>
    );
}
