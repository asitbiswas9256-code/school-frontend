'use client';
import { useState, useEffect } from 'react';

export default function AdminPortal() {
    // Tab System
    const [activeTab, setActiveTab] = useState('studio'); // 'users', 'studio', 'profile'

    // Profile States
    const adminId = "admin01"; // To be pulled from auth token
    const adminName = "Headmaster / Admin";
    const [myEmail, setMyEmail] = useState('');
    const [profileMessage, setProfileMessage] = useState('');

    // User Management States
    const [users, setUsers] = useState([]);
    
    // Studio States
    const [subject, setSubject] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetClass, setTargetClass] = useState('Everyone');
    const [playlistName, setPlaylistName] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [lessons, setLessons] = useState([]);
    const [xhrRequest, setXhrRequest] = useState(null);

    useEffect(() => {
        fetchLessons();
        fetchUsers();
    }, []);

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

    // --- USER MANAGEMENT ---
    const toggleUserStatus = async (userId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'BLOCK' : 'UNBLOCK'} this user?`)) return;
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/admin/users/${userId}/toggle-status`, { method: 'PUT' });
            if (res.ok) fetchUsers();
        } catch (err) { alert("Error updating user status."); }
    };

    // --- PROFILE MANAGEMENT ---
    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setProfileMessage('Updating...');
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/admin/update-email`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: adminId, email: myEmail })
            });
            const data = await res.json();
            if (res.ok) setProfileMessage('Email successfully saved! You can now use the Forgot Password feature.');
            else setProfileMessage(`Error: ${data.message}`);
        } catch (err) { setProfileMessage('Network error while saving email.'); }
    };

    // --- STUDIO PUBLISHING ---
    const handlePublish = (e) => {
        e.preventDefault();
        if (!title || !content) return setMessage('Title and Content are required.');
        
        setIsUploading(true); setMessage(''); setUploadProgress(0);
        
        const formData = new FormData();
        formData.append('teacherId', adminId);
        formData.append('teacherName', adminName);
        formData.append('subject', subject || 'Official Announcement');
        formData.append('title', title);
        formData.append('content', content);
        formData.append('targetClass', targetClass);
        formData.append('playlistName', playlistName);
        if (mediaFile) formData.append('mediaFile', mediaFile);
        if (thumbnailFile) formData.append('thumbnailFile', thumbnailFile);

        const xhr = new XMLHttpRequest();
        setXhrRequest(xhr);

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 201) {
                setMessage('Success! Published to feed.');
                setTitle(''); setContent(''); setSubject(''); setMediaFile(null); setThumbnailFile(null);
                fetchLessons();
            } else { setMessage('Upload failed.'); }
            setIsUploading(false); setXhrRequest(null);
        });
        
        xhr.addEventListener('error', () => { setMessage('Network Error.'); setIsUploading(false); });
        xhr.addEventListener('abort', () => { setMessage('Upload canceled.'); setIsUploading(false); });

        xhr.open('POST', 'https://school-backend-szf6.onrender.com/api/lessons/publish');
        xhr.send(formData);
    };

    const handleDeleteLesson = async (id) => {
        if (!window.confirm('Admin Override: Delete this post permanently?')) return;
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/lessons/${id}`, { method: 'DELETE' });
            if (res.ok) fetchLessons();
        } catch (err) { alert('Failed to delete.'); }
    };

    const handleLogout = () => { localStorage.removeItem('token'); window.location.href = '/'; };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
            {/* TOP NAVIGATION BAR */}
            <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <h1 style={{ margin: 0, fontSize: '20px', color: '#38bdf8' }}>Admin Console</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setActiveTab('studio')} style={{ background: activeTab === 'studio' ? '#38bdf8' : 'transparent', color: activeTab === 'studio' ? '#0f172a' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Global Studio</button>
                    <button onClick={() => setActiveTab('users')} style={{ background: activeTab === 'users' ? '#38bdf8' : 'transparent', color: activeTab === 'users' ? '#0f172a' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Manage Users</button>
                    <button onClick={() => setActiveTab('profile')} style={{ background: activeTab === 'profile' ? '#38bdf8' : 'transparent', color: activeTab === 'profile' ? '#0f172a' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>My Profile</button>
                    <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '1rem' }}>Log Out</button>
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
                
                {/* 1. GLOBAL STUDIO TAB */}
                {activeTab === 'studio' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Publish Official Media</h2>
                        {message && <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '8px', fontWeight: 'bold' }}>{message}</div>}
                        
                        <form onSubmit={handlePublish} style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Target Audience:</label>
                                    <select value={targetClass} onChange={(e) => setTargetClass(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                        <option value="Everyone">Everyone (Public)</option>
                                        <option value="Parents & Guardians">Parents & Guardians</option>
                                        <option value="Teachers & Staff">Teachers & Staff</option>
                                        <option value="Other">Other (Custom)</option>
                                        <option value="Class V">Class V</option><option value="Class X">Class X</option>
                                        <option value="Class XII">Class XII</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Category / Subject:</label>
                                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Administrative Notice" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Title:</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Message / Notes:</label>
                                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows="3" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}></textarea>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '14px' }}>Attach Video/Audio:</label>
                                    <input type="file" onChange={(e) => setMediaFile(e.target.files[0])} accept="video/*,audio/*,image/*" style={{ width: '100%' }} disabled={isUploading} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '14px' }}>Thumbnail (Optional):</label>
                                    <input type="file" onChange={(e) => setThumbnailFile(e.target.files[0])} accept="image/*" style={{ width: '100%' }} disabled={isUploading} />
                                </div>
                            </div>

                            {isUploading ? (
                                <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '99px', height: '10px' }}><div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#0ea5e9' }}></div></div>
                            ) : (
                                <button type="submit" style={{ padding: '0.85rem 2rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>Broadcast Message</button>
                            )}
                        </form>

                        <h2 style={{ color: '#0f172a', marginBottom: '1rem', borderTop: '2px solid #e2e8f0', paddingTop: '1.5rem' }}>Global Feed (Admin View)</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {lessons.map(lesson => (
                                <div key={lesson._id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', marginRight: '0.5rem' }}>{lesson.targetClass}</span>
                                        <strong>{lesson.title}</strong> <span style={{ fontSize: '13px', color: '#64748b' }}>by {lesson.teacherName}</span>
                                    </div>
                                    <button onClick={() => handleDeleteLesson(lesson._id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Delete Post</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. USER MANAGEMENT TAB */}
                {activeTab === 'users' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Manage Registered Users</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Block or deactivate accounts. Blocked users cannot log in.</p>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#334155' }}>Name</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#334155' }}>ID & Role</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#334155' }}>Email</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', color: '#334155' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem', fontWeight: 'bold', color: user.isActive ? '#0f172a' : '#94a3b8' }}>{user.fullName}</td>
                                            <td style={{ padding: '1rem' }}>{user.userId} <br/><span style={{ fontSize: '12px', color: '#64748b' }}>{user.role}</span></td>
                                            <td style={{ padding: '1rem', fontSize: '14px', color: '#475569' }}>{user.email || 'No email provided'}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {user.role !== 'Headmaster' && (
                                                    <button onClick={() => toggleUserStatus(user._id, user.isActive)} style={{ padding: '0.4rem 0.8rem', backgroundColor: user.isActive ? '#fee2e2' : '#dcfce7', color: user.isActive ? '#ef4444' : '#166534', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
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

                {/* 3. PROFILE SETTINGS TAB */}
                {activeTab === 'profile' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Profile Settings</h2>
                        
                        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#475569' }}>Registered ID: <span style={{ color: '#0f172a' }}>{adminId}</span></p>
                            <p style={{ margin: '0', fontWeight: 'bold', color: '#475569' }}>System Role: <span style={{ color: '#0f172a' }}>{adminName}</span></p>
                        </div>

                        <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '1rem' }}>Security & Recovery</h3>
                        {profileMessage && <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}>{profileMessage}</div>}
                        
                        <form onSubmit={handleUpdateEmail}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#0f172a' }}>Linked Recovery Email Address:</label>
                                <input type="email" value={myEmail} onChange={(e) => setMyEmail(e.target.value)} placeholder="Enter your Gmail to enable password recovery..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '0.5rem' }}>This email will be used to send you a 6-digit OTP if you ever forget your password.</p>
                            </div>
                            <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Save Settings</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
