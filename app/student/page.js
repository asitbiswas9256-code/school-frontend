'use client';
import { useState, useEffect } from 'react';

export default function StudentPortal() {
    const [lessons, setLessons] = useState([]);
    const [activeCommentLesson, setActiveCommentLesson] = useState(null);
    const [commentText, setCommentText] = useState('');

    // Temporary static info (to be replaced by real login data later)
    const studentId = "stu999"; 
    const studentName = "Test Student";

    useEffect(() => { fetchLessons(); }, []);

    const fetchLessons = async () => {
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/lessons?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) setLessons(await res.json());
        } catch (err) { console.error('Failed to fetch lessons'); }
    };

    const handleLike = async (id) => {
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/lessons/${id}/like`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: studentId })
            });
            if (res.ok) fetchLessons();
        } catch (err) { alert('Network error while liking.'); }
    };

    const handleComment = async (id) => {
        if (!commentText) return alert("Please type a comment first.");
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/lessons/${id}/comment`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: studentId, fullName: studentName, text: commentText })
            });
            if (res.ok) { setCommentText(''); setActiveCommentLesson(null); fetchLessons(); }
        } catch (err) { alert('Network error while posting comment.'); }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#0ea5e9', margin: 0 }}>My Classes</h1>
                    <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Log Out</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {lessons.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No classes available right now. Check back later!</p> : null}
                    
                    {lessons.map(lesson => {
                        const isVideo = lesson.fileUrl && lesson.fileUrl.match(/\.(mp4|webm|ogg|mov)$/i);
                        const isAudio = lesson.fileUrl && lesson.fileUrl.match(/\.(mp3|wav|m4a|aac)$/i);

                        return (
                            <div key={lesson._id} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{lesson.targetClass || 'All Classes'}</span>
                                        {lesson.playlistName && (
                                            <span style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>📁 {lesson.playlistName}</span>
                                        )}
                                    </div>
                                    <h3 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '20px' }}>{lesson.title}</h3>
                                    <p style={{ margin: '0', fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>{lesson.subject} • Taught by {lesson.teacherName}</p>
                                </div>

                                <p style={{ margin: '0 0 1.5rem 0', fontSize: '15px', whiteSpace: 'pre-wrap', color: '#334155', lineHeight: '1.6' }}>{lesson.content}</p>
                                
                                <div style={{ marginBottom: '1.5rem' }}>
                                    {isVideo && (
                                        <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000', marginBottom: '1rem' }}>
                                            <video controls poster={lesson.thumbnailUrl || ''} style={{ width: '100%', maxHeight: '450px', display: 'block', objectFit: 'contain' }}>
                                                <source src={lesson.fileUrl} />
                                            </video>
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
                                        <div style={{ marginBottom: '1rem' }}>
                                            <img src={lesson.thumbnailUrl} alt="Class Material" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                        </div>
                                    )}

                                    {lesson.fileUrl && !isVideo && !isAudio && (
                                        <a href={lesson.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '0.8rem 1.2rem', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 'bold', textDecoration: 'none', borderRadius: '8px' }}>📎 Download Class Material</a>
                                    )}
                                </div>

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
                                        <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Ask a question or leave a review..." style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                                        <button onClick={() => handleComment(lesson._id)} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Post</button>
                                    </div>
                                )}

                                {lesson.comments && lesson.comments.length > 0 && (
                                    <div style={{ marginTop: '1.5rem', padding: '1.2rem', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #cbd5e1' }}>
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
            </div>
        </div>
    );
}
