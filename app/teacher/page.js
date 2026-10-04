'use client';
import { useState, useEffect } from 'react';

export default function TeacherPortal() {
    // 1. TOP-LEVEL STATES
    const [activeTab, setActiveTab] = useState('studio'); // 'studio', 'operations', 'leaves', 'profile'
    
    // Auth Simulation
    const teacherId = "teacher123"; 
    const teacherName = "Prof. Smith";
    const [myEmail, setMyEmail] = useState('');
    const [profileMessage, setProfileMessage] = useState('');

    // 2. DATA STATES
    const [lessons, setLessons] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // 3. STUDIO STATES
    const [subject, setSubject] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetClass, setTargetClass] = useState('Class X');
    const [playlistName, setPlaylistName] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [xhrRequest, setXhrRequest] = useState(null);

    // 4. LEAVE APPLICATION STATES
    const [leaveStart, setLeaveStart] = useState('');
    const [leaveEnd, setLeaveEnd] = useState('');
    const [leaveReason, setLeaveReason] = useState('');
    const [leaveMessage, setLeaveMessage] = useState('');

    // 5. ATTENDANCE STATES
    const [attStudentId, setAttStudentId] = useState('');
    const [attClass, setAttClass] = useState('');
    const [attRoll, setAttRoll] = useState('');
    const [attPercent, setAttPercent] = useState(100);

    useEffect(() => { fetchLessons(); }, []);

    const fetchLessons = async () => {
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/lessons?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) setLessons(await res.json());
        } catch (err) { console.error('Failed to fetch lessons'); }
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

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        setLeaveMessage('Submitting request...');
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/school/leaves`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicantId: teacherId, applicantName: teacherName, startDate: leaveStart, endDate: leaveEnd, reason: leaveReason })
            });
            if (res.ok) { setLeaveMessage('Leave request sent to Headmaster for approval!'); setLeaveStart(''); setLeaveEnd(''); setLeaveReason(''); }
            else setLeaveMessage('Failed to submit leave.');
        } catch (err) { setLeaveMessage('Network Error.'); }
    };

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setProfileMessage('Updating...');
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/teacher/update-email`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: teacherId, email: myEmail })
            });
            if (res.ok) setProfileMessage('Email successfully saved! You can now use the Forgot Password feature.');
            else setProfileMessage('Failed to save email.');
        } catch (err) { setProfileMessage('Network error while saving email.'); }
    };

    // --- STUDIO LOGIC ---
    const handlePublish = (e) => {
        e.preventDefault();
        if (!title || !content) return setMessage('Title and Content required.');
        setIsUploading(true); setMessage(''); setUploadProgress(0);
        
        const formData = new FormData();
        formData.append('teacherId', teacherId); formData.append('teacherName', teacherName);
        formData.append('subject', subject); formData.append('title', title);
        formData.append('content', content); formData.append('targetClass', targetClass);
        formData.append('playlistName', playlistName);
        if (mediaFile) formData.append('mediaFile', mediaFile);
        if (thumbnailFile) formData.append('thumbnailFile', thumbnailFile);

        const xhr = new XMLHttpRequest();
        setXhrRequest(xhr);
        xhr.upload.addEventListener('progress', (e) => { if (e.lengthComputable) setUploadProgress(Math.round((e.loaded * 100) / e.total)); });
        xhr.addEventListener('load', () => {
            if (xhr.status === 201) { setMessage('Class published!'); setTitle(''); setContent(''); setSubject(''); setMediaFile(null); setThumbnailFile(null); fetchLessons(); } 
            else setMessage('Upload failed.');
            setIsUploading(false); setXhrRequest(null);
        });
        xhr.addEventListener('error', () => { setMessage('Network Error.'); setIsUploading(false); });
        xhr.open('POST', 'https://school-backend-szf6.onrender.com/api/lessons/publish');
        xhr.send(formData);
    };

    const cancelUpload = () => { if (xhrRequest) xhrRequest.abort(); };

    const handleDeleteLesson = async (id) => {
        if (!window.confirm('Delete this class permanently?')) return;
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/lessons/${id}`, { method: 'DELETE' });
            if (res.ok) fetchLessons();
        } catch (err) { alert('Failed to delete.'); }
    };

    const handleLogout = () => { localStorage.removeItem('token'); window.location.href = '/'; };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
            {/* TOP NAVIGATION BAR */}
            <div style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <h1 style={{ margin: 0, fontSize: '20px' }}>Teacher Portal</h1>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                    <button onClick={() => setActiveTab('studio')} style={{ background: activeTab === 'studio' ? 'white' : 'transparent', color: activeTab === 'studio' ? '#0ea5e9' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>My Studio</button>
                    <button onClick={() => setActiveTab('operations')} style={{ background: activeTab === 'operations' ? 'white' : 'transparent', color: activeTab === 'operations' ? '#0ea5e9' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Records & Search</button>
                    <button onClick={() => setActiveTab('leaves')} style={{ background: activeTab === 'leaves' ? 'white' : 'transparent', color: activeTab === 'leaves' ? '#0ea5e9' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Leave App</button>
                    <button onClick={() => setActiveTab('profile')} style={{ background: activeTab === 'profile' ? 'white' : 'transparent', color: activeTab === 'profile' ? '#0ea5e9' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Profile</button>
                    <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '1rem' }}>Log Out</button>
                </div>
            </div>

            <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
                
                {/* 1. STUDIO TAB */}
                {activeTab === 'studio' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Publish an Online Class</h2>
                        {message && <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '8px', fontWeight: 'bold' }}>{message}</div>}
                        
                        <form onSubmit={handlePublish} style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Target Class:</label>
                                    <select value={targetClass} onChange={(e) => setTargetClass(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} disabled={isUploading}>
                                        <option value="Class V">Class V</option><option value="Class VI">Class VI</option><option value="Class VII">Class VII</option>
                                        <option value="Class VIII">Class VIII</option><option value="Class IX">Class IX</option><option value="Class X">Class X</option>
                                        <option value="Class XI (Semester 1)">Class XI (Semester 1)</option><option value="Class XI (Semester 2)">Class XI (Semester 2)</option>
                                        <option value="Class XII (Semester 3)">Class XII (Semester 3)</option><option value="Class XII (Semester 4)">Class XII (Semester 4)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Playlist / Unit Name:</label>
                                    <input type="text" value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} placeholder="e.g. Algebra Fundamentals" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} disabled={isUploading} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Subject:</label>
                                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Mathematics" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} disabled={isUploading} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Topic Title:</label>
                                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Linear Equations" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} disabled={isUploading} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Lesson Notes / Instructions:</label>
                                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows="3" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} disabled={isUploading}></textarea>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '13px' }}>1. Main Media (Video/Audio/Doc)</label>
                                    <input type="file" onChange={(e) => setMediaFile(e.target.files[0])} accept="video/*,audio/*,application/pdf" style={{ width: '100%' }} disabled={isUploading} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '13px' }}>2. Video Thumbnail (Optional)</label>
                                    <input type="file" onChange={(e) => setThumbnailFile(e.target.files[0])} accept="image/*" style={{ width: '100%' }} disabled={isUploading} />
                                </div>
                            </div>

                            {isUploading ? (
                                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                                    <div style={{ marginBottom: '0.5rem', fontSize: '14px', fontWeight: 'bold' }}>Uploading... {uploadProgress}%</div>
                                    <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '99px', height: '8px', marginBottom: '1rem' }}><div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#0ea5e9' }}></div></div>
                                    <button type="button" onClick={cancelUpload} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel Upload</button>
                                </div>
                            ) : (
                                <button type="submit" style={{ padding: '0.85rem 2rem', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>Publish to {targetClass}</button>
                            )}
                        </form>

                        <h2 style={{ color: '#0f172a', marginBottom: '1rem', borderTop: '2px solid #f1f5f9', paddingTop: '1.5rem' }}>My Published Classes</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {lessons.filter(l => l.teacherId === teacherId).map(lesson => (
                                <div key={lesson._id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', marginRight: '0.5rem' }}>{lesson.targetClass}</span>
                                        <strong>{lesson.title}</strong> <span style={{ fontSize: '13px', color: '#64748b' }}>- {lesson.subject}</span>
                                    </div>
                                    <button onClick={() => handleDeleteLesson(lesson._id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                </div>
                            ))}
                            {lessons.filter(l => l.teacherId === teacherId).length === 0 && <p style={{ color: '#64748b', fontSize: '14px' }}>You haven't published any classes yet.</p>}
                        </div>
                    </div>
                )}

                {/* 2. OPERATIONS & RECORDS TAB */}
                {activeTab === 'operations' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* GLOBAL SEARCH */}
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ color: '#0f172a', margin: '0 0 1rem 0' }}>Search Directory</h2>
                            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for a student or teacher by name..." style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                <button type="submit" style={{ padding: '0.8rem 2rem', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Search</button>
                            </form>
                            {searchResults.length > 0 && (
                                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    {searchResults.map(res => (
                                        <div key={res._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                                            <strong>{res.fullName}</strong> <span style={{ color: '#64748b' }}>{res.role} | ID: {res.userId}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* OFFLINE ATTENDANCE */}
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>Record Offline Attendance</h2>
                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '1.5rem' }}>Manually submit annual attendance percentages for your students.</p>
                            <form onSubmit={handleAttendanceSubmit}>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                    <input type="text" value={attStudentId} onChange={(e) => setAttStudentId(e.target.value)} placeholder="Student ID (e.g., stu123)" required style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    <input type="text" value={attClass} onChange={(e) => setAttClass(e.target.value)} placeholder="Class" required style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    <input type="text" value={attRoll} onChange={(e) => setAttRoll(e.target.value)} placeholder="Roll No" required style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Percentage: {attPercent}%</label>
                                <input type="range" min="1" max="100" value={attPercent} onChange={(e) => setAttPercent(e.target.value)} style={{ width: '100%', marginBottom: '1.5rem' }} />
                                <button type="submit" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Update Record</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* 3. LEAVE APPLICATION TAB */}
                {activeTab === 'leaves' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Request Time Off</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Submit an official leave application to the Headmaster's office.</p>
                        {leaveMessage && <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '8px', fontWeight: 'bold' }}>{leaveMessage}</div>}
                        
                        <form onSubmit={handleLeaveSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Start Date:</label>
                                    <input type="date" value={leaveStart} onChange={(e) => setLeaveStart(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>End Date:</label>
                                    <input type="date" value={leaveEnd} onChange={(e) => setLeaveEnd(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Reason for Leave:</label>
                                <textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} rows="3" required placeholder="Provide a brief explanation..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}></textarea>
                            </div>
                            <button type="submit" style={{ padding: '0.75rem 2rem', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Leave Request</button>
                        </form>
                    </div>
                )}

                {/* 4. PROFILE SETTINGS TAB */}
                {activeTab === 'profile' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Profile Settings</h2>
                        
                        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#475569' }}>Registered ID: <span style={{ color: '#0f172a' }}>{teacherId}</span></p>
                            <p style={{ margin: '0', fontWeight: 'bold', color: '#475569' }}>System Role: <span style={{ color: '#0f172a' }}>Teacher</span></p>
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
