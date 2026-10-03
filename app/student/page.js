'use client';
import { useState, useEffect } from 'react';

export default function StudentPortal() {
    // 1. TOP-LEVEL STATES
    const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'records', 'leaves', 'profile'
    
    // Auth Simulation (In a live app, this comes from the login token)
    const studentId = "stu123"; 
    const studentName = "Alex Johnson";
    const studentClass = "Class X"; // This ensures they only see Class X videos!
    
    const [myEmail, setMyEmail] = useState('');
    const [profileMessage, setProfileMessage] = useState('');

    // 2. DATA STATES
    const [lessons, setLessons] = useState([]);
    const [activeCommentLesson, setActiveCommentLesson] = useState(null);
    const [commentText, setCommentText] = useState('');

    // 3. LEAVE APPLICATION STATES
    const [leaveStart, setLeaveStart] = useState('');
    const [leaveEnd, setLeaveEnd] = useState('');
    const [leaveReason, setLeaveReason] = useState('');
    const [leaveMessage, setLeaveMessage] = useState('');

    useEffect(() => { fetchLessons(); }, []);

    // --- DATA FETCHING & SMART FILTERING ---
    const fetchLessons = async () => {
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/lessons?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) {
                const allLessons = await res.json();
                // SMART FILTER: Only show lessons for 'Everyone' or this specific student's class
                const myLessons = allLessons.filter(lesson => 
                    lesson.targetClass === 'Everyone' || lesson.targetClass === studentClass
                );
                setLessons(myLessons);
            }
        } catch (err) { console.error('Failed to fetch lessons'); }
    };

    // --- INTERACTION LOGIC ---
    const handleLike = async (id) => {
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/lessons/${id}/like`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: studentId })
            });
            if (res.ok) fetchLessons();
        } catch (err) { alert('Network error while liking.'); }
    };

    const handleComment = async (id) => {
        if (!commentText) return alert("Please type a question or comment first.");
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/lessons/${id}/comment`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: studentId, fullName: studentName, text: commentText })
            });
            if (res.ok) { setCommentText(''); setActiveCommentLesson(null); fetchLessons(); }
        } catch (err) { alert('Network error while posting comment.'); }
    };

    // --- LEAVE LOGIC ---
    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        setLeaveMessage('Submitting request...');
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/school/leaves`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicantId: studentId, applicantName: studentName, startDate: leaveStart, endDate: leaveEnd, reason: leaveReason })
            });
            if (res.ok) { setLeaveMessage('Leave request sent to the Headmaster!'); setLeaveStart(''); setLeaveEnd(''); setLeaveReason(''); }
            else setLeaveMessage('Failed to submit leave.');
        } catch (err) { setLeaveMessage('Network Error.'); }
    };

    // --- PROFILE LOGIC ---
    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setProfileMessage('Updating...');
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/admin/update-email`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: studentId, email: myEmail })
            });
            if (res.ok) setProfileMessage('Email saved! You can now use the Forgot Password feature.');
            else setProfileMessage('Failed to save email.');
        } catch (err) { setProfileMessage('Network error while saving email.'); }
    };

    const handleLogout = () => { localStorage.removeItem('token'); window.location.href = '/'; };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
            {/* TOP NAVIGATION BAR */}
            <div style={{ backgroundColor: '#10b981', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <h1 style={{ margin: 0, fontSize: '20px' }}>Student Dashboard</h1>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                    <button onClick={() => setActiveTab('feed')} style={{ background: activeTab === 'feed' ? 'white' : 'transparent', color: activeTab === 'feed' ? '#10b981' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>My Classes</button>
                    <button onClick={() => setActiveTab('records')} style={{ background: activeTab === 'records' ? 'white' : 'transparent', color: activeTab === 'records' ? '#10b981' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>My Records</button>
                    <button onClick={() => setActiveTab('leaves')} style={{ background: activeTab === 'leaves' ? 'white' : 'transparent', color: activeTab === 'leaves' ? '#10b981' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Leave App</button>
                    <button onClick={() => setActiveTab('profile')} style={{ background: activeTab === 'profile' ? 'white' : 'transparent', color: activeTab === 'profile' ? '#10b981' : 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Profile</button>
                    <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '1rem' }}>Log Out</button>
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
                
                {/* 1. CLASSROOM FEED TAB */}
                {activeTab === 'feed' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {lessons.length === 0 ? (
                            <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ color: '#0f172a' }}>No Classes Yet</h3>
                                <p style={{ color: '#64748b' }}>Your teachers haven't posted any lessons for {studentClass} yet. Check back soon!</p>
                            </div>
                        ) : null}
                        
                        {lessons.map(lesson => {
                            const isVideo = lesson.fileUrl && lesson.fileUrl.match(/\.(mp4|webm|ogg|mov)$/i);
                            const isAudio = lesson.fileUrl && lesson.fileUrl.match(/\.(mp3|wav|m4a|aac)$/i);

                            return (
                                <div key={lesson._id} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <span style={{ backgroundColor: '#ecfdf5', color: '#047857', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{lesson.targetClass}</span>
                                                {lesson.playlistName && (
                                                    <span style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>📁 {lesson.playlistName}</span>
                                                )}
                                            </div>
                                            <h3 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '20px' }}>{lesson.title}</h3>
                                            <p style={{ margin: '0', fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>{lesson.subject} • Posted by {lesson.teacherName}</p>
                                        </div>
                                    </div>

                                    <p style={{ margin: '0 0 1.5rem 0', fontSize: '15px', whiteSpace: 'pre-wrap', color: '#334155', lineHeight: '1.6' }}>{lesson.content}</p>
                                    
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        {isVideo && (
                                            <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000', marginBottom: '1rem', position: 'relative' }}>
                                                <video controls poster={lesson.thumbnailUrl || ''} style={{ width: '100%', maxHeight: '450px', display: 'block', objectFit: 'contain' }}><source src={lesson.fileUrl} /></video>
                                            </div>
                                        )}

                                        {isAudio && (
                                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {lesson.thumbnailUrl && <img src={lesson.thumbnailUrl} alt="Cover" style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />}
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '14px', color: '#334155' }}>🎧 Audio Lesson</p>
                                                    <audio controls style={{ width: '100%' }}><source src={lesson.fileUrl} /></audio>
                                                </div>
                                            </div>
                                        )}

                                        {!isVideo && !isAudio && lesson.thumbnailUrl && (
                                            <div style={{ marginBottom: '1rem' }}><img src={lesson.thumbnailUrl} alt="Lesson Material" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
                                        )}

                                        {lesson.fileUrl && !isVideo && !isAudio && (
                                            <a href={lesson.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '0.8rem 1.2rem', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 'bold', textDecoration: 'none', borderRadius: '8px' }}>📎 Download Attached File</a>
                                        )}
                                    </div>

                                    {/* SOCIAL TOOLBAR */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                                        <button onClick={() => handleLike(lesson._id)} style={{ background: 'none', border: 'none', color: lesson.likes?.includes(studentId) ? '#ef4444' : '#64748b', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            {lesson.likes?.includes(studentId) ? '❤️ Liked' : '🤍 Like'} 
                                            <span style={{ backgroundColor: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '99px', fontSize: '12px' }}>{lesson.likes?.length || 0}</span>
                                        </button>
                                        <button onClick={() => setActiveCommentLesson(activeCommentLesson === lesson._id ? null : lesson._id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            💬 Ask Question 
                                            <span style={{ backgroundColor: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '99px', fontSize: '12px' }}>{lesson.comments?.length || 0}</span>
                                        </button>
                                    </div>

                                    {activeCommentLesson === lesson._id && (
                                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                                            <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Ask a question or reply..." style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                                            <button onClick={() => handleComment(lesson._id)} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Post</button>
                                        </div>
                                    )}

                                    {lesson.comments && lesson.comments.length > 0 && (
                                        <div style={{ marginTop: '1.5rem', padding: '1.2rem', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Class Discussion</h4>
                                            {lesson.comments.map((comment, index) => (
                                                <div key={index} style={{ marginBottom: index < lesson.comments.length - 1 ? '1rem' : '0', paddingBottom: index < lesson.comments.length - 1 ? '1rem' : '0', borderBottom: index < lesson.comments.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a', marginBottom: '0.2rem' }}>{comment.fullName}</div>
                                                    <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.4' }}>{comment.text}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 2. RECORDS TAB */}
                {activeTab === 'records' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '1.5rem' }}>My Academic Records</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#334155', fontSize: '16px' }}>Attendance</h3>
                                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>Pending Sync</p>
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '0.5rem' }}>Your teacher will update your offline attendance percentage here.</p>
                            </div>
                            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#334155', fontSize: '16px' }}>Fee Status</h3>
                                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9', margin: 0 }}>Clear</p>
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '0.5rem' }}>No pending dues reported by the administration.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. LEAVE APPLICATION TAB */}
                {activeTab === 'leaves' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Request Absence</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Submit a formal leave request to your teachers and headmaster.</p>
                        {leaveMessage && <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '8px', fontWeight: 'bold' }}>{leaveMessage}</div>}
                        
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
                                <textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} rows="3" required placeholder="Provide a brief explanation (e.g. Medical, Family event)..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}></textarea>
                            </div>
                            <button type="submit" style={{ padding: '0.75rem 2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Leave Request</button>
                        </form>
                    </div>
                )}

                {/* 4. PROFILE SETTINGS TAB */}
                {activeTab === 'profile' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Profile Settings</h2>
                        
                        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#475569' }}>Name: <span style={{ color: '#0f172a' }}>{studentName}</span></p>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#475569' }}>Assigned Class: <span style={{ color: '#0f172a' }}>{studentClass}</span></p>
                            <p style={{ margin: '0', fontWeight: 'bold', color: '#475569' }}>Student ID: <span style={{ color: '#0f172a' }}>{studentId}</span></p>
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
