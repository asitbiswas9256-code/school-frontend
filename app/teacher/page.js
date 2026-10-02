'use client';
import { useState } from 'react';

export default function TeacherDashboard() {
    // State to hold all the data the teacher types in
    const [studentId, setStudentId] = useState('');
    const [currentClass, setCurrentClass] = useState('');
    const [attendance, setAttendance] = useState('');
    const [rating, setRating] = useState('5');
    const [comments, setComments] = useState('');
    const [totalFees, setTotalFees] = useState('');
    const [paidFees, setPaidFees] = useState('');
    const [pendingFees, setPendingFees] = useState('');
    const [message, setMessage] = useState('');

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        setMessage('Saving student data...');
        
        try {
            const token = localStorage.getItem('token');
            
            // This is the backend door we will build in the very next step!
            const res = await fetch('https://school-backend-szf6.onrender.com/api/teacher/update-student', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentUserId: studentId,
                    currentClass,
                    annualAttendancePercentage: Number(attendance),
                    behavioralRating: Number(rating),
                    behavioralComments: comments,
                    totalAnnual: Number(totalFees),
                    amountPaid: Number(paidFees),
                    pendingDues: Number(pendingFees)
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(`Success! Profile for ${studentId} has been securely updated.`);
                // Resets the form for the next student
                setStudentId(''); setAttendance(''); setComments(''); 
                setTotalFees(''); setPaidFees(''); setPendingFees('');
            } else {
                setMessage(`Error: ${data.message}`);
            }
        } catch (err) {
            setMessage('Network error: Could not connect to the database.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#000080', margin: 0, fontSize: '24px' }}>Teacher Dashboard</h1>
                    <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Log Out
                    </button>
                </div>

                {message && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: message.includes('Success') ? '#dcfce7' : '#fee2e2', color: message.includes('Success') ? '#166534' : '#b91c1c', textAlign: 'center', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleUpdateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Section 1: Identification */}
                    <div style={{ padding: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ marginTop: 0, color: '#334155', fontSize: '16px' }}>1. Identify Student</h3>
                        <input type="text" placeholder="Enter Exact Student ID (e.g., stu01)" value={studentId} onChange={e=>setStudentId(e.target.value)} required style={{ width: '100%', padding: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '15px' }} />
                    </div>

                    {/* Section 2: Academics & Behavior */}
                    <div style={{ padding: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ marginTop: 0, color: '#334155', fontSize: '16px' }}>2. Academic & Behavior Logging</h3>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <input type="text" placeholder="Class (e.g., 7A)" value={currentClass} onChange={e=>setCurrentClass(e.target.value)} required style={{ flex: 1, padding: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
                            <input type="number" placeholder="Attendance %" value={attendance} onChange={e=>setAttendance(e.target.value)} required style={{ flex: 1, padding: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
                        </div>
                        <select value={rating} onChange={e=>setRating(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '1rem', fontSize: '15px', color: '#334155' }}>
                            <option value="5">5 - Excellent Behavior</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Needs Improvement</option>
                            <option value="1">1 - Poor Behavior</option>
                        </select>
                        <textarea placeholder="Detailed behavioral comments..." value={comments} onChange={e=>setComments(e.target.value)} rows="3" style={{ width: '100%', padding: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' }} />
                    </div>

                    {/* Section 3: Financials */}
                    <div style={{ padding: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ marginTop: 0, color: '#334155', fontSize: '16px' }}>3. Fee Status (₹)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>Total Annual</label>
                                <input type="number" value={totalFees} onChange={e=>setTotalFees(e.target.value)} required style={{ width: '100%', padding: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '15px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>Amount Paid</label>
                                <input type="number" value={paidFees} onChange={e=>setPaidFees(e.target.value)} required style={{ width: '100%', padding: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '15px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>Pending Dues</label>
                                <input type="number" value={pendingFees} onChange={e=>setPendingFees(e.target.value)} required style={{ width: '100%', padding: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '15px' }} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" style={{ padding: '1rem', backgroundColor: '#000080', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,128,0.2)' }}>
                        Save to Student Record
                    </button>
                </form>

            </div>
        </div>
    );
}
