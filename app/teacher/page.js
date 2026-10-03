'use client';
import { useState, useEffect } from 'react';

export default function TeacherPortal() {
    const [subject, setSubject] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [message, setMessage] = useState('');
    const [lessons, setLessons] = useState([]);

    // Advanced Upload States
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStats, setUploadStats] = useState('');
    const [xhrRequest, setXhrRequest] = useState(null);

    // Comment States
    const [activeCommentLesson, setActiveCommentLesson] = useState(null);
    const [commentText, setCommentText] = useState('');

    const teacherId = "teacher123"; 
    const teacherName = "Prof. Smith";

    useEffect(() => { fetchLessons(); }, []);

    const fetchLessons = async () => {
        try {
            const res = await fetch('https://school-backend-szf6.onrender.com/api/lessons');
            if (res.ok) setLessons(await res.json());
        } catch (err) { console.error('Failed to fetch lessons'); }
    };

    const handlePublish = (e) => {
        e.preventDefault();
        if (!subject || !title || !content) return setMessage('Subject, Title, and Content are required.');
        
        setIsUploading(true); setMessage(''); setUploadProgress(0); setUploadStats('Preparing upload...');
        
        const formData = new FormData();
        formData.append('teacherId', teacherId);
        formData.append('teacherName', teacherName);
        formData.append('subject', subject);
        formData.append('title', title);
        formData.append('content', content);
        if (mediaFile) formData.append('mediaFile', mediaFile);

        const xhr = new XMLHttpRequest();
        setXhrRequest(xhr);

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded * 100) / event.total);
                const loadedMB = (event.loaded / (1024 * 1024)).toFixed(2);
                let totalMB = (event.total / (1024 * 1024)).toFixed(2);
                let unit = 'MB';

                if (totalMB > 1024) { totalMB = (totalMB / 1024).toFixed(2); unit = 'GB'; }
                setUploadProgress(percent); setUploadStats(`${loadedMB} MB / ${totalMB} ${unit}`);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 201) {
                setMessage('Success! Lesson published.');
                setSubject(''); setTitle(''); setContent(''); setMediaFile(null);
                document.getElementById('file-upload').value = '';
                fetchLessons();
            } else { setMessage('Upload failed. Server responded with an error.'); }
            setIsUploading(false); setXhrRequest(null);
        });

        xhr.addEventListener('error', () => { setMessage('Network Error during upload.'); setIsUploading(false); setXhrRequest(null); });
        xhr.addEventListener('abort', () => { setMessage('Upload canceled by user.'); setIsUploading(false); setXhrRequest(null); setUploadProgress(0); setUploadStats(''); });

        xhr.open('POST', 'https://school-backend-szf6.onrender.com/api/lessons/publish');
        xhr.send(formData);
    };

    const cancelUpload = () => { if (xhrRequest) xhrRequest.abort(); };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this lesson permanently?')) return;
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/lessons/${id}`, { method: 'DELETE' });
            if (res.ok) { setMessage('Lesson deleted.'); fetchLessons(); }
        } catch (err) { setMessage('Failed to delete lesson.'); }
    };

    const handleLike = async (id) => {
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/lessons/${id}/like`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: teacherId })
            });
            if (res.ok) fetchLessons();
        } catch (err) { console.error('Failed to like lesson'); }
    };

    const handleComment = async (id) => {
        if (!commentText) return;
        try {
            const res = await fetch(`https://school-backend-szf6.onrender.com/api/lessons/${id}/comment`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: teacherId, fullName: teacherName, text: commentText })
            });
            if (res.ok) { setCommentText(''); setActiveCommentLesson(null); fetchLessons(); }
        } catch (err) { console.error('Failed to post comment'); }
    };

    const handleShare = (lesson) => {
        const link = lesson.fileUrl || 'No media link available';
        navigator.clipboard.writeText(link);
        alert('Media link copied to clipboard!');
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

                <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Publish an Online Class</h2>
                
                {message && <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: message.includes('Error') || message.includes('failed') || message.includes('canceled') ? '#fee2e2' : '#dcfce7', color: message.includes('Error') || message.includes('failed') || message.includes('canceled') ? '#9f1239' : '#166534', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center' }}>{message}</div>}

                <form onSubmit={handlePublish} style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Subject:</label>
                            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Science" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} disabled={isUploading} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Topic Title:</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Gravity" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} disabled={isUploading} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Lesson Notes / Instructions:</label>
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type the main lesson here..." rows="4" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical' }} disabled={isUploading}></textarea>
                    </div>

                    <div style={{ marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '2px dashed #94a3b8' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#0f172a', fontSize: '18px' }}>Attach Class Media</label>
                        <p style={{ margin: '0 0 1rem 0', fontSize: '13px', color: '#64748b' }}>Select an MP4 video, MP3 audio file, or an image chart. Videos and audio will embed directly in the feed.</p>
                        
                        <input id="file-upload" type="file" onChange={(e) => setMediaFile(e.target.files[0])} accept="image/*,video/*,audio/*" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }} disabled={isUploading} />
                    </div>

                    {isUploading ? (
                        <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>
                                <span>Uploading... {uploadProgress}%</span><span>{uploadStats}</span>
                            </div>
                            <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '99px', height: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                                <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#0ea5e9', transition: 'width 0.2s ease' }}></div>
                            </div>
                            <button type="button" onClick={cancelUpload} style={{ padding: '0.6rem 1.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel Upload</button>
                        </div>
                    ) : (
                        <button type="submit" style={{ padding: '0.85rem 2rem', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', width: '100%' }}>Publish Online Class</button>
                    )}
                </form>

                <h2 style={{ color: '#0f172a', marginBottom: '1rem', borderTop: '2px solid #f1f5f9', paddingTop: '2rem' }}>Classroom Feed</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {lessons.length === 0 ? <p style={{ color: '#64748b' }}>No lessons published yet.</p> : null}
                    
                    {lessons.map(lesson => {
                        const isVideo = lesson.fileUrl && lesson.fileUrl.match(/\.(mp4|webm|ogg|mov)$/i);
                        const isAudio = lesson.fileUrl && lesson.fileUrl.match(/\.(mp3|wav|m4a|aac)$/i);
                        const isImage = lesson.fileUrl && lesson.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);

                        return (
                            <div key={lesson._id} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0ea5e9', fontSize: '20px' }}>{lesson.title}</h3>
                                        <p style={{ margin: '0 0 1rem 0', fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>{lesson.subject} • Posted by {lesson.teacherName}</p>
                                    </div>
                                    {lesson.teacherId === teacherId && (
                                        <button onClick={() => handleDelete(lesson._id)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Delete</button>
                                    )}
                                </div>

                                <p style={{ margin: '0 0 1.5rem 0', fontSize: '15px', whiteSpace: 'pre-wrap', color: '#334155', lineHeight: '1.6' }}>{lesson.content}</p>
                                
                                {/* SMART MEDIA RENDERER */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    
                                    {/* Direct Video Player */}
                                    {isVideo && (
                                        <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000', marginBottom: '1rem' }}>
                                            <video controls style={{ width: '100%', maxHeight: '400px', display: 'block' }}>
                                                <source src={lesson.fileUrl} />
                                                Your browser does not support the video element.
                                            </video>
                                        </div>
                                    )}

                                    {/* Audio Player */}
                                    {isAudio && (
                                        <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '1rem' }}>
                                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '14px', color: '#334155' }}>🎧 Audio Lesson</p>
                                            <audio controls style={{ width: '100%' }}><source src={lesson.fileUrl} />Your browser does not support audio.</audio>
                                        </div>
                                    )}

                                    {/* Chart / Image Display */}
                                    {isImage && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <img src={lesson.fileUrl} alt="Lesson Media" style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                        </div>
                                    )}

                                    {/* Fallback for Unknown Documents */}
                                    {lesson.fileUrl && !isVideo && !isAudio && !isImage && (
                                        <a href={lesson.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '0.8rem 1.2rem', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 'bold', textDecoration: 'none', borderRadius: '8px' }}>📎 Download Attached File</a>
                                    )}
                                </div>

                                {/* SOCIAL TOOLBAR */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                                    <button onClick={() => handleLike(lesson._id)} style={{ background: 'none', border: 'none', color: lesson.likes?.includes(teacherId) ? '#ef4444' : '#64748b', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                                        {lesson.likes?.includes(teacherId) ? '❤️ Liked' : '🤍 Like'} ({lesson.likes?.length || 0})
                                    </button>
                                    <button onClick={() => setActiveCommentLesson(activeCommentLesson === lesson._id ? null : lesson._id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                                        💬 Comment ({lesson.comments?.length || 0})
                                    </button>
                                    <button onClick={() => handleShare(lesson)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>🔗 Share Link</button>
                                </div>

                                {/* COMMENT BOX UI */}
                                {activeCommentLesson === lesson._id && (
                                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                                        <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a review or question..." style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                                        <button onClick={() => handleComment(lesson._id)} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Post</button>
                                    </div>
                                )}

                                {/* RENDER COMMENTS */}
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
