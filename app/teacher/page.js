'use client';
import { useState, useEffect } from 'react';

export default function TeacherPortal() {
    const [subject, setSubject] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [youtubeLink, setYoutubeLink] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lessons, setLessons] = useState([]);

    // We will pull the teacher's info from local storage (or token) in a real app.
    // For now, setting defaults so the upload works immediately.
    const teacherId = "teacher123"; 
    const teacherName = "Prof. Smith";

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/lessons');
            const data = await res.json();
            if (res.ok) setLessons(data);
        } catch (err) { console.error('Failed to fetch lessons'); }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setMediaFile(e.target.files[0]);
        }
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        if (!subject || !title || !content) return setMessage('Subject, Title, and Content are required.');
        
        setIsLoading(true);
        setMessage('Publishing lesson... (This may take a moment if uploading a large file)');

        // Because we are sending a file, we MUST use FormData instead of JSON!
        const formData = new FormData();
        formData.append('teacherId', teacherId);
        formData.append('teacherName', teacherName);
        formData.append('subject', subject);
        formData.append('title', title);
        formData.append('content', content);
        formData.append('youtubeLink', youtubeLink);
        if (mediaFile) {
            formData.append('mediaFile', mediaFile);
        }

        try {
            // Note: We DO NOT set 'Content-Type' when sending FormData. The browser sets it automatically with the boundary.
            const res = await fetch('https://school-backend-szf6.onrender.com/api/lessons/publish', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage('Success! Lesson published with media.');
                setSubject(''); setTitle(''); setContent(''); setYoutubeLink(''); setMediaFile(null);
                document.getElementById('file-upload').value = ''; // Clear file input
                fetchLessons();
            } else {
                setMessage(`Error: ${data.message}`);
            }
        } catch (err) {
            setMessage('Network Error while uploading.');
        }
        setIsLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#0ea5e9', margin: 0 }}>Teacher Portal</h1>
                    <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Log Out</button>
                </div>

                <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Publish a Lesson</h2>
                
                {message && <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: message.includes('Error') ? '#fee2e2' : '#dcfce7', color: message.includes('Error') ? '#9f1239' : '#166534', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center' }}>{message}</div>}

                <form onSubmit={handlePublish} style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Subject:</label>
                            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Science" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Topic Title:</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Gravity" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Lesson Content:</label>
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type the main lesson here..." rows="5" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical' }}></textarea>
                    </div>

                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px dashed #94a3b8' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Upload Media (Image, Audio, or Video):</label>
                        <input id="file-upload" type="file" onChange={handleFileChange} accept="image/*,video/*,audio/*" style={{ width: '100%', padding: '0.5rem', backgroundColor: 'white', borderRadius: '6px' }} />
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '12px', color: '#64748b' }}>Or, provide a YouTube link below instead:</p>
                        <input type="text" value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} placeholder="https://youtube.com/..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginTop: '0.5rem' }} />
                    </div>

                    <button type="submit" disabled={isLoading} style={{ padding: '0.85rem 2rem', backgroundColor: isLoading ? '#94a3b8' : '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                        {isLoading ? 'Uploading & Publishing...' : 'Publish Lesson'}
                    </button>
                </form>

                <h2 style={{ color: '#0f172a', marginBottom: '1rem', borderTop: '2px solid #f1f5f9', paddingTop: '2rem' }}>Recent Lessons</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {lessons.length === 0 ? <p style={{ color: '#64748b' }}>No lessons published yet.</p> : null}
                    {lessons.map(lesson => (
                        <div key={lesson._id} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0ea5e9' }}>{lesson.title} <span style={{ fontSize: '14px', color: '#64748b' }}>({lesson.subject})</span></h3>
                            <p style={{ margin: '0 0 1rem 0', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{lesson.content}</p>
                            
                            {lesson.youtubeLink && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <a href={lesson.youtubeLink} target="_blank" rel="noreferrer" style={{ color: '#ef4444', fontWeight: 'bold', textDecoration: 'none' }}>▶️ Watch on YouTube</a>
                                </div>
                            )}

                            {lesson.fileUrl && (
                                <div style={{ padding: '1rem', backgroundColor: '#e2e8f0', borderRadius: '8px', display: 'inline-block' }}>
                                    <a href={lesson.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#0f172a', fontWeight: 'bold', textDecoration: 'none' }}>📎 View Attached Media File</a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
