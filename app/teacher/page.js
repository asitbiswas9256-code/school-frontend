'use client';
import { useState } from 'react';

export default function TeacherDashboard() {
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#000080', margin: 0, fontSize: '24px' }}>Teacher Dashboard</h1>
                    <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Log Out
                    </button>
                </div>

                <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '8px', color: '#166534', marginBottom: '2rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>Welcome, Educator</h3>
                    <p style={{ margin: 0, fontSize: '14px' }}>Use this portal to update student attendance, input behavioral ratings, and log confidential reports.</p>
                </div>

                {/* Data Entry Section (We will connect this to the backend next) */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#334155' }}>Student Management</h3>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '1rem' }}>Enter a student's ID below to pull up their profile and update their records.</p>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input type="text" placeholder="Enter Student ID (e.g., stu01)" style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }} />
                        <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#000080', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Search
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
