'use client';
import { useState, useEffect } from 'react';

export default function AdminPortal() {
    // 1. TOP-LEVEL & AUTH STATES
    const [activeTab, setActiveTab] = useState('operations'); // 'operations', 'studio', 'users', 'profile'
    
    // Auth Simulation (In a live app, this comes from the login token)
    const adminId = "admin01"; 
    const adminName = "Principal Smith";
    
    // GOD-MODE TOGGLE: Change this to 'Assistant Headmaster' to see the restricted permissions!
    const adminRole = "Headmaster"; 
    
    const [myEmail, setMyEmail] = useState('');
    const [profileMessage, setProfileMessage] = useState('');

    // 2. DATA STATES
    const [users, setUsers] = useState([]);
    const [lessons, setLessons] = useState([]);
    
    // 3. OPERATIONS STATES (Search, Notices, Attendance)
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');
    
    const [attStudentId, setAttStudentId] = useState('');
    const [attClass, setAttClass] = useState('');
    const [attRoll, setAttRoll] = useState('');
    const [attPercent, setAttPercent] = useState(100);

    // 4. STUDIO STATES
    const [subject, setSubject] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetClass, setTargetClass] = useState('Everyone');
    const [mediaFile, setMediaFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => { fetchLessons(); fetchUsers(); }, []);

    // --- DATA FETCHING ---
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
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) return setSearchResults([]);
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/school/search?query=${searchQuery}`);
            if (res.ok) setSearchResults(await res.json());
        } catch (err) { alert("Search failed."); }
    };

    const handlePostUrgentNotice = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/school/notices`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: noticeTitle, content: noticeContent, type: 'Notice', authorId: adminId, authorName: adminName, isUrgent: true })
            });
            if (res.ok) { alert("Urgent Notice Pinned to All Dashboards!"); setNoticeTitle(''); setNoticeContent(''); }
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

    // --- GOD-MODE USER MANAGEMENT ---
    const toggleUserStatus = async (user) => {
        // RULE 1: Assistant Headmasters can only block Students
        if (adminRole !== 'Headmaster' && user.role !== 'Student') {
            return alert("Access Denied: Assistant Headmasters can only manage Student accounts.");
        }
        if (!window.confirm(`Are you sure you want to ${user.isActive ? 'BLOCK' : 'UNBLOCK'} ${user.fullName}?`)) return;
        
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/admin/users/${user._id}/toggle-status`, { method: 'PUT' });
            if (res.ok) fetchUsers();
        } catch (err) { alert("Error updating user status."); }
    };

    // --- GOD-MODE STUDIO LOGIC ---
    const handleDeleteLesson = async (id, postRole) => {
        // RULE 2: Assistants cannot delete Headmaster posts
        if (adminRole !== 'Headmaster' && postRole === 'Headmaster') {
            return alert("Access Denied: You cannot delete a post made by the Headmaster.");
        }
        if (!window.confirm('Admin Override: Delete this post permanently?')) return;
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

    const handleLogout = () => { localStorage.removeItem('token'); window.location.href = '/'; };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
            {/* TOP NAVIGATION BAR */}
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
                
                {/* 1. OPERATIONS CENTER (NEW!) */}
                {activeTab === 'operations' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* GLOBAL SEARCH */}
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ color: '#0f172a', margin: '0 0 1rem 0' }}>Global Directory Search</h2>
                            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name..." style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
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
                            {/* OFFLINE ATTENDANCE */}
                            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <h2 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>Offline Attendance</h2>
                                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '1.5rem' }}>Update annual attendance manually (1-100%).</p>
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

                            {/* URGENT RED NOTICES */}
                            <div style={{ backgroundColor: '#fee2e2', padding: '2rem', borderRadius: '12px', border: '2px solid #f87171' }}>
                                <h2 style={{ color: '#9f1239', margin: '0 0 0.5rem 0' }}>Urgent Pinned Notice</h2>
                                <p style={{ fontSize: '13px', color: '#9f1239', marginBottom: '1.5rem' }}>Broadcast a red banner alert to every user's dashboard.</p>
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
                        {message && <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '8px', fontWeight: 'bold' }}>{message}</div>}
                        
                        <form onSubmit={handlePublish} style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Target Audience:</label>
                                    <select value={targetClass} onChange={(e) => setTargetClass(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                        <option value="Everyone">Everyone (Public)</option><option value="Parents & Guardians">Parents & Guardians</option><option value="Teachers & Staff">Teachers & Staff</option><option value="Class V">Class V</option><option value="Class X">Class X</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Category:</label>
                                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Administrative Notice" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Title & Content:</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.5rem' }} />
                                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows="3" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}></textarea>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '14px' }}>Attach Media:</label>
                                <input type="file" onChange={(e) => setMediaFile(e.target.files[0])} accept="video/*,audio/*,image/*,application/pdf" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }} disabled={isUploading} />
                            </div>
                            <button type="submit" style={{ padding: '0.85rem 2rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                                {isUploading ? 'Uploading...' : 'Broadcast Message'}
                            </button>
                        </form>

                        <h2 style={{ color: '#0f172a', marginBottom: '1rem', borderTop: '2px solid #e2e8f0', paddingTop: '1.5rem' }}>Global Feed (Admin View)</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {lessons.map(lesson => (
                                <div key={lesson._id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', marginRight: '0.5rem' }}>{lesson.targetClass}</span>
                                        <strong>{lesson.title}</strong> <span style={{ fontSize: '13px', color: '#64748b' }}>by {lesson.teacherName}</span>
                                    </div>
                                    {/* Hides delete button if Asst. Headmaster tries to delete Headmaster post */}
                                    {(adminRole === 'Headmaster' || lesson.teacherName !== 'Headmaster Admin') && (
                                        <button onClick={() => handleDeleteLesson(lesson._id, lesson.teacherName === 'Headmaster Admin' ? 'Headmaster' : 'Teacher')} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Delete Post</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. USER MANAGEMENT TAB */}
                {activeTab === 'users' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Manage Registered Users</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Block or deactivate accounts. (Assistant Headmasters can only manage Students).</p>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#334155' }}>Name</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#334155' }}>ID & Role</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', color: '#334155' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem', fontWeight: 'bold', color: user.isActive ? '#0f172a' : '#94a3b8' }}>{user.fullName}</td>
                                            <td style={{ padding: '1rem' }}>{user.userId} <br/><span style={{ fontSize: '12px', color: '#64748b' }}>{user.role}</span></td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {/* Role restriction logic applied here */}
                                                {user.role !== 'Headmaster' && (adminRole === 'Headmaster' || user.role === 'Student') && (
                                                    <button onClick={() => toggleUserStatus(user)} style={{ padding: '0.4rem 0.8rem', backgroundColor: user.isActive ? '#fee2e2' : '#dcfce7', color: user.isActive ? '#ef4444' : '#166534', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                                                        {user.isActive ? 'Block Account' : 'Unblock Account'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 4. PROFILE SETTINGS TAB */}
                {activeTab === 'profile' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Profile Settings</h2>
                        
                        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#475569' }}>Registered ID: <span style={{ color: '#0f172a' }}>{adminId}</span></p>
                            <p style={{ margin: '0', fontWeight: 'bold', color: '#475569' }}>System Role: <span style={{ color: '#0f172a' }}>{adminRole}</span></p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
