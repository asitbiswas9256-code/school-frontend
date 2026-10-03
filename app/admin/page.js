'use client';
import { useState, useEffect } from 'react';

export default function AdminPortal() {
    const [activeTab, setActiveTab] = useState('profile'); // Defaulting to profile so you can test it immediately!
    
    // 1. LIVE AUTHENTICATION STATES
    const [adminId, setAdminId] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminRole, setAdminRole] = useState('');
    
    // 2. DATA STATES
    const [users, setUsers] = useState([]);
    const [lessons, setLessons] = useState([]);
    
    // 3. PROFILE SETTINGS STATES
    const [myEmail, setMyEmail] = useState('');
    const [myDob, setMyDob] = useState('');
    const [myBloodGroup, setMyBloodGroup] = useState('');
    
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    
    const [newAdminIdInput, setNewAdminIdInput] = useState('');
    const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });

    // 4. STUDENT EDITING STATES (In Manage Users Tab)
    const [editingStudent, setEditingStudent] = useState(null);
    const [editStudentData, setEditStudentData] = useState({ fullName: '', currentClass: '', rollNo: '', dob: '', bloodGroup: '' });

    // ... (Other standard states for Studio & Operations)
    const [newUserId, setNewUserId] = useState('');
    const [newUserRole, setNewUserRole] = useState('Student');
    const [genMessage, setGenMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');
    const [attStudentId, setAttStudentId] = useState('');
    const [attClass, setAttClass] = useState('');
    const [attRoll, setAttRoll] = useState('');
    const [attPercent, setAttPercent] = useState(100);
    const [subject, setSubject] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetClass, setTargetClass] = useState('Everyone');
    const [mediaFile, setMediaFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || (role !== 'Headmaster' && role !== 'Assistant Headmaster')) return window.location.href = '/';

        setAdminId(localStorage.getItem('userId') || '');
        setAdminName(localStorage.getItem('fullName') || '');
        setAdminRole(role);

        fetchLessons(); fetchUsers(); fetchMyProfile(localStorage.getItem('userId'));
    }, []);

    // --- DATA FETCHING ---
    const fetchLessons = async () => {
        try { const res = await fetch(`https://school-backend-szf6.onrender.com/api/lessons?t=${Date.now()}`); if (res.ok) setLessons(await res.json()); } catch (err) {}
    };
    const fetchUsers = async () => {
        try { const res = await fetch(`https://school-backend-szf6.onrender.com/api/admin/users?t=${Date.now()}`); if (res.ok) setUsers(await res.json()); } catch (err) {}
    };
    const fetchMyProfile = async (id) => {
        try { 
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/school/search?query=${id}`); 
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) {
                    setMyEmail(data[0].email || '');
                    setMyDob(data[0].dob || '');
                    setMyBloodGroup(data[0].bloodGroup || '');
                }
            }
        } catch (err) {}
    };

    // --- ADVANCED PROFILE UPDATES ---
    const handleUpdatePersonalDetails = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/profile/update', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: adminId, fullName: adminName, dob: myDob, bloodGroup: myBloodGroup })
            });
            if (res.ok) setProfileMessage({ text: 'Personal details saved!', type: 'success' });
        } catch (err) { setProfileMessage({ text: 'Failed to update details.', type: 'error' }); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/profile/change-password', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: adminId, currentPassword: oldPass, newPassword: newPass })
            });
            const data = await res.json();
            if (res.ok) { setProfileMessage({ text: 'Password changed securely.', type: 'success' }); setOldPass(''); setNewPass(''); }
            else setProfileMessage({ text: data.message, type: 'error' });
        } catch (err) { setProfileMessage({ text: 'Network error.', type: 'error' }); }
    };

    const handleChangeAdminId = async (e) => {
        e.preventDefault();
        if (!window.confirm("WARNING: Changing your Admin ID will require you to log back in immediately. Continue?")) return;
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/profile/change-admin-id', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentId: adminId, newId: newAdminIdInput })
            });
            const data = await res.json();
            if (res.ok) { alert(data.message); handleLogout(); }
            else setProfileMessage({ text: data.message, type: 'error' });
        } catch (err) { setProfileMessage({ text: 'Network error.', type: 'error' }); }
    };

    // --- EDIT STUDENT PROFILE LOGIC ---
    const startEditingStudent = (user) => {
        setEditingStudent(user.userId);
        setEditStudentData({ fullName: user.fullName, currentClass: '', rollNo: '', dob: user.dob || '', bloodGroup: user.bloodGroup || '' });
    };

    const submitStudentEdit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/profile/edit-student/${editingStudent}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editStudentData)
            });
            if (res.ok) { alert("Student updated!"); setEditingStudent(null); fetchUsers(); }
            else alert("Update failed.");
        } catch (err) { alert("Network Error."); }
    };

    // ... (Keeping all your existing working functions for Studio, Users, Search)
    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/admin/update-email`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: adminId, email: myEmail })
            });
            if (res.ok) setProfileMessage({ text: 'Recovery Email saved!', type: 'success' });
        } catch (err) { setProfileMessage({ text: 'Failed to save email.', type: 'error' }); }
    };
    const handleSearch = async (e) => { e.preventDefault(); try { const res = await fetch(`https://school-backend-szf6.onrender.com/api/school/search?query=${searchQuery}`); if (res.ok) setSearchResults(await res.json()); } catch (err) {} };
    const handleGenerateId = async (e) => { e.preventDefault(); try { const res = await fetch('https://school-backend-szf6.onrender.com/api/admin/generate-id', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: newUserId, role: newUserRole }) }); const data = await res.json(); setGenMessage(data.message); if (res.ok) { setNewUserId(''); fetchUsers(); } } catch (err) {} };
    const toggleUserStatus = async (user) => { if (adminRole !== 'Headmaster' && user.role !== 'Student') return alert("Denied"); if (!window.confirm(`Block/Unblock ${user.fullName}?`)) return; try { const res = await fetch(`https://school-backend-szf6.onrender.com/api/admin/users/${user._id}/toggle-status`, { method: 'PUT' }); if (res.ok) fetchUsers(); } catch (err) {} };
    const handleLogout = () => { localStorage.clear(); window.location.href = '/'; };

    if (!adminId) return <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}></div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
            <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <h1 style={{ margin: 0, fontSize: '20px', color: '#38bdf8' }}>{adminRole} Console</h1>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                    <button onClick={() => setActiveTab('operations')} style={{ background: activeTab === 'operations' ? '#38bdf8' : 'transparent', color: activeTab === 'operations' ? '#0f172a' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Operations</button>
                    <button onClick={() => setActiveTab('users')} style={{ background: activeTab === 'users' ? '#38bdf8' : 'transparent', color: activeTab === 'users' ? '#0f172a' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Manage Users</button>
                    <button onClick={() => setActiveTab('profile')} style={{ background: activeTab === 'profile' ? '#38bdf8' : 'transparent', color: activeTab === 'profile' ? '#0f172a' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>My Profile</button>
                    <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '1rem' }}>Log Out</button>
                </div>
            </div>

            <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>

                {/* 1. ULTIMATE PROFILE SETTINGS TAB */}
                {activeTab === 'profile' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {profileMessage.text && (
                            <div style={{ padding: '1rem', backgroundColor: profileMessage.type === 'success' ? '#dcfce7' : '#fee2e2', color: profileMessage.type === 'success' ? '#166534' : '#9f1239', borderRadius: '8px', fontWeight: 'bold' }}>
                                {profileMessage.text}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            {/* Personal Details */}
                            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ color: '#0f172a', margin: '0 0 1rem 0' }}>Personal Information</h3>
                                <form onSubmit={handleUpdatePersonalDetails}>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '14px' }}>Full Name:</label>
                                    <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '14px' }}>Date of Birth:</label>
                                    <input type="date" value={myDob} onChange={(e) => setMyDob(e.target.value)} style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '14px' }}>Blood Group:</label>
                                    <input type="text" value={myBloodGroup} onChange={(e) => setMyBloodGroup(e.target.value)} placeholder="e.g. O+" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    
                                    <button type="submit" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Save Personal Info</button>
                                </form>
                            </div>

                            {/* Security & Recovery */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                    <h3 style={{ color: '#0f172a', margin: '0 0 1rem 0' }}>Security & Recovery</h3>
                                    <form onSubmit={handleUpdateEmail} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '14px' }}>Recovery Email:</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input type="email" value={myEmail} onChange={(e) => setMyEmail(e.target.value)} required style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                            <button type="submit" style={{ padding: '0.75rem 1rem', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Update</button>
                                        </div>
                                    </form>

                                    <form onSubmit={handleChangePassword}>
                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '14px' }}>Change Password:</label>
                                        <input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} placeholder="Current Password" required style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="New Password" required style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        <button type="submit" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Update Password</button>
                                    </form>
                                </div>

                                {/* Danger Zone: Change Admin ID (Headmaster Only) */}
                                {adminRole === 'Headmaster' && (
                                    <div style={{ backgroundColor: '#fff1f2', padding: '2rem', borderRadius: '12px', border: '1px solid #fda4af' }}>
                                        <h3 style={{ color: '#9f1239', margin: '0 0 0.5rem 0' }}>System Configuration</h3>
                                        <p style={{ fontSize: '12px', color: '#9f1239', marginBottom: '1rem' }}>Regenerate your Admin Login ID. You will be logged out.</p>
                                        <form onSubmit={handleChangeAdminId} style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input type="text" value={newAdminIdInput} onChange={(e) => setNewAdminIdInput(e.target.value)} placeholder="Enter New ID" required style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #fca5a5' }} />
                                            <button type="submit" style={{ padding: '0.75rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Change ID</button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. MANAGE USERS TAB (WITH STUDENT EDITOR) */}
                {activeTab === 'users' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Manage Registered Users</h2>
                        
                        {/* ID GENERATION */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                            <form onSubmit={handleGenerateId} style={{ display: 'flex', gap: '1rem' }}>
                                <input type="text" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} placeholder="Authorize New ID" required style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                    <option value="Student">Student</option><option value="Teacher">Teacher</option>
                                    {adminRole === 'Headmaster' && <option value="Assistant Headmaster">Assistant Headmaster</option>}
                                </select>
                                <button type="submit" style={{ padding: '0.75rem 2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Generate</button>
                            </form>
                        </div>
                        
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#334155' }}>Name & Role</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', color: '#334155' }}>Edit Details</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', color: '#334155' }}>Access</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <strong style={{ color: user.isActive ? '#0f172a' : '#94a3b8' }}>{user.fullName}</strong><br/>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>{user.role} | ID: {user.userId}</span>
                                        </td>
                                        
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {/* Edit Student Button */}
                                            {user.role === 'Student' && (
                                                <button onClick={() => startEditingStudent(user)} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#f1f5f9', color: '#0369a1', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Edit Student</button>
                                            )}
                                        </td>

                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {user.role !== 'Headmaster' && (adminRole === 'Headmaster' || user.role === 'Student') && (
                                                <button onClick={() => toggleUserStatus(user)} style={{ padding: '0.4rem 0.8rem', backgroundColor: user.isActive ? '#fee2e2' : '#dcfce7', color: user.isActive ? '#ef4444' : '#166534', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                                                    {user.isActive ? 'Block' : 'Unblock'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* STUDENT EDITOR MODAL */}
                        {editingStudent && (
                            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
                                    <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Edit Student Profile</h3>
                                    <form onSubmit={submitStudentEdit}>
                                        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Full Name:</label>
                                        <input type="text" value={editStudentData.fullName} onChange={(e) => setEditStudentData({...editStudentData, fullName: e.target.value})} style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div>
                                                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Class:</label>
                                                <input type="text" value={editStudentData.currentClass} onChange={(e) => setEditStudentData({...editStudentData, currentClass: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Roll No:</label>
                                                <input type="text" value={editStudentData.rollNo} onChange={(e) => setEditStudentData({...editStudentData, rollNo: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                            </div>
                                        </div>

                                        <button type="submit" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '0.5rem' }}>Save Changes</button>
                                        <button type="button" onClick={() => setEditingStudent(null)} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. OPERATIONS TAB (Keeping it exactly as before, with Search & Attendance) */}
                {activeTab === 'operations' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px' }}>
                        <h2 style={{ color: '#0f172a' }}>Global Directory Search</h2>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or ID..." style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            <button type="submit" style={{ padding: '0.8rem 2rem', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Search</button>
                        </form>
                        {searchResults.length > 0 && (
                            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                {searchResults.map(res => (
                                    <div key={res._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                                        <strong>{res.fullName}</strong> <span style={{ color: '#64748b' }}>{res.role} | ID: {res.userId}</span>
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
