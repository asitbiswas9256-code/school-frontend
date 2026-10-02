'use client';
import { useState, useEffect } from 'react';

export default function TeacherDashboard() {
    const [activeTab, setActiveTab] = useState('classroom');
    const [message, setMessage] = useState('');

    // Classroom States
    const [lessons, setLessons] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(false);
    const [lessonSubject, setLessonSubject] = useState('');
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonContent, setLessonContent] = useState('');
    const [youtubeLink, setYoutubeLink] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);

    // Profile States
    const [designation, setDesignation] = useState('');
    const [subjects, setSubjects] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Notices States
    const [notices, setNotices] = useState([]);
    const [loadingNotices, setLoadingNotices] = useState(false);

    // Leave States
    const [leaveStartDate, setLeaveStartDate] = useState('');
    const [leaveEndDate, setLeaveEndDate] = useState('');
    const [leaveReason, setLeaveReason] = useState('');
    const [myLeaves, setMyLeaves] = useState([]);
    const [loadingLeaves, setLoadingLeaves] = useState(false);
    const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

    const handleLogout = () => { localStorage.removeItem('token'); window.location.href = '/'; };

    // --- API FETCHERS ---
    const fetchLessons = async () => {
        setLoadingLessons(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://school-backend-szf6.onrender.com/api/teacher/lessons', { headers: { 'Authorization': `Bearer ${token}` } });
            let json = [];
            try { json = await res.json(); } catch(e) {}
            if (res.ok) setLessons(json);
        } catch (err) {}
        setLoadingLessons(false);
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

    const fetchMyLeaves = async () => {
        setLoadingLeaves(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://school-backend-szf6.onrender.com/api/leaves/my-leaves', { headers: { 'Authorization': `Bearer ${token}` } });
            let json = [];
            try { json = await res.json(); } catch(e) {}
            if (res.ok) setMyLeaves(json);
        } catch (err) {}
        setLoadingLeaves(false);
    };

    useEffect(() => {
        if (activeTab === 'classroom') fetchLessons();
        if (activeTab === 'notices') fetchNotices();
        if (activeTab === 'leaves') fetchMyLeaves();
        setMessage('');
    }, [activeTab]);

    // --- SUBMISSION HANDLERS ---
    const handlePostLesson = async (e) => {
        e.preventDefault();
        if (!lessonSubject || !lessonTitle || !lessonContent) return setMessage('Subject, Title, and Content required.');
        setIsPublishing(true); setMessage('Publishing lesson...');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://school-backend-szf6.onrender.com/api/teacher/lessons', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ subject: lessonSubject, title: lessonTitle, content: lessonContent, youtubeLink, fileUrl })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Success: Lesson published!');
                setLessonSubject(''); setLessonTitle(''); setLessonContent(''); setYoutubeLink(''); setFileUrl('');
                fetchLessons();
            } else setMessage(`Error: ${data.message || 'Failed to publish'}`);
        } catch (err) { setMessage('Network Error'); }
        setIsPublishing(false);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!designation || !subjects) return setMessage('Please fill all fields.');
        setIsUpdatingProfile(true); setMessage('Updating profile...');
        try {
            const token = localStorage.getItem('token');
            const subjectArray = subjects.split(',').map(s => s.trim());
            const res = await fetch('https://school-backend-szf6.onrender.com/api/teacher/profile', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ designation, subjects: subjectArray })
            });
            const data = await res.json();
            if (res.ok) setMessage('Success: Profile updated in Directory!');
            else setMessage(`Error: ${data.message}`);
        } catch (err) { setMessage('Network Error'); }
        setIsUpdatingProfile(false);
    };

    const handleSubmitLeave = async (e) => {
        e.preventDefault();
        if (!leaveStartDate || !leaveEndDate || !leaveReason) return setMessage('Please fill all fields.');
        setIsSubmittingLeave(true); setMessage('Submitting leave...');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://school-backend-szf6.onrender.com/api/leaves/submit', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ startDate: leaveStartDate, endDate: leaveEndDate, reason: leaveReason })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Success: Leave application submitted.');
                setLeaveStartDate(''); setLeaveEndDate(''); setLeaveReason(''); fetchMyLeaves(); 
            } else setMessage(`Error: ${data.message || 'Failed'}`);
        } catch (err) { setMessage('Network Error'); }
        setIsSubmittingLeave(false);
    };

    const getBadgeStyle = (status) => {
        if (status === 'Pending') return { bg: '#fef08a', text: '#854d0e' }; 
        if (status === 'Reviewed' || status === 'Approved') return { bg: '#dcfce7', text: '#166534' }; 
        if (status === 'Rejected') return { bg: '#fee2e2', text: '#9f1239' };
        return { bg: '#e2e8f0', text: '#334155' }; 
    };

    const renderNavButton = (id, label, color) => {
        const isActive = activeTab === id;
        return (
            <button onClick={() => setActiveTab(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'none', border: 'none', cursor: 'pointer', color: isActive ? color : '#64748b' }}>
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
                <h2 style={{ color: '#0ea5e9', margin: '0', fontSize: '20px' }}>Teacher Portal</h2>
                <button onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Log Out</button>
            </header>

            {/* SCROLLABLE MAIN CONTENT */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '1rem', paddingBottom: '90px' }}>
                
                {message && <div style={{ padding: '0.75rem', marginBottom: '1.5rem', backgroundColor: message.includes('Success') ? '#dcfce7' : '#fee2e2', color: message.includes('Success') ? '#166534' : '#b91c1c', borderRadius: '6px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{message}</div>}

                {/* TAB 1: DIGITAL CLASSROOM */}
                {activeTab === 'classroom' && (
                    <div>
                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 1rem 0', color: '#0284c7', fontSize: '16px' }}>Publish a Lesson</h3>
                            <form onSubmit={handlePostLesson}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px' }}>Subject:</label>
                                        <input type="text" value={lessonSubject} onChange={(e) => setLessonSubject(e.target.value)} placeholder="e.g. Science" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box', backgroundColor: '#f8fafc' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px' }}>Topic Title:</label>
                                        <input type="text" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="e.g. Gravity" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box', backgroundColor: '#f8fafc' }} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px' }}>Lesson Content:</label>
                                    <textarea value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} rows="3" placeholder="Type the main lesson here..." style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box', backgroundColor: '#f8fafc', resize: 'vertical' }} />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px' }}>YouTube Link (Optional):</label>
                                    <input type="text" value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} placeholder="https://youtube.com/..." style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box', backgroundColor: '#f8fafc' }} />
                                </div>
                                <button type="submit" disabled={isPublishing} style={{ width: '100%', padding: '0.85rem', backgroundColor: isPublishing ? '#bae6fd' : '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isPublishing ? 'not-allowed' : 'pointer' }}>
                                    {isPublishing ? 'Publishing...' : 'Post to Digital Classroom'}
                                </button>
                            </form>
                        </div>

                        <h4 style={{ margin: '0 0 1rem 0', color: '#334155' }}>Recent Lessons</h4>
                        {loadingLessons ? <p style={{ textAlign: 'center', color: '#64748b' }}>Loading feed...</p> : lessons.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b' }}>No lessons published.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {lessons.map(lesson => (
                                    <div key={lesson._id} style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #0284c7' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '16px' }}>{lesson.title}</h3>
                                            <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{lesson.subject}</span>
                                        </div>
                                        <p style={{ margin: '0 0 1rem 0', fontSize: '12px', color: '#64748b' }}>Posted by {lesson.teacherName} • {new Date(lesson.createdAt).toLocaleDateString()}</p>
                                        <div style={{ margin: '0 0 1rem 0', fontSize: '14px', color: '#334155', whiteSpace: 'pre-wrap' }}>{lesson.content}</div>
                                        {lesson.youtubeLink && (
                                            <a href={lesson.youtubeLink} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: '#fee2e2', color: '#b91c1c', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>▶ Watch Video</a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: PROFILE SETUP */}
                {activeTab === 'profile' && (
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ padding: '1rem', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#d97706', fontSize: '16px' }}>Teacher Directory Profile</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#b45309' }}>Update your information so students can find you in the Global Directory.</p>
                        </div>
                        <form onSubmit={handleUpdateProfile}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Designation:</label>
                                <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Senior Science Teacher" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box', backgroundColor: '#f8fafc' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Subjects (Comma separated):</label>
                                <input type="text" value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="e.g. Physics, Chemistry, Math" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box', backgroundColor: '#f8fafc' }} />
                            </div>
                            <button type="submit" disabled={isUpdatingProfile} style={{ width: '100%', padding: '0.85rem', backgroundColor: isUpdatingProfile ? '#fcd34d' : '#d97706', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: isUpdatingProfile ? 'not-allowed' : 'pointer' }}>
                                {isUpdatingProfile ? 'Saving...' : 'Update Directory Profile'}
                            </button>
                        </form>
                    </div>
                )}

                {/* TAB 3: NOTICES */}
                {activeTab === 'notices' && (
                    <div>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#334155' }}>Official Notices & Logistics</h4>
                        {loadingNotices ? <p style={{ textAlign: 'center', color: '#64748b' }}>Checking for updates...</p> : notices.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b' }}>No notices at this time.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {notices.map(notice => (
                                    <div key={notice._id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', borderLeft: `4px solid ${notice.type === 'Logistics' ? '#f59e0b' : '#9333ea'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <strong style={{ color: '#0f172a', fontSize: '15px' }}>{notice.title}</strong>
                                            <span style={{ backgroundColor: notice.type === 'Logistics' ? '#fef3c7' : '#f3e8ff', color: notice.type === 'Logistics' ? '#b45309' : '#7e22ce', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{notice.type}</span>
                                        </div>
                                        <p style={{ margin: '0 0 0.75rem 0', fontSize: '12px', color: '#64748b' }}>By {notice.authorRole} • {new Date(notice.createdAt).toLocaleDateString()}</p>
                                        <div style={{ margin: 0, fontSize: '14px', color: '#334155', whiteSpace: 'pre-wrap' }}>{notice.content}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: LEAVE APP */}
                {activeTab === 'leaves' && (
                    <div>
                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f766e', fontSize: '16px' }}>Leave Application</h3>
                            <form onSubmit={handleSubmitLeave} style={{ marginTop: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px' }}>Start Date:</label>
                                        <input type="date" value={leaveStartDate} onChange={(e) => setLeaveStartDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px' }}>End Date:</label>
                                        <input type="date" value={leaveEndDate} onChange={(e) => setLeaveEndDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '13px' }}>Reason:</label>
                                    <textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} rows="2" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box', resize: 'vertical' }} />
                                </div>
                                <button type="submit" disabled={isSubmittingLeave} style={{ width: '100%', padding: '0.85rem', backgroundColor: isSubmittingLeave ? '#5eead4' : '#0f766e', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                                    {isSubmittingLeave ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </form>
                        </div>

                        <h4 style={{ margin: '0 0 1rem 0', color: '#334155' }}>My Leave History</h4>
                        {loadingLeaves ? <p style={{ textAlign: 'center', color: '#64748b' }}>Loading...</p> : myLeaves.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b' }}>No past applications.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {myLeaves.map(leave => {
                                    const badge = getBadgeStyle(leave.status);
                                    return (
                                        <div key={leave._id} style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `4px solid ${badge.bg === '#dcfce7' ? '#166534' : badge.bg === '#fee2e2' ? '#9f1239' : '#eab308'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <strong style={{ color: '#0f172a', fontSize: '14px' }}>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</strong>
                                                <span style={{ backgroundColor: badge.bg, color: badge.text, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{leave.status}</span>
                                            </div>
                                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '13px', color: '#475569' }}>{leave.reason}</p>
                                            {leave.adminFeedback && (
                                                <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', border: '1px dashed #cbd5e1', fontSize: '12px', color: '#334155' }}><strong>Note:</strong> {leave.adminFeedback}</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* FIXED BOTTOM NAVIGATION BAR */}
            <nav style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', position: 'fixed', bottom: 0, left: 0, right: 0, height: '65px', paddingBottom: 'env(safe-area-inset-bottom, 0px)', zIndex: 50 }}>
                {renderNavButton('classroom', 'Classroom', '#0284c7')}
                {renderNavButton('profile', 'Directory', '#d97706')}
                {renderNavButton('notices', 'Notices', '#9333ea')}
                {renderNavButton('leaves', 'Leave', '#0f766e')}
            </nav>
        </div>
    );
}
