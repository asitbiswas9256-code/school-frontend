'use client';
import { useState, useEffect } from 'react';

export default function AdminPortal() {
    const [activeTab, setActiveTab] = useState('operations');
    
    // 1. LIVE AUTHENTICATION STATES
    const [adminId, setAdminId] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminRole, setAdminRole] = useState('');
    
    const [myEmail, setMyEmail] = useState('');
    const [profileMessage, setProfileMessage] = useState('');

    // 2. DATA STATES
    const [users, setUsers] = useState([]);
    const [lessons, setLessons] = useState([]);
    
    // 3. ID GENERATION STATES
    const [newUserId, setNewUserId] = useState('');
    const [newUserRole, setNewUserRole] = useState('Student');
    const [genMessage, setGenMessage] = useState('');

    // 4. OPERATIONS STATES
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');
    const [attStudentId, setAttStudentId] = useState('');
    const [attClass, setAttClass] = useState('');
    const [attRoll, setAttRoll] = useState('');
    const [attPercent, setAttPercent] = useState(100);

    // 5. STUDIO STATES
    const [subject, setSubject] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetClass, setTargetClass] = useState('Everyone');
    const [mediaFile, setMediaFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // SECURITY CHECK
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || (role !== 'Headmaster' && role !== 'Assistant Headmaster')) {
            window.location.href = '/';
            return;
        }

        setAdminId(localStorage.getItem('userId') || '');
        setAdminName(localStorage.getItem('fullName') || '');
        setAdminRole(role);

        fetchLessons(); 
        fetchUsers();
    }, []);

    const fetchLessons = async () => {
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/lessons?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) setLessons(await res.json());
        } catch (err) { console.error('Failed to fetch lessons'); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/admin/users?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) setUsers(await res.json());
        } catch (err) { console.error('Failed to fetch users'); }
    };

    // --- OPERATIONS LOGIC ---
    const handleGenerateId = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/admin/generate-id', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: newUserId, role: newUserRole })
            });
            const data = await res.json();
            setGenMessage(data.message);
            if (res.ok) { setNewUserId(''); fetchUsers(); }
        } catch (err) { setGenMessage('Network error.'); }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) return setSearchResults([]);
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/school/search?query=${searchQuery}`);
            if (res.ok) setSearchResults(await res.json());
            else alert("Search returned an error from the server.");
        } catch (err) { alert("Search failed to connect to backend."); }
    };

    const handlePostUrgentNotice = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/school/notices`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: noticeTitle, content: noticeContent, type: 'Notice', authorId: adminId, authorName: adminName, isUrgent: true })
            });
            if (res.ok) { alert("Urgent Notice Pinned!"); setNoticeTitle(''); setNoticeContent(''); }
        } catch (err) { alert("Failed to post notice."); }
    };

    const handleAttendanceSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/school/attendance/${attStudentId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ percentage: attPercent, currentClass: attClass, rollNo: attRoll })
            });
            if (res.ok) { alert(`Attendance officially updated to ${attPercent}%`); setAttStudentId(''); setAttClass(''); setAttRoll(''); setAttPercent(100); }
        } catch (err) { alert("Failed to update attendance."); }
    };

    // --- PROFILE EMAIL LOGIC (RESTORED!) ---
    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setProfileMessage('Updating...');
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/admin/update-email`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: adminId, email: myEmail })
            });
            if (res.ok) setProfileMessage('Email saved! You can now use the Forgot Password feature.');
            else setProfileMessage('Failed to save email.');
        } catch (err) { setProfileMessage('Network error while saving email.'); }
    };

    const toggleUserStatus = async (user) => {
        if (adminRole !== 'Headmaster' && user.role !== 'Student') return alert("Access Denied.");
        if (!window.confirm(`Are you sure you want to ${user.isActive ? 'BLOCK' : 'UNBLOCK'} ${user.fullName}?`)) return;
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/admin/users/${user._id}/toggle-status`, { method: 'PUT' });
            if (res.ok) fetchUsers();
        } catch (err) { alert("Error updating user status."); }
    };

    const handleDeleteLesson = async (id, postRole) => {
        if (adminRole !== 'Headmaster' && postRole === 'Headmaster') return alert("Access Denied.");
        if (!window.confirm('Delete this post permanently?')) return;
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/lessons/${id}`, { method: 'DELETE' });
            if (res.ok) fetchLessons();
        } catch (err) { alert('Failed to delete.'); }
    };

    const handlePublish = (e) => {
        e.preventDefault();
        if (!title || !content) return setMessage('Title and Content required.');
        setIsUploading(true); setMessage('');
        const formData = new FormData();
        formData.append('teacherId', adminId); formData.append('teacherName', adminName);
        formData.append('subject', subject || 'Official Announcement');
        formData.append('title', title); formData.append('content', content);
        formData.append('targetClass', targetClass);
        if (mediaFile) formData.append('mediaFile', mediaFile);

        const xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
            if (xhr.status === 201) { setMessage('Published successfully.'); setTitle(''); setContent(''); setSubject(''); fetchLessons(); } 
            else setMessage('Upload failed.');
            setIsUploading(false);
        });
        xhr.open('POST', 'https://school-backend-szf6.onrender.com/api/lessons/publish');
        xhr.send(formData);
    };

    const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('userId'); window.location.href = '/'; };

    if (!adminId) return <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}></div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
            <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <h1 style={{ margin: 0, fontSize: '20px', color: '#38bdf8' }}>{adminRole} Console</h1>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                    <button onClick={() => setActiveTab('operations')} style={{ background: activeTab === 'operations' ? '#38bdf8' : 'transparent', color: activeTab === 'operations' ? '#0f172a' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Operations Center</button>
                    <button onClick={() => setActiveTab('studio')} style={{ background: activeTab === 'studio' ? '#38bdf8' : 'transparent', color: activeTab === 'studio' ? '#0f172a' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Global Studio</button>
                    <button onClick={() => setActiveTab('users')} style={{ background: activeTab === 'users' ? '#38bdf8' : 'transparent', color: activeTab === 'users' ? '#0f172a' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Manage Users</button>
                    <button onClick={() => setActiveTab('profile')} style={{ background: activeTab === 'profile' ? '#38bdf8' : 'transparent', color: activeTab === 'profile' ? '#0f172a' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>My Profile</button>
                    <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '1rem' }}>Log Out</button>
                </div>
            </div>

            <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
                
                {/* 1. OPERATIONS CENTER */}
                {activeTab === 'operations' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ color: '#0f172a', margin: '0 0 1rem 0' }}>Global Directory Search</h2>
                            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or ID..." style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                <button type="submit" style={{ padding: '0.8rem 2rem', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Search</button>
                            </form>
                            {searchResults.length > 0 && (
                                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    {searchResults.map(res => (
                                        <div key={res._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                                            <strong>{res.fullName}</strong> <span style={{ color: '#64748b' }}>{res.role} | ID: {res.userId} | Status: {res.isActive ? 'Active' : 'Blocked'}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <h2 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>Offline Attendance</h2>
                                <form onSubmit={handleAttendanceSubmit}>
                                    <input type="text" value={attStudentId} onChange={(e) => setAttStudentId(e.target.value)} placeholder="Student ID (e.g., stu123)" required style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                        <input type="text" value={attClass} onChange={(e) => setAttClass(e.target.value)} placeholder="Class" required style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        <input type="text" value={attRoll} onChange={(e) => setAttRoll(e.target.value)} placeholder="Roll No" required style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Percentage: {attPercent}%</label>
                                    <input type="range" min="1" max="100" value={attPercent} onChange={(e) => setAttPercent(e.target.value)} style={{ width: '100%', marginBottom: '1.5rem' }} />
                                    <button type="submit" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Update Attendance</button>
                                </form>
                            </div>

                            <div style={{ backgroundColor: '#fee2e2', padding: '2rem', borderRadius: '12px', border: '2px solid #f87171' }}>
                                <h2 style={{ color: '#9f1239', margin: '0 0 0.5rem 0' }}>Urgent Pinned Notice</h2>
                                <form onSubmit={handlePostUrgentNotice}>
                                    <input type="text" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} placeholder="Urgent Title..." required style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #fca5a5', boxSizing: 'border-box' }} />
                                    <textarea value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} placeholder="Important details..." rows="3" required style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #fca5a5', boxSizing: 'border-box' }}></textarea>
                                    <button type="submit" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Broadcast Alert</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. GLOBAL STUDIO TAB */}
                {activeTab === 'studio' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Publish Official Media</h2>
                        <form onSubmit={handlePublish} style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <select value={targetClass} onChange={(e) => setTargetClass(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                    <option value="Everyone">Everyone (Public)</option><option value="Parents & Guardians">Parents & Guardians</option><option value="Teachers & Staff">Teachers & Staff</option><option value="Class V">Class V</option><option value="Class X">Class X</option>
                                </select>
                                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Category e.g. Notice" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1rem' }} />
                            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows="3" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1rem' }}></textarea>
                            <input type="file" onChange={(e) => setMediaFile(e.target.files[0])} accept="video/*,audio/*,image/*,application/pdf" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '1rem' }} disabled={isUploading} />
                            <button type="submit" style={{ padding: '0.85rem 2rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>{isUploading ? 'Uploading...' : 'Broadcast Message'}</button>
                        </form>
                    </div>
                )}

                {/* 3. USER MANAGEMENT TAB */}
                {activeTab === 'users' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Manage Registered Users</h2>
                        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                            <form onSubmit={handleGenerateId} style={{ display: 'flex', gap: '1rem' }}>
                                <input type="text" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} placeholder="Enter New ID" required style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                    <option value="Student">Student</option><option value="Teacher">Teacher</option>
                                    {adminRole === 'Headmaster' && <option value="Assistant Headmaster">Assistant Headmaster</option>}
                                </select>
                                <button type="submit" style={{ padding: '0.75rem 2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Generate ID</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* 4. PROFILE SETTINGS TAB (RESTORED!) */}
                {activeTab === 'profile' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Profile Settings</h2>
                        
                        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#475569' }}>Registered ID: <span style={{ color: '#0f172a' }}>{adminId}</span></p>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#475569' }}>Name: <span style={{ color: '#0f172a' }}>{adminName}</span></p>
                            <p style={{ margin: '0', fontWeight: 'bold', color: '#475569' }}>System Role: <span style={{ color: '#0f172a' }}>{adminRole}</span></p>
                        </div>

                        <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '1rem' }}>Security & Recovery</h3>
                        {profileMessage && <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}>{profileMessage}</div>}
                        
                        <form onSubmit={handleUpdateEmail}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#0f172a' }}>Linked Recovery Email Address:</label>
                                <input type="email" value={myEmail} onChange={(e) => setMyEmail(e.target.value)} placeholder="Enter your email to enable password recovery..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                            </div>
                            <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Save Email</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
